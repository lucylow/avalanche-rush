import React, { useState, useEffect } from 'react';
import AvalancheRushGame from '../../components/game/AvalancheRushGame';
import SimpleGameEngine from '../../components/game/SimpleGameEngine';
import { useSmartContracts } from '../../hooks/useSmartContracts';

const GamePage: React.FC = () => {
  const { isConnected, connectWallet, isLoading } = useSmartContracts();
  const [showWalletPrompt, setShowWalletPrompt] = useState(false);
  const [showGameEngine, setShowGameEngine] = useState(false);

  useEffect(() => {
    if (!isConnected && !isLoading) {
      setShowWalletPrompt(true);
      setShowGameEngine(false);
    } else {
      setShowWalletPrompt(false);
      setShowGameEngine(true);
    }
  }, [isConnected, isLoading]);

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
      setShowWalletPrompt(false);
      setShowGameEngine(true);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  if (showWalletPrompt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-2xl mx-auto mb-6">
              🏔️
            </div>
            <h1 className="text-4xl font-black text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
              Avalanche Rush
            </h1>
            <p className="text-white/80 text-lg mb-8">
              Connect your wallet to start playing and earning rewards!
            </p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={handleConnectWallet}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-8 rounded-2xl shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <span className="text-xl">🦊</span>
                  <span>Connect MetaMask</span>
                </>
              )}
            </button>
            
            <div className="text-center">
              <p className="text-white/60 text-sm">
                Don't have MetaMask?{' '}
                <a 
                  href="https://metamask.io/download/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  Install it here
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {showGameEngine ? (
        <SimpleGameEngine 
          gameState={{
            isPlaying: true,
            isPaused: false,
            gameMode: 'classic',
            difficulty: 'beginner',
            currentLevel: 1,
            score: 0,
            lives: 3,
            energy: 100
          }}
          onScoreUpdate={(score) => console.log('Score updated:', score)}
          onGameEnd={(score, achievements) => console.log('Game ended:', score, achievements)}
          onLevelComplete={(level) => console.log('Level completed:', level)}
          isPaused={false}
        />
      ) : (
        <AvalancheRushGame />
      )}
    </div>
  );
};

export default GamePage;
