import React, { useEffect, useState } from 'react';
import { ref, set, get } from 'firebase/database';
import { getDatabase } from 'firebase/database';
import characters from '../../assets/characters/index'

const Character = ({ currentUser, setCharacterImg, style }) => {
    const [characterImgSrc, setCharacterImgSrc] = useState(null);

    useEffect(() => {
        const fetchCharacter = async () => {
            try {
                const db = getDatabase();
                const characterRef = ref(db, `users/${currentUser.uid}/character`);
                const snapshot = await get(characterRef);
                let character = snapshot.val();

                if (!character) {
                    character = getRandomCharacter();
                    await set(characterRef, character);
                }

                const characterImg = characters[character];
                if (characterImg) {
                    setCharacterImg(characterImg);
                    setCharacterImgSrc(characterImg);
                }
            } catch (error) {
                console.error('Error fetching character:', error);
            }
        };

        if (currentUser && currentUser.uid) {
            fetchCharacter();
        }
    }, [currentUser, setCharacterImg]);

    const getRandomCharacter = () => {
        const keys = Object.keys(characters);
        return keys[Math.floor(Math.random() * keys.length)];
    };

    return (
        <div>
            {characterImgSrc && <img src={characterImgSrc} className="character" alt="Character" style={style} />}        </div>
    );
};

export default Character;
