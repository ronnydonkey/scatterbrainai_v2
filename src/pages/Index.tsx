import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Bot, TrendingUp, Sparkles, Library } from 'lucide-react';
import { TrendingTopics } from '@/components/TrendingTopics';
import { ContentGenerator } from '@/components/ContentGenerator';
import { ContentLibrary } from '@/components/ContentLibrary';

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Bot className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">ScatterBrain AI</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {user.email}
            </span>
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">
              AI-Powered Content Intelligence
            </h2>
            <p className="text-xl text-muted-foreground">
              Generate authentic content with trend intelligence and voice preservation
            </p>
          </div>

          <Tabs defaultValue="trends" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="trends" className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Trending Topics</span>
              </TabsTrigger>
              <TabsTrigger value="generate" className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4" />
                <span>Content Generator</span>
              </TabsTrigger>
              <TabsTrigger value="library" className="flex items-center space-x-2">
                <Library className="h-4 w-4" />
                <span>Content Library</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="trends" className="space-y-6">
              <TrendingTopics />
            </TabsContent>

            <TabsContent value="generate" className="space-y-6">
              <ContentGenerator />
            </TabsContent>

            <TabsContent value="library" className="space-y-6">
              <ContentLibrary />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Index;
