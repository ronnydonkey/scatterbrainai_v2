import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle, Target, Link2, ArrowRight } from 'lucide-react';

interface LandingDemoProps {
  showResults: boolean;
  demoText: string;
}

export function LandingDemo({ showResults, demoText }: LandingDemoProps) {
  const navigate = useNavigate();

  if (!showResults) return null;

  // Generate demo insights based on input length and content
  const insights = [
    "Your thoughts center around productivity optimization and creative workflow management",
    "Three distinct themes emerge: planning, execution, and reflection phases",
    "Strong connection between time management concerns and creative output goals"
  ];

  const actionItems = [
    "Create a structured daily review process",
    "Implement time-blocking for creative work", 
    "Set up a capture system for random ideas"
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-primary/5 to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Your Neural Analysis</h2>
            <p className="text-muted-foreground">Here's what our AI discovered in your thoughts</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Key Insights */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>Key Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {insights.map((insight, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <Badge variant="secondary" className="mt-1 text-xs">{index + 1}</Badge>
                    <p className="text-sm leading-relaxed">{insight}</p>
                  </div>
                ))}
                
                {/* Teaser blur effect */}
                <div className="relative mt-6 p-4 rounded-lg bg-gradient-to-r from-muted/50 to-muted/30 border border-dashed border-primary/30">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/80 to-background rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <EyeOff className="w-6 h-6 mx-auto mb-2 text-primary" />
                      <p className="text-sm font-medium">2 more insights discovered</p>
                      <p className="text-xs text-muted-foreground">Sign in to reveal</p>
                    </div>
                  </div>
                  <p className="text-sm opacity-30 blur-sm">Advanced pattern recognition reveals deeper connections between your creative processes and productivity cycles...</p>
                </div>
              </CardContent>
            </Card>

            {/* Action Items */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-primary" />
                  <span>Actionable Next Steps</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {actionItems.map((item, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                      <span className="text-xs font-medium text-primary">{index + 1}</span>
                    </div>
                    <p className="text-sm leading-relaxed">{item}</p>
                  </div>
                ))}

                {/* Connection patterns teaser */}
                <div className="mt-6 p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                  <div className="flex items-center space-x-2 mb-2">
                    <Link2 className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Pattern Connections</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">Found 3 key themes linking your ideas</p>
                  <div className="flex space-x-2">
                    <Badge variant="outline" className="text-xs">Productivity</Badge>
                    <Badge variant="outline" className="text-xs">Creativity</Badge>
                    <Badge variant="outline" className="text-xs opacity-50">+1 more</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Conversion CTA */}
          <Card className="mt-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-3">Unlock Your Complete Neural Map</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Get full insights, export capabilities, and unlimited syntheses. Join 2,000+ scattered thinkers finding clarity.
              </p>
              <div className="space-y-4">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/auth')}
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 px-8 py-6 text-lg"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <p className="text-xs text-muted-foreground">Your first 3 syntheses are free • No credit card required</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}