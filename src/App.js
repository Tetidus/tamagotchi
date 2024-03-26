// src/App.js
import React, { useState } from 'react';
import Tamagotchi from './components/Tamagotchi/Tamagotchi';
import InteractionPanel from './components/InteractionPanel/InteractionPanel';

const App = () => {
  const [happiness, setHappiness] = useState(100); // Modificato il valore di happiness
  const [hunger, setHunger] = useState(0); // Modificato il valore di hunger
  const [energy, setEnergy] = useState(50);

  const feedTamagotchi = () => {
    setHunger(prevHunger => Math.max(prevHunger - 10, 0));
  };

  const playWithTamagotchi = () => {
    setHappiness(prevHappiness => Math.min(prevHappiness + 10, 100));
    setEnergy(prevEnergy => Math.max(prevEnergy - 10, 0));
  };

  const putTamagotchiToSleep = () => {
    setEnergy(prevEnergy => Math.min(prevEnergy + 20, 100));
  };

  return (
    <div className="container">
      <Tamagotchi
        happiness={happiness}
        hunger={hunger}
        energy={energy}
        onFeed={feedTamagotchi}
        onPlay={playWithTamagotchi}
        onSleep={putTamagotchiToSleep}
      />
      <InteractionPanel
        onFeed={feedTamagotchi}
        onPlay={playWithTamagotchi}
        onSleep={putTamagotchiToSleep}
      />
    </div>
  );
};

export default App;
