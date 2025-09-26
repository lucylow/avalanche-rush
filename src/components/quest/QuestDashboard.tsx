import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  BookOpen, 
  Star, 
  Trophy, 
  Zap, 
  Shield, 
  Target, 
  Clock, 
  Users, 
  Gift,
  Crown,
  Flame,
  Sparkles,
  CheckCircle,
  Play,
  Share2,
  TrendingUp,
  Award,
  Calendar,
  Activity
} from 'lucide-react';
import { useQuestTracking } from '../../hooks/useQuestTracking';
import { useLens } from '../../hooks/useLens';
import { useFarcaster } from '../../hooks/useFarcaster';

interface QuestDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuestDashboard: React.FC<QuestDashboardProps> = ({ isOpen, onClose }) => {
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const {
    questProgress,
    completedQuests,
    playerLevel,
    achievements,
    relationships,
    recentEvents,
    startQuest,
    recordGameEvent,
    getAvailableQuests,
    getActiveQuests,
    getQuestStats,
    hasActiveQuests,
    totalCompleted
  } = useQuestTracking();

  const { profile: lensProfile, shareAchievement } = useLens();
  const { user: farcasterUser, shareAchievement: shareFarcasterAchievement } = useFarcaster();

  const stats = getQuestStats();
  const availableQuests = getAvailableQuests();
  const activeQuests = getActiveQuests();

  // Character data
  const characters = [
    { id: 'avalon-the-mountain-guardian', name: 'Avalon', avatar: '/characters/avalon.png', relationship: relationships['avalon-the-mountain-guardian'] || 0 },
    { id: 'lyra-rush-weaver', name: 'Lyra', avatar: '/characters/lyra.png', relationship: relationships['lyra-rush-weaver'] || 0 },
    { id: 'cipher-the-subnet-architect', name: 'Cipher', avatar: '/characters/cipher.png', relationship: relationships['cipher-the-subnet-architect'] || 0 },
    { id: 'nova-defi-alchemist', name: 'Nova', avatar: '/characters/nova.png', relationship: relationships['nova-defi-alchemist'] || 0 },
    { id: 'echo-reactive-oracle', name: 'Echo', avatar: '/characters/echo.png', relationship: relationships['echo-reactive-oracle'] || 0 }
  ];

  // Simulate game events for demo
  const simulateGameEvent = () => {
    const events = [
      { type: 'score' as const, value: Math.floor(Math.random() * 10000) + 1000 },
      { type: 'collect' as const, value: 1, metadata: { itemType: 'rush_tokens' } },
      { type: 'complete' as const, value: 1 },
      { type: 'survive' as const, value: Math.floor(Math.random() * 10) + 1 }
    ];
    
    const randomEvent = events[Math.floor(Math.random() * events.length)];
    recordGameEvent(randomEvent.type, randomEvent.value, randomEvent.metadata);
  };

  // Get relationship color
  const getRelationshipColor = (relationship: number) => {
    if (relationship >= 80) return 'text-purple-400';
    if (relationship >= 60) return 'text-blue-400';
    if (relationship >= 40) return 'text-green-400';
    if (relationship >= 20) return 'text-yellow-400';
    return 'text-gray-400';
  };

