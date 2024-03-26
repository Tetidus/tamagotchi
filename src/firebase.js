// firebase.js
import firebase from 'firebase/compat/app'; // Modifica questa riga
import 'firebase/compat/auth'; // Modifica questa riga
import 'firebase/compat/database'; // Modifica questa riga

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
  

// Inizializza Firebase con la configurazione
firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const database = firebase.database();