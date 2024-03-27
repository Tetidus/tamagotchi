import React, { useState, useEffect, useContext } from 'react';
import './Tamagotchi.css';
import hero_idle from '../../assets/hero_idle.gif';
import poopImg from '../../assets/poop.png'; // Assicurati di avere questo file in assets
import InteractionPanel from '../InteractionPanel/InteractionPanel';
import { getDatabase, ref, set, onValue } from 'firebase/database';
import AuthContext from '../../authContext'; // Assicurati che il percorso sia corretto
import { doSignOut } from '../../auth';
import { useNavigate } from 'react-router-dom';

const Tamagotchi = () => {
    const [position, setPosition] = useState(0);
    const [poops, setPoops] = useState([]);
    const [happiness, setHappiness] = useState(30);
    const [hunger, setHunger] = useState(0);
    const [energy, setEnergy] = useState(50);
    const { currentUser } = useContext(AuthContext); // Usa l'AuthContext per ottenere l'utente attuale
    const [isDataLoaded, setIsDataLoaded] = useState(false); // Sposta questa riga qui
    const navigate = useNavigate()

    useEffect(() => {
        const db = getDatabase();
        const statusRef = ref(db, 'users/' + currentUser.uid + '/status');

        // Restituisce una funzione che può essere usata per rimuovere il listener.
        const unsubscribe = onValue(statusRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setHappiness(data.happiness || 30); // Usa un valore di default se non definito
                setHunger(data.hunger || 0);
                setEnergy(data.energy || 50);
                setIsDataLoaded(true); // Aggiungi questa riga
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
        }, 100000);

        const hungerInterval = setInterval(() => {
            setHunger(prevHunger => {
                const newHunger = prevHunger + 10;
                return newHunger <= 100 ? newHunger : 100; // Limita il valore massimo a 100
            });
        }, 5000); // Ogni 5 secondi

        const happinessInterval = setInterval(() => {
            if (hunger === 100 && happiness > 0) {
                setHappiness(prevHappiness => Math.max(prevHappiness - 10, 0)); // Imposta happiness a 0 se il nuovo valore è inferiore a 0
            }
        }, 5000); // Ogni 5 secondi

        return () => {
            clearInterval(moveInterval);
            clearInterval(poopInterval);
            clearInterval(hungerInterval);
            clearInterval(happinessInterval);
            unsubscribe();
        };
    }, [currentUser.uid]);

    useEffect(() => {
        if (!isDataLoaded || !currentUser || !currentUser.uid) return; // Assicurati che l'uid dell'utente esista

        const db = getDatabase();
        // Qui, costruisci il percorso dove vuoi salvare i dati dentro il tuo database Firebase
        // Nota: si suppone che `currentUser` sia già definito; altrimenti, gestisci questo caso.
        set(ref(db, 'users/' + currentUser.uid + '/status'), {
            happiness,
            hunger,
            energy
        }).catch(error => {
            console.error("Firebase set error:", error);
        });
    }, [happiness, hunger, energy, currentUser, isDataLoaded]); // Dipendenze useEffect

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

    if (!isDataLoaded) {
        return <div>Caricamento...</div>; // Oppure qualsiasi altro markup/componente per il caricamento
    }

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
            <button onClick={() => { doSignOut().then(() => { navigate('/login') }) }}>Sign Out</button>

        </div>
    );
};

export default Tamagotchi;
