'use client';

import { useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/game-store';
import Tile from '@/components/Tile';
import { Trophy, User } from 'lucide-react';

export default function EmbedPage() {
  const {
    board,
    score,
    bestScore,
    gameOver,
    hasWon,
    continueAfterWin,
    initBoard,
    move,
    setContinueAfterWin,
    getGameDuration,
    moves,
    playerName,
    setPlayerName,
  } = useGameStore();

  const [localName, setLocalName] = useState(playerName || '');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [rank, setRank] = useState<number | null>(null);

  useEffect(() => {
    // Only initialize if board is empty (all zeros)
    if (board.every(row => row.every(cell => cell === 0))) {
      initBoard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (gameOver) {
      setSubmitted(false);
      setRank(null);
      setLocalName(playerName || '');
    }
  }, [gameOver, playerName]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameOver) return;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      const directionMap: { [key: string]: 'up' | 'down' | 'left' | 'right' } = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
      };
      move(directionMap[e.key]);
    }
  }, [move, gameOver]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (gameOver) return;
      const touchEndX = e.changedTouches[0].screenX;
      const touchEndY = e.changedTouches[0].screenY;
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;
      const minSwipeDistance = 30;

      if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) return;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        move(deltaX > 0 ? 'right' : 'left');
      } else {
        move(deltaY > 0 ? 'down' : 'up');
      }
    };

    const gameBoard = document.getElementById('game-board-embed');
    if (gameBoard) {
      gameBoard.addEventListener('touchstart', handleTouchStart, { passive: true });
      gameBoard.addEventListener('touchend', handleTouchEnd, { passive: true });
      return () => {
        gameBoard.removeEventListener('touchstart', handleTouchStart);
        gameBoard.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [move, gameOver]);

  const handleNewGame = () => {
    setSubmitted(false);
    setRank(null);
    initBoard();
  };

  const handleSubmitScore = async () => {
    const nameToUse = localName.trim();
    if (!nameToUse || submitting) return;

    setPlayerName(nameToUse);
    setSubmitting(true);

    try {
      const maxTile = Math.max(...board.flat());
      const res = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: nameToUse,
          score,
          maxTile,
          moves,
          duration: getGameDuration(),
          won: hasWon,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        setRank(data.rank);
      }
    } catch {
      console.error('Failed to submit score');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="embed-page">
      {/* Header - title, scores and new game */}
      <div className="embed-header">
        <h1 className="embed-title">2048</h1>
        <div className="embed-scores">
          <div className="embed-score-box">
            <div className="embed-score-label">SCORE</div>
            <div className="embed-score-value">{score}</div>
          </div>
          <div className="embed-score-box">
            <div className="embed-score-label">BEST</div>
            <div className="embed-score-value">{bestScore}</div>
          </div>
        </div>
        <button onClick={handleNewGame} className="embed-new-btn">
          New Game
        </button>
      </div>

      {/* Game Board */}
      <div className="embed-board-wrapper">
        <div id="game-board-embed" className="game-board">
          <div className="board-background">
            {Array(16).fill(null).map((_, i) => (
              <div key={i} className="cell-bg" />
            ))}
          </div>

          <div className="tiles-layer">
            {board.map((row, i) =>
              row.map((cell, j) => (
                <Tile key={`${i}-${j}`} value={cell} row={i} col={j} />
              ))
            )}
          </div>

          {/* Win overlay */}
          <AnimatePresence>
            {hasWon && !continueAfterWin && !gameOver && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="game-overlay overlay-win"
              >
                <div className="overlay-title">You Win!</div>
                <div className="overlay-subtitle">You reached 2048!</div>
                <div className="overlay-buttons">
                  <button onClick={setContinueAfterWin} className="btn-continue">
                    Keep Playing
                  </button>
                  <button onClick={handleNewGame} className="btn-retry">
                    New Game
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Game over overlay */}
          <AnimatePresence>
            {gameOver && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="game-overlay overlay-gameover"
              >
                <div className="overlay-title">Game Over!</div>
                
                {submitted ? (
                  <div className="overlay-submitted">
                    <div className="rank-display">
                      <Trophy size={24} className="trophy-icon" /> Rank #{rank}
                    </div>
                    <p className="submitted-text">Score saved!</p>
                    <button onClick={handleNewGame} className="btn-retry">
                      Play Again
                    </button>
                  </div>
                ) : (
                  <div className="overlay-submit-form">
                    <div className="overlay-score-display">
                      <Trophy size={24} className="trophy-icon" />
                      <div>
                        <span className="score-label-overlay">Score</span>
                        <span className="score-value-overlay">{score.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="name-input-wrapper">
                      <User size={18} className="input-icon" />
                      <input
                        type="text"
                        value={localName}
                        onChange={(e) => setLocalName(e.target.value)}
                        placeholder="Enter your name..."
                        maxLength={20}
                        className="name-input"
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmitScore()}
                      />
                    </div>

                    <button 
                      onClick={handleSubmitScore} 
                      disabled={!localName.trim() || submitting}
                      className="btn-submit"
                    >
                      <Trophy size={16} />
                      {submitting ? 'Saving...' : 'Save Score'}
                    </button>
                    <button onClick={handleNewGame} className="btn-retry-secondary">
                      Skip
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
