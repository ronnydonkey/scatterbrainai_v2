import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';

import { Sparkles, Brain, Zap } from 'lucide-react';

interface LandingHeroProps {
  demoText: string;
  setDemoText: (text: string) => void;
  handleDemo: () => void;
  isProcessing: boolean;
}

export function LandingHero({ demoText, setDemoText, handleDemo, isProcessing }: LandingHeroProps) {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Neural Background Animation */}
      <div className="absolute inset-0 opacity-20">
        <div className="neural-network-bg h-full w-full" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Headlines */}
          <div className="space-y-6 mb-12">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent leading-tight">
              A method for your madness
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Transform scattered thoughts into structured insights. Your chaos becomes clarity.
            </p>
          </div>

          {/* Demo Input */}
          <Card className="max-w-2xl mx-auto shadow-xl border-primary/20 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="flex items-center justify-center space-x-2 text-primary mb-4">
                  <Brain className="w-5 h-5" />
                  <span className="font-medium">Try it now</span>
                  <Sparkles className="w-5 h-5" />
                </div>
                
                <Textarea
                  placeholder="Drop your scattered thoughts here... voice memos, meeting notes, random ideas..."
                  value={demoText}
                  onChange={(e) => setDemoText(e.target.value)}
                  className="min-h-32 resize-none border-primary/20 focus:border-primary/40 text-base"
                  disabled={isProcessing}
                />
                
                <Button 
                  onClick={handleDemo}
                  disabled={!demoText.trim() || isProcessing}
                  className="w-full py-6 text-lg font-medium bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300"
                >
                  {isProcessing ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Finding the method...</span>
                      <Zap className="w-5 h-5 animate-pulse" />
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Brain className="w-5 h-5" />
                      <span>Unlock My Insights</span>
                      <Sparkles className="w-5 h-5" />
                    </div>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Value Props */}
          <div className="grid md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
            {[
              { icon: Brain, title: "Neural Processing", desc: "AI finds patterns in your chaos" },
              { icon: Zap, title: "Instant Clarity", desc: "Seconds to structured insights" },
              { icon: Sparkles, title: "Actionable Results", desc: "Clear next steps, not more confusion" }
            ].map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="bg-gradient-to-br from-card/50 to-card/30 border-primary/10 hover:border-primary/20 transition-colors">
                <CardContent className="p-6 text-center">
                  <Icon className="w-8 h-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional CTA for Demo */}
          <div className="mt-12">
            <p className="text-muted-foreground mb-4">See the magic in action</p>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/gallery'}
              className="border-primary/30 text-primary hover:bg-primary/10"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Explore Examples
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}