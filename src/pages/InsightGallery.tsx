
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Clock, Search, Sparkles, Plus, Trash2, RotateCcw, Archive, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useOfflineInsights } from '@/hooks/api/useOfflineInsights';
import { NeuralAmbientBackground } from '@/components/ui/neural-ambient-background';
import { NeuralThinkingAnimation } from '@/components/ui/neural-thinking-animation';
import { toast } from '@/hooks/use-toast';
import { DemoModeButton } from '@/components/DemoModeButton';
import { DemoBanner } from '@/components/DemoBanner';
import { ShareInsight } from '@/components/ShareInsight';
import { EmptyState, SkeletonCard } from '@/components/ui/empty-states';
import { useGlobalKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { demoInsights } from '@/data/demoInsights';

const InsightGallery: React.FC = () => {
  const navigate = useNavigate();
  const { insights, isLoading, toggleStar, searchInsights, loadInsights, archiveInsight, restoreInsight } = useOfflineInsights();
  const [filteredInsights, setFilteredInsights] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [showArchived, setShowArchived] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Enable global keyboard shortcuts
  useGlobalKeyboardShortcuts();

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  useEffect(() => {
    filterInsights(searchTerm, activeFilter);
  }, [insights, searchTerm, activeFilter, showArchived, isDemoMode]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadInsights();
      toast({
        title: "Refreshed",
        description: "Insights have been refreshed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh insights",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term.trim()) {
      searchInsights(term);
    } else {
      loadInsights();
    }
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  const filterInsights = (search, filter) => {
    let filtered = isDemoMode ? demoInsights : insights;
    
    // First filter by archived status
    filtered = filtered.filter(insight => insight.archived === showArchived);
    
    // Apply additional filters
    switch(filter) {
      case 'This Week':
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(insight => 
          new Date(insight.timestamp) > oneWeekAgo
        );
        break;
      case 'Starred':
        filtered = filtered.filter(insight => insight.starred);
        break;
      default: // 'All'
        break;
    }
    
    setFilteredInsights(filtered);
  };

  const handleDeleteInsight = async (insightId: string) => {
    if (isDemoMode) {
      toast({
        title: "Demo Mode",
        description: "Create an account to manage your own insights!",
        variant: "default",
      });
      return;
    }
    await archiveInsight(insightId);
  };

  const handleRestoreInsight = async (insightId: string) => {
    if (isDemoMode) {
      toast({
        title: "Demo Mode",
        description: "Create an account to manage your own insights!",
        variant: "default",
      });
      return;
    }
    await restoreInsight(insightId);
  };

  const handleToggleStar = async (insightId) => {
    if (isDemoMode) {
      toast({
        title: "Demo Mode",
        description: "Create an account to save your favorite insights!",
        variant: "default",
      });
      return;
    }
    await toggleStar(insightId);
  };

  const getRelativeTime = (timestamp: number): string => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return 'Today';
    if (diffInHours < 48) return 'Yesterday';
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleContinueAnalysis = (insight: any) => {
    if (isDemoMode) {
      toast({
        title: "Demo Mode",
        description: "Create an account to continue analysis and generate full reports!",
        variant: "default",
      });
      return;
    }
    navigate(`/report/${insight.id}`);
  };

  const handleEnterDemo = () => {
    setIsDemoMode(true);
    toast({
      title: "Demo Mode Activated! 🎭",
      description: "Exploring sample insights to show you the magic of Scatterbrain",
    });
  };

  const handleStartFresh = () => {
    setIsDemoMode(false);
    setSearchTerm('');
    setActiveFilter('All');
    setShowArchived(false);
    toast({
      title: "Back to Reality! ✨",
      description: "Ready to capture your own thoughts and insights",
    });
  };

  const handleCreateAccount = () => {
    navigate('/auth');
  };

  const InsightCard: React.FC<{ insight: any }> = ({ insight }) => (
    <div className={`bg-card/50 backdrop-blur-xl border border-border/50 rounded-lg p-6 hover:border-primary/50 transition-all duration-300 ${insight.isDemo ? 'ring-1 ring-primary/20' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 ${insight.isDemo ? 'bg-gradient-to-r from-primary to-primary/80' : 'bg-primary'} rounded-lg flex items-center justify-center`}>
            <Clock className="w-4 h-4 text-white" />
          </div>
          <span className="text-muted-foreground text-sm">{getRelativeTime(insight.timestamp)}</span>
          {insight.isDemo && (
            <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">Demo</span>
          )}
        </div>
        <div className="flex items-center space-x-2 group">
          <ShareInsight insight={insight} isDemo={insight.isDemo || isDemoMode} />
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleStar(insight.id);
            }}
            className={`${insight.starred ? 'text-yellow-400' : 'text-muted-foreground'} hover:text-yellow-300 transition-all duration-200 hover:scale-110`}
          >
            <Star className={`w-4 h-4 ${insight.starred ? 'fill-current' : ''}`} />
          </Button>
          {showArchived ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleRestoreInsight(insight.id);
              }}
              className="text-green-400 hover:text-green-300 transition-all duration-200 hover:scale-110"
              title="Restore insight"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteInsight(insight.id);
              }}
              className="text-destructive hover:text-destructive/80 transition-all duration-200 hover:scale-110"
              title="Move to Bad Idea vault"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {insight.response?.insights?.keyThemes?.[0]?.theme || 'Untitled Insight'}
        </h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
          {insight.input || 'No content available'}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span className={`px-2 py-1 rounded-full text-xs ${
              insight.userActions?.completedTasks?.length === insight.response?.insights?.actionItems?.length 
                ? 'bg-green-600 text-green-100' 
                : 'bg-primary text-primary-foreground'
            }`}>
              {insight.userActions?.completedTasks?.length || 0}/{insight.response?.insights?.actionItems?.length || 0} Actions
            </span>
          </div>
          <Button
            size="sm"
            onClick={() => handleContinueAnalysis(insight)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Sparkles className="w-4 h-4 mr-1" />
            Continue
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <NeuralAmbientBackground intensity="minimal" />
      <div className="container max-w-6xl mx-auto px-6 py-8">

        {/* Demo Mode Banner */}
        {isDemoMode && (
          <DemoBanner 
            onStartFresh={handleStartFresh}
            onCreateAccount={handleCreateAccount}
            className="mb-8"
          />
        )}
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-4xl font-bold text-foreground">
              {showArchived ? 'Bad Idea Vault' : isDemoMode ? 'Demo Gallery' : 'Insight Gallery'}
            </h1>
            {!isDemoMode && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowArchived(!showArchived)}
                  className={`${showArchived ? 'text-destructive hover:text-destructive/80' : 'text-muted-foreground hover:text-foreground'} transition-colors`}
                  title={showArchived ? 'View active insights' : 'View Bad Idea vault'}
                >
                  <Archive className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  title="Refresh insights"
                >
                  <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
              </>
            )}
          </div>
          <p className="text-xl text-muted-foreground">
            {showArchived 
              ? 'Ideas you\'ve set aside (but might want back)' 
              : isDemoMode 
                ? 'Sample insights showing how Scatterbrain transforms scattered thoughts'
                : 'Your captured thoughts and their insights'
            }
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search insights..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground pl-10"
            />
          </div>
          
          <div className="flex gap-2 justify-center">
            {['All', 'This Week', 'Starred'].map((filter) => (
              <Button
                key={filter}
                variant={activeFilter === filter ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange(filter)}
                className={activeFilter === filter 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                  : "border-border text-foreground hover:bg-accent"
                }
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredInsights.length === 0 ? (
          <EmptyState
            type={showArchived ? 'archived' : 'gallery'}
            action={!isDemoMode && !searchTerm && activeFilter === 'All' ? {
              label: 'Start Thinking',
              onClick: () => navigate('/simplified')
            } : undefined}
            secondaryAction={!isDemoMode && !searchTerm && activeFilter === 'All' ? {
              label: 'Try Demo',
              onClick: handleEnterDemo
            } : searchTerm || activeFilter !== 'All' ? {
              label: 'Clear Filters',
              onClick: () => {
                setSearchTerm('');
                setActiveFilter('All');
                loadInsights();
              }
            } : undefined}
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredInsights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InsightGallery;
