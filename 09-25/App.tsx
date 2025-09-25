import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import { avalanche, avalancheFuji } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import AvalancheRushGame from './components/AvalancheRushGame';
import './App.css';

// Configure chains and providers
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [avalanche, avalancheFuji],
  [publicProvider()]
);

// Create wagmi config
const config = createConfig({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
    new WalletConnectConnector({
      chains,
      options: {
        projectId: process.env.REACT_APP_WALLETCONNECT_PROJECT_ID || 'avalanche-rush',
      },
    }),
  ],
  publicClient,
  webSocketPublicClient,
});

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Avalanche Rush Error:', error, errorInfo);
    
    // Log to analytics service in production
    if (process.env.NODE_ENV === 'production') {
      // Analytics.track('error', { error: error.message, stack: error.stack });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex items-center justify-center p-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 max-w-md w-full text-center border border-white/20">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-white mb-4">
              Oops! Something went wrong
            </h1>
            <p className="text-white/70 mb-6">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                🔄 Refresh Page
              </button>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                🔙 Try Again
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-white/70 cursor-pointer">Error Details</summary>
                <pre className="mt-2 text-xs text-red-300 bg-black/20 p-3 rounded overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading Component
const LoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
    <div className="text-center">
      <div className="text-6xl mb-6 animate-bounce">🏔️</div>
      <h1 className="text-4xl font-bold text-white mb-4">Avalanche Rush</h1>
      <div className="flex items-center justify-center space-x-2 text-white/70">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
        <span>Loading the adventure...</span>
      </div>
      <div className="mt-8 text-sm text-white/50">
        Powered by Avalanche C-Chain & Reactive Network
      </div>
    </div>
  </div>
);

// Network Status Component
const NetworkStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [networkLatency, setNetworkLatency] = useState<number | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Measure network latency
    const measureLatency = async () => {
      try {
        const start = Date.now();
        await fetch('https://api.avax.network/ext/health', { method: 'HEAD' });
        const latency = Date.now() - start;
        setNetworkLatency(latency);
      } catch (error) {
        setNetworkLatency(null);
      }
    };

    measureLatency();
    const interval = setInterval(measureLatency, 30000); // Check every 30 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-2 z-50">
        <div className="flex items-center justify-center space-x-2">
          <span>🔴</span>
          <span>No internet connection. Please check your network.</span>
        </div>
      </div>
    );
  }

  return null;
};

// Performance Monitor (Development only)
const PerformanceMonitor: React.FC = () => {
  const [fps, setFps] = useState(60);
  const [memoryUsage, setMemoryUsage] = useState<number | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    let frameCount = 0;
    let lastTime = performance.now();

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (currentTime - lastTime)));
        frameCount = 0;
        lastTime = currentTime;
      }

      // Measure memory usage if available
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMemoryUsage(Math.round(memory.usedJSHeapSize / 1024 / 1024));
      }

      requestAnimationFrame(measureFPS);
    };

    measureFPS();
  }, []);

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50">
      <div>FPS: {fps}</div>
      {memoryUsage && <div>Memory: {memoryUsage}MB</div>}
    </div>
  );
};

// Main App Component
const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [appVersion] = useState(process.env.REACT_APP_VERSION || '2.0.0');

  useEffect(() => {
    // Initialize app
    const initializeApp = async () => {
      try {
        // Preload critical resources
        await Promise.all([
          // Preload fonts
          document.fonts.ready,
          // Warm up Web3 connection
          new Promise(resolve => setTimeout(resolve, 1000))
        ]);

        // Check for app updates in production
        if (process.env.NODE_ENV === 'production') {
          // Service worker registration for PWA features
          if ('serviceWorker' in navigator) {
            try {
              await navigator.serviceWorker.register('/sw.js');
              console.log('Service Worker registered successfully');
            } catch (error) {
              console.log('Service Worker registration failed:', error);
            }
          }
        }

        setIsLoading(false);
      } catch (error) {
        console.error('App initialization failed:', error);
        setIsLoading(false);
      }
    };

    initializeApp();

    // Log app start
    console.log(`🏔️ Avalanche Rush v${appVersion} - Ready to play!`);
    
    // Analytics tracking in production
    if (process.env.NODE_ENV === 'production') {
      // Analytics.track('app_start', { version: appVersion });
    }
  }, [appVersion]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <WagmiConfig config={config}>
        <QueryClientProvider client={queryClient}>
          <Router>
            <div className="App">
              <NetworkStatus />
              <PerformanceMonitor />
              
              <Routes>
                {/* Main Game Route */}
                <Route path="/" element={<AvalancheRushGame />} />
                
                {/* Game Routes */}
                <Route path="/play" element={<AvalancheRushGame />} />
                <Route path="/play/:mode" element={<AvalancheRushGame />} />
                
                {/* Redirect old routes */}
                <Route path="/game" element={<Navigate to="/" replace />} />
                <Route path="/home" element={<Navigate to="/" replace />} />
                
                {/* 404 Route */}
                <Route path="*" element={
                  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-6">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🏔️</div>
                      <h1 className="text-4xl font-bold text-white mb-4">Page Not Found</h1>
                      <p className="text-white/70 mb-6">
                        The page you're looking for doesn't exist.
                      </p>
                      <button
                        onClick={() => window.location.href = '/'}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                      >
                        🏠 Go Home
                      </button>
                    </div>
                  </div>
                } />
              </Routes>
            </div>
          </Router>
        </QueryClientProvider>
      </WagmiConfig>
    </ErrorBoundary>
  );
};

export default App;
