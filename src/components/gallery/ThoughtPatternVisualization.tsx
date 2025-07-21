import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, Calendar, Brain, Sparkles, Eye, BarChart3,
  Clock, Hash, Tag, Zap, Target, MessageSquare
} from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface InsightData {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  topics: string[];
  mood: 'positive' | 'neutral' | 'negative';
  complexity: number;
  advisors?: string[];
}

interface ThoughtPatternVisualizationProps {
  insights: InsightData[];
  timeRange?: '7d' | '30d' | '90d' | 'all';
}

export const ThoughtPatternVisualization: React.FC<ThoughtPatternVisualizationProps> = ({
  insights,
  timeRange = '30d'
}) => {
  // Process insights for visualizations
  const analyticsData = useMemo(() => {
    const now = new Date();
    const filtered = insights.filter(insight => {
      const insightDate = new Date(insight.timestamp);
      const daysAgo = {
        '7d': 7,
        '30d': 30,
        '90d': 90,
        'all': Infinity
      }[timeRange];
      
      return (now.getTime() - insightDate.getTime()) / (1000 * 60 * 60 * 24) <= daysAgo;
    });

    // Daily thinking patterns
    const dailyPattern = [];
    const dayMap = new Map();
    
    filtered.forEach(insight => {
      const date = new Date(insight.timestamp).toLocaleDateString();
      if (!dayMap.has(date)) {
        dayMap.set(date, { 
          date, 
          thoughts: 0, 
          complexity: 0, 
          positiveThoughts: 0,
          topics: new Set()
        });
      }
      const day = dayMap.get(date);
      day.thoughts += 1;
      day.complexity += insight.complexity;
      if (insight.mood === 'positive') day.positiveThoughts += 1;
      insight.topics.forEach(topic => day.topics.add(topic));
    });

    dayMap.forEach((day, date) => {
      dailyPattern.push({
        date,
        thoughts: day.thoughts,
        avgComplexity: day.complexity / day.thoughts,
        positivityRate: (day.positiveThoughts / day.thoughts) * 100,
        topicDiversity: day.topics.size
      });
    });

    // Topic frequency
    const topicFreq = new Map();
    filtered.forEach(insight => {
      insight.topics.forEach(topic => {
        topicFreq.set(topic, (topicFreq.get(topic) || 0) + 1);
      });
    });

    const topTopics = Array.from(topicFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([topic, count], index) => ({
        topic,
        count,
        color: [
          '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B',
          '#EF4444', '#EC4899', '#6366F1', '#84CC16'
        ][index % 8]
      }));

    // Complexity distribution
    const complexityDist = [
      { range: 'Simple (1-3)', count: filtered.filter(i => i.complexity <= 3).length },
      { range: 'Moderate (4-6)', count: filtered.filter(i => i.complexity > 3 && i.complexity <= 6).length },
      { range: 'Complex (7-10)', count: filtered.filter(i => i.complexity > 6).length }
    ];

    // Mood distribution
    const moodDist = [
      { mood: 'Positive', count: filtered.filter(i => i.mood === 'positive').length, color: '#10B981' },
      { mood: 'Neutral', count: filtered.filter(i => i.mood === 'neutral').length, color: '#6B7280' },
      { mood: 'Negative', count: filtered.filter(i => i.mood === 'negative').length, color: '#EF4444' }
    ];

    // Peak thinking times
    const hourlyPattern = new Array(24).fill(0);
    filtered.forEach(insight => {
      const hour = new Date(insight.timestamp).getHours();
      hourlyPattern[hour] += 1;
    });

    const peakHours = hourlyPattern
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    return {
      dailyPattern: dailyPattern.slice(-14), // Last 14 days
      topTopics,
      complexityDist,
      moodDist,
      peakHours,
      totalInsights: filtered.length,
      avgComplexity: filtered.reduce((sum, i) => sum + i.complexity, 0) / filtered.length || 0,
      topicDiversity: new Set(filtered.flatMap(i => i.topics)).size
    };
  }, [insights, timeRange]);

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "purple" }: any) => (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
          <div className={`p-2 bg-${color}-100 rounded-lg`}>
            <Icon className={`h-6 w-6 text-${color}-600`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
          Thought Pattern Analysis
        </h2>
        <p className="text-gray-600">
          Discover patterns in your thinking over time
        </p>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={Brain}
          title="Total Insights"
          value={analyticsData.totalInsights}
          subtitle={`in last ${timeRange}`}
          color="purple"
        />
        <StatCard
          icon={BarChart3}
          title="Avg Complexity"
          value={analyticsData.avgComplexity.toFixed(1)}
          subtitle="out of 10"
          color="blue"
        />
        <StatCard
          icon={Hash}
          title="Topic Diversity"
          value={analyticsData.topicDiversity}
          subtitle="unique topics"
          color="green"
        />
        <StatCard
          icon={Clock}
          title="Peak Hour"
          value={`${analyticsData.peakHours[0]?.hour || 0}:00`}
          subtitle="most active time"
          color="orange"
        />
      </div>

      {/* Daily Thinking Pattern */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            Daily Thinking Patterns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData.dailyPattern}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6B7280"
                  fontSize={12}
                />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Area
                  type="monotone"
                  dataKey="thoughts"
                  stroke="#8B5CF6"
                  fill="url(#thoughtsGradient)"
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="thoughtsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Topics */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-blue-600" />
              Most Explored Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.topTopics.map((topic, index) => (
                <motion.div
                  key={topic.topic}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: topic.color }}
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">{topic.topic}</span>
                      <Badge variant="secondary">{topic.count}</Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${(topic.count / analyticsData.topTopics[0].count) * 100}%`,
                          backgroundColor: topic.color
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Mood Distribution */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-green-600" />
              Thinking Mood Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.moodDist}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="count"
                  >
                    {analyticsData.moodDist.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              {analyticsData.moodDist.map((mood) => (
                <div key={mood.mood} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: mood.color }}
                  />
                  <span className="text-sm text-gray-600">
                    {mood.mood} ({mood.count})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Complexity Analysis */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-600" />
            Thought Complexity Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData.dailyPattern}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6B7280"
                  fontSize={12}
                />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Line
                  type="monotone"
                  dataKey="avgComplexity"
                  stroke="#F59E0B"
                  strokeWidth={3}
                  dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="topicDiversity"
                  stroke="#06B6D4"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#06B6D4', strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-sm text-gray-600">Avg Complexity</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-1 bg-cyan-500" />
              <span className="text-sm text-gray-600">Topic Diversity</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights & Recommendations */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-purple-600" />
            Pattern Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Strengths</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Most active during {analyticsData.peakHours[0]?.hour || 9}:00-{(analyticsData.peakHours[0]?.hour || 9) + 1}:00</li>
                <li>• Consistent {analyticsData.topTopics[0]?.topic || 'business'} focus</li>
                <li>• Good topic diversity ({analyticsData.topicDiversity} areas)</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Opportunities</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Explore more complex topics for deeper insights</li>
                <li>• Consider morning reflection sessions</li>
                <li>• Balance analytical and creative thinking</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};