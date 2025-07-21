import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, Filter, Calendar, Star, Archive, TrendingUp, 
  Brain, Eye, Sparkles, Clock, Tag, BarChart3, Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

import { ThoughtPatternVisualization } from './ThoughtPatternVisualization';
import { NeuralAmbientBackground } from '@/components/ui/neural-ambient-background';
import { ShareInsight } from '@/components/ShareInsight';
import { TIERS } from '@/data/advisorsDirectory';

interface Insight {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  topics: string[];
  mood: 'positive' | 'neutral' | 'negative';
  complexity: number;
  advisors?: Array<{
    name: string;
    avatar: string;
    tier: string;
    insight: string;
  }>;
  starred?: boolean;
  archived?: boolean;
  shareCount?: number;
  viewCount?: number;
}

interface EnhancedInsightGalleryProps {
  insights?: Insight[];
  onInsightUpdate?: (insight: Insight) => void;
}

// Demo data
const demoInsights: Insight[] = [
  {
    id: '1',
    title: 'Strategic Product Development',
    content: 'Thinking about how to balance innovation with market needs...',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    topics: ['Strategy', 'Product', 'Innovation'],
    mood: 'positive',
    complexity: 7,
    advisors: [
      { name: 'Steve Jobs', avatar: '📱', tier: 'legendary', insight: 'Focus on user experience above all else.' },
      { name: 'Naval Ravikant', avatar: '🚀', tier: 'elite', insight: 'Build something people desperately want.' }
    ],
    starred: true,
    shareCount: 12,
    viewCount: 45
  },
  {
    id: '2',
    title: 'Leadership Philosophy',
    content: 'Exploring what makes great leaders and how to develop those qualities...',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    topics: ['Leadership', 'Philosophy', 'Personal Growth'],
    mood: 'neutral',
    complexity: 8,
    advisors: [
      { name: 'Marcus Aurelius', avatar: '🏛️', tier: 'legendary', insight: 'Lead by example and inner discipline.' }
    ],
    shareCount: 8,
    viewCount: 23
  },
  {
    id: '3',
    title: 'Creative Problem Solving',
    content: 'How to approach complex challenges with creative thinking...',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    topics: ['Creativity', 'Problem Solving', 'Innovation'],
    mood: 'positive',
    complexity: 6,
    advisors: [
      { name: 'Leonardo da Vinci', avatar: '🎨', tier: 'legendary', insight: 'Combine art and science for breakthrough solutions.' }
    ],
    starred: true,
    shareCount: 15,
    viewCount: 67
  }
];

