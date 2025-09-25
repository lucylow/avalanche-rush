import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSmartContracts } from '../../hooks/useSmartContracts';
import { NFTAchievement } from '../../services/SmartContractService';

interface NFTMarketplaceProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MarketplaceNFT extends NFTAchievement {
  price?: number;
  isForSale?: boolean;
  owner?: string;
}

const NFTMarketplace: React.FC<NFTMarketplaceProps> = ({ isOpen, onClose }) => {
  const { 
    isConnected, 
    account, 
    getPlayerNFTs, 
    getRushBalance 
  } = useSmartContracts();

  const [nfts, setNfts] = useState<MarketplaceNFT[]>([]);
  const [rushBalance, setRushBalance] = useState<string>('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'owned' | 'marketplace'>('owned');

  // Rarity configurations
  const RARITY_CONFIG = {
    1: { name: 'Common', color: 'from-gray-500 to-gray-600', icon: '⚪', multiplier: 1 },
    2: { name: 'Uncommon', color: 'from-green-500 to-green-600', icon: '🟢', multiplier: 2 },
    3: { name: 'Rare', color: 'from-blue-500 to-blue-600', icon: '🔵', multiplier: 5 },
    4: { name: 'Epic', color: 'from-purple-500 to-purple-600', icon: '🟣', multiplier: 10 },
    5: { name: 'Legendary', color: 'from-orange-500 to-orange-600', icon: '🟠', multiplier: 25 }
  };

  // Load NFT data
  const loadNFTData = useCallback(async () => {
    if (!isConnected || !account) return;

    setLoading(true);
    setError(null);

    try {
      // Load player's NFTs
      const playerNFTs = await getPlayerNFTs(account);
      
      // Add marketplace data (in a real app, this would come from the contract)
      const marketplaceNFTs: MarketplaceNFT[] = playerNFTs.map(nft => ({
        ...nft,
        price: nft.isRare ? 1000 : 100,
        isForSale: false,
        owner: account
      }));

      // Add some sample marketplace NFTs
      const sampleMarketplaceNFTs: MarketplaceNFT[] = [
        {
          tokenId: 1001,
          achievementId: 1,
          rarity: 3,
          score: 5000,
          name: 'Speed Demon',
          isRare: true,
          timestamp: Date.now() / 1000,
          price: 2500,
          isForSale: true,
          owner: '0x1234567890123456789012345678901234567890'
        },
        {
          tokenId: 1002,
          achievementId: 2,
          rarity: 4,
          score: 10000,
          name: 'Survival Master',
          isRare: true,
          timestamp: Date.now() / 1000,
          price: 5000,
          isForSale: true,
          owner: '0x2345678901234567890123456789012345678901'
        }
      ];

      setNfts([...marketplaceNFTs, ...sampleMarketplaceNFTs]);

      // Load RUSH balance
      const balance = await getRushBalance(account);
      setRushBalance(balance);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load NFT data');
    } finally {
      setLoading(false);
    }
  }, [isConnected, account, getPlayerNFTs, getRushBalance]);

  // Buy NFT
  const handleBuyNFT = useCallback(async (nft: MarketplaceNFT) => {
    if (!isConnected || !account || !nft.price) return;

    setLoading(true);
    try {
      // In a real app, this would call the marketplace contract
      console.log('Buying NFT:', nft.tokenId, 'for', nft.price, 'RUSH');
      
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Refresh data
      await loadNFTData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to buy NFT');
    } finally {
      setLoading(false);
    }
  }, [isConnected, account, loadNFTData]);

  // Sell NFT
  const handleSellNFT = useCallback(async (nft: MarketplaceNFT, price: number) => {
    if (!isConnected || !account) return;

    setLoading(true);
    try {
      // In a real app, this would call the marketplace contract
      console.log('Selling NFT:', nft.tokenId, 'for', price, 'RUSH');
      
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Refresh data
      await loadNFTData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sell NFT');
    } finally {
      setLoading(false);
    }
  }, [isConnected, account, loadNFTData]);

  // Format address
  const formatAddress = (address: string): string => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Load data when component opens
  useEffect(() => {
    if (isOpen && isConnected) {
      loadNFTData();
    }
  }, [isOpen, isConnected, loadNFTData]);

  if (!isOpen) return null;

  const ownedNFTs = nfts.filter(nft => nft.owner === account);
  const marketplaceNFTs = nfts.filter(nft => nft.isForSale && nft.owner !== account);
  const currentNFTs = activeTab === 'owned' ? ownedNFTs : marketplaceNFTs;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl border border-white/10 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl">
              <span className="text-2xl">🎨</span>
            </div>
            <div>
              <h2 className="text-3xl font-black text-white">
                NFT Marketplace
              </h2>
              <p className="text-white/70">Trade achievement NFTs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors"
          >
            <span className="text-white text-xl">×</span>
          </button>
        </div>

        {/* Balance Display */}
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl p-4 mb-6 border border-yellow-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-sm font-bold">💎</span>
              </div>
              <div>
                <div className="text-white font-bold text-lg">{rushBalance} RUSH</div>
                <div className="text-white/70 text-sm">Available Balance</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-bold">{ownedNFTs.length} NFTs</div>
              <div className="text-white/70 text-sm">Owned</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('owned')}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              activeTab === 'owned'
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
            }`}
          >
            My NFTs ({ownedNFTs.length})
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('marketplace')}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              activeTab === 'marketplace'
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
            }`}
          >
            Marketplace ({marketplaceNFTs.length})
          </motion.button>
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6"
          >
            <div className="flex items-center space-x-3">
              <span className="text-red-400 text-xl">⚠️</span>
              <span className="text-white font-medium">{error}</span>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            <span className="text-white ml-3">Loading NFTs...</span>
          </div>
        )}

        {/* NFT Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {currentNFTs.map((nft, index) => {
                const rarityConfig = RARITY_CONFIG[nft.rarity as keyof typeof RARITY_CONFIG];
                
                return (
                  <motion.div
                    key={nft.tokenId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 relative overflow-hidden group"
                  >
                    {/* Rarity Badge */}
                    <div className={`absolute top-4 right-4 w-10 h-10 bg-gradient-to-br ${rarityConfig.color} rounded-lg flex items-center justify-center shadow-lg`}>
                      <span className="text-lg">{rarityConfig.icon}</span>
                    </div>

                    {/* NFT Image Placeholder */}
                    <div className={`w-full h-32 bg-gradient-to-br ${rarityConfig.color} rounded-xl mb-4 flex items-center justify-center`}>
                      <span className="text-4xl">🏆</span>
                    </div>

                    {/* NFT Info */}
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-white mb-1">
                        {nft.name}
                      </h3>
                      <p className="text-white/70 text-sm">
                        {rarityConfig.name} • Score: {nft.score.toLocaleString()}
                      </p>
                      <p className="text-white/60 text-xs mt-1">
                        Token ID: #{nft.tokenId}
                      </p>
                    </div>

                    {/* Price/Actions */}
                    {activeTab === 'owned' ? (
                      <div className="space-y-3">
                        {nft.isForSale ? (
                          <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-3">
                            <div className="text-green-400 font-bold text-center">
                              Listed for {nft.price} RUSH
                            </div>
                          </div>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              const price = prompt('Enter price in RUSH:');
                              if (price && !isNaN(parseFloat(price))) {
                                handleSellNFT(nft, parseFloat(price));
                              }
                            }}
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-bold py-2 px-4 rounded-xl transition-all duration-300"
                          >
                            List for Sale
                          </motion.button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-3">
                          <div className="text-yellow-400 font-bold text-center">
                            {nft.price} RUSH
                          </div>
                          <div className="text-white/70 text-xs text-center">
                            by {formatAddress(nft.owner || '')}
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleBuyNFT(nft)}
                          disabled={loading || parseFloat(rushBalance) < (nft.price || 0)}
                          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold py-2 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Buy NFT
                        </motion.button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Empty State */}
        {!loading && currentNFTs.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">
                {activeTab === 'owned' ? '🎨' : '🛒'}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {activeTab === 'owned' ? 'No NFTs Owned' : 'No NFTs Available'}
            </h3>
            <p className="text-white/70">
              {activeTab === 'owned' 
                ? 'Complete quests and games to earn achievement NFTs'
                : 'Check back later for new NFTs on the marketplace'
              }
            </p>
          </div>
        )}

        {/* Not Connected State */}
        {!isConnected && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔗</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Wallet Not Connected</h3>
            <p className="text-white/70 mb-6">Connect your wallet to view and trade NFTs</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300"
            >
              Connect Wallet
            </motion.button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default NFTMarketplace;
