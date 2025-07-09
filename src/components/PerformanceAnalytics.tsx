import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
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
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter
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
  BarChart3,
  PieChart as PieChartIcon,
  RefreshCw
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ContentPerformance {
  id: string;
  platform: string;
  platform_content_id: string | null;
  views: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  click_through_rate: number | null;
  engagement_rate: number | null;
  revenue_attributed: number | null;
  published_at: string | null;
  content_suggestion_id: string | null;
  created_at: string;
}

interface ContentSuggestion {
  id: string;
  title: string;
  content_type: string;
  engagement_prediction: number | null;
  voice_authenticity_score: number | null;
  created_at: string;
}

interface AnalyticsData {
  performance: ContentPerformance[];
  suggestions: ContentSuggestion[];
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export const PerformanceAnalytics = () => {
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsData>({ performance: [], suggestions: [] });
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
      
      // Calculate date range
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

      // Fetch performance data
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

      // Fetch content suggestions for comparison
      const { data: suggestionsData, error: suggestionsError } = await supabase
        .from('content_suggestions')
        .select('id, title, content_type, engagement_prediction, voice_authenticity_score, created_at')
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

  // Calculate key metrics
  const calculateMetrics = () => {
    const totalViews = data.performance.reduce((sum, item) => sum + (item.views || 0), 0);
    const totalLikes = data.performance.reduce((sum, item) => sum + (item.likes || 0), 0);
    const totalComments = data.performance.reduce((sum, item) => sum + (item.comments || 0), 0);
    const totalShares = data.performance.reduce((sum, item) => sum + (item.shares || 0), 0);
    const avgEngagement = data.performance.length > 0 
      ? data.performance.reduce((sum, item) => sum + (item.engagement_rate || 0), 0) / data.performance.length 
      : 0;
    const totalRevenue = data.performance.reduce((sum, item) => sum + (item.revenue_attributed || 0), 0);

    return {
      totalViews,
      totalLikes,
      totalComments,
      totalShares,
      avgEngagement,
      totalRevenue,
      totalPosts: data.performance.length
    };
  };

  // Prepare chart data
  const prepareTimeSeriesData = () => {
    const grouped = data.performance.reduce((acc, item) => {
      const date = new Date(item.created_at).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = { date, views: 0, engagement: 0, count: 0 };
      }
      acc[date].views += item.views || 0;
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
        acc[item.platform] = { platform: item.platform, posts: 0, views: 0, engagement: 0 };
      }
      acc[item.platform].posts += 1;
      acc[item.platform].views += item.views || 0;
      acc[item.platform].engagement += item.engagement_rate || 0;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped).map((item: any) => ({
      ...item,
      avgEngagement: item.posts > 0 ? item.engagement / item.posts : 0
    }));
  };

  const prepareContentTypeData = () => {
    const suggestions = data.suggestions.reduce((acc, item) => {
      if (!acc[item.content_type]) {
        acc[item.content_type] = { type: item.content_type, count: 0 };
      }
      acc[item.content_type].count += 1;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(suggestions);
  };

  const preparePredictionAccuracy = () => {
    // Match suggestions with performance data
    const matched = data.suggestions
      .map(suggestion => {
        const performance = data.performance.find(p => p.content_suggestion_id === suggestion.id);
        if (performance && suggestion.engagement_prediction) {
          return {
            predicted: suggestion.engagement_prediction,
            actual: performance.engagement_rate || 0,
            title: suggestion.title.substring(0, 20) + '...'
          };
        }
        return null;
      })
      .filter(Boolean);

    return matched;
  };

  const metrics = calculateMetrics();
  const timeSeriesData = prepareTimeSeriesData();
  const platformData = preparePlatformData();
  const contentTypeData = prepareContentTypeData();
  const predictionData = preparePredictionAccuracy();

  const platforms = [...new Set(data.performance.map(item => item.platform))];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Performance Analytics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Performance Analytics</span>
              </CardTitle>
              <CardDescription>
                Track and analyze your content performance across platforms
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchAnalyticsData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
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

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total Views</span>
            </div>
            <div className="text-2xl font-bold">{metrics.totalViews.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">
              {metrics.totalPosts} posts
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total Likes</span>
            </div>
            <div className="text-2xl font-bold">{metrics.totalLikes.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">
              Avg: {metrics.totalPosts > 0 ? Math.round(metrics.totalLikes / metrics.totalPosts) : 0} per post
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Avg Engagement</span>
            </div>
            <div className="text-2xl font-bold">{metrics.avgEngagement.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">
              Engagement rate
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Revenue</span>
            </div>
            <div className="text-2xl font-bold">${metrics.totalRevenue.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">
              Total attributed
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Time Series Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance Over Time</CardTitle>
            <CardDescription>Views and engagement trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Bar yAxisId="left" dataKey="views" fill="hsl(var(--primary))" />
                <Line yAxisId="right" type="monotone" dataKey="avgEngagement" stroke="hsl(var(--accent))" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Platform Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Platform Performance</CardTitle>
            <CardDescription>Performance breakdown by platform</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={platformData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="platform" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="views" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Content Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Content Type Distribution</CardTitle>
            <CardDescription>Generated content by type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={contentTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {contentTypeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Prediction Accuracy */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">AI Prediction Accuracy</CardTitle>
            <CardDescription>Predicted vs actual engagement</CardDescription>
          </CardHeader>
          <CardContent>
            {predictionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart data={predictionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="predicted" name="Predicted" />
                  <YAxis dataKey="actual" name="Actual" />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background border rounded-lg p-3 shadow-md">
                            <p className="font-medium">{data.title}</p>
                            <p>Predicted: {data.predicted.toFixed(1)}%</p>
                            <p>Actual: {data.actual.toFixed(1)}%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter dataKey="actual" fill="hsl(var(--primary))" />
                </ScatterChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4" />
                <p>No prediction data available yet</p>
                <p className="text-sm">Generate content and track performance to see accuracy</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      {data.performance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Key Insights</CardTitle>
            <CardDescription>AI-powered insights from your content performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Best Performing Platform</h4>
                <div className="flex items-center space-x-2">
                  <Badge variant="default">
                    {platformData.length > 0 
                      ? platformData.reduce((a, b) => (a.avgEngagement || 0) > (b.avgEngagement || 0) ? a : b).platform
                      : 'N/A'
                    }
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Highest engagement rate
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Most Generated Content</h4>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">
                    {contentTypeData.length > 0 
                      ? contentTypeData.reduce((a, b) => (a.count || 0) > (b.count || 0) ? a : b).type
                      : 'N/A'
                    }
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Most created content type
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};