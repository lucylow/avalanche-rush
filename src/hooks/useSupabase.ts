import { useState, useEffect, useCallback } from 'react';
import { supabase, SupabaseService, User, UserProfile, GameSession, LeaderboardEntry, Achievement, Quest } from '../lib/supabase';

// Types for the hook
interface UseSupabaseReturn {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  createGameSession: (sessionData: Partial<GameSession>) => Promise<GameSession>;
  getGameSessions: (limit?: number) => Promise<GameSession[]>;
  getLeaderboard: (gameType: string, chainId: number, limit?: number) => Promise<LeaderboardEntry[]>;
  getAchievements: () => Promise<Achievement[]>;
  getUserAchievements: () => Promise<any[]>;
  getQuests: () => Promise<Quest[]>;
  getUserQuests: () => Promise<any[]>;
  unlockAchievement: (achievementId: string) => Promise<void>;
  updateQuestProgress: (questId: string, progress: number) => Promise<void>;
}

export const useSupabase = (): UseSupabaseReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        if (authUser) {
          const userData = await SupabaseService.getUser(authUser.id);
          const userProfile = await SupabaseService.getUserProfile(authUser.id);
          
          setUser(userData);
          setProfile(userProfile);
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        setError('Failed to initialize authentication');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          const userData = await SupabaseService.getUser(session.user.id);
          const userProfile = await SupabaseService.getUserProfile(session.user.id);
          
          setUser(userData);
          setProfile(userProfile);
        } catch (err) {
          console.error('Error fetching user data:', err);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Authentication functions
  const signUp = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Create user profile
        await SupabaseService.createUserProfile({
          user_id: data.user.id,
          username: `Player${data.user.id.slice(0, 8)}`,
          total_xp: 0,
          level: 1,
          games_played: 0,
          best_score: 0,
          achievements: [],
          preferences: {
            theme: 'dark',
            notifications: true,
            sound_enabled: true
          }
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Failed to sign out');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Profile functions
  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      setLoading(true);
      setError(null);
      
      const updatedProfile = await SupabaseService.updateUserProfile(user.id, updates);
      setProfile(updatedProfile);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Game session functions
  const createGameSession = useCallback(async (sessionData: Partial<GameSession>) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      setError(null);
      
      const newSession = await SupabaseService.createGameSession({
        ...sessionData,
        user_id: user.id
      });

      // Update user profile with new stats
      if (sessionData.score && profile) {
        const newBestScore = Math.max(profile.best_score, sessionData.score);
        const newGamesPlayed = profile.games_played + 1;
        const newTotalXP = profile.total_xp + (sessionData.score || 0);

        await updateProfile({
          best_score: newBestScore,
          games_played: newGamesPlayed,
          total_xp: newTotalXP
        });
      }

      return newSession;
    } catch (err: any) {
      setError(err.message || 'Failed to create game session');
      throw err;
    }
  }, [user, profile, updateProfile]);

  const getGameSessions = useCallback(async (limit = 10) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      setError(null);
      return await SupabaseService.getUserGameSessions(user.id, limit);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch game sessions');
      throw err;
    }
  }, [user]);

  // Leaderboard functions
  const getLeaderboard = useCallback(async (gameType: string, chainId: number, limit = 100) => {
    try {
      setError(null);
      return await SupabaseService.getLeaderboard(gameType, chainId, limit);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch leaderboard');
      throw err;
    }
  }, []);

  // Achievement functions
  const getAchievements = useCallback(async () => {
    try {
      setError(null);
      return await SupabaseService.getAchievements();
    } catch (err: any) {
      setError(err.message || 'Failed to fetch achievements');
      throw err;
    }
  }, []);

  const getUserAchievements = useCallback(async () => {
    if (!user) throw new Error('No user logged in');
    
    try {
      setError(null);
      return await SupabaseService.getUserAchievements(user.id);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user achievements');
      throw err;
    }
  }, [user]);

  const unlockAchievement = useCallback(async (achievementId: string) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      setError(null);
      
      const userAchievement = await SupabaseService.unlockAchievement(user.id, achievementId);
      
      // Update profile with new achievement
      if (profile) {
        const updatedAchievements = [...profile.achievements, achievementId];
        await updateProfile({ achievements: updatedAchievements });
      }

      return userAchievement;
    } catch (err: any) {
      setError(err.message || 'Failed to unlock achievement');
      throw err;
    }
  }, [user, profile, updateProfile]);

  // Quest functions
  const getQuests = useCallback(async () => {
    try {
      setError(null);
      return await SupabaseService.getQuests();
    } catch (err: any) {
      setError(err.message || 'Failed to fetch quests');
      throw err;
    }
  }, []);

  const getUserQuests = useCallback(async () => {
    if (!user) throw new Error('No user logged in');
    
    try {
      setError(null);
      return await SupabaseService.getUserQuests(user.id);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user quests');
      throw err;
    }
  }, [user]);

  const updateQuestProgress = useCallback(async (questId: string, progress: number) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      setError(null);
      
      const userQuest = await SupabaseService.updateQuestProgress(user.id, questId, progress);
      
      // If quest is completed, update XP
      if (progress >= 100 && profile) {
        // Get quest details to calculate XP reward
        const quests = await getQuests();
        const quest = quests.find(q => q.id === questId);
        
        if (quest) {
          const newTotalXP = profile.total_xp + quest.xp_reward;
          await updateProfile({ total_xp: newTotalXP });
        }
      }

      return userQuest;
    } catch (err: any) {
      setError(err.message || 'Failed to update quest progress');
      throw err;
    }
  }, [user, profile, updateProfile, getQuests]);

  return {
    user,
    profile,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    updateProfile,
    createGameSession,
    getGameSessions,
    getLeaderboard,
    getAchievements,
    getUserAchievements,
    getQuests,
    getUserQuests,
    unlockAchievement,
    updateQuestProgress,
  };
};

