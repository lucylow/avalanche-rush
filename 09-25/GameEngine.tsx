import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useWeb3 } from '../hooks/useWeb3';

interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  score: number;
  level: number;
  lives: number;
  speed: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  mode: 'classic' | 'tutorial' | 'challenge' | 'quest' | 'speedrun' | 'survival';
  achievements: string[];
  skillPoints: { [key: string]: number };
}

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  type: 'player' | 'obstacle' | 'collectible' | 'powerup' | 'enemy';
  color: string;
  active: boolean;
  value?: number;
  effect?: string;
}

interface QuestObjective {
  id: string;
  description: string;
  target: number;
  current: number;
  completed: boolean;
  reward: string;
}

const GameEngine: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const { isConnected, startGameSession, completeGameSession } = useWeb3();
  
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    isPaused: false,
    score: 0,
    level: 1,
    lives: 3,
    speed: 2,
    difficulty: 'beginner',
    mode: 'classic',
    achievements: [],
    skillPoints: {
      speed: 0,
      accuracy: 0,
      endurance: 0,
      strategy: 0
    }
  });

  const [gameObjects, setGameObjects] = useState<GameObject[]>([]);
  const [questObjectives, setQuestObjectives] = useState<QuestObjective[]>([]);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [gameStartTime, setGameStartTime] = useState<number>(0);

  // Game configuration
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const PLAYER_SIZE = 30;
  const OBSTACLE_SPAWN_RATE = 0.02;
  const COLLECTIBLE_SPAWN_RATE = 0.01;
  const POWERUP_SPAWN_RATE = 0.005;

  // Initialize game objects
  const initializeGame = useCallback(() => {
    const player: GameObject = {
      x: 100,
      y: CANVAS_HEIGHT / 2,
      width: PLAYER_SIZE,
      height: PLAYER_SIZE,
      vx: 0,
      vy: 0,
      type: 'player',
      color: '#4F46E5',
      active: true
    };

    setGameObjects([player]);
    setGameState(prev => ({
      ...prev,
      score: 0,
      lives: 3,
      level: 1,
      speed: getDifficultySpeed(prev.difficulty)
    }));

    // Initialize quest objectives based on game mode
    initializeQuestObjectives(gameState.mode);
  }, [gameState.difficulty, gameState.mode]);

  const getDifficultySpeed = (difficulty: string): number => {
    switch (difficulty) {
      case 'beginner': return 2;
      case 'intermediate': return 3;
      case 'advanced': return 4;
      case 'expert': return 5;
      default: return 2;
    }
  };

  const initializeQuestObjectives = (mode: string) => {
    const objectives: QuestObjective[] = [];
    
    switch (mode) {
      case 'tutorial':
        objectives.push(
          { id: 'move', description: 'Move up and down', target: 10, current: 0, completed: false, reward: '100 points' },
          { id: 'collect', description: 'Collect 5 coins', target: 5, current: 0, completed: false, reward: '500 points' },
          { id: 'survive', description: 'Survive for 30 seconds', target: 30, current: 0, completed: false, reward: '1000 points' }
        );
        break;
      case 'challenge':
        objectives.push(
          { id: 'score', description: 'Reach 5000 points', target: 5000, current: 0, completed: false, reward: 'Speed Boost' },
          { id: 'combo', description: 'Get 10 combo hits', target: 10, current: 0, completed: false, reward: 'Accuracy +1' }
        );
        break;
      case 'quest':
        objectives.push(
          { id: 'blockchain', description: 'Complete blockchain transaction', target: 1, current: 0, completed: false, reward: 'NFT Achievement' },
          { id: 'learn', description: 'Answer 3 Web3 questions correctly', target: 3, current: 0, completed: false, reward: '2000 RUSH tokens' }
        );
        break;
      default:
        objectives.push(
          { id: 'highscore', description: 'Beat your high score', target: 1, current: 0, completed: false, reward: 'Level Up' }
        );
    }
    
    setQuestObjectives(objectives);
  };

  // Start game
  const startGame = async () => {
    if (!isConnected) {
      alert('Please connect your wallet to play!');
      return;
    }

    try {
      const newSessionId = await startGameSession();
      if (newSessionId) {
        setSessionId(newSessionId);
        setGameStartTime(Date.now());
        setGameState(prev => ({ ...prev, isPlaying: true, isPaused: false }));
        initializeGame();
        gameLoop();
      }
    } catch (error) {
      console.error('Failed to start game session:', error);
    }
  };

  // Game loop
  const gameLoop = useCallback(() => {
    if (!gameState.isPlaying || gameState.isPaused) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Update game objects
    updateGameObjects();
    
    // Spawn new objects
    spawnObjects();
    
    // Check collisions
    checkCollisions();
    
    // Update quest progress
    updateQuestProgress();
    
    // Render frame
    render(ctx);
    
    // Check game over conditions
    if (gameState.lives <= 0) {
      endGame();
      return;
    }

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, gameObjects]);

  const updateGameObjects = () => {
    setGameObjects(prev => prev.map(obj => {
      if (!obj.active) return obj;

      // Update positions
      const newObj = { ...obj };
      newObj.x += newObj.vx * gameState.speed;
      newObj.y += newObj.vy;

      // Remove objects that are off-screen
      if (newObj.x < -newObj.width || newObj.x > CANVAS_WIDTH + newObj.width) {
        newObj.active = false;
      }

      // Keep player within bounds
      if (newObj.type === 'player') {
        newObj.y = Math.max(0, Math.min(CANVAS_HEIGHT - newObj.height, newObj.y));
      }

      return newObj;
    }).filter(obj => obj.active));
  };

  const spawnObjects = () => {
    // Spawn obstacles
    if (Math.random() < OBSTACLE_SPAWN_RATE * gameState.level) {
      const obstacle: GameObject = {
        x: CANVAS_WIDTH,
        y: Math.random() * (CANVAS_HEIGHT - 40),
        width: 30 + Math.random() * 20,
        height: 30 + Math.random() * 20,
        vx: -gameState.speed,
        vy: 0,
        type: 'obstacle',
        color: '#EF4444',
        active: true
      };
      setGameObjects(prev => [...prev, obstacle]);
    }

    // Spawn collectibles
    if (Math.random() < COLLECTIBLE_SPAWN_RATE) {
      const collectible: GameObject = {
        x: CANVAS_WIDTH,
        y: Math.random() * (CANVAS_HEIGHT - 20),
        width: 20,
        height: 20,
        vx: -gameState.speed * 0.8,
        vy: 0,
        type: 'collectible',
        color: '#F59E0B',
        active: true,
        value: 100
      };
      setGameObjects(prev => [...prev, collectible]);
    }

    // Spawn power-ups
    if (Math.random() < POWERUP_SPAWN_RATE) {
      const powerup: GameObject = {
        x: CANVAS_WIDTH,
        y: Math.random() * (CANVAS_HEIGHT - 25),
        width: 25,
        height: 25,
        vx: -gameState.speed * 0.6,
        vy: 0,
        type: 'powerup',
        color: '#10B981',
        active: true,
        effect: 'shield'
      };
      setGameObjects(prev => [...prev, powerup]);
    }
  };

  const checkCollisions = () => {
    const player = gameObjects.find(obj => obj.type === 'player');
    if (!player) return;

    gameObjects.forEach(obj => {
      if (obj === player || !obj.active) return;

      // Simple AABB collision detection
      if (player.x < obj.x + obj.width &&
          player.x + player.width > obj.x &&
          player.y < obj.y + obj.height &&
          player.y + player.height > obj.y) {
        
        handleCollision(player, obj);
      }
    });
  };

  const handleCollision = (player: GameObject, obj: GameObject) => {
    switch (obj.type) {
      case 'obstacle':
        setGameState(prev => ({ ...prev, lives: prev.lives - 1 }));
        obj.active = false;
        // Add screen shake effect
        break;
      
      case 'collectible':
        setGameState(prev => ({ 
          ...prev, 
          score: prev.score + (obj.value || 100),
          skillPoints: { 
            ...prev.skillPoints, 
            accuracy: prev.skillPoints.accuracy + 1 
          }
        }));
        obj.active = false;
        break;
      
      case 'powerup':
        applyPowerup(obj.effect || 'shield');
        obj.active = false;
        break;
    }
  };

  const applyPowerup = (effect: string) => {
    switch (effect) {
      case 'shield':
        // Temporary invincibility
        setTimeout(() => {
          // Remove shield effect
        }, 5000);
        break;
      case 'speed':
        setGameState(prev => ({ 
          ...prev, 
          speed: prev.speed * 1.5,
          skillPoints: { 
            ...prev.skillPoints, 
            speed: prev.skillPoints.speed + 2 
          }
        }));
        setTimeout(() => {
          setGameState(prev => ({ ...prev, speed: prev.speed / 1.5 }));
        }, 10000);
        break;
    }
  };

  const updateQuestProgress = () => {
    const currentTime = (Date.now() - gameStartTime) / 1000;
    
    setQuestObjectives(prev => prev.map(objective => {
      if (objective.completed) return objective;

      let newCurrent = objective.current;

      switch (objective.id) {
        case 'survive':
          newCurrent = Math.floor(currentTime);
          break;
        case 'score':
          newCurrent = gameState.score;
          break;
        case 'collect':
          newCurrent = gameState.skillPoints.accuracy;
          break;
        // Add more quest logic here
      }

      const completed = newCurrent >= objective.target;
      if (completed && !objective.completed) {
        // Award quest completion
        setGameState(prev => ({
          ...prev,
          achievements: [...prev.achievements, objective.id],
          score: prev.score + 1000 // Bonus points
        }));
      }

      return { ...objective, current: newCurrent, completed };
    }));
  };

  const render = (ctx: CanvasRenderingContext2D) => {
    // Clear canvas
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw background pattern
    drawBackground(ctx);

    // Draw game objects
    gameObjects.forEach(obj => {
      if (!obj.active) return;

      ctx.fillStyle = obj.color;
      
      if (obj.type === 'player') {
        // Draw player with special effects
        ctx.shadowColor = obj.color;
        ctx.shadowBlur = 10;
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
        ctx.shadowBlur = 0;
      } else if (obj.type === 'collectible') {
        // Draw rotating collectible
        ctx.save();
        ctx.translate(obj.x + obj.width/2, obj.y + obj.height/2);
        ctx.rotate(Date.now() * 0.01);
        ctx.fillRect(-obj.width/2, -obj.height/2, obj.width, obj.height);
        ctx.restore();
      } else {
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
      }
    });

    // Draw UI
    drawUI(ctx);
  };

  const drawBackground = (ctx: CanvasRenderingContext2D) => {
    // Animated background
    const time = Date.now() * 0.001;
    const gradient = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    gradient.addColorStop(0, `hsl(${240 + Math.sin(time) * 20}, 70%, 10%)`);
    gradient.addColorStop(1, `hsl(${280 + Math.cos(time) * 20}, 70%, 20%)`);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Moving stars
    for (let i = 0; i < 50; i++) {
      const x = (i * 137.5 + time * 50) % CANVAS_WIDTH;
      const y = (i * 73.3) % CANVAS_HEIGHT;
      const alpha = Math.sin(time + i) * 0.5 + 0.5;
      
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
      ctx.fillRect(x, y, 2, 2);
    }
  };

  const drawUI = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Arial';
    
    // Score
    ctx.fillText(`Score: ${gameState.score}`, 20, 30);
    
    // Lives
    ctx.fillText(`Lives: ${gameState.lives}`, 20, 60);
    
    // Level
    ctx.fillText(`Level: ${gameState.level}`, 20, 90);
    
    // Quest objectives
    ctx.font = '14px Arial';
    questObjectives.forEach((objective, index) => {
      const y = CANVAS_HEIGHT - 120 + (index * 25);
      const color = objective.completed ? '#10B981' : '#FFFFFF';
      ctx.fillStyle = color;
      ctx.fillText(
        `${objective.description}: ${objective.current}/${objective.target}`,
        20,
        y
      );
    });

    // Skill points display
    ctx.fillStyle = '#F59E0B';
    ctx.font = '12px Arial';
    const skills = Object.entries(gameState.skillPoints);
    skills.forEach(([skill, points], index) => {
      ctx.fillText(`${skill}: ${points}`, CANVAS_WIDTH - 120, 30 + (index * 20));
    });
  };

  const endGame = async () => {
    setGameState(prev => ({ ...prev, isPlaying: false }));
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    // Complete blockchain game session
    if (sessionId && isConnected) {
      try {
        const achievementsUnlocked = gameState.achievements;
        const skillPointsEarned = Object.values(gameState.skillPoints);
        const skillNames = Object.keys(gameState.skillPoints);

        await completeGameSession(
          sessionId,
          gameState.score,
          achievementsUnlocked,
          skillPointsEarned,
          skillNames
        );
      } catch (error) {
        console.error('Failed to complete game session:', error);
      }
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameState.isPlaying) return;

      const player = gameObjects.find(obj => obj.type === 'player');
      if (!player) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          player.vy = -5;
          break;
        case 'ArrowDown':
        case 's':
          player.vy = 5;
          break;
        case ' ':
          e.preventDefault();
          setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!gameState.isPlaying) return;

      const player = gameObjects.find(obj => obj.type === 'player');
      if (!player) return;

      if (['ArrowUp', 'ArrowDown', 'w', 's'].includes(e.key)) {
        player.vy = 0;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState.isPlaying, gameObjects]);

  // Start game loop when playing
  useEffect(() => {
    if (gameState.isPlaying && !gameState.isPaused) {
      animationRef.current = requestAnimationFrame(gameLoop);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState.isPlaying, gameState.isPaused, gameLoop]);

  return (
    <div className="flex flex-col items-center p-4 bg-gray-900 min-h-screen">
      <div className="mb-4 flex gap-4">
        <select 
          value={gameState.difficulty} 
          onChange={(e) => setGameState(prev => ({ ...prev, difficulty: e.target.value as any }))}
          className="px-3 py-2 bg-gray-800 text-white rounded"
          disabled={gameState.isPlaying}
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
          <option value="expert">Expert</option>
        </select>
        
        <select 
          value={gameState.mode} 
          onChange={(e) => setGameState(prev => ({ ...prev, mode: e.target.value as any }))}
          className="px-3 py-2 bg-gray-800 text-white rounded"
          disabled={gameState.isPlaying}
        >
          <option value="classic">Classic</option>
          <option value="tutorial">Tutorial</option>
          <option value="challenge">Challenge</option>
          <option value="quest">Quest</option>
          <option value="speedrun">Speed Run</option>
          <option value="survival">Survival</option>
        </select>
        
        <button
          onClick={startGame}
          disabled={gameState.isPlaying || !isConnected}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {gameState.isPlaying ? 'Playing...' : 'Start Game'}
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border-2 border-gray-700 rounded-lg"
        style={{ background: 'linear-gradient(45deg, #1e293b, #334155)' }}
      />

      <div className="mt-4 text-white text-center">
        <p>Use WASD or Arrow Keys to move • Space to pause</p>
        {!isConnected && (
          <p className="text-yellow-400 mt-2">Connect your wallet to save progress and earn rewards!</p>
        )}
      </div>
    </div>
  );
};

export default GameEngine;