export const EnhancedInsightGallery: React.FC<EnhancedInsightGalleryProps> = ({
  insights = demoInsights,
  onInsightUpdate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [activeTab, setActiveTab] = useState('gallery');
  const [filteredInsights, setFilteredInsights] = useState(insights);

  // Filter and sort insights
  useEffect(() => {
    let filtered = insights.filter(insight => {
      const matchesSearch = insight.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           insight.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           insight.topics.some(topic => topic.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesFilter = selectedFilter === 'all' ||
                           (selectedFilter === 'starred' && insight.starred) ||
                           (selectedFilter === 'archived' && insight.archived) ||
                           (selectedFilter === 'board' && insight.advisors && insight.advisors.length > 0);

      return matchesSearch && matchesFilter && !insight.archived;
    });

    // Sort insights
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case 'popular':
          return (b.viewCount || 0) - (a.viewCount || 0);
        case 'complex':
          return b.complexity - a.complexity;
        case 'starred':
          return (b.starred ? 1 : 0) - (a.starred ? 1 : 0);
        default:
          return 0;
      }
    });

    setFilteredInsights(filtered);
  }, [insights, searchTerm, selectedFilter, sortBy]);

  const toggleStar = (insightId: string) => {
    const updated = insights.map(insight =>
      insight.id === insightId ? { ...insight, starred: !insight.starred } : insight
    );
    onInsightUpdate?.(updated.find(i => i.id === insightId)!);
    toast.success('Insight updated');
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplexityLabel = (complexity: number) => {
    if (complexity <= 3) return { label: 'Simple', color: 'bg-blue-100 text-blue-800' };
    if (complexity <= 6) return { label: 'Moderate', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Complex', color: 'bg-purple-100 text-purple-800' };
  };

  return (
    <div className="min-h-screen relative">
      <NeuralAmbientBackground />
      
      <div className="relative z-10 max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Eye className="h-8 w-8 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              Insight Gallery
            </h1>
            <Eye className="h-8 w-8 text-purple-600" />
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore your thoughts, discover patterns, and track your intellectual journey over time.
          </p>
        </motion.div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-white/50 backdrop-blur-sm">
              <TabsTrigger value="gallery" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Gallery ({filteredInsights.length})
              </TabsTrigger>
              <TabsTrigger value="patterns" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Patterns
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="gallery" className="space-y-6 mt-6">
            {/* Search and Filters */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search insights, topics, or content..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/50"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <select
                      value={selectedFilter}
                      onChange={(e) => setSelectedFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-md bg-white/50 text-sm"
                    >
                      <option value="all">All Insights</option>
                      <option value="starred">Starred</option>
                      <option value="board">With Advisory Board</option>
                    </select>

                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-md bg-white/50 text-sm"
                    >
                      <option value="recent">Most Recent</option>
                      <option value="popular">Most Viewed</option>
                      <option value="complex">Most Complex</option>
                      <option value="starred">Starred First</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Insights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredInsights.map((insight, index) => {
                  const complexityInfo = getComplexityLabel(insight.complexity);
                  
                  return (
                    <motion.div
                      key={insight.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="h-full bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                                {insight.title}
                              </CardTitle>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Clock className="h-3 w-3" />
                                {new Date(insight.timestamp).toLocaleDateString()}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleStar(insight.id)}
                              className={`p-2 ${insight.starred ? 'text-yellow-500' : 'text-gray-400'}`}
                            >
                              <Star className={`h-4 w-4 ${insight.starred ? 'fill-current' : ''}`} />
                            </Button>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          {/* Content Preview */}
                          <p className="text-sm text-gray-700 line-clamp-3">
                            {insight.content}
                          </p>

                          {/* Topics */}
                          <div className="flex flex-wrap gap-1">
                            {insight.topics.slice(0, 3).map((topic, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {topic}
                              </Badge>
                            ))}
                            {insight.topics.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{insight.topics.length - 3}
                              </Badge>
                            )}
                          </div>

                          {/* Advisory Board Insights */}
                          {insight.advisors && insight.advisors.length > 0 && (
                            <div className="p-3 bg-purple-50 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Crown className="h-3 w-3 text-purple-600" />
                                <span className="text-xs font-medium text-purple-800">
                                  Advisory Board ({insight.advisors.length})
                                </span>
                              </div>
                              <div className="flex gap-1">
                                {insight.advisors.slice(0, 3).map((advisor, idx) => (
                                  <Avatar key={idx} className="h-6 w-6 border border-white">
                                    <AvatarFallback className="text-xs">
                                      {advisor.avatar}
                                    </AvatarFallback>
                                  </Avatar>
                                ))}
                                {insight.advisors.length > 3 && (
                                  <div className="h-6 w-6 bg-gray-200 rounded-full flex items-center justify-center text-xs text-gray-600">
                                    +{insight.advisors.length - 3}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Metadata */}
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex gap-2">
                              <Badge className={getMoodColor(insight.mood)}>
                                {insight.mood}
                              </Badge>
                              <Badge className={complexityInfo.color}>
                                {complexityInfo.label}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-gray-500">
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {insight.viewCount || 0}
                              </span>
                              <ShareInsight insight={insight} />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {filteredInsights.length === 0 && (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No insights found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search criteria or create new insights.
                  </p>
                  <Button variant="outline" onClick={() => {
                    setSearchTerm('');
                    setSelectedFilter('all');
                  }}>
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="patterns" className="mt-6">
            <ThoughtPatternVisualization insights={insights} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};