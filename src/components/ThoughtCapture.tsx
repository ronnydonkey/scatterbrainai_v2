import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { PenTool, Plus, Trash2, Calendar, Tag, Brain, Lightbulb, Sparkles, TrendingUp, User, FileText, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { FileUpload, AttachmentFile } from './FileUpload';

interface Thought {
  id: string;
  title: string | null;
  content: string;
  tags: string[] | null;
  mood: string | null;
  context: string | null;
  is_processed: boolean;
  created_at: string;
  attachments?: AttachmentFile[];
}

export const ThoughtCapture = () => {
  const { user } = useAuth();
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingThought, setIsAddingThought] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLearningVoice, setIsLearningVoice] = useState(false);
  const [selectedThoughts, setSelectedThoughts] = useState<Set<string>>(new Set());
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  
  const [newThought, setNewThought] = useState({
    title: '',
    content: '',
    tags: '',
    mood: '',
    context: ''
  });

  useEffect(() => {
    fetchThoughts();
  }, [user]);

  const fetchThoughts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('thoughts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setThoughts((data || []).map(thought => ({
        ...thought,
        attachments: thought.attachments ? (Array.isArray(thought.attachments) ? thought.attachments as unknown as AttachmentFile[] : []) : []
      })));
    } catch (error) {
      console.error('Error fetching thoughts:', error);
      toast({
        title: "Error",
        description: "Failed to load thoughts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveThought = async () => {
    if (!user || !newThought.content.trim()) return;

    try {
      // Get user's organization ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.organization_id) {
        throw new Error('User profile not found');
      }

      const { error } = await supabase
        .from('thoughts')
        .insert({
          user_id: user.id,
          organization_id: profile.organization_id,
          title: newThought.title.trim() || null,
          content: newThought.content.trim(),
          tags: newThought.tags.split(',').map(t => t.trim()).filter(Boolean),
          mood: newThought.mood || null,
          context: newThought.context || null,
          attachments: attachments as any
        });

      if (error) throw error;

      // Reset form
      setNewThought({ title: '', content: '', tags: '', mood: '', context: '' });
      setAttachments([]);
      setIsAddingThought(false);
      
      // Refresh thoughts
      fetchThoughts();
      
      toast({
        title: "Thought Saved!",
        description: "Your thought has been captured successfully",
      });
    } catch (error) {
      console.error('Error saving thought:', error);
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save thought",
        variant: "destructive",
      });
    }
  };

  const deleteThought = async (id: string) => {
    try {
      const { error } = await supabase
        .from('thoughts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setThoughts(thoughts.filter(t => t.id !== id));
      toast({
        title: "Thought Deleted",
        description: "Your thought has been removed",
      });
    } catch (error) {
      console.error('Error deleting thought:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete thought",
        variant: "destructive",
      });
    }
  };

  const getMoodEmoji = (mood: string | null) => {
    const moodMap: Record<string, string> = {
      happy: '😊',
      excited: '🤩',
      thoughtful: '🤔',
      frustrated: '😤',
      inspired: '💡',
      calm: '😌',
      curious: '🤨'
    };
    return mood ? moodMap[mood] || '💭' : '💭';
  };

  const analyzeThoughts = async () => {
    if (selectedThoughts.size === 0) {
      toast({
        title: "No Thoughts Selected",
        description: "Please select thoughts to analyze",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      // Get user's organization ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('user_id', user!.id)
        .single();

      if (!profile?.organization_id) {
        throw new Error('User profile not found');
      }

      const { data, error } = await supabase.functions.invoke('analyze-thoughts', {
        body: {
          thoughtIds: Array.from(selectedThoughts),
          userId: user!.id,
          organizationId: profile.organization_id
        }
      });

      if (error) throw error;

      if (data.success) {
        setSelectedThoughts(new Set());
        fetchThoughts(); // Refresh to show processed status
        
        toast({
          title: "✨ Analysis Complete!",
          description: `Successfully extracted ${data.trending_topics?.length || 0} trending topics! Check the "Trending Topics" tab to see results.`,
          duration: 6000,
        });
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Thought analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze thoughts",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleThoughtSelection = (thoughtId: string) => {
    const newSelection = new Set(selectedThoughts);
    if (newSelection.has(thoughtId)) {
      newSelection.delete(thoughtId);
    } else {
      newSelection.add(thoughtId);
    }
    setSelectedThoughts(newSelection);
  };

  const selectAllUnprocessed = () => {
    const unprocessedIds = thoughts
      .filter(t => !t.is_processed)
      .map(t => t.id);
    setSelectedThoughts(new Set(unprocessedIds));
  };

  const learnVoiceProfile = async () => {
    if (thoughts.length < 3) {
      toast({
        title: "More Thoughts Needed",
        description: "Add at least 3 thoughts to learn your voice profile",
        variant: "destructive",
      });
      return;
    }

    setIsLearningVoice(true);

    try {
      const { data, error } = await supabase.functions.invoke('learn-voice-profile', {
        body: {
          thoughts: thoughts,
          userId: user!.id
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Voice Profile Learned!",
          description: "Your writing style has been analyzed and saved for personalized content generation",
        });
      } else {
        throw new Error(data.error || 'Voice learning failed');
      }
    } catch (error) {
      console.error('Voice learning error:', error);
      toast({
        title: "Learning Failed",
        description: error instanceof Error ? error.message : "Failed to learn voice profile",
        variant: "destructive",
      });
    } finally {
      setIsLearningVoice(false);
    }
  };

  const downloadAttachment = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('thought-attachments')
        .download(filePath);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: `Downloading ${fileName}`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "Could not download file",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PenTool className="h-5 w-5" />
            <span>Thought Capture</span>
          </CardTitle>
          <CardDescription>
            Capture your ideas, insights, and thoughts for AI-powered content generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isAddingThought ? (
            <Button 
              onClick={() => setIsAddingThought(true)}
              className="w-full"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Thought
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title (Optional)</Label>
                  <Input
                    id="title"
                    placeholder="Brief title for your thought..."
                    value={newThought.title}
                    onChange={(e) => setNewThought(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    placeholder="work, idea, inspiration..."
                    value={newThought.tags}
                    onChange={(e) => setNewThought(prev => ({ ...prev, tags: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Your Thought *</Label>
                <Textarea
                  id="content"
                  placeholder="What's on your mind? Share your thoughts, ideas, observations..."
                  value={newThought.content}
                  onChange={(e) => setNewThought(prev => ({ ...prev, content: e.target.value }))}
                  className="min-h-[120px]"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mood">Mood</Label>
                  <Select 
                    value={newThought.mood} 
                    onValueChange={(value) => setNewThought(prev => ({ ...prev, mood: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="How are you feeling?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="happy">😊 Happy</SelectItem>
                      <SelectItem value="excited">🤩 Excited</SelectItem>
                      <SelectItem value="thoughtful">🤔 Thoughtful</SelectItem>
                      <SelectItem value="inspired">💡 Inspired</SelectItem>
                      <SelectItem value="frustrated">😤 Frustrated</SelectItem>
                      <SelectItem value="calm">😌 Calm</SelectItem>
                      <SelectItem value="curious">🤨 Curious</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="context">Context</Label>
                  <Select 
                    value={newThought.context} 
                    onValueChange={(value) => setNewThought(prev => ({ ...prev, context: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="What's the context?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="work">Work</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="inspiration">Inspiration</SelectItem>
                      <SelectItem value="learning">Learning</SelectItem>
                      <SelectItem value="problem-solving">Problem Solving</SelectItem>
                      <SelectItem value="creative">Creative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* File Upload Section */}
              <div className="space-y-2">
                <Label>Attachments (Optional)</Label>
                <FileUpload 
                  onFilesUploaded={(files) => setAttachments(prev => [...prev, ...files])}
                  maxFiles={5}
                  maxSizeInMB={10}
                />
                
                {/* Show selected attachments */}
                {attachments.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Selected files:</p>
                    <div className="space-y-1">
                      {attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4" />
                            <span>{file.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {(file.size / 1024 / 1024).toFixed(1)}MB
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                            className="h-6 w-6 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <Button 
                  onClick={saveThought}
                  disabled={!newThought.content.trim()}
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Save Thought
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddingThought(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Thoughts List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5" />
              <span className="text-lg font-semibold">Your Thoughts</span>
            </div>
            <div className="flex items-center space-x-2">
              {thoughts.length >= 3 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={learnVoiceProfile}
                  disabled={isLearningVoice}
                  className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-200"
                >
                  {isLearningVoice ? (
                    <>
                      <User className="h-4 w-4 mr-2 animate-spin" />
                      Learning...
                    </>
                  ) : (
                    <>
                      <User className="h-4 w-4 mr-2" />
                      Learn My Voice
                    </>
                  )}
                </Button>
              )}
              {thoughts.filter(t => !t.is_processed).length > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAllUnprocessed}
                    disabled={isAnalyzing}
                  >
                    Select Unprocessed ({thoughts.filter(t => !t.is_processed).length})
                  </Button>
                  <Button
                    onClick={analyzeThoughts}
                    disabled={selectedThoughts.size === 0 || isAnalyzing}
                    size="sm"
                  >
                    {isAnalyzing ? (
                      <>
                        <Brain className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Analyze Selected ({selectedThoughts.size})
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : thoughts.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No thoughts captured yet. Start by adding your first thought above!
            </p>
          ) : (
            <div className="space-y-4">
              {thoughts.map((thought) => (
                <div 
                  key={thought.id} 
                  className={`border rounded-lg p-4 space-y-3 transition-colors ${
                    selectedThoughts.has(thought.id) ? 'ring-2 ring-primary bg-primary/5' : ''
                  } ${thought.is_processed ? 'bg-muted/30' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-3 flex-1">
                      {!thought.is_processed && (
                        <input
                          type="checkbox"
                          checked={selectedThoughts.has(thought.id)}
                          onChange={() => toggleThoughtSelection(thought.id)}
                          className="mt-1"
                        />
                      )}
                      <div className="flex-1">
                        {thought.title && (
                          <h4 className="font-semibold text-sm mb-1">{thought.title}</h4>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {thought.content}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <span className="text-lg">{getMoodEmoji(thought.mood)}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteThought(thought.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {thought.context && (
                      <Badge variant="secondary">{thought.context}</Badge>
                    )}
                    {thought.tags && thought.tags.length > 0 && (
                      <>
                        {thought.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </>
                    )}
                    {thought.is_processed && (
                      <Badge variant="default">
                        <Brain className="h-3 w-3 mr-1" />
                        Processed
                      </Badge>
                    )}
                  </div>

                  {/* Attachments Display */}
                  {thought.attachments && thought.attachments.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Attachments:</p>
                      <div className="flex flex-wrap gap-2">
                        {thought.attachments.map((attachment, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => downloadAttachment(attachment.path, attachment.name)}
                            className="h-8 text-xs"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            {attachment.name}
                            <Badge variant="secondary" className="ml-1 text-xs">
                              {(attachment.size / 1024 / 1024).toFixed(1)}MB
                            </Badge>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(thought.created_at).toLocaleDateString()} at{' '}
                    {new Date(thought.created_at).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};