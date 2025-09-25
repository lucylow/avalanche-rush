import React, { forwardRef, useImperativeHandle, useRef, useEffect, useState, useCallback } from 'react';
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
  selectedCharacter?: {
    id: string;
    name: string;
    rarity: string;
    type: string;
    questBonus: number;
    tournamentBonus: number;
    attributes: Record<string, number>;
    specialAbilities: string[];
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

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: 'spark' | 'star' | 'explosion' | 'trail';
}

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  type: string;
  color?: string;
  animation?: number;
}

const GameEngine = forwardRef<GameEngineRef, GameEngineProps>(({
  gameState,
  selectedCharacter,
  onScoreUpdate,
  onGameEnd,
  onLevelComplete,
  isPaused
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const [playerPosition, setPlayerPosition] = useState({ x: 100, y: 300 });
  const [keys, setKeys] = useState<{ [key: string]: boolean }>({});
  const [gameSpeed, setGameSpeed] = useState(2);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [backgroundOffset, setBackgroundOffset] = useState(0);

  // Enhanced game state
  const gameStateRef = useRef({
    score: 0,
    lives: 3,
    energy: 100,
    isRunning: false,
    obstacles: [] as GameObject[],
    collectibles: [] as GameObject[],
    powerups: [] as GameObject[],
    lastObstacleTime: 0,
    lastCollectibleTime: 0,
    lastPowerupTime: 0,
    playerAnimation: 0,
    invulnerable: false,
    invulnerableTime: 0,
    combo: 0,
    comboTimer: 0,
  });

  // Particle system
  const createParticles = useCallback((x: number, y: number, type: 'explosion' | 'collect' | 'power' | 'trail', count: number = 5) => {
    const newParticles: Particle[] = [];
    const colors = {
      explosion: ['#ff4444', '#ff8800', '#ffaa00', '#ff6600'],
      collect: ['#ffdd00', '#ffff00', '#aadd00', '#88ff88'],
      power: ['#4488ff', '#8844ff', '#ff44ff', '#44ffff'],
      trail: ['#ffffff', '#aaaaff', '#88aaff', '#6688ff']
    };

    for (let i = 0; i < count; i++) {
      newParticles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: type === 'trail' ? 0.3 : 1.0,
        maxLife: type === 'trail' ? 0.3 : 1.0,
        color: colors[type][Math.floor(Math.random() * colors[type].length)],
        size: Math.random() * 6 + 2,
        type: type === 'explosion' ? 'explosion' : type === 'trail' ? 'trail' : 'star'
      });
    }

    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  // Enhanced drawing functions
  const drawPlayer = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    const time = Date.now() * 0.01;
    const bounce = Math.sin(time) * 2;
    const isInvulnerable = gameStateRef.current.invulnerable;
    
    // Player trail effect
    if (gameStateRef.current.isRunning && Math.random() < 0.3) {
      createParticles(x + 20, y + 20, 'trail', 1);
    }

    ctx.save();
    
    // Invulnerability flashing effect
    if (isInvulnerable && Math.floor(Date.now() / 100) % 2) {
      ctx.globalAlpha = 0.5;
    }

    // Player shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(x + 5, y + 45, 35, 5);

    // Player body gradient
    const gradient = ctx.createLinearGradient(x, y, x, y + 40);
    gradient.addColorStop(0, '#4CAF50');
    gradient.addColorStop(0.5, '#66BB6A');
    gradient.addColorStop(1, '#2E7D32');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y + bounce, 40, 40);

    // Player face
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 8, y + 8 + bounce, 6, 6);
    ctx.fillRect(x + 26, y + 8 + bounce, 6, 6);
    
    // Player smile
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x + 20, y + 25 + bounce, 8, 0.2, Math.PI - 0.2);
    ctx.stroke();

    // Player energy glow
    if (gameStateRef.current.energy > 80) {
      ctx.shadowColor = '#4CAF50';
      ctx.shadowBlur = 15;
      ctx.strokeStyle = '#4CAF50';
      ctx.lineWidth = 1;
      ctx.strokeRect(x - 2, y - 2 + bounce, 44, 44);
    }

    ctx.restore();
  };

  const drawObstacle = (ctx: CanvasRenderingContext2D, obstacle: GameObject) => {
    const time = Date.now() * 0.005;
    const rotation = time + obstacle.x * 0.01;
    
    ctx.save();
    ctx.translate(obstacle.x + obstacle.width/2, obstacle.y + obstacle.height/2);
    ctx.rotate(rotation);

    // Obstacle gradient
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, obstacle.width/2);
    gradient.addColorStop(0, '#ff6b6b');
    gradient.addColorStop(0.7, '#ee5a52');
    gradient.addColorStop(1, '#c92a2a');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(-obstacle.width/2, -obstacle.height/2, obstacle.width, obstacle.height);

    // Obstacle spikes
    ctx.fillStyle = '#ff4444';
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const spikeX = Math.cos(angle) * (obstacle.width/2 + 5);
      const spikeY = Math.sin(angle) * (obstacle.height/2 + 5);
      
      ctx.beginPath();
      ctx.moveTo(spikeX * 0.7, spikeY * 0.7);
      ctx.lineTo(spikeX, spikeY);
      ctx.lineTo(spikeX * 0.7 + Math.cos(angle + 0.5) * 3, spikeY * 0.7 + Math.sin(angle + 0.5) * 3);
      ctx.closePath();
      ctx.fill();
    }

    // Danger glow
    ctx.shadowColor = '#ff4444';
    ctx.shadowBlur = 10;
    ctx.strokeStyle = '#ff8888';
    ctx.lineWidth = 1;
    ctx.strokeRect(-obstacle.width/2 - 1, -obstacle.height/2 - 1, obstacle.width + 2, obstacle.height + 2);

    ctx.restore();
  };

  const drawCollectible = (ctx: CanvasRenderingContext2D, collectible: GameObject) => {
    const time = Date.now() * 0.01;
    const bounce = Math.sin(time + collectible.x * 0.1) * 3;
    const glow = Math.sin(time * 2) * 0.3 + 0.7;
    
    ctx.save();
    ctx.translate(collectible.x + collectible.width/2, collectible.y + collectible.height/2 + bounce);

    if (collectible.type === 'coin') {
      // Gold coin with shine effect
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, collectible.width/2);
      gradient.addColorStop(0, '#ffd700');
      gradient.addColorStop(0.7, '#ffed4a');
      gradient.addColorStop(1, '#f59e0b');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, collectible.width/2, 0, Math.PI * 2);
      ctx.fill();

      // Coin shine
      ctx.fillStyle = `rgba(255, 255, 255, ${glow})`;
      ctx.beginPath();
      ctx.arc(-3, -3, collectible.width/4, 0, Math.PI * 2);
      ctx.fill();

      // Dollar sign
      ctx.fillStyle = '#b45309';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('$', 0, 4);

    } else if (collectible.type === 'energy') {
      // Energy crystal
      const gradient = ctx.createLinearGradient(-10, -10, 10, 10);
      gradient.addColorStop(0, '#00bcd4');
      gradient.addColorStop(0.5, '#26c6da');
      gradient.addColorStop(1, '#00acc1');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(0, -collectible.height/2);
      ctx.lineTo(collectible.width/2, -collectible.height/4);
      ctx.lineTo(collectible.width/2, collectible.height/4);
      ctx.lineTo(0, collectible.height/2);
      ctx.lineTo(-collectible.width/2, collectible.height/4);
      ctx.lineTo(-collectible.width/2, -collectible.height/4);
      ctx.closePath();
      ctx.fill();

      // Energy glow
      ctx.shadowColor = '#00bcd4';
      ctx.shadowBlur = 15 * glow;
      ctx.strokeStyle = `rgba(0, 188, 212, ${glow})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.restore();
  };

  const drawBackground = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f3460');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Moving stars
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 50; i++) {
      const x = ((i * 123.5 + backgroundOffset * 0.5) % (canvas.width + 50)) - 50;
      const y = (i * 67.8) % canvas.height;
      const size = (i % 3) + 1;
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Distant mountains
    ctx.fillStyle = 'rgba(76, 175, 80, 0.3)';
    ctx.beginPath();
    ctx.moveTo(-50, canvas.height);
    for (let x = 0; x < canvas.width + 50; x += 20) {
      const height = Math.sin((x + backgroundOffset) * 0.01) * 50 + canvas.height - 100;
      ctx.lineTo(x, height);
    }
    ctx.lineTo(canvas.width + 50, canvas.height);
    ctx.closePath();
    ctx.fill();

    // Grid lines
    ctx.strokeStyle = 'rgba(76, 175, 80, 0.1)';
    ctx.lineWidth = 1;
    for (let x = (backgroundOffset % 50); x < canvas.width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
  };

  const updateParticles = () => {
    setParticles(prev => prev.map(particle => ({
      ...particle,
      x: particle.x + particle.vx,
      y: particle.y + particle.vy,
      vy: particle.vy + 0.2, // gravity
      life: particle.life - 0.02,
      vx: particle.vx * 0.98 // air resistance
    })).filter(particle => particle.life > 0));
  };

  const drawParticles = (ctx: CanvasRenderingContext2D) => {
    particles.forEach(particle => {
      ctx.save();
      ctx.globalAlpha = particle.life / particle.maxLife;
      
      if (particle.type === 'star') {
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * (particle.life / particle.maxLife), 0, Math.PI * 2);
        ctx.fill();
        
        // Star sparkle
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 10;
        ctx.fill();
      } else {
        ctx.fillStyle = particle.color;
        ctx.fillRect(
          particle.x - particle.size/2, 
          particle.y - particle.size/2, 
          particle.size * (particle.life / particle.maxLife), 
          particle.size * (particle.life / particle.maxLife)
        );
      }
      
      ctx.restore();
    });
  };

  // Enhanced game loop
  const gameLoop = useCallback(() => {
    if (!gameState.isPlaying || isPaused) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Update background
    setBackgroundOffset(prev => prev + gameSpeed);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    drawBackground(ctx, canvas);

    // Update player position based on input
    let newPlayerPosition = { ...playerPosition };
    
    if (keys['ArrowUp'] || keys['w'] || keys[' ']) {
      newPlayerPosition.y = Math.max(50, newPlayerPosition.y - 6);
    }
    if (keys['ArrowDown'] || keys['s']) {
      newPlayerPosition.y = Math.min(canvas.height - 90, newPlayerPosition.y + 6);
    }
    if (keys['ArrowLeft'] || keys['a']) {
      newPlayerPosition.x = Math.max(20, newPlayerPosition.x - 5);
    }
    if (keys['ArrowRight'] || keys['d']) {
      newPlayerPosition.x = Math.min(canvas.width - 60, newPlayerPosition.x + 5);
    }

    setPlayerPosition(newPlayerPosition);

    // Generate obstacles
    const now = Date.now();
    if (now - gameStateRef.current.lastObstacleTime > 1500 - gameSpeed * 100) {
      gameStateRef.current.obstacles.push({
        x: canvas.width,
        y: Math.random() * (canvas.height - 150) + 50,
        width: 30 + Math.random() * 20,
        height: 30 + Math.random() * 20,
        speed: gameSpeed + Math.random() * 2 + 1,
        type: 'obstacle',
        animation: 0
      });
      gameStateRef.current.lastObstacleTime = now;
    }

    // Generate collectibles
    if (now - gameStateRef.current.lastCollectibleTime > 2500) {
      const type = Math.random() > 0.7 ? 'energy' : 'coin';
      gameStateRef.current.collectibles.push({
        x: canvas.width,
        y: Math.random() * (canvas.height - 150) + 50,
        width: 20,
        height: 20,
        speed: gameSpeed + 1,
        type,
        animation: 0
      });
      gameStateRef.current.lastCollectibleTime = now;
    }

    // Update invulnerability
    if (gameStateRef.current.invulnerable) {
      gameStateRef.current.invulnerableTime--;
      if (gameStateRef.current.invulnerableTime <= 0) {
        gameStateRef.current.invulnerable = false;
      }
    }

    // Update combo timer
    if (gameStateRef.current.comboTimer > 0) {
      gameStateRef.current.comboTimer--;
      if (gameStateRef.current.comboTimer <= 0) {
        gameStateRef.current.combo = 0;
      }
    }

    // Update obstacles
    gameStateRef.current.obstacles = gameStateRef.current.obstacles.filter(obstacle => {
      obstacle.x -= obstacle.speed;
      obstacle.animation += 0.1;
      
      // Check collision with player
      if (
        !gameStateRef.current.invulnerable &&
        obstacle.x < newPlayerPosition.x + 30 &&
        obstacle.x + obstacle.width > newPlayerPosition.x + 10 &&
        obstacle.y < newPlayerPosition.y + 30 &&
        obstacle.y + obstacle.height > newPlayerPosition.y + 10
      ) {
        // Create explosion particles
        createParticles(obstacle.x + obstacle.width/2, obstacle.y + obstacle.height/2, 'explosion', 8);
        
        gameStateRef.current.lives--;
        gameStateRef.current.energy -= 25;
        gameStateRef.current.invulnerable = true;
        gameStateRef.current.invulnerableTime = 120; // 2 seconds at 60fps
        gameStateRef.current.combo = 0;
        
        if (gameStateRef.current.lives <= 0) {
          endGame();
          return false;
        }
      }
      
      return obstacle.x > -100;
    });

    // Update collectibles
    gameStateRef.current.collectibles = gameStateRef.current.collectibles.filter(collectible => {
      collectible.x -= collectible.speed;
      collectible.animation += 0.1;
      
      // Check collision with player
      if (
        collectible.x < newPlayerPosition.x + 30 &&
        collectible.x + collectible.width > newPlayerPosition.x + 10 &&
        collectible.y < newPlayerPosition.y + 30 &&
        collectible.y + collectible.height > newPlayerPosition.y + 10
      ) {
        // Create collection particles
        createParticles(collectible.x + collectible.width/2, collectible.y + collectible.height/2, 'collect', 6);
        
        if (collectible.type === 'coin') {
          let points = (10 + gameStateRef.current.combo * 2);
          
          // Apply character bonuses
          if (selectedCharacter) {
            // Apply quest bonus for coin collection
            points = Math.floor(points * (1 + selectedCharacter.questBonus / 100));
            
            // Apply special abilities
            if (selectedCharacter.specialAbilities.includes('Lucky Strike')) {
              points = Math.floor(points * 1.2); // 20% bonus for lucky strikes
            }
          }
          
          gameStateRef.current.score += points;
          gameStateRef.current.combo++;
          gameStateRef.current.comboTimer = 300; // 5 seconds
          onScoreUpdate(gameStateRef.current.score);
        } else if (collectible.type === 'energy') {
          gameStateRef.current.energy = Math.min(100, gameStateRef.current.energy + 25);
          createParticles(newPlayerPosition.x + 20, newPlayerPosition.y + 20, 'power', 4);
        }
        
        return false;
      }
      
      return collectible.x > -50;
    });

    // Draw all game objects
    drawPlayer(ctx, newPlayerPosition.x, newPlayerPosition.y);
    
    gameStateRef.current.obstacles.forEach(obstacle => {
      drawObstacle(ctx, obstacle);
    });
    
    gameStateRef.current.collectibles.forEach(collectible => {
      drawCollectible(ctx, collectible);
    });

    // Update and draw particles
    updateParticles();
    drawParticles(ctx);

    // Draw enhanced UI
    drawEnhancedUI(ctx, canvas);

    // Increase game speed over time
    if (gameStateRef.current.score > 0 && gameStateRef.current.score % 100 === 0) {
      setGameSpeed(prev => Math.min(prev + 0.05, 6));
    }

    // Continue game loop
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState.isPlaying, isPaused, playerPosition, keys, gameSpeed, particles, createParticles]);

  const drawEnhancedUI = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    // UI Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 250, 120);
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 250, 120);

    // Score with glow effect
    ctx.shadowColor = '#ffdd00';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#ffdd00';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`Score: ${gameStateRef.current.score.toLocaleString()}`, 20, 35);
    
    // Combo display
    if (gameStateRef.current.combo > 0) {
      ctx.shadowColor = '#ff4444';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#ff4444';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(`${gameStateRef.current.combo}x COMBO!`, 20, 55);
    }

    ctx.shadowBlur = 0; // Reset shadow

    // Lives with heart icons
    ctx.fillStyle = '#ff4444';
    ctx.font = '20px Arial';
    for (let i = 0; i < gameStateRef.current.lives; i++) {
      ctx.fillText('❤️', 20 + i * 25, 80);
    }

    // Energy bar with gradient
    const energyGradient = ctx.createLinearGradient(20, 90, 220, 90);
    energyGradient.addColorStop(0, '#00ff00');
    energyGradient.addColorStop(0.5, '#ffff00');
    energyGradient.addColorStop(1, '#ff0000');
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(20, 90, 200, 15);
    
    ctx.fillStyle = energyGradient;
    ctx.fillRect(20, 90, (gameStateRef.current.energy / 100) * 200, 15);
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(20, 90, 200, 15);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.fillText(`Energy: ${gameStateRef.current.energy}%`, 25, 102);

    // Level indicator
    ctx.fillStyle = '#4CAF50';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(`Level: ${gameState.currentLevel}`, 20, 120);
  };

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

  const startGame = () => {
    gameStateRef.current = {
      score: 0,
      lives: 3,
      energy: 100,
      isRunning: true,
      obstacles: [],
      collectibles: [],
      powerups: [],
      lastObstacleTime: 0,
      lastCollectibleTime: 0,
      lastPowerupTime: 0,
      playerAnimation: 0,
      invulnerable: false,
      invulnerableTime: 0,
      combo: 0,
      comboTimer: 0,
    };
    setGameSpeed(2);
    setParticles([]);
    setBackgroundOffset(0);
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
    if (gameStateRef.current.combo >= 5) achievements.push('combo_master');
    
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
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={1000}
          height={600}
          className="border-2 border-green-400 rounded-lg shadow-2xl"
          style={{ maxWidth: '95vw', maxHeight: '85vh' }}
        />
        
        {/* Game Instructions Overlay */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 right-4 bg-black/70 text-white p-4 rounded-lg backdrop-blur-sm border border-green-400/30"
        >
          <div className="text-sm space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-green-400">🎮</span>
              <span>WASD or Arrow Keys to move</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-400">🪙</span>
              <span>Collect coins for points</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-400">💎</span>
              <span>Energy crystals restore health</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-red-400">⚠️</span>
              <span>Avoid spinning obstacles</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-purple-400">🔥</span>
              <span>Build combos for bonus points!</span>
            </div>
          </div>
        </motion.div>

        {/* Pause Overlay */}
        {isPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm rounded-lg"
          >
            <div className="text-center text-white">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-6xl mb-4"
              >
                ⏸️
              </motion.div>
              <h2 className="text-4xl font-bold mb-2">PAUSED</h2>
              <p className="text-xl">Press Resume to continue</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
});

GameEngine.displayName = 'GameEngine';

export default GameEngine;