import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Wallet, 
  Shield, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle,
  Info,
  Zap,
  Globe,
  Lock,
  Users,
  Star,
  Trophy,
  BookOpen,
  Play,
  Settings,
  HelpCircle
} from 'lucide-react';

// Types
interface UserJourneyStep {
  id: string;
  title: string;
  description: string;
  type: 'web2' | 'web3' | 'hybrid';
  completed: boolean;
  required: boolean;
  estimatedTime: number; // in minutes
  icon: React.ReactNode;
  actions: UserAction[];
}

interface UserAction {
  id: string;
  label: string;
  description: string;
  completed: boolean;
  type: 'button' | 'link' | 'input' | 'wallet';
}

interface UserProfile {
  type: 'web2' | 'web3' | 'hybrid';
  experience: 'beginner' | 'intermediate' | 'advanced';
  preferences: {
    custodialWallet: boolean;
    selfCustody: boolean;
    crossChain: boolean;
    socialLogin: boolean;
  };
  progress: {
    currentStep: number;
    completedSteps: string[];
    totalSteps: number;
  };
}

interface WalletOption {
  id: string;
  name: string;
  type: 'custodial' | 'self-custody' | 'social';
  description: string;
  features: string[];
  icon: React.ReactNode;
  recommended: boolean;
}

interface Web3EducationStep {
  id: string;
  title: string;
  content: string;
  type: 'concept' | 'interactive' | 'quiz';
  completed: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface ProgressiveOnboardingProps {
  onComplete: (profile: UserProfile) => void;
  onSkip: () => void;
}

const ProgressiveOnboarding: React.FC<ProgressiveOnboardingProps> = ({
  onComplete,
  onSkip
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    type: 'hybrid',
    experience: 'beginner',
    preferences: {
      custodialWallet: false,
      selfCustody: false,
      crossChain: false,
      socialLogin: false
    },
    progress: {
      currentStep: 0,
      completedSteps: [],
      totalSteps: 7
    }
  });

  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [educationProgress, setEducationProgress] = useState<Record<string, boolean>>({});