  if (!isOpen) return null;

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
        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 max-w-7xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl border border-white/10 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white">
                Quest Dashboard
              </h2>
              <p className="text-white/70">Track your progress and achievements</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors"
          >
            <span className="text-white text-xl">×</span>
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border-blue-500/30">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{totalCompleted}</div>
                  <div className="text-white/70 text-sm">Completed</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border-green-500/30">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <Play className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{stats.totalActive}</div>
                  <div className="text-white/70 text-sm">Active</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-500/30">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Star className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{stats.totalAvailable}</div>
                  <div className="text-white/70 text-sm">Available</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border-yellow-500/30">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{playerLevel}</div>
                  <div className="text-white/70 text-sm">Level</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Character Selection */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Character Relationships</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {characters.map((character) => (
              <motion.div
                key={character.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCharacter(character.id)}
                className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedCharacter === character.id
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-white/20 bg-white/5 hover:border-white/30'
                }`}
              >
                <Avatar className="h-12 w-12 mx-auto mb-2">
                  <AvatarImage src={character.avatar} alt={character.name} />
                  <AvatarFallback>{character.name[0]}</AvatarFallback>
                </Avatar>
                <h4 className="text-white font-medium text-center">{character.name}</h4>
                <div className="text-center mt-1">
                  <Badge variant="secondary" className="text-xs">
                    <span className={getRelationshipColor(character.relationship)}>
                      {character.relationship}/100
                    </span>
                  </Badge>
                </div>
                <div className="mt-2">
                  <Progress value={character.relationship} className="h-1" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="available">Available</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Recent Activity */}
            <Card className="bg-gradient-to-br from-slate-700 to-slate-800 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentEvents.slice(0, 5).map((event, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                          <Zap className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <div className="text-white font-medium">{event.type}</div>
                          <div className="text-white/70 text-sm">
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary">{event.value}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Character Progress */}
            <Card className="bg-gradient-to-br from-slate-700 to-slate-800 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Character Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.characterProgress.map((char) => (
                    <div key={char.characterId} className="p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-medium">
                          {characters.find(c => c.id === char.characterId)?.name}
                        </h4>
                        <Badge variant="secondary">
                          {char.completedQuests} completed
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-white/70">
                        <span>Relationship: {char.relationship}/100</span>
                        <span>Active Quests: {char.activeQuests}</span>
                      </div>
                      <Progress value={char.relationship} className="h-2 mt-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Active Quests Tab */}
          <TabsContent value="active" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeQuests.map((progress) => {
                const quest = CHARACTER_QUESTS.find(q => q.id === progress.questId);
                if (!quest) return null;

                const completedObjectives = progress.objectives.filter(obj => obj.isCompleted).length;
                const totalObjectives = progress.objectives.length;
                const progressPercentage = (completedObjectives / totalObjectives) * 100;

                return (
                  <Card key={progress.questId} className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-blue-500/30">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white">{quest.title}</CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          {progressPercentage.toFixed(0)}% Complete
                        </Badge>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-white/70 text-sm">{quest.description}</p>
                      
                      <div className="space-y-2">
                        {progress.objectives.slice(0, 3).map((objective) => {
                          const questObjective = quest.objectives.find(obj => obj.id === objective.id);
                          if (!questObjective) return null;

                          return (
                            <div key={objective.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                              <div className="flex items-center gap-2">
                                {objective.isCompleted ? (
                                  <CheckCircle className="h-4 w-4 text-green-400" />
                                ) : (
                                  <Target className="h-4 w-4 text-white/50" />
                                )}
                                <span className={`text-sm ${objective.isCompleted ? 'text-green-400' : 'text-white/70'}`}>
                                  {questObjective.title}
                                </span>
                              </div>
                              <div className="text-xs text-white/50">
                                {objective.current}/{objective.target}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex-1"
                          onClick={simulateGameEvent}
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          Simulate Progress
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            // Share progress
                            if (lensProfile) {
                              shareAchievement({
                                type: `Progress in ${quest.title}`,
                                score: progressPercentage,
                                level: playerLevel
                              });
                            }
                          }}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Available Quests Tab */}
          <TabsContent value="available" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {availableQuests
                .filter(quest => !selectedCharacter || quest.characterId === selectedCharacter)
                .map((quest) => (
                <Card key={quest.id} className="bg-gradient-to-br from-slate-700 to-slate-800 border-white/10">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                          <Crown className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-white">{quest.title}</CardTitle>
                          <CardDescription className="text-white/70">
                            Chapter {quest.chapter} • {quest.difficulty}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className={`${
                        quest.difficulty === 'easy' ? 'bg-green-500' :
                        quest.difficulty === 'medium' ? 'bg-yellow-500' :
                        quest.difficulty === 'hard' ? 'bg-orange-500' :
                        'bg-red-500'
                      } text-white`}>
                        {quest.difficulty}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-white/80 text-sm">{quest.description}</p>
                    
                    <div className="space-y-2">
                      <h5 className="text-white font-medium">Objectives:</h5>
                      <div className="space-y-1">
                        {quest.objectives.slice(0, 3).map((objective) => (
                          <div key={objective.id} className="flex items-center gap-2 text-sm text-white/70">
                            <Target className="h-3 w-3" />
                            <span>{objective.title}</span>
                            {objective.isOptional && (
                              <Badge variant="outline" className="text-xs">Optional</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h5 className="text-white font-medium">Rewards:</h5>
                      <div className="flex flex-wrap gap-2">
                        {quest.rewards.slice(0, 3).map((reward, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {reward.type === 'rush_tokens' && <Zap className="h-3 w-3 mr-1" />}
                            {reward.type === 'nft' && <Gift className="h-3 w-3 mr-1" />}
                            {reward.type === 'character_unlock' && <Crown className="h-3 w-3 mr-1" />}
                            {reward.amount ? `${reward.amount} ${reward.type}` : reward.type}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button 
                      onClick={() => startQuest(quest.id)}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Quest
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Social Tab */}
          <TabsContent value="social" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Lens Integration */}
              <Card className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    Lens Protocol
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {lensProfile ? (
                    <div>
                      <p className="text-white/70 mb-2">Connected as: {lensProfile.handle}</p>
                      <div className="space-y-2">
                        <Badge variant="secondary" className="text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          {lensProfile.stats.totalFollowers} followers
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          <Award className="h-3 w-3 mr-1" />
                          {lensProfile.stats.totalPublications} posts
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <p className="text-white/70">Connect to Lens to share quest achievements</p>
                  )}
                </CardContent>
              </Card>

              {/* Farcaster Integration */}
              <Card className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    Farcaster
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {farcasterUser ? (
                    <div>
                      <p className="text-white/70 mb-2">Connected as: @{farcasterUser.username}</p>
                      <div className="space-y-2">
                        <Badge variant="secondary" className="text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          {farcasterUser.followerCount} followers
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          <Calendar className="h-3 w-3 mr-1" />
                          {farcasterUser.followerCount} following
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <p className="text-white/70">Connect to Farcaster to share quest progress</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quest Achievements */}
            <Card className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border-yellow-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Quest Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{totalCompleted}</div>
                    <div className="text-white/70 text-sm">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{stats.totalActive}</div>
                    <div className="text-white/70 text-sm">Active</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{playerLevel}</div>
                    <div className="text-white/70 text-sm">Level</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {Math.max(...Object.values(relationships))}
                    </div>
                    <div className="text-white/70 text-sm">Max Bond</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
};

export default QuestDashboard;
