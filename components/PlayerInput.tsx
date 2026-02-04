'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, LogIn, Edit2 } from 'lucide-react';
import { useGameStore } from '@/lib/game-store';

interface PlayerInputProps {
  onSubmit?: (name: string) => void;
}

export default function PlayerInput({ onSubmit }: PlayerInputProps) {
  const { playerName, setPlayerName } = useGameStore();
  const [inputValue, setInputValue] = useState(playerName);
  const [isEditing, setIsEditing] = useState(!playerName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = inputValue.trim();
    if (trimmedName) {
      setPlayerName(trimmedName);
      setIsEditing(false);
      onSubmit?.(trimmedName);
    }
  };

  if (playerName && !isEditing) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 bg-[var(--surface-hover)] rounded-lg px-3 py-1.5"
      >
        <User size={14} className="text-[var(--accent)]" />
        <span className="font-medium text-white text-sm">{playerName}</span>
        <button
          onClick={() => setIsEditing(true)}
          className="text-[var(--text-secondary)] hover:text-white ml-1 transition-smooth"
        >
          <Edit2 size={12} />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="flex items-center gap-2"
    >
      <div className="relative">
        <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Your name"
          maxLength={20}
          className="pl-9 pr-3 py-1.5 bg-[var(--surface-hover)] border border-[var(--border)] rounded-lg text-white text-sm placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)] transition-smooth w-36"
        />
      </div>
      <button
        type="submit"
        disabled={!inputValue.trim()}
        className="btn-primary flex items-center gap-1.5 text-sm py-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <LogIn size={14} />
        Play
      </button>
    </motion.form>
  );
}
