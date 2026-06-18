import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ref, get, update } from 'firebase/database';
import { database } from '../firebase';
import AuthContext from '../authContext';
import coins from '../assets/coin.png';
import Reflexes  from '../games/Reflexes';
import SimonSays from '../games/SimonSays';
import DodgeGame from '../games/DodgeGame';
import './Games.css';

const COOLDOWN_MS = 10 * 60 * 1000; // 10 minuti

const GAMES = [
  { id: 'reflexes', name: 'Riflessi',   emoji: '🎯', desc: 'Tappa il cerchio più veloce che puoi!' },
  { id: 'simon',    name: 'Simon Says', emoji: '🧠', desc: 'Ripeti la sequenza di colori!' },
  { id: 'dodge',    name: 'Schiva!',    emoji: '🏃', desc: 'Schiva gli ostacoli per 30 secondi!' },
];

const msToMin = (ms) => Math.ceil(ms / 60000);

export default function Games() {
  const [activeGame,  setActiveGame ] = useState(null);
  const [coin,        setCoin       ] = useState(0);
  const [cooldowns,   setCooldowns  ] = useState({});
  const [loading,     setLoading    ] = useState(true);

  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const statusRef   = ref(database, `users/${currentUser.uid}/status`);
    const cooldownRef = ref(database, `users/${currentUser.uid}/cooldowns`);

    Promise.all([get(statusRef), get(cooldownRef)]).then(([sSnap, cSnap]) => {
      setCoin(sSnap.val()?.coin ?? 0);
      setCooldowns(cSnap.val() || {});
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [currentUser.uid]);

  const handleComplete = useCallback(async (gameId, earned) => {
    const now         = Date.now();
    const statusRef   = ref(database, `users/${currentUser.uid}/status`);
    const cooldownRef = ref(database, `users/${currentUser.uid}/cooldowns`);

    const snap       = await get(statusRef);
    const currentCoin = snap.val()?.coin ?? 0;
    const newCoin    = currentCoin + earned;

    await Promise.all([
      update(statusRef,   { coin: newCoin }),
      update(cooldownRef, { [gameId]: now }),
    ]);

    setCoin(newCoin);
    setCooldowns(prev => ({ ...prev, [gameId]: now }));
    setActiveGame(null);
  }, [currentUser.uid]);

  const isOnCooldown     = (id) => {
    const last = cooldowns[id];
    return last && (Date.now() - last) < COOLDOWN_MS;
  };

  const remainingMin = (id) => {
    const last = cooldowns[id];
    if (!last) return 0;
    return msToMin(COOLDOWN_MS - (Date.now() - last));
  };

  // ── Vista gioco attivo ──
  if (activeGame) {
    const props = {
      onBack:     () => setActiveGame(null),
      onComplete: (earned) => handleComplete(activeGame, earned),
    };

    return (
      <div className="container">
        {activeGame === 'reflexes' && <Reflexes  {...props} />}
        {activeGame === 'simon'    && <SimonSays {...props} />}
        {activeGame === 'dodge'    && <DodgeGame {...props} />}
      </div>
    );
  }

  // ── Selezione giochi ──
  if (loading) return <div className="container"><p style={{ fontSize: 9, marginTop: 30 }}>Caricamento...</p></div>;

  return (
    <div className="container">
      <h1 className="text-2xl mt-10">MINI-GIOCHI</h1>

      <div className="shop-coin-display mt-5" style={{ justifyContent: 'center' }}>
        <img src={coins} alt="coin" className="coin" />
        <span>{coin}</span>
      </div>

      <div className="games-list mt-10">
        {GAMES.map(game => {
          const onCooldown = isOnCooldown(game.id);
          const remaining  = remainingMin(game.id);

          return (
            <div key={game.id} className="game-card">
              <span className="game-card-emoji">{game.emoji}</span>
              <div className="game-card-info">
                <p className="game-card-name">{game.name}</p>
                <p className="game-card-desc">{game.desc}</p>
                {onCooldown && (
                  <p className="game-card-cooldown">⏳ Disponibile tra {remaining} min</p>
                )}
              </div>
              <button
                className={`eightbit-btn ${onCooldown ? 'eightbit-btn--black' : ''}`}
                onClick={() => !onCooldown && setActiveGame(game.id)}
                disabled={onCooldown}
                style={{ opacity: onCooldown ? 0.4 : 1, fontSize: 8 }}
              >
                {onCooldown ? '⏳' : 'Gioca'}
              </button>
            </div>
          );
        })}
      </div>

      <Link className="eightbit-btn eightbit-btn--red my-10" to="/tamagotchi">
        ← Torna al gioco
      </Link>
    </div>
  );
}
