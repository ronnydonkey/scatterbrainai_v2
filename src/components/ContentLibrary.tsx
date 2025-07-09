import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Library, 
  Search, 
  Copy, 
  Check, 
  Calendar, 
  FileText, 
  Eye,
  Filter,
  CheckCircle,
  Clock
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ContentSuggestion {
  id: string;
  title: string;
  description: string | null;
  ai_generated_content: string | null;
  content_type: string;
  target_keywords: string[] | null;
  suggested_tone: string | null;
  is_used: boolean | null;
  used_at: string | null;
  engagement_prediction: number | null;
  voice_authenticity_score: number | null;
  estimated_word_count: number | null;
  created_at: string;
  updated_at: string;
}

export const ContentLibrary = () => {
  const { user } = useAuth();
  const [content, setContent] = useState<ContentSuggestion[]>([]);
  const [filteredContent, setFilteredContent] = useState<ContentSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedContent, setSelectedContent] = useState<ContentSuggestion | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchContent();
    }
  }, [user]);

  useEffect(() => {
    filterContent();
  }, [content, searchTerm, selectedType, selectedStatus]);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('content_suggestions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContent(data || []);
    } catch (error) {
      console.error('Error fetching content:', error);
      toast({
        title: "Error",
        description: "Failed to load content library",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterContent = () => {
    let filtered = content;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.target_keywords?.some(keyword => 
          keyword.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(item => item.content_type === selectedType);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      if (selectedStatus === 'used') {
        filtered = filtered.filter(item => item.is_used === true);
      } else if (selectedStatus === 'unused') {
        filtered = filtered.filter(item => item.is_used !== true);
      }
    }

    setFilteredContent(filtered);
  };

  const markAsUsed = async (id: string) => {
    try {
      const { error } = await supabase
        .from('content_suggestions')
        .update({ 
          is_used: true, 
          used_at: new Date().toISOString() 
        })
        .eq('id', id);

      if (error) throw error;

      setContent(prev => prev.map(item => 
        item.id === id 
          ? { ...item, is_used: true, used_at: new Date().toISOString() }
          : item
      ));

      toast({
        title: "Content Marked as Used",
        description: "Content has been marked as published/used",
      });
    } catch (error) {
      console.error('Error marking content as used:', error);
      toast({
        title: "Error",
        description: "Failed to update content status",
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

  const getContentTypes = () => {
    const types = [...new Set(content.map(item => item.content_type))];
    return types;
  };

  const formatContentType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Library className="h-5 w-5" />
            <span>Content Library</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Library className="h-5 w-5" />
            <span>Content Library</span>
          </CardTitle>
          <CardDescription>
            Manage and organize all your AI-generated content
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Content Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {getContentTypes().map(type => (
                  <SelectItem key={type} value={type}>
                    {formatContentType(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Content</SelectItem>
                <SelectItem value="used">Used</SelectItem>
                <SelectItem value="unused">Unused</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span>{filteredContent.length} items</span>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid gap-4">
            {filteredContent.length === 0 ? (
              <div className="text-center py-8">
                <Library className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No content found</h3>
                <p className="text-muted-foreground">
                  {content.length === 0 
                    ? "Start generating content to build your library"
                    : "Try adjusting your filters or search terms"
                  }
                </p>
              </div>
            ) : (
              filteredContent.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg mb-1">{item.title}</h4>
                        {item.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {item.is_used ? (
                          <Badge variant="default" className="flex items-center space-x-1">
                            <CheckCircle className="h-3 w-3" />
                            <span>Used</span>
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>Unused</span>
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="outline">
                        {formatContentType(item.content_type)}
                      </Badge>
                      {item.engagement_prediction && (
                        <Badge variant="secondary">
                          Engagement: {Math.round(item.engagement_prediction)}%
                        </Badge>
                      )}
                      {item.estimated_word_count && (
                        <Badge variant="outline">
                          {item.estimated_word_count} words
                        </Badge>
                      )}
                      {item.suggested_tone && (
                        <Badge variant="outline">
                          {item.suggested_tone}
                        </Badge>
                      )}
                    </div>

                    {item.target_keywords && item.target_keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {item.target_keywords.slice(0, 3).map((keyword, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                        {item.target_keywords.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{item.target_keywords.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                        {item.used_at && (
                          <>
                            <span>•</span>
                            <span>Used {new Date(item.used_at).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedContent(item)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(item.ai_generated_content || '', item.id)}
                        >
                          {copied === item.id ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>

                        {!item.is_used && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markAsUsed(item.id)}
                          >
                            Mark as Used
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Content Detail Modal */}
      <Dialog open={!!selectedContent} onOpenChange={() => setSelectedContent(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedContent?.title}</DialogTitle>
            <DialogDescription>
              {selectedContent?.description}
            </DialogDescription>
          </DialogHeader>
          
          {selectedContent && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  {formatContentType(selectedContent.content_type)}
                </Badge>
                {selectedContent.engagement_prediction && (
                  <Badge variant="secondary">
                    Engagement: {Math.round(selectedContent.engagement_prediction)}%
                  </Badge>
                )}
                {selectedContent.voice_authenticity_score && (
                  <Badge variant="secondary">
                    Voice Score: {Math.round(selectedContent.voice_authenticity_score)}%
                  </Badge>
                )}
                {selectedContent.estimated_word_count && (
                  <Badge variant="outline">
                    {selectedContent.estimated_word_count} words
                  </Badge>
                )}
              </div>

              {selectedContent.target_keywords && selectedContent.target_keywords.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Target Keywords:</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedContent.target_keywords.map((keyword, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium">Generated Content:</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(selectedContent.ai_generated_content || '', selectedContent.id)}
                    className="flex items-center space-x-2"
                  >
                    {copied === selectedContent.id ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    <span>{copied === selectedContent.id ? 'Copied!' : 'Copy'}</span>
                  </Button>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm font-mono">
                    {selectedContent.ai_generated_content}
                  </pre>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-xs text-muted-foreground">
                  Created: {new Date(selectedContent.created_at).toLocaleString()}
                  {selectedContent.used_at && (
                    <span className="ml-4">
                      Used: {new Date(selectedContent.used_at).toLocaleString()}
                    </span>
                  )}
                </div>
                
                {!selectedContent.is_used && (
                  <Button
                    onClick={() => {
                      markAsUsed(selectedContent.id);
                      setSelectedContent(null);
                    }}
                  >
                    Mark as Used
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};