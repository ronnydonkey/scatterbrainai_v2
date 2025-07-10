import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  TrendingUp,
  Filter,
  RotateCcw
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format, addDays, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';
import { cn } from '@/lib/utils';

interface ContentSuggestion {
  id: string;
  title: string;
  ai_generated_content: string | null;
  content_type: string;
  estimated_word_count: number | null;
}

interface ScheduledContent {
  id: string;
  content_suggestion_id: string;
  scheduled_for: string;
  platform: string;
  status: string;
  platform_content: string | null;
  platform_settings: any;
  is_recurring: boolean;
  recurrence_pattern: any;
  created_at: string;
  published_at: string | null;
  error_message: string | null;
  content_suggestions?: ContentSuggestion;
}

const PLATFORMS = [
  { id: 'twitter', name: 'Twitter', icon: Twitter, limit: 280, color: '#1DA1F2' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, limit: 3000, color: '#0A66C2' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, limit: 63206, color: '#1877F2' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, limit: 2200, color: '#E4405F' },
];

const OPTIMAL_TIMES = {
  twitter: ['9:00', '12:00', '15:00', '18:00'],
  linkedin: ['8:00', '12:00', '17:00'],
  facebook: ['9:00', '13:00', '15:00'],
  instagram: ['11:00', '14:00', '17:00', '20:00']
};

