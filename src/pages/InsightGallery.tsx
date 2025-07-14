import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Brain, ArrowRight, Star, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useOfflineInsights } from '@/hooks/api';
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';

const InsightGallery: React.FC = () => {
  const { insights, toggleStar } = useOfflineInsights();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'week' | 'starred'>('all');

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
    if (selectedFilter === 'week') {
      return isThisWeek(new Date(insight.timestamp));
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
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
        className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/30 rounded-xl p-6 hover:border-purple-500/30 transition-all duration-300 cursor-pointer"
        onClick={() => handleContinueAnalysis(insight)}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-medium text-white">{getRelativeTime(insight.timestamp)}</div>
              <div className="text-sm text-slate-400">{format(new Date(insight.timestamp), 'h:mm a')}</div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              toggleStar(insight.id);
            }}
            className={`${insight.starred ? 'text-yellow-400 hover:text-yellow-300' : 'text-slate-400 hover:text-slate-300'} hover:bg-slate-700/50`}
          >
            <Star className={`w-5 h-5 ${insight.starred ? 'fill-current' : ''}`} />
          </Button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white line-clamp-2">
            "{insight.themes[0] || 'Untitled Insight'}"
          </h3>

          <p className="text-slate-300 leading-relaxed line-clamp-3 text-sm">
            {insight.input}
          </p>

          {/* Progress and status indicators */}
          <div className="flex items-center justify-between">
            {totalActions > 0 && (
              <div className="flex items-center gap-2 text-sm text-emerald-400">
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                <span>{completedActions}/{totalActions} actions done</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-sm text-purple-400">
              <Sparkles className="w-4 h-4" />
              <span>Continue Analysis</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <div className="absolute top-6 left-6 z-10">
        <Button
          variant="ghost"
          onClick={() => window.location.href = '/simplified'}
          className="text-slate-300 hover:text-white hover:bg-slate-800/50 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Capture
        </Button>
      </div>

      <div className="container max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Your Thought Journey
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Every scattered thought, beautifully organized
          </p>
        </motion.div>

        {/* Search */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-slate-400" />
            <Input
              placeholder="Search your insights..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-16 h-16 text-lg bg-slate-800/50 backdrop-blur-xl border-slate-700/30 text-white placeholder-slate-400 rounded-2xl focus:border-purple-500/50 focus:ring-purple-500/20"
            />
          </div>
        </motion.div>

        {/* Simple filters */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex justify-center gap-3">
            {[
              { value: 'all', label: 'All' },
              { value: 'week', label: 'This Week' },
              { value: 'starred', label: 'Starred' }
            ].map(filter => (
              <Button
                key={filter.value}
                variant={selectedFilter === filter.value ? 'default' : 'ghost'}
                size="lg"
                onClick={() => setSelectedFilter(filter.value as any)}
                className={`rounded-full px-8 transition-all duration-300 ${
                  selectedFilter === filter.value 
                    ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:from-purple-600 hover:to-blue-700' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Results */}
        {filteredInsights.length === 0 ? (
          <motion.div 
            className="text-center py-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="w-20 h-20 rounded-2xl bg-slate-800/50 backdrop-blur-xl flex items-center justify-center mx-auto mb-8">
              <Brain className="w-10 h-10 text-slate-400" />
            </div>
            
            <h3 className="text-2xl font-semibold text-white mb-4">
              {searchTerm || selectedFilter !== 'all' 
                ? 'No insights found' 
                : 'Ready to capture your first thoughts?'
              }
            </h3>
            
            <p className="text-slate-300 mb-10 max-w-md mx-auto text-lg">
              {searchTerm || selectedFilter !== 'all'
                ? 'Try adjusting your search or filters.'
                : 'Your insights will appear here as you explore and analyze your thoughts.'
              }
            </p>
            
            {searchTerm || selectedFilter !== 'all' ? (
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedFilter('all');
                }}
                className="border-slate-600 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-full px-8"
              >
                Clear filters
              </Button>
            ) : (
              <Button
                onClick={() => window.location.href = '/simplified'}
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white rounded-full px-8 py-4"
              >
                <Brain className="w-5 h-5 mr-2" />
                Start Thinking
              </Button>
            )}
          </motion.div>
        ) : (
          <motion.div 
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {filteredInsights.map((insight, index) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <InsightCard insight={insight} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default InsightGallery;