import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RewardSchedule {
  immediate: RewardTrigger[];
  shortTerm: RewardTrigger[];
  mediumTerm: RewardTrigger[];
  longTerm: RewardTrigger[];
}

interface RewardTrigger {
  trigger: string;
  reward: string;
  probability?: number;
  cooldown?: number;
  lastTriggered?: number;
}

interface RewardNotification {
  id: string;
  type: 'immediate' | 'shortTerm' | 'mediumTerm' | 'longTerm';
  title: string;
  description: string;
  value?: number;
  icon: string;
  color: string;
  duration: number;
}

interface UserEngagementMetrics {
  sessionTime: number;
  actionsPerMinute: number;
  rewardResponseTime: number;
  satisfactionScore: number;
  retentionProbability: number;
}

const RewardPsychologyEngine: React.FC = () => {
  const [rewardSchedule] = useState<RewardSchedule>({
    immediate: [
      { trigger: 'gameStart', reward: 'energyFull', probability: 1.0 },
      { trigger: 'firstJump', reward: 'positiveFeedback', probability: 1.0 },
      { trigger: 'coinCollect', reward: 'points+sound', probability: 1.0 },
      { trigger: 'obstacleAvoid', reward: 'skillPoint', probability: 0.8 },
      { trigger: 'comboHit', reward: 'multiplierBonus', probability: 0.9 }
    ],
    shortTerm: [
      { trigger: '100Points', reward: 'miniAchievement', probability: 1.0, cooldown: 30000 },
      { trigger: '5Coins', reward: 'smallBonus', probability: 1.0, cooldown: 60000 },
      { trigger: 'firstObstacle', reward: 'learningTip', probability: 1.0 },
      { trigger: 'perfectJump', reward: 'stylePoints', probability: 0.7, cooldown: 15000 },
      { trigger: 'nearMiss', reward: 'adrenalineBoost', probability: 0.6, cooldown: 20000 }
    ],
    mediumTerm: [
      { trigger: 'questComplete', reward: 'NFT+points', probability: 1.0, cooldown: 300000 },
      { trigger: 'levelUp', reward: 'newAbility', probability: 1.0, cooldown: 600000 },
      { trigger: 'dailyLogin', reward: 'bonusEnergy', probability: 1.0, cooldown: 86400000 },
      { trigger: 'streakMaintain', reward: 'streakBonus', probability: 1.0, cooldown: 86400000 },
      { trigger: 'socialShare', reward: 'communityPoints', probability: 0.8, cooldown: 3600000 }
    ],
    longTerm: [
      { trigger: 'allQuests', reward: 'rareNFT', probability: 1.0 },
      { trigger: 'topLeaderboard', reward: 'specialTitle', probability: 1.0 },
      { trigger: 'seasonComplete', reward: 'exclusiveRewards', probability: 1.0 },
      { trigger: 'masterLevel', reward: 'legendaryStatus', probability: 1.0 },
      { trigger: 'communityContribution', reward: 'contributorBadge', probability: 0.9 }
    ]
  });

  const [activeRewards, setActiveRewards] = useState<RewardNotification[]>([]);
  const [engagementMetrics, setEngagementMetrics] = useState<UserEngagementMetrics>({
    sessionTime: 0,
    actionsPerMinute: 0,
    rewardResponseTime: 0,
    satisfactionScore: 0.8,
    retentionProbability: 0.7
  });

  const [rewardHistory, setRewardHistory] = useState<string[]>([]);

  // Calculate optimal reward timing using variable ratio reinforcement
  const calculateOptimalRewardTiming = useCallback(() => {
    const baseIntervals = {
      smallRewards: randomBetween(30, 120), // seconds
      mediumRewards: randomBetween(300, 600),
      largeRewards: randomBetween(1800, 3600)
    };

    // Adjust based on engagement metrics
    const engagementMultiplier = Math.max(0.5, Math.min(2.0, engagementMetrics.satisfactionScore * 1.5));
    
    return {
      smallRewards: baseIntervals.smallRewards / engagementMultiplier,
      mediumRewards: baseIntervals.mediumRewards / engagementMultiplier,
      largeRewards: baseIntervals.largeRewards / engagementMultiplier
    };
  }, [engagementMetrics.satisfactionScore]);

  const randomBetween = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  // Trigger reward based on game event
  const triggerReward = useCallback((eventType: string, context?: any) => {
    const now = Date.now();
    let triggered = false;

    // Check all reward categories
    Object.entries(rewardSchedule).forEach(([category, triggers]) => {
      triggers.forEach((trigger) => {
        if (trigger.trigger === eventType) {
          // Check cooldown
          if (trigger.cooldown && trigger.lastTriggered) {
            if (now - trigger.lastTriggered < trigger.cooldown) {
              return;
            }
          }

          // Check probability
          if (trigger.probability && Math.random() > trigger.probability) {
            return;
          }

          // Create reward notification
          const reward = createRewardNotification(trigger, category as keyof RewardSchedule, context);
          if (reward) {
            setActiveRewards(prev => [...prev, reward]);
            setRewardHistory(prev => [...prev.slice(-19), eventType]); // Keep last 20
            
            // Update trigger timestamp
            trigger.lastTriggered = now;
            triggered = true;

            // Update engagement metrics
            updateEngagementMetrics(category as keyof RewardSchedule);
          }
        }
      });
    });

    return triggered;
  }, [rewardSchedule]);

  const createRewardNotification = (
    trigger: RewardTrigger, 
    category: keyof RewardSchedule, 
    context?: any
  ): RewardNotification | null => {
    const rewardConfigs = {
      energyFull: { title: 'Energy Restored!', icon: '⚡', color: '#10B981', duration: 2000 },
      positiveFeedback: { title: 'Great Start!', icon: '👍', color: '#3B82F6', duration: 1500 },
      'points+sound': { title: '+100 Points!', icon: '🪙', color: '#F59E0B', duration: 1000 },
      skillPoint: { title: 'Skill Point Earned!', icon: '⭐', color: '#8B5CF6', duration: 2000 },
      multiplierBonus: { title: 'Combo Multiplier!', icon: '🔥', color: '#EF4444', duration: 1500 },
      miniAchievement: { title: 'Mini Achievement!', icon: '🏅', color: '#10B981', duration: 3000 },
      smallBonus: { title: 'Bonus Reward!', icon: '🎁', color: '#F59E0B', duration: 2500 },
      learningTip: { title: 'Pro Tip Unlocked!', icon: '💡', color: '#3B82F6', duration: 4000 },
      stylePoints: { title: 'Style Points!', icon: '✨', color: '#8B5CF6', duration: 2000 },
      adrenalineBoost: { title: 'Adrenaline Rush!', icon: '💨', color: '#EF4444', duration: 1500 },
      'NFT+points': { title: 'NFT Achievement!', icon: '🖼️', color: '#10B981', duration: 5000 },
      newAbility: { title: 'New Ability Unlocked!', icon: '🚀', color: '#8B5CF6', duration: 4000 },
      bonusEnergy: { title: 'Daily Bonus!', icon: '🌟', color: '#F59E0B', duration: 3000 },
      streakBonus: { title: 'Streak Bonus!', icon: '🔥', color: '#EF4444', duration: 3000 },
      communityPoints: { title: 'Community Points!', icon: '👥', color: '#3B82F6', duration: 2500 },
      rareNFT: { title: 'Rare NFT Earned!', icon: '💎', color: '#8B5CF6', duration: 6000 },
      specialTitle: { title: 'Special Title Earned!', icon: '👑', color: '#F59E0B', duration: 5000 },
      exclusiveRewards: { title: 'Exclusive Rewards!', icon: '🏆', color: '#10B981', duration: 6000 },
      legendaryStatus: { title: 'Legendary Status!', icon: '⚡', color: '#EF4444', duration: 7000 },
      contributorBadge: { title: 'Contributor Badge!', icon: '🛡️', color: '#3B82F6', duration: 5000 }
    };

    const config = rewardConfigs[trigger.reward as keyof typeof rewardConfigs];
    if (!config) return null;

    return {
      id: `reward_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: category,
      title: config.title,
      description: getRewardDescription(trigger.reward, context),
      value: context?.value || getRewardValue(trigger.reward),
      icon: config.icon,
      color: config.color,
      duration: config.duration
    };
  };

  const getRewardDescription = (rewardType: string, context?: any): string => {
    const descriptions = {
      energyFull: 'Your energy has been fully restored!',
      positiveFeedback: 'You\'re off to a great start!',
      'points+sound': `You earned ${context?.value || 100} points!`,
      skillPoint: 'Your skills are improving!',
      multiplierBonus: `${context?.multiplier || 2}x combo multiplier active!`,
      miniAchievement: 'You\'ve reached a milestone!',
      smallBonus: 'Here\'s a little something extra!',
      learningTip: 'New strategy tip available!',
      stylePoints: 'That was executed with style!',
      adrenalineBoost: 'Close call! Reflexes sharpened!',
      'NFT+points': 'Achievement NFT minted to your wallet!',
      newAbility: 'New gameplay ability unlocked!',
      bonusEnergy: 'Thanks for playing daily!',
      streakBonus: `${context?.streak || 7} day streak maintained!`,
      communityPoints: 'Thanks for sharing with the community!',
      rareNFT: 'Congratulations on this rare achievement!',
      specialTitle: 'You\'ve earned a special recognition!',
      exclusiveRewards: 'Season completion rewards unlocked!',
      legendaryStatus: 'You\'ve achieved legendary status!',
      contributorBadge: 'Thank you for contributing to the community!'
    };

    return descriptions[rewardType as keyof typeof descriptions] || 'Reward earned!';
  };

  const getRewardValue = (rewardType: string): number => {
    const values = {
      'points+sound': 100,
      skillPoint: 1,
      multiplierBonus: 2,
      miniAchievement: 250,
      smallBonus: 150,
      stylePoints: 50,
      'NFT+points': 1000,
      newAbility: 500,
      bonusEnergy: 300,
      streakBonus: 500,
      communityPoints: 200,
      rareNFT: 5000,
      specialTitle: 2000,
      exclusiveRewards: 10000,
      legendaryStatus: 25000,
      contributorBadge: 1500
    };

    return values[rewardType as keyof typeof values] || 0;
  };

  const updateEngagementMetrics = (category: keyof RewardSchedule) => {
    setEngagementMetrics(prev => {
      const categoryWeights = {
        immediate: 0.1,
        shortTerm: 0.3,
        mediumTerm: 0.5,
        longTerm: 1.0
      };

      const weight = categoryWeights[category];
      const satisfactionIncrease = weight * 0.05;
      const retentionIncrease = weight * 0.02;

      return {
        ...prev,
        satisfactionScore: Math.min(1.0, prev.satisfactionScore + satisfactionIncrease),
        retentionProbability: Math.min(1.0, prev.retentionProbability + retentionIncrease)
      };
    });
  };

  const removeReward = useCallback((rewardId: string) => {
    setActiveRewards(prev => prev.filter(reward => reward.id !== rewardId));
  }, []);

  // Auto-remove rewards after their duration
  useEffect(() => {
    activeRewards.forEach(reward => {
      setTimeout(() => {
        removeReward(reward.id);
      }, reward.duration);
    });
  }, [activeRewards, removeReward]);

  // Expose trigger function globally for game engine
  useEffect(() => {
    (window as any).triggerReward = triggerReward;
    return () => {
      delete (window as any).triggerReward;
    };
  }, [triggerReward]);

  // Analyze reward patterns for optimization
  const analyzeRewardPatterns = useCallback(() => {
    const recentRewards = rewardHistory.slice(-10);
    const rewardFrequency = recentRewards.reduce((acc, reward) => {
      acc[reward] = (acc[reward] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      mostFrequent: Object.entries(rewardFrequency)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3),
      diversity: Object.keys(rewardFrequency).length / recentRewards.length,
      engagementScore: engagementMetrics.satisfactionScore * 100
    };
  }, [rewardHistory, engagementMetrics.satisfactionScore]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {activeRewards.map((reward) => (
          <motion.div
            key={reward.id}
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -50 }}
            className={`absolute top-20 right-6 pointer-events-auto`}
            style={{ 
              marginTop: `${activeRewards.indexOf(reward) * 80}px`,
              zIndex: 1000 + activeRewards.indexOf(reward)
            }}
          >
            <div 
              className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 border-l-4 min-w-[280px]"
              style={{ borderLeftColor: reward.color }}
            >
              <div className="flex items-center space-x-3">
                <div 
                  className="text-2xl p-2 rounded-full"
                  style={{ backgroundColor: `${reward.color}20` }}
                >
                  {reward.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-sm">
                    {reward.title}
                  </h3>
                  <p className="text-gray-600 text-xs mt-1">
                    {reward.description}
                  </p>
                  {reward.value && (
                    <div className="flex items-center mt-2">
                      <span 
                        className="text-xs font-bold px-2 py-1 rounded-full text-white"
                        style={{ backgroundColor: reward.color }}
                      >
                        +{reward.value} {reward.type === 'immediate' ? 'pts' : 'RUSH'}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => removeReward(reward.id)}
                  className="text-gray-400 hover:text-gray-600 text-sm"
                >
                  ✕
                </button>
              </div>
              
              {/* Progress bar for reward duration */}
              <motion.div
                className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden"
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: reward.duration / 1000, ease: 'linear' }}
              >
                <div 
                  className="h-full rounded-full"
                  style={{ backgroundColor: reward.color }}
                />
              </motion.div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Engagement metrics display (dev mode) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono">
          <div>Satisfaction: {(engagementMetrics.satisfactionScore * 100).toFixed(1)}%</div>
          <div>Retention: {(engagementMetrics.retentionProbability * 100).toFixed(1)}%</div>
          <div>Recent Rewards: {rewardHistory.slice(-3).join(', ')}</div>
        </div>
      )}
    </div>
  );
};

export default RewardPsychologyEngine;
