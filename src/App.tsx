import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import GamePage from "./pages/game/GamePage";
import LeaderboardPage from "./pages/LeaderboardPage";
import SocialLeaderboardPage from "./pages/SocialLeaderboardPage";
import AchievementsPage from "./pages/AchievementsPage";
import LearnWeb3Page from "./pages/LearnWeb3Page";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/play" element={<GamePage />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/social-leaderboard" element={<SocialLeaderboardPage />} />
          <Route path="/tournaments" element={<SocialLeaderboardPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/learn" element={<LearnWeb3Page />} />
          <Route path="/learn-web3" element={<LearnWeb3Page />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
