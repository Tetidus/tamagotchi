import React, { useState } from 'react';
import Tamagotchi from './components/Tamagotchi/Tamagotchi';
import InteractionPanel from './components/InteractionPanel/InteractionPanel';

const App = () => {

  return (
    <div className="container">
      <Tamagotchi />
    </div>
  );
};

export default App;
