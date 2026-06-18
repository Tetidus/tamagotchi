import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../pages/Games.css';

const COLORS = [
  { bg: '#c62828', active: '#f44336', shadow: '#f44336' },
  { bg: '#1b5e20', active: '#4caf50', shadow: '#4caf50' },
  { bg: '#0d47a1', active: '#2196f3', shadow: '#2196f3' },
  { bg: '#f57f17', active: '#ffd700', shadow: '#ffd700' },
];
const MAX_ROUNDS   = 10;
const SHOW_MS      = 550;
const PAUSE_MS     = 200;
const COINS_EACH   = 2;

// phase: start | showing | input | done
export default function SimonSays({ onComplete, onBack }) {
  const [phase,      setPhase     ] = useState('start');
  const [sequence,   setSequence  ] = useState([]);
  const [activeBtn,  setActiveBtn ] = useState(null);
  const [playerSeq,  setPlayerSeq ] = useState([]);
  const [round,      setRound     ] = useState(0);
  const [coins,      setCoins     ] = useState(0);
  const [feedback,   setFeedback  ] = useState(''); // '' | 'correct' | 'wrong'

  const timerRef = useRef(null);
  const clear    = () => clearTimeout(timerRef.current);

  const showSequence = useCallback((seq) => {
    setPhase('showing');
    setPlayerSeq([]);
    setFeedback('');
    let i = 0;
    const next = () => {
      if (i >= seq.length) {
        setActiveBtn(null);
        setPhase('input');
        return;
      }
      setActiveBtn(seq[i]);
      timerRef.current = setTimeout(() => {
        setActiveBtn(null);
        timerRef.current = setTimeout(() => { i++; next(); }, PAUSE_MS);
      }, SHOW_MS);
    };
    timerRef.current = setTimeout(next, 400);
  }, []);

  const startGame = () => {
    const seq = [Math.floor(Math.random() * 4)];
    setSequence(seq);
    setRound(1);
    setCoins(0);
    showSequence(seq);
  };

  const handlePress = (idx) => {
    if (phase !== 'input') return;

    const pos      = playerSeq.length;
    const expected = sequence[pos];

    if (idx !== expected) {
      // Sbagliato → fine partita
      setFeedback('wrong');
      setPhase('done');
      return;
    }

    const newSeq = [...playerSeq, idx];
    setPlayerSeq(newSeq);

    if (newSeq.length < sequence.length) return; // input incompleto

    // Round completato
    const newCoins = coins + COINS_EACH;
    setCoins(newCoins);

    if (round >= MAX_ROUNDS) {
      setFeedback('correct');
      setPhase('done');
      return;
    }

    setFeedback('correct');
    const nextSeq = [...sequence, Math.floor(Math.random() * 4)];
    setSequence(nextSeq);
    timerRef.current = setTimeout(() => {
      setRound(r => r + 1);
      showSequence(nextSeq);
    }, 800);
  };

  useEffect(() => () => clear(), []);

  const showGrid = ['showing', 'input'].includes(phase)
    || (phase === 'done' && feedback === 'wrong');

  return (
    <div className="game-screen">
      <div className="game-top-bar">
        <span className="game-title">🧠 Simon Says — {round}/{MAX_ROUNDS}</span>
        <button className="eightbit-btn eightbit-btn--black" onClick={onBack}>✕</button>
      </div>

      <div className="game-body">
        {phase === 'start' && (
          <>
            <p className="game-instruction">Ripeti la sequenza<br />di colori!</p>
            <p style={{ fontSize: 7, color: '#888' }}>+{COINS_EACH} 🪙 per ogni round</p>
            <button className="eightbit-btn" onClick={startGame}>Inizia</button>
          </>
        )}

        {showGrid && (
          <>
            <p style={{ fontSize: 8, color: '#aaa', margin: 0 }}>
              {phase === 'showing' ? 'Guarda...'
               : feedback === 'correct' ? '✓ Corretto!'
               : feedback === 'wrong'   ? '✗ Sbagliato!'
               : 'Ripeti!'}
            </p>

            <div className="simon-grid">
              {COLORS.map((c, i) => (
                <div
                  key={i}
                  className="simon-btn"
                  style={{
                    background:  activeBtn === i ? c.active : c.bg,
                    border:      `3px solid ${c.active}`,
                    boxShadow:   activeBtn === i ? `0 0 18px ${c.shadow}` : 'none',
                    cursor:      phase === 'input' ? 'pointer' : 'default',
                  }}
                  onClick={() => handlePress(i)}
                />
              ))}
            </div>

            <p style={{ fontSize: 9, margin: 0 }}>🪙 {coins}</p>
          </>
        )}

        {phase === 'done' && (
          <>
            <p className="game-coins-earned">+{coins} 🪙</p>
            <button
              className="eightbit-btn eightbit-btn--yellow"
              onClick={() => onComplete(coins)}
            >
              Ritira premi!
            </button>
          </>
        )}
      </div>
    </div>
  );
}
