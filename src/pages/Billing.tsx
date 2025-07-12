import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CreditCard, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import BillingManagement from '@/components/BillingManagement';
import SubscriptionTier from '@/components/SubscriptionTier';
import UserAccountDropdown from '@/components/UserAccountDropdown';

export default function Billing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [organization, setOrganization] = useState<any>(null);
  const [usage, setUsage] = useState<any>({});

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchUserData();
      fetchUsageData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*, organizations(*)')
        .eq('user_id', user?.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setOrganization(profileData.organizations);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchUsageData = async () => {
    if (!profile?.organization_id) return;

    try {
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      const { data: usageData } = await supabase
        .from('usage_tracking')
        .select('resource_type, count')
        .eq('organization_id', profile.organization_id)
        .gte('tracked_date', firstDayOfMonth.toISOString().split('T')[0]);

      const usageSummary = usageData?.reduce((acc, record) => {
        acc[record.resource_type] = (acc[record.resource_type] || 0) + record.count;
        return acc;
      }, {} as Record<string, number>) || {};

      setUsage({
        contentGenerations: { used: usageSummary.content_generation || 0, limit: getUsageLimit('content_generation') },
        perplexityQueries: { used: usageSummary.perplexity_query || 0, limit: getUsageLimit('perplexity_query') },
        niches: { used: 2, limit: getUsageLimit('niches') } // Mock data for niches
      });
    } catch (error) {
      console.error('Error fetching usage data:', error);
    }
  };

  const getUsageLimit = (resourceType: string) => {
    const tier = organization?.subscription_tier;
    
    switch (resourceType) {
      case 'content_generation':
        switch (tier) {
          case 'creator': return 200;
          case 'professional': return 1000;
          case 'agency': return 5000;
          default: return 50;
        }
      case 'perplexity_query':
        switch (tier) {
          case 'creator': return 10;
          case 'professional': return 25;
          case 'agency': return 999999; // Unlimited
          default: return 0;
        }
      case 'niches':
        switch (tier) {
          case 'creator': return 2;
          case 'professional': return 5;
          case 'agency': return 999999; // Unlimited
          default: return 1;
        }
      default:
        return 0;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Button>
            <div className="flex items-center space-x-2">
              <CreditCard className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Billing & Subscription</h1>
            </div>
          </div>
          <UserAccountDropdown organization={organization} />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Page Header */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Manage Your Subscription</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              View your current plan, usage statistics, and billing information. 
              Upgrade or modify your subscription to unlock more features.
            </p>
          </div>

          {/* Billing Management Component */}
          <BillingManagement 
            organization={organization || {}}
          />

          {/* Subscription Plans */}
          <Card>
            <CardHeader>
              <CardTitle>Available Plans</CardTitle>
              <CardDescription>
                Choose the perfect plan for your content creation needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SubscriptionTier 
                currentTier={organization?.subscription_tier}
                onTierChange={(tier) => {
                  console.log('Tier changed to:', tier);
                  // Refresh data after tier change
                  fetchUserData();
                }}
              />
            </CardContent>
          </Card>

          {/* Usage Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Usage Overview</CardTitle>
              <CardDescription>
                Monitor your monthly usage across all features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Content Generations */}
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-blue-600">
                    {usage.contentGenerations?.used || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    of {usage.contentGenerations?.limit || 0} content generations
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ 
                        width: `${Math.min(100, ((usage.contentGenerations?.used || 0) / (usage.contentGenerations?.limit || 1)) * 100)}%` 
                      }}
                    />
                  </div>
                </div>

                {/* Perplexity Queries */}
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-purple-600">
                    {usage.perplexityQueries?.used || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    of {usage.perplexityQueries?.limit === 999999 ? 'unlimited' : (usage.perplexityQueries?.limit || 0)} research queries
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                      style={{ 
                        width: usage.perplexityQueries?.limit === 999999 ? '20%' : 
                               `${Math.min(100, ((usage.perplexityQueries?.used || 0) / (usage.perplexityQueries?.limit || 1)) * 100)}%` 
                      }}
                    />
                  </div>
                </div>

                {/* Niches */}
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-green-600">
                    {usage.niches?.used || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    of {usage.niches?.limit === 999999 ? 'unlimited' : (usage.niches?.limit || 0)} niches monitored
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                      style={{ 
                        width: usage.niches?.limit === 999999 ? '30%' : 
                               `${Math.min(100, ((usage.niches?.used || 0) / (usage.niches?.limit || 1)) * 100)}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}