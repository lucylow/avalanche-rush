import React, { useState, useEffect } from 'react';
import { useAdvancedWeb3 } from '../hooks/useAdvancedWeb3';
import Navigation from '../components/ui/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
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
  Puzzle,
  Home,
  BarChart3,
  Calendar,
  Settings,
  Bell,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Enhanced Learning Types
interface LearningModule {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  progress: number;
  isCompleted: boolean;
  isLocked: boolean;
  prerequisites: string[];
  icon: React.ReactNode;
  color: string;
  topics: string[];
  type: 'video' | 'interactive' | 'reading' | 'quiz' | 'project';
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  modules: LearningModule[];
  isCompleted: boolean;
  progress: number;
}

interface TutorialStep {
  id: string;
  title: string;
  type: 'concept' | 'interactive' | 'quiz' | 'demo';
  content: string;
  codeExample?: string;
  interactiveElement?: React.ReactNode;
  quizQuestion?: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  };
  expectedAction?: string;
  isCompleted: boolean;
}

interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'code' | 'scenario';
  options?: string[];
  correctAnswer: number | string | boolean;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  points: number;
  timeLimit?: number;
  codeExample?: string;
  hint?: string;
}

const EnhancedLearnWeb3Page: React.FC = () => {
  const { account, isConnected } = useAdvancedWeb3();
  
  // State management
  const [currentView, setCurrentView] = useState<'overview' | 'tutorial' | 'quiz' | 'path'>('overview');
  const [selectedTutorial, setSelectedTutorial] = useState<string | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Learning statistics
  const [learningStats, setLearningStats] = useState({
    totalModulesCompleted: 12,
    totalQuizzesPassed: 8,
    totalTimeSpent: 1240, // minutes
    currentStreak: 7,
    totalXP: 2840,
    level: 5
  });

  // Sample learning paths
  const learningPaths: LearningPath[] = [
    {
      id: 'blockchain-basics',
      title: 'Blockchain Fundamentals',
      description: 'Master the core concepts of blockchain technology from the ground up',
      category: 'Blockchain',
      difficulty: 'beginner',
      estimatedTime: 8,
      progress: 65,
      isCompleted: false,
      modules: [
        {
          id: 'what-is-blockchain',
          title: 'What is Blockchain?',
          description: 'Understand the fundamental concepts of blockchain technology',
          category: 'Blockchain',
          difficulty: 'beginner',
          duration: 45,
          progress: 100,
          isCompleted: true,
          isLocked: false,
          prerequisites: [],
          icon: <Shield className="h-5 w-5" />,
          color: 'bg-blue-500',
          topics: ['Distributed Ledger', 'Consensus', 'Cryptography'],
          type: 'video'
        },
        {
          id: 'cryptocurrency-basics',
          title: 'Cryptocurrency Basics',
          description: 'Learn about digital currencies and their role in blockchain',
          category: 'Blockchain',
          difficulty: 'beginner',
          duration: 60,
          progress: 80,
          isCompleted: false,
          isLocked: false,
          prerequisites: ['what-is-blockchain'],
          icon: <Coins className="h-5 w-5" />,
          color: 'bg-yellow-500',
          topics: ['Bitcoin', 'Altcoins', 'Wallets', 'Mining'],
          type: 'interactive'
        },
        {
          id: 'smart-contracts-intro',
          title: 'Introduction to Smart Contracts',
          description: 'Discover how smart contracts work and their applications',
          category: 'Smart Contracts',
          difficulty: 'intermediate',
          duration: 90,
          progress: 0,
          isCompleted: false,
          isLocked: true,
          prerequisites: ['cryptocurrency-basics'],
          icon: <Code className="h-5 w-5" />,
          color: 'bg-green-500',
          topics: ['Solidity', 'Ethereum', 'DeFi', 'DApps'],
          type: 'project'
        }
      ]
    },
    {
      id: 'avalanche-ecosystem',
      title: 'Avalanche Ecosystem Deep Dive',
      description: 'Comprehensive guide to the Avalanche blockchain and its ecosystem',
      category: 'Avalanche',
      difficulty: 'intermediate',
      estimatedTime: 12,
      progress: 30,
      isCompleted: false,
      modules: [
        {
          id: 'avalanche-architecture',
          title: 'Avalanche Architecture',
          description: 'Understand the unique consensus mechanism and subnet architecture',
          category: 'Avalanche',
          difficulty: 'intermediate',
          duration: 75,
          progress: 60,
          isCompleted: false,
          isLocked: false,
          prerequisites: [],
          icon: <Mountain className="h-5 w-5" />,
          color: 'bg-red-500',
          topics: ['Consensus', 'Subnets', 'X-Chain', 'P-Chain', 'C-Chain'],
          type: 'interactive'
        },
        {
          id: 'avalanche-defi',
          title: 'DeFi on Avalanche',
          description: 'Explore decentralized finance applications on Avalanche',
          category: 'DeFi',
          difficulty: 'intermediate',
          duration: 120,
          progress: 0,
          isCompleted: false,
          isLocked: true,
          prerequisites: ['avalanche-architecture'],
          icon: <TrendingUp className="h-5 w-5" />,
          color: 'bg-purple-500',
          topics: ['Trader Joe', 'Pangolin', 'Benqi', 'Yield Farming'],
          type: 'video'
        }
      ]
    }
  ];

  // Sample tutorials
  const tutorials = [
    {
      id: 'wallet-setup',
      title: 'Setting Up Your First Crypto Wallet',
      description: 'Step-by-step guide to creating and securing your cryptocurrency wallet',
      difficulty: 'beginner',
      estimatedTime: 20,
      steps: [
        {
          id: 'wallet-types',
          title: 'Types of Wallets',
          type: 'concept',
          content: 'There are several types of cryptocurrency wallets: hardware wallets (most secure), software wallets (convenient), and paper wallets (offline storage). Each has its own advantages and security considerations.',
          isCompleted: false
        },
        {
          id: 'wallet-creation',
          title: 'Creating a Software Wallet',
          type: 'interactive',
          content: 'Let\'s create a MetaMask wallet together. This is one of the most popular software wallets for Ethereum and Avalanche.',
          expectedAction: 'Click the "Create Wallet" button in MetaMask',
          isCompleted: false
        },
        {
          id: 'security-quiz',
          title: 'Wallet Security Quiz',
          type: 'quiz',
          content: 'Test your understanding of wallet security best practices.',
          quizQuestion: {
            question: 'What is the most important thing to remember about your wallet seed phrase?',
            options: [
              'Share it with trusted friends',
              'Store it securely and never share it',
              'Write it on your computer',
              'Save it in your email'
            ],
            correctAnswer: 1,
            explanation: 'Your seed phrase is the master key to your wallet. It should be stored securely offline and never shared with anyone.'
          },
          isCompleted: false
        }
      ]
    }
  ];

  // Sample quiz questions
  const quizQuestions: QuizQuestion[] = [
    {
      id: 'blockchain-quiz-1',
      question: 'What is the primary purpose of a blockchain?',
      type: 'multiple-choice',
      options: [
        'To store data in a centralized database',
        'To create a decentralized, immutable ledger',
        'To mine cryptocurrency',
        'To process payments faster'
      ],
      correctAnswer: 1,
      explanation: 'Blockchain creates a decentralized, immutable ledger that records transactions across multiple computers.',
      difficulty: 'easy',
      category: 'Blockchain',
      points: 10
    },
    {
      id: 'avalanche-quiz-1',
      question: 'Which consensus mechanism does Avalanche use?',
      type: 'multiple-choice',
      options: [
        'Proof of Work',
        'Proof of Stake',
        'Avalanche Consensus',
        'Delegated Proof of Stake'
      ],
      correctAnswer: 2,
      explanation: 'Avalanche uses its own unique consensus mechanism called Avalanche Consensus, which provides fast finality and high throughput.',
      difficulty: 'medium',
      category: 'Avalanche',
      points: 15,
      hint: 'Avalanche is named after its consensus mechanism'
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const handleTutorialComplete = (score: number, timeSpent: number) => {
    console.log('Tutorial completed:', { score, timeSpent });
    setCurrentView('overview');
    setSelectedTutorial(null);
  };

  const handleQuizComplete = (result: any) => {
    console.log('Quiz completed:', result);
    setCurrentView('overview');
    setSelectedQuiz(null);
  };

  const handleModuleSelect = (moduleId: string) => {
    console.log('Module selected:', moduleId);
  };

  if (currentView === 'tutorial' && selectedTutorial) {
    const tutorial = tutorials.find(t => t.id === selectedTutorial);
    if (tutorial) {
      return (
        <InteractiveTutorial
          tutorialId={tutorial.id}
          title={tutorial.title}
          description={tutorial.description}
          difficulty={tutorial.difficulty as any}
          estimatedTime={tutorial.estimatedTime}
          steps={tutorial.steps}
          onComplete={handleTutorialComplete}
          onProgress={() => {}}
        />
      );
    }
  }

  if (currentView === 'quiz' && selectedQuiz) {
    return (
      <QuizSystem
        questions={quizQuestions}
        title="Blockchain Fundamentals Quiz"
        description="Test your knowledge of blockchain basics"
        timeLimit={15}
        passingScore={70}
        onComplete={handleQuizComplete}
        onRetry={() => setSelectedQuiz(null)}
      />
    );
  }

  if (currentView === 'path' && selectedPath) {
    const path = learningPaths.find(p => p.id === selectedPath);
    if (path) {
      return (
        <LearningPath
          path={path}
          onModuleSelect={handleModuleSelect}
          userProgress={{}}
        />
      );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">Learn Web3 & Blockchain</h1>
                <p className="text-xl text-blue-100">
                  Master blockchain technology through interactive tutorials, quizzes, and hands-on projects
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">Level {learningStats.level}</div>
                <div className="text-blue-200">{learningStats.totalXP} XP</div>
                <Progress value={65} className="w-32 h-2 mt-2" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Learning Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="flex justify-center mb-2">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <div className="text-2xl font-bold">{learningStats.totalModulesCompleted}</div>
              <div className="text-sm text-gray-600">Modules Completed</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="flex justify-center mb-2">
                <Brain className="h-8 w-8 text-blue-500" />
              </div>
              <div className="text-2xl font-bold">{learningStats.totalQuizzesPassed}</div>
              <div className="text-sm text-gray-600">Quizzes Passed</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="flex justify-center mb-2">
                <Clock className="h-8 w-8 text-purple-500" />
              </div>
              <div className="text-2xl font-bold">{Math.round(learningStats.totalTimeSpent / 60)}h</div>
              <div className="text-sm text-gray-600">Time Spent</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="flex justify-center mb-2">
                <Trophy className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="text-2xl font-bold">{learningStats.currentStreak}</div>
              <div className="text-sm text-gray-600">Day Streak</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <Tabs defaultValue="paths" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="paths">Learning Paths</TabsTrigger>
            <TabsTrigger value="tutorials">Interactive Tutorials</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="paths" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {learningPaths.map((path, index) => (
                <motion.div
                  key={path.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105"
                    onClick={() => {
                      setSelectedPath(path.id);
                      setCurrentView('path');
                    }}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-lg ${path.difficulty === 'beginner' ? 'bg-green-500' : path.difficulty === 'intermediate' ? 'bg-yellow-500' : 'bg-red-500'} text-white`}>
                          {path.category === 'Blockchain' ? <Shield className="h-5 w-5" /> : <Mountain className="h-5 w-5" />}
                        </div>
                        <Badge className={`${getDifficultyColor(path.difficulty)} text-white`}>
                          {path.difficulty}
                        </Badge>
                      </div>
                      
                      <CardTitle className="text-xl">{path.title}</CardTitle>
                      <CardDescription className="text-base">{path.description}</CardDescription>
                      
                      <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-500 mb-1">
                          <span>Progress</span>
                          <span>{path.progress}%</span>
                        </div>
                        <Progress value={path.progress} className="h-2" />
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{path.estimatedTime}h</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Target className="h-4 w-4" />
                            <span>{path.modules.length} modules</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                          <span>Start</span>
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tutorials" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tutorials.map((tutorial, index) => (
                <motion.div
                  key={tutorial.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105"
                    onClick={() => {
                      setSelectedTutorial(tutorial.id);
                      setCurrentView('tutorial');
                    }}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-lg bg-blue-500 text-white">
                          <Play className="h-5 w-5" />
                        </div>
                        <Badge className={`${getDifficultyColor(tutorial.difficulty)} text-white`}>
                          {tutorial.difficulty}
                        </Badge>
                      </div>
                      
                      <CardTitle className="text-lg">{tutorial.title}</CardTitle>
                      <CardDescription>{tutorial.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{tutorial.estimatedTime} min</span>
                        </div>
                        <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                          <span>Start</span>
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="quizzes" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  id: 'blockchain-basics-quiz',
                  title: 'Blockchain Fundamentals',
                  description: 'Test your understanding of blockchain basics',
                  difficulty: 'beginner',
                  questions: 10,
                  timeLimit: 15
                },
                {
                  id: 'avalanche-quiz',
                  title: 'Avalanche Ecosystem',
                  description: 'Quiz on Avalanche blockchain features',
                  difficulty: 'intermediate',
                  questions: 15,
                  timeLimit: 20
                },
                {
                  id: 'defi-quiz',
                  title: 'DeFi Protocols',
                  description: 'Test your DeFi knowledge',
                  difficulty: 'advanced',
                  questions: 20,
                  timeLimit: 25
                }
              ].map((quiz, index) => (
                <motion.div
                  key={quiz.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105"
                    onClick={() => {
                      setSelectedQuiz(quiz.id);
                      setCurrentView('quiz');
                    }}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-lg bg-purple-500 text-white">
                          <Brain className="h-5 w-5" />
                        </div>
                        <Badge className={`${getDifficultyColor(quiz.difficulty)} text-white`}>
                          {quiz.difficulty}
                        </Badge>
                      </div>
                      
                      <CardTitle className="text-lg">{quiz.title}</CardTitle>
                      <CardDescription>{quiz.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>Questions: {quiz.questions}</span>
                          <span>Time: {quiz.timeLimit} min</span>
                        </div>
                        <Button className="w-full flex items-center justify-center space-x-2">
                          <span>Start Quiz</span>
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: 'Avalanche Documentation',
                  description: 'Official Avalanche blockchain documentation',
                  icon: <BookOpen className="h-5 w-5" />,
                  color: 'bg-blue-500',
                  link: 'https://docs.avax.network'
                },
                {
                  title: 'DeFi Pulse',
                  description: 'Track DeFi protocols and analytics',
                  icon: <TrendingUp className="h-5 w-5" />,
                  color: 'bg-green-500',
                  link: 'https://defipulse.com'
                },
                {
                  title: 'CoinGecko',
                  description: 'Cryptocurrency prices and market data',
                  icon: <Coins className="h-5 w-5" />,
                  color: 'bg-yellow-500',
                  link: 'https://coingecko.com'
                }
              ].map((resource, index) => (
                <motion.div
                  key={resource.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105">
                    <CardHeader>
                      <div className="flex items-center space-x-3 mb-4">
                        <div className={`p-3 rounded-lg ${resource.color} text-white`}>
                          {resource.icon}
                        </div>
                        <ExternalLink className="h-4 w-4 text-gray-400" />
                      </div>
                      
                      <CardTitle className="text-lg">{resource.title}</CardTitle>
                      <CardDescription>{resource.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => window.open(resource.link, '_blank')}
                      >
                        Visit Resource
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnhancedLearnWeb3Page;
