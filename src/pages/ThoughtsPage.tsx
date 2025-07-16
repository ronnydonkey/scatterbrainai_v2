import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Plus, Search, Calendar, Filter, Trash2, Edit, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Thought {
  id: string;
  title: string;
  content: string;
  tags: string[];
  mood: string;
  created_at: string;
  is_processed: boolean;
}

const ThoughtsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [filteredThoughts, setFilteredThoughts] = useState<Thought[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [isGeneratingTitles, setIsGeneratingTitles] = useState(false);

  useEffect(() => {
    if (user) {
      fetchThoughts();
    }
  }, [user]);

  const fetchThoughts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('thoughts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setThoughts(data || []);
      setFilteredThoughts(data || []);
    } catch (error) {
      console.error('Error fetching thoughts:', error);
      toast({
        title: "Error",
        description: "Failed to load thoughts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateThoughtTitle = async (content: string): Promise<string> => {
    try {
      // Use a simple approach to generate title
      const words = content.split(' ').slice(0, 6); // First 6 words
      let title = words.join(' ');
      
      // If it's too short, try to extract key terms
      if (title.length < 10) {
        // Extract meaningful words (not common articles/prepositions)
        const meaningfulWords = content.split(' ')
          .filter(word => word.length > 3 && 
            !['that', 'this', 'with', 'from', 'they', 'them', 'were', 'been', 'have', 'will', 'would', 'could', 'should'].includes(word.toLowerCase()))
          .slice(0, 4);
        title = meaningfulWords.join(' ');
      }
      
      // Ensure it's not too long
      if (title.length > 50) {
        title = title.substring(0, 47) + '...';
      }
      
      // Capitalize first letter
      title = title.charAt(0).toUpperCase() + title.slice(1);
      
      return title || 'Untitled Thought';
    } catch (error) {
      console.error('Error generating title:', error);
      return 'Untitled Thought';
    }
  };

  const generateTitlesForExistingThoughts = async () => {
    if (!user) return;

    setIsGeneratingTitles(true);
    
    try {
      // Find thoughts without titles
      const thoughtsNeedingTitles = thoughts.filter(thought => !thought.title);
      
      if (thoughtsNeedingTitles.length === 0) {
        toast({
          title: "All Set!",
          description: "All your thoughts already have titles.",
        });
        return;
      }

      let updatedCount = 0;

      // Generate titles for each thought
      for (const thought of thoughtsNeedingTitles) {
        const newTitle = await generateThoughtTitle(thought.content);
        
        const { error } = await supabase
          .from('thoughts')
          .update({ title: newTitle })
          .eq('id', thought.id);

        if (!error) {
          updatedCount++;
        }
      }

      if (updatedCount > 0) {
        // Refresh the thoughts list
        await fetchThoughts();
        
        toast({
          title: "Titles Generated!",
          description: `Generated titles for ${updatedCount} thought${updatedCount > 1 ? 's' : ''}`,
        });
      }
    } catch (error) {
      console.error('Error generating titles:', error);
      toast({
        title: "Error",
        description: "Failed to generate titles. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingTitles(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    filterThoughts(term, activeFilter);
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    filterThoughts(searchTerm, filter);
  };

  const filterThoughts = (search: string, filter: string) => {
    let filtered = thoughts;
    
    // Apply search
    if (search) {
      filtered = filtered.filter(thought => 
        thought.title?.toLowerCase().includes(search.toLowerCase()) ||
        thought.content?.toLowerCase().includes(search.toLowerCase()) ||
        thought.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    // Apply filter
    switch(filter) {
      case 'This Week':
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(thought => 
          new Date(thought.created_at) > oneWeekAgo
        );
        break;
      case 'Processed':
        filtered = filtered.filter(thought => thought.is_processed);
        break;
      case 'Unprocessed':
        filtered = filtered.filter(thought => !thought.is_processed);
        break;
      default: // 'All'
        break;
    }
    
    setFilteredThoughts(filtered);
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

  const getMoodColor = (mood: string | null) => {
    switch (mood?.toLowerCase()) {
      case 'positive': return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'negative': return 'bg-red-500/20 text-red-700 border-red-500/30';
      case 'neutral': return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
      case 'excited': return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
      case 'contemplative': return 'bg-purple-500/20 text-purple-700 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    }
  };

  const ThoughtCard: React.FC<{ thought: Thought }> = ({ thought }) => (
    <Card className="bg-card hover:shadow-md transition-all duration-300 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-primary" />
            </div>
            <span className="text-muted-foreground text-sm">{getRelativeTime(thought.created_at)}</span>
          </div>
          <div className="flex items-center space-x-2">
            {thought.mood && (
              <Badge variant="outline" className={getMoodColor(thought.mood)}>
                {thought.mood}
              </Badge>
            )}
            <Badge variant={thought.is_processed ? "default" : "secondary"}>
              {thought.is_processed ? 'Processed' : 'Raw'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">
            {thought.title || 'Untitled Thought'}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
            {thought.content}
          </p>
        </div>

        {thought.tags && thought.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {thought.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
            {thought.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{thought.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
          <Button
            size="sm"
            onClick={() => navigate(`/thought/${thought.id}`)}
            className="bg-primary hover:bg-primary/90"
          >
            <BookOpen className="w-4 h-4 mr-1" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Your Thoughts</h1>
          <p className="text-xl text-gray-300">Capture and organize your ideas, insights, and inspirations</p>
        </div>

        {/* Action Buttons */}
        <div className="mb-8 text-center space-y-4">
          <Button
            onClick={() => navigate('/capture')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Thought
          </Button>
          
          {thoughts.some(thought => !thought.title) && (
            <div>
              <Button
                onClick={generateTitlesForExistingThoughts}
                disabled={isGeneratingTitles}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                {isGeneratingTitles ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Generating Titles...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Generate Titles for Existing Thoughts
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search thoughts..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pl-10"
            />
          </div>
          
          <div className="flex justify-center gap-2">
            {['All', 'This Week', 'Processed', 'Unprocessed'].map((filter) => (
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
        {filteredThoughts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-800/50 rounded-lg flex items-center justify-center mx-auto mb-6">
              <Brain className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-4">
              {searchTerm || activeFilter !== 'All' 
                ? 'No thoughts found' 
                : 'No thoughts yet'
              }
            </h3>
            <p className="text-gray-400 mb-8">
              {searchTerm || activeFilter !== 'All'
                ? 'Try adjusting your search or filters.'
                : 'Start capturing your thoughts to see them here.'
              }
            </p>
            {searchTerm || activeFilter !== 'All' ? (
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setActiveFilter('All');
                  setFilteredThoughts(thoughts);
                }}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Clear Filters
              </Button>
            ) : (
              <Button
                onClick={() => navigate('/capture')}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Capture Your First Thought
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredThoughts.map((thought) => (
              <ThoughtCard key={thought.id} thought={thought} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ThoughtsPage;