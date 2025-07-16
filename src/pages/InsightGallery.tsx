
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Clock, Search, Sparkles, Plus, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useOfflineInsights } from '@/hooks/api/useOfflineInsights';
import { toast } from '@/hooks/use-toast';

const InsightGallery: React.FC = () => {
  const navigate = useNavigate();
  const { insights, isLoading, toggleStar, searchInsights, loadInsights, updateInsight } = useOfflineInsights();
  const [filteredInsights, setFilteredInsights] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [isGeneratingTitles, setIsGeneratingTitles] = useState(false);

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  useEffect(() => {
    filterInsights(searchTerm, activeFilter);
  }, [insights, searchTerm, activeFilter]);

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

  const generateInsightTitle = (content: string): string => {
    if (!content?.trim()) return 'Untitled Insight';
    
    // Remove extra whitespace and normalize
    const normalizedContent = content.trim().replace(/\s+/g, ' ');
    
    // Split into words
    const words = normalizedContent.split(' ');
    
    // If less than 6 words, use all of them
    if (words.length <= 6) {
      return words.join(' ');
    }
    
    // Take first 6 words and ensure it doesn't end awkwardly
    let title = words.slice(0, 6).join(' ');
    
    // If title is too short (less than 15 characters), try to get more meaningful terms
    if (title.length < 15) {
      // Look for meaningful words (longer than 3 characters)
      const meaningfulWords = words.filter(word => word.length > 3);
      if (meaningfulWords.length > 0) {
        title = meaningfulWords.slice(0, 4).join(' ');
      }
    }
    
    // Ensure the title isn't too long
    if (title.length > 50) {
      title = title.substring(0, 47) + '...';
    }
    
    return title;
  };

  const generateTitlesForInsights = async () => {
    setIsGeneratingTitles(true);
    
    try {
      // Find insights without proper titles
      const insightsNeedingTitles = insights.filter(insight => 
        !insight.response?.insights?.keyThemes?.[0]?.theme || 
        insight.response?.insights?.keyThemes?.[0]?.theme === 'Untitled Insight'
      );

      console.log('Insights needing titles:', insightsNeedingTitles);

      if (insightsNeedingTitles.length === 0) {
        toast({
          title: "All insights have titles! ✨",
          description: "No insights need title generation.",
        });
        return;
      }

      // Generate titles for insights that need them
      for (const insight of insightsNeedingTitles) {
        const generatedTitle = generateInsightTitle(insight.input);
        
        // Update the insight's response structure to include the generated title
        const updatedResponse = {
          ...insight.response,
          insights: {
            ...insight.response?.insights,
            keyThemes: [{
              theme: generatedTitle,
              confidence: 0.8,
              explanation: 'AI-generated title based on content'
            }, ...(insight.response?.insights?.keyThemes || [])]
          }
        };

        // Update the insight with the new response
        await updateInsight(insight.id, { response: updatedResponse });
      }

      await loadInsights(); // Refresh the insights list
      
      toast({
        title: "Titles generated! 🎯",
        description: `Added titles to ${insightsNeedingTitles.length} insights.`,
      });

    } catch (error) {
      console.error('Error generating titles:', error);
      toast({
        title: "Error generating titles",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingTitles(false);
    }
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
            handleToggleStar(insight.id);
          }}
          className={`${insight.starred ? 'text-yellow-400' : 'text-gray-400'} hover:text-yellow-300`}
        >
          <Star className={`w-4 h-4 ${insight.starred ? 'fill-current' : ''}`} />
        </Button>
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

          {/* Title Generation Button */}
          {insights.length > 0 && insights.some(insight => 
            !insight.response?.insights?.keyThemes?.[0]?.theme || 
            insight.response?.insights?.keyThemes?.[0]?.theme === 'Untitled Insight'
          ) && (
            <div className="flex justify-center">
              <Button
                onClick={generateTitlesForInsights}
                disabled={isGeneratingTitles}
                variant="outline"
                size="sm"
                className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10 hover:border-purple-400"
              >
                {isGeneratingTitles ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full mr-2"></div>
                    Generating Titles...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate Titles for Insights
                  </>
                )}
              </Button>
            </div>
          )}
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
