'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Gamepad2, Target, Trophy, Sparkles, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface GlobalStats {
  totalGames: number;
  averageScore: number;
  highestScore: number;
  highestTile: number;
  totalWins: number;
  winRate: number;
}

export default function GlobalStats() {
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-panel p-4">
        <div className="h-4 bg-[var(--surface-hover)] rounded w-1/3 mb-3" />
        <div className="grid grid-cols-2 gap-2">
          {Array(6).fill(null).map((_, i) => (
            <div key={i} className="h-14 bg-[var(--surface-hover)] rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const statItems = [
    { icon: Gamepad2, label: 'Games', value: stats.totalGames.toLocaleString(), color: 'text-blue-400' },
    { icon: TrendingUp, label: 'Avg Score', value: stats.averageScore.toLocaleString(), color: 'text-green-400' },
    { icon: Trophy, label: 'High Score', value: stats.highestScore.toLocaleString(), color: 'text-yellow-400' },
    { icon: Sparkles, label: 'Best Tile', value: stats.highestTile.toString(), color: 'text-[var(--accent)]' },
    { icon: Target, label: 'Total Wins', value: stats.totalWins.toString(), color: 'text-emerald-400' },
    { icon: BarChart3, label: 'Win Rate', value: `${stats.winRate}%`, color: 'text-cyan-400' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-4"
    >
      <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2 uppercase tracking-wide">
        <BarChart3 size={16} className="text-[var(--accent)]" />
        Global Stats
      </h2>

      <div className="grid grid-cols-2 gap-2">
        {statItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="bg-[var(--surface-hover)]/50 rounded-lg p-3 flex items-center gap-3 hover:bg-[var(--surface-hover)] transition-smooth"
          >
            <item.icon size={16} className={item.color} />
            <div className="min-w-0">
              <div className="text-sm font-bold text-white tabular-nums truncate">{item.value}</div>
              <div className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wide">{item.label}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
