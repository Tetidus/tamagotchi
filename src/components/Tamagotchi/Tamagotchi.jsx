import React, { useState, useEffect, useContext } from 'react';
import './Tamagotchi.css';
import hero_idle from '../../assets/hero_idle.gif';
import poopImg from '../../assets/poop.png';
import InteractionPanel from '../InteractionPanel/InteractionPanel';
import { getDatabase, ref, set, onValue } from 'firebase/database';
import AuthContext from '../../authContext';
import { doSignOut } from '../../auth';
import { useNavigate } from 'react-router-dom';

const Tamagotchi = () => {
    const [position, setPosition] = useState(0);
    const [poops, setPoops] = useState([]);
    const [happiness, setHappiness] = useState(30);
    const [hunger, setHunger] = useState(0);
    const [energy, setEnergy] = useState(50);
    const { currentUser } = useContext(AuthContext);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    // const navigate = useNavigate();

    useEffect(() => {
        const db = getDatabase();
        const statusRef = ref(db, 'users/' + currentUser.uid + '/status');

        const unsubscribe = onValue(statusRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setHappiness(data.happiness || 30);
                setHunger(data.hunger || 0);
                setEnergy(data.energy || 50);
                setIsDataLoaded(true);
                // Aggiorna il timestamp nel local storage
                localStorage.setItem('lastUpdateTimestamp', Date.now());
            }
        });

        const moveInterval = setInterval(() => {
            setPosition(prevPosition => {
                const nextPosition = prevPosition + (Math.random() < 0.5 ? -20 : 20);

                if (nextPosition < -100) {
                    return -100;
                } else if (nextPosition > 100) {
                    return 100;
                }
                return nextPosition;
            });
        }, 3000);

        const poopInterval = setInterval(() => {
            setPoops(prevPoops => {
                if (prevPoops.length < 5) {
                    return [...prevPoops, { id: prevPoops.length, position: Math.random() * 200 - 200 }];
                }
                return prevPoops;
            });
        }, 100);

        const hungerInterval = setInterval(() => {
            setHunger(prevHunger => {
                const newHunger = prevHunger + 10;
                return newHunger <= 100 ? newHunger : 100;
            });
        }, 5000);

        const happinessInterval = setInterval(() => {
            if (hunger === 100 && happiness > 0) {
                setHappiness(prevHappiness => Math.max(prevHappiness - 10, 0));
            }
        }, 5000);

        return () => {
            clearInterval(moveInterval);
            clearInterval(poopInterval);
            clearInterval(hungerInterval);
            clearInterval(happinessInterval);
            unsubscribe();
        };
    }, [currentUser.uid]);

    useEffect(() => {
        if (!isDataLoaded || !currentUser || !currentUser.uid) return;

        const db = getDatabase();
        set(ref(db, 'users/' + currentUser.uid + '/status'), {
            happiness,
            hunger,
            energy
        }).catch(error => {
            console.error("Firebase set error:", error);
        });

        // Controlla se è trascorso un certo intervallo di tempo dall'ultimo aggiornamento
        const lastUpdateTimestamp = localStorage.getItem('lastUpdateTimestamp');
        if (lastUpdateTimestamp) {
            const currentTime = Date.now();
            const elapsedTime = currentTime - parseInt(lastUpdateTimestamp, 10);
            const updateInterval = 2 * 60 * 60 * 1000; // 2 ore
            if (elapsedTime >= updateInterval) {
                // Esegui la logica per aggiornare i valori
                // Aggiorna il timestamp nel local storage
                localStorage.setItem('lastUpdateTimestamp', Date.now());
            }
        }
    }, [happiness, hunger, energy, currentUser, isDataLoaded]);

    const removePoop = id => {
        setPoops(prevPoops => prevPoops.filter(poop => poop.id !== id));
    };

    const feedTamagotchi = () => {
        setHunger(prevHunger => Math.max(prevHunger - 10, 0));
    };

    const playWithTamagotchi = () => {
        if (energy >= 10 && happiness !== 100) {
            setHappiness(prevHappiness => Math.min(prevHappiness + 10, 100));
            setEnergy(prevEnergy => Math.max(prevEnergy - 10, 0));
        }
    };

    const putTamagotchiToSleep = () => {
        setEnergy(prevEnergy => Math.min(prevEnergy + 20, 100));
    };

    // if (!isDataLoaded) {
    //     return <div>Caricamento...</div>; // Oppure qualsiasi altro markup/componente per il caricamento
    // }

    return (
        <div>
            <h2>Tamagotchi</h2>
            <img src={hero_idle} alt="Tamagotchi character" className="character" style={{ transform: `translateX(${position}px)` }} />
            {poops.map(poop => (
                <img key={poop.id} src={poopImg} alt="Poop" className="poop"
                    style={{ position: 'absolute', transform: `translateX(${poop.position}px) translateY(52px)` }}
                    onClick={() => removePoop(poop.id)} />
            ))}
            <hr />
            <div className="statusBar stats">
                <p>Hunger: {hunger}</p>
                <p>Happiness: {happiness}</p>
                <p>Energy: {energy}</p>
            </div>
            <InteractionPanel
                onFeed={feedTamagotchi}
                onPlay={playWithTamagotchi}
                onSleep={putTamagotchiToSleep}
            />

            <br /><br />
            {/* <button onClick={() => { doSignOut().then(() => { navigate('/login') }) }}>Sign Out</button> */}

        </div>
    );
};

export default Tamagotchi;
