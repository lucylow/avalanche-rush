// Supabase client configuration for Avalanche Rush
// This provides a mock implementation for development

export interface SupabaseClient {
  auth: {
    signUp: (email: string, password: string) => Promise<any>;
    signIn: (email: string, password: string) => Promise<any>;
    signOut: () => Promise<any>;
    getUser: () => Promise<any>;
    onAuthStateChange: (callback: (event: string, session: any) => void) => any;
  };
  from: (table: string) => {
    select: (columns?: string) => any;
    insert: (data: any) => any;
    update: (data: any) => any;
    delete: () => any;
    upsert: (data: any) => any;
  };
  channel: (name: string) => {
    on: (event: string, callback: (payload: any) => void) => any;
    subscribe: () => any;
    unsubscribe: () => any;
  };
}

// Mock Supabase client for development
class MockSupabaseClient implements SupabaseClient {
  auth = {
    signUp: async (email: string, password: string) => {
      console.log('Mock signUp:', email);
      return {
        data: {
          user: {
            id: 'mock-user-id',
            email: email,
            created_at: new Date().toISOString()
          },
          session: {
            access_token: 'mock-access-token',
            refresh_token: 'mock-refresh-token'
          }
        },
        error: null
      };
    },
    signIn: async (email: string, password: string) => {
      console.log('Mock signIn:', email);
      return {
        data: {
          user: {
            id: 'mock-user-id',
            email: email
          },
          session: {
            access_token: 'mock-access-token',
            refresh_token: 'mock-refresh-token'
          }
        },
        error: null
      };
    },
    signOut: async () => {
      console.log('Mock signOut');
      return { error: null };
    },
    getUser: async () => {
      return {
        data: {
          user: {
            id: 'mock-user-id',
            email: 'user@example.com'
          }
        },
        error: null
      };
    },
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      console.log('Mock onAuthStateChange');
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  };

  from = (table: string) => {
    console.log('Mock from table:', table);
    return {
      select: (columns?: string) => ({
        eq: (column: string, value: any) => ({
          single: () => Promise.resolve({ data: null, error: null }),
          then: (callback: any) => Promise.resolve(callback({ data: [], error: null }))
        }),
        then: (callback: any) => Promise.resolve(callback({ data: [], error: null }))
      }),
      insert: (data: any) => ({
        select: () => Promise.resolve({ data: [data], error: null }),
        then: (callback: any) => Promise.resolve(callback({ data: [data], error: null }))
      }),
      update: (data: any) => ({
        eq: (column: string, value: any) => ({
          select: () => Promise.resolve({ data: [data], error: null }),
          then: (callback: any) => Promise.resolve(callback({ data: [data], error: null }))
        })
      }),
      delete: () => ({
        eq: (column: string, value: any) => ({
          then: (callback: any) => Promise.resolve(callback({ data: [], error: null }))
        })
      }),
      upsert: (data: any) => ({
        select: () => Promise.resolve({ data: [data], error: null }),
        then: (callback: any) => Promise.resolve(callback({ data: [data], error: null }))
      })
    };
  };

  channel = (name: string) => {
    console.log('Mock channel:', name);
    return {
      on: (event: string, callback: (payload: any) => void) => {
        console.log('Mock channel on:', event);
        return this;
      },
      subscribe: () => {
        console.log('Mock channel subscribe');
        return this;
      },
      unsubscribe: () => {
        console.log('Mock channel unsubscribe');
        return this;
      }
    };
  };
}

// Environment variables for Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Create Supabase client
let supabase: SupabaseClient;

try {
  // Try to import the real Supabase client
  // @ts-ignore
  const { createClient } = await import('@supabase/supabase-js');
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log('✅ Real Supabase client initialized');
} catch (error) {
  // Fall back to mock client for development
  console.log('⚠️ Using mock Supabase client for development');
  supabase = new MockSupabaseClient();
}

export { supabase };

