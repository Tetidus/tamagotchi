import React, { useContext, useState } from 'react';
import { auth } from '../firebase';
import { useAuth } from '../authContext';
import { doCreateUserWithEmailAndPassword, doSignInWithGoogle } from '../auth';
import { Link, Navigate } from 'react-router-dom';
import { getDatabase, ref, set } from "firebase/database";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import AuthContext from '../authContext';

const SignUp = () => {
  const { userLoggedIn } = useAuth()
  const { currentUser } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistring, setIsRegistring] = useState(false);
  const [error, setError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isRegistring) {
      setIsRegistring(true);
      try {
        await doCreateUserWithEmailAndPassword(email, password);
      } catch (error) {
        setError(error.message); // Imposta il messaggio di errore
      } finally {
        setIsRegistring(false);
      }
    }
  }

  const handleSignUp = async () => {
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      const db = getDatabase();

      await set(ref(db, 'users/' + user.uid), {
        email: user.email,
      });

      // Naviga alla pagina di Tamagotchi se la registrazione è riuscita
      // navigate('/tamagotchi');
    } catch (error) {
      setError(error.message); // Imposta il messaggio di errore
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const db = getDatabase();

      await set(ref(db, 'users/' + user.uid), {
        email: user.email,
      });

      // Naviga alla pagina di Tamagotchi se la registrazione è riuscita
      // history.push('/tamagotchi');
    } catch (error) {
      setError(error.message); // Imposta il messaggio di errore
    }
  };

  return (
    <>
      <div className="bodyFlex">
        <div className="container">
          {userLoggedIn && (<Navigate to={'/tamagotchi'} replace={true} />)}
          <h1 className="mb-10 text-2xl">Registrazione</h1>
          {error && <p style={{ color: 'red' }}>{error}</p>} {/* Visualizza il messaggio di errore */}
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <input type="password" className="my-5 h-100" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          <button className="eightbit-btn eightbit-btn--black mt-5" onClick={handleSignUp}>Registrati</button>
          {/* <button onClick={handleGoogleSignUp}>Registrati con Google</button> */}
          <div className="text-m mt-5">
            <Link to={'/login'}>Go to Login</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUp;
