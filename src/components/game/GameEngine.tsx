import React, { forwardRef, useImperativeHandle, useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface GameEngineProps {
  gameState: {
    isPlaying: boolean;
    isPaused: boolean;
    gameMode: string;
    difficulty: string;
    currentLevel: number;
    score: number;
    lives: number;
    energy: number;
  };
  onScoreUpdate: (score: number) => void;
  onGameEnd: (score: number, achievements?: string[]) => void;
  onLevelComplete: (level: number) => void;
  isPaused: boolean;
}

export interface GameEngineRef {
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
}

const GameEngine = forwardRef<GameEngineRef, GameEngineProps>(({
  gameState,
  onScoreUpdate,
  onGameEnd,
  onLevelComplete,
  isPaused
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const [gameObjects, setGameObjects] = useState<any[]>([]);
  const [playerPosition, setPlayerPosition] = useState({ x: 100, y: 300 });
  const [keys, setKeys] = useState<{ [key: string]: boolean }>({});
  const [gameSpeed, setGameSpeed] = useState(2);

  // Game state
  const gameStateRef = useRef({
    score: 0,
    lives: 3,
    energy: 100,
    isRunning: false,
    obstacles: [] as any[],
    collectibles: [] as any[],
    lastObstacleTime: 0,
    lastCollectibleTime: 0,
  });

  // Initialize game
  useEffect(() => {
    if (gameState.isPlaying && !gameStateRef.current.isRunning) {
      startGame();
    }
  }, [gameState.isPlaying]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys(prev => ({ ...prev, [e.key]: true }));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys(prev => ({ ...prev, [e.key]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Game loop
  const gameLoop = () => {
    if (!gameState.isPlaying || isPaused) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update player position based on input
    let newPlayerPosition = { ...playerPosition };
    
    if (keys['ArrowUp'] || keys['w'] || keys[' ']) {
      newPlayerPosition.y = Math.max(50, newPlayerPosition.y - 5);
    }
    if (keys['ArrowDown'] || keys['s']) {
      newPlayerPosition.y = Math.min(canvas.height - 50, newPlayerPosition.y + 5);
    }
    if (keys['ArrowLeft'] || keys['a']) {
      newPlayerPosition.x = Math.max(50, newPlayerPosition.x - 5);
    }
    if (keys['ArrowRight'] || keys['d']) {
      newPlayerPosition.x = Math.min(canvas.width - 50, newPlayerPosition.x + 5);
    }

    setPlayerPosition(newPlayerPosition);

    // Generate obstacles
    const now = Date.now();
    if (now - gameStateRef.current.lastObstacleTime > 2000) {
      gameStateRef.current.obstacles.push({
        x: canvas.width,
        y: Math.random() * (canvas.height - 100) + 50,
        width: 30,
        height: 30,
        speed: gameSpeed + Math.random() * 2,
      });
      gameStateRef.current.lastObstacleTime = now;
    }

    // Generate collectibles
    if (now - gameStateRef.current.lastCollectibleTime > 3000) {
      gameStateRef.current.collectibles.push({
        x: canvas.width,
        y: Math.random() * (canvas.height - 100) + 50,
        width: 20,
        height: 20,
        speed: gameSpeed,
        type: Math.random() > 0.7 ? 'energy' : 'score',
      });
      gameStateRef.current.lastCollectibleTime = now;
    }

    // Update obstacles
    gameStateRef.current.obstacles = gameStateRef.current.obstacles.filter(obstacle => {
      obstacle.x -= obstacle.speed;
      
      // Check collision with player
      if (
        obstacle.x < newPlayerPosition.x + 40 &&
        obstacle.x + obstacle.width > newPlayerPosition.x &&
        obstacle.y < newPlayerPosition.y + 40 &&
        obstacle.y + obstacle.height > newPlayerPosition.y
      ) {
        gameStateRef.current.lives--;
        gameStateRef.current.energy -= 20;
        
        if (gameStateRef.current.lives <= 0) {
          endGame();
          return false;
        }
      }
      
      return obstacle.x > -50;
    });

    // Update collectibles
    gameStateRef.current.collectibles = gameStateRef.current.collectibles.filter(collectible => {
      collectible.x -= collectible.speed;
      
      // Check collision with player
      if (
        collectible.x < newPlayerPosition.x + 40 &&
        collectible.x + collectible.width > newPlayerPosition.x &&
        collectible.y < newPlayerPosition.y + 40 &&
        collectible.y + collectible.height > newPlayerPosition.y
      ) {
        if (collectible.type === 'score') {
          gameStateRef.current.score += 10;
          onScoreUpdate(gameStateRef.current.score);
        } else if (collectible.type === 'energy') {
          gameStateRef.current.energy = Math.min(100, gameStateRef.current.energy + 20);
        }
      }
      
      return collectible.x > -50;
    });

    // Draw game objects
    drawGame(ctx, canvas);

    // Increase game speed over time
    if (gameStateRef.current.score > 0 && gameStateRef.current.score % 100 === 0) {
      setGameSpeed(prev => Math.min(prev + 0.1, 5));
    }

    // Continue game loop
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  };

  const drawGame = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    // Draw background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw player
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(playerPosition.x, playerPosition.y, 40, 40);

    // Draw obstacles
    ctx.fillStyle = '#f44336';
    gameStateRef.current.obstacles.forEach(obstacle => {
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });

    // Draw collectibles
    gameStateRef.current.collectibles.forEach(collectible => {
      if (collectible.type === 'score') {
        ctx.fillStyle = '#FFD700';
      } else {
        ctx.fillStyle = '#00BCD4';
      }
      ctx.fillRect(collectible.x, collectible.y, collectible.width, collectible.height);
    });

    // Draw UI
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${gameStateRef.current.score}`, 20, 30);
    ctx.fillText(`Lives: ${gameStateRef.current.lives}`, 20, 60);
    ctx.fillText(`Energy: ${gameStateRef.current.energy}%`, 20, 90);
  };

  const startGame = () => {
    gameStateRef.current = {
      score: 0,
      lives: 3,
      energy: 100,
      isRunning: true,
      obstacles: [],
      collectibles: [],
      lastObstacleTime: 0,
      lastCollectibleTime: 0,
    };
    setGameSpeed(2);
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  };

  const pauseGame = () => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
  };

  const resumeGame = () => {
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  };

  const endGame = () => {
    gameStateRef.current.isRunning = false;
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    
    const achievements = [];
    if (gameStateRef.current.score >= 100) achievements.push('century');
    if (gameStateRef.current.score >= 500) achievements.push('half_k');
    if (gameStateRef.current.score >= 1000) achievements.push('thousand');
    
    onGameEnd(gameStateRef.current.score, achievements);
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    startGame,
    pauseGame,
    resumeGame,
    endGame,
  }));

  // Handle pause/resume
  useEffect(() => {
    if (isPaused) {
      pauseGame();
    } else if (gameState.isPlaying) {
      resumeGame();
    }
  }, [isPaused, gameState.isPlaying]);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="border border-gray-600 rounded-lg"
        style={{ maxWidth: '100vw', maxHeight: '100vh' }}
      />
      
      {/* Game Instructions */}
      <div className="absolute top-4 left-4 text-white text-sm">
        <div>Use Arrow Keys or WASD to move</div>
        <div>Space or Up Arrow to jump</div>
        <div>Avoid red obstacles, collect yellow coins!</div>
      </div>
    </div>
  );
});

GameEngine.displayName = 'GameEngine';

export default GameEngine;