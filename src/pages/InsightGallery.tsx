import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Calendar, Star, Archive, Grid, List, SortAsc, SortDesc, Brain, ArrowRight, ExternalLink, Copy, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useOfflineInsights } from '@/hooks/api';
import { format, isToday, isYesterday, isThisWeek, isThisMonth } from 'date-fns';
import { toast } from 'sonner';

type ViewMode = 'grid' | 'list';
type SortOption = 'newest' | 'oldest' | 'starred' | 'actions';
type FilterOption = 'all' | 'today' | 'week' | 'month' | 'starred' | 'unfinished';

const InsightGallery: React.FC = () => {
  const { insights, toggleStar, deleteInsight } = useOfflineInsights();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);

  // Filter and sort insights
  const filteredInsights = useMemo(() => {
    let filtered = insights.filter(insight => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          insight.input.toLowerCase().includes(searchLower) ||
          insight.themes.some(theme => theme.toLowerCase().includes(searchLower)) ||
          insight.searchTerms.some(term => term.toLowerCase().includes(searchLower))
        );
      }
      return true;
    }).filter(insight => {
      // Date and status filters
      const insightDate = new Date(insight.timestamp);
      switch (selectedFilter) {
        case 'today':
          return isToday(insightDate);
        case 'week':
          return isThisWeek(insightDate);
        case 'month':
          return isThisMonth(insightDate);
        case 'starred':
          return insight.starred;
        case 'unfinished':
          return insight.userActions.completedTasks.length < (insight.response?.actionItems?.length || 0);
        default:
          return !insight.archived;
      }
    });

    // Sort insights
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        case 'starred':
          return (b.starred ? 1 : 0) - (a.starred ? 1 : 0);
        case 'actions':
          return (b.userActions.completedTasks.length + b.userActions.sharedContent.length) - 
                 (a.userActions.completedTasks.length + a.userActions.sharedContent.length);
        default: // newest
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
    });
  }, [insights, searchTerm, selectedFilter, sortBy]);

  const getRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    if (isThisWeek(date)) return format(date, 'EEEE');
    return format(date, 'MMM d');
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${type} copied to clipboard!`);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleContinueAnalysis = (insight: any) => {
    // Navigate back to simplified flow with the insight as context
    window.location.href = `/simplified?continue=${insight.id}`;
  };

  const InsightCard: React.FC<{ insight: any; isExpanded: boolean }> = ({ insight, isExpanded }) => {
    const completedActions = insight.userActions.completedTasks.length;
    const totalActions = insight.response?.actionItems?.length || 0;
    const sharedContent = insight.userActions.sharedContent.length;
    
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`neural-card cursor-pointer transition-all duration-300 ${
          isExpanded ? 'col-span-full' : ''
        }`}
        onClick={() => setSelectedInsight(isExpanded ? null : insight.id)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 text-sm text-cosmic-muted">
            <Brain className="w-4 h-4" />
            <span>{getRelativeTime(insight.timestamp)}</span>
            <span className="text-cosmic-muted/60">•</span>
            <span>{format(new Date(insight.timestamp), 'h:mm a')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                toggleStar(insight.id);
              }}
              className={`p-1 ${insight.starred ? 'text-stardust-gold' : 'text-cosmic-muted'}`}
            >
              <Star className={`w-4 h-4 ${insight.starred ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Main Theme */}
        <h3 className="text-lg font-semibold text-cosmic-light mb-2 line-clamp-2">
          {insight.themes[0] || 'Untitled Insight'}
        </h3>

        {/* Preview */}
        <p className="text-cosmic-muted text-sm mb-4 line-clamp-3">
          {insight.input}
        </p>

        {/* Status badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {insight.themes.slice(0, 3).map((theme, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {theme}
            </Badge>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-cosmic-muted mb-4">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              ✅ {completedActions}/{totalActions} actions
            </span>
            <span className="flex items-center gap-1">
              📱 {sharedContent} shared
            </span>
            <span className="flex items-center gap-1">
              📅 {insight.userActions.calendarEvents.length} scheduled
            </span>
          </div>
        </div>

        {/* Expanded content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-cosmic-accent/20 pt-4 mt-4"
            >
              {/* Full insights */}
              {insight.response?.keyInsights && (
                <div className="mb-6">
                  <h4 className="font-semibold text-cosmic-light mb-3">Key Insights</h4>
                  <ul className="space-y-2">
                    {insight.response.keyInsights.map((keyInsight: string, index: number) => (
                      <li key={index} className="text-sm text-cosmic-muted flex items-start gap-2">
                        <span className="text-cosmic-accent mt-1">•</span>
                        {keyInsight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action items */}
              {insight.response?.actionItems && (
                <div className="mb-6">
                  <h4 className="font-semibold text-cosmic-light mb-3">Action Items</h4>
                  <ul className="space-y-2">
                    {insight.response.actionItems.map((action: string, index: number) => (
                      <li key={index} className="text-sm text-cosmic-muted flex items-start gap-2">
                        <span className={`mt-1 ${
                          insight.userActions.completedTasks.includes(index) 
                            ? 'text-emerald-400' 
                            : 'text-cosmic-accent'
                        }`}>
                          {insight.userActions.completedTasks.includes(index) ? '✅' : '◯'}
                        </span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Content suggestions */}
              {insight.response?.contentReady && (
                <div className="mb-6">
                  <h4 className="font-semibold text-cosmic-light mb-3">Generated Content</h4>
                  <div className="space-y-3">
                    {Object.entries(insight.response.contentReady).map(([platform, content]: [string, any]) => (
                      <div key={platform} className="bg-cosmic-surface rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-cosmic-light capitalize">{platform}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(content, `${platform} content`);
                            }}
                            className="p-1 text-cosmic-muted hover:text-cosmic-light"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-cosmic-muted line-clamp-3">{content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-cosmic-accent/20">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleContinueAnalysis(insight);
                  }}
                  className="bg-cosmic-purple hover:bg-cosmic-purple-dark text-white"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Continue Analysis
                </Button>
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(insight.input, 'Original thought');
                  }}
                  className="border-cosmic-accent/30 text-cosmic-light hover:bg-cosmic-accent/10"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Original
                </Button>
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteInsight(insight.id);
                    toast.success('Insight deleted');
                  }}
                  className="border-destructive/30 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick actions footer */}
        {!isExpanded && (
          <div className="flex items-center justify-between pt-3 border-t border-cosmic-accent/20">
            <Button variant="ghost" size="sm" className="text-cosmic-muted hover:text-cosmic-light">
              <ExternalLink className="w-3 h-3 mr-1" />
              View Full
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleContinueAnalysis(insight);
              }}
              className="text-cosmic-purple hover:text-cosmic-purple-light"
            >
              Continue
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        )}
      </motion.div>
    );
  };

  const filterOptions = [
    { value: 'all' as FilterOption, label: 'All Insights', count: insights.filter(i => !i.archived).length },
    { value: 'today' as FilterOption, label: 'Today', count: insights.filter(i => isToday(new Date(i.timestamp))).length },
    { value: 'week' as FilterOption, label: 'This Week', count: insights.filter(i => isThisWeek(new Date(i.timestamp))).length },
    { value: 'month' as FilterOption, label: 'This Month', count: insights.filter(i => isThisMonth(new Date(i.timestamp))).length },
    { value: 'starred' as FilterOption, label: 'Starred', count: insights.filter(i => i.starred).length },
    { value: 'unfinished' as FilterOption, label: 'Unfinished', count: insights.filter(i => 
      i.userActions.completedTasks.length < (i.response?.actionItems?.length || 0)
    ).length },
  ];

  return (
    <div className="min-h-screen w-full" style={{ background: 'var(--cosmic-gradient)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-cosmic-light mb-2">
            Insight Gallery
          </h1>
          <p className="text-cosmic-muted">
            Your personal museum of thoughts - organized, beautiful, and inspiring
          </p>
        </div>

        {/* Controls */}
        <div className="mb-8 space-y-4">
          {/* Search and View Toggle */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cosmic-muted" />
              <Input
                placeholder="Search insights, themes, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-cosmic-surface border-cosmic-accent/30 text-cosmic-light placeholder:text-cosmic-muted"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="px-3"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="px-3"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap gap-2">
            {filterOptions.map(option => (
              <Button
                key={option.value}
                variant={selectedFilter === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter(option.value)}
                className={`${
                  selectedFilter === option.value 
                    ? 'bg-cosmic-purple text-white' 
                    : 'border-cosmic-accent/30 text-cosmic-light hover:bg-cosmic-accent/10'
                }`}
              >
                {option.label}
                {option.count > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-cosmic-accent/20">
                    {option.count}
                  </span>
                )}
              </Button>
            ))}
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-cosmic-muted">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-cosmic-surface border border-cosmic-accent/30 rounded-md px-3 py-1 text-sm text-cosmic-light"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="starred">Starred First</option>
              <option value="actions">Most Actions</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-cosmic-muted">
            {filteredInsights.length} {filteredInsights.length === 1 ? 'insight' : 'insights'} found
          </p>
        </div>

        {/* Gallery */}
        {filteredInsights.length === 0 ? (
          <div className="text-center py-12">
            <Brain className="w-16 h-16 text-cosmic-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-cosmic-light mb-2">No insights found</h3>
            <p className="text-cosmic-muted mb-6">
              {searchTerm ? 'Try adjusting your search or filters' : 'Start capturing thoughts to build your insight gallery'}
            </p>
            <Button
              onClick={() => window.location.href = '/simplified'}
              className="bg-cosmic-purple hover:bg-cosmic-purple-dark text-white"
            >
              <Brain className="w-4 h-4 mr-2" />
              Capture First Thought
            </Button>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            <AnimatePresence>
              {filteredInsights.map(insight => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  isExpanded={selectedInsight === insight.id}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default InsightGallery;