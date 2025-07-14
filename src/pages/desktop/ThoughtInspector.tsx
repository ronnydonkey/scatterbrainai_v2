import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  SortAsc, 
  Eye, 
  Brain, 
  MessageSquare,
  Tag,
  Calendar,
  BarChart3,
  FileText,
  Lightbulb,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Thought {
  id: string;
  title: string;
  content: string;
  mood: string;
  tags: string[];
  createdAt: string;
  processed: boolean;
  insights: number;
  authenticity: number;
  engagement: number;
}

const mockThoughts: Thought[] = [
  {
    id: '1',
    title: 'Sustainable Tech Innovation',
    content: 'The intersection of sustainability and technology presents unique opportunities for creative disruption...',
    mood: 'inspired',
    tags: ['sustainability', 'technology', 'innovation'],
    createdAt: '2024-01-15T10:30:00Z',
    processed: true,
    insights: 8,
    authenticity: 94,
    engagement: 87
  },
  {
    id: '2',
    title: 'Future of Remote Collaboration',
    content: 'As remote work evolves, the tools and methods for collaboration must adapt to human psychology...',
    mood: 'analytical',
    tags: ['remote-work', 'collaboration', 'psychology'],
    createdAt: '2024-01-14T15:45:00Z',
    processed: true,
    insights: 12,
    authenticity: 91,
    engagement: 92
  },
  {
    id: '3',
    title: 'AI Ethics in Creative Work',
    content: 'The ethical implications of AI in creative processes require careful consideration of human agency...',
    mood: 'contemplative',
    tags: ['ai-ethics', 'creativity', 'philosophy'],
    createdAt: '2024-01-13T09:15:00Z',
    processed: false,
    insights: 0,
    authenticity: 0,
    engagement: 0
  }
];

