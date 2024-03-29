// src/components/InteractionPanel.js
import React from 'react';
import "../../App.css"
import "./InteractionPanel.css"

const InteractionPanel = ({ onFeed, onPlay, onSleep }) => {
  return (
    <div className="statusBar">
      <button className="eightbit-btn eightbit-btn--yellow" onClick={onFeed}>Feed</button>
      <button className="eightbit-btn" onClick={onPlay}>Play</button>
      <button className="eightbit-btn eightbit-btn--red" onClick={onSleep}>Sleep</button>
    </div>
  );
};

export default InteractionPanel;