export const ContentScheduler = () => {
  const { user } = useAuth();
  const [scheduledContent, setScheduledContent] = useState<ScheduledContent[]>([]);
  const [availableContent, setAvailableContent] = useState<ContentSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedContent, setSelectedContent] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [scheduledTime, setScheduledTime] = useState<string>('');
  const [platformContent, setPlatformContent] = useState<string>('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [currentView, setCurrentView] = useState<'calendar' | 'list'>('calendar');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [scheduledResponse, contentResponse] = await Promise.all([
        supabase
          .from('content_schedule')
          .select(`
            *,
            content_suggestions (
              id,
              title,
              ai_generated_content,
              content_type,
              estimated_word_count
            )
          `)
          .order('scheduled_for', { ascending: true }),
        
        supabase
          .from('content_suggestions')
          .select('id, title, ai_generated_content, content_type, estimated_word_count')
          .eq('is_used', false)
          .order('created_at', { ascending: false })
      ]);

      if (scheduledResponse.error) throw scheduledResponse.error;
      if (contentResponse.error) throw contentResponse.error;

      setScheduledContent(scheduledResponse.data || []);
      setAvailableContent(contentResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load scheduling data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const scheduleContent = async () => {
    if (!selectedContent || !selectedPlatform || !selectedDate || !scheduledTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const scheduledDateTime = new Date(selectedDate);
      const [hours, minutes] = scheduledTime.split(':');
      scheduledDateTime.setHours(parseInt(hours), parseInt(minutes));

      if (isBefore(scheduledDateTime, new Date())) {
        toast({
          title: "Invalid Date",
          description: "Cannot schedule content in the past",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('content_schedule')
        .insert({
          content_suggestion_id: selectedContent,
          user_id: user?.id,
          organization_id: (await supabase.from('profiles').select('organization_id').eq('user_id', user?.id).single()).data?.organization_id,
          scheduled_for: scheduledDateTime.toISOString(),
          platform: selectedPlatform,
          platform_content: platformContent,
          is_recurring: isRecurring,
        });

      if (error) throw error;

      toast({
        title: "Content Scheduled",
        description: `Content scheduled for ${format(scheduledDateTime, 'PPP p')}`,
      });

      setShowScheduleDialog(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error scheduling content:', error);
      toast({
        title: "Error",
        description: "Failed to schedule content",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setSelectedContent('');
    setSelectedPlatform('');
    setSelectedDate(undefined);
    setScheduledTime('');
    setPlatformContent('');
    setIsRecurring(false);
  };

  const updateContentStatus = async (id: string, status: string) => {
    try {
      const updateData: any = { status };
      if (status === 'published') {
        updateData.published_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('content_schedule')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Content marked as ${status}`,
      });

      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update content status",
        variant: "destructive",
      });
    }
  };

  const deleteScheduledContent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('content_schedule')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Content Deleted",
        description: "Scheduled content has been removed",
      });

      fetchData();
    } catch (error) {
      console.error('Error deleting content:', error);
      toast({
        title: "Error",
        description: "Failed to delete scheduled content",
        variant: "destructive",
      });
    }
  };

  const handleContentSelection = (contentId: string) => {
    const content = availableContent.find(c => c.id === contentId);
    if (content) {
      setSelectedContent(contentId);
      setPlatformContent(content.ai_generated_content || '');
    }
  };

  const handlePlatformSelection = (platform: string) => {
    setSelectedPlatform(platform);
    
    // Auto-suggest optimal time
    const optimalTimes = OPTIMAL_TIMES[platform as keyof typeof OPTIMAL_TIMES];
    if (optimalTimes?.length > 0) {
      setScheduledTime(optimalTimes[0]);
    }
  };

  const getPlatformIcon = (platform: string) => {
    const platformData = PLATFORMS.find(p => p.id === platform);
    const IconComponent = platformData?.icon || Clock;
    return <IconComponent className="h-4 w-4" style={{ color: platformData?.color }} />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'published':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Pause className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
      scheduled: "secondary",
      published: "default",
      failed: "destructive",
      cancelled: "outline"
    };
    
    return (
      <Badge variant={variants[status] || "outline"} className="flex items-center space-x-1">
        {getStatusIcon(status)}
        <span className="capitalize">{status}</span>
      </Badge>
    );
  };

  const filteredContent = scheduledContent.filter(content => {
    if (statusFilter !== 'all' && content.status !== statusFilter) return false;
    if (platformFilter !== 'all' && content.platform !== platformFilter) return false;
    return true;
  });

  const getContentForDate = (date: Date) => {
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);
    
    return filteredContent.filter(content => {
      const contentDate = new Date(content.scheduled_for);
      return isAfter(contentDate, dayStart) && isBefore(contentDate, dayEnd);
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5" />
            <span>Content Scheduler</span>
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
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5" />
                <span>Content Scheduler</span>
              </CardTitle>
              <CardDescription>
                Schedule and manage your content across platforms
              </CardDescription>
            </div>
            
            <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Schedule Content</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Schedule New Content</DialogTitle>
                  <DialogDescription>
                    Select content from your library and schedule it for publishing
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Content Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="content">Select Content</Label>
                    <Select value={selectedContent} onValueChange={handleContentSelection}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose content to schedule" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableContent.map((content) => (
                          <SelectItem key={content.id} value={content.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{content.title}</span>
                              <span className="text-sm text-muted-foreground">
                                {content.content_type} • {content.estimated_word_count} words
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Platform Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="platform">Platform</Label>
                    <Select value={selectedPlatform} onValueChange={handlePlatformSelection}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        {PLATFORMS.map((platform) => (
                          <SelectItem key={platform.id} value={platform.id}>
                            <div className="flex items-center space-x-2">
                              <platform.icon className="h-4 w-4" style={{ color: platform.color }} />
                              <span>{platform.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {platform.limit} chars
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date and Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !selectedDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            disabled={(date) => isBefore(date, startOfDay(new Date()))}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="time">Time</Label>
                      <Input
                        id="time"
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                      />
                      {selectedPlatform && OPTIMAL_TIMES[selectedPlatform as keyof typeof OPTIMAL_TIMES] && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className="text-xs text-muted-foreground">Optimal:</span>
                          {OPTIMAL_TIMES[selectedPlatform as keyof typeof OPTIMAL_TIMES].map((time) => (
                            <Button
                              key={time}
                              variant="outline"
                              size="sm"
                              className="h-6 text-xs"
                              onClick={() => setScheduledTime(time)}
                            >
                              {time}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Platform Content */}
                  <div className="space-y-2">
                    <Label htmlFor="platform-content">Platform Content</Label>
                    <Textarea
                      id="platform-content"
                      placeholder="Customize content for this platform..."
                      value={platformContent}
                      onChange={(e) => setPlatformContent(e.target.value)}
                      rows={4}
                    />
                    {selectedPlatform && (
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>
                          {platformContent.length} / {PLATFORMS.find(p => p.id === selectedPlatform)?.limit} characters
                        </span>
                        {platformContent.length > (PLATFORMS.find(p => p.id === selectedPlatform)?.limit || 0) && (
                          <span className="text-red-500">Character limit exceeded</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={scheduleContent}>
                      Schedule Content
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as 'calendar' | 'list')}>
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="calendar">Calendar View</TabsTrigger>
                <TabsTrigger value="list">List View</TabsTrigger>
              </TabsList>

              <div className="flex items-center space-x-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={platformFilter} onValueChange={setPlatformFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Platforms</SelectItem>
                    {PLATFORMS.map((platform) => (
                      <SelectItem key={platform.id} value={platform.id}>
                        {platform.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <Filter className="h-4 w-4" />
                  <span>{filteredContent.length} items</span>
                </div>
              </div>
            </div>

            <TabsContent value="calendar" className="space-y-4">
              <Calendar
                mode="single"
                className="rounded-md border"
                components={{
                  Day: ({ date, ...props }) => {
                    const dayContent = getContentForDate(date);
                    const hasContent = dayContent.length > 0;
                    
                    return (
                      <div {...props} className={cn(
                        "relative p-2 text-center text-sm",
                        hasContent && "bg-primary/10 font-medium"
                      )}>
                        <div>{format(date, 'd')}</div>
                        {hasContent && (
                          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                            <div className="w-1 h-1 bg-primary rounded-full"></div>
                          </div>
                        )}
                      </div>
                    );
                  }
                }}
              />
            </TabsContent>

            <TabsContent value="list" className="space-y-4">
              {filteredContent.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No scheduled content</h3>
                  <p className="text-muted-foreground">
                    {scheduledContent.length === 0 
                      ? "Start scheduling content to see it here"
                      : "Try adjusting your filters"
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredContent.map((item) => (
                    <Card key={item.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              {getPlatformIcon(item.platform)}
                              <h4 className="font-semibold">
                                {item.content_suggestions?.title || 'Untitled Content'}
                              </h4>
                              {getStatusBadge(item.status)}
                            </div>
                            
                            <div className="text-sm text-muted-foreground mb-2">
                              <div className="flex items-center space-x-4">
                                <span className="flex items-center space-x-1">
                                  <CalendarIcon className="h-3 w-3" />
                                  <span>{format(new Date(item.scheduled_for), 'PPP')}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{format(new Date(item.scheduled_for), 'p')}</span>
                                </span>
                              </div>
                            </div>

                            {item.platform_content && (
                              <p className="text-sm line-clamp-2 mb-2">
                                {item.platform_content}
                              </p>
                            )}

                            {item.error_message && (
                              <div className="bg-red-50 border border-red-200 rounded p-2 mt-2">
                                <p className="text-sm text-red-600">{item.error_message}</p>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center space-x-2 ml-4">
                            {item.status === 'scheduled' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateContentStatus(item.id, 'published')}
                                >
                                  <Play className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateContentStatus(item.id, 'cancelled')}
                                >
                                  <Pause className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            
                            {item.status === 'failed' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateContentStatus(item.id, 'scheduled')}
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            )}

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteScheduledContent(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};