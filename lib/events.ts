// Simple event emitter for leaderboard updates
type Listener = () => void;

class LeaderboardEvents {
  private listeners: Set<Listener> = new Set();

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  emit() {
    this.listeners.forEach(listener => listener());
  }
}

export const leaderboardEvents = new LeaderboardEvents();