export default function ThoughtInspector() {
  const [selectedThought, setSelectedThought] = useState<Thought | null>(mockThoughts[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [filterBy, setFilterBy] = useState('all');

  const filteredThoughts = mockThoughts.filter(thought =>
    thought.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    thought.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    thought.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const sortedThoughts = [...filteredThoughts].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'authenticity':
        return b.authenticity - a.authenticity;
      case 'engagement':
        return b.engagement - a.engagement;
      default:
        return 0;
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'inspired': return 'bg-stardust-gold/20 text-stardust-gold';
      case 'analytical': return 'bg-neural-blue/20 text-neural-blue';
      case 'contemplative': return 'bg-cosmic-purple/20 text-cosmic-purple';
      default: return 'bg-muted/20 text-muted-foreground';
    }
  };

  return (
    <div className="h-full flex">
      {/* Left Panel - Thought List */}
      <div className="w-1/2 border-r border-border/50 flex flex-col">
        {/* Search and Filters */}
        <div className="p-4 border-b border-border/30 space-y-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search thoughts, tags, content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Sort by Date</SelectItem>
                <SelectItem value="authenticity">Sort by Authenticity</SelectItem>
                <SelectItem value="engagement">Sort by Engagement</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Thoughts</SelectItem>
                <SelectItem value="processed">Processed</SelectItem>
                <SelectItem value="unprocessed">Unprocessed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Thought List */}
        <div className="flex-1 neural-scroll overflow-y-auto">
          <div className="p-2 space-y-2">
            {sortedThoughts.map((thought, index) => (
              <motion.div
                key={thought.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => setSelectedThought(thought)}
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                  selectedThought?.id === thought.id
                    ? 'bg-primary/10 border-primary/30 shadow-glow-sm'
                    : 'bg-card/50 border-border/30 hover:bg-card/80'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-sm line-clamp-1">{thought.title}</h3>
                    <div className="flex items-center space-x-1">
                      {thought.processed && (
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                      )}
                      <Badge className={getMoodColor(thought.mood)} variant="secondary">
                        {thought.mood}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {thought.content}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(thought.createdAt)}</span>
                    </div>
                    {thought.processed && (
                      <div className="flex items-center space-x-3">
                        <span>Auth: {thought.authenticity}%</span>
                        <span>Eng: {thought.engagement}%</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {thought.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Thought Detail */}
      <div className="w-1/2 flex flex-col">
        {selectedThought ? (
          <>
            {/* Detail Header */}
            <div className="p-6 border-b border-border/30">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">{selectedThought.title}</h1>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(selectedThought.createdAt)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{selectedThought.insights} insights</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getMoodColor(selectedThought.mood)}>
                      {selectedThought.mood}
                    </Badge>
                    {selectedThought.processed ? (
                      <Badge variant="default">Processed</Badge>
                    ) : (
                      <Badge variant="outline">Unprocessed</Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  {selectedThought.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Detail Content */}
            <div className="flex-1 neural-scroll overflow-y-auto">
              <Tabs defaultValue="content" className="h-full">
                <div className="p-6 pb-0">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="analysis">Analysis</TabsTrigger>
                    <TabsTrigger value="insights">Insights</TabsTrigger>
                    <TabsTrigger value="metrics">Metrics</TabsTrigger>
                  </TabsList>
                </div>

                <div className="p-6">
                  <TabsContent value="content" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                          <FileText className="h-5 w-5 mr-2" />
                          Original Thought
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {selectedThought.content}
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="analysis" className="space-y-4">
                    {selectedThought.processed ? (
                      <div className="space-y-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center text-lg">
                              <Brain className="h-5 w-5 mr-2" />
                              Neural Analysis
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="neural-card p-4">
                                <div className="text-2xl font-bold text-stardust-gold">
                                  {selectedThought.authenticity}%
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Voice Authenticity
                                </div>
                              </div>
                              <div className="neural-card p-4">
                                <div className="text-2xl font-bold text-neural-blue">
                                  {selectedThought.engagement}%
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Engagement Potential
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <Brain className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-semibold mb-2">Analysis Pending</h3>
                          <p className="text-muted-foreground mb-4">
                            This thought hasn't been processed yet. Start neural analysis to unlock insights.
                          </p>
                          <Button>
                            <Zap className="h-4 w-4 mr-2" />
                            Start Analysis
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="insights" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                          <Lightbulb className="h-5 w-5 mr-2" />
                          AI-Generated Insights
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedThought.processed ? (
                          <div className="space-y-3">
                            {Array.from({ length: selectedThought.insights }, (_, i) => (
                              <div key={i} className="p-3 rounded-lg bg-muted/20 border border-border/30">
                                <div className="font-medium text-sm mb-1">
                                  Insight #{i + 1}: Content Expansion Opportunity
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  This thought could be expanded into a comprehensive article about 
                                  {selectedThought.tags[i % selectedThought.tags.length]}.
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">
                            Insights will be generated after neural analysis is complete.
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="metrics" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                          <BarChart3 className="h-5 w-5 mr-2" />
                          Performance Metrics
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Metric</TableHead>
                              <TableHead>Value</TableHead>
                              <TableHead>Score</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell>Authenticity</TableCell>
                              <TableCell>{selectedThought.authenticity}%</TableCell>
                              <TableCell>
                                <Badge variant={selectedThought.authenticity > 90 ? "default" : "secondary"}>
                                  {selectedThought.authenticity > 90 ? "Excellent" : "Good"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Engagement Potential</TableCell>
                              <TableCell>{selectedThought.engagement}%</TableCell>
                              <TableCell>
                                <Badge variant={selectedThought.engagement > 85 ? "default" : "secondary"}>
                                  {selectedThought.engagement > 85 ? "High" : "Medium"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Content Depth</TableCell>
                              <TableCell>{selectedThought.content.length} chars</TableCell>
                              <TableCell>
                                <Badge variant="secondary">Detailed</Badge>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Eye className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select a Thought</h3>
              <p className="text-muted-foreground">
                Choose a thought from the list to view detailed analysis and insights.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}