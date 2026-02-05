'use client';

import { useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/game-store';
import Tile from './Tile';
import { Trophy, User } from 'lucide-react';
import { leaderboardEvents } from '@/lib/events';

export default function GameBoard() {
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

  // Initialize board on mount
  useEffect(() => {
    if (board.every(row => row.every(cell => cell === 0))) {
      initBoard();
    }
  }, []);

  // Reset submission state when game ends
  useEffect(() => {
    if (gameOver) {
      setSubmitted(false);
      setRank(null);
      setLocalName(playerName || '');
    }
  }, [gameOver, playerName]);

  // Keyboard controls
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

  // Touch controls
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

      if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) {
        return;
      }

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        move(deltaX > 0 ? 'right' : 'left');
      } else {
        move(deltaY > 0 ? 'down' : 'up');
      }
    };

    const gameBoard = document.getElementById('game-board');
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
        // Refresh leaderboard
        leaderboardEvents.emit();
      }
    } catch {
      console.error('Failed to submit score');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="game-wrapper">
      {/* Game Board */}
      <div className="game-board-container">
        <div id="game-board" className="game-board">
          {/* Grid background */}
          <div className="board-background">
            {Array(16).fill(null).map((_, i) => (
              <div key={i} className="cell-bg" />
            ))}
          </div>

          {/* Tiles */}
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
                    Try Again
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Game over overlay with score submission */}
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
