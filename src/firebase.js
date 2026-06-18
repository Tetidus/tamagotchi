import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyCe07spHk5UaHYo6z7acuTBDqb3jU1980E",
    authDomain: "my-tamagotchi.firebaseapp.com",
    databaseURL: "https://my-tamagotchi-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "my-tamagotchi",
    storageBucket: "my-tamagotchi.appspot.com",
    messagingSenderId: "159549543998",
    appId: "1:159549543998:web:551b37df0271111c50636f",
    measurementId: "G-Z2T0JRTFH7"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
