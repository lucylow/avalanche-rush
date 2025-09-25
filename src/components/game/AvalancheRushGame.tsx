import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameEngine from './GameEngine';
import EnhancedWalletConnector from './EnhancedWalletConnector';
import RewardPsychologyEngine from './RewardPsychologyEngine';
import { useAdvancedWeb3 } from '../../hooks/useAdvancedWeb3';

interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  gameMode: 'classic' | 'tutorial' | 'challenge' | 'quest' | 'speedrun' | 'survival';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  currentLevel: number;
  score: number;
  highScore: number;
  lives: number;
  energy: number;
  sessionId: number | null;
  achievements: string[];
  skillPoints: {
    speed: number;
    accuracy: number;
    endurance: number;
    strategy: number;
  };
  dailyStreak: number;
  totalGamesPlayed: number;
}

interface PlayerProfile {
  address: string;
  level: number;
  experience: number;
  totalScore: number;
  gamesWon: number;
  achievements: string[];
  nftCount: number;
  rushBalance: string;
  lastLoginDate: string;
  streakCount: number;
}

const AvalancheRushGame: React.FC = () => {
  const {
    isConnected,
    account,
    chainId,
    startGameSession,
    completeGameSession,
    getPlayerProfile,
    getRushBalance,
    getPlayerNFTs
  } = useAdvancedWeb3();

  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    isPaused: false,
    gameMode: 'classic',
    difficulty: 'beginner',
    currentLevel: 1,
    score: 0,
    highScore: 0,
    lives: 3,
    energy: 100,
    sessionId: null,
    achievements: [],
    skillPoints: { speed: 0, accuracy: 0, endurance: 0, strategy: 0 },
    dailyStreak: 0,
    totalGamesPlayed: 0
  });

  const [playerProfile, setPlayerProfile] = useState<PlayerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showGameModeSelector, setShowGameModeSelector] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showCharacterSelection, setShowCharacterSelection] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<any>(null);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [notifications, setNotifications] = useState<string[]>([]);

  const gameEngineRef = useRef<any>(null);
  const animationFrameRef = useRef<number>();

  // Load player profile when wallet connects
  useEffect(() => {
    if (isConnected && account) {
      loadPlayerProfile();
    }
  }, [isConnected, account]);

  const loadPlayerProfile = async () => {
    if (!account) return;
    
    try {
      setIsLoading(true);
      const [profile, balance, nfts] = await Promise.all([
        getPlayerProfile(account),
        getRushBalance(account),
        getPlayerNFTs(account)
      ]);

      setPlayerProfile({
        address: account,
        level: profile?.level || 1,
        experience: profile?.experience || 0,
        totalScore: profile?.totalScore || 0,
        gamesWon: profile?.gamesWon || 0,
        achievements: profile?.achievements || [],
        nftCount: nfts.length,
        rushBalance: balance,
        lastLoginDate: new Date().toISOString(),
        streakCount: profile?.streakDays || 0
      });

      // Update game state with profile data
      setGameState(prev => ({
        ...prev,
        highScore: profile?.highestScore || 0,
        achievements: profile?.achievements || [],
        dailyStreak: profile?.streakDays || 0,
        totalGamesPlayed: profile?.totalGamesPlayed || 0
      }));

      // Trigger daily login reward
      if ((window as any).triggerReward) {
        (window as any).triggerReward('dailyLogin', { streak: profile?.streakDays || 1 });
      }

    } catch (error) {
      console.error('Failed to load player profile:', error);
      addNotification('Failed to load player profile');
    } finally {
      setIsLoading(false);
    }
  };

  const addNotification = (message: string) => {
    setNotifications(prev => [...prev, message]);
    setTimeout(() => {
      setNotifications(prev => prev.slice(1));
    }, 5000);
  };

  const handleCharacterSelect = (character: any) => {
    setSelectedCharacter(character);
    addNotification(`Selected ${character.name} as your game character!`);
  };

  const openCharacterSelection = () => {
    setShowCharacterSelection(true);
  };

  const startGame = async (mode: GameState['gameMode'], difficulty: GameState['difficulty']) => {
    if (!isConnected) {
      addNotification('Please connect your wallet to play');
      return;
    }

    try {
      setIsLoading(true);
      
      // Start blockchain game session
      const sessionId = await startGameSession(
        ['classic', 'tutorial', 'challenge', 'quest', 'speedrun', 'survival'].indexOf(mode),
        ['beginner', 'intermediate', 'advanced', 'expert'].indexOf(difficulty),
        gameState.currentLevel
      );

      setGameState(prev => ({
        ...prev,
        isPlaying: true,
        isPaused: false,
        gameMode: mode,
        difficulty,
        sessionId,
        score: 0,
        lives: 3,
        energy: 100
      }));

      setGameStartTime(Date.now());
      setShowGameModeSelector(false);

      // Trigger game start reward
      if ((window as any).triggerReward) {
        (window as any).triggerReward('gameStart');
      }

      addNotification(`${mode.toUpperCase()} mode started!`);

    } catch (error) {
      console.error('Failed to start game:', error);
      addNotification('Failed to start game session');
    } finally {
      setIsLoading(false);
    }
  };

  const endGame = async (finalScore: number, achievements: string[] = []) => {
    if (!gameState.sessionId) return;

    try {
      setIsLoading(true);
      
      const sessionDuration = Math.floor((Date.now() - gameStartTime) / 1000);
      const skillPointsEarned = calculateSkillPoints(finalScore, sessionDuration, gameState.difficulty);

      // Complete blockchain game session
      await completeGameSession(
        gameState.sessionId,
        finalScore,
        achievements,
        Object.values(skillPointsEarned),
        Object.keys(skillPointsEarned)
      );

      // Update local state
      setGameState(prev => ({
        ...prev,
        isPlaying: false,
        isPaused: false,
        sessionId: null,
        highScore: Math.max(prev.highScore, finalScore),
        achievements: [...new Set([...prev.achievements, ...achievements])],
        skillPoints: {
          speed: prev.skillPoints.speed + skillPointsEarned.speed,
          accuracy: prev.skillPoints.accuracy + skillPointsEarned.accuracy,
          endurance: prev.skillPoints.endurance + skillPointsEarned.endurance,
          strategy: prev.skillPoints.strategy + skillPointsEarned.strategy
        },
        totalGamesPlayed: prev.totalGamesPlayed + 1
      }));

      // Trigger completion rewards
      if ((window as any).triggerReward) {
        if (finalScore > gameState.highScore) {
          (window as any).triggerReward('highScoreBeat', { score: finalScore });
        }
        
        achievements.forEach(achievement => {
          (window as any).triggerReward('questComplete', { achievement });
        });

        if (finalScore >= 1000) {
          (window as any).triggerReward('100Points');
        }
      }

      addNotification(`Game completed! Score: ${finalScore}`);
      
      // Reload profile to get updated stats
      setTimeout(() => loadPlayerProfile(), 2000);

    } catch (error) {
      console.error('Failed to complete game:', error);
      addNotification('Failed to save game results');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateSkillPoints = (score: number, duration: number, difficulty: string) => {
    const difficultyMultiplier = {
      beginner: 1,
      intermediate: 1.5,
      advanced: 2,
      expert: 3
    }[difficulty] || 1;

    const basePoints = Math.floor(score / 100);
    
    return {
      speed: Math.floor((basePoints * 0.3) * difficultyMultiplier),
      accuracy: Math.floor((basePoints * 0.25) * difficultyMultiplier),
      endurance: Math.floor((duration / 60) * difficultyMultiplier),
      strategy: Math.floor((basePoints * 0.2) * difficultyMultiplier)
    };
  };

  const pauseGame = () => {
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const quitGame = () => {
    if (gameState.sessionId) {
      endGame(gameState.score);
    } else {
      setGameState(prev => ({ ...prev, isPlaying: false, isPaused: false }));
    }
  };

  const GameModeSelector = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={() => setShowGameModeSelector(false)}
    >
      <motion.div
        className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Choose Game Mode
        </h2>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[
            { mode: 'classic', title: 'Classic', desc: 'Traditional endless runner', icon: '🏃' },
            { mode: 'tutorial', title: 'Tutorial', desc: 'Learn the basics', icon: '📚' },
            { mode: 'challenge', title: 'Challenge', desc: 'Special objectives', icon: '🎯' },
            { mode: 'quest', title: 'Quest', desc: 'Blockchain quests', icon: '⚔️' },
            { mode: 'speedrun', title: 'Speed Run', desc: 'Race against time', icon: '⚡' },
            { mode: 'survival', title: 'Survival', desc: 'Last as long as possible', icon: '🛡️' }
          ].map(({ mode, title, desc, icon }) => (
            <button
              key={mode}
              onClick={() => startGame(mode as GameState['gameMode'], 'beginner')}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left"
            >
              <div className="text-2xl mb-2">{icon}</div>
              <h3 className="font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600">{desc}</p>
            </button>
          ))}
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-3">Difficulty Level</h3>
          <div className="flex space-x-2">
            {['beginner', 'intermediate', 'advanced', 'expert'].map((diff) => (
              <button
                key={diff}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 capitalize"
              >
                {diff}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  const GameHUD = () => (
    <div className="fixed top-4 left-4 right-4 z-40 pointer-events-none">
      <div className="flex justify-between items-start">
        {/* Enhanced Score Panel */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-br from-black/80 to-purple-900/80 backdrop-blur-md text-white p-6 rounded-2xl pointer-events-auto border border-purple-500/30 shadow-2xl"
        >
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-yellow-400 text-lg">🎯</span>
              <div>
                <div className="text-xs text-gray-300">Score</div>
                <div className="font-black text-xl text-yellow-400">{gameState.score.toLocaleString()}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-400 text-lg">🏆</span>
              <div>
                <div className="text-xs text-gray-300">Best</div>
                <div className="font-black text-xl text-green-400">{gameState.highScore.toLocaleString()}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-blue-400 text-lg">📊</span>
              <div>
                <div className="text-xs text-gray-300">Level</div>
                <div className="font-black text-xl text-blue-400">{gameState.currentLevel}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-red-400 text-lg">❤️</span>
              <div>
                <div className="text-xs text-gray-300">Lives</div>
                <div className="text-lg">{'❤️'.repeat(gameState.lives)}</div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Energy Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-300 mb-1">
              <span className="flex items-center">
                <span className="mr-1">⚡</span>Energy
              </span>
              <span className="font-bold">{gameState.energy}%</span>
            </div>
            <div className="relative">
              <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
                <motion.div 
                  className="bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 h-3 rounded-full shadow-lg"
                  style={{ width: `${gameState.energy}%` }}
                  animate={{ 
                    boxShadow: gameState.energy > 80 ? "0 0 15px #4ade80" : 
                               gameState.energy > 50 ? "0 0 15px #fbbf24" : "0 0 15px #ef4444"
                  }}
                />
              </div>
              {gameState.energy < 30 && (
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute inset-0 bg-red-500/20 rounded-full"
                />
              )}
            </div>
          </div>
        </motion.div>

        {/* Enhanced Game Info Panel */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-bl from-black/80 to-blue-900/80 backdrop-blur-md text-white p-6 rounded-2xl pointer-events-auto border border-blue-500/30 shadow-2xl"
        >
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-purple-300">Mode:</span>
              <span className="capitalize text-purple-400 font-bold px-2 py-1 bg-purple-500/20 rounded-full">
                {gameState.gameMode}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-orange-300">Difficulty:</span>
              <span className="capitalize text-orange-400 font-bold px-2 py-1 bg-orange-500/20 rounded-full">
                {gameState.difficulty}
              </span>
            </div>
            {playerProfile && (
              <div className="flex items-center justify-between">
                <span className="text-yellow-300">RUSH:</span>
                <span className="text-yellow-400 font-bold px-2 py-1 bg-yellow-500/20 rounded-full">
                  {parseFloat(playerProfile.rushBalance).toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Enhanced Game Controls */}
      {gameState.isPlaying && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mt-6"
        >
          <div className="bg-gradient-to-r from-black/80 to-gray-900/80 backdrop-blur-md text-white p-4 rounded-2xl pointer-events-auto border border-gray-500/30 shadow-2xl">
            <div className="flex space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={pauseGame}
                className={`px-6 py-3 rounded-xl font-bold transition-all duration-200 flex items-center space-x-2 ${
                  gameState.isPaused 
                    ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-green-500/25' 
                    : 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 shadow-yellow-500/25'
                } shadow-lg`}
              >
                <span className="text-xl">{gameState.isPaused ? '▶️' : '⏸️'}</span>
                <span>{gameState.isPaused ? 'Resume' : 'Pause'}</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={quitGame}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl font-bold transition-all duration-200 flex items-center space-x-2 shadow-lg shadow-red-500/25"
              >
                <span className="text-xl">🚪</span>
                <span>Quit</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );

  const MainMenu = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-4xl font-bold text-white">🏔️ Avalanche Rush</h1>
          <div className="text-sm text-white/70">
            Learn • Play • Earn
          </div>
        </div>
        <EnhancedWalletConnector />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full">
          {/* Player Profile Card */}
          {playerProfile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8 border border-white/20"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{playerProfile.level}</div>
                  <div className="text-white/70">Level</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400">{playerProfile.rushBalance}</div>
                  <div className="text-white/70">RUSH Tokens</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">{playerProfile.nftCount}</div>
                  <div className="text-white/70">NFT Achievements</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowGameModeSelector(true)}
              disabled={!isConnected || isLoading}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-6 px-6 rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-3xl mb-2">🎮</div>
              <div>Play Game</div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowLeaderboard(true)}
              className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white font-bold py-6 px-6 rounded-xl shadow-lg transition-all duration-200"
            >
              <div className="text-3xl mb-2">🏆</div>
              <div>Leaderboard</div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAchievements(true)}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-6 px-6 rounded-xl shadow-lg transition-all duration-200"
            >
              <div className="text-3xl mb-2">🏅</div>
              <div>Achievements</div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openCharacterSelection}
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold py-6 px-6 rounded-xl shadow-lg transition-all duration-200"
            >
              <div className="text-3xl mb-2">👤</div>
              <div>Characters</div>
              {selectedCharacter && (
                <div className="text-xs mt-1 opacity-75">
                  {selectedCharacter.name}
                </div>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.open('https://docs.avalanche-rush.com', '_blank')}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-6 px-6 rounded-xl shadow-lg transition-all duration-200"
            >
              <div className="text-3xl mb-2">📚</div>
              <div>Learn Web3</div>
            </motion.button>
          </div>

          {/* Game Stats */}
          {playerProfile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20">
                <div className="text-2xl font-bold text-white">{playerProfile.totalScore.toLocaleString()}</div>
                <div className="text-white/70 text-sm">Total Score</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20">
                <div className="text-2xl font-bold text-white">{playerProfile.gamesWon}</div>
                <div className="text-white/70 text-sm">Games Won</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20">
                <div className="text-2xl font-bold text-white">{playerProfile.streakCount}</div>
                <div className="text-white/70 text-sm">Daily Streak</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20">
                <div className="text-2xl font-bold text-white">{playerProfile.achievements.length}</div>
                <div className="text-white/70 text-sm">Achievements</div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 text-center text-white/50 text-sm">
        <div>Powered by Avalanche C-Chain & Reactive Network</div>
        <div className="mt-2">
          <a href="https://github.com/lucylow/avalanche-rush" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
            GitHub
          </a>
          {' • '}
          <a href="https://docs.avalanche-rush.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
            Docs
          </a>
          {' • '}
          <a href="https://discord.gg/avalanche-rush" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
            Discord
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative">
      {/* Reward Psychology Engine */}
      <RewardPsychologyEngine />

      {/* Notifications */}
      <AnimatePresence>
        {notifications.map((notification, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed top-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50"
            style={{ marginTop: `${index * 60}px` }}
          >
            {notification}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Enhanced Loading Overlay */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-2xl p-8 flex flex-col items-center space-y-6 border border-purple-500/30 shadow-2xl"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="text-6xl"
            >
              🎮
            </motion.div>
            <div className="flex items-center space-x-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full"
              />
              <span className="text-white font-bold text-xl">Loading Game...</span>
            </div>
            <div className="text-center max-w-sm">
              <p className="text-purple-200 text-sm">
                Initializing blockchain connection and loading your player profile
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Game States */}
      {!gameState.isPlaying ? (
        <MainMenu />
      ) : (
        <>
          <GameHUD />
          <GameEngine
            ref={gameEngineRef}
            gameState={gameState}
            onScoreUpdate={(score) => setGameState(prev => ({ ...prev, score }))}
            onGameEnd={endGame}
            onLevelComplete={(level) => {
              setGameState(prev => ({ ...prev, currentLevel: level + 1 }));
              if (window.triggerReward) {
                window.triggerReward('levelUp', { level });
              }
            }}
            isPaused={gameState.isPaused}
          />
        </>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showGameModeSelector && <GameModeSelector />}
      </AnimatePresence>
    </div>
  );
};

export default AvalancheRushGame;
