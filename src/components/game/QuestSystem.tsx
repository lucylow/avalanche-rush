import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSmartContracts } from '../../hooks/useSmartContracts';
import { Quest, RaffleInfo } from '../../services/SmartContractService';

interface QuestSystemProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuestSystem: React.FC<QuestSystemProps> = ({ isOpen, onClose }) => {
  const { 
    isConnected, 
    account, 
    getQuest, 
    completeQuest, 
    getCurrentRaffle, 
    enterRaffle,
    getRushBalance 
  } = useSmartContracts();

  const [quests, setQuests] = useState<Quest[]>([]);
  const [raffle, setRaffle] = useState<RaffleInfo | null>(null);
  const [rushBalance, setRushBalance] = useState<string>('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quest types and difficulties
  const QUEST_TYPES = {
    0: { name: 'Tutorial', icon: '📚', color: 'from-green-500 to-emerald-500' },
    1: { name: 'Speed Run', icon: '⚡', color: 'from-yellow-500 to-orange-500' },
    2: { name: 'Survival', icon: '🛡️', color: 'from-blue-500 to-cyan-500' },
    3: { name: 'Challenge', icon: '🎯', color: 'from-purple-500 to-violet-500' },
    4: { name: 'Learning', icon: '🧠', color: 'from-pink-500 to-rose-500' }
  };

  const DIFFICULTIES = {
    0: { name: 'Beginner', color: 'text-green-400' },
    1: { name: 'Intermediate', color: 'text-yellow-400' },
    2: { name: 'Advanced', color: 'text-orange-400' },
    3: { name: 'Expert', color: 'text-red-400' }
  };

  // Load quests and raffle data
  const loadQuestData = useCallback(async () => {
    if (!isConnected) return;

    setLoading(true);
    setError(null);

    try {
      // Load sample quests (in a real app, these would come from the contract)
      const sampleQuests: Quest[] = [
        {
          id: 1,
          type: 0,
          difficulty: 0,
          creator: '0x0000000000000000000000000000000000000000',
          reward: 100,
          duration: 3600,
          maxParticipants: 1000,
          isActive: true,
          startTime: Date.now() / 1000,
          endTime: Date.now() / 1000 + 86400,
          description: 'Complete your first game session and earn your first RUSH tokens!'
        },
        {
          id: 2,
          type: 1,
          difficulty: 1,
          creator: '0x0000000000000000000000000000000000000000',
          reward: 250,
          duration: 1800,
          maxParticipants: 500,
          isActive: true,
          startTime: Date.now() / 1000,
          endTime: Date.now() / 1000 + 86400,
          description: 'Achieve a high score in Speed Run mode within 30 minutes!'
        },
        {
          id: 3,
          type: 2,
          difficulty: 2,
          creator: '0x0000000000000000000000000000000000000000',
          reward: 500,
          duration: 3600,
          maxParticipants: 200,
          isActive: true,
          startTime: Date.now() / 1000,
          endTime: Date.now() / 1000 + 86400,
          description: 'Survive for 10 minutes in Survival mode without losing all lives!'
        }
      ];

      setQuests(sampleQuests);

      // Load current raffle
      const currentRaffle = await getCurrentRaffle();
      setRaffle(currentRaffle);

      // Load RUSH balance
      if (account) {
        const balance = await getRushBalance(account);
        setRushBalance(balance);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quest data');
    } finally {
      setLoading(false);
    }
  }, [isConnected, account, getCurrentRaffle, getRushBalance]);

  // Complete quest
  const handleCompleteQuest = useCallback(async (questId: number) => {
    if (!isConnected) return;

    setLoading(true);
    try {
      await completeQuest(questId);
      // Refresh quest data
      await loadQuestData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete quest');
    } finally {
      setLoading(false);
    }
  }, [isConnected, completeQuest, loadQuestData]);

  // Enter raffle
  const handleEnterRaffle = useCallback(async (tickets: number) => {
    if (!isConnected || !raffle) return;

    setLoading(true);
    try {
      await enterRaffle(tickets);
      // Refresh raffle data
      await loadQuestData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enter raffle');
    } finally {
      setLoading(false);
    }
  }, [isConnected, raffle, enterRaffle, loadQuestData]);

  // Load data when component opens
  useEffect(() => {
    if (isOpen && isConnected) {
      loadQuestData();
    }
  }, [isOpen, isConnected, loadQuestData]);

  if (!isOpen) return null;

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
        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl border border-white/10 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl">
              <span className="text-2xl">⚔️</span>
            </div>
            <div>
              <h2 className="text-3xl font-black text-white">
                Quest System
              </h2>
              <p className="text-white/70">Complete quests and earn rewards</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors"
          >
            <span className="text-white text-xl">×</span>
          </button>
        </div>

        {/* Balance Display */}
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl p-4 mb-6 border border-yellow-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-sm font-bold">💎</span>
              </div>
              <div>
                <div className="text-white font-bold text-lg">{rushBalance} RUSH</div>
                <div className="text-white/70 text-sm">Available Balance</div>
              </div>
            </div>
            {raffle && (
              <div className="text-right">
                <div className="text-white font-bold">{raffle.totalTickets} Tickets</div>
                <div className="text-white/70 text-sm">Current Raffle</div>
              </div>
            )}
          </div>
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
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            <span className="text-white ml-3">Loading...</span>
          </div>
        )}

