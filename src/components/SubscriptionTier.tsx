import { useState, useEffect } from 'react';
import { Check, Zap, Star, Crown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  icon: React.ReactNode;
  popular?: boolean;
}

const plans: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 0,
    description: 'Perfect for getting started with AI content creation',
    icon: <Zap className="h-6 w-6" />,
    features: [
      '1 niche monitoring',
      '50 AI content generations/month',
      'Basic voice training',
      'Standard analytics',
      'Community support'
    ]
  },
  {
    id: 'creator',
    name: 'Creator',
    price: 49,
    description: 'Perfect for individual content creators and freelancers',
    icon: <Star className="h-6 w-6" />,
    popular: true,
    features: [
      '2 niches monitoring',
      '200 AI content generations/month',
      'Basic voice training (20 samples)',
      'Standard analytics',
      'Email support',
      'Trend analysis'
    ]
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 149,
    description: 'For established creators and small agencies',
    icon: <Crown className="h-6 w-6" />,
    features: [
      '5 niches monitoring',
      '1,000 AI content generations/month',
      'Advanced voice training (100 samples)',
      'Perplexity research (25 queries/month)',
      'Revenue tracking',
      'Priority support',
      'Custom branding',
      'Advanced analytics'
    ]
  },
  {
    id: 'agency',
    name: 'Agency',
    price: 399,
    description: 'For agencies, enterprises, and consultants',
    icon: <Crown className="h-6 w-6" />,
    features: [
      'Unlimited niches monitoring',
      '5,000 AI content generations/month',
      'Unlimited voice training',
      'Unlimited Perplexity research',
      'White-label platform',
      'Multi-client management',
      'API access',
      'Dedicated support',
      'Custom integrations',
      'Revenue sharing opportunities'
    ]
  }
];

interface SubscriptionTierProps {
  currentTier?: string;
  onTierChange?: (tier: string) => void;
}

export default function SubscriptionTier({ currentTier, onTierChange }: SubscriptionTierProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);

  const checkSubscription = async () => {
    if (!user) return;
    
    setIsCheckingSubscription(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Error checking subscription:', error);
        return;
      }

      setSubscriptionData(data);
      onTierChange?.(data.subscription_tier);
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setIsCheckingSubscription(false);
    }
  };

  useEffect(() => {
    if (user) {
      checkSubscription();
    }
  }, [user]);

  const handleUpgrade = async (tier: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to upgrade your subscription.",
        variant: "destructive",
      });
      return;
    }

    if (tier === 'starter') {
      toast({
        title: "Already on Starter",
        description: "You're already on the free starter plan.",
      });
      return;
    }

    setLoading(tier);

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { tier }
      });

      if (error) {
        throw error;
      }

      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Error",
        description: "Failed to create checkout session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) {
        throw error;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error",
        description: "Failed to open customer portal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const effectiveTier = subscriptionData?.subscription_tier || currentTier || 'starter';

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            Choose Your Plan
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Scale your content creation with AI-powered intelligence
          </p>
          {subscriptionData?.subscribed && (
            <div className="mt-4 flex justify-center">
              <Button
                variant="outline"
                onClick={handleManageSubscription}
                className="flex items-center space-x-2"
              >
                <span>Manage Subscription</span>
              </Button>
            </div>
          )}
        </div>

        {isCheckingSubscription && (
          <div className="flex justify-center mt-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {plans.map((plan) => {
            const isCurrentPlan = effectiveTier === plan.id;
            
            return (
              <Card
                key={plan.id}
                className={`relative ${
                  plan.popular
                    ? 'border-primary ring-2 ring-primary/20'
                    : ''
                } ${isCurrentPlan ? 'bg-primary/5' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        plan.popular ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                      }`}>
                        {plan.icon}
                      </div>
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                    </div>
                    {isCurrentPlan && (
                      <Badge variant="secondary">
                        Current Plan
                      </Badge>
                    )}
                  </div>

                  <div className="mt-4">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-foreground">
                        ${plan.price}
                      </span>
                      {plan.price > 0 && (
                        <span className="ml-2 text-muted-foreground">/month</span>
                      )}
                    </div>
                    <CardDescription className="mt-2">
                      {plan.description}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-foreground uppercase tracking-wide">
                        What's included
                      </h4>
                      <ul className="mt-4 space-y-3">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                            <span className="ml-3 text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-4">
                      <Button
                        onClick={() => handleUpgrade(plan.id)}
                        disabled={loading === plan.id || isCurrentPlan}
                        className={`w-full ${
                          isCurrentPlan
                            ? 'opacity-50 cursor-not-allowed'
                            : plan.popular
                            ? 'bg-primary hover:bg-primary/90'
                            : ''
                        }`}
                        variant={plan.popular ? 'default' : 'outline'}
                      >
                        {loading === plan.id ? (
                          <div className="flex items-center justify-center">
                            <Loader2 className="h-5 w-5 animate-spin" />
                          </div>
                        ) : isCurrentPlan ? (
                          'Current Plan'
                        ) : plan.price === 0 ? (
                          'Get Started Free'
                        ) : (
                          `Upgrade to ${plan.name}`
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            All paid plans include a 7-day free trial. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
}

