'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Trophy, Gamepad2, Target, TrendingUp } from 'lucide-react';

interface PlayerData {
  exists: boolean;
  player: {
    id: string;
    name: string;
    bestScore: number;
    totalGames: number;
    wins: number;
    winRate: number;
    recentScores: {
      score: number;
      maxTile: number;
      moves: number;
      duration: number;
      won: boolean;
      date: string;
    }[];
  } | null;
}

interface PlayerProfileProps {
  playerName: string;
}

export default function PlayerProfile({ playerName }: PlayerProfileProps) {
  const [data, setData] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (playerName) {
      fetchPlayer();
    }
  }, [playerName]);

  const fetchPlayer = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/player?name=${encodeURIComponent(playerName)}`);
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error('Failed to fetch player:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!playerName) {
    return null;
  }

  if (loading) {
    return (
      <div className="glass-panel p-4">
        <div className="h-4 bg-[var(--surface-hover)] rounded w-1/2 mb-3" />
        <div className="space-y-2">
          <div className="h-12 bg-[var(--surface-hover)] rounded-lg animate-pulse" />
          <div className="h-12 bg-[var(--surface-hover)] rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (!data?.exists || !data.player) {
    return (
      <div className="glass-panel p-4">
        <h2 className="text-sm font-semibold text-white mb-2 flex items-center gap-2 uppercase tracking-wide">
          <User size={16} className="text-[var(--accent)]" />
          {playerName}
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">No games played yet. Start playing!</p>
      </div>
    );
  }

  const { player } = data;

  const stats = [
    { icon: Trophy, label: 'Best', value: player.bestScore.toLocaleString(), color: 'text-yellow-400' },
    { icon: Gamepad2, label: 'Games', value: player.totalGames.toString(), color: 'text-blue-400' },
    { icon: Target, label: 'Wins', value: player.wins.toString(), color: 'text-emerald-400' },
    { icon: TrendingUp, label: 'Rate', value: `${player.winRate}%`, color: 'text-cyan-400' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-4"
    >
      <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2 uppercase tracking-wide">
        <User size={16} className="text-[var(--accent)]" />
        {player.name}
      </h2>

      <div className="grid grid-cols-4 gap-2 mb-3">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-[var(--surface-hover)]/50 rounded-lg p-2 text-center">
            <stat.icon size={14} className={`mx-auto mb-1 ${stat.color}`} />
            <div className="text-sm font-bold text-white tabular-nums">{stat.value}</div>
            <div className="text-[9px] text-[var(--text-secondary)] uppercase">{stat.label}</div>
          </div>
        ))}
      </div>

      {player.recentScores.length > 0 && (
        <div>
          <h3 className="text-[10px] font-semibold text-[var(--text-secondary)] mb-2 uppercase tracking-wide">Recent Games</h3>
          <div className="space-y-1 max-h-28 overflow-y-auto">
            {player.recentScores.slice(0, 5).map((score, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-xs bg-[var(--surface-hover)]/30 rounded-md p-2"
              >
                <span className="text-white font-medium tabular-nums">{score.score.toLocaleString()}</span>
                <span className="text-[var(--text-secondary)]">{score.maxTile}</span>
                {score.won && (
                  <span className="text-[9px] bg-[var(--accent)] text-white px-1.5 py-0.5 rounded font-semibold">
                    2048
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
