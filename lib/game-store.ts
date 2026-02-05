import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Board = number[][];

interface GameState {
  board: Board;
  score: number;
  bestScore: number;
  moves: number;
  gameOver: boolean;
  hasWon: boolean;
  continueAfterWin: boolean;
  startTime: number | null;
  playerName: string;
  animating: boolean;
  
  // Actions
  initBoard: () => void;
  move: (direction: 'left' | 'right' | 'up' | 'down') => void;
  setPlayerName: (name: string) => void;
  setAnimating: (value: boolean) => void;
  setContinueAfterWin: () => void;
  getGameDuration: () => number;
}

const createEmptyBoard = (): Board => {
  return Array(4).fill(null).map(() => Array(4).fill(0));
};

const addRandomTile = (board: Board): Board => {
  const newBoard = board.map(row => [...row]);
  const emptyCells: [number, number][] = [];
  
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (newBoard[i][j] === 0) emptyCells.push([i, j]);
    }
  }
  
  if (emptyCells.length > 0) {
    const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    newBoard[row][col] = Math.random() < 0.9 ? 2 : 4;
  }
  
  return newBoard;
};

const moveLeft = (board: Board): [Board, number] => {
  let earnedScore = 0;
  const newBoard = board.map(row => {
    const filtered = row.filter(x => x !== 0);
    const merged: number[] = [];
    let skip = false;
    
    for (let i = 0; i < filtered.length; i++) {
      if (skip) {
        skip = false;
        continue;
      }
      if (filtered[i] === filtered[i + 1]) {
        merged.push(filtered[i] * 2);
        earnedScore += filtered[i] * 2;
        skip = true;
      } else {
        merged.push(filtered[i]);
      }
    }
    
    while (merged.length < 4) merged.push(0);
    return merged;
  });
  
  return [newBoard, earnedScore];
};

const rotateBoard = (board: Board): Board => {
  return board[0].map((_, i) => board.map(row => row[i]).reverse());
};

const isGameOver = (board: Board): boolean => {
  // Check for empty cells
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (board[i][j] === 0) return false;
    }
  }
  
  // Check for possible merges
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const current = board[i][j];
      if (j < 3 && board[i][j + 1] === current) return false;
      if (i < 3 && board[i + 1][j] === current) return false;
    }
  }
  
  return true;
};

const getMaxTile = (board: Board): number => {
  return Math.max(...board.flat());
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      board: createEmptyBoard(),
      score: 0,
      bestScore: 0,
      moves: 0,
      gameOver: false,
      hasWon: false,
      continueAfterWin: false,
      startTime: null,
      playerName: '',
      animating: false,

      initBoard: () => {
        const { bestScore } = get();
        let newBoard = createEmptyBoard();
        newBoard = addRandomTile(newBoard);
        newBoard = addRandomTile(newBoard);
        
        set({
          board: newBoard,
          score: 0,
          bestScore: bestScore, // Explicitly preserve bestScore
          moves: 0,
          gameOver: false,
          hasWon: false,
          continueAfterWin: false,
          startTime: Date.now(),
        });
      },

      move: (direction: 'left' | 'right' | 'up' | 'down') => {
        const { board, score, bestScore, moves, gameOver, hasWon, continueAfterWin, animating } = get();
        
        if (gameOver || animating || (hasWon && !continueAfterWin)) return;

        let newBoard = board.map(row => [...row]);

        // Rotate board to make all moves work like left
        if (direction === 'right') {
          newBoard = rotateBoard(rotateBoard(newBoard));
        } else if (direction === 'up') {
          newBoard = rotateBoard(rotateBoard(rotateBoard(newBoard)));
        } else if (direction === 'down') {
          newBoard = rotateBoard(newBoard);
        }

        const [movedBoard, earnedScore] = moveLeft(newBoard);

        // Rotate back
        if (direction === 'right') {
          newBoard = rotateBoard(rotateBoard(movedBoard));
        } else if (direction === 'up') {
          newBoard = rotateBoard(movedBoard);
        } else if (direction === 'down') {
          newBoard = rotateBoard(rotateBoard(rotateBoard(movedBoard)));
        } else {
          newBoard = movedBoard;
        }

        // Check if board changed
        const hasChanged = JSON.stringify(board) !== JSON.stringify(newBoard);

        if (hasChanged) {
          newBoard = addRandomTile(newBoard);
          const newScore = score + earnedScore;
          const newBestScore = Math.max(bestScore, newScore);
          const maxTile = getMaxTile(newBoard);
          const won = maxTile >= 2048 && !hasWon;
          const over = isGameOver(newBoard);

          set({
            board: newBoard,
            score: newScore,
            bestScore: newBestScore,
            moves: moves + 1,
            gameOver: over,
            hasWon: hasWon || won,
            animating: true,
          });

          setTimeout(() => set({ animating: false }), 100);
        }
      },

      setPlayerName: (name: string) => set({ playerName: name }),
      
      setAnimating: (value: boolean) => set({ animating: value }),
      
      setContinueAfterWin: () => set({ continueAfterWin: true }),
      
      getGameDuration: () => {
        const { startTime } = get();
        if (!startTime) return 0;
        return Math.floor((Date.now() - startTime) / 1000);
      },
    }),
    {
      name: 'game-2048-storage',
      partialize: (state) => ({
        bestScore: state.bestScore,
        playerName: state.playerName,
      }),
    }
  )
);
