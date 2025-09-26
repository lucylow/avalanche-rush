// src/pages/LearnWeb3Page.tsx
import React, { useState, useEffect } from 'react';
import { useAvalancheFeatures, AvalancheQuestType } from '../hooks/useAvalancheFeatures';
import { useAdvancedWeb3 } from '../hooks/useAdvancedWeb3';
import Navigation from '../components/ui/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import InteractiveTutorial from '../components/education/InteractiveTutorial';
import LearningPath from '../components/education/LearningPath';
import QuizSystem from '../components/education/QuizSystem';
import { 
  BookOpen, 
  Play, 
  CheckCircle, 
  Clock, 
  Star, 
  Target,
  Mountain,
  Coins,
  Shield,
  Zap,
  Bridge,
  Network,
  TrendingUp,
  Award,
  ExternalLink,
  PlayCircle,
  Users,
  Lightbulb,
  Code,
  Wallet,
  Eye,
  ArrowRight,
  Brain,
  Trophy,
  GraduationCap,
  BookMarked,
  Video,
  FileText,
  Puzzle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface LearningModule {
  id: string;
  title: string;
  description: string;
  category: 'basics' | 'avalanche' | 'defi' | 'advanced';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  isCompleted: boolean;
  isLocked: boolean;
  progress: number;
  lessons: Lesson[];
  questId?: number;
  rewardAmount: number;
  prerequisites: string[];
}

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'text' | 'interactive' | 'quiz' | 'practice';
  duration: number;
  isCompleted: boolean;
  content: string;
  videoUrl?: string;
  quizQuestions?: QuizQuestion[];
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface LearningPath {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  modules: string[];
  totalDuration: number;
  completionReward: number;
}

const LearnWeb3Page: React.FC = () => {
  const { account, isConnected, switchNetwork } = useAdvancedWeb3();
  const { 
    avalancheQuests, 
    completeAvalancheQuest, 
    hasCompletedAvalancheQuest,
    loadAvalancheData,
    AvalancheQuestType 
  } = useAvalancheFeatures();

  const [activeTab, setActiveTab] = useState('paths');
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion | null>(null);
  const [quizProgress, setQuizProgress] = useState<Record<string, number>>({});

  // Load learning content on mount
  useEffect(() => {
    loadLearningContent();
  }, [isConnected]);

  const loadLearningContent = async () => {
    setIsLoading(true);
    try {
      const mockModules = generateMockLearningModules();
      setModules(mockModules);
      
      const mockPaths = generateMockLearningPaths();
      setLearningPaths(mockPaths);
      
      if (isConnected && account) {
        await loadAvalancheData();
      }
    } catch (error) {
      console.error('Failed to load learning content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockLearningModules = (): LearningModule[] => {
    return [
      // Basics
      {
        id: 'web3_basics',
        title: 'Web3 Fundamentals',
        description: 'Learn the basics of blockchain, cryptocurrencies, and decentralized applications',
        category: 'basics',
        difficulty: 'beginner',
        duration: 45,
        isCompleted: true,
        isLocked: false,
        progress: 100,
        rewardAmount: 200,
        prerequisites: [],
        lessons: [
          {
            id: 'what_is_blockchain',
            title: 'What is Blockchain?',
            type: 'video',
            duration: 15,
            isCompleted: true,
            content: 'Learn about distributed ledgers and how blockchain technology works.',
            videoUrl: 'https://example.com/blockchain-basics'
          },
          {
            id: 'cryptocurrency_intro',
            title: 'Introduction to Cryptocurrency',
            type: 'text',
            duration: 10,
            isCompleted: true,
            content: 'Understanding digital currencies and their use cases.'
          },
          {
            id: 'web3_quiz',
            title: 'Web3 Knowledge Check',
            type: 'quiz',
            duration: 15,
            isCompleted: true,
            content: 'Test your understanding of Web3 concepts.',
            quizQuestions: [
              {
                id: 'q1',
                question: 'What is a blockchain?',
                options: ['A database', 'A distributed ledger', 'A cryptocurrency', 'A website'],
                correctAnswer: 1,
                explanation: 'A blockchain is a distributed ledger that maintains a continuously growing list of records.'
              }
            ]
          }
        ]
      },
      {
        id: 'wallet_setup',
        title: 'Wallet Setup & Security',
        description: 'Learn how to set up and secure your crypto wallet',
        category: 'basics',
        difficulty: 'beginner',
        duration: 30,
        isCompleted: false,
        isLocked: false,
        progress: 60,
        rewardAmount: 150,
        prerequisites: ['web3_basics'],
        lessons: [
          {
            id: 'metamask_setup',
            title: 'Setting up MetaMask',
            type: 'interactive',
            duration: 15,
            isCompleted: true,
            content: 'Step-by-step guide to install and configure MetaMask wallet.'
          },
          {
            id: 'seed_phrase_security',
            title: 'Seed Phrase Security',
            type: 'text',
            duration: 10,
            isCompleted: true,
            content: 'Best practices for storing and securing your seed phrase.'
          },
          {
            id: 'wallet_practice',
            title: 'Wallet Practice',
            type: 'practice',
            duration: 5,
            isCompleted: false,
            content: 'Practice sending and receiving test transactions.'
          }
        ]
      },

      // Avalanche
      {
        id: 'avalanche_intro',
        title: 'Introduction to Avalanche',
        description: 'Discover the Avalanche ecosystem and its unique architecture',
        category: 'avalanche',
        difficulty: 'intermediate',
        duration: 40,
        isCompleted: false,
        isLocked: false,
        progress: 25,
        rewardAmount: 300,
        prerequisites: ['wallet_setup'],
        lessons: [
          {
            id: 'avalanche_overview',
            title: 'Avalanche Overview',
            type: 'video',
            duration: 20,
            isCompleted: true,
            content: 'Learn about Avalanche\'s three-blockchain architecture.',
            videoUrl: 'https://example.com/avalanche-overview'
          },
          {
            id: 'consensus_mechanism',
            title: 'Avalanche Consensus',
            type: 'text',
            duration: 15,
            isCompleted: false,
            content: 'Understanding the Snow family of consensus protocols.'
          },
          {
            id: 'avalanche_quiz',
            title: 'Avalanche Knowledge Check',
            type: 'quiz',
            duration: 5,
            isCompleted: false,
            content: 'Test your Avalanche knowledge.',
            quizQuestions: [
              {
                id: 'aq1',
                question: 'How many primary blockchains does Avalanche have?',
                options: ['1', '2', '3', '4'],
                correctAnswer: 2,
                explanation: 'Avalanche has three primary blockchains: X-Chain, C-Chain, and P-Chain.'
              }
            ]
          }
        ]
      },
      {
        id: 'avalanche_subnets',
        title: 'Avalanche Subnets',
        description: 'Learn about custom subnets and how to create them',
        category: 'avalanche',
        difficulty: 'advanced',
        duration: 60,
        isCompleted: false,
        isLocked: false,
        progress: 0,
        questId: 5, // SUBNET_CREATION
        rewardAmount: 500,
        prerequisites: ['avalanche_intro'],
        lessons: [
          {
            id: 'subnet_architecture',
            title: 'Subnet Architecture',
            type: 'video',
            duration: 25,
            isCompleted: false,
            content: 'Understanding how subnets work and their benefits.',
            videoUrl: 'https://example.com/subnet-architecture'
          },
          {
            id: 'creating_subnets',
            title: 'Creating Your First Subnet',
            type: 'interactive',
            duration: 30,
            isCompleted: false,
            content: 'Hands-on tutorial for subnet creation.'
          },
          {
            id: 'subnet_validation',
            title: 'Subnet Validation',
            type: 'practice',
            duration: 5,
            isCompleted: false,
            content: 'Practice validating transactions on custom subnets.'
          }
        ]
      },

      // DeFi
      {
        id: 'defi_basics',
        title: 'DeFi Fundamentals',
        description: 'Introduction to Decentralized Finance',
        category: 'defi',
        difficulty: 'intermediate',
        duration: 50,
        isCompleted: false,
        isLocked: false,
        progress: 40,
        rewardAmount: 400,
        prerequisites: ['avalanche_intro'],
        lessons: [
          {
            id: 'what_is_defi',
            title: 'What is DeFi?',
            type: 'video',
            duration: 20,
            isCompleted: true,
            content: 'Introduction to decentralized finance and its benefits.',
            videoUrl: 'https://example.com/defi-intro'
          },
          {
            id: 'defi_protocols',
            title: 'Popular DeFi Protocols',
            type: 'text',
            duration: 15,
            isCompleted: true,
            content: 'Overview of major DeFi protocols and their use cases.'
          },
          {
            id: 'liquidity_provision',
            title: 'Liquidity Provision',
            type: 'interactive',
            duration: 10,
            isCompleted: false,
            content: 'Learn how to provide liquidity and earn rewards.'
          },
          {
            id: 'defi_risks',
            title: 'DeFi Risks and Security',
            type: 'text',
            duration: 5,
            isCompleted: false,
            content: 'Understanding the risks involved in DeFi.'
          }
        ]
      },
      {
        id: 'yield_farming',
        title: 'Yield Farming & Staking',
        description: 'Advanced strategies for earning yield in DeFi',
        category: 'defi',
        difficulty: 'advanced',
        duration: 45,
        isCompleted: false,
        isLocked: false,
        progress: 0,
        questId: 2, // AVAX_STAKING
        rewardAmount: 600,
        prerequisites: ['defi_basics'],
        lessons: [
          {
            id: 'yield_strategies',
            title: 'Yield Farming Strategies',
            type: 'video',
            duration: 20,
            isCompleted: false,
            content: 'Different approaches to maximize yield.',
            videoUrl: 'https://example.com/yield-farming'
          },
          {
            id: 'avax_staking',
            title: 'AVAX Staking Tutorial',
            type: 'interactive',
            duration: 20,
            isCompleted: false,
            content: 'Hands-on guide to staking AVAX tokens.'
          },
          {
            id: 'risk_management',
            title: 'Risk Management',
            type: 'text',
            duration: 5,
            isCompleted: false,
            content: 'Managing risks in yield farming strategies.'
          }
        ]
      },

      // Advanced
      {
        id: 'flash_loans',
        title: 'Flash Loans & Advanced DeFi',
        description: 'Master advanced DeFi concepts and flash loan strategies',
        category: 'advanced',
        difficulty: 'advanced',
        duration: 70,
        isCompleted: false,
        isLocked: true,
        progress: 0,
        rewardAmount: 800,
        prerequisites: ['yield_farming', 'defi_basics'],
        lessons: [
          {
            id: 'flash_loan_intro',
            title: 'Introduction to Flash Loans',
            type: 'video',
            duration: 25,
            isCompleted: false,
            content: 'Understanding flash loans and their use cases.',
            videoUrl: 'https://example.com/flash-loans'
          },
          {
            id: 'arbitrage_strategies',
            title: 'Arbitrage Strategies',
            type: 'text',
            duration: 20,
            isCompleted: false,
            content: 'Using flash loans for arbitrage opportunities.'
          },
          {
            id: 'flash_loan_practice',
            title: 'Flash Loan Practice',
            type: 'practice',
            duration: 25,
            isCompleted: false,
            content: 'Practice executing flash loan transactions.'
          }
        ]
      }
    ];
  };

  const generateMockLearningPaths = (): LearningPath[] => {
    return [
      {
        id: 'beginner_path',
        name: 'Web3 Beginner',
        description: 'Start your Web3 journey from the basics',
        icon: <BookOpen className="h-6 w-6" />,
        color: 'from-green-500 to-emerald-500',
        modules: ['web3_basics', 'wallet_setup'],
        totalDuration: 75,
        completionReward: 500
      },
      {
        id: 'avalanche_path',
        name: 'Avalanche Expert',
        description: 'Master the Avalanche ecosystem',
        icon: <Mountain className="h-6 w-6" />,
        color: 'from-red-500 to-orange-500',
        modules: ['avalanche_intro', 'avalanche_subnets'],
        totalDuration: 100,
        completionReward: 1000
      },
      {
        id: 'defi_path',
        name: 'DeFi Master',
        description: 'Become a DeFi expert',
        icon: <TrendingUp className="h-6 w-6" />,
        color: 'from-blue-500 to-purple-500',
        modules: ['defi_basics', 'yield_farming'],
        totalDuration: 95,
        completionReward: 1200
      },
      {
        id: 'advanced_path',
        name: 'Advanced Developer',
        description: 'Advanced concepts and strategies',
        icon: <Code className="h-6 w-6" />,
        color: 'from-purple-500 to-pink-500',
        modules: ['flash_loans'],
        totalDuration: 70,
        completionReward: 800
      }
    ];
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400 border-green-400';
      case 'intermediate': return 'text-yellow-400 border-yellow-400';
      case 'advanced': return 'text-red-400 border-red-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'basics': return <BookOpen className="h-5 w-5" />;
      case 'avalanche': return <Mountain className="h-5 w-5" />;
      case 'defi': return <TrendingUp className="h-5 w-5" />;
      case 'advanced': return <Code className="h-5 w-5" />;
      default: return <BookOpen className="h-5 w-5" />;
    }
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return <PlayCircle className="h-4 w-4" />;
      case 'text': return <BookOpen className="h-4 w-4" />;
      case 'interactive': return <Target className="h-4 w-4" />;
      case 'quiz': return <Lightbulb className="h-4 w-4" />;
      case 'practice': return <Play className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const startLesson = (module: LearningModule, lesson: Lesson) => {
    setSelectedModule(module);
    setSelectedLesson(lesson);
  };

  const completeLesson = async (lessonId: string) => {
    if (selectedModule) {
      const updatedModules = modules.map(module => {
        if (module.id === selectedModule.id) {
          const updatedLessons = module.lessons.map(lesson => {
            if (lesson.id === lessonId) {
              return { ...lesson, isCompleted: true };
            }
            return lesson;
          });
          
          const completedLessons = updatedLessons.filter(l => l.isCompleted).length;
          const progress = (completedLessons / updatedLessons.length) * 100;
          const isModuleCompleted = progress === 100;
          
          return {
            ...module,
            lessons: updatedLessons,
            progress,
            isCompleted: isModuleCompleted
          };
        }
        return module;
      });
      
      setModules(updatedModules);
      
      // If module is completed and has a quest, complete it
      const updatedModule = updatedModules.find(m => m.id === selectedModule.id);
      if (updatedModule?.isCompleted && updatedModule.questId && isConnected) {
        try {
          await completeAvalancheQuest(updatedModule.questId);
        } catch (error) {
          console.error('Failed to complete quest:', error);
        }
      }
    }
    
    setSelectedLesson(null);
  };

  const filteredModules = () => {
    if (activeTab === 'paths') return [];
    if (activeTab === 'all') return modules;
    return modules.filter(m => m.category === activeTab);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-white text-xl">Loading Learning Content...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <Navigation />
      <div className="max-w-7xl mx-auto p-6 pt-20 md:pt-24 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <BookOpen className="h-8 w-8 text-blue-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Learn Web3 & Avalanche
            </h1>
            <Mountain className="h-8 w-8 text-red-500" />
          </div>
          <p className="text-lg text-gray-300">
            Master blockchain technology with hands-on learning and earn rewards
          </p>
        </div>

        {/* Progress Overview */}
        <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">
                  {modules.filter(m => m.isCompleted).length}
                </div>
                <div className="text-sm text-gray-300">Completed Modules</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">
                  {modules.filter(m => m.progress > 0 && !m.isCompleted).length}
                </div>
                <div className="text-sm text-gray-300">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">
                  {modules.reduce((sum, m) => sum + m.rewardAmount * (m.isCompleted ? 1 : 0), 0)}
                </div>
                <div className="text-sm text-gray-300">RUSH Earned</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">
                  {Math.round(modules.reduce((sum, m) => sum + m.progress, 0) / modules.length)}%
                </div>
                <div className="text-sm text-gray-300">Overall Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-6 bg-gray-800/50">
            <TabsTrigger value="paths">Learning Paths</TabsTrigger>
            <TabsTrigger value="all">All Modules</TabsTrigger>
            <TabsTrigger value="basics">Basics</TabsTrigger>
            <TabsTrigger value="avalanche">Avalanche</TabsTrigger>
            <TabsTrigger value="defi">DeFi</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          {/* Learning Paths Tab */}
          <TabsContent value="paths" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {learningPaths.map((path, index) => (
                <motion.div
                  key={path.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${path.color}`}>
                          {path.icon}
                        </div>
                        <div>
                          <div className="text-white">{path.name}</div>
                          <div className="text-sm text-gray-400 font-normal">
                            {path.modules.length} modules • {path.totalDuration} min
                          </div>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-gray-300 mb-4">
                        {path.description}
                      </CardDescription>
                      
                      <div className="space-y-3">
                        {path.modules.map(moduleId => {
                          const module = modules.find(m => m.id === moduleId);
                          if (!module) return null;
                          
                          return (
                            <div
                              key={moduleId}
                              className="flex items-center justify-between p-3 rounded-lg bg-gray-700/20"
                            >
                              <div className="flex items-center space-x-3">
                                {getCategoryIcon(module.category)}
                                <div>
                                  <div className="text-white text-sm font-medium">{module.title}</div>
                                  <div className="text-xs text-gray-400">{module.duration} min</div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {module.isCompleted ? (
                                  <CheckCircle className="h-5 w-5 text-green-400" />
                                ) : (
                                  <div className="w-12">
                                    <Progress value={module.progress} className="h-2" />
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Coins className="h-4 w-4 text-yellow-500" />
                            <span className="text-yellow-500 font-semibold">
                              {path.completionReward} RUSH
                            </span>
                          </div>
                          <Button 
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => setActiveTab('all')}
                          >
                            Start Learning
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Module Tabs */}
          <TabsContent value={activeTab} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {filteredModules().map((module, index) => (
                  <motion.div
                    key={module.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Card className={`${
                      module.isCompleted 
                        ? 'bg-green-500/10 border-green-500/30'
                        : module.isLocked
                        ? 'bg-gray-800/30 border-gray-600 opacity-60'
                        : 'bg-gray-800/50 border-gray-700 hover:bg-gray-800/70'
                    } transition-all duration-300`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getCategoryIcon(module.category)}
                            <Badge 
                              variant="outline" 
                              className={`${getDifficultyColor(module.difficulty)} text-xs`}
                            >
                              {module.difficulty}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-400">{module.duration}m</span>
                          </div>
                        </div>
                        <CardTitle className="text-lg text-white">{module.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-gray-300 mb-4">
                          {module.description}
                        </CardDescription>
                        
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-400">Progress</span>
                            <span className="text-gray-400">{Math.round(module.progress)}%</span>
                          </div>
                          <Progress value={module.progress} className="h-2" />
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="text-sm text-gray-400">Lessons:</div>
                          {module.lessons.slice(0, 3).map((lesson) => (
                            <div 
                              key={lesson.id} 
                              className="flex items-center space-x-2 text-sm"
                            >
                              {lesson.isCompleted ? (
                                <CheckCircle className="h-4 w-4 text-green-400" />
                              ) : (
                                getLessonIcon(lesson.type)
                              )}
                              <span className={lesson.isCompleted ? 'text-green-400' : 'text-gray-300'}>
                                {lesson.title}
                              </span>
                            </div>
                          ))}
                          {module.lessons.length > 3 && (
                            <div className="text-xs text-gray-500">
                              +{module.lessons.length - 3} more lessons
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <Coins className="h-4 w-4 text-yellow-500" />
                            <span className="text-yellow-500 font-semibold">
                              {module.rewardAmount} RUSH
                            </span>
                          </div>
                          <Button 
                            onClick={() => setSelectedModule(module)}
                            disabled={module.isLocked}
                            className={module.isCompleted 
                              ? "bg-green-600 hover:bg-green-700" 
                              : "bg-blue-600 hover:bg-blue-700"
                            }
                          >
                            {module.isCompleted ? (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Review
                              </>
                            ) : module.isLocked ? (
                              <>
                                <target className="h-4 w-4 mr-2" />
                                Locked
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-2" />
                                {module.progress > 0 ? 'Continue' : 'Start'}
                              </>
                            )}
                          </Button>
                        </div>
                        
                        {module.questId && (
                          <div className="mt-3 pt-3 border-t border-gray-700">
                            <div className="flex items-center space-x-2 text-sm">
                              <Target className="h-4 w-4 text-blue-400" />
                              <span className="text-blue-400">Includes Avalanche Quest</span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </TabsContent>
        </Tabs>

        {/* Module Detail Modal */}
        <Dialog open={!!selectedModule} onOpenChange={() => setSelectedModule(null)}>
          <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-4xl max-h-[80vh] overflow-y-auto">
            {selectedModule && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-3">
                    {getCategoryIcon(selectedModule.category)}
                    <span>{selectedModule.title}</span>
                    <Badge className={getDifficultyColor(selectedModule.difficulty)}>
                      {selectedModule.difficulty}
                    </Badge>
                  </DialogTitle>
                  <DialogDescription className="text-gray-300">
                    {selectedModule.description}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-400">{selectedModule.duration} minutes</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Coins className="h-4 w-4 text-yellow-500" />
                        <span className="text-yellow-500 font-semibold">
                          {selectedModule.rewardAmount} RUSH
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Progress</div>
                      <div className="text-lg font-bold text-white">
                        {Math.round(selectedModule.progress)}%
                      </div>
                    </div>
                  </div>
                  
                  <Progress value={selectedModule.progress} className="h-3" />
                  
                  <div className="space-y-3">
                    <div className="text-lg font-semibold">Lessons</div>
                    {selectedModule.lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                          lesson.isCompleted 
                            ? 'bg-green-500/10 border border-green-500/30' 
                            : 'bg-gray-700/30 hover:bg-gray-700/50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          {lesson.isCompleted ? (
                            <CheckCircle className="h-5 w-5 text-green-400" />
                          ) : (
                            getLessonIcon(lesson.type)
                          )}
                          <div>
                            <div className="font-medium text-white">{lesson.title}</div>
                            <div className="text-sm text-gray-400">
                              {lesson.type} • {lesson.duration} min
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => startLesson(selectedModule, lesson)}
                          className={lesson.isCompleted 
                            ? "bg-green-600 hover:bg-green-700" 
                            : "bg-blue-600 hover:bg-blue-700"
                          }
                        >
                          {lesson.isCompleted ? (
                            <>
                              <Eye className="h-4 w-4 mr-2" />
                              Review
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Start
                            </>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  {selectedModule.prerequisites.length > 0 && (
                    <div>
                      <div className="text-sm font-semibold mb-2">Prerequisites:</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedModule.prerequisites.map(prereq => {
                          const prereqModule = modules.find(m => m.id === prereq);
                          return prereqModule ? (
                            <Badge key={prereq} variant="outline" className="text-gray-400">
                              {prereqModule.title}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                  
                  {selectedModule.questId && (
                    <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                      <div className="flex items-center space-x-2 mb-2">
                        <Target className="h-5 w-5 text-blue-400" />
                        <span className="text-blue-400 font-semibold">Avalanche Quest</span>
                      </div>
                      <div className="text-sm text-gray-300">
                        Complete this module to unlock an exclusive Avalanche quest and earn additional rewards!
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Lesson Modal */}
        <Dialog open={!!selectedLesson} onOpenChange={() => setSelectedLesson(null)}>
          <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
            {selectedLesson && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    {getLessonIcon(selectedLesson.type)}
                    <span>{selectedLesson.title}</span>
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  {selectedLesson.type === 'video' && selectedLesson.videoUrl && (
                    <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                      <PlayCircle className="h-16 w-16 text-blue-400" />
                      <span className="ml-2 text-blue-400">Video Content</span>
                    </div>
                  )}
                  
                  <div className="prose prose-invert max-w-none">
                    <p>{selectedLesson.content}</p>
                  </div>
                  
                  {selectedLesson.quizQuestions && selectedLesson.quizQuestions.length > 0 && (
                    <div className="space-y-4">
                      <div className="text-lg font-semibold">Quiz</div>
                      {selectedLesson.quizQuestions.map((question, index) => (
                        <Card key={question.id} className="bg-gray-700/30">
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="font-medium">{question.question}</div>
                              <div className="grid grid-cols-1 gap-2">
                                {question.options.map((option, optionIndex) => (
                                  <button
                                    key={optionIndex}
                                    className="text-left p-3 rounded-lg bg-gray-600/30 hover:bg-gray-600/50 transition-colors"
                                    onClick={() => setCurrentQuiz(question)}
                                  >
                                    {option}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedLesson(null)}
                    >
                      Close
                    </Button>
                    <Button
                      onClick={() => completeLesson(selectedLesson.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete Lesson
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default LearnWeb3Page;
