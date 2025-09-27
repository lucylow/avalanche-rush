import React, { memo, useMemo, useCallback, lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// ==================== PERFORMANCE OPTIMIZATION UTILITIES ====================

// Higher-order component for memoization
export const withMemo = <P extends object>(
  Component: React.ComponentType<P>,
  areEqual?: (prevProps: P, nextProps: P) => boolean
) => {
  return memo(Component, areEqual);
};

// Custom hook for expensive calculations
export const useExpensiveCalculation = <T>(
  calculation: () => T,
  dependencies: React.DependencyList
): T => {
  return useMemo(calculation, dependencies);
};

// Custom hook for stable callbacks
export const useStableCallback = <T extends (...args: any[]) => any>(
  callback: T,
  dependencies: React.DependencyList
): T => {
  return useCallback(callback, dependencies);
};

// ==================== LAZY LOADING COMPONENTS ====================

// Lazy load heavy components
export const LazyCharacterSelectionModal = lazy(() => 
  import('../components/game/CharacterSelectionModal').then(module => ({
    default: module.default
  }))
);

export const LazyGameEngine = lazy(() => 
  import('../components/game/GameEngine').then(module => ({
    default: module.default
  }))
);

export const LazyLeaderboardSystem = lazy(() => 
  import('../components/game/LeaderboardSystem').then(module => ({
    default: module.default
  }))
);

export const LazyQuestSystem = lazy(() => 
  import('../components/game/QuestSystem').then(module => ({
    default: module.default
  }))
);

export const LazyTournamentSystem = lazy(() => 
  import('../components/TournamentSystem').then(module => ({
    default: module.default
  }))
);

export const LazyNFTMarketplace = lazy(() => 
  import('../components/NFTMarketplace').then(module => ({
    default: module.default
  }))
);

// ==================== LOADING COMPONENTS ====================

export const ComponentLoader: React.FC<{ message?: string }> = ({ 
  message = "Loading..." 
}) => (
  <div className="flex items-center justify-center p-8">
    <div className="flex flex-col items-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  </div>
);

export const GameLoader: React.FC = () => (
  <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
    <div className="text-center text-white">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
      <h2 className="text-2xl font-bold mb-2">Loading Game...</h2>
      <p className="text-lg">Preparing your Avalanche Rush experience</p>
    </div>
  </div>
);

// ==================== SUSPENSE WRAPPERS ====================

export const SuspenseWrapper: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback = <ComponentLoader /> }) => (
  <Suspense fallback={fallback}>
    {children}
  </Suspense>
);

// ==================== OPTIMIZED COMPONENT WRAPPERS ====================

// Optimized Character Selection Modal
export const OptimizedCharacterSelectionModal = memo(
  LazyCharacterSelectionModal,
  (prevProps, nextProps) => {
    return (
      prevProps.isOpen === nextProps.isOpen &&
      prevProps.playerLevel === nextProps.playerLevel &&
      prevProps.selectedCharacter?.id === nextProps.selectedCharacter?.id
    );
  }
);

// Optimized Game Engine
export const OptimizedGameEngine = memo(
  LazyGameEngine,
  (prevProps, nextProps) => {
    return (
      prevProps.gameState.isPlaying === nextProps.gameState.isPlaying &&
      prevProps.gameState.isPaused === nextProps.gameState.isPaused &&
      prevProps.gameState.currentLevel === nextProps.gameState.currentLevel &&
      prevProps.isPaused === nextProps.isPaused &&
      prevProps.selectedCharacter?.id === nextProps.selectedCharacter?.id
    );
  }
);

// Optimized Leaderboard System
export const OptimizedLeaderboardSystem = memo(
  LazyLeaderboardSystem,
  (prevProps, nextProps) => {
    return (
      prevProps.filter.gameMode === nextProps.filter.gameMode &&
      prevProps.filter.difficulty === nextProps.filter.difficulty &&
      prevProps.filter.timeframe === nextProps.filter.timeframe &&
      prevProps.currentPlayer?.rank === nextProps.currentPlayer?.rank
    );
  }
);

