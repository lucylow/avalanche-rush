# Avalanche Rush Mock Data System

A comprehensive mock data system designed for hackathon demonstrations, testing, and development of the Avalanche Rush game. This system provides realistic data for all major game features including player profiles, quests, NFTs, guilds, tournaments, and analytics.

## 🚀 Quick Start

### Access Mock Data Demo
- **URL**: `/mock-data` or `/demo`
- **Component**: `MockDataDemo`
- **Purpose**: Interactive demo showcasing all mock data features

### Enable Mock Data in Components
```typescript
import { useMockData } from '../hooks/useMockData';

const MyComponent = () => {
  const mockData = useMockData();
  
  if (mockData.isMockDataEnabled) {
    // Use mock data
    const players = mockData.players;
    const quests = mockData.getActiveQuests();
  }
  
  return <div>Your component</div>;
};
```

## 📁 File Structure

```
src/data/mockData/
├── index.ts          # Main exports
├── types.ts          # TypeScript interfaces
├── data.ts           # Mock data definitions
├── service.ts        # Data access service
└── utils.ts          # Utilities and generators

src/hooks/
└── useMockData.ts    # React hooks for mock data

src/components/
├── MockDataToggle.tsx        # Configuration panel
└── PlayerProfileEnhanced.tsx # Enhanced player profile

src/pages/
└── MockDataDemo.tsx          # Demo page
```

## 🎯 Features

### Core Data Types
- **Player Profiles**: Complete player information with stats, skills, and progress
- **Game Sessions**: Detailed session data with scores, achievements, and rewards
- **Quests**: Multi-type quests (TRANSFER, DEFI, BRIDGE, ONBOARDING, CROSSCHAIN)
- **Achievement NFTs**: Rarity-based NFTs with metadata and attributes
- **Guilds**: Guild information with members, reputation, and resources
- **Tournaments**: Tournament brackets, participants, and prizes
- **Leaderboards**: Mode-specific leaderboards with rankings
- **Social Data**: Chat messages, friend invitations, guild invitations
- **Analytics**: Comprehensive metrics for users, games, and blockchain

### Interactive Features
- **Real-time Updates**: Auto-refresh data every 5 seconds
- **Event Generation**: Simulate live events every 10 seconds
- **Live Demo Controls**: Manual event triggering for presentations
- **Configuration Panel**: Toggle settings and view statistics
- **Search & Filter**: Find players, quests, NFTs by various criteria

## 🛠️ Usage Examples

### Basic Data Access
```typescript
import { mockDataService } from '../data/mockData';

// Get all players
const players = mockDataService.getPlayers();

// Get player by address
const player = mockDataService.getPlayerByAddress('0x...');

// Get active quests
const activeQuests = mockDataService.getActiveQuests();

// Get NFTs by owner
const playerNFTs = mockDataService.getNFTsByOwner('Web3Wanderer');
```

### Using React Hooks
```typescript
import { useMockData, useMockDataWithPlayer, useMockDataDemo } from '../hooks/useMockData';

// Basic hook
const mockData = useMockData();

// With player context
const playerMockData = useMockDataWithPlayer(playerAddress);

// Demo mode with enhanced features
const demoMockData = useMockDataDemo();
```

### Configuration
```typescript
import { mockDataState } from '../data/mockData';

// Update configuration
mockDataState.updateConfig({
  enableMockData: true,
  useRealTimeUpdates: true,
  autoGenerateEvents: true,
  demoMode: true
});
```

## 📊 Mock Data Overview

### Players (4 total)
- **Web3Wanderer**: Level 12, 114,625 total score, Avalanche Warriors guild
- **QuestStreaker**: Level 18, 239,830 total score, DeFi Masters guild
- **CryptoRunner**: Level 15, 129,900 total score, Avalanche Warriors guild
- **StakingQueen**: Level 21, 234,600 total score, DeFi Masters guild

### Quests (5 total)
- **First Steps in Web3**: Beginner TRANSFER quest, 500 RUSH reward
- **DeFi Trailblazer**: Intermediate DEFI quest, 1,500 RUSH reward
- **Cross-Chain Conqueror**: Advanced BRIDGE quest, 3,200 RUSH reward
- **Liquidity Pioneer**: Intermediate DEFI quest, 1,200 RUSH reward
- **Cross-Chain Explorer**: Advanced BRIDGE quest, 2,500 RUSH reward

### NFTs (6 total)
- **Bronze Adventurer**: Common rarity, TRANSFER quest reward
- **Silver DeFi Star**: Uncommon rarity, DEFI quest reward
- **Cross-Chain Champion**: Rare rarity, BRIDGE quest reward
- **Bronze Achiever**: Common rarity, ONBOARD quest reward
- **DeFi Pioneer**: Uncommon rarity, DEFI quest reward
- **Bridge Commander**: Rare rarity, BRIDGE quest reward

### Guilds (2 total)
- **Avalanche Warriors**: Level 11, 13,400 reputation, 6 wars won
- **DeFi Masters**: Level 9, 7,600 reputation, 4 wars won

