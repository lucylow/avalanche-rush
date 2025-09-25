import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReactiveNetwork } from '../../hooks/useReactiveNetwork';

const ReactiveNetworkDashboard: React.FC = () => {
  const {
    isConnected,
    isLoading,
    playerProgress,
    reactiveStats,
    gameStats,
    currentChainId,
    recordGameSession,
    hasAchievement,
    getAchievementRequirements,
    isOnAvalanche,
    isOnReactive,
    getNetworkInfo
  } = useReactiveNetwork();

  const [selectedTab, setSelectedTab] = useState<'overview' | 'achievements' | 'reactive-stats' | 'demo'>('overview');
  const [notifications, setNotifications] = useState<string[]>([]);
  const [demoScore, setDemoScore] = useState('1000');
  const [achievementChecks, setAchievementChecks] = useState<Record<number, boolean>>({});

  const networkInfo = getNetworkInfo();
  const achievements = getAchievementRequirements();

  // Add notification
  const addNotification = (message: string) => {
    setNotifications(prev => [...prev, message]);
    setTimeout(() => {
      setNotifications(prev => prev.slice(1));
    }, 5000);
  };

  // Check achievements on load
  useEffect(() => {
    const checkAchievements = async () => {
      if (!isOnReactive()) return;

      const checks: Record<number, boolean> = {};
      for (const achievement of achievements) {
        checks[achievement.id] = await hasAchievement(achievement.id);
      }
      setAchievementChecks(checks);
    };

    checkAchievements();
  }, [hasAchievement, isOnReactive, achievements]);

  // Demo function to test Reactive workflow
  const testReactiveWorkflow = async () => {
    if (!isOnAvalanche()) {
      addNotification('Please switch to Avalanche C-Chain to test the workflow');
      return;
    }

    const score = parseInt(demoScore);
    const distance = Math.floor(score * 0.8);
    const coins = Math.floor(score * 0.1);
    const obstacles = Math.floor(score * 0.05);

    addNotification('Recording game session on Avalanche...');
    
    const success = await recordGameSession(score, distance, coins, obstacles);
    
    if (success) {
      addNotification('✅ Game session recorded! Reactive contracts will process automatically.');
      addNotification('⚡ Switch to Reactive Network to see automatic achievement processing.');
    } else {
      addNotification('❌ Failed to record game session. Please try again.');
    }
  };

  if (!isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-6"
      >
        <div className="bg-black/80 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full text-center border border-purple-500/30">
          <div className="text-6xl mb-6">⚡</div>
          <h2 className="text-3xl font-bold text-white mb-4">Reactive Network Required</h2>
          <p className="text-purple-200 mb-6">
            Please connect your wallet to access Reactive Network features.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-6xl">⚡</div>
            <div>
              <h1 className="text-4xl font-black text-white">Reactive Network</h1>
              <p className="text-purple-200">Automatic Smart Contract Execution</p>
            </div>
          </div>
          
          {networkInfo && (
            <div className="bg-black/60 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30">
              <div className={`text-sm font-bold text-${networkInfo.color}-400`}>
                {networkInfo.name}
              </div>
              <div className="text-xs text-purple-300">
                {networkInfo.type} Contract • Chain {currentChainId}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Network Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/60 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-purple-500/30"
      >
        <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
          <span className="mr-3">🔗</span>
          Network Status & Explanation
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-red-500/20 rounded-xl">
            <div className="text-3xl mb-2">🏔️</div>
            <div className="font-bold text-red-300">Avalanche C-Chain</div>
            <div className="text-sm text-red-200">Origin Contracts</div>
            <div className="text-xs text-red-100 mt-2">
              Game sessions recorded here trigger Reactive contracts
            </div>
          </div>
          
          <div className="text-center p-4 bg-purple-500/20 rounded-xl">
            <div className="text-3xl mb-2">⚡</div>
            <div className="font-bold text-purple-300">Reactive Network</div>
            <div className="text-sm text-purple-200">Reactive Contracts</div>
            <div className="text-xs text-purple-100 mt-2">
              Automatic achievement processing happens here
            </div>
          </div>
          
          <div className="text-center p-4 bg-green-500/20 rounded-xl">
            <div className="text-3xl mb-2">🔄</div>
            <div className="font-bold text-green-300">Event Flow</div>
            <div className="text-sm text-green-200">Avalanche → Reactive</div>
            <div className="text-xs text-green-100 mt-2">
              Events automatically trigger Reactive processing
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
          <h4 className="font-bold text-blue-300 mb-2">🎯 Why Reactive Contracts are ESSENTIAL:</h4>
          <div className="text-sm text-blue-200 space-y-2">
            <div>• <strong>Traditional:</strong> Players must manually claim achievements and pay gas fees</div>
            <div>• <strong>Reactive:</strong> Achievements are automatically minted when conditions are met</div>
            <div>• <strong>Result:</strong> 10x better UX + 80-90% gas cost reduction</div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Player Progress */}
        {playerProgress && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/60 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <span className="mr-3">👤</span>
              Player Progress
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-purple-200">Total Score:</span>
                <span className="text-white font-bold">{parseFloat(playerProgress.totalScore).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-200">Achievements:</span>
                <span className="text-yellow-400 font-bold">{playerProgress.achievementsUnlocked}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Reactive Stats */}
        {reactiveStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/60 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <span className="mr-3">⚡</span>
              Reactive Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-purple-200">Events Processed:</span>
                <span className="text-green-400 font-bold">{reactiveStats.totalEvents}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-200">Gas Used:</span>
                <span className="text-blue-400 font-bold">{parseFloat(reactiveStats.totalGas).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-200">Avg Gas/Event:</span>
                <span className="text-orange-400 font-bold">{parseFloat(reactiveStats.averageGas).toFixed(2)}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Game Stats */}
        {gameStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/60 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <span className="mr-3">🎮</span>
              Game Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-purple-200">Sessions:</span>
                <span className="text-cyan-400 font-bold">{gameStats.sessionCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-200">Total Score:</span>
                <span className="text-pink-400 font-bold">{parseFloat(gameStats.totalScore).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-200">Average:</span>
                <span className="text-yellow-400 font-bold">{parseFloat(gameStats.averageScore).toLocaleString()}</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Achievements Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/60 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-purple-500/30"
      >
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
          <span className="mr-3">🏆</span>
          Reactive Achievements
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {achievements.map((achievement) => {
            const isUnlocked = achievementChecks[achievement.id];
            const progress = playerProgress ? 
              Math.min((parseFloat(playerProgress.totalScore) / achievement.requiredScore) * 100, 100) : 0;

            return (
              <motion.div
                key={achievement.id}
                whileHover={{ scale: 1.05, y: -5 }}
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                  isUnlocked 
                    ? 'bg-yellow-500/20 border-yellow-500/50 shadow-yellow-500/25 shadow-lg' 
                    : 'bg-gray-500/20 border-gray-500/30'
                }`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">
                    {isUnlocked ? '🏆' : '🔒'}
                  </div>
                  <h4 className="font-bold text-white text-sm mb-2">
                    {achievement.name}
                  </h4>
                  <div className="text-xs text-gray-300 mb-3">
                    {achievement.requiredScore.toLocaleString()} points
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        isUnlocked ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  
                  <div className="text-xs text-gray-400">
                    {isUnlocked ? '✅ Unlocked' : `${progress.toFixed(1)}%`}
                  </div>
                  
                  <div className="text-xs text-purple-300 mt-1">
                    {achievement.reward} ETH reward
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Reactive Workflow Demo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/60 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30"
      >
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
          <span className="mr-3">🧪</span>
          Test Reactive Workflow
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-bold text-purple-300 mb-4">1. Record Game Session (Avalanche)</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Demo Score
                </label>
                <input
                  type="number"
                  value={demoScore}
                  onChange={(e) => setDemoScore(e.target.value)}
                  className="w-full px-4 py-3 bg-black/40 border border-purple-500/30 rounded-lg text-white placeholder-purple-300 focus:border-purple-400 focus:outline-none"
                  placeholder="Enter score"
                />
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={testReactiveWorkflow}
                disabled={isLoading || !demoScore}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all duration-200"
              >
                {isLoading ? 'Processing...' : 'Record Game Session'}
              </motion.button>
              
              <div className="text-sm text-purple-200">
                <p>• This records a session on Avalanche C-Chain</p>
                <p>• Reactive contracts will automatically process achievements</p>
                <p>• No manual claiming required!</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold text-purple-300 mb-4">2. Automatic Processing (Reactive)</h4>
            <div className="space-y-4">
              <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <h5 className="font-bold text-purple-300 mb-2">Workflow Steps:</h5>
                <div className="text-sm text-purple-200 space-y-1">
                  <div>1. 🏔️ Session recorded on Avalanche</div>
                  <div>2. 📡 Event emitted to Reactive Network</div>
                  <div>3. ⚡ Reactive contract processes automatically</div>
                  <div>4. 🏆 Achievements minted (if eligible)</div>
                  <div>5. 💰 Rewards distributed automatically</div>
                </div>
              </div>
              
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <h5 className="font-bold text-green-300 mb-2">Benefits:</h5>
                <div className="text-sm text-green-200 space-y-1">
                  <div>• Zero user interaction required</div>
                  <div>• 80-90% gas cost reduction</div>
                  <div>• Instant reward processing</div>
                  <div>• Fully decentralized automation</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Notifications */}
      <AnimatePresence>
        {notifications.map((notification, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            className="fixed top-6 right-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-xl shadow-2xl border border-purple-400/30 backdrop-blur-sm z-50"
            style={{ marginTop: `${index * 80}px` }}
          >
            <div className="flex items-center space-x-3">
              <div className="text-2xl">⚡</div>
              <div>
                <div className="font-bold">{notification}</div>
                <div className="text-purple-200 text-sm">Reactive Network</div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ReactiveNetworkDashboard;
