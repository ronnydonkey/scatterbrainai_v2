import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Clock, Search, Filter, Sparkles, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import UserAccountDropdown from '@/components/UserAccountDropdown';

const InsightGallery: React.FC = () => {
  const navigate = useNavigate();
  const [insights, setInsights] = useState([]);
  const [filteredInsights, setFilteredInsights] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    loadInsightsFromStorage();
  }, []);

  const loadInsightsFromStorage = () => {
    const stored = JSON.parse(localStorage.getItem('scatterbrain_insights') || '[]');
    setInsights(stored);
    setFilteredInsights(stored);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    filterInsights(term, activeFilter);
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    filterInsights(searchTerm, filter);
  };

  const filterInsights = (search, filter) => {
    let filtered = insights;
    
    // Apply search
    if (search) {
      filtered = filtered.filter(insight => 
        insight.originalInput?.toLowerCase().includes(search.toLowerCase()) ||
        insight.insights?.keyThemes?.some(theme => 
          theme.theme?.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
    
    // Apply filter
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

  const toggleStar = (insightId) => {
    const updated = insights.map(insight => 
      insight.id === insightId 
        ? { ...insight, starred: !insight.starred }
        : insight
    );
    setInsights(updated);
    localStorage.setItem('scatterbrain_insights', JSON.stringify(updated));
    filterInsights(searchTerm, activeFilter); // Refresh filtered view
  };

  const getRelativeTime = (timestamp: string): string => {
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
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            toggleStar(insight.id);
          }}
          className={`${insight.starred ? 'text-yellow-400' : 'text-gray-400'} hover:text-yellow-300`}
        >
          <Star className={`w-4 h-4 ${insight.starred ? 'fill-current' : ''}`} />
        </Button>
      </div>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">
          {insight.title || insight.insights?.keyThemes?.[0]?.theme || 'Untitled Insight'}
        </h3>
        <p className="text-gray-300 text-sm mb-4 line-clamp-3">
          {insight.originalInput || 'No content available'}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <span className={`px-2 py-1 rounded-full text-xs ${
              insight.actionsCompleted === insight.totalActions 
                ? 'bg-green-600 text-green-100' 
                : 'bg-purple-600 text-purple-100'
            }`}>
              {insight.actionsCompleted || 0}/{insight.insights?.actionItems?.length || 0} Actions
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
      {/* Navigation */}
      <div className="flex items-center justify-between p-6 border-b border-gray-800/50">
        <Button
          variant="ghost"
          onClick={() => navigate('/simplified')}
          className="text-gray-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Capture
        </Button>
        <UserAccountDropdown />
      </div>

      <div className="container max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Insight Gallery</h1>
          <p className="text-xl text-gray-300">Your captured thoughts and their insights</p>
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
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
          </div>
          
          <div className="flex gap-2">
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
        {filteredInsights.length === 0 ? (
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
                  loadInsightsFromStorage();
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