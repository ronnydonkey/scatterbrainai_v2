import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, RefreshCw, Send, Archive, Twitter, Instagram, Copy, Check, TrendingUp, MessageSquare, Plus, Brain, Sparkles } from 'lucide-react';
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
  thought_id?: string;
}

interface TrendingTopic {
  id: string;
  topic: string;
  title: string;
  description: string;
  score: number;
  keywords: string[];
}

interface Thought {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

interface ThoughtWithContent {
  thought: Thought;
  suggestions: ContentSuggestion[];
  topics: TrendingTopic[];
}

export const ContentGenerator = () => {
  const { user } = useAuth();
  const [thoughtsWithContent, setThoughtsWithContent] = useState<ThoughtWithContent[]>([]);
  const [selectedThought, setSelectedThought] = useState<string | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set());
  const [contentFilter, setContentFilter] = useState<string>('all');
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadThoughtsWithContent();
    }
  }, [user]);

  const loadThoughtsWithContent = async () => {
    setLoading(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.organization_id) return;

      // Get recent thoughts
      const { data: thoughts } = await supabase
        .from('thoughts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!thoughts) return;

      // For each thought, get its content suggestions and trending topics
      const thoughtsWithContentData: ThoughtWithContent[] = [];

      for (const thought of thoughts) {
        // Get content suggestions for this thought
        const { data: suggestions } = await supabase
          .from('content_suggestions')
          .select('*')
          .eq('thought_id', thought.id)
          .eq('is_used', false)
          .order('created_at', { ascending: false });

        // Get trending topics for this org (we could later filter by thought if needed)
        const { data: topics } = await supabase
          .from('trending_topics')
          .select('*')
          .eq('organization_id', profile.organization_id)
          .order('score', { ascending: false })
          .limit(5);

        thoughtsWithContentData.push({
          thought,
          suggestions: suggestions || [],
          topics: topics || []
        });
      }

      setThoughtsWithContent(thoughtsWithContentData);
      
      // Auto-select first thought if none selected
      if (!selectedThought && thoughtsWithContentData.length > 0) {
        setSelectedThought(thoughtsWithContentData[0].thought.id);
      }
    } catch (error) {
      console.error('Error loading thoughts with content:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateContentForThought = async (thoughtId: string) => {
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

      // Get the specific thought
      const { data: thought } = await supabase
        .from('thoughts')
        .select('*')
        .eq('id', thoughtId)
        .single();

      if (!thought) {
        throw new Error('Thought not found');
      }

      // Get selected trending topics for context
      const selectedThoughtData = thoughtsWithContent.find(t => t.thought.id === thoughtId);
      const selectedTopicsData = selectedThoughtData?.topics.filter(topic => 
        selectedTopics.has(topic.id)
      ) || [];

      const contentTypes = ['tweet_thread', 'instagram_post', 'social_post', 'blog_post'];
      const suggestions = [];

      for (const contentType of contentTypes) {
        console.log(`Generating ${contentType} content for thought: ${thought.title}`);
        
        const topicContext = selectedTopicsData.length > 0 
          ? ` incorporating these trending topics: ${selectedTopicsData.map(t => t.topic).join(', ')}`
          : '';
        
        const { data, error } = await supabase.functions.invoke('generate-content', {
          body: {
            topic: `Generate ${contentType} content based on this specific thought: "${thought.title}" - ${thought.content}${topicContext}`,
            contentType: contentType,
            targetKeywords: selectedTopicsData.flatMap(t => t.keywords).slice(0, 5) || [],
            tone: 'engaging',
            voiceProfile: profile.voice_profile_config || {
              style: 'informative',
              personality: 'friendly',
              expertise_level: 'intermediate'
            },
            organizationId: profile.organization_id,
            userId: user.id,
            sourceThoughts: [thoughtId],
            thoughtId: thoughtId, // Link to specific thought
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
        await loadThoughtsWithContent(); // Refresh the data
        toast({
          title: "🎉 Content Generated!",
          description: `Successfully created ${suggestions.length} new content suggestions for this thought`,
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
      console.error('Content generation error:', error);
      
      let errorMessage = "Failed to generate content";
      if (error instanceof Error) {
        if (error.message.includes('credit balance')) {
          errorMessage = "OpenAI API credits are insufficient. Please add more credits to your OpenAI account.";
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

  const generateContentFromTopics = async () => {
    if (!user || selectedTopics.size === 0) return;

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

      // Get selected topics data
      const allTopics = thoughtsWithContent.flatMap(t => t.topics);
      const selectedTopicsData = allTopics.filter(topic => selectedTopics.has(topic.id));

      const contentTypes = ['tweet_thread', 'instagram_post', 'social_post', 'blog_post'];
      const suggestions = [];

      for (const contentType of contentTypes) {
        console.log(`Generating ${contentType} content for trending topics`);
        
        const topicsText = selectedTopicsData.map(t => `${t.topic}: ${t.description || ''}`).join('; ');
        
        const { data, error } = await supabase.functions.invoke('generate-content', {
          body: {
            topic: `Generate ${contentType} content about these trending topics: ${topicsText}`,
            contentType: contentType,
            targetKeywords: selectedTopicsData.flatMap(t => t.keywords).slice(0, 8) || [],
            tone: 'engaging',
            voiceProfile: profile.voice_profile_config || {
              style: 'informative',
              personality: 'friendly',
              expertise_level: 'intermediate'
            },
            organizationId: profile.organization_id,
            userId: user.id,
            sourceThoughts: [],
            thoughtId: null, // No specific thought linked
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
        await loadThoughtsWithContent(); // Refresh the data
        setSelectedTopics(new Set()); // Clear selection
        toast({
          title: "🎉 Content Generated!",
          description: `Successfully created ${suggestions.length} new content suggestions from trending topics`,
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
      console.error('Content generation error:', error);
      
      let errorMessage = "Failed to generate content";
      if (error instanceof Error) {
        if (error.message.includes('credit balance')) {
          errorMessage = "OpenAI API credits are insufficient. Please add more credits to your OpenAI account.";
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

  const toggleTopicSelection = (topicId: string) => {
    const newSelection = new Set(selectedTopics);
    if (newSelection.has(topicId)) {
      newSelection.delete(topicId);
    } else {
      newSelection.add(topicId);
    }
    setSelectedTopics(newSelection);
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

      // Refresh data to remove moved suggestions
      await loadThoughtsWithContent();
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
      case 'tweet_thread': return Twitter;
      case 'instagram_post': return Instagram;
      case 'social_post': return Send;
      case 'blog_post': return Send;
      case 'email': return Send;
      case 'youtube_script': return Send;
      default: return Send;
    }
  };

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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const selectedThoughtData = thoughtsWithContent.find(t => t.thought.id === selectedThought);
  const filteredSuggestions = selectedThoughtData?.suggestions.filter(s => 
    contentFilter === 'all' || s.content_type === contentFilter
  ) || [];

  return (
    <div className="space-y-6">
      {/* Header with Thought Selection */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
               <CardTitle className="flex items-center space-x-3">
                 <Brain size={24} />
                 <span>Neural Content Synthesis</span>
               </CardTitle>
               <CardDescription>
                 Generate synaptic content based on your neural thoughts and trending patterns
               </CardDescription>
             </div>
           </div>
         </CardHeader>

        <CardContent className="space-y-4">
          {/* Thought Selection */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center space-x-2">
                <Brain size={16} />
                <span>Select Neural Pathway</span>
              </h4>
            <Select value={selectedThought || ''} onValueChange={setSelectedThought}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a thought to generate content for..." />
              </SelectTrigger>
              <SelectContent>
                {thoughtsWithContent.map((item) => (
                  <SelectItem key={item.thought.id} value={item.thought.id}>
                    <div className="flex items-center justify-between w-full">
                      <span className="truncate">{item.thought.title || 'Untitled Thought'}</span>
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {item.suggestions.length} content
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Generate Button for Selected Thought */}
          {selectedThought && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Generate new content for this thought
              </div>
              <Button
                onClick={() => generateContentForThought(selectedThought)}
                disabled={generating}
                className="bg-gradient-to-r from-cosmic-accent to-cosmic-glow hover:shadow-lg hover:shadow-cosmic-accent/20 transition-all duration-300"
              >
                {generating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <>
                    <Brain size={16} className="mr-2" />
                    Synthesize Neural Content
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Trending Topics Selection */}
          {selectedThoughtData?.topics.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Select Trending Topics</span>
                </h4>
                {selectedTopics.size > 0 && (
                  <Button
                    onClick={generateContentFromTopics}
                    disabled={generating}
                    size="sm"
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate from Topics ({selectedTopics.size})
                      </>
                    )}
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedThoughtData.topics.map((topic) => {
                  const isSelected = selectedTopics.has(topic.id);
                  return (
                    <Badge 
                      key={topic.id} 
                      variant={isSelected ? "default" : "secondary"} 
                      className={`text-xs cursor-pointer transition-all ${
                        isSelected 
                          ? "bg-primary text-primary-foreground" 
                          : "hover:bg-muted-foreground/20"
                      }`}
                      onClick={() => toggleTopicSelection(topic.id)}
                    >
                      <Checkbox
                        checked={isSelected}
                        onChange={() => {}} // Controlled by parent click
                        className="h-3 w-3 mr-1"
                      />
                      {topic.topic} ({Math.round(topic.score)}%)
                    </Badge>
                  );
                })}
              </div>
              {selectedTopics.size > 0 && (
                <div className="text-xs text-muted-foreground">
                  {selectedTopics.size} topic{selectedTopics.size !== 1 ? 's' : ''} selected. Content will be generated independently from any specific thought.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content Filter and Bulk Actions */}
      {selectedThoughtData && filteredSuggestions.length > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <Select value={contentFilter} onValueChange={setContentFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Content Types</SelectItem>
                    <SelectItem value="tweet_thread">Tweet Thread</SelectItem>
                    <SelectItem value="instagram_post">Instagram Post</SelectItem>
                    <SelectItem value="social_post">Social Post</SelectItem>
                    <SelectItem value="blog_post">Blog Post</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="youtube_script">YouTube Script</SelectItem>
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
      {!selectedThought ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Select a Thought</h3>
            <p className="text-muted-foreground mb-4">
              Choose a thought from the dropdown above to view and generate content suggestions
            </p>
          </CardContent>
        </Card>
      ) : filteredSuggestions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Content Yet</h3>
            <p className="text-muted-foreground mb-4">
              Generate AI-powered content suggestions for this thought
            </p>
            <Button
              onClick={() => generateContentForThought(selectedThought)}
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
                  Generate Content
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Selected Thought Info */}
          <Card className="bg-muted/20">
            <CardHeader className="pb-3">
              <div className="flex items-start space-x-3">
                <MessageSquare className="h-5 w-5 mt-0.5 text-primary" />
                <div className="flex-1">
                  <h3 className="font-semibold">{selectedThoughtData?.thought.title || 'Untitled Thought'}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedThoughtData?.thought.content.substring(0, 200)}
                    {selectedThoughtData?.thought.content.length > 200 ? '...' : ''}
                  </p>
                  <div className="text-xs text-muted-foreground mt-2">
                    Created {new Date(selectedThoughtData?.thought.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Content Suggestions */}
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
                            <span className="text-sm font-medium capitalize">{suggestion.content_type.replace('_', ' ')}</span>
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
        </div>
      )}
    </div>
  );
};