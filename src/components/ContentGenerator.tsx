import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Sparkles, RefreshCw, Send, Archive, Twitter, Linkedin, Instagram, Facebook, Copy, Check, Brain, TrendingUp } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ContentSuggestion {
  id: string;
  title: string;
  ai_generated_content: string;
  content_type: string;
  engagement_prediction: number;
  voice_authenticity_score: number;
  estimated_word_count: number;
  target_keywords: string[];
  created_at: string;
}

interface TrendingTopic {
  id: string;
  topic: string;
  title: string;
  description: string;
  score: number;
  keywords: string[];
}

export const ContentGenerator = () => {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<ContentSuggestion[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set());
  const [contentFilter, setContentFilter] = useState<string>('all');
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadInitialData();
    }
  }, [user]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchContentSuggestions(),
        fetchTrendingTopics()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContentSuggestions = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.organization_id) return;

      const { data, error } = await supabase
        .from('content_suggestions')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .eq('is_used', false)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setSuggestions(data || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const fetchTrendingTopics = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.organization_id) return;

      const { data, error } = await supabase
        .from('trending_topics')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('score', { ascending: false })
        .limit(5);

      if (error) throw error;
      setTrendingTopics(data || []);
    } catch (error) {
      console.error('Error fetching trending topics:', error);
    }
  };

  const generateAutomaticSuggestions = async () => {
    if (!user) return;

    setGenerating(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id, voice_profile_config')
        .eq('user_id', user.id)
        .single();

      if (!profile?.organization_id) {
        throw new Error('User profile not found');
      }

      // Get recent thoughts for context
      const { data: thoughts } = await supabase
        .from('thoughts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      const contentTypes = ['twitter', 'linkedin', 'instagram', 'facebook'];
      const suggestions = [];

      for (const contentType of contentTypes) {
        console.log(`Generating ${contentType} content...`);
        
        const { data, error } = await supabase.functions.invoke('generate-content', {
          body: {
            topic: `Generate ${contentType} content based on user's recent thoughts and trending topics`,
            contentType: contentType,
            targetKeywords: trendingTopics.flatMap(t => t.keywords).slice(0, 5),
            tone: 'engaging',
            voiceProfile: profile.voice_profile_config || {
              style: 'informative',
              personality: 'friendly',
              expertise_level: 'intermediate'
            },
            organizationId: profile.organization_id,
            userId: user.id,
            sourceThoughts: thoughts?.slice(0, 5)?.map(t => t.id),
            autoGenerate: true
          }
        });

        console.log(`${contentType} generation result:`, { data, error });

        if (error) {
          console.error(`Error generating ${contentType} content:`, error);
          continue;
        }

        if (data?.success) {
          console.log(`Successfully generated ${contentType} content`);
          suggestions.push(data.suggestion);
        } else {
          console.error(`Failed to generate ${contentType} content:`, data);
        }
      }

      if (suggestions.length > 0) {
        await fetchContentSuggestions(); // Refresh the list
        toast({
          title: "🎉 Content Generated!",
          description: `Successfully created ${suggestions.length} new content suggestions`,
          duration: 5000,
        });
      } else {
        toast({
          title: "⚠️ Generation Issue",
          description: "No content was generated. This may be due to API credit limits or configuration issues.",
          variant: "destructive",
          duration: 8000,
        });
      }
    } catch (error) {
      console.error('Auto-generation error:', error);
      
      let errorMessage = "Failed to generate content";
      if (error instanceof Error) {
        if (error.message.includes('credit balance')) {
          errorMessage = "Anthropic API credits are insufficient. Please add more credits to your Anthropic account.";
        } else if (error.message.includes('API key')) {
          errorMessage = "AI API configuration issue. Please check your API keys.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "🚫 Generation Failed",
        description: errorMessage,
        variant: "destructive",
        duration: 10000,
      });
    } finally {
      setGenerating(false);
    }
  };

  const moveToLibrary = async (suggestionIds: string[]) => {
    try {
      const { error } = await supabase
        .from('content_suggestions')
        .update({ 
          is_used: true,
          used_at: new Date().toISOString()
        })
        .in('id', suggestionIds);

      if (error) throw error;

      // Remove from current suggestions
      setSuggestions(prev => prev.filter(s => !suggestionIds.includes(s.id)));
      setSelectedSuggestions(new Set());

      toast({
        title: "Moved to Library",
        description: `${suggestionIds.length} suggestion(s) moved to content library`,
      });
    } catch (error) {
      console.error('Error moving to library:', error);
      toast({
        title: "Move Failed",
        description: "Failed to move content to library",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(id);
      toast({
        title: "Copied!",
        description: "Content copied to clipboard",
      });
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const getPlatformIcon = (contentType: string) => {
    switch (contentType.toLowerCase()) {
      case 'twitter': return Twitter;
      case 'linkedin': return Linkedin;
      case 'instagram': return Instagram;
      case 'facebook': return Facebook;
      default: return Send;
    }
  };

  const filteredSuggestions = suggestions.filter(s => 
    contentFilter === 'all' || s.content_type === contentFilter
  );

  const toggleSuggestionSelection = (id: string) => {
    const newSelection = new Set(selectedSuggestions);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedSuggestions(newSelection);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5" />
                <span>AI Content Suggestions</span>
              </CardTitle>
              <CardDescription>
                Automatically generated content based on your thoughts and trending topics
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={generateAutomaticSuggestions}
                disabled={generating}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate New
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        {trendingTopics.length > 0 && (
          <CardContent>
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Current Trending Topics</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {trendingTopics.map((topic) => (
                  <Badge key={topic.id} variant="secondary" className="text-xs">
                    {topic.topic} ({Math.round(topic.score)}%)
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Content Filter and Bulk Actions */}
      {suggestions.length > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <Select value={contentFilter} onValueChange={setContentFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Platforms</SelectItem>
                    <SelectItem value="twitter">Twitter</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">
                  {filteredSuggestions.length} suggestions
                </span>
              </div>

              {selectedSuggestions.size > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {selectedSuggestions.size} selected
                  </span>
                  <Button
                    onClick={() => moveToLibrary(Array.from(selectedSuggestions))}
                    size="sm"
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    Move to Library
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Suggestions */}
      {filteredSuggestions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Content Suggestions Yet</h3>
            <p className="text-muted-foreground mb-4">
              Generate AI-powered content suggestions based on your thoughts and trending topics
            </p>
            <Button
              onClick={generateAutomaticSuggestions}
              disabled={generating}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Your First Suggestions
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredSuggestions.map((suggestion) => {
            const PlatformIcon = getPlatformIcon(suggestion.content_type);
            const isSelected = selectedSuggestions.has(suggestion.id);
            
            return (
              <Card key={suggestion.id} className={`transition-all ${isSelected ? 'ring-2 ring-primary bg-primary/5' : ''}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-3 flex-1">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSuggestionSelection(suggestion.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <PlatformIcon className="h-4 w-4" />
                          <span className="text-sm font-medium capitalize">{suggestion.content_type}</span>
                          <Badge variant="outline" className="text-xs">
                            {suggestion.estimated_word_count} words
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(suggestion.ai_generated_content, suggestion.id)}
                        className="h-8 w-8 p-0"
                      >
                        {copied === suggestion.id ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => moveToLibrary([suggestion.id])}
                      >
                        <Archive className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="default">
                      Engagement: {Math.round(suggestion.engagement_prediction)}%
                    </Badge>
                    <Badge variant="secondary">
                      Voice Score: {Math.round(suggestion.voice_authenticity_score)}%
                    </Badge>
                  </div>

                  {suggestion.target_keywords.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Keywords:</span>
                      <div className="flex flex-wrap gap-1">
                        {suggestion.target_keywords.map((keyword, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="text-sm whitespace-pre-wrap">
                      {suggestion.ai_generated_content}
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Generated {new Date(suggestion.created_at).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};