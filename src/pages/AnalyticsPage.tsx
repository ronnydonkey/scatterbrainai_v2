import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown,
  Target, 
  Eye, 
  Heart, 
  MessageCircle,
  Share,
  Calendar,
  Download,
  Clock,
  Award,
  Activity
} from 'lucide-react';
import { 
  NeuralBorder, 
  BrainIcon, 
  SimpleNeuralLoading, 
  SynapseIcon, 
  NeuralNetworkIcon 
} from '@/components/ui';
import { toast } from '@/hooks/use-toast';

interface ContentPerformance {
  id: string;
  platform: string;
  views: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  engagement_rate: number | null;
  published_at: string | null;
  created_at: string;
}

interface ContentSuggestion {
  id: string;
  title: string;
  content_type: string;
  engagement_prediction: number | null;
  created_at: string;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<{ performance: ContentPerformance[], suggestions: ContentSuggestion[] }>({ 
    performance: [], 
    suggestions: [] 
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedPlatform, setSelectedPlatform] = useState('all');

  useEffect(() => {
    if (user) {
      fetchAnalyticsData();
    }
  }, [user, timeRange, selectedPlatform]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      const endDate = new Date();
      const startDate = new Date();
      switch (timeRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        default:
          startDate.setDate(endDate.getDate() - 30);
      }

      let performanceQuery = supabase
        .from('content_performance')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (selectedPlatform !== 'all') {
        performanceQuery = performanceQuery.eq('platform', selectedPlatform);
      }

      const { data: performanceData, error: performanceError } = await performanceQuery;
      if (performanceError) throw performanceError;

      const { data: suggestionsData, error: suggestionsError } = await supabase
        .from('content_suggestions')
        .select('id, title, content_type, engagement_prediction, created_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (suggestionsError) throw suggestionsError;

      setData({
        performance: performanceData || [],
        suggestions: suggestionsData || []
      });

    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = () => {
    const totalViews = data.performance.reduce((sum, item) => sum + (item.views || 0), 0);
    const totalLikes = data.performance.reduce((sum, item) => sum + (item.likes || 0), 0);
    const totalComments = data.performance.reduce((sum, item) => sum + (item.comments || 0), 0);
    const totalShares = data.performance.reduce((sum, item) => sum + (item.shares || 0), 0);
    const avgEngagement = data.performance.length > 0 
      ? data.performance.reduce((sum, item) => sum + (item.engagement_rate || 0), 0) / data.performance.length 
      : 0;

    return {
      totalViews,
      totalLikes,
      totalComments,
      totalShares,
      avgEngagement,
      totalPosts: data.performance.length
    };
  };

  const prepareTimeSeriesData = () => {
    const grouped = data.performance.reduce((acc, item) => {
      const date = new Date(item.created_at).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = { date, views: 0, engagement: 0, likes: 0, count: 0 };
      }
      acc[date].views += item.views || 0;
      acc[date].likes += item.likes || 0;
      acc[date].engagement += item.engagement_rate || 0;
      acc[date].count += 1;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped).map((item: any) => ({
      ...item,
      avgEngagement: item.count > 0 ? item.engagement / item.count : 0
    }));
  };

  const preparePlatformData = () => {
    const grouped = data.performance.reduce((acc, item) => {
      if (!acc[item.platform]) {
        acc[item.platform] = { platform: item.platform, posts: 0, views: 0, engagement: 0, score: 0 };
      }
      acc[item.platform].posts += 1;
      acc[item.platform].views += item.views || 0;
      acc[item.platform].engagement += item.engagement_rate || 0;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped).map((item: any) => ({
      ...item,
      avgEngagement: item.posts > 0 ? item.engagement / item.posts : 0,
      score: item.posts > 0 ? Math.round((item.views / item.posts) * 0.001 + (item.engagement / item.posts) * 2) : 0
    }));
  };

  const getTopPerformers = () => {
    return data.performance
      .filter(item => item.views && item.engagement_rate)
      .sort((a, b) => (b.engagement_rate || 0) - (a.engagement_rate || 0))
      .slice(0, 5);
  };

  const getBestPostingTimes = () => {
    const hourCounts = data.performance.reduce((acc, item) => {
      if (item.published_at) {
        const hour = new Date(item.published_at).getHours();
        if (!acc[hour]) acc[hour] = { hour, count: 0, totalEngagement: 0 };
        acc[hour].count += 1;
        acc[hour].totalEngagement += item.engagement_rate || 0;
      }
      return acc;
    }, {} as Record<number, any>);

    return Object.values(hourCounts)
      .map((item: any) => ({
        hour: `${item.hour}:00`,
        avgEngagement: item.count > 0 ? item.totalEngagement / item.count : 0,
        posts: item.count
      }))
      .sort((a, b) => b.avgEngagement - a.avgEngagement)
      .slice(0, 6);
  };

  const metrics = calculateMetrics();
  const timeSeriesData = prepareTimeSeriesData();
  const platformData = preparePlatformData();
  const topPerformers = getTopPerformers();
  const bestTimes = getBestPostingTimes();
  const platforms = [...new Set(data.performance.map(item => item.platform))];

  if (loading) {
    return (
      <div className="p-6">
        <NeuralBorder>
          <Card className="border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BrainIcon size={24} />
                <span>Neural Analytics Dashboard</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center py-12">
                <SimpleNeuralLoading size="lg" text="Processing neural pathways..." />
              </div>
            </CardContent>
          </Card>
        </NeuralBorder>
      </div>
    );
  }

  return (
    <motion.div
      className="p-6 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <NeuralBorder>
          <Card className="border-0 bg-cosmic-surface/20">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center space-x-3 text-2xl">
                    <NeuralNetworkIcon size={28} />
                    <span>Neural Analytics Dashboard</span>
                    <SynapseIcon size={20} />
                  </CardTitle>
                  <CardDescription className="text-base mt-2">
                    Advanced content performance insights across neural pathways
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                  <Button variant="outline" size="sm" onClick={fetchAnalyticsData}>
                    <Activity className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-40">
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Neural Pathways</SelectItem>
                    {platforms.map(platform => (
                      <SelectItem key={platform} value={platform}>
                        {platform.charAt(0).toUpperCase() + platform.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </NeuralBorder>
      </motion.div>

      {/* Key Metrics Grid */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <NeuralBorder active={metrics.totalViews > 1000}>
            <Card className="border-0 bg-cosmic-surface/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Eye className="h-5 w-5 text-cosmic-accent" />
                  <Badge variant="secondary" className="text-xs">Neural Views</Badge>
                </div>
                <div className="text-2xl font-bold text-cosmic-light mb-1">
                  {metrics.totalViews.toLocaleString()}
                </div>
                <div className="text-xs text-cosmic-muted">
                  {metrics.totalPosts} synaptic connections
                </div>
                <Progress value={Math.min((metrics.totalViews / 10000) * 100, 100)} className="mt-2 h-1" />
              </CardContent>
            </Card>
          </NeuralBorder>

          <NeuralBorder active={metrics.totalLikes > 500}>
            <Card className="border-0 bg-cosmic-surface/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Heart className="h-5 w-5 text-cosmic-glow" />
                  <Badge variant="secondary" className="text-xs">Resonance</Badge>
                </div>
                <div className="text-2xl font-bold text-cosmic-light mb-1">
                  {metrics.totalLikes.toLocaleString()}
                </div>
                <div className="text-xs text-cosmic-muted">
                  Avg: {metrics.totalPosts > 0 ? Math.round(metrics.totalLikes / metrics.totalPosts) : 0} per post
                </div>
                <Progress value={Math.min((metrics.totalLikes / 5000) * 100, 100)} className="mt-2 h-1" />
              </CardContent>
            </Card>
          </NeuralBorder>

          <NeuralBorder active={metrics.avgEngagement > 5}>
            <Card className="border-0 bg-cosmic-surface/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Target className="h-5 w-5 text-cosmic-accent" />
                  <Badge variant="secondary" className="text-xs">Engagement</Badge>
                </div>
                <div className="text-2xl font-bold text-cosmic-light mb-1">
                  {metrics.avgEngagement.toFixed(1)}%
                </div>
                <div className="text-xs text-cosmic-muted">
                  Neural pathway strength
                </div>
                <Progress value={Math.min(metrics.avgEngagement * 5, 100)} className="mt-2 h-1" />
              </CardContent>
            </Card>
          </NeuralBorder>

          <NeuralBorder active={metrics.totalShares > 100}>
            <Card className="border-0 bg-cosmic-surface/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Share className="h-5 w-5 text-cosmic-glow" />
                  <Badge variant="secondary" className="text-xs">Amplification</Badge>
                </div>
                <div className="text-2xl font-bold text-cosmic-light mb-1">
                  {metrics.totalShares.toLocaleString()}
                </div>
                <div className="text-xs text-cosmic-muted">
                  Viral coefficient
                </div>
                <Progress value={Math.min((metrics.totalShares / 1000) * 100, 100)} className="mt-2 h-1" />
              </CardContent>
            </Card>
          </NeuralBorder>
        </div>
      </motion.div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Performance Trends */}
        <motion.div variants={itemVariants}>
          <NeuralBorder>
            <Card className="border-0 bg-cosmic-surface/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SynapseIcon size={18} />
                  Performance Trends
                </CardTitle>
                <CardDescription>Neural pathway evolution over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="views" 
                      stackId="1"
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))" 
                      fillOpacity={0.3}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="likes" 
                      stackId="1"
                      stroke="hsl(var(--accent))" 
                      fill="hsl(var(--accent))" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </NeuralBorder>
        </motion.div>

        {/* Platform Comparison */}
        <motion.div variants={itemVariants}>
          <NeuralBorder>
            <Card className="border-0 bg-cosmic-surface/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <NeuralNetworkIcon size={18} />
                  Platform Performance
                </CardTitle>
                <CardDescription>Neural pathway distribution across platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={platformData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="platform" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip />
                    <Bar dataKey="score" fill="hsl(var(--primary))">
                      {platformData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </NeuralBorder>
        </motion.div>

        {/* Top Performers */}
        <motion.div variants={itemVariants}>
          <NeuralBorder>
            <Card className="border-0 bg-cosmic-surface/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-cosmic-accent" />
                  Top Performing Content
                </CardTitle>
                <CardDescription>Highest engagement neural pathways</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {topPerformers.map((item, index) => (
                  <motion.div
                    key={item.id}
                    className="p-3 rounded-lg bg-cosmic-void/20 border border-cosmic-surface/30"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {item.platform}
                          </Badge>
                          <span className="text-sm font-medium text-cosmic-light">
                            {(item.engagement_rate || 0).toFixed(1)}% engagement
                          </span>
                        </div>
                        <div className="text-xs text-cosmic-muted">
                          {(item.views || 0).toLocaleString()} views • {(item.likes || 0).toLocaleString()} likes
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-cosmic-accent" />
                        <span className="text-sm font-semibold text-cosmic-accent">#{index + 1}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </NeuralBorder>
        </motion.div>

        {/* Best Posting Times */}
        <motion.div variants={itemVariants}>
          <NeuralBorder>
            <Card className="border-0 bg-cosmic-surface/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-cosmic-glow" />
                  Optimal Posting Times
                </CardTitle>
                <CardDescription>Peak neural activity windows</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {bestTimes.map((time, index) => (
                    <div key={time.hour} className="flex items-center justify-between p-2 rounded bg-cosmic-void/10">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-cosmic-accent/20 flex items-center justify-center">
                          <span className="text-xs font-bold text-cosmic-accent">#{index + 1}</span>
                        </div>
                        <div>
                          <div className="font-medium text-cosmic-light">{time.hour}</div>
                          <div className="text-xs text-cosmic-muted">{time.posts} posts</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-cosmic-accent">
                          {time.avgEngagement.toFixed(1)}%
                        </div>
                        <div className="text-xs text-cosmic-muted">avg engagement</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </NeuralBorder>
        </motion.div>
      </div>
    </motion.div>
  );
}