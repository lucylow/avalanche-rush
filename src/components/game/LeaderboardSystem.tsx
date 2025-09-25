import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSmartContracts } from '../../hooks/useSmartContracts';

interface LeaderboardSystemProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LeaderboardEntry {
  address: string;
  score: number;
  level: number;
  rank: number;
}

const LeaderboardSystem: React.FC<LeaderboardSystemProps> = ({ isOpen, onClose }) => {
  const { isConnected, getLeaderboard } = useSmartContracts();

  const [leaderboards, setLeaderboards] = useState<{
    [key: string]: LeaderboardEntry[];
  }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<number>(0);

  // Game modes
  const GAME_MODES = {
    0: { name: 'Classic', icon: '🏃', color: 'from-blue-500 to-cyan-500' },
    1: { name: 'Speed Run', icon: '⚡', color: 'from-yellow-500 to-orange-500' },
    2: { name: 'Survival', icon: '🛡️', color: 'from-green-500 to-emerald-500' },
    3: { name: 'Challenge', icon: '🎯', color: 'from-purple-500 to-violet-500' },
    4: { name: 'Quest', icon: '⚔️', color: 'from-red-500 to-pink-500' }
  };

  // Load leaderboard data
  const loadLeaderboard = useCallback(async (mode: number) => {
    if (!isConnected) return;

    setLoading(true);
    setError(null);

    try {
      const entries = await getLeaderboard(mode, 50);
      const rankedEntries = entries.map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));

      setLeaderboards(prev => ({
        ...prev,
        [mode]: rankedEntries
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  }, [isConnected, getLeaderboard]);

  // Load all leaderboards
  const loadAllLeaderboards = useCallback(async () => {
    if (!isConnected) return;

    setLoading(true);
    setError(null);

    try {
      const promises = Object.keys(GAME_MODES).map(mode => 
        loadLeaderboard(parseInt(mode))
      );
      await Promise.all(promises);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leaderboards');
    } finally {
      setLoading(false);
    }
  }, [isConnected, loadLeaderboard, GAME_MODES]);

  // Format address
  const formatAddress = (address: string): string => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Get rank badge
  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return { icon: '🥇', color: 'from-yellow-400 to-yellow-600' };
    } else if (rank === 2) {
      return { icon: '🥈', color: 'from-gray-300 to-gray-500' };
    } else if (rank === 3) {
      return { icon: '🥉', color: 'from-orange-400 to-orange-600' };
    } else {
      return { icon: `#${rank}`, color: 'from-slate-500 to-slate-700' };
    }
  };

  // Load data when component opens
  useEffect(() => {
    if (isOpen && isConnected) {
      loadAllLeaderboards();
    }
  }, [isOpen, isConnected, loadAllLeaderboards]);

  // Load specific leaderboard when mode changes
  useEffect(() => {
    if (isOpen && isConnected && !leaderboards[selectedMode]) {
      loadLeaderboard(selectedMode);
    }
  }, [isOpen, isConnected, selectedMode, leaderboards, loadLeaderboard]);

  if (!isOpen) return null;

  const currentLeaderboard = leaderboards[selectedMode] || [];
  const selectedModeConfig = GAME_MODES[selectedMode as keyof typeof GAME_MODES];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl border border-white/10 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl">
              <span className="text-2xl">🏆</span>
            </div>
            <div>
              <h2 className="text-3xl font-black text-white">
                Leaderboard
              </h2>
              <p className="text-white/70">Top players across all game modes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors"
          >
            <span className="text-white text-xl">×</span>
          </button>
        </div>

        {/* Game Mode Selector */}
        <div className="flex flex-wrap gap-3 mb-8">
          {Object.entries(GAME_MODES).map(([mode, config]) => (
            <motion.button
              key={mode}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedMode(parseInt(mode))}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 ${
                selectedMode === parseInt(mode)
                  ? `bg-gradient-to-r ${config.color} text-white shadow-lg`
                  : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
              }`}
            >
              <span>{config.icon}</span>
              <span>{config.name}</span>
            </motion.button>
          ))}
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6"
          >
            <div className="flex items-center space-x-3">
              <span className="text-red-400 text-xl">⚠️</span>
              <span className="text-white font-medium">{error}</span>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            <span className="text-white ml-3">Loading leaderboard...</span>
          </div>
        )}

        {/* Leaderboard Content */}
        {!loading && (
          <div className="space-y-4">
            {/* Mode Header */}
            <div className={`bg-gradient-to-r ${selectedModeConfig.color} rounded-2xl p-6 mb-6`}>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">{selectedModeConfig.icon}</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {selectedModeConfig.name} Leaderboard
                  </h3>
                  <p className="text-white/80">
                    {currentLeaderboard.length} players
                  </p>
                </div>
              </div>
            </div>

            {/* Leaderboard Entries */}
            <AnimatePresence>
              {currentLeaderboard.length > 0 ? (
                <div className="space-y-3">
                  {currentLeaderboard.map((entry, index) => {
                    const rankBadge = getRankBadge(entry.rank);
                    
                    return (
                      <motion.div
                        key={`${entry.address}-${entry.score}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        className={`bg-gradient-to-r ${
                          entry.rank <= 3 
                            ? 'from-white/20 to-white/10 border border-white/30' 
                            : 'from-white/10 to-white/5 border border-white/20'
                        } rounded-2xl p-4 flex items-center space-x-4 hover:scale-[1.02] transition-all duration-300`}
                      >
                        {/* Rank Badge */}
                        <div className={`w-12 h-12 bg-gradient-to-br ${rankBadge.color} rounded-xl flex items-center justify-center font-bold text-white shadow-lg`}>
                          {entry.rank <= 3 ? rankBadge.icon : `#${entry.rank}`}
                        </div>

                        {/* Player Info */}
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-white">
                                {formatAddress(entry.address).slice(0, 2).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="text-white font-bold">
                                {formatAddress(entry.address)}
                              </div>
                              <div className="text-white/70 text-sm">
                                Level {entry.level}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Score */}
                        <div className="text-right">
                          <div className="text-white font-bold text-lg">
                            {entry.score.toLocaleString()}
                          </div>
                          <div className="text-white/70 text-sm">
                            points
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">📊</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No Data Available</h3>
                  <p className="text-white/70">
                    No players found for {selectedModeConfig.name} mode yet
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Not Connected State */}
        {!isConnected && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔗</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Wallet Not Connected</h3>
            <p className="text-white/70 mb-6">Connect your wallet to view leaderboards</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300"
            >
              Connect Wallet
            </motion.button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default LeaderboardSystem;
