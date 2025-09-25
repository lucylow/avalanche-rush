// Environment configuration for Avalanche Rush

export const ENV_CONFIG = {
  // Network Configuration
  NETWORK: process.env.REACT_APP_NETWORK || 'fuji',
  CHAIN_ID: parseInt(process.env.REACT_APP_CHAIN_ID || '43113'),
  
  // Contract Addresses
  CONTRACTS: {
    AVALANCHE_RUSH_CORE: process.env.REACT_APP_AVALANCHE_RUSH_CORE || '0x1234567890123456789012345678901234567890',
    REACTIVE_QUEST_ENGINE: process.env.REACT_APP_REACTIVE_QUEST_ENGINE || '0x2345678901234567890123456789012345678901',
    EDUCATIONAL_NFT: process.env.REACT_APP_EDUCATIONAL_NFT || '0x3456789012345678901234567890123456789012',
    RUSH_TOKEN: process.env.REACT_APP_RUSH_TOKEN || '0x4567890123456789012345678901234567890123',
    MOCK_DEX: process.env.REACT_APP_MOCK_DEX || '0x5678901234567890123456789012345678901234'
  },
  
  // RPC URLs
  RPC_URLS: {
    FUJI: process.env.REACT_APP_FUJI_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc',
    MAINNET: process.env.REACT_APP_MAINNET_RPC_URL || 'https://api.avax.network/ext/bc/C/rpc'
  },
  
  // Explorer URLs
  EXPLORER_URLS: {
    FUJI: process.env.REACT_APP_FUJI_EXPLORER_URL || 'https://testnet.snowtrace.io',
    MAINNET: process.env.REACT_APP_MAINNET_EXPLORER_URL || 'https://snowtrace.io'
  },
  
  // App Configuration
  APP: {
    VERSION: process.env.REACT_APP_VERSION || '2.0.0',
    NAME: process.env.REACT_APP_NAME || 'Avalanche Rush'
  },
  
  // Feature Flags
  FEATURES: {
    ENABLE_ANALYTICS: process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
    ENABLE_ERROR_REPORTING: process.env.REACT_APP_ENABLE_ERROR_REPORTING === 'true',
    ENABLE_PERFORMANCE_MONITORING: process.env.REACT_APP_ENABLE_PERFORMANCE_MONITORING !== 'false'
  },
  
  // API Keys
  API_KEYS: {
    ALCHEMY: process.env.REACT_APP_ALCHEMY_API_KEY,
    INFURA: process.env.REACT_APP_INFURA_API_KEY
  },
  
  // Crossmint Configuration
  CROSSMINT: {
    ENVIRONMENT: process.env.REACT_APP_CROSSMINT_ENVIRONMENT || 'staging',
    COLLECTION_ID: process.env.REACT_APP_CROSSMINT_COLLECTION_ID
  }
};

// Network configurations
export const NETWORKS = {
  FUJI: {
    chainId: 43113,
    name: 'Avalanche Fuji Testnet',
    rpcUrl: ENV_CONFIG.RPC_URLS.FUJI,
    explorerUrl: ENV_CONFIG.EXPLORER_URLS.FUJI,
    nativeCurrency: {
      name: 'AVAX',
      symbol: 'AVAX',
      decimals: 18
    }
  },
  MAINNET: {
    chainId: 43114,
    name: 'Avalanche C-Chain',
    rpcUrl: ENV_CONFIG.RPC_URLS.MAINNET,
    explorerUrl: ENV_CONFIG.EXPLORER_URLS.MAINNET,
    nativeCurrency: {
      name: 'AVAX',
      symbol: 'AVAX',
      decimals: 18
    }
  }
};

// Get current network configuration
export const getCurrentNetwork = () => {
  switch (ENV_CONFIG.NETWORK) {
    case 'mainnet':
      return NETWORKS.MAINNET;
    case 'fuji':
    default:
      return NETWORKS.FUJI;
  }
};

// Validate environment configuration
export const validateConfig = () => {
  const errors: string[] = [];
  
  if (!ENV_CONFIG.CONTRACTS.AVALANCHE_RUSH_CORE || ENV_CONFIG.CONTRACTS.AVALANCHE_RUSH_CORE === '0x1234567890123456789012345678901234567890') {
    errors.push('AVALANCHE_RUSH_CORE contract address not configured');
  }
  
  if (!ENV_CONFIG.CONTRACTS.REACTIVE_QUEST_ENGINE || ENV_CONFIG.CONTRACTS.REACTIVE_QUEST_ENGINE === '0x2345678901234567890123456789012345678901') {
    errors.push('REACTIVE_QUEST_ENGINE contract address not configured');
  }
  
  if (!ENV_CONFIG.CONTRACTS.EDUCATIONAL_NFT || ENV_CONFIG.CONTRACTS.EDUCATIONAL_NFT === '0x3456789012345678901234567890123456789012') {
    errors.push('EDUCATIONAL_NFT contract address not configured');
  }
  
  if (!ENV_CONFIG.CONTRACTS.RUSH_TOKEN || ENV_CONFIG.CONTRACTS.RUSH_TOKEN === '0x4567890123456789012345678901234567890123') {
    errors.push('RUSH_TOKEN contract address not configured');
  }
  
  if (!ENV_CONFIG.CONTRACTS.MOCK_DEX || ENV_CONFIG.CONTRACTS.MOCK_DEX === '0x5678901234567890123456789012345678901234') {
    errors.push('MOCK_DEX contract address not configured');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export default ENV_CONFIG;
