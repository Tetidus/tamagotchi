// SignUp.js
import React, { useState } from 'react';
import { auth } from '../firebase'; // Importiamo l'oggetto auth da firebase.js

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSignUp = async () => {
    try {
      await auth.createUserWithEmailAndPassword(email, password);
      // Registrazione riuscita
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div>
      <h2>Registrazione</h2>
      {error && <p>{error}</p>}
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      <button onClick={handleSignUp}>Registrati</button>
    </div>
  );
};

export default SignUp;
