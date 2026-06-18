import React, { useState, useEffect, useRef } from 'react';
import '../pages/Games.css';

const ROUNDS = 3;

const coinsFromAvg = (ms) => {
  if (ms < 250) return 10;
  if (ms < 400) return 7;
  if (ms < 600) return 5;
  if (ms < 900) return 3;
  return 1;
};

// phase: ready | countdown | waiting | active | between | done
export default function Reflexes({ onComplete, onBack }) {
  const [phase,     setPhase    ] = useState('ready');
  const [countNum,  setCountNum ] = useState(3);
  const [round,     setRound    ] = useState(1);
  const [times,     setTimes    ] = useState([]);
  const [lastTime,  setLastTime ] = useState(null);
  const [tooEarly,  setTooEarly ] = useState(false);

  const tapStartRef = useRef(null);
  const timerRef    = useRef(null);

  const clear = () => clearTimeout(timerRef.current);

  // Macchina a stati
  useEffect(() => {
    if (phase === 'countdown') {
      if (countNum === 0) {
        const delay = 600 + Math.random() * 1800;
        timerRef.current = setTimeout(() => {
          tapStartRef.current = Date.now();
          setPhase('active');
        }, delay);
      } else {
        timerRef.current = setTimeout(() => setCountNum(n => n - 1), 800);
      }
    } else if (phase === 'active') {
      // Auto-fail se troppo lento (1.5s)
      timerRef.current = setTimeout(() => record(1500), 1500);
    }
    return clear;
  }, [phase, countNum]);

  const record = (forceMs) => {
    clear();
    const reaction = forceMs ?? (Date.now() - tapStartRef.current);
    setLastTime(reaction);
    const newTimes = [...times, reaction];
    setTimes(newTimes);
    if (round >= ROUNDS) {
      setPhase('done');
    } else {
      setPhase('between');
    }
  };

  const handleTap = () => {
    if (phase === 'active') {
      record();
    } else if (['countdown', 'waiting'].includes(phase)) {
      clear();
      setTooEarly(true);
      setPhase('ready');
    }
  };

  const startRound = () => {
    setTooEarly(false);
    setCountNum(3);
    setPhase('countdown');
  };

  const nextRound = () => {
    setRound(r => r + 1);
    startRound();
  };

  const avg   = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
  const coins = phase === 'done' ? coinsFromAvg(avg) : 0;

  return (
    <div className="game-screen">
      <div className="game-top-bar">
        <span className="game-title">🎯 Riflessi — {round}/{ROUNDS}</span>
        <button className="eightbit-btn eightbit-btn--black" onClick={onBack}>✕</button>
      </div>

      <div className="game-body">
        {phase === 'ready' && (
          <>
            {tooEarly && <p className="game-warning">⚡ Troppo presto! Aspetta il cerchio.</p>}
            <p className="game-instruction">Tappa il cerchio verde<br />il più veloce possibile!</p>
            <button className="eightbit-btn" onClick={startRound}>
              {round > 1 ? `Round ${round} →` : 'Inizia'}
            </button>
          </>
        )}

        {phase === 'countdown' && (
          <div className="game-countdown">{countNum}</div>
        )}

        {phase === 'waiting' && (
          <div className="waiting-dot" onClick={handleTap}>⬤</div>
        )}

        {phase === 'active' && (
          <div className="tap-target" onClick={handleTap}>
            TAP!
          </div>
        )}

        {phase === 'between' && (
          <>
            <p className="game-reaction">{lastTime}ms ⚡</p>
            <button className="eightbit-btn" onClick={nextRound}>Continua →</button>
          </>
        )}

        {phase === 'done' && (
          <>
            <p className="game-instruction">Media: {avg}ms</p>
            <p className="game-coins-earned">+{coins} 🪙</p>
            <button className="eightbit-btn eightbit-btn--yellow" onClick={() => onComplete(coins)}>
              Ritira premi!
            </button>
          </>
        )}
      </div>
    </div>
  );
}
