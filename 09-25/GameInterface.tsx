import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Coins, Zap, Target, Star } from 'lucide-react';

interface GameStats {
  highScore: number;
  totalGamesPlayed: number;
  totalRewardsEarned: string;
  level: number;
  rushBalance: string;
}

interface Quest {
  id: number;
  title: string;
  description: string;
  reward: string;
  completed: boolean;
  type: 'transfer' | 'swap' | 'nft' | 'game';
}

const GameInterface: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string>('');
  const [gameStats, setGameStats] = useState<GameStats>({
    highScore: 0,
    totalGamesPlayed: 0,
    totalRewardsEarned: '0',
    level: 1,
    rushBalance: '0'
  });
  const [currentScore, setCurrentScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameSession, setGameSession] = useState<number | null>(null);
  
  const [quests] = useState<Quest[]>([
    {
      id: 1,
      title: "First Transaction",
      description: "Send 0.001 AVAX to another address",
      reward: "10 RUSH + Achievement NFT",
      completed: false,
      type: 'transfer'
    },
    {
      id: 2,
      title: "DEX Explorer",
      description: "Perform a token swap on our DEX",
      reward: "25 RUSH + Rare NFT Chance",
      completed: false,
      type: 'swap'
    },
    {
      id: 3,
      title: "High Scorer",
      description: "Achieve a score of 5000+ in the arcade game",
      reward: "50 RUSH + Level Bonus",
      completed: false,
      type: 'game'
    }
  ]);

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
          await loadGameStats(accounts[0]);
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        setIsConnected(true);
        await loadGameStats(accounts[0]);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      alert('Please install MetaMask to play Avalanche Rush!');
    }
  };

  const loadGameStats = async (address: string) => {
    try {
      // Mock data for demonstration - in real app, fetch from contracts
      setGameStats({
        highScore: 4250,
        totalGamesPlayed: 12,
        totalRewardsEarned: '340.5',
        level: 3,
        rushBalance: '125.75'
      });
    } catch (error) {
      console.error('Error loading game stats:', error);
    }
  };

  const startGame = async () => {
    if (!isConnected) {
      await connectWallet();
      return;
    }

    try {
      setIsPlaying(true);
      setCurrentScore(0);
      setGameSession(Date.now()); // Mock session ID
      
      // Simulate game progression
      const gameInterval = setInterval(() => {
        setCurrentScore(prev => {
          const newScore = prev + Math.floor(Math.random() * 50) + 10;
          if (newScore >= 5000) {
            clearInterval(gameInterval);
            completeGame(newScore);
          }
          return newScore;
        });
      }, 100);

      // Auto-complete after 30 seconds for demo
      setTimeout(() => {
        clearInterval(gameInterval);
        if (isPlaying) {
          completeGame(currentScore);
        }
      }, 30000);
      
    } catch (error) {
      console.error('Error starting game:', error);
      setIsPlaying(false);
    }
  };

  const completeGame = async (finalScore: number) => {
    setIsPlaying(false);
    
    try {
      // Mock contract interaction
      const isHighScore = finalScore > gameStats.highScore;
      const baseReward = 10 * gameStats.level;
      const scoreBonus = Math.floor(finalScore / 1000);
      const highScoreBonus = isHighScore ? 50 : 0;
      const totalReward = baseReward + scoreBonus + highScoreBonus;

      // Update stats
      setGameStats(prev => ({
        ...prev,
        highScore: Math.max(prev.highScore, finalScore),
        totalGamesPlayed: prev.totalGamesPlayed + 1,
        totalRewardsEarned: (parseFloat(prev.totalRewardsEarned) + totalReward).toString(),
        rushBalance: (parseFloat(prev.rushBalance) + totalReward).toString(),
        level: Math.floor((prev.totalGamesPlayed + 1) / 10) + 1
      }));

      // Show completion message
      alert(`Game Complete! 🎉\nScore: ${finalScore}\nReward: ${totalReward} RUSH${isHighScore ? ' + High Score Bonus!' : ''}`);
      
    } catch (error) {
      console.error('Error completing game:', error);
    }
  };

  const performQuest = async (questId: number) => {
    const quest = quests.find(q => q.id === questId);
    if (!quest) return;

    try {
      switch (quest.type) {
        case 'transfer':
          alert('Please send 0.001 AVAX to complete this quest. The system will automatically detect and reward you!');
          break;
        case 'swap':
          alert('Navigate to the DEX tab to perform a token swap and complete this quest!');
          break;
        case 'game':
          if (currentScore >= 5000 || gameStats.highScore >= 5000) {
            alert('Quest completed! 🎉 You achieved a high score of 5000+');
          } else {
            alert('Keep playing to reach a score of 5000+ and complete this quest!');
          }
          break;
      }
    } catch (error) {
      console.error('Error performing quest:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Avalanche Rush</h1>
            <p className="text-blue-200">Learn Web3 Skills While Chasing High Scores</p>
          </div>
          
          {!isConnected ? (
            <Button onClick={connectWallet} size="lg" className="bg-blue-600 hover:bg-blue-700">
              Connect Wallet
            </Button>
          ) : (
            <div className="text-right">
              <div className="text-white font-mono text-sm">
                {account.slice(0, 6)}...{account.slice(-4)}
              </div>
              <div className="text-blue-200 text-sm">
                {gameStats.rushBalance} RUSH
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Game Area */}
          <div className="lg:col-span-2">
            <Card className="bg-black/30 border-blue-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Arcade Runner
                </CardTitle>
                <CardDescription className="text-blue-200">
                  Navigate obstacles and collect rewards in this endless runner!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gradient-to-br from-purple-800 to-blue-800 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                  {!isPlaying ? (
                    <div className="text-center">
                      <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-white mb-2">Ready to Play?</h3>
                      <p className="text-blue-200 mb-4">High Score: {gameStats.highScore.toLocaleString()}</p>
                      <Button onClick={startGame} size="lg" className="bg-green-600 hover:bg-green-700">
                        <Zap className="w-4 h-4 mr-2" />
                        Start Game
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-6xl font-bold text-white mb-4">
                        {currentScore.toLocaleString()}
                      </div>
                      <div className="text-blue-200">Current Score</div>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
                      
                      {/* Simple game visualization */}
                      <div className="absolute bottom-4 left-4 w-8 h-8 bg-blue-400 rounded animate-bounce" />
                      <div className="absolute bottom-4 right-4 w-6 h-6 bg-yellow-400 rounded-full animate-ping" />
                    </div>
                  )}
                </div>
                
                {isConnected && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-blue-900/30 p-3 rounded">
                      <div className="text-blue-200">Games Played</div>
                      <div className="text-white font-bold">{gameStats.totalGamesPlayed}</div>
                    </div>
                    <div className="bg-purple-900/30 p-3 rounded">
                      <div className="text-purple-200">Level</div>
                      <div className="text-white font-bold">{gameStats.level}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Player Stats */}
            {isConnected && (
              <Card className="bg-black/30 border-purple-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Player Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-purple-200">Level Progress</span>
                      <span className="text-white">{gameStats.level}</span>
                    </div>
                    <Progress value={(gameStats.totalGamesPlayed % 10) * 10} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-purple-200">High Score</span>
                      <span className="text-white font-mono">{gameStats.highScore.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-200">Total Rewards</span>
                      <span className="text-white font-mono">{gameStats.totalRewardsEarned} RUSH</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quests */}
            <Card className="bg-black/30 border-green-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Coins className="w-5 h-5" />
                  Active Quests
                </CardTitle>
                <CardDescription className="text-green-200">
                  Complete quests to earn RUSH tokens and NFTs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {quests.map((quest) => (
                  <div key={quest.id} className="bg-green-900/20 p-3 rounded border border-green-500/20">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-white font-medium">{quest.title}</h4>
                      <Badge variant={quest.completed ? "default" : "secondary"} className="text-xs">
                        {quest.completed ? "Complete" : "Active"}
                      </Badge>
                    </div>
                    <p className="text-green-200 text-sm mb-2">{quest.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-green-300 text-sm font-medium">{quest.reward}</span>
                      {!quest.completed && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => performQuest(quest.id)}
                          className="border-green-500/50 text-green-300 hover:bg-green-500/20"
                        >
                          Start
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameInterface;
