import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Bot, TrendingUp, Sparkles, Library, BarChart3, Calendar, PenTool, Crown, Brain } from 'lucide-react';
import { TrendingTopics } from '@/components/TrendingTopics';
import { ContentGenerator } from '@/components/ContentGenerator';
import { ContentLibrary } from '@/components/ContentLibrary';
import { PerformanceAnalytics } from '@/components/PerformanceAnalytics';
import { ThoughtCapture } from '@/components/ThoughtCapture';
import ClaudeResearch from '@/components/ClaudeResearch';
import SubscriptionTier from '@/components/SubscriptionTier';
import UserAccountDropdown from '@/components/UserAccountDropdown';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';


const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [organization, setOrganization] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [usage, setUsage] = useState<any>({});
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("thoughts"); // Add tab state

  // Redirect to auth if not authenticated
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
      // Get user profile
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
        contentGenerations: usageSummary.content_generation || 0,
        perplexityQueries: usageSummary.perplexity_query || 0,
        voiceTrainingSamples: usageSummary.voice_training || 0
      });
    } catch (error) {
      console.error('Error fetching usage data:', error);
    }
  };

  const handleUpgrade = (tier: string) => {
    toast({
      title: "Upgrade Available",
      description: `Contact support to upgrade to ${tier}`,
      action: (
        <Button size="sm" onClick={() => window.open('mailto:support@scatterbrainai.com', '_blank')}>
          Contact Support
        </Button>
      )
    });
  };

  // Handle navigation from trending topics to research
  const handleNavigateToResearch = () => {
    setActiveTab("research");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Bot className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">ScatterBrain AI</h1>
          </div>
          <UserAccountDropdown organization={organization} />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">
              AI-Powered Content Intelligence
            </h2>
            <p className="text-xl text-muted-foreground">
              Generate authentic content with trend intelligence and voice preservation
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 bg-muted">
              <TabsTrigger value="thoughts" className="flex items-center space-x-2 data-[state=active]:bg-background">
                <PenTool className="h-4 w-4" />
                <span>Thoughts</span>
              </TabsTrigger>
              <TabsTrigger value="trends" className="flex items-center space-x-2 data-[state=active]:bg-background">
                <TrendingUp className="h-4 w-4" />
                <span>Trending Topics</span>
              </TabsTrigger>
              <TabsTrigger value="research" className="flex items-center space-x-2 data-[state=active]:bg-background">
                <Brain className="h-4 w-4" />
                <span>Research</span>
                {selectedTopic && (
                  <Badge variant="secondary" className="ml-1 text-xs">1</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="generate" className="flex items-center space-x-2 data-[state=active]:bg-background">
                <Sparkles className="h-4 w-4" />
                <span>Generator</span>
              </TabsTrigger>
              <TabsTrigger value="library" className="flex items-center space-x-2 data-[state=active]:bg-background">
                <Library className="h-4 w-4" />
                <span>Library</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center space-x-2 data-[state=active]:bg-background">
                <BarChart3 className="h-4 w-4" />
                <span>Analytics</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="thoughts" className="space-y-6">
              <ThoughtCapture />
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              <TrendingTopics 
                onTopicSelect={setSelectedTopic}
                onNavigateToResearch={handleNavigateToResearch}
              />
            </TabsContent>

            <TabsContent value="research" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SubscriptionTier
                  currentTier={organization?.subscription_tier || 'starter'}
                  onTierChange={(tier) => {
                    if (organization) {
                      // Update organization tier in state if needed
                      console.log('Tier changed to:', tier);
                    }
                  }}
                />
                
                {selectedTopic ? (
                  <ClaudeResearch
                    topic={selectedTopic}
                    niche={organization?.niche}
                    userTier={organization?.subscription_tier || 'starter'}
                    organizationId={organization?.id}
                    onUpgrade={handleUpgrade}
                  />
                ) : (
                  <div className="flex items-center justify-center h-64 border-2 border-dashed border-border rounded-lg bg-muted/20">
                    <div className="text-center">
                      <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        No Topic Selected
                      </h3>
                      <p className="text-muted-foreground">
                        Go to Trending Topics and click on a topic to research it with Claude
                      </p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => setActiveTab("trends")}
                      >
                        Browse Trending Topics
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="generate" className="space-y-6">
              <ContentGenerator />
            </TabsContent>

            <TabsContent value="library" className="space-y-6">
              <ContentLibrary />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <PerformanceAnalytics />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Index;