// Database types for Avalanche Rush
export interface User {
  id: string;
  email: string;
  wallet_address?: string;
  created_at: string;
  updated_at: string;
  profile?: UserProfile;
}

export interface UserProfile {
  id: string;
  user_id: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
  total_xp: number;
  level: number;
  games_played: number;
  best_score: number;
  achievements: string[];
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
    sound_enabled: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface GameSession {
  id: string;
  user_id: string;
  game_type: string;
  score: number;
  duration: number;
  level_reached: number;
  power_ups_used: number;
  chain_id: number;
  transaction_hash?: string;
  created_at: string;
}

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  username: string;
  score: number;
  game_type: string;
  chain_id: number;
  rank: number;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp_reward: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirements: {
    type: string;
    value: number;
  };
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  progress: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'special';
  xp_reward: number;
  token_reward: number;
  requirements: {
    type: string;
    value: number;
  };
  is_active: boolean;
  expires_at?: string;
  created_at: string;
}

export interface UserQuest {
  id: string;
  user_id: string;
  quest_id: string;
  progress: number;
  completed: boolean;
  completed_at?: string;
  created_at: string;
}

// Database service functions
export class SupabaseService {
  // User management
  static async createUser(userData: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getUser(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) return null;
    return data;
  }

  static async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // User profile management
  static async createUserProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert(profileData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) return null;
    return data;
  }

  static async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Game session management
  static async createGameSession(sessionData: Partial<GameSession>): Promise<GameSession> {
    const { data, error } = await supabase
      .from('game_sessions')
      .insert(sessionData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getUserGameSessions(userId: string, limit = 10): Promise<GameSession[]> {
    const { data, error } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  }

  // Leaderboard management
  static async getLeaderboard(gameType: string, chainId: number, limit = 100): Promise<LeaderboardEntry[]> {
    const { data, error } = await supabase
      .from('leaderboard_entries')
      .select('*')
      .eq('game_type', gameType)
      .eq('chain_id', chainId)
      .order('score', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  }

  static async updateLeaderboard(entryData: Partial<LeaderboardEntry>): Promise<LeaderboardEntry> {
    const { data, error } = await supabase
      .from('leaderboard_entries')
      .upsert(entryData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Achievement management
  static async getAchievements(): Promise<Achievement[]> {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('is_active', true);
    
    if (error) throw error;
    return data || [];
  }

  static async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    const { data, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data || [];
  }

  static async unlockAchievement(userId: string, achievementId: string): Promise<UserAchievement> {
    const { data, error } = await supabase
      .from('user_achievements')
      .insert({
        user_id: userId,
        achievement_id: achievementId,
        unlocked_at: new Date().toISOString(),
        progress: 100
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Quest management
  static async getQuests(): Promise<Quest[]> {
    const { data, error } = await supabase
      .from('quests')
      .select('*')
      .eq('is_active', true);
    
    if (error) throw error;
    return data || [];
  }

  static async getUserQuests(userId: string): Promise<UserQuest[]> {
    const { data, error } = await supabase
      .from('user_quests')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data || [];
  }

  static async updateQuestProgress(userId: string, questId: string, progress: number): Promise<UserQuest> {
    const { data, error } = await supabase
      .from('user_quests')
      .upsert({
        user_id: userId,
        quest_id: questId,
        progress,
        completed: progress >= 100,
        completed_at: progress >= 100 ? new Date().toISOString() : null
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Real-time subscriptions
  static subscribeToLeaderboard(gameType: string, chainId: number, callback: (payload: any) => void) {
    return supabase
      .channel(`leaderboard-${gameType}-${chainId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'leaderboard_entries',
        filter: `game_type=eq.${gameType}`
      }, callback)
      .subscribe();
  }

  static subscribeToUserAchievements(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`user-achievements-${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_achievements',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe();
  }

  static subscribeToGameSessions(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`game-sessions-${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'game_sessions',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe();
  }
}

export default supabase;