  // User journey steps
  const journeySteps: UserJourneyStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Avalanche Rush!',
      description: 'Let\'s get you started with the best Web3 gaming experience',
      type: 'hybrid',
      completed: false,
      required: true,
      estimatedTime: 1,
      icon: <Star className="h-6 w-6" />,
      actions: [
        { id: 'start', label: 'Get Started', description: 'Begin your journey', completed: false, type: 'button' }
      ]
    },
    {
      id: 'user-type',
      title: 'What\'s your experience level?',
      description: 'Help us customize your experience',
      type: 'hybrid',
      completed: false,
      required: true,
      estimatedTime: 2,
      icon: <Users className="h-6 w-6" />,
      actions: [
        { id: 'web2', label: 'New to Web3', description: 'I\'m new to blockchain', completed: false, type: 'button' },
        { id: 'web3', label: 'Web3 Native', description: 'I know my way around', completed: false, type: 'button' },
        { id: 'hybrid', label: 'Somewhere in between', description: 'I have some experience', completed: false, type: 'button' }
      ]
    },
    {
      id: 'wallet-setup',
      title: 'Choose your wallet',
      description: 'Select how you\'d like to manage your assets',
      type: 'web3',
      completed: false,
      required: true,
      estimatedTime: 5,
      icon: <Wallet className="h-6 w-6" />,
      actions: [
        { id: 'custodial', label: 'Custodial Wallet', description: 'We manage your keys', completed: false, type: 'wallet' },
        { id: 'self-custody', label: 'Self-Custody', description: 'You control your keys', completed: false, type: 'wallet' },
        { id: 'social', label: 'Social Login', description: 'Login with social accounts', completed: false, type: 'wallet' }
      ]
    },
    {
      id: 'education',
      title: 'Learn the basics',
      description: 'Understand key Web3 concepts',
      type: 'web3',
      completed: false,
      required: false,
      estimatedTime: 10,
      icon: <BookOpen className="h-6 w-6" />,
      actions: [
        { id: 'concepts', label: 'Key Concepts', description: 'Learn blockchain basics', completed: false, type: 'button' },
        { id: 'security', label: 'Security Tips', description: 'Keep your assets safe', completed: false, type: 'button' },
        { id: 'skip', label: 'Skip for now', description: 'I\'ll learn later', completed: false, type: 'button' }
      ]
    },
    {
      id: 'game-setup',
      title: 'Set up your game profile',
      description: 'Customize your gaming experience',
      type: 'hybrid',
      completed: false,
      required: true,
      estimatedTime: 3,
      icon: <Play className="h-6 w-6" />,
      actions: [
        { id: 'character', label: 'Choose Character', description: 'Select your avatar', completed: false, type: 'button' },
        { id: 'preferences', label: 'Game Preferences', description: 'Set your preferences', completed: false, type: 'button' }
      ]
    },
    {
      id: 'security',
      title: 'Security & Privacy',
      description: 'Configure your security settings',
      type: 'web3',
      completed: false,
      required: true,
      estimatedTime: 5,
      icon: <Shield className="h-6 w-6" />,
      actions: [
        { id: 'backup', label: 'Backup Wallet', description: 'Secure your recovery phrase', completed: false, type: 'button' },
        { id: '2fa', label: 'Two-Factor Auth', description: 'Add extra security', completed: false, type: 'button' },
        { id: 'privacy', label: 'Privacy Settings', description: 'Control your data', completed: false, type: 'button' }
      ]
    },
    {
      id: 'complete',
      title: 'You\'re all set!',
      description: 'Start your Avalanche Rush adventure',
      type: 'hybrid',
      completed: false,
      required: true,
      estimatedTime: 1,
      icon: <Trophy className="h-6 w-6" />,
      actions: [
        { id: 'start-game', label: 'Start Playing', description: 'Jump into the action', completed: false, type: 'button' }
      ]
    }
  ];

  // Wallet options
  const walletOptions: WalletOption[] = [
    {
      id: 'custodial',
      name: 'Custodial Wallet',
      type: 'custodial',
      description: 'We securely manage your private keys. Perfect for beginners.',
      features: ['Easy setup', 'No private key management', 'Recovery support', 'Social login'],
      icon: <Shield className="h-8 w-8" />,
      recommended: userProfile.type === 'web2'
    },
    {
      id: 'self-custody',
      name: 'Self-Custody Wallet',
      type: 'self-custody',
      description: 'You control your private keys. Maximum security and control.',
      features: ['Full control', 'Maximum security', 'Cross-chain support', 'DeFi access'],
      icon: <Lock className="h-8 w-8" />,
      recommended: userProfile.type === 'web3'
    },
    {
      id: 'social',
      name: 'Social Login',
      type: 'social',
      description: 'Login with your social accounts. Seamless experience.',
      features: ['Quick login', 'Social recovery', 'Familiar UX', 'Progressive Web3'],
      icon: <Globe className="h-8 w-8" />,
      recommended: userProfile.type === 'hybrid'
    }
  ];

  // Web3 education steps
  const educationSteps: Web3EducationStep[] = [
    {
      id: 'blockchain-basics',
      title: 'What is Blockchain?',
      content: 'Blockchain is a distributed ledger technology that maintains a continuously growing list of records.',
      type: 'concept',
      completed: false,
      difficulty: 'easy'
    },
    {
      id: 'wallets',
      title: 'Understanding Wallets',
      content: 'A wallet is your gateway to Web3. It stores your private keys and allows you to interact with blockchain.',
      type: 'concept',
      completed: false,
      difficulty: 'easy'
    },
    {
      id: 'security',
      title: 'Security Best Practices',
      content: 'Never share your private keys, always verify transactions, and use hardware wallets for large amounts.',
      type: 'concept',
      completed: false,
      difficulty: 'medium'
    },
    {
      id: 'transactions',
      title: 'How Transactions Work',
      content: 'Transactions are signed with your private key and broadcast to the network for verification.',
      type: 'concept',
      completed: false,
      difficulty: 'medium'
    }
  ];

  const handleStepAction = useCallback((stepId: string, actionId: string) => {
    const step = journeySteps[currentStep];
    const action = step.actions.find(a => a.id === actionId);
    
    if (!action) return;

    // Mark action as completed
    action.completed = true;

    // Handle specific actions
    switch (actionId) {
      case 'web2':
        setUserProfile(prev => ({ ...prev, type: 'web2', experience: 'beginner' }));
        break;
      case 'web3':
        setUserProfile(prev => ({ ...prev, type: 'web3', experience: 'advanced' }));
        break;
      case 'hybrid':
        setUserProfile(prev => ({ ...prev, type: 'hybrid', experience: 'intermediate' }));
        break;
      case 'custodial':
      case 'self-custody':
      case 'social':
        setSelectedWallet(actionId);
        break;
      case 'skip':
        // Skip education step
        break;
      case 'start-game':
        onComplete(userProfile);
        return;
    }

    // Check if all required actions are completed
    const allRequiredCompleted = step.actions.filter(a => step.required || a.completed).every(a => a.completed);
    
    if (allRequiredCompleted) {
      // Mark step as completed
      step.completed = true;
      setUserProfile(prev => ({
        ...prev,
        progress: {
          ...prev.progress,
          completedSteps: [...prev.progress.completedSteps, stepId],
          currentStep: currentStep + 1
        }
      }));

      // Move to next step
      if (currentStep < journeySteps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        onComplete(userProfile);
      }
    }
  }, [currentStep, journeySteps, userProfile, onComplete]);

  const handleEducationStep = (stepId: string) => {
    setEducationProgress(prev => ({ ...prev, [stepId]: true }));
  };

  const progress = ((currentStep + 1) / journeySteps.length) * 100;
  const currentStepData = journeySteps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl"
      >
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-white">
                {currentStepData.icon}
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {currentStepData.title}
            </CardTitle>
            <p className="text-gray-600 mt-2">
              {currentStepData.description}
            </p>
            
            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>Step {currentStep + 1} of {journeySteps.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* User Type Selection */}
                {currentStepData.id === 'user-type' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['web2', 'web3', 'hybrid'].map((type) => (
                      <motion.div
                        key={type}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card 
                          className={`cursor-pointer transition-all duration-300 ${
                            userProfile.type === type 
                              ? 'ring-2 ring-blue-500 bg-blue-50' 
                              : 'hover:shadow-lg'
                          }`}
                          onClick={() => handleStepAction('user-type', type)}
                        >
                          <CardContent className="p-6 text-center">
                            <div className={`p-3 rounded-full mx-auto mb-4 ${
                              userProfile.type === type 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {type === 'web2' ? <Info className="h-6 w-6" /> :
                               type === 'web3' ? <Zap className="h-6 w-6" /> :
                               <Users className="h-6 w-6" />}
                            </div>
                            <h3 className="font-semibold text-lg mb-2">
                              {type === 'web2' ? 'New to Web3' :
                               type === 'web3' ? 'Web3 Native' :
                               'Somewhere in between'}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {type === 'web2' ? 'I\'m new to blockchain and need guidance' :
                               type === 'web3' ? 'I know my way around Web3' :
                               'I have some experience but could use help'}
                            </p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Wallet Selection */}
                {currentStepData.id === 'wallet-setup' && (
                  <div className="space-y-4">
                    {walletOptions.map((wallet) => (
                      <motion.div
                        key={wallet.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <Card 
                          className={`cursor-pointer transition-all duration-300 ${
                            selectedWallet === wallet.id 
                              ? 'ring-2 ring-blue-500 bg-blue-50' 
                              : 'hover:shadow-lg'
                          }`}
                          onClick={() => handleStepAction('wallet-setup', wallet.id)}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start space-x-4">
                              <div className={`p-3 rounded-lg ${
                                selectedWallet === wallet.id 
                                  ? 'bg-blue-500 text-white' 
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {wallet.icon}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h3 className="font-semibold text-lg">{wallet.name}</h3>
                                  {wallet.recommended && (
                                    <Badge className="bg-green-500 text-white">Recommended</Badge>
                                  )}
                                </div>
                                <p className="text-gray-600 mb-3">{wallet.description}</p>
                                <div className="flex flex-wrap gap-2">
                                  {wallet.features.map((feature) => (
                                    <Badge key={feature} variant="secondary" className="text-xs">
                                      {feature}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Education Steps */}
                {currentStepData.id === 'education' && (
                  <div className="space-y-4">
                    <Tabs defaultValue="concepts" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="concepts">Concepts</TabsTrigger>
                        <TabsTrigger value="security">Security</TabsTrigger>
                        <TabsTrigger value="quiz">Quiz</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="concepts" className="space-y-4">
                        {educationSteps.filter(step => step.type === 'concept').map((step) => (
                          <Card key={step.id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                                  <p className="text-gray-600 mb-4">{step.content}</p>
                                  <Badge className={`${
                                    step.difficulty === 'easy' ? 'bg-green-500' :
                                    step.difficulty === 'medium' ? 'bg-yellow-500' :
                                    'bg-red-500'
                                  } text-white`}>
                                    {step.difficulty}
                                  </Badge>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEducationStep(step.id)}
                                  disabled={educationProgress[step.id]}
                                >
                                  {educationProgress[step.id] ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  ) : (
                                    'Learn'
                                  )}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </TabsContent>
                      
                      <TabsContent value="security" className="space-y-4">
                        <Card className="bg-red-50 border-red-200">
                          <CardContent className="p-6">
                            <div className="flex items-start space-x-3">
                              <AlertCircle className="h-6 w-6 text-red-500 mt-1" />
                              <div>
                                <h3 className="font-semibold text-lg text-red-800 mb-2">Security Tips</h3>
                                <ul className="space-y-2 text-red-700">
                                  <li>• Never share your private keys or seed phrase</li>
                                  <li>• Always verify transaction details before signing</li>
                                  <li>• Use hardware wallets for large amounts</li>
                                  <li>• Be cautious of phishing attempts</li>
                                  <li>• Keep your wallet software updated</li>
                                </ul>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                      
                      <TabsContent value="quiz" className="space-y-4">
                        <Card>
                          <CardContent className="p-6">
                            <h3 className="font-semibold text-lg mb-4">Quick Knowledge Check</h3>
                            <div className="space-y-4">
                              <div className="p-4 bg-blue-50 rounded-lg">
                                <p className="font-medium mb-2">What is a private key?</p>
                                <div className="space-y-2">
                                  {['A password for your wallet', 'A public address', 'A recovery phrase'].map((option) => (
                                    <label key={option} className="flex items-center space-x-2 cursor-pointer">
                                      <input type="radio" name="quiz1" className="text-blue-500" />
                                      <span>{option}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                              <Button 
                                className="w-full"
                                onClick={() => handleStepAction('education', 'quiz')}
                              >
                                Submit Answer
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
                    
                    <div className="flex justify-center space-x-4 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => handleStepAction('education', 'skip')}
                      >
                        Skip for now
                      </Button>
                    </div>
                  </div>
                )}

                {/* Game Setup */}
                {currentStepData.id === 'game-setup' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Play className="h-5 w-5" />
                          <span>Choose Character</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-2">
                          {['Warrior', 'Mage', 'Ranger'].map((character) => (
                            <div key={character} className="p-4 border rounded-lg text-center cursor-pointer hover:bg-blue-50">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-2"></div>
                              <p className="text-sm font-medium">{character}</p>
                            </div>
                          ))}
                        </div>
                        <Button 
                          className="w-full mt-4"
                          onClick={() => handleStepAction('game-setup', 'character')}
                        >
                          Select Character
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Settings className="h-5 w-5" />
                          <span>Game Preferences</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Sound Effects</span>
                            <input type="checkbox" defaultChecked className="toggle" />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Music</span>
                            <input type="checkbox" defaultChecked className="toggle" />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Notifications</span>
                            <input type="checkbox" defaultChecked className="toggle" />
                          </div>
                        </div>
                        <Button 
                          className="w-full mt-4"
                          onClick={() => handleStepAction('game-setup', 'preferences')}
                        >
                          Save Preferences
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Security Setup */}
                {currentStepData.id === 'security' && (
                  <div className="space-y-4">
                    <Card className="bg-yellow-50 border-yellow-200">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-3">
                          <AlertCircle className="h-6 w-6 text-yellow-600 mt-1" />
                          <div>
                            <h3 className="font-semibold text-lg text-yellow-800 mb-2">Backup Your Wallet</h3>
                            <p className="text-yellow-700 mb-4">
                              Write down your recovery phrase and store it safely. This is the only way to recover your wallet.
                            </p>
                            <Button 
                              variant="outline"
                              onClick={() => handleStepAction('security', 'backup')}
                            >
                              I've Backed Up My Wallet
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="p-6">
                          <h3 className="font-semibold mb-4">Two-Factor Authentication</h3>
                          <p className="text-gray-600 mb-4">Add an extra layer of security to your account.</p>
                          <Button 
                            variant="outline"
                            className="w-full"
                            onClick={() => handleStepAction('security', '2fa')}
                          >
                            Enable 2FA
                          </Button>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-6">
                          <h3 className="font-semibold mb-4">Privacy Settings</h3>
                          <p className="text-gray-600 mb-4">Control how your data is shared and used.</p>
                          <Button 
                            variant="outline"
                            className="w-full"
                            onClick={() => handleStepAction('security', 'privacy')}
                          >
                            Configure Privacy
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                {/* Welcome and Complete Steps */}
                {(currentStepData.id === 'welcome' || currentStepData.id === 'complete') && (
                  <div className="text-center space-y-6">
                    <div className="p-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl text-white">
                      <h2 className="text-3xl font-bold mb-4">
                        {currentStepData.id === 'welcome' ? 'Ready to Start?' : 'Welcome to Avalanche Rush!'}
                      </h2>
                      <p className="text-xl text-blue-100">
                        {currentStepData.id === 'welcome' 
                          ? 'Let\'s create your perfect gaming experience'
                          : 'Your adventure in the Web3 gaming universe begins now!'
                        }
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Trophy className="h-6 w-6 text-blue-600" />
                        </div>
                        <h3 className="font-semibold">Earn Rewards</h3>
                        <p className="text-sm text-gray-600">Play and earn cryptocurrency</p>
                      </div>
                      <div className="text-center p-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Shield className="h-6 w-6 text-green-600" />
                        </div>
                        <h3 className="font-semibold">Secure Gaming</h3>
                        <p className="text-sm text-gray-600">Your assets are protected</p>
                      </div>
                      <div className="text-center p-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Globe className="h-6 w-6 text-purple-600" />
                        </div>
                        <h3 className="font-semibold">Cross-Chain</h3>
                        <p className="text-sm text-gray-600">Play across multiple chains</p>
                      </div>
                    </div>

                    <Button 
                      size="lg"
                      className="w-full md:w-auto"
                      onClick={() => handleStepAction(currentStepData.id, 'start')}
                    >
                      {currentStepData.id === 'welcome' ? 'Get Started' : 'Start Playing'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* Default Action Buttons */}
                {currentStepData.id !== 'user-type' && 
                 currentStepData.id !== 'wallet-setup' && 
                 currentStepData.id !== 'education' &&
                 currentStepData.id !== 'game-setup' &&
                 currentStepData.id !== 'security' &&
                 currentStepData.id !== 'welcome' &&
                 currentStepData.id !== 'complete' && (
                  <div className="flex justify-center space-x-4">
                    {currentStepData.actions.map((action) => (
                      <Button
                        key={action.id}
                        onClick={() => handleStepAction(currentStepData.id, action.id)}
                        disabled={action.completed}
                        className="flex items-center space-x-2"
                      >
                        {action.completed ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : null}
                        <span>{action.label}</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>

          {/* Footer */}
          <div className="px-6 pb-6">
            <div className="flex justify-between items-center">
              <Button variant="ghost" onClick={onSkip}>
                Skip Setup
              </Button>
              
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <HelpCircle className="h-4 w-4" />
                <span>Need help? Contact support</span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default ProgressiveOnboarding;





