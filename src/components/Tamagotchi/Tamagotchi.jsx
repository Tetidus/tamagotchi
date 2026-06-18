import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import './Tamagotchi.css';
import characters from '../../assets/characters/index.jsx';
import poopImg from '../../assets/poop.png';
import room from '../../assets/room.gif';
import coins from '../../assets/coin.png';
import InteractionPanel from '../InteractionPanel/InteractionPanel';
import { ref, set, get, update, push, remove, onValue } from 'firebase/database';
import { database } from '../../firebase';
import AuthContext from '../../authContext';
import { doSignOut } from '../../auth';
import { Link, useNavigate } from 'react-router-dom';
import { PRODUCTS } from '../../gameData';

// ── Timing constants ──────────────────────────────────────────────────────────
const HUNGER_TICK  = 300000;   // 5 min → fame piena in ~1.7h
const HUNGER_GAIN  = 5;
const HAPPY_TICK   = 480000;   // 8 min
const HAPPY_LOSS   = 5;
const HEALTH_TICK  = 1200000;  // 20 min
const HEALTH_LOSS  = 2;
const AGE_TICK     = 60000;
const COIN_TICK    = 300000;   // 5 min
const ENERGY_TICK  = 600000;   // 10 min
const ENERGY_GAIN  = 5;
const SICK_TICKS   = 8;
const MAX_OFFLINE  = 8 * 3600;
const CHAR_COUNT   = 11;

const SLEEP_HOUR = 21;
const SLEEP_MIN  = 30;
const WAKE_HOUR  = 10;
const WAKE_MIN   = 30;

const isInSleepWindow = () => {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const afterSleep = h > SLEEP_HOUR || (h === SLEEP_HOUR && m >= SLEEP_MIN);
  const beforeWake = h < WAKE_HOUR  || (h === WAKE_HOUR  && m <  WAKE_MIN);
  return afterSleep || beforeWake;
};

// ── Evoluzione ────────────────────────────────────────────────────────────────
const getEvolution = (ageMinutes, careScore) => {
  if (ageMinutes < 2)  return { emoji: '🥚', label: 'Uovo' };
  if (ageMinutes < 10) return { emoji: '🐣', label: 'Cucciolo' };

  const tier = careScore >= 65 ? 'good' : careScore >= 35 ? 'ok' : 'bad';

  if (ageMinutes < 60) {
    if (tier === 'good') return { emoji: '🌸', label: 'Bambino felice' };
    if (tier === 'ok')   return { emoji: '🌿', label: 'Bambino' };
                         return { emoji: '😟', label: 'Bambino triste' };
  }
  if (ageMinutes < 300) {
    if (tier === 'good') return { emoji: '⭐', label: 'Adolescente brillante' };
    if (tier === 'ok')   return { emoji: '🌙', label: 'Adolescente' };
                         return { emoji: '🌑', label: 'Adolescente cupo' };
  }
  if (tier === 'good') return { emoji: '✨', label: 'Adulto magnifico' };
  if (tier === 'ok')   return { emoji: '😊', label: 'Adulto' };
                       return { emoji: '😈', label: 'Adulto corrotto' };
};

// ── Degrado offline ───────────────────────────────────────────────────────────
const calcOffline = (saved) => {
  if (!saved?.lastSeen) return saved;

  const sec = Math.min((Date.now() - saved.lastSeen) / 1000, MAX_OFFLINE);

  const hungerGain   = Math.floor(sec / (HUNGER_TICK / 1000) * HUNGER_GAIN);
  const newHunger    = Math.min((saved.hunger ?? 0) + hungerGain, 100);

  const avgHunger    = ((saved.hunger ?? 0) + newHunger) / 2;
  const happyLoss    = avgHunger >= 70
    ? Math.floor(sec / (HAPPY_TICK / 1000) * HAPPY_LOSS) : 0;
  const newHappiness = Math.max((saved.happiness ?? 100) - happyLoss, 0);

  const newIsSick    = (saved.isSick ?? false)
    || (newHunger === 100 && sec >= SICK_TICKS * (HUNGER_TICK / 1000));

  const healthLoss   = newIsSick
    ? Math.floor(sec / (HEALTH_TICK / 1000) * HEALTH_LOSS) : 0;
  const newHealth    = Math.max((saved.health ?? 100) - healthLoss, 0);

  const ageGain      = Math.floor(sec / 60);
  const coinGain     = Math.floor(sec / (COIN_TICK / 1000));
  const carePenalty  = newHunger === 100 ? Math.min(Math.floor(sec / 120), 25) : 0;

  return {
    ...saved,
    hunger:    newHunger,
    happiness: newHappiness,
    health:    newHealth,
    isSick:    newIsSick,
    ageMinutes: (saved.ageMinutes ?? 0) + ageGain,
    coin:      (saved.coin ?? 50) + coinGain,
    careScore: Math.max(Math.min((saved.careScore ?? 50) - carePenalty, 100), 0),
  };
};