        {/* Quests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <AnimatePresence>
            {quests.map((quest, index) => {
              const questType = QUEST_TYPES[quest.type as keyof typeof QUEST_TYPES];
              const difficulty = DIFFICULTIES[quest.difficulty as keyof typeof DIFFICULTIES];
              
              return (
                <motion.div
                  key={quest.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 relative overflow-hidden group"
                >
                  {/* Quest Type Badge */}
                  <div className={`absolute top-4 right-4 w-12 h-12 bg-gradient-to-br ${questType.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <span className="text-xl">{questType.icon}</span>
                  </div>

                  {/* Quest Info */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-white mb-2">
                      {questType.name} Quest #{quest.id}
                    </h3>
                    <p className="text-white/70 text-sm leading-relaxed">
                      {quest.description}
                    </p>
                  </div>

                  {/* Quest Stats */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white/70 text-sm">Difficulty</span>
                      <span className={`text-sm font-medium ${difficulty.color}`}>
                        {difficulty.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70 text-sm">Reward</span>
                      <span className="text-yellow-400 font-bold">{quest.reward} RUSH</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70 text-sm">Duration</span>
                      <span className="text-white font-medium">
                        {Math.floor(quest.duration / 60)} min
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70 text-sm">Max Participants</span>
                      <span className="text-white font-medium">{quest.maxParticipants}</span>
                    </div>
                  </div>

                  {/* Complete Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleCompleteQuest(quest.id)}
                    disabled={loading || !quest.isActive}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {quest.isActive ? 'Complete Quest' : 'Quest Inactive'}
                  </motion.button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Raffle Section */}
        {raffle && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-purple-500/30"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <span className="text-xl">🎫</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Current Raffle</h3>
                <p className="text-white/70">Enter for a chance to win rare NFTs!</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-white/70 text-sm">Prize Pool</div>
                <div className="text-white font-bold text-lg">{raffle.prize} RUSH</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-white/70 text-sm">Ticket Price</div>
                <div className="text-white font-bold text-lg">{raffle.ticketPrice} RUSH</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-white/70 text-sm">Ends In</div>
                <div className="text-white font-bold text-lg">
                  {Math.max(0, Math.floor((raffle.endTime * 1000 - Date.now()) / 1000 / 3600))}h
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleEnterRaffle(1)}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buy 1 Ticket
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleEnterRaffle(5)}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buy 5 Tickets
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Not Connected State */}
        {!isConnected && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔗</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Wallet Not Connected</h3>
            <p className="text-white/70 mb-6">Connect your wallet to participate in quests and earn rewards</p>
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

export default QuestSystem;
