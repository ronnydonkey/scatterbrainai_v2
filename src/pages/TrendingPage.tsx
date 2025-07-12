import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, TrendingUp, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTrending } from '@/hooks/api';

const TrendingPage = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { data: trends, isLoading, refetch } = useTrending({ 
    timeframe: '24h',
    limit: 10 
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-6"
      >
        <h1 className="text-2xl font-bold mb-2 text-cosmic-light">
          What are people talking about?
        </h1>
        <p className="text-cosmic-muted">
          Current conversations happening now
        </p>
      </motion.div>

      {/* Refresh Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex justify-center"
      >
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="neural-border bg-cosmic-surface/50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </motion.div>

      {/* Trending Topics */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        {isLoading ? (
          // Loading state
          [...Array(5)].map((_, i) => (
            <Card key={i} className="neural-border bg-cosmic-surface/30">
              <CardContent className="p-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-cosmic-void/20 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-cosmic-void/20 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : trends && trends.length > 0 ? (
          trends.slice(0, 8).map((trend, index) => (
            <motion.div
              key={trend.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="neural-border bg-cosmic-surface/30 hover:bg-cosmic-surface/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageCircle className="w-4 h-4 text-cosmic-accent" />
                        <Badge variant="outline" className="text-xs">
                          {trend.source}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {getTimeAgo(trend.created_at)}
                        </Badge>
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
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <Card className="neural-border bg-cosmic-surface/30">
            <CardContent className="p-8 text-center">
              <MessageCircle className="w-12 h-12 text-cosmic-muted mx-auto mb-4" />
              <h3 className="text-cosmic-light font-medium mb-2">
                No conversations found
              </h3>
              <p className="text-cosmic-muted text-sm">
                Check back later for trending discussions
              </p>
            </CardContent>
          </Card>
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