import React, { useState, useEffect, useContext } from 'react';
import './Tamagotchi.css';
import hero_idle from '../../assets/hero_idle.gif';
import sushi from '../../assets/sushi_tama.png';
import poopImg from '../../assets/poop.png';
import room from '../../assets/room.gif'
import InteractionPanel from '../InteractionPanel/InteractionPanel';
import { getDatabase, ref, set, onValue, push, remove } from 'firebase/database';
import AuthContext from '../../authContext';
import { doSignOut } from '../../auth';
import { useNavigate } from 'react-router-dom';

const Tamagotchi = () => {
    const [position, setPosition] = useState(0);
    const [poops, setPoops] = useState([]);
    const [happiness, setHappiness] = useState(0);
    const [hunger, setHunger] = useState(0);
    const [energy, setEnergy] = useState(50);
    const { currentUser } = useContext(AuthContext);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const db = getDatabase();
        const statusRef = ref(db, 'users/' + currentUser.uid + '/status');
        const poopsRef = ref(db, 'users/' + currentUser.uid + '/poops');

        const statusUnsubscribe = onValue(statusRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setHappiness(data.happiness || 0);
                setHunger(data.hunger || 0);
                setEnergy(data.energy || 50);
                setIsDataLoaded(true);
            }
        });

        const poopsUnsubscribe = onValue(poopsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const poopsArray = Object.entries(data).map(([key, value]) => ({
                    id: key,
                    ...value
                }));
                setPoops(poopsArray);
            }
        });

        const moveInterval = setInterval(() => {
            setPosition(prevPosition => {
                const nextPosition = prevPosition + (Math.random() < 0.5 ? -20 : 20);
                return Math.max(Math.min(nextPosition, 100), -100);
            });
        }, 3000);

        return () => {
            clearInterval(moveInterval);
            statusUnsubscribe();
            poopsUnsubscribe();
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
    }, [happiness, hunger, energy, currentUser, isDataLoaded]);

    useEffect(() => {
        const happinessInterval = setInterval(() => {
            if (hunger === 100) {
                setHappiness(prevHappiness => Math.max(prevHappiness - 10, 0));
            }
        }, 5000);

        return () => {
            clearInterval(happinessInterval);
        };
    }, [hunger]);

    const removePoop = (id) => {
        const db = getDatabase();
        const poopRef = ref(db, `users/${currentUser.uid}/poops/${id}`);
        remove(poopRef)
            .then(() => {
                console.log(`Poop ${id} removed successfully.`);
                setPoops(currentPoops => currentPoops.filter(poop => poop.id !== id));
            })
            .catch((error) => console.error("Error removing poop: ", error));
    };

    useEffect(() => {
        if (poops.length >= 5) return;

        const db = getDatabase();
        const poopInterval = setInterval(() => {
            if (poops.length < 5) {
                const newPoopRef = push(ref(db, `users/${currentUser.uid}/poops`));
                const newPoop = {
                    id: newPoopRef.key,
                    position: Math.random() * 200 - 100
                };
                set(newPoopRef, newPoop);
            }
        }, 10000);

        return () => clearInterval(poopInterval);
    }, [poops.length, currentUser.uid]);

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
        return <div>Caricamento...</div>;
    }

    return (
        <div>
            <h1 className="text-2xl title">Tamagotchi</h1>
            <img src={room} className="room" />
            <img src={sushi} alt="Tamagotchi character" className="character" style={{ transform: `translateX(${position}px)` }} />
            {poops.map(poop => (
                <img key={poop.id} src={poopImg} alt="Poop" className="poop"
                    style={{ position: 'absolute', transform: `translateX(${poop.position}px) translateY(18px)` }}
                    onClick={() => removePoop(poop.id)} />
            ))}
            <hr />
            <div className="statusBar stats my-5">
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
