// SignUp.js
import React, { useContext, useState } from 'react';
import { auth } from '../firebase'; // Importiamo l'oggetto auth da firebase.js
import { useAuth } from '../authContext';
import { doCreateUserWithEmailAndPassword } from '../auth';
import { Navigate } from 'react-router-dom';
import { getDatabase, ref, set } from "firebase/database";
import AuthContext from '../authContext'; // Assicurati che il contesto di autenticazione sia esportato correttamente
import { createUserWithEmailAndPassword, getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";



const SignUp = () => {
  const { userLoggedIn } = useAuth()
  const { currentUser } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistring, setIsRegistring] = useState(false)
  const [error, setError] = useState(null);

  const onSubmit = async(e) => {
    e.preventDefault()
    if(!isRegistring) {
      setIsRegistring(true)
      await doCreateUserWithEmailAndPassword(email, password)
    }
  }

  const handleSignUp = async () => {
    try {
      // Registra l'utente con Firebase Authentication
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Ottieni un riferimento al database in tempo reale di Firebase
      const db = getDatabase();
  
      // Salva le informazioni dell'utente nel Realtime Database
      await set(ref(db, 'users/' + user.uid), {
        email: user.email,
        // Altre informazioni sull'utente che desideri salvare
      });
  
      // Se tutto è andato a buon fine, puoi procedere con la navigazione o altre azioni necessarie
      // navigate('/tamagotchi');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const auth = getAuth();
      
      // Autenticazione con Google
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
  
      // Ottieni un riferimento al database in tempo reale di Firebase
      const db = getDatabase();
  
      // Salva le informazioni dell'utente nel Realtime Database
      await set(ref(db, 'users/' + user.uid), {
        email: user.email,
        // Altre informazioni sull'utente che desideri salvare
      });
  
      // Se tutto è andato a buon fine, puoi procedere con la navigazione o altre azioni necessarie
      // history.push('/tamagotchi');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <>
    {userLoggedIn && (<Navigate to={'/tamagotchi'} replace={true} />)}
      <h2>Registrazione</h2>
      {error && <p>{error}</p>}
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      <button onClick={handleSignUp}>Registrati</button>
      <button onClick={handleGoogleSignUp}>Registrati con Google</button>
    </>
  );
};

export default SignUp;
