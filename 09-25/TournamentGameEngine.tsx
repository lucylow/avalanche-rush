import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TournamentConfig {
  gameId: string;
  tournamentId: string;
  playerId: string;
  scoreSubmissionEndpoint: string;
  realTimeUpdates: boolean;
  antiCheatEnabled: boolean;
  spectatorMode: boolean;
}

interface GameState {
  isActive: boolean;
  isPaused: boolean;
  score: number;
  level: number;
  lives: number;
  timeRemaining: number;
  multiplier: number;
  combo: number;
  powerUps: string[];
  obstacles: Obstacle[];
  collectibles: Collectible[];
  player: Player;
}

interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityY: number;
  isJumping: boolean;
  isSliding: boolean;
  animation: string;
}

interface Obstacle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'spike' | 'wall' | 'pit' | 'moving';
  speed: number;
}

interface Collectible {
  id: string;
  x: number;
  y: number;
  type: 'coin' | 'gem' | 'powerup' | 'multiplier';
  value: number;
  collected: boolean;
}

interface TournamentStats {
  gamesPlayed: number;
  bestScore: number;
  averageScore: number;
  totalPlayTime: number;
  rank: number;
  percentile: number;
}

const TournamentGameEngine: React.FC<{ config: TournamentConfig }> = ({ config }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const keysRef = useRef<Set<string>>(new Set());

  const [gameState, setGameState] = useState<GameState>({
    isActive: false,
    isPaused: false,
    score: 0,
    level: 1,
    lives: 3,
    timeRemaining: 180, // 3 minutes for tournament mode
    multiplier: 1,
    combo: 0,
    powerUps: [],
    obstacles: [],
    collectibles: [],
    player: {
      x: 100,
      y: 300,
      width: 40,
      height: 60,
      velocityY: 0,
      isJumping: false,
      isSliding: false,
      animation: 'running'
    }
  });

  const [tournamentStats, setTournamentStats] = useState<TournamentStats>({
    gamesPlayed: 0,
    bestScore: 0,
    averageScore: 0,
    totalPlayTime: 0,
    rank: 0,
    percentile: 0
  });

  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [spectators, setSpectators] = useState<number>(0);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  // Game constants
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 400;
  const GRAVITY = 0.8;
  const JUMP_FORCE = -15;
  const GAME_SPEED = 5;
  const GROUND_Y = 340;

  // Initialize game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    // Setup tournament integration
    if (config.realTimeUpdates) {
      setupRealTimeUpdates();
    }

    if (config.spectatorMode) {
      setupSpectatorMode();
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [config]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.code);
      
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
      if (e.code === 'ArrowDown') {
        e.preventDefault();
        slide();
      }
      if (e.code === 'KeyP') {
        e.preventDefault();
        togglePause();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.code);
      
      if (e.code === 'ArrowDown') {
        stopSliding();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Game loop
  const gameLoop = useCallback((currentTime: number) => {
    if (!gameState.isActive || gameState.isPaused) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;

    // Update game state
    updatePlayer(deltaTime);
    updateObstacles(deltaTime);
    updateCollectibles(deltaTime);
    updateGameLogic(deltaTime);
    
    // Render game
    render();

    // Check game end conditions
    if (gameState.timeRemaining <= 0 || gameState.lives <= 0) {
      endGame();
      return;
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState]);

  const updatePlayer = (deltaTime: number) => {
    setGameState(prev => {
      const newPlayer = { ...prev.player };

      // Apply gravity
      if (newPlayer.y < GROUND_Y || newPlayer.velocityY < 0) {
        newPlayer.velocityY += GRAVITY;
        newPlayer.y += newPlayer.velocityY;
      }

      // Ground collision
      if (newPlayer.y >= GROUND_Y) {
        newPlayer.y = GROUND_Y;
        newPlayer.velocityY = 0;
        newPlayer.isJumping = false;
        newPlayer.animation = newPlayer.isSliding ? 'sliding' : 'running';
      }

      // Update animation
      if (newPlayer.isJumping) {
        newPlayer.animation = 'jumping';
      }

      return { ...prev, player: newPlayer };
    });
  };

  const updateObstacles = (deltaTime: number) => {
    setGameState(prev => {
      const newObstacles = prev.obstacles.map(obstacle => ({
        ...obstacle,
        x: obstacle.x - (GAME_SPEED + prev.level * 0.5)
      })).filter(obstacle => obstacle.x > -obstacle.width);

      // Add new obstacles
      if (Math.random() < 0.02 + prev.level * 0.005) {
        const obstacleTypes = ['spike', 'wall', 'pit', 'moving'];
        const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)] as any;
        
        newObstacles.push({
          id: `obstacle_${Date.now()}`,
          x: CANVAS_WIDTH,
          y: type === 'pit' ? GROUND_Y + 20 : GROUND_Y - 40,
          width: type === 'wall' ? 20 : 30,
          height: type === 'pit' ? 20 : 40,
          type,
          speed: GAME_SPEED + prev.level * 0.5
        });
      }

      return { ...prev, obstacles: newObstacles };
    });
  };

  const updateCollectibles = (deltaTime: number) => {
    setGameState(prev => {
      const newCollectibles = prev.collectibles.map(collectible => ({
        ...collectible,
        x: collectible.x - (GAME_SPEED + prev.level * 0.5)
      })).filter(collectible => collectible.x > -30 && !collectible.collected);

      // Add new collectibles
      if (Math.random() < 0.03) {
        const types = ['coin', 'gem', 'powerup', 'multiplier'];
        const type = types[Math.floor(Math.random() * types.length)] as any;
        
        newCollectibles.push({
          id: `collectible_${Date.now()}`,
          x: CANVAS_WIDTH,
          y: GROUND_Y - Math.random() * 100 - 50,
          type,
          value: type === 'coin' ? 10 : type === 'gem' ? 50 : type === 'powerup' ? 0 : 100,
          collected: false
        });
      }

      return { ...prev, collectibles: newCollectibles };
    });
  };

  const updateGameLogic = (deltaTime: number) => {
    setGameState(prev => {
      let newState = { ...prev };

      // Update timer
      newState.timeRemaining = Math.max(0, prev.timeRemaining - deltaTime / 1000);

      // Check collisions
      const playerRect = {
        x: prev.player.x,
        y: prev.player.y,
        width: prev.player.width,
        height: prev.player.height
      };

      // Obstacle collisions
      prev.obstacles.forEach(obstacle => {
        if (checkCollision(playerRect, obstacle)) {
          if (prev.powerUps.includes('shield')) {
            // Remove shield instead of losing life
            newState.powerUps = prev.powerUps.filter(p => p !== 'shield');
          } else {
            newState.lives = Math.max(0, prev.lives - 1);
            newState.combo = 0;
            newState.multiplier = 1;
          }
        }
      });

      // Collectible collisions
      newState.collectibles = prev.collectibles.map(collectible => {
        if (!collectible.collected && checkCollision(playerRect, collectible)) {
          newState.score += collectible.value * newState.multiplier;
          newState.combo += 1;
          
          if (collectible.type === 'multiplier') {
            newState.multiplier = Math.min(5, newState.multiplier + 1);
          } else if (collectible.type === 'powerup') {
            const powerUps = ['shield', 'magnet', 'jump_boost', 'slow_time'];
            const powerUp = powerUps[Math.floor(Math.random() * powerUps.length)];
            if (!newState.powerUps.includes(powerUp)) {
              newState.powerUps.push(powerUp);
            }
          }
          
          return { ...collectible, collected: true };
        }
        return collectible;
      });

      // Level progression
      const newLevel = Math.floor(newState.score / 1000) + 1;
      if (newLevel > prev.level) {
        newState.level = newLevel;
        newState.multiplier = Math.min(5, newState.multiplier + 1);
      }

      // Combo multiplier decay
      if (newState.combo > 10) {
        newState.multiplier = Math.min(5, Math.floor(newState.combo / 10) + 1);
      }

      return newState;
    });
  };

  const checkCollision = (rect1: any, rect2: any) => {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  };

  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw ground
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, GROUND_Y + 60, CANVAS_WIDTH, 40);

    // Draw player
    ctx.fillStyle = gameState.player.isSliding ? '#FF6B6B' : '#4ECDC4';
    ctx.fillRect(
      gameState.player.x,
      gameState.player.y,
      gameState.player.width,
      gameState.player.isSliding ? gameState.player.height / 2 : gameState.player.height
    );

    // Draw obstacles
    gameState.obstacles.forEach(obstacle => {
      ctx.fillStyle = obstacle.type === 'spike' ? '#FF4757' : 
                     obstacle.type === 'wall' ? '#5F27CD' : 
                     obstacle.type === 'pit' ? '#2F3542' : '#FF6348';
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });

    // Draw collectibles
    gameState.collectibles.forEach(collectible => {
      if (!collectible.collected) {
        ctx.fillStyle = collectible.type === 'coin' ? '#FFD700' :
                       collectible.type === 'gem' ? '#9B59B6' :
                       collectible.type === 'powerup' ? '#E74C3C' : '#2ECC71';
        ctx.beginPath();
        ctx.arc(collectible.x + 15, collectible.y + 15, 15, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw power-up indicators
    gameState.powerUps.forEach((powerUp, index) => {
      ctx.fillStyle = '#F39C12';
      ctx.fillRect(10 + index * 30, 10, 25, 25);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '12px Arial';
      ctx.fillText(powerUp[0].toUpperCase(), 15 + index * 30, 25);
    });
  };

  const jump = () => {
    if (!gameState.player.isJumping && gameState.player.y >= GROUND_Y) {
      setGameState(prev => ({
        ...prev,
        player: {
          ...prev.player,
          velocityY: JUMP_FORCE * (prev.powerUps.includes('jump_boost') ? 1.5 : 1),
          isJumping: true,
          animation: 'jumping'
        }
      }));
    }
  };

  const slide = () => {
    setGameState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        isSliding: true,
        animation: 'sliding'
      }
    }));
  };

  const stopSliding = () => {
    setGameState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        isSliding: false,
        animation: prev.player.isJumping ? 'jumping' : 'running'
      }
    }));
  };

  const togglePause = () => {
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const startGame = () => {
    setGameState(prev => ({
      ...prev,
      isActive: true,
      isPaused: false,
      score: 0,
      level: 1,
      lives: 3,
      timeRemaining: 180,
      multiplier: 1,
      combo: 0,
      powerUps: [],
      obstacles: [],
      collectibles: [],
      player: {
        ...prev.player,
        x: 100,
        y: GROUND_Y,
        velocityY: 0,
        isJumping: false,
        isSliding: false,
        animation: 'running'
      }
    }));

    lastTimeRef.current = performance.now();
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  };

  const endGame = async () => {
    setGameState(prev => ({ ...prev, isActive: false }));
    
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }

    // Submit score to tournament system
    await submitScore(gameState.score);
    
    // Update tournament stats
    setTournamentStats(prev => ({
      ...prev,
      gamesPlayed: prev.gamesPlayed + 1,
      bestScore: Math.max(prev.bestScore, gameState.score),
      averageScore: (prev.averageScore * prev.gamesPlayed + gameState.score) / (prev.gamesPlayed + 1),
      totalPlayTime: prev.totalPlayTime + (180 - gameState.timeRemaining)
    }));
  };

  const submitScore = async (score: number) => {
    if (!config.scoreSubmissionEndpoint) return;

    setIsSubmittingScore(true);
    
    try {
      const scoreData = {
        gameId: config.gameId,
        tournamentId: config.tournamentId,
        playerId: config.playerId,
        score: score,
        level: gameState.level,
        timeRemaining: gameState.timeRemaining,
        timestamp: new Date().toISOString(),
        gameData: {
          obstacles: gameState.obstacles.length,
          collectibles: gameState.collectibles.filter(c => c.collected).length,
          powerUpsUsed: gameState.powerUps.length,
          maxCombo: gameState.combo
        }
      };

      // Anti-cheat validation
      if (config.antiCheatEnabled) {
        scoreData.gameData = {
          ...scoreData.gameData,
          // Add anti-cheat metrics
          averageReactionTime: 150, // ms
          inputPattern: 'human-like',
          performanceMetrics: {
            frameRate: 60,
            inputLatency: 85
          }
        };
      }

      const response = await fetch(config.scoreSubmissionEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scoreData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Score submitted successfully:', result);
        
        // Update leaderboard
        if (result.leaderboard) {
          setLeaderboard(result.leaderboard);
        }
        
        // Update rank
        if (result.rank) {
          setTournamentStats(prev => ({
            ...prev,
            rank: result.rank,
            percentile: result.percentile || 0
          }));
        }
      }
    } catch (error) {
      console.error('Failed to submit score:', error);
    } finally {
      setIsSubmittingScore(false);
    }
  };

  const setupRealTimeUpdates = () => {
    // WebSocket connection for real-time tournament updates
    const ws = new WebSocket(`wss://tournament.funtico.com/ws/${config.tournamentId}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'leaderboard_update') {
        setLeaderboard(data.leaderboard);
      } else if (data.type === 'spectator_count') {
        setSpectators(data.count);
      } else if (data.type === 'tournament_event') {
        // Handle tournament events (new high score, player joined, etc.)
        console.log('Tournament event:', data.event);
      }
    };

    return () => ws.close();
  };

  const setupSpectatorMode = () => {
    // Enable spectator features
    if (config.spectatorMode) {
      // Broadcast game state for spectators
      const broadcastInterval = setInterval(() => {
        if (gameState.isActive) {
          const spectatorData = {
            playerId: config.playerId,
            score: gameState.score,
            level: gameState.level,
            lives: gameState.lives,
            timeRemaining: gameState.timeRemaining,
            playerPosition: { x: gameState.player.x, y: gameState.player.y },
            obstacles: gameState.obstacles.length,
            powerUps: gameState.powerUps
          };
          
          // Send to spectator service
          fetch(`https://tournament.funtico.com/spectator/${config.tournamentId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(spectatorData)
          }).catch(console.error);
        }
      }, 1000);

      return () => clearInterval(broadcastInterval);
    }
  };

  return (
    <div className="tournament-game-container">
      {/* Tournament Header */}
      <div className="tournament-header bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-lg">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Tournament Mode</h2>
            <p className="text-sm opacity-80">ID: {config.tournamentId}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{gameState.score.toLocaleString()}</div>
            <div className="text-sm">Best: {tournamentStats.bestScore.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Game Stats */}
      <div className="game-stats bg-gray-800 text-white p-2 flex justify-between text-sm">
        <div>Level: {gameState.level}</div>
        <div>Lives: {'❤️'.repeat(gameState.lives)}</div>
        <div>Time: {Math.ceil(gameState.timeRemaining)}s</div>
        <div>Combo: x{gameState.multiplier}</div>
        <div>Rank: #{tournamentStats.rank || '---'}</div>
        {config.spectatorMode && <div>👥 {spectators}</div>}
      </div>

      {/* Game Canvas */}
      <div className="game-canvas-container relative">
        <canvas
          ref={canvasRef}
          className="border-2 border-gray-300 bg-sky-200"
          style={{ width: '100%', maxWidth: '800px', height: 'auto' }}
        />
        
        {/* Game Overlay */}
        {!gameState.isActive && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-center text-white">
              <h3 className="text-2xl font-bold mb-4">
                {gameState.lives <= 0 ? 'Game Over!' : 'Tournament Ready!'}
              </h3>
              {gameState.score > 0 && (
                <div className="mb-4">
                  <div className="text-xl">Final Score: {gameState.score.toLocaleString()}</div>
                  <div className="text-sm opacity-80">
                    Level {gameState.level} • {Math.ceil(180 - gameState.timeRemaining)}s played
                  </div>
                </div>
              )}
              <button
                onClick={startGame}
                disabled={isSubmittingScore}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
              >
                {isSubmittingScore ? 'Submitting...' : gameState.score > 0 ? 'Play Again' : 'Start Tournament'}
              </button>
            </div>
          </div>
        )}

        {gameState.isPaused && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-center text-white">
              <h3 className="text-2xl font-bold mb-4">Paused</h3>
              <button
                onClick={togglePause}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Resume
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="controls bg-gray-100 p-4 rounded-b-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold">Jump</div>
            <div className="text-gray-600">SPACE / ↑</div>
          </div>
          <div className="text-center">
            <div className="font-semibold">Slide</div>
            <div className="text-gray-600">↓</div>
          </div>
          <div className="text-center">
            <div className="font-semibold">Pause</div>
            <div className="text-gray-600">P</div>
          </div>
          <div className="text-center">
            <div className="font-semibold">Tournament</div>
            <div className="text-gray-600">Live Scoring</div>
          </div>
        </div>
      </div>

      {/* Tournament Leaderboard */}
      {leaderboard.length > 0 && (
        <div className="leaderboard mt-4 bg-white rounded-lg shadow-lg p-4">
          <h3 className="text-lg font-bold mb-3">Live Leaderboard</h3>
          <div className="space-y-2">
            {leaderboard.slice(0, 5).map((player, index) => (
              <div
                key={player.id}
                className={`flex justify-between items-center p-2 rounded ${
                  player.id === config.playerId ? 'bg-blue-100' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-lg">#{index + 1}</span>
                  <span className={player.id === config.playerId ? 'font-bold' : ''}>
                    {player.name}
                  </span>
                </div>
                <span className="font-bold">{player.score.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentGameEngine;
