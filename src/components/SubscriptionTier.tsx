import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Check, Zap, Crown, Star } from 'lucide-react';

interface TierFeatures {
  contentGenerations: number;
  perplexityQueries: number;
  voiceTrainingSamples: number;
  niches: number;
  users: number;
  features: string[];
}

const TIER_CONFIG: Record<string, TierFeatures & { name: string; price: string; icon: React.ReactNode; gradient: string }> = {
  starter: {
    name: 'Starter',
    price: '$29/month',
    icon: <Star className="h-5 w-5" />,
    gradient: 'from-gray-500 to-gray-600',
    contentGenerations: 50,
    perplexityQueries: 0,
    voiceTrainingSamples: 10,
    niches: 1,
    users: 1,
    features: [
      '1 niche monitoring',
      'Basic trend intelligence',
      'Standard voice training',
      'Basic dashboard',
      'Email support'
    ]
  },
  professional: {
    name: 'Professional',
    price: '$99/month',
    icon: <Zap className="h-5 w-5" />,
    gradient: 'from-blue-500 to-purple-600',
    contentGenerations: 500,
    perplexityQueries: 10,
    voiceTrainingSamples: 50,
    niches: 3,
    users: 5,
    features: [
      '3 niche monitoring',
      'Perplexity real-time research',
      'Advanced voice training',
      'Custom branding',
      'Revenue tracking',
      'Priority support'
    ]
  },
  enterprise: {
    name: 'Enterprise',
    price: '$299/month',
    icon: <Crown className="h-5 w-5" />,
    gradient: 'from-purple-600 to-pink-600',
    contentGenerations: 999999,
    perplexityQueries: 999999,
    voiceTrainingSamples: 999999,
    niches: 999999,
    users: 25,
    features: [
      'Unlimited everything',
      'Advanced competitive analysis',
      'White-label platform',
      'Multi-client management',
      'API access',
      'Dedicated support'
    ]
  }
};

interface SubscriptionTierProps {
  currentTier: string;
  usage?: {
    contentGenerations?: number;
    perplexityQueries?: number;
    voiceTrainingSamples?: number;
  };
  onUpgrade?: (tier: string) => void;
  showUpgrade?: boolean;
}

const SubscriptionTier: React.FC<SubscriptionTierProps> = ({
  currentTier,
  usage = {},
  onUpgrade,
  showUpgrade = true
}) => {
  const current = TIER_CONFIG[currentTier] || TIER_CONFIG.starter;

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === 999999) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const getNextTier = (tier: string) => {
    if (tier === 'starter') return 'professional';
    if (tier === 'professional') return 'enterprise';
    return null;
  };

  const nextTier = getNextTier(currentTier);

  return (
    <div className="space-y-4">
      {/* Current Tier Card */}
      <Card className="relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-r ${current.gradient} opacity-10`} />
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {current.icon}
              <CardTitle>{current.name}</CardTitle>
            </div>
            <Badge variant="default" className={`bg-gradient-to-r ${current.gradient} text-white`}>
              CURRENT
            </Badge>
          </div>
          <CardDescription>{current.price}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Usage Metrics */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Content Generations</span>
                <span>
                  {usage.contentGenerations || 0} / {current.contentGenerations === 999999 ? '∞' : current.contentGenerations}
                </span>
              </div>
              <Progress 
                value={getUsagePercentage(usage.contentGenerations || 0, current.contentGenerations)} 
                className="h-2"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Perplexity Queries</span>
                <span>
                  {usage.perplexityQueries || 0} / {current.perplexityQueries === 999999 ? '∞' : current.perplexityQueries}
                </span>
              </div>
              <Progress 
                value={getUsagePercentage(usage.perplexityQueries || 0, current.perplexityQueries)} 
                className="h-2"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Voice Training Samples</span>
                <span>
                  {usage.voiceTrainingSamples || 0} / {current.voiceTrainingSamples === 999999 ? '∞' : current.voiceTrainingSamples}
                </span>
              </div>
              <Progress 
                value={getUsagePercentage(usage.voiceTrainingSamples || 0, current.voiceTrainingSamples)} 
                className="h-2"
              />
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-medium mb-2">Features</h4>
            <div className="grid grid-cols-1 gap-1">
              {current.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Check className="h-3 w-3 text-green-600 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Prompt */}
      {showUpgrade && nextTier && (
        <Card className="border-dashed border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-blue-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              {TIER_CONFIG[nextTier].icon}
              <CardTitle className="text-purple-800">
                Upgrade to {TIER_CONFIG[nextTier].name}
              </CardTitle>
            </div>
            <CardDescription>
              Unlock more powerful features for {TIER_CONFIG[nextTier].price}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-1">
              {TIER_CONFIG[nextTier].features.slice(0, 3).map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Check className="h-3 w-3 text-purple-600 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <Button 
              onClick={() => onUpgrade?.(nextTier)}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              Upgrade to {TIER_CONFIG[nextTier].name}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SubscriptionTier;