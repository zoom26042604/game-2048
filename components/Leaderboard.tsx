'use client';

import { useState, useEffect, useMemo } from 'react';
import { Trophy, Search } from 'lucide-react';
import { leaderboardEvents } from '@/lib/events';

interface LeaderboardEntry {
  rank: number;
  playerName: string;
  score: number;
  maxTile: number;
  moves: number;
  duration: number;
  won: boolean;
  date: string;
}

export default function Leaderboard() {
  const [allEntries, setAllEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  // Subscribe to leaderboard refresh events
  useEffect(() => {
    const handleRefresh = () => {
      fetchLeaderboard();
    };
    const unsubscribeFn = leaderboardEvents.subscribe(handleRefresh);
    return () => {
      unsubscribeFn();
    };
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      // Fetch all scores (best per player only, handled by API)
      const res = await fetch(`/api/leaderboard?limit=1000&bestOnly=true`);
      const json = await res.json();
      setAllEntries(json.leaderboard || []);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter entries based on search query
  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return allEntries;
    const query = searchQuery.toLowerCase();
    return allEntries.filter(entry => 
      entry.playerName.toLowerCase().includes(query)
    );
  }, [allEntries, searchQuery]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  if (loading && allEntries.length === 0) {
    return (
      <div className="leaderboard">
        <div className="leaderboard-header">
          <h2 className="leaderboard-title">
            <Trophy size={20} />
            Leaderboard
          </h2>
        </div>
        <div className="leaderboard-scroll">
          <div className="leaderboard-list">
            {Array(5).fill(null).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '52px' }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="leaderboard">
      <div className="leaderboard-header">
        <h2 className="leaderboard-title">
          <Trophy size={20} />
          Leaderboard
        </h2>
        
        {/* Search input */}
        <div className="leaderboard-search">
          <Search size={16} className="leaderboard-search-icon" />
          <input
            type="text"
            placeholder="Search player..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="leaderboard-search-input"
          />
        </div>
      </div>

      {allEntries.length === 0 ? (
        <div className="leaderboard-empty">
          No scores yet. Be the first to play!
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="leaderboard-no-results">
          No player found matching &quot;{searchQuery}&quot;
        </div>
      ) : (
        <div className="leaderboard-scroll">
          <div className="leaderboard-list">
            {filteredEntries.map((entry) => (
              <div
                key={`${entry.rank}-${entry.playerName}`}
                className={`leaderboard-item ${entry.rank <= 3 ? 'top-3' : ''}`}
              >
                <div className="rank">
                  {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : entry.rank}
                </div>
                
                <div className="player-info">
                  <div className="player-name">
                    {entry.playerName}
                    {entry.won && <span style={{ marginLeft: '6px', fontSize: '10px', color: 'var(--ctp-green)' }}>✓ 2048</span>}
                  </div>
                  <div className="player-details">
                    <span>{entry.moves} moves</span>
                    <span>{formatDuration(entry.duration)}</span>
                  </div>
                </div>

                <div className="player-score">{entry.score.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
