# 🗄️ Supabase Setup Guide for Avalanche Rush

This guide will help you set up Supabase for the Avalanche Rush project, providing a robust backend for user management, real-time features, and data persistence.

## 🚀 **Quick Start**

### **1. Create Supabase Project**

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: `avalanche-rush`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
6. Click "Create new project"

### **2. Get Project Credentials**

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://your-project.supabase.co`)
   - **Anon public key** (starts with `eyJ...`)

### **3. Configure Environment Variables**

1. Copy `src/config/supabase.env.example` to `.env.local`
2. Update the values:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **4. Set Up Database Schema**

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy the contents of `supabase-schema.sql`
3. Paste and run the SQL script
4. This will create all necessary tables, functions, and policies

### **5. Configure Authentication**

1. Go to **Authentication** → **Settings**
2. Configure the following:

#### **Site URL**
```
http://localhost:8080
```

#### **Redirect URLs**
```
http://localhost:8080/**
https://your-domain.com/**
```

#### **Email Templates** (Optional)
Customize the email templates for better user experience.

### **6. Set Up Row Level Security (RLS)**

The schema includes RLS policies, but you can customize them:

1. Go to **Authentication** → **Policies**
2. Review and adjust policies as needed
3. Ensure RLS is enabled for all tables

## 📊 **Database Schema Overview**

### **Core Tables**

#### **Users & Profiles**
- `users` - User accounts and authentication
- `user_profiles` - Extended user information and gaming stats

#### **Gaming Data**
- `game_sessions` - Individual game session records
- `leaderboard_entries` - Leaderboard rankings
- `achievements` - Available achievements
- `user_achievements` - User progress on achievements
- `quests` - Available quests
- `user_quests` - User progress on quests

#### **Cross-Chain & Analytics**
- `cross_chain_transactions` - Cross-chain asset migration records
- `reactive_events` - Reactive Smart Contract event logs
- `performance_metrics` - System performance data

### **Key Features**

#### **Real-time Subscriptions**
- Leaderboard updates
- Achievement unlocks
- Game session tracking
- Cross-chain transaction status

#### **Automated Functions**
- User level calculation based on XP
- Leaderboard rank updates
- Performance metrics logging
- Data cleanup routines

#### **Security**
- Row Level Security (RLS) policies
- User data isolation
- Public read access for leaderboards
- Authenticated write access for user data

## 🔧 **Development Setup**

### **Using Mock Supabase (Development)**

If you don't want to set up a real Supabase instance for development:

1. The `src/lib/supabase.ts` file includes a mock implementation
2. It will automatically fall back to mock data if Supabase is not configured
3. All features will work with mock data for testing

### **Local Development**

1. Start the development server:
```bash
npm run dev
```

2. The app will use mock Supabase data by default
3. All database operations will be simulated
4. Real-time features will work with mock updates

## 🚀 **Production Deployment**

### **1. Environment Variables**

Set up environment variables in your deployment platform:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### **2. Database Migration**

1. Run the schema migration in production
2. Set up database backups
3. Configure monitoring and alerts

### **3. Performance Optimization**

1. **Indexes**: The schema includes optimized indexes
2. **Connection Pooling**: Configure connection pooling in Supabase
3. **Caching**: Implement Redis caching for frequently accessed data
4. **CDN**: Use Supabase's CDN for static assets

## 📈 **Monitoring & Analytics**

### **Supabase Dashboard**

Monitor your application through the Supabase dashboard:

1. **Database**: View table sizes, query performance
2. **Authentication**: Monitor user signups, active users
3. **API**: Track API usage, response times
4. **Logs**: View application logs and errors

### **Custom Metrics**

The schema includes a `performance_metrics` table for custom analytics:

```sql
-- Log a performance metric
SELECT log_performance_metric('user_retention', 92.5, NULL);

-- Get performance metrics
SELECT * FROM get_performance_metrics('user_retention', 24);
```

## 🔒 **Security Best Practices**

### **1. Row Level Security (RLS)**

- All tables have RLS enabled
- Users can only access their own data
- Public read access for leaderboards and achievements
- Authenticated write access for user data

### **2. API Security**

- Use the anon key for client-side operations
- Implement server-side validation
- Rate limiting on API endpoints
- Input sanitization and validation

### **3. Data Privacy**

- User data is isolated by user ID
- Sensitive data is encrypted
- Regular security audits
- GDPR compliance features

## 🛠️ **Advanced Configuration**

### **1. Custom Functions**

The schema includes several custom functions:

```sql
-- Calculate user level based on XP
SELECT calculate_user_level(15000); -- Returns 3

-- Get user's rank in leaderboard
SELECT get_user_rank('user-id', 'avalanche-rush', 43113);

-- Get top players
SELECT * FROM get_top_players('avalanche-rush', 43113, 10);
```

### **2. Real-time Subscriptions**

Set up real-time subscriptions in your React components:

```typescript
import { useSupabaseSubscription } from '../hooks/useSupabase';

// Subscribe to leaderboard updates
const { data: leaderboard } = useSupabaseSubscription('leaderboard_entries');

// Subscribe to user achievements
const { data: achievements } = useSupabaseSubscription('user_achievements', 'user_id=eq.user-id');
```

### **3. Performance Optimization**

#### **Database Indexes**
The schema includes optimized indexes for:
- User lookups by wallet address
- Game sessions by user and date
- Leaderboard queries by game type and chain
- Achievement and quest lookups

#### **Query Optimization**
- Use specific column selections
- Implement pagination for large datasets
- Cache frequently accessed data
- Use database views for complex queries

## 🐛 **Troubleshooting**

### **Common Issues**

#### **1. Authentication Errors**
```
Error: Invalid JWT token
```
**Solution**: Check your Supabase URL and anon key

#### **2. RLS Policy Errors**
```
Error: Row Level Security policy violation
```
**Solution**: Ensure user is authenticated and policies are correct

#### **3. Real-time Connection Issues**
```
Error: Failed to establish real-time connection
```
**Solution**: Check network connectivity and Supabase status

### **Debug Mode**

Enable debug mode in development:

```typescript
// In src/lib/supabase.ts
const supabase = createClient(url, key, {
  auth: {
    debug: true
  }
});
```

## 📚 **Additional Resources**

### **Documentation**
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

### **Community**
- [Supabase Discord](https://discord.supabase.com)
- [GitHub Discussions](https://github.com/supabase/supabase/discussions)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/supabase)

### **Examples**
- [Supabase Examples](https://github.com/supabase/supabase/tree/master/examples)
- [React + Supabase Tutorials](https://supabase.com/docs/guides/getting-started/tutorials/with-react)

## 🎉 **You're Ready!**

Your Supabase backend is now set up and ready to power the Avalanche Rush application with:

- ✅ **User Authentication** - Secure user management
- ✅ **Real-time Features** - Live leaderboards and updates
- ✅ **Data Persistence** - Reliable data storage
- ✅ **Performance Monitoring** - Built-in analytics
- ✅ **Security** - Row-level security and data isolation
- ✅ **Scalability** - Ready for production use

The Avalanche Rush application will now have a robust backend supporting all the hackathon-winning features!
