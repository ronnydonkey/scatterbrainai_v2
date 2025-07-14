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
        className={`group bg-card hover:bg-accent/5 border border-border hover:border-primary/20 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg ${
          isExpanded ? 'col-span-full ring-2 ring-primary/20' : ''
        }`}
        onClick={() => setSelectedInsight(isExpanded ? null : insight.id)}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Brain className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="font-medium text-foreground">{getRelativeTime(insight.timestamp)}</div>
                <div className="text-xs">{format(new Date(insight.timestamp), 'h:mm a')}</div>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              toggleStar(insight.id);
            }}
            className={`${insight.starred ? 'text-yellow-500 hover:text-yellow-600' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Star className={`w-5 h-5 ${insight.starred ? 'fill-current' : ''}`} />
          </Button>
        </div>

        {/* Main Content */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {insight.themes[0] || 'Untitled Insight'}
          </h3>

          <p className="text-muted-foreground leading-relaxed line-clamp-3">
            {insight.input}
          </p>

          {/* Theme Tags */}
          <div className="flex flex-wrap gap-2">
            {insight.themes.slice(0, 3).map((theme, index) => (
              <Badge key={index} variant="outline" className="text-xs px-2 py-1">
                {theme}
              </Badge>
            ))}
            {insight.themes.length > 3 && (
              <Badge variant="outline" className="text-xs px-2 py-1 text-muted-foreground">
                +{insight.themes.length - 3} more
              </Badge>
            )}
          </div>

          {/* Progress Indicators */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span>{completedActions}/{totalActions} tasks</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span>{sharedContent} shared</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <span>{insight.userActions.calendarEvents.length} scheduled</span>
            </div>
          </div>
        </div>

        {/* Expanded content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-border pt-6 mt-6 space-y-6"
            >
              {/* Key Insights */}
              {insight.response?.keyInsights && (
                <div>
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    Key Insights
                  </h4>
                  <div className="space-y-3">
                    {insight.response.keyInsights.map((keyInsight: string, index: number) => (
                      <div key={index} className="bg-accent/5 rounded-lg p-4 border-l-4 border-primary">
                        <p className="text-sm text-foreground leading-relaxed">{keyInsight}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Items */}
              {insight.response?.actionItems && (
                <div>
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    Action Items ({completedActions}/{totalActions} completed)
                  </h4>
                  <div className="space-y-2">
                    {insight.response.actionItems.map((action: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/5 transition-colors">
                        <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          insight.userActions.completedTasks.includes(index) 
                            ? 'bg-emerald-500 border-emerald-500 text-white' 
                            : 'border-muted-foreground'
                        }`}>
                          {insight.userActions.completedTasks.includes(index) && (
                            <span className="text-xs">✓</span>
                          )}
                        </div>
                        <p className={`text-sm leading-relaxed ${
                          insight.userActions.completedTasks.includes(index) 
                            ? 'text-muted-foreground line-through' 
                            : 'text-foreground'
                        }`}>
                          {action}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Generated Content */}
              {insight.response?.contentReady && (
                <div>
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    Generated Content
                  </h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    {Object.entries(insight.response.contentReady).map(([platform, content]: [string, any]) => (
                      <div key={platform} className="bg-card border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium text-foreground capitalize">{platform}</h5>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(content, `${platform} content`);
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleContinueAnalysis(insight);
                  }}
                  className="flex items-center gap-2"
                >
                  <ArrowRight className="w-4 h-4" />
                  Continue Analysis
                </Button>
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(insight.input, 'Original thought');
                  }}
                  className="flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy Original
                </Button>
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteInsight(insight.id);
                    toast.success('Insight deleted');
                  }}
                  className="flex items-center gap-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick actions footer */}
        {!isExpanded && (
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-border">
            <span className="text-xs text-muted-foreground">
              Click to expand
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleContinueAnalysis(insight);
              }}
              className="text-primary hover:text-primary/80 font-medium"
            >
              Continue Analysis
              <ArrowRight className="w-4 h-4 ml-1" />
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
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
            Insight Gallery
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Your collection of thoughts, insights, and discoveries – beautifully organized and ready to inspire your next breakthrough
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search your insights..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 text-base border-2 bg-card/50 backdrop-blur-sm focus:bg-card transition-colors"
            />
          </div>
        </div>

        {/* Filter and View Controls */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {filterOptions.map(option => (
                <Button
                  key={option.value}
                  variant={selectedFilter === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFilter(option.value)}
                  className="h-9 px-4 rounded-full"
                >
                  {option.label}
                  {option.count > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 px-2 text-xs">
                      {option.count}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>

            {/* View and Sort Controls */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8 px-3"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 px-3"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="h-9 px-3 rounded-md border bg-background text-sm font-medium"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="starred">Starred First</option>
                <option value="actions">Most Active</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-6 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {filteredInsights.length} of {insights.length} insights
          </div>
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchTerm('')}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear search
            </Button>
          )}
        </div>

        {/* Gallery */}
        {filteredInsights.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Brain className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold text-foreground mb-3">
              {searchTerm ? 'No matching insights found' : 'Your insight gallery awaits'}
            </h3>
            <p className="text-muted-foreground mb-8 max-w-md text-center">
              {searchTerm 
                ? 'Try adjusting your search terms or filters to find what you\'re looking for.' 
                : 'Start capturing your thoughts and ideas to build your personal collection of insights.'
              }
            </p>
            <div className="flex gap-3">
              {searchTerm ? (
                <Button
                  variant="outline"
                  onClick={() => setSearchTerm('')}
                  className="flex items-center gap-2"
                >
                  Clear search
                </Button>
              ) : (
                <Button
                  onClick={() => window.location.href = '/simplified'}
                  className="flex items-center gap-2"
                >
                  <Brain className="w-4 h-4" />
                  Capture Your First Thought
                </Button>
              )}
            </div>
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