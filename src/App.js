import React, { useState } from 'react';
import SignUp from './components/SignUp';
import Tamagotchi from './components/Tamagotchi/Tamagotchi';
import { auth } from './firebase';

const App = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await auth.signInWithEmailAndPassword(email, password);
      // Login riuscito
    } catch (error) {
      console.error(error.message);
    }
  };


  return (
    <div className="container">
      <Tamagotchi />
      <SignUp />
      <form>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        <button type="button" onClick={handleLogin}>Login</button>
      </form>
    </div>
  );
};

export default App;