### Tournaments (2 total)
- **September Grand Prix**: Live tournament, 50,000 prize pool
- **Early Adopter Cup**: In-progress tournament, 65,000 prize pool

## 🎮 Demo Scenarios

### Hackathon Presentation
1. **Start Demo Mode**: Enable auto-generate events
2. **Show Player Profiles**: Display Web3Wanderer's progress
3. **Complete Quest**: Simulate Cross-Chain Conqueror completion
4. **Mint NFT**: Show Bridge Commander NFT minting
5. **Update Leaderboard**: Display new rankings
6. **Guild Activity**: Show Avalanche Warriors achievements

### Live Demo Controls
- **Player Update**: Simulate player stat changes
- **Quest Complete**: Trigger quest completion events
- **NFT Minted**: Simulate NFT minting
- **Tournament Update**: Show tournament progress
- **Chat Message**: Add social interaction

## 🔧 Customization

### Adding New Mock Data
```typescript
// In data.ts
export const mockData: MockData = {
  players: [
    // Add new player
    {
      address: "0x...",
      username: "NewPlayer",
      level: 10,
      // ... other properties
    }
  ],
  // ... other data
};
```

### Creating Custom Generators
```typescript
import { MockDataGenerator } from '../data/mockData';

// Generate random player
const randomPlayer = MockDataGenerator.generateRandomPlayer();

// Generate random game session
const randomSession = MockDataGenerator.generateRandomGameSession(playerAddress);
```

### Custom Event Types
```typescript
import { MockDataEvent } from '../data/mockData';

const customEvent: MockDataEvent = {
  type: 'custom_event',
  timestamp: Date.now(),
  data: { custom: 'data' }
};

mockDataState.addEvent(customEvent);
```

## 🎨 UI Components

### MockDataToggle Component
- **Purpose**: Configuration panel for mock data settings
- **Features**: Toggle switches, statistics, event simulation
- **Usage**: `<MockDataToggle isOpen={isOpen} onClose={onClose} />`

### PlayerProfileEnhanced Component
- **Purpose**: Enhanced player profile with mock data integration
- **Features**: Real-time stats, achievements, NFTs, guild info
- **Usage**: `<PlayerProfileEnhanced address={address} />`

## 📈 Analytics Integration

### Available Metrics
- **User Metrics**: Total users, active users, retention rate
- **Game Metrics**: Total games, average score, completion rate
- **Blockchain Metrics**: Transactions, contract interactions, NFT mints
- **Rewards Distribution**: Total rewards, average reward, pending claims

### Real-time Updates
- Auto-refresh every 5 seconds when enabled
- Event-driven updates for live demonstrations
- Configurable refresh intervals

## 🚀 Production Considerations

### Security
- Mock data is safe for production use
- No sensitive information included
- All addresses are placeholder values

### Performance
- Lazy loading for better performance
- Configurable refresh intervals
- Efficient data structures

### Scalability
- Easy to extend with new data types
- Modular architecture
- Type-safe interfaces

## 🎯 Best Practices

### For Hackathons
1. **Enable Demo Mode**: Use `useMockDataDemo()` hook
2. **Show Live Events**: Enable auto-generate events
3. **Prepare Scenarios**: Plan your demo flow
4. **Use Controls**: Leverage manual event triggers

### For Development
1. **Type Safety**: Use provided TypeScript interfaces
2. **Service Layer**: Use `mockDataService` for data access
3. **React Hooks**: Use hooks for component integration
4. **Configuration**: Use `mockDataState` for settings

### For Testing
1. **Consistent Data**: Use same mock data across tests
2. **Edge Cases**: Test with various data combinations
3. **Performance**: Monitor with large datasets
4. **Integration**: Test with real components

## 🔗 Integration Points

### Existing Components
- **PlayerProfile**: Enhanced with mock data support
- **LeaderboardSystem**: Uses mock leaderboard data
- **QuestDashboard**: Integrates with mock quest data
- **AnalyticsDashboard**: Shows mock analytics

### Smart Contracts
- Mock data can be used to simulate contract interactions
- Safe for testing without real blockchain calls
- Perfect for demo environments

## 📝 API Reference

### MockDataService Methods
- `getPlayers()`: Get all players
- `getPlayerByAddress(address)`: Get specific player
- `getActiveQuests()`: Get active quests
- `getNFTsByOwner(owner)`: Get player's NFTs
- `getGuildStats(guildId)`: Get guild statistics
- `searchPlayers(query)`: Search players
- `getRandomPlayer()`: Get random player

### Hook Methods
- `useMockData()`: Basic mock data hook
- `useMockDataWithPlayer(address)`: Player-specific hook
- `useMockDataDemo()`: Demo mode hook

### Configuration Methods
- `updateConfig(config)`: Update settings
- `addEvent(event)`: Add custom event
- `getEvents()`: Get all events
- `clearEvents()`: Clear event history

## 🎉 Conclusion

The Avalanche Rush Mock Data System provides a comprehensive solution for demonstrations, testing, and development. With realistic data, interactive features, and easy integration, it's perfect for hackathons, presentations, and development workflows.

**Happy coding and good luck with your hackathon! 🚀**
