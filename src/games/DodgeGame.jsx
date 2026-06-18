import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../pages/Games.css';

const GAME_DURATION  = 30;   // secondi totali
const ANIM_DURATION  = 1800; // ms per attraversare l'arena
const COLLISION_AT   = 1300; // ms dopo lo spawn → ostacolo raggiunge il pet
const JUMP_DURATION  = 700;  // ms di durata del salto
const INIT_INTERVAL  = 2200; // ms tra un ostacolo e il successivo (iniziale)
const MIN_INTERVAL   = 1000; // intervallo minimo
const INTERVAL_STEP  = 100;  // riduzione ogni 3 ostacoli superati

const OBSTACLES = ['🌵','🪨','⚡','🔥'];

// phase: ready | playing | done
export default function DodgeGame({ onComplete, onBack }) {
  const [phase,       setPhase      ] = useState('ready');
  const [score,       setScore      ] = useState(0);
  const [timeLeft,    setTimeLeft   ] = useState(GAME_DURATION);
  const [isJumping,   setIsJumping  ] = useState(false);
  const [obstacleKey, setObstacleKey] = useState(0);
  const [obstacleVis, setObstacleVis] = useState(false);
  const [obstacleEmoji, setObstacleEmoji] = useState('🌵');
  const [gameOver,    setGameOver   ] = useState(false);

  const isJumpingRef  = useRef(false);
  const scoreRef      = useRef(0);
  const intervalRef   = useRef(INIT_INTERVAL);
  const spawnTimerRef = useRef(null);
  const tickRef       = useRef(null);
  const collisionRef  = useRef(null);
  const jumpTimerRef  = useRef(null);

  useEffect(() => { isJumpingRef.current = isJumping; }, [isJumping]);
  useEffect(() => { scoreRef.current     = score;     }, [score]);

  const endGame = useCallback((won = false) => {
    clearTimeout(spawnTimerRef.current);
    clearInterval(tickRef.current);
    clearTimeout(collisionRef.current);
    clearTimeout(jumpTimerRef.current);
    setObstacleVis(false);
    setPhase('done');
    setGameOver(!won);
  }, []);

  const spawnObstacle = useCallback(() => {
    setObstacleEmoji(OBSTACLES[Math.floor(Math.random() * OBSTACLES.length)]);
    setObstacleKey(k => k + 1);
    setObstacleVis(true);

    collisionRef.current = setTimeout(() => {
      if (!isJumpingRef.current) {
        endGame(false); // colpito
        return;
      }
      // Sopravvissuto
      const newScore = scoreRef.current + 1;
      setScore(newScore);
      scoreRef.current = newScore;
      setObstacleVis(false);

      // Aggiorna intervallo ogni 3 ostacoli
      if (newScore % 3 === 0) {
        intervalRef.current = Math.max(
          intervalRef.current - INTERVAL_STEP,
          MIN_INTERVAL
        );
      }

      // Prossimo ostacolo
      spawnTimerRef.current = setTimeout(spawnObstacle, intervalRef.current);
    }, COLLISION_AT);
  }, [endGame]);

  const startGame = () => {
    setPhase('playing');
    setScore(0);
    scoreRef.current = 0;
    intervalRef.current = INIT_INTERVAL;
    setTimeLeft(GAME_DURATION);
    setObstacleVis(false);

    // Timer conto alla rovescia
    tickRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          endGame(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    // Primo ostacolo dopo 1s
    spawnTimerRef.current = setTimeout(spawnObstacle, 1000);
  };

  const jump = () => {
    if (isJumpingRef.current || phase !== 'playing') return;
    setIsJumping(true);
    isJumpingRef.current = true;
    clearTimeout(jumpTimerRef.current);
    jumpTimerRef.current = setTimeout(() => {
      setIsJumping(false);
      isJumpingRef.current = false;
    }, JUMP_DURATION);
  };

  useEffect(() => () => {
    clearTimeout(spawnTimerRef.current);
    clearInterval(tickRef.current);
    clearTimeout(collisionRef.current);
    clearTimeout(jumpTimerRef.current);
  }, []);

  return (
    <div className="game-screen">
      <div className="game-top-bar">
        <span className="game-title">🏃 Schiva!</span>
        <button className="eightbit-btn eightbit-btn--black" onClick={onBack}>✕</button>
      </div>

      <div className="game-body">
        {phase === 'ready' && (
          <>
            <p className="game-instruction">Premi SALTA! per<br />schivare gli ostacoli!</p>
            <p style={{ fontSize: 7, color: '#888' }}>+1 🪙 per ogni ostacolo schivato</p>
            <button className="eightbit-btn" onClick={startGame}>Inizia</button>
          </>
        )}

        {phase === 'playing' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: 8 }}>
              <span className="dodge-score">🪙 {score}</span>
              <span className="dodge-timer">⏱ {timeLeft}s</span>
            </div>

            <div className="dodge-arena">
              <div className="dodge-ground" />
              <div className={`dodge-pet ${isJumping ? 'jumping' : ''}`}>🐣</div>
              {obstacleVis && (
                <div
                  key={obstacleKey}
                  className="dodge-obstacle"
                  style={{ animationDuration: `${ANIM_DURATION}ms` }}
                >
                  {obstacleEmoji}
                </div>
              )}
            </div>

            <button
              className="eightbit-btn eightbit-btn--yellow"
              style={{ fontSize: 14, padding: '14px 40px', marginTop: 16 }}
              onClick={jump}
            >
              SALTA! 🦘
            </button>
          </>
        )}

        {phase === 'done' && (
          <>
            <p className="game-instruction">
              {gameOver ? '💥 Colpito!' : '🎉 Tempo scaduto!'}
            </p>
            <p className="game-coins-earned">+{score} 🪙</p>
            <button
              className="eightbit-btn eightbit-btn--yellow"
              onClick={() => onComplete(score)}
            >
              Ritira premi!
            </button>
          </>
        )}
      </div>
    </div>
  );
}