// Hook for real-time subscriptions
export const useSupabaseSubscription = (table: string, filter?: string) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let subscription: any;

    const setupSubscription = async () => {
      try {
        // Initial data fetch
        const { data: initialData, error } = await supabase
          .from(table)
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        setData(initialData || []);
        setLoading(false);

        // Set up real-time subscription
        subscription = supabase
          .channel(`${table}-changes`)
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: table,
            filter: filter
          }, (payload) => {
            console.log('Real-time update:', payload);
            
            if (payload.eventType === 'INSERT') {
              setData(prev => [payload.new, ...prev]);
            } else if (payload.eventType === 'UPDATE') {
              setData(prev => prev.map(item => 
                item.id === payload.new.id ? payload.new : item
              ));
            } else if (payload.eventType === 'DELETE') {
              setData(prev => prev.filter(item => item.id !== payload.old.id));
            }
          })
          .subscribe();
      } catch (error) {
        console.error('Error setting up subscription:', error);
        setLoading(false);
      }
    };

    setupSubscription();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [table, filter]);

  return { data, loading };
};

// Hook for leaderboard with real-time updates
export const useLeaderboard = (gameType: string, chainId: number, limit = 100) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let subscription: any;

    const setupLeaderboard = async () => {
      try {
        // Initial data fetch
        const { data, error } = await supabase
          .from('leaderboard_entries')
          .select('*')
          .eq('game_type', gameType)
          .eq('chain_id', chainId)
          .order('score', { ascending: false })
          .limit(limit);

        if (error) throw error;

        setLeaderboard(data || []);
        setLoading(false);

        // Set up real-time subscription
        subscription = supabase
          .channel(`leaderboard-${gameType}-${chainId}`)
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'leaderboard_entries',
            filter: `game_type=eq.${gameType}`
          }, (payload) => {
            console.log('Leaderboard update:', payload);
            
            if (payload.eventType === 'INSERT') {
              setLeaderboard(prev => {
                const newList = [payload.new, ...prev];
                return newList.sort((a, b) => b.score - a.score).slice(0, limit);
              });
            } else if (payload.eventType === 'UPDATE') {
              setLeaderboard(prev => {
                const updatedList = prev.map(item => 
                  item.id === payload.new.id ? payload.new : item
                );
                return updatedList.sort((a, b) => b.score - a.score);
              });
            }
          })
          .subscribe();
      } catch (error: any) {
        console.error('Error setting up leaderboard:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    setupLeaderboard();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [gameType, chainId, limit]);

  return { leaderboard, loading, error };
};

// Hook for user achievements with real-time updates
export const useUserAchievements = (userId?: string) => {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    let subscription: any;

    const setupAchievements = async () => {
      try {
        // Initial data fetch
        const { data, error } = await supabase
          .from('user_achievements')
          .select(`
            *,
            achievements (
              name,
              description,
              icon,
              xp_reward,
              rarity
            )
          `)
          .eq('user_id', userId);

        if (error) throw error;

        setAchievements(data || []);
        setLoading(false);

        // Set up real-time subscription
        subscription = supabase
          .channel(`user-achievements-${userId}`)
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'user_achievements',
            filter: `user_id=eq.${userId}`
          }, (payload) => {
            console.log('Achievement update:', payload);
            
            if (payload.eventType === 'INSERT') {
              setAchievements(prev => [payload.new, ...prev]);
            } else if (payload.eventType === 'UPDATE') {
              setAchievements(prev => prev.map(item => 
                item.id === payload.new.id ? payload.new : item
              ));
            }
          })
          .subscribe();
      } catch (error: any) {
        console.error('Error setting up achievements:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    setupAchievements();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [userId]);

  return { achievements, loading, error };
};

export default useSupabase;
