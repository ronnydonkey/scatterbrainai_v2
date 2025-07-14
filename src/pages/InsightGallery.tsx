import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Brain, ArrowRight, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useOfflineInsights } from '@/hooks/api';
import { format, isToday, isYesterday } from 'date-fns';

const InsightGallery: React.FC = () => {
  const { insights, toggleStar } = useOfflineInsights();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'today' | 'starred'>('all');

  // Simple filtering
  const filteredInsights = insights.filter(insight => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        insight.input.toLowerCase().includes(searchLower) ||
        insight.themes.some(theme => theme.toLowerCase().includes(searchLower))
      );
    }
    
    // Status filters
    if (selectedFilter === 'today') {
      return isToday(new Date(insight.timestamp));
    }
    if (selectedFilter === 'starred') {
      return insight.starred;
    }
    
    return !insight.archived;
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const getRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d');
  };

  const handleContinueAnalysis = (insight: any) => {
    window.location.href = `/simplified?continue=${insight.id}`;
  };

  const InsightCard: React.FC<{ insight: any }> = ({ insight }) => {
    const completedActions = insight.userActions.completedTasks.length;
    const totalActions = insight.response?.actionItems?.length || 0;
    
    return (
      <Card className="group hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-gray-300">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <Brain className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">{getRelativeTime(insight.timestamp)}</div>
                <div className="text-sm text-gray-500">{format(new Date(insight.timestamp), 'h:mm a')}</div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                toggleStar(insight.id);
              }}
              className={`${insight.starred ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Star className={`w-5 h-5 ${insight.starred ? 'fill-current' : ''}`} />
            </Button>
          </div>

          {/* Content */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
              {insight.themes[0] || 'Untitled Insight'}
            </h3>

            <p className="text-gray-600 leading-relaxed line-clamp-3">
              {insight.input}
            </p>

            {/* Simple progress indicator */}
            {totalActions > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span>{completedActions}/{totalActions} tasks completed</span>
              </div>
            )}
          </div>

          {/* Action */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <Button
              variant="ghost"
              onClick={() => handleContinueAnalysis(insight)}
              className="w-full justify-between text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            >
              <span>Continue Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Insight Gallery
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Your collection of thoughts, insights, and discoveries
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search insights..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 text-base border-gray-200 focus:border-gray-400 bg-white"
            />
          </div>
        </div>

        {/* Simple filters */}
        <div className="mb-8">
          <div className="flex justify-center gap-2">
            {[
              { value: 'all', label: 'All' },
              { value: 'today', label: 'Today' },
              { value: 'starred', label: 'Starred' }
            ].map(filter => (
              <Button
                key={filter.value}
                variant={selectedFilter === filter.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter(filter.value as any)}
                className="rounded-full"
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Results */}
        {filteredInsights.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
              <Brain className="w-8 h-8 text-gray-400" />
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              {searchTerm || selectedFilter !== 'all' 
                ? 'No insights found' 
                : 'Your insight journey starts here'
              }
            </h3>
            
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {searchTerm || selectedFilter !== 'all'
                ? 'Try adjusting your search or filters.'
                : 'Share your thoughts and ideas to create your first insight.'
              }
            </p>
            
            {searchTerm || selectedFilter !== 'all' ? (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedFilter('all');
                }}
              >
                Clear filters
              </Button>
            ) : (
              <Button
                onClick={() => window.location.href = '/simplified'}
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                <Brain className="w-4 h-4 mr-2" />
                Start Your First Analysis
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredInsights.map(insight => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <InsightCard insight={insight} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InsightGallery;