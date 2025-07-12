import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Search, Filter, Zap, Clock, Users, ArrowRight, RefreshCw, Brain, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useTrending, useThoughts } from '@/hooks/api';
import { toast } from '@/hooks/use-toast';

interface CommunityTrend {
  id: string;
  topic: string;
  community: string;
  relevanceToUser: number;
  engagement: number;
  timeframe: string;
  userConnectionReason: string;
  keyInsights: string[];
  relatedThoughts: string[];
}

const TrendingPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'24h' | '7d' | '30d'>('24h');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { data: trends, isLoading, refetch } = useTrending({ 
    timeframe: selectedTimeframe,
    limit: 20 
  });
  const { data: userThoughts } = useThoughts({ limit: 10 });

  // Transform trending data into community-focused insights
  const communityTrends: CommunityTrend[] = trends?.map(trend => ({
    id: trend.id,
    topic: trend.topic,
    community: trend.source === 'social_media' ? 'Social Communities' : 'Tech Communities',
    relevanceToUser: Math.round(trend.score * 0.01 * 100),
    engagement: trend.score,
    timeframe: getTimeAgo(trend.created_at),
    userConnectionReason: getUserConnectionReason(trend, userThoughts),
    keyInsights: extractKeyInsights(trend),
    relatedThoughts: findRelatedThoughts(trend, userThoughts),
  })) || [];

  const filteredTrends = communityTrends.filter(trend =>
    trend.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trend.keyInsights.some(insight => 
      insight.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
    toast({
      title: "Community pulse updated! 🌊",
      description: "Fresh insights from the neural network.",
    });
  };

  const timeframeOptions = [
    { value: '24h', label: 'Last 24h', icon: Clock },
    { value: '7d', label: 'This Week', icon: TrendingUp },
    { value: '30d', label: 'This Month', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-cosmic-void p-4 pt-6">
      <div className="max-w-4xl mx-auto">
        {/* Neural Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-12 h-12 rounded-full bg-gradient-neural flex items-center justify-center"
            >
              <Brain className="w-6 h-6 text-cosmic-void" />
            </motion.div>
            <h1 className="text-3xl font-bold text-neural-100">
              Community Pulse
            </h1>
          </div>
          <p className="text-neural-400 text-lg max-w-2xl mx-auto">
            Discover what communities are discussing in relation to your thoughts and interests
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-neural-900/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-neural-700"
        >
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neural-400 w-4 h-4" />
              <Input
                placeholder="Search community discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-neural-800/50 border-neural-600 text-neural-100 placeholder:text-neural-400"
              />
            </div>

            {/* Timeframe Selector */}
            <div className="flex bg-neural-800/30 rounded-xl p-1">
              {timeframeOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={selectedTimeframe === option.value ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedTimeframe(option.value as any)}
                  className={`
                    ${selectedTimeframe === option.value 
                      ? 'bg-gradient-neural text-cosmic-void' 
                      : 'text-neural-300 hover:text-neural-100'
                    }
                  `}
                >
                  <option.icon className="w-4 h-4 mr-2" />
                  {option.label}
                </Button>
              ))}
            </div>

            {/* Refresh */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="border-neural-600 text-neural-300 hover:text-neural-100"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Community Trends */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-4 md:gap-6"
            >
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="bg-neural-900/30 border-neural-700 p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-neural-700 rounded w-3/4 mb-3"></div>
                    <div className="h-3 bg-neural-700 rounded w-1/2 mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-neural-700 rounded w-full"></div>
                      <div className="h-3 bg-neural-700 rounded w-5/6"></div>
                    </div>
                  </div>
                </Card>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {filteredTrends.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 rounded-full bg-neural-800/50 flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-neural-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-neural-100 mb-2">
                    No matching discussions found
                  </h3>
                  <p className="text-neural-400">
                    Try adjusting your search or timeframe to discover more community insights.
                  </p>
                </motion.div>
              ) : (
                filteredTrends.map((trend, index) => (
                  <motion.div
                    key={trend.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-neural-900/50 backdrop-blur-sm border border-neural-700 hover:border-synaptic-500/50 transition-all duration-300 group">
                      <div className="p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge 
                                variant="outline" 
                                className="border-synaptic-500/30 text-synaptic-300 bg-synaptic-500/10"
                              >
                                {trend.community}
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className="border-neural-600 text-neural-300"
                              >
                                {trend.timeframe}
                              </Badge>
                            </div>
                            <h3 className="text-xl font-semibold text-neural-100 mb-2 group-hover:text-synaptic-200 transition-colors">
                              {trend.topic}
                            </h3>
                            <p className="text-neural-300 text-sm">
                              {trend.userConnectionReason}
                            </p>
                          </div>
                          
                          {/* Relevance Score */}
                          <div className="text-center">
                            <div className="text-2xl font-bold text-synaptic-300">
                              {trend.relevanceToUser}%
                            </div>
                            <div className="text-xs text-neural-400">
                              relevance
                            </div>
                          </div>
                        </div>

                        {/* Key Insights */}
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-neural-200 mb-2 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-synaptic-400" />
                            Key Insights
                          </h4>
                          <div className="space-y-2">
                            {trend.keyInsights.map((insight, i) => (
                              <div
                                key={i}
                                className="text-sm text-neural-300 bg-neural-800/30 rounded-lg p-3 border-l-2 border-synaptic-500/30"
                              >
                                {insight}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Related Thoughts */}
                        {trend.relatedThoughts.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-neural-200 mb-2 flex items-center gap-2">
                              <Brain className="w-4 h-4 text-synaptic-400" />
                              Connected to your thoughts
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {trend.relatedThoughts.map((thought, i) => (
                                <Badge
                                  key={i}
                                  variant="secondary"
                                  className="bg-neural-800/50 text-neural-300 border-neural-600"
                                >
                                  {thought}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-neural-700">
                          <div className="flex items-center gap-4 text-sm text-neural-400">
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {trend.engagement} engagement
                            </div>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" />
                              Trending
                            </div>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-synaptic-300 hover:text-synaptic-200 group-hover:translate-x-1 transition-all"
                          >
                            Research with AI
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Helper functions
function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

function getUserConnectionReason(trend: any, userThoughts: any[]): string {
  // Simple relevance logic based on keywords and content
  const userTopics = userThoughts?.map(t => t.content.toLowerCase()) || [];
  const trendKeywords = trend.keywords || [];
  
  const matchingKeywords = trendKeywords.filter((keyword: string) =>
    userTopics.some(topic => topic.includes(keyword.toLowerCase()))
  );

  if (matchingKeywords.length > 0) {
    return `Related to your thoughts about ${matchingKeywords.slice(0, 2).join(', ')}`;
  }
  
  return `Trending in your interest areas`;
}

function extractKeyInsights(trend: any): string[] {
  // Extract insights from the trend data
  const insights = [];
  
  if (trend.description) {
    insights.push(trend.description);
  }
  
  if (trend.source_data?.themes) {
    insights.push(`Key themes: ${trend.source_data.themes.slice(0, 3).join(', ')}`);
  }
  
  if (insights.length === 0) {
    insights.push(`Community discussing ${trend.topic} with high engagement`);
  }
  
  return insights.slice(0, 2); // Limit to 2 insights
}

function findRelatedThoughts(trend: any, userThoughts: any[]): string[] {
  if (!userThoughts) return [];
  
  const trendKeywords = trend.keywords || [];
  const relatedThoughts = userThoughts.filter(thought =>
    trendKeywords.some((keyword: string) =>
      thought.content.toLowerCase().includes(keyword.toLowerCase())
    )
  );
  
  return relatedThoughts.slice(0, 3).map(t => t.title || t.content.slice(0, 30) + '...');
}

export default TrendingPage;