// ── Component ─────────────────────────────────────────────────────────────────
const Tamagotchi = () => {
  const [position,       setPosition      ] = useState(0);
  const [poops,          setPoops         ] = useState([]);
  const [happiness,      setHappiness     ] = useState(100);
  const [hunger,         setHunger        ] = useState(0);
  const [energy,         setEnergy        ] = useState(100);
  const [coin,           setCoin          ] = useState(50);
  const [weight,         setWeight        ] = useState(50);
  const [health,         setHealth        ] = useState(100);
  const [isSick,         setIsSick        ] = useState(false);
  const [careScore,      setCareScore     ] = useState(50);
  const [ageMinutes,     setAgeMinutes    ] = useState(0);
  const [medicineCount,  setMedicineCount ] = useState(0);
  const [activeRoom,     setActiveRoom    ] = useState(null);
  const [activeAccessory,setActiveAccessory] = useState(null);
  const [isDataLoaded,   setIsDataLoaded  ] = useState(false);
  const [isSleeping,     setIsSleeping    ] = useState(isInSleepWindow);
  const [isDead,         setIsDead        ] = useState(false);
  const [characterIndex, setCharacterIndex] = useState(0);
  const [isEating,       setIsEating      ] = useState(false);
  const [isEggBouncing,  setIsEggBouncing ] = useState(false);
  const [isShowingHearts,setIsShowingHearts] = useState(false);
  const [tick,           setTick          ] = useState(0); // re-render ogni minuto per bottone luce

  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // Refs per interval e save-on-unmount
  const hungerRef      = useRef(0);
  const isSickRef      = useRef(false);
  const isSleepingRef  = useRef(isInSleepWindow());
  const isDeadRef      = useRef(false);
  const prevEvolutionRef = useRef(null);
  const eatTimerRef    = useRef(null);
  const ageMinutesRef  = useRef(0);
  const tapCountRef    = useRef(0);
  const tapWindowRef   = useRef(null);
  const heartsTimerRef = useRef(null);
  const eggBounceRef   = useRef(null);
  const hungerTicks    = useRef(0);
  const latestStatus   = useRef({});

  useEffect(() => { hungerRef.current     = hunger;     }, [hunger]);
  useEffect(() => { isSickRef.current     = isSick;     }, [isSick]);
  useEffect(() => { isSleepingRef.current = isSleeping; }, [isSleeping]);
  useEffect(() => { isDeadRef.current     = isDead;     }, [isDead]);
  useEffect(() => { ageMinutesRef.current = ageMinutes; }, [ageMinutes]);

  const evolution      = useMemo(() => getEvolution(ageMinutes, careScore), [ageMinutes, careScore]);
  const roomData       = useMemo(() => PRODUCTS.find(p => p.id === activeRoom),  [activeRoom]);
  const accessoryData  = useMemo(() => PRODUCTS.find(p => p.id === activeAccessory), [activeAccessory]);

  // Mantieni snapshot aggiornato per save-on-unmount
  useEffect(() => {
    latestStatus.current = {
      happiness, hunger, energy, coin, weight, health,
      isSick, careScore, ageMinutes, medicineCount,
      activeRoom, activeAccessory, isDead, characterIndex, isSleeping,
    };
  }, [happiness, hunger, energy, coin, weight, health,
      isSick, careScore, ageMinutes, medicineCount, activeRoom, activeAccessory, isDead, characterIndex, isSleeping]);

  // ── Cambio evoluzione → personaggio casuale ──
  useEffect(() => {
    if (prevEvolutionRef.current === evolution.label) return;
    if (prevEvolutionRef.current !== null && evolution.label !== 'Uovo') {
      setCharacterIndex(Math.floor(Math.random() * CHAR_COUNT));
    }
    prevEvolutionRef.current = evolution.label;
  }, [evolution.label]);

  // ── Saltello casuale uovo ──
  useEffect(() => {
    if (evolution.label !== 'Uovo') return;
    const schedule = () => {
      eggBounceRef.current = setTimeout(() => {
        setIsEggBouncing(true);
        setTimeout(() => setIsEggBouncing(false), 650);
        schedule();
      }, 2000 + Math.random() * 4000);
    };
    schedule();
    return () => clearTimeout(eggBounceRef.current);
  }, [evolution.label]);

  // ── Cleanup timer ──
  useEffect(() => () => {
    clearTimeout(eatTimerRef.current);
    clearTimeout(heartsTimerRef.current);
    clearTimeout(tapWindowRef.current);
    clearTimeout(eggBounceRef.current);
  }, []);

  // ── Caricamento dati ──
  useEffect(() => {
    const statusRef    = ref(database, `users/${currentUser.uid}/status`);
    const poopsRef     = ref(database, `users/${currentUser.uid}/poops`);
    const inventoryRef = ref(database, `users/${currentUser.uid}/inventory`);

    Promise.all([get(statusRef), get(inventoryRef)]).then(([sSnap, iSnap]) => {
      const raw = sSnap.val();
      const inv = iSnap.val() || { medicines: 0 };
      const data = raw ? calcOffline(raw) : null;

      if (data) {
        setHappiness     (data.happiness      ?? 100);
        setHunger        (data.hunger         ?? 0);
        setEnergy        (data.energy         ?? 100);
        setCoin          (data.coin           ?? 50);
        setWeight        (data.weight         ?? 50);
        setHealth        (data.health         ?? 100);
        setIsSick        (data.isSick         ?? false);
        setCareScore     (data.careScore      ?? 50);
        setAgeMinutes    (data.ageMinutes     ?? 0);
        setActiveRoom    (data.activeRoom     ?? null);
        setActiveAccessory(data.activeAccessory ?? null);
        const dead = data.isDead ?? (data.health <= 0);
        setIsDead(dead);
        isDeadRef.current = dead;
        setCharacterIndex(data.characterIndex ?? Math.floor(Math.random() * CHAR_COUNT));
        // Ripristina stato sonno: se siamo nell'orario notturno usa il valore salvato, altrimenti sveglio
        const sleeping = isInSleepWindow() ? (data.isSleeping ?? true) : false;
        setIsSleeping(sleeping);
        isSleepingRef.current = sleeping;
      }
      setMedicineCount(inv.medicines ?? 0);
      setIsDataLoaded(true);
    }).catch(() => setIsDataLoaded(true));

    const poopsUnsub = onValue(poopsRef, snap => {
      const d = snap.val();
      setPoops(d ? Object.entries(d).map(([k, v]) => ({ id: k, ...v })) : []);
    });

    const moveInt = setInterval(() => {
      if (isSleepingRef.current || isDeadRef.current || ageMinutesRef.current < 2) return;
      setPosition(p => Math.max(Math.min(p + (Math.random() < .5 ? -20 : 20), 100), -100));
    }, 3000);

    return () => { clearInterval(moveInt); poopsUnsub(); };
  }, [currentUser.uid]);

  // ── Save-on-unmount ──
  useEffect(() => {
    return () => {
      if (!currentUser?.uid) return;
      set(ref(database, `users/${currentUser.uid}/status`), {
        ...latestStatus.current,
        lastSeen: Date.now(),
      }).catch(() => {});
    };
  }, [currentUser.uid]);

  // ── Tick ogni minuto (aggiorna bottone luce) ──
  useEffect(() => {
    const tick = setInterval(() => setTick(n => n + 1), 60000);
    return () => clearInterval(tick);
  }, []);

  // ── Salvataggio dati (ad ogni cambio di stato) ──
  useEffect(() => {
    if (!isDataLoaded || !currentUser?.uid) return;
    set(ref(database, `users/${currentUser.uid}/status`), {
      happiness, hunger, energy, coin, weight, health,
      isSick, careScore, ageMinutes, medicineCount,
      activeRoom, activeAccessory, isDead, characterIndex, isSleeping,
      lastSeen: Date.now(),
    }).catch(err => console.error('[SAVE] errore:', err));
  }, [happiness, hunger, energy, coin, weight, health,
      isSick, careScore, ageMinutes, medicineCount,
      activeRoom, activeAccessory, isDead, characterIndex, isSleeping, currentUser, isDataLoaded]);

  // ── Interval di gioco (creati una volta dopo il caricamento) ──
  useEffect(() => {
    if (!isDataLoaded) return;

    const hungerInt = setInterval(() => {
      if (isSleepingRef.current || isDeadRef.current) return;
      setHunger(prev => {
        const next = Math.min(prev + HUNGER_GAIN, 100);
        if (next === 100) {
          hungerTicks.current += 1;
          if (hungerTicks.current >= SICK_TICKS && !isSickRef.current) {
            setIsSick(true);
            setCareScore(c => Math.max(c - 10, 0));
          }
        } else {
          hungerTicks.current = 0;
        }
        return next;
      });
    }, HUNGER_TICK);

    const happyInt = setInterval(() => {
      if (isSleepingRef.current || isDeadRef.current) return;
      if (hungerRef.current >= 70) {
        setHappiness(p => Math.max(p - HAPPY_LOSS, 0));
        if (hungerRef.current === 100) setCareScore(c => Math.max(c - 2, 0));
      }
    }, HAPPY_TICK);

    const healthInt = setInterval(() => {
      if (isDeadRef.current) return;
      if (isSickRef.current) {
        setHealth(p => {
          const next = Math.max(p - HEALTH_LOSS, 0);
          if (next <= 0 && !isDeadRef.current) {
            isDeadRef.current = true;
            setIsDead(true);
          }
          return next;
        });
      }
    }, HEALTH_TICK);

    const ageInt    = setInterval(() => setAgeMinutes(p => p + 1), AGE_TICK);
    const coinInt   = setInterval(() => setCoin(p => p + 1), COIN_TICK);
    const energyInt = setInterval(() => {
      if (isSleepingRef.current || isDeadRef.current) return;
      if (hungerRef.current < 50) setEnergy(p => Math.min(p + ENERGY_GAIN, 100));
    }, ENERGY_TICK);

    return () => {
      clearInterval(hungerInt);
      clearInterval(happyInt);
      clearInterval(healthInt);
      clearInterval(ageInt);
      clearInterval(coinInt);
      clearInterval(energyInt);
    };
  }, [isDataLoaded]);

  // ── Interval cacca ──
  useEffect(() => {
    if (poops.length >= 5) return;
    const t = setInterval(() => {
      if (poops.length < 5) {
        const r = push(ref(database, `users/${currentUser.uid}/poops`));
        set(r, { id: r.key, position: Math.random() * 200 - 100 });
      }
    }, 30000);
    return () => clearInterval(t);
  }, [poops.length, currentUser.uid]);

  // ── Azioni ──
  const feedTamagotchi = () => {
    if (isSleeping || isDead) return;
    setHunger(p => Math.max(p - 10, 0));
    setWeight(p => Math.min(p + 3, 100));
    setCareScore(p => Math.min(p + (hunger >= 80 ? 5 : 2), 100));
    hungerTicks.current = 0;
    setIsEating(true);
    clearTimeout(eatTimerRef.current);
    eatTimerRef.current = setTimeout(() => setIsEating(false), 700);
  };

  const useMedicine = () => {
    if (medicineCount <= 0) return;
    const newCount = medicineCount - 1;
    setIsSick(false); isSickRef.current = false;
    setHealth(p => Math.min(p + 30, 100));
    setMedicineCount(newCount);
    hungerTicks.current = 0;
    update(ref(database, `users/${currentUser.uid}/inventory`), { medicines: newCount }).catch(() => {});
  };

  const handleCharacterTap = () => {
    if (isSleeping || isDead || evolution.label === 'Uovo') return;
    tapCountRef.current += 1;
    clearTimeout(tapWindowRef.current);
    tapWindowRef.current = setTimeout(() => { tapCountRef.current = 0; }, 2000);
    if (tapCountRef.current >= 3) {
      tapCountRef.current = 0;
      clearTimeout(heartsTimerRef.current);
      setIsShowingHearts(true);
      setHappiness(p => Math.min(p + 5, 100));
      setCareScore(p => Math.min(p + 1, 100));
      heartsTimerRef.current = setTimeout(() => setIsShowingHearts(false), 1500);
    }
  };

  const handleReset = async () => {
    const newCharIdx = Math.floor(Math.random() * CHAR_COUNT);
    const defaults = {
      happiness: 100, hunger: 0, energy: 100, coin: 50, weight: 50, health: 100,
      isSick: false, careScore: 50, ageMinutes: 0, medicineCount: 0,
      activeRoom: null, activeAccessory: null, isDead: false,
      characterIndex: newCharIdx, lastSeen: Date.now(),
    };
    await set(ref(database, `users/${currentUser.uid}/status`), defaults).catch(() => {});
    setHappiness(100); setHunger(0); setEnergy(100); setCoin(50); setWeight(50);
    setHealth(100); setIsSick(false); setCareScore(50); setAgeMinutes(0);
    setMedicineCount(0); setActiveRoom(null); setActiveAccessory(null);
    setIsDead(false); setIsSleeping(false); setCharacterIndex(newCharIdx);
    hungerRef.current = 0; isSickRef.current = false;
    isSleepingRef.current = false; isDeadRef.current = false;
    hungerTicks.current = 0; prevEvolutionRef.current = 'Uovo';
  };

  const removePoop = (id) => {
    remove(ref(database, `users/${currentUser.uid}/poops/${id}`))
      .then(() => setPoops(ps => ps.filter(p => p.id !== id)))
      .catch(err => console.error('removePoop:', err));
  };

  // Background stanza attiva
  const petAreaStyle = roomData
    ? { background: roomData.bg }
    : {};

  return (
    <div className="bodyFlex">
      <div className="container">
        <h1 className="text-2xl title">Tamagotchi</h1>

        {isDead && (
          <div className="death-screen">
            <div className="death-ghost">👻</div>
            <p className="death-msg">Il tuo Tamagotchi<br />se ne è andato...</p>
            <button className="eightbit-btn eightbit-btn--red" style={{ marginTop: 20 }} onClick={handleReset}>
              Ricomincia
            </button>
          </div>
        )}

        {!isDead && (<>

        <div className="coin-container">
          <Link to="/shop" className="eightbit-btn eightbit-btn--black">SHOP</Link>
          <div className="flex flex-row items-center">
            <p>{coin}</p>
            <img src={coins} alt="coin" className="coin" />
          </div>
        </div>

        {/* Area pet */}
        <div className="pet-area" style={petAreaStyle}>
          {!roomData && <img src={room} className="room" alt="" />}

          <span className="evo-corner-badge">{evolution.emoji}</span>

          {isSick && !isSleeping && (
            <>
              <span className="sick-skull" style={{ left: '18%', animationDelay: '0s' }}>💀</span>
              <span className="sick-skull" style={{ left: '62%', animationDelay: '0.5s' }}>💀</span>
            </>
          )}

          {/* Bottone luce */}
          {!isSleeping && isInSleepWindow() && (
            <button className="light-btn" title="Spegni la luce" onClick={() => { setIsSleeping(true); isSleepingRef.current = true; }}>🌙</button>
          )}
          {isSleeping && (
            <button className="light-btn" title="Accendi la luce" onClick={() => { setIsSleeping(false); isSleepingRef.current = false; setEnergy(100); hungerTicks.current = 0; }}>☀️</button>
          )}

          {isSleeping && (
            <div className="sleep-overlay">
              <span className="sleep-z" style={{ animationDelay: '0s' }}>z</span>
              <span className="sleep-z" style={{ animationDelay: '0.7s' }}>Z</span>
              <span className="sleep-z" style={{ animationDelay: '1.4s' }}>Z</span>
            </div>
          )}

          {/* Wrapper per accessorio + personaggio */}
          <div
            className="character-wrapper"
            style={{ transform: `translateX(${position}px)` }}
            onClick={handleCharacterTap}
          >
            {evolution.label === 'Uovo' ? (
              <span className={`egg-display${isEggBouncing ? ' eating' : ''}`}>🥚</span>
            ) : (
              <>
                <div className={isEating ? 'eating' : ''}>
                  {accessoryData && (
                    <span className="accessory-emoji">{accessoryData.emoji}</span>
                  )}
                  <img
                    src={characters[`character${characterIndex}`]}
                    alt="Tamagotchi"
                    className="character"
                    style={{ filter: isSick ? 'grayscale(70%) brightness(0.7)' : 'none' }}
                  />
                </div>
                {isShowingHearts && (
                  <div className="hearts-overlay">
                    <span className="heart" style={{ left: '5%',  animationDelay: '0s' }}>❤️</span>
                    <span className="heart" style={{ left: '40%', animationDelay: '0.18s' }}>💕</span>
                    <span className="heart" style={{ left: '72%', animationDelay: '0.36s' }}>❤️</span>
                  </div>
                )}
              </>
            )}
          </div>

          {poops.map(poop => (
            <img
              key={poop.id} src={poopImg} alt="Poop" className="poop"
              style={{ position: 'absolute', bottom: 4, transform: `translateX(${poop.position}px)` }}
              onClick={() => removePoop(poop.id)}
            />
          ))}
        </div>

        <hr />

        {/* Statistiche */}
        <div className="stats-dots-grid">
          <StatDots icon="🍖" value={100 - hunger} />
          <StatDots icon="💖" value={happiness} />
          <StatDots icon="⚡" value={energy} />
          <StatDots icon="💊" value={health} />
        </div>

        <div className="pet-meta">
          <span>Età: {ageMinutes}m</span>
          <span>Cura: {careScore}%</span>
        </div>

        <InteractionPanel
          onFeed={feedTamagotchi}
          onPlay={() => navigate('/games')}
          isSleeping={isSleeping}
        />

        {medicineCount > 0 && (
          <button
            className="eightbit-btn medicine-use-btn"
            onClick={useMedicine}
            style={{ opacity: isSick ? 1 : 0.5 }}
          >
            💊 Usa medicina ({medicineCount})
          </button>
        )}

        <br /><br />
        <button onClick={() => doSignOut().then(() => navigate('/login'))}>Sign Out</button>

        {/* ── DEV TOOLS ── */}
        {process.env.NODE_ENV === 'development' && (
          <div className="dev-panel">
            <p className="dev-title">🛠 DEV</p>
            <div className="dev-grid">
              <button onClick={() => setHunger(100)}>Affama</button>
              <button onClick={() => { setIsSick(true); isSickRef.current = true; }}>Ammala</button>
              <button onClick={() => setHealth(p => Math.max(p - 20, 0))}>-20 salute</button>
              <button onClick={() => { setHealth(0); isDeadRef.current = true; setIsDead(true); }}>Uccidi</button>
              <button onClick={() => { setIsSleeping(true); isSleepingRef.current = true; }}>Dormi</button>
              <button onClick={() => { setIsSleeping(false); isSleepingRef.current = false; setEnergy(100); hungerTicks.current = 0; }}>Sveglia</button>
              <button onClick={() => setCoin(p => p + 100)}>+100 coin</button>
              <button onClick={() => setMedicineCount(p => p + 1)}>+medicina</button>
            </div>
          </div>
        )}

      </>)}
      </div>
    </div>
  );
};

// ── StatDots ──────────────────────────────────────────────────────────────────
const StatDots = ({ icon, value }) => {
  const filled = Math.round((value / 100) * 5);
  return (
    <div className="stat-dot-row">
      <span className="stat-dot-icon">{icon}</span>
      <div className="stat-dots">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={`stat-dot${i < filled ? '' : ' empty'}`}>⬤</span>
        ))}
      </div>
    </div>
  );
};

export default Tamagotchi;
