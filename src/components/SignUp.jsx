// SignUp.js
import React, { useState } from 'react';
import { auth } from '../firebase'; // Importiamo l'oggetto auth da firebase.js
import { useAuth } from '../authContext';
import { doCreateUserWithEmailAndPassword } from '../auth';
import { Navigate } from 'react-router-dom';

const SignUp = () => {
  const { userLoggedIn } = useAuth()

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
      await auth.createUserWithEmailAndPassword(email, password);
      // Registrazione riuscita
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
    </>
  );
};

export default SignUp;
