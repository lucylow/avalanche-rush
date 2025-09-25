# Avalanche Rush - Wallet Connection Setup

## Overview
This project includes a comprehensive wallet connection system specifically designed for Avalanche networks. The wallet connector supports MetaMask and automatically handles network switching to Avalanche Fuji Testnet and Avalanche Mainnet.

## Features

### ✅ Wallet Connection
- **MetaMask Integration**: Seamless connection with MetaMask wallet
- **Auto Network Detection**: Automatically detects and displays current network
- **Network Switching**: One-click switching to supported networks
- **Error Handling**: User-friendly error messages for common issues

### ✅ Supported Networks
- **Avalanche Fuji Testnet** (Chain ID: 43113) - For testing
- **Avalanche Mainnet** (Chain ID: 43114) - For production
- **Reactive Network** (Chain ID: 5318008) - Additional support

### ✅ Smart Contract Integration
- **Game Logic**: AvalancheRushCore contract integration
- **Quest Engine**: ReactiveQuestEngine for educational quests
- **NFT System**: EducationalNFT for achievement tokens
- **Token Management**: RUSH token balance and transfers
- **DEX Integration**: Mock DEX for token swapping

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env.local` file with your contract addresses:
```env
VITE_AVALANCHE_RUSH_CORE_ADDRESS=0x...
VITE_REACTIVE_QUEST_ENGINE_ADDRESS=0x...
VITE_EDUCATIONAL_NFT_ADDRESS=0x...
VITE_RUSH_TOKEN_ADDRESS=0x...
VITE_MOCK_DEX_ADDRESS=0x...
```

### 3. Run the Application
```bash
npm run dev
```

## Usage

### Connecting Your Wallet
1. Click the "Connect Wallet" button in the top navigation
2. Select MetaMask from the wallet options
3. Approve the connection in your MetaMask popup
4. The wallet will automatically switch to Avalanche Fuji Testnet if needed

### Network Management
- The wallet connector automatically detects your current network
- If you're on an unsupported network, a "Switch Network" button will appear
- Click it to switch to Avalanche Fuji Testnet or Avalanche Mainnet

### Getting Test Tokens
For Avalanche Fuji Testnet:
1. Visit the [Avalanche Faucet](https://faucet.avax.network/)
2. Enter your wallet address
3. Request test AVAX tokens

## Technical Details

### Web3 Hook (`useAdvancedWeb3`)
The `useAdvancedWeb3` hook provides:
- Wallet connection management
- Contract instance creation
- Network switching functionality
- Game session management
- Token and NFT operations
- Event listening

### Wallet Connector Component
The `EnhancedWalletConnector` component provides:
- Connection UI with loading states
- Network status indicators
- Error handling with user-friendly messages
- Balance display
- Network switching modal

### Contract Integration
The system integrates with multiple smart contracts:
- **AvalancheRushCore**: Main game logic and scoring
- **ReactiveQuestEngine**: Educational quest system
- **EducationalNFT**: Achievement NFT minting
- **RushToken**: ERC-20 token for rewards
- **MockDEX**: Token swapping functionality

## Troubleshooting

### Common Issues

1. **"MetaMask not detected"**
   - Install MetaMask browser extension
   - Refresh the page after installation

2. **"Network not supported"**
   - Click "Switch Network" button
   - Or manually add Avalanche network in MetaMask

3. **"Transaction failed"**
   - Ensure you have sufficient AVAX for gas fees
   - Check that you're on the correct network
   - Try increasing gas limit in MetaMask

4. **"Contract not found"**
   - Verify contract addresses in `.env.local`
   - Ensure contracts are deployed on the current network

### Network Configuration
To manually add Avalanche networks in MetaMask:

**Avalanche Fuji Testnet:**
- Network Name: Avalanche Fuji Testnet
- RPC URL: https://api.avax-test.network/ext/bc/C/rpc
- Chain ID: 43113
- Symbol: AVAX
- Explorer: https://testnet.snowtrace.io

**Avalanche Mainnet:**
- Network Name: Avalanche Mainnet
- RPC URL: https://api.avax.network/ext/bc/C/rpc
- Chain ID: 43114
- Symbol: AVAX
- Explorer: https://snowtrace.io

## Development

### Adding New Networks
To add support for additional networks:

1. Update `NETWORKS` object in `useAdvancedWeb3.ts`
2. Add network info to `supportedNetworks` in `EnhancedWalletConnector.tsx`
3. Update network validation logic

### Customizing Contract Addresses
Contract addresses are managed through environment variables:
- Update `.env.local` with your deployed contract addresses
- The system will automatically use these addresses for contract interactions

## Security Notes
- Always verify contract addresses before interacting
- Use testnet for development and testing
- Never share your private keys or seed phrases
- Be cautious of phishing attempts

## Support
For technical support or questions about the wallet integration, please refer to the project documentation or contact the development team.
