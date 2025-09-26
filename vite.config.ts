import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    global: 'globalThis',
    'process.env': JSON.stringify(process.env),
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['react-router-dom'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tooltip'],
          'vendor-motion': ['framer-motion'],
          'vendor-web3': ['ethers', 'wagmi'],
          'vendor-query': ['@tanstack/react-query'],
          // Game chunks
          'game-core': [
            './src/components/game/AvalancheRushGame.tsx',
            './src/components/game/GameEngine.tsx',
            './src/components/game/EnhancedGameEngine.tsx'
          ],
          'game-ui': [
            './src/components/game/QuestSystem.tsx',
            './src/components/game/LeaderboardSystem.tsx',
            './src/components/game/NFTMarketplace.tsx'
          ],
          'avalanche-features': [
            './src/components/avalanche/AvalancheCChainDashboard.tsx',
            './src/hooks/useAvalancheCChain.ts'
          ],
          'reactive-features': [
            './src/components/reactive/ReactiveNetworkDashboard.tsx',
            './src/hooks/useReactiveNetwork.ts'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    minify: 'esbuild'
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'ethers',
      '@tanstack/react-query'
    ]
  }
}));
