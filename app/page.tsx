'use client';

import GameBoard from '@/components/GameBoard';
import Leaderboard from '@/components/Leaderboard';
import { useGameStore } from '@/lib/game-store';

export default function Home() {
  const { score, bestScore, initBoard } = useGameStore();

  const handleNewGame = () => {
    initBoard();
  };

  return (
    <div className="page-container">
      {/* Title top left */}
      <h1 className="global-title">2048</h1>

      {/* Score header - absolute top center */}
      <div className="top-score-header">
        <div className="score-box">
          <div className="score-label">Score</div>
          <div className="score-value">{score}</div>
        </div>
        <div className="score-box">
          <div className="score-label">Best</div>
          <div className="score-value">{bestScore}</div>
        </div>
        <button onClick={handleNewGame} className="new-game-btn">
          New Game
        </button>
      </div>

      {/* Game - absolutely centered in page */}
      <div className="game-center">
        <GameBoard />
      </div>

      {/* Leaderboard - fixed right, vertically centered */}
      <div className="leaderboard-fixed">
        <Leaderboard />
      </div>

      {/* Footer */}
      <footer className="game-footer">
        <p>
          Based on <a href="https://play2048.co/" target="_blank" rel="noopener noreferrer">2048 by Gabriele Cirulli</a>
          {' • '}
          Made by Nathan FERRE
        </p>
      </footer>
    </div>
  );
}
