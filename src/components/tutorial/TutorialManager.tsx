import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Play, 
  SkipForward, 
  Trophy, 
  Star,
  Zap,
  Shield,
  Target,
  CheckCircle,
  X
} from 'lucide-react';
import InteractiveTutorial from './InteractiveTutorial';

interface TutorialManagerProps {
  isActive: boolean;
  onClose: () => void;
  onTutorialComplete: (achievements: string[], totalPoints: number) => void;
  playerLevel?: number;
  hasPlayedBefore?: boolean;
}

interface TutorialAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  unlocked: boolean;
}

const TutorialManager: React.FC<TutorialManagerProps> = ({
  isActive,
  onClose,
  onTutorialComplete,
  playerLevel = 1,
  hasPlayedBefore = false
}) => {
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialCompleted, setTutorialCompleted] = useState(false);
  const [achievements, setAchievements] = useState<TutorialAchievement[]>([]);
  const [totalTutorialPoints, setTotalTutorialPoints] = useState(0);

  // Initialize tutorial achievements
  useEffect(() => {
    const tutorialAchievements: TutorialAchievement[] = [
      {
        id: 'first_steps',
        title: 'First Steps',
        description: 'Completed the welcome tutorial',
        icon: '👶',
        rarity: 'common',
        points: 100,
        unlocked: false
      },
      {
        id: 'movement_master',
        title: 'Movement Master',
        description: 'Learned all movement controls',
        icon: '🏃',
        rarity: 'common',
        points: 150,
        unlocked: false
      },
      {
        id: 'coin_collector',
        title: 'Coin Collector',
        description: 'Mastered coin and gem collection',
        icon: '🪙',
        rarity: 'rare',
        points: 200,
        unlocked: false
      },
      {
        id: 'obstacle_dodger',
        title: 'Obstacle Dodger',
        description: 'Learned to avoid dangerous obstacles',
        icon: '⚠️',
        rarity: 'rare',
        points: 250,
        unlocked: false
      },
      {
        id: 'powerup_master',
        title: 'Power-Up Master',
        description: 'Discovered all power-up types',
        icon: '⚡',
        rarity: 'epic',
        points: 300,
        unlocked: false
      },
      {
        id: 'ability_expert',
        title: 'Ability Expert',
        description: 'Mastered special abilities',
        icon: '🎯',
        rarity: 'epic',
        points: 400,
        unlocked: false
      },
      {
        id: 'combo_master',
        title: 'Combo Master',
        description: 'Built impressive combos',
        icon: '🔥',
        rarity: 'legendary',
        points: 500,
        unlocked: false
      },
      {
        id: 'minigame_champion',
        title: 'Mini-Game Champion',
        description: 'Completed mini-game tutorial',
        icon: '🎪',
        rarity: 'legendary',
        points: 600,
        unlocked: false
      },
      {
        id: 'tutorial_graduate',
        title: 'Tutorial Graduate',
        description: 'Completed the entire tutorial',
        icon: '🎓',
        rarity: 'legendary' as 'common' | 'rare' | 'epic' | 'legendary',
        points: 1000,
        unlocked: false
      }
    ];

    setAchievements(tutorialAchievements);
  }, []);

  const handleStartTutorial = () => {
    setShowTutorial(true);
  };

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    setTutorialCompleted(true);
    
    // Unlock all achievements
    const unlockedAchievements = achievements.map(achievement => ({
      ...achievement,
      unlocked: true
    }));
    setAchievements(unlockedAchievements);
    
    // Calculate total points
    const totalPoints = unlockedAchievements.reduce((sum, achievement) => sum + achievement.points, 0);
    setTotalTutorialPoints(totalPoints);
    
    // Notify parent component
    const achievementIds = unlockedAchievements.map(a => a.id);
    onTutorialComplete(achievementIds, totalPoints);
  };

  const handleSkipTutorial = () => {
    setShowTutorial(false);
    onClose();
  };

  const getRarityColor = (rarity: TutorialAchievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'text-gray-400';
      case 'rare': return 'text-blue-400';
      case 'epic': return 'text-purple-400';
      case 'legendary': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getRarityBorder = (rarity: TutorialAchievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'border-gray-500';
      case 'rare': return 'border-blue-500';
      case 'epic': return 'border-purple-500';
      case 'legendary': return 'border-yellow-500';
      default: return 'border-gray-500';
    }
  };

  if (!isActive) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-2xl p-8 max-w-4xl w-full mx-4 border-2 border-purple-400 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <BookOpen className="w-10 h-10 text-purple-400" />
                Interactive Tutorial
              </h1>
              <p className="text-gray-300 text-lg">
                {hasPlayedBefore 
                  ? 'Refresh your skills with our comprehensive tutorial'
                  : 'Learn everything you need to know to master Avalanche Rush!'
                }
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-8 h-8" />
            </motion.button>
          </div>

          {/* Tutorial Status */}
          {!showTutorial && !tutorialCompleted && (
            <div className="space-y-6">
              {/* Welcome Section */}
              <div className="bg-black/30 rounded-lg p-6 border border-purple-400/30">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Star className="w-6 h-6 text-yellow-400" />
                  What You'll Learn
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span>Basic movement and controls</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span>Collecting coins and gems</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span>Avoiding obstacles safely</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span>Power-up strategies</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span>Special abilities (Q, E, R)</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span>Building massive combos</span>
                  </div>
                </div>
              </div>

              {/* Rewards Section */}
              <div className="bg-black/30 rounded-lg p-6 border border-yellow-400/30">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  Tutorial Rewards
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-400 mb-2">3,500+</div>
                    <div className="text-gray-300">Total Points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400 mb-2">9</div>
                    <div className="text-gray-300">Achievements</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-2">15-20</div>
                    <div className="text-gray-300">Minutes</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStartTutorial}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all flex items-center gap-3"
                >
                  <Play className="w-6 h-6" />
                  Start Tutorial
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSkipTutorial}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors flex items-center gap-3"
                >
                  <SkipForward className="w-6 h-6" />
                  Skip Tutorial
                </motion.button>
              </div>
            </div>
          )}

          {/* Completion Screen */}
          {tutorialCompleted && (
            <div className="text-center space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="text-6xl mb-4"
              >
                🎉
              </motion.div>
              
              <h2 className="text-3xl font-bold text-white mb-4">
                Tutorial Complete!
              </h2>
              
              <p className="text-gray-300 text-lg mb-6">
                You've mastered all the essential skills for Avalanche Rush!
              </p>

              {/* Achievements Summary */}
              <div className="bg-black/30 rounded-lg p-6 border border-green-400/30">
                <h3 className="text-xl font-bold text-white mb-4">Achievements Unlocked</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {achievements.map((achievement) => (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className={`bg-gray-800 border-2 ${getRarityBorder(achievement.rarity)} rounded-lg p-3 flex items-center gap-3`}
                    >
                      <span className="text-2xl">{achievement.icon}</span>
                      <div className="flex-1">
                        <div className={`font-bold ${getRarityColor(achievement.rarity)}`}>
                          {achievement.title}
                        </div>
                        <div className="text-sm text-gray-400">
                          +{achievement.points} points
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Total Points */}
              <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg p-6">
                <div className="text-4xl font-bold text-white mb-2">
                  +{totalTutorialPoints.toLocaleString()} Points!
                </div>
                <div className="text-yellow-200">
                  Added to your total score
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all"
              >
                Start Playing!
              </motion.button>
            </div>
          )}

          {/* Interactive Tutorial Component */}
          {showTutorial && (
            <InteractiveTutorial
              isActive={showTutorial}
              onComplete={handleTutorialComplete}
              onSkip={handleSkipTutorial}
            />
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TutorialManager;
