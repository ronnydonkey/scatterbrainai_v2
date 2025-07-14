import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, TrendingUp, Clock, RefreshCw } from 'lucide-react';
import { Brain, Cpu, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTrending } from '@/hooks/api';
import { 
  SimpleNeuralConnections, 
  SimpleNeuralLoading, 
  NeuralBorder, 
  BrainIcon, 
  ThoughtCluster 
} from '@/components/ui';

const TrendingPage = () => {
  const { data: trends, isLoading } = useTrending({ 
    timeframe: '24h',
    limit: 10 
  });

  return (
    <div className="p-4 space-y-6 relative">
      {/* Neural background connections */}
      <SimpleNeuralConnections className="opacity-30" />
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-6 relative z-10"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <BrainIcon size={32} />
          <h1 className="text-2xl font-bold text-cosmic-light">
            Community Neural Network
          </h1>
          <ThoughtCluster thoughts={6} className="w-8 h-8" />
        </div>
        <p className="text-cosmic-muted">
          Real-time synaptic connections from Reddit and social platforms related to your thoughts
        </p>
      </motion.div>

      {/* Trending Topics */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        {isLoading ? (
          // Neural loading state
          <div className="flex flex-col items-center py-8 space-y-6">
            <SimpleNeuralLoading size="lg" text="Analyzing neural patterns..." />
            {[...Array(3)].map((_, i) => (
              <NeuralBorder key={i} className="w-full">
                <Card className="bg-cosmic-surface/30 border-0">
                  <CardContent className="p-4">
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 bg-cosmic-void/20 rounded w-3/4"></div>
                      <div className="h-3 bg-cosmic-void/20 rounded w-1/2"></div>
                      <div className="flex space-x-2">
                        <div className="h-6 bg-cosmic-void/20 rounded w-16"></div>
                        <div className="h-6 bg-cosmic-void/20 rounded w-20"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </NeuralBorder>
            ))}
          </div>
        ) : trends && trends.length > 0 ? (
          trends.slice(0, 8).map((trend, index) => (
            <motion.div
              key={trend.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <NeuralBorder 
                className="cursor-pointer group"
                active={trend.score > 80}
              >
                <Card className="bg-cosmic-surface/30 hover:bg-cosmic-surface/50 transition-all duration-300 border-0 group-hover:shadow-lg group-hover:shadow-cosmic-accent/10"
                      onClick={() => {
                        // Could navigate to detail view or expand inline
                        console.log('View details for:', trend.topic);
                      }}
                >
                <CardContent className="p-4 space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <BrainIcon size={16} animate={trend.score > 80} />
                        <Badge variant="outline" className="text-xs bg-cosmic-void/20 border-cosmic-accent/30">
                          r/{trend.source || 'communities'}
                        </Badge>
                        <Badge variant="outline" className="text-xs bg-cosmic-void/20 border-cosmic-accent/30">
                          <Clock className="w-3 h-3 mr-1" />
                          {getTimeAgo(trend.created_at)}
                        </Badge>
                        {trend.score > 80 && (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-cosmic-glow rounded-full animate-pulse" />
                            <span className="text-xs text-cosmic-glow">Hot</span>
                          </div>
                        )}
                      </div>
                      <h3 className="text-cosmic-light font-medium mb-1">
                        {trend.topic}
                      </h3>
                      {trend.description && (
                        <p className="text-sm text-cosmic-muted">
                          {trend.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <div className="flex items-center gap-1 text-cosmic-accent">
                        <TrendingUp className="w-4 h-4" />
                        <span className="font-semibold">{trend.score}</span>
                      </div>
                    </div>
                  </div>

                  {/* Pain Points & FAQs Section */}
                  <div className="space-y-2">
                    {/* Pain Points */}
                    <div className="bg-cosmic-void/20 rounded-lg p-3">
                      <h4 className="text-xs font-medium text-cosmic-glow mb-2">Common Pain Points</h4>
                      <div className="flex flex-wrap gap-1">
                        {['Setup complexity', 'Learning curve', 'Time investment'].map((pain, i) => (
                          <Badge key={i} variant="secondary" className="text-xs bg-cosmic-void/30 text-cosmic-muted">
                            {pain}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Top Questions */}
                    <div className="bg-cosmic-void/20 rounded-lg p-3">
                      <h4 className="text-xs font-medium text-cosmic-accent mb-2">Trending Questions</h4>
                      <div className="space-y-1">
                        <p className="text-xs text-cosmic-muted">"How do I get started with this?"</p>
                        <p className="text-xs text-cosmic-muted">"What's the best approach for beginners?"</p>
                      </div>
                    </div>
                  </div>

                  {/* Connection to Your Thoughts with Click Hint */}
                  <div className="bg-gradient-accent/10 rounded-lg p-3 border border-cosmic-accent/20 flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-xs font-medium text-cosmic-accent mb-1">Connected to Your Thoughts</h4>
                      <p className="text-xs text-cosmic-muted">
                        This relates to your recent thoughts about productivity and learning new skills
                      </p>
                    </div>
                    <div className="text-cosmic-accent opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs">Click to explore →</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              </NeuralBorder>
            </motion.div>
          ))
        ) : (
            <NeuralBorder>
            <Card className="bg-cosmic-surface/30 border-0">
              <CardContent className="p-8 text-center">
                <div className="flex items-center justify-center mb-4">
                  <BrainIcon size={48} animate={false} className="opacity-50" />
                </div>
                <h3 className="text-cosmic-light font-medium mb-2">
                  Neural network inactive
                </h3>
                <p className="text-cosmic-muted text-sm">
                  Add some thoughts to activate neural pathways and discover related community discussions
                </p>
              </CardContent>
            </Card>
          </NeuralBorder>
        )}
      </motion.div>
    </div>
  );
};

// Helper function
function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'now';
  if (diffInHours < 24) return `${diffInHours}h`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d`;
}

export default TrendingPage;