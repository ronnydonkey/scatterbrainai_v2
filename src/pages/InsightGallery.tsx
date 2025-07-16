
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Clock, Search, Sparkles, Plus, Trash2, RotateCcw, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useOfflineInsights } from '@/hooks/api/useOfflineInsights';

const InsightGallery: React.FC = () => {
  const navigate = useNavigate();
  const { insights, isLoading, toggleStar, searchInsights, loadInsights, archiveInsight, restoreInsight } = useOfflineInsights();
  const [filteredInsights, setFilteredInsights] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  useEffect(() => {
    filterInsights(searchTerm, activeFilter);
  }, [insights, searchTerm, activeFilter, showArchived]);

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
    let filtered = insights;
    
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
    await archiveInsight(insightId);
  };

  const handleRestoreInsight = async (insightId: string) => {
    await restoreInsight(insightId);
  };

  const handleToggleStar = async (insightId) => {
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
    navigate(`/report/${insight.id}`);
  };

  const InsightCard: React.FC<{ insight: any }> = ({ insight }) => (
    <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-lg p-6 hover:border-purple-500/50 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <Clock className="w-4 h-4 text-white" />
          </div>
          <span className="text-gray-400 text-sm">{getRelativeTime(insight.timestamp)}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleStar(insight.id);
            }}
            className={`${insight.starred ? 'text-yellow-400' : 'text-gray-400'} hover:text-yellow-300`}
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
              className="text-green-400 hover:text-green-300"
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
              className="text-red-400 hover:text-red-300"
              title="Move to Bad Idea vault"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">
          {insight.response?.insights?.keyThemes?.[0]?.theme || 'Untitled Insight'}
        </h3>
        <p className="text-gray-300 text-sm mb-4 line-clamp-3">
          {insight.input || 'No content available'}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <span className={`px-2 py-1 rounded-full text-xs ${
              insight.userActions?.completedTasks?.length === insight.response?.insights?.actionItems?.length 
                ? 'bg-green-600 text-green-100' 
                : 'bg-purple-600 text-purple-100'
            }`}>
              {insight.userActions?.completedTasks?.length || 0}/{insight.response?.insights?.actionItems?.length || 0} Actions
            </span>
          </div>
          <Button
            size="sm"
            onClick={() => handleContinueAnalysis(insight)}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Sparkles className="w-4 h-4 mr-1" />
            Continue
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-4xl font-bold text-white">
              {showArchived ? 'Bad Idea Vault' : 'Insight Gallery'}
            </h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowArchived(!showArchived)}
              className={`${showArchived ? 'text-red-400 hover:text-red-300' : 'text-gray-400 hover:text-gray-300'} transition-colors`}
              title={showArchived ? 'View active insights' : 'View Bad Idea vault'}
            >
              <Archive className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-xl text-gray-300">
            {showArchived ? 'Ideas you\'ve set aside (but might want back)' : 'Your captured thoughts and their insights'}
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
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pl-10"
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
                  ? "bg-white text-black hover:bg-gray-200" 
                  : "border-white/20 text-white hover:bg-white/10"
                }
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Loading insights...</p>
          </div>
        ) : filteredInsights.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-800/50 rounded-lg flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-4">
              {searchTerm || activeFilter !== 'All' 
                ? 'No insights found' 
                : 'No insights yet'
              }
            </h3>
            <p className="text-gray-400 mb-8">
              {searchTerm || activeFilter !== 'All'
                ? 'Try adjusting your search or filters.'
                : 'Start capturing thoughts to see insights here.'
              }
            </p>
            {searchTerm || activeFilter !== 'All' ? (
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setActiveFilter('All');
                  loadInsights();
                }}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Clear Filters
              </Button>
            ) : (
              <Button
                onClick={() => navigate('/simplified')}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Start Thinking
              </Button>
            )}
          </div>
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
