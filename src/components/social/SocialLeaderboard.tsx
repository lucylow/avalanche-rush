import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Crown, 
  Star, 
  Users, 
  TrendingUp, 
  Share2, 
  Heart, 
  MessageCircle,
  Repeat,
  ExternalLink,
  Zap,
  Target,
  Medal
} from 'lucide-react';
import { useLens } from '../../hooks/useLens';
import { useFarcaster } from '../../hooks/useFarcaster';

interface LeaderboardEntry {
  rank: number;
  player: string;
  gameScore: number;
  socialScore: number;
  totalScore: number;
  lensHandle?: string;
  farcasterUsername?: string;
  avatar?: string;
  achievements: string[];
  socialMultiplier: number;
}

interface Tournament {
  id: string;
  name: string;
  description: string;
  prizePool: string;
  participants: number;
  maxParticipants: number;
  entryFee: string;
  startTime: number;
  endTime: number;
  status: 'upcoming' | 'active' | 'completed';
  lensChannel?: string;
  farcasterChannel?: string;
}

const SocialLeaderboard: React.FC = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [activeTournament, setActiveTournament] = useState<Tournament | null>(null);
  const [selectedTab, setSelectedTab] = useState('global');
  const [isLoading, setIsLoading] = useState(false);

  const { profile: lensProfile, shareAchievement, shareTournament } = useLens();
  const { user: farcasterUser, shareAchievement: shareFarcasterAchievement, shareTournament: shareFarcasterTournament, channels } = useFarcaster();

  // Mock data - in a real app, this would come from your smart contracts
  useEffect(() => {
    loadLeaderboardData();
    loadTournaments();
  }, []);

  const loadLeaderboardData = async () => {
    setIsLoading(true);
    
    // Mock leaderboard data with social integration
    const mockData: LeaderboardEntry[] = [
      {
        rank: 1,
        player: '0x742d35Cc5A5E2a9E1aB8d8C6E6E9F4A5B8D35a9',
        gameScore: 125000,
        socialScore: 8500,
        totalScore: 133500,
        lensHandle: 'avalanche.champion',
        farcasterUsername: 'avalanche_champion',
        avatar: '/avatars/champion.png',
        achievements: ['High Score Master', 'Social Influencer', 'Tournament Winner'],
        socialMultiplier: 15
      },
      {
        rank: 2,
        player: '0x8f2E4A6B3C7D9E1F5A8B2C4D6E7F9A1B3C5D7E9',
        gameScore: 118000,
        socialScore: 7200,
        totalScore: 125200,
        lensHandle: 'rush.master',
        farcasterUsername: 'rush_master',
        avatar: '/avatars/master.png',
        achievements: ['DeFi Expert', 'Community Leader'],
        socialMultiplier: 12
      },
      {
        rank: 3,
        player: '0x3A7B9C2D5E8F1A4B6C8D0E2F4A5B7C9D1E3F5A7',
        gameScore: 110000,
        socialScore: 6800,
        totalScore: 116800,
        lensHandle: 'reactive.hero',
        farcasterUsername: 'reactive_hero',
        avatar: '/avatars/hero.png',
        achievements: ['Quest Completer', 'Social Butterfly'],
        socialMultiplier: 10
      },
      {
        rank: 4,
        player: '0x9E1A3B5C7D0E2F4A6B8C0D2E4F5A7B9C1D3E5F7',
        gameScore: 105000,
        socialScore: 5500,
        totalScore: 110500,
        lensHandle: 'defi.wizard',
        farcasterUsername: 'defi_wizard',
        avatar: '/avatars/wizard.png',
        achievements: ['Liquidity Provider', 'Yield Farmer'],
        socialMultiplier: 8
      },
      {
        rank: 5,
        player: '0x2F4A6B8C0D2E4F5A7B9C1D3E5F7A8B0C2D4E6F8',
        gameScore: 98000,
        socialScore: 4200,
        totalScore: 102200,
        lensHandle: 'nft.collector',
        farcasterUsername: 'nft_collector',
        avatar: '/avatars/collector.png',
        achievements: ['NFT Hunter', 'Art Lover'],
        socialMultiplier: 6
      }
    ];

    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLeaderboardData(mockData);
    setIsLoading(false);
  };

  const loadTournaments = async () => {
    const mockTournaments: Tournament[] = [
      {
        id: '1',
        name: 'Daily Avalanche Rush',
        description: 'Compete for daily prizes in Avalanche Rush',
        prizePool: '1.5',
        participants: 245,
        maxParticipants: 1000,
        entryFee: '0.01',
        startTime: Date.now() - 3600000, // 1 hour ago
        endTime: Date.now() + 82800000, // 23 hours from now
        status: 'active',
        lensChannel: 'avalanche_rush',
        farcasterChannel: 'avalanche-rush'
      },
      {
        id: '2',
        name: 'Weekly DeFi Masters',
        description: 'Master DeFi quests for weekly rewards',
        prizePool: '10.0',
        participants: 89,
        maxParticipants: 500,
        entryFee: '0.05',
        startTime: Date.now() + 86400000, // 1 day from now
        endTime: Date.now() + 691200000, // 8 days from now
        status: 'upcoming',
        lensChannel: 'defi_masters',
        farcasterChannel: 'defi-masters'
      },
      {
        id: '3',
        name: 'Social Influencer Championship',
        description: 'Tournament with social engagement multipliers',
        prizePool: '25.0',
        participants: 156,
        maxParticipants: 200,
        entryFee: '0.1',
        startTime: Date.now() - 172800000, // 2 days ago
        endTime: Date.now() + 432000000, // 5 days from now
        status: 'active',
        lensChannel: 'social_champions',
        farcasterChannel: 'social-champions'
      }
    ];

    setTournaments(mockTournaments);
    setActiveTournament(mockTournaments[0]); // Set first tournament as active
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500';
      case 3:
        return 'bg-gradient-to-r from-amber-500 to-amber-700';
      default:
        return 'bg-gradient-to-r from-blue-500 to-blue-700';
    }
  };

  const handleShareAchievement = async (entry: LeaderboardEntry) => {
    const achievement = {
      type: `Rank #${entry.rank}`,
      score: entry.gameScore,
      level: Math.floor(entry.gameScore / 10000),
      tournamentId: activeTournament?.id
    };

    // Share on both platforms
    if (lensProfile) {
      await shareAchievement(achievement);
    }
    if (farcasterUser) {
      await shareFarcasterAchievement(achievement);
    }
  };

  const handleShareTournament = async (tournament: Tournament) => {
    const tournamentData = {
      id: tournament.id,
      name: tournament.name,
      prizePool: tournament.prizePool,
      participants: tournament.participants
    };

    // Share on both platforms
    if (lensProfile) {
      await shareTournament(tournamentData);
    }
    if (farcasterUser) {
      await shareFarcasterTournament(tournamentData);
    }
  };

  const formatTimeLeft = (endTime: number) => {
    const timeLeft = endTime - Date.now();
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    } else if (minutes > 0) {
      return `${minutes}m left`;
    } else {
      return 'Ending soon';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-2">
          <Trophy className="h-8 w-8 text-yellow-500" />
          Social Leaderboards
        </h1>
        <p className="text-muted-foreground">
          Compete globally with social engagement multipliers
        </p>
      </div>

      {/* Social Integration Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              Lens Protocol
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lensProfile ? (
              <div className="space-y-2">
                <p className="text-sm font-medium">🌿 {lensProfile.handle}</p>
                <p className="text-xs text-muted-foreground">
                  {lensProfile.stats.totalFollowers} followers
                </p>
                <Badge variant="secondary" className="text-xs">
                  Social Multiplier: +{Math.floor(lensProfile.stats.totalFollowers / 100)}%
                </Badge>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Not connected</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              Farcaster
            </CardTitle>
          </CardHeader>
          <CardContent>
            {farcasterUser ? (
              <div className="space-y-2">
                <p className="text-sm font-medium">🔮 @{farcasterUser.username}</p>
                <p className="text-xs text-muted-foreground">
                  {farcasterUser.followerCount} followers
                </p>
                <Badge variant="secondary" className="text-xs">
                  Social Multiplier: +{Math.floor(farcasterUser.followerCount / 50)}%
                </Badge>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Not connected</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Active Tournaments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Active Tournaments
          </CardTitle>
          <CardDescription>
            Join tournaments with social engagement multipliers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tournaments.map((tournament) => (
              <Card 
                key={tournament.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  activeTournament?.id === tournament.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setActiveTournament(tournament)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{tournament.name}</CardTitle>
                    <Badge 
                      variant={tournament.status === 'active' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {tournament.status}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm">
                    {tournament.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Prize Pool:</span>
                    <span className="font-medium">{tournament.prizePool} AVAX</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Participants:</span>
                    <span className="font-medium">{tournament.participants}/{tournament.maxParticipants}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Entry Fee:</span>
                    <span className="font-medium">{tournament.entryFee} AVAX</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Time Left:</span>
                    <span className="font-medium">{formatTimeLeft(tournament.endTime)}</span>
                  </div>
                  <Progress 
                    value={(tournament.participants / tournament.maxParticipants) * 100} 
                    className="h-2"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      Join Tournament
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShareTournament(tournament);
                      }}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            {activeTournament?.name} Leaderboard
          </CardTitle>
          <CardDescription>
            Rankings include social engagement multipliers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="global">Global</TabsTrigger>
              <TabsTrigger value="friends">Friends</TabsTrigger>
              <TabsTrigger value="social">Social Stars</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab} className="space-y-4">
              <div className="space-y-3">
                {leaderboardData.map((entry) => (
                  <Card 
                    key={entry.player}
                    className={`transition-all duration-200 ${
                      entry.rank <= 3 ? 'ring-2 ring-yellow-500' : ''
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12">
                          {getRankIcon(entry.rank)}
                        </div>
                        
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={entry.avatar} alt={entry.player} />
                          <AvatarFallback>
                            {entry.player.slice(2, 6).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold truncate">
                              {entry.player.slice(0, 8)}...{entry.player.slice(-6)}
                            </h3>
                            {entry.lensHandle && (
                              <Badge variant="outline" className="text-xs">
                                🌿 {entry.lensHandle}
                              </Badge>
                            )}
                            {entry.farcasterUsername && (
                              <Badge variant="outline" className="text-xs">
                                🔮 @{entry.farcasterUsername}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Game: {entry.gameScore.toLocaleString()}</span>
                            <span>Social: +{entry.socialScore.toLocaleString()}</span>
                            <span>Total: {entry.totalScore.toLocaleString()}</span>
                            <Badge 
                              variant="secondary" 
                              className="text-xs"
                            >
                              +{entry.socialMultiplier}% Multiplier
                            </Badge>
                          </div>

                          <div className="flex flex-wrap gap-1 mt-2">
                            {entry.achievements.map((achievement, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {achievement}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleShareAchievement(entry)}
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Social Engagement Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Boost Your Social Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                Lens Protocol
              </h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Share achievements to get likes and mirrors</li>
                <li>• Create engaging content about your gameplay</li>
                <li>• Collect and showcase rare NFTs</li>
                <li>• Build a following with valuable insights</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-blue-500" />
                Farcaster
              </h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Post in gaming channels for visibility</li>
                <li>• Engage with other players' content</li>
                <li>• Share strategies and tips</li>
                <li>• Participate in community discussions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialLeaderboard;