// Optimized Quest System
export const OptimizedQuestSystem = memo(
  LazyQuestSystem,
  (prevProps, nextProps) => {
    return (
      prevProps.activeQuests.length === nextProps.activeQuests.length &&
      prevProps.completedQuests.length === nextProps.completedQuests.length &&
      prevProps.playerLevel === nextProps.playerLevel
    );
  }
);

// ==================== PERFORMANCE HOOKS ====================

// Hook for character filtering with memoization
export const useCharacterFilter = (
  characters: any[],
  filter: {
    rarity?: string;
    type?: string;
    unlocked?: boolean;
  }
) => {
  return useExpensiveCalculation(() => {
    return characters.filter(character => {
      if (filter.rarity && character.rarity !== filter.rarity) return false;
      if (filter.type && character.type !== filter.type) return false;
      if (filter.unlocked !== undefined) {
        // Add logic for checking if character is unlocked
        return true; // Placeholder
      }
      return true;
    });
  }, [characters, filter.rarity, filter.type, filter.unlocked]);
};

// Hook for score calculations with memoization
export const useScoreCalculation = (
  baseScore: number,
  multiplier: number,
  combo: number,
  characterBonus: number
) => {
  return useExpensiveCalculation(() => {
    const comboBonus = combo > 0 ? combo * 10 : 0;
    const totalMultiplier = multiplier * (1 + characterBonus / 100);
    return Math.floor((baseScore + comboBonus) * totalMultiplier);
  }, [baseScore, multiplier, combo, characterBonus]);
};

// Hook for leaderboard data processing
export const useLeaderboardData = (
  rawData: any[],
  sortBy: 'score' | 'level' | 'timestamp',
  limit: number
) => {
  return useExpensiveCalculation(() => {
    return rawData
      .sort((a, b) => {
        switch (sortBy) {
          case 'score':
            return b.score - a.score;
          case 'level':
            return b.level - a.level;
          case 'timestamp':
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
          default:
            return 0;
        }
      })
      .slice(0, limit);
  }, [rawData, sortBy, limit]);
};

// ==================== DEBOUNCED HOOKS ====================

// Hook for debounced search
export const useDebouncedSearch = (value: string, delay: number = 300) => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Hook for debounced API calls
export const useDebouncedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): T => {
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay]
  );
};

// ==================== VIRTUALIZATION UTILITIES ====================

// Hook for virtual scrolling
export const useVirtualScroll = (
  itemHeight: number,
  containerHeight: number,
  itemCount: number,
  scrollTop: number
) => {
  return useMemo(() => {
    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.min(
      visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
      itemCount
    );
    
    return {
      startIndex: Math.max(0, visibleStart),
      endIndex: visibleEnd,
      totalHeight: itemCount * itemHeight,
      offsetY: visibleStart * itemHeight
    };
  }, [itemHeight, containerHeight, itemCount, scrollTop]);
};

// ==================== MEMORY OPTIMIZATION ====================

// Hook for memory-efficient object updates
export const useImmutableUpdate = <T extends Record<string, any>>(
  state: T,
  updates: Partial<T>
): T => {
  return useMemo(() => {
    const hasChanges = Object.keys(updates).some(key => 
      state[key] !== updates[key]
    );
    
    if (!hasChanges) {
      return state;
    }
    
    return { ...state, ...updates };
  }, [state, updates]);
};

// Hook for memory-efficient array operations
export const useImmutableArray = <T>(
  array: T[],
  operation: 'push' | 'pop' | 'shift' | 'unshift' | 'splice',
  ...args: any[]
): T[] => {
  return useMemo(() => {
    const newArray = [...array];
    
    switch (operation) {
      case 'push':
        newArray.push(...args);
        break;
      case 'pop':
        newArray.pop();
        break;
      case 'shift':
        newArray.shift();
        break;
      case 'unshift':
        newArray.unshift(...args);
        break;
      case 'splice':
        newArray.splice(args[0], args[1], ...args.slice(2));
        break;
    }
    
    return newArray;
  }, [array, operation, ...args]);
};

// ==================== EXPORT ALL OPTIMIZATION UTILITIES ====================

export {
  // Re-export React performance utilities
  memo,
  useMemo,
  useCallback,
  lazy,
  Suspense
};
