// src/components/InteractionPanel.js
import React from 'react';
import "../../App.css"
import "./InteractionPanel.css"

const InteractionPanel = ({ onFeed, onPlay, isSleeping = false }) => {
  const dim = { opacity: isSleeping ? 0.35 : 1, pointerEvents: isSleeping ? 'none' : 'auto' };
  return (
    <div className="statusBar">
      <button className="eightbit-btn eightbit-btn--yellow" onClick={onFeed} style={dim}>Feed</button>
      <button className="eightbit-btn" onClick={onPlay} style={dim}>Play</button>
    </div>
  );
};

export default InteractionPanel;
