import { Brain, Zap, Star, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function HowItWorks() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            From chaos to clarity in three simple steps. See how Scatterbrain transforms your scattered thoughts into actionable insights.
          </p>
        </div>

        {/* Main Content - 4 Vertical Columns */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            
            {/* Column 1: Neural Processing */}
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Brain className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">Neural Processing</h3>
                <p className="text-muted-foreground text-lg">AI finds patterns in your chaos</p>
              </div>
            </div>

            {/* Column 2: Instant Clarity */}
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">Instant Clarity</h3>
                <p className="text-muted-foreground text-lg">Seconds to structured insights</p>
              </div>
            </div>

            {/* Column 3: Actionable Results */}
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Star className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">Actionable Results</h3>
                <p className="text-muted-foreground text-lg">Clear next steps, not more confusion</p>
              </div>
            </div>

            {/* Column 4: Your Insight Gallery */}
            <div className="space-y-6">
              <div className="text-center lg:text-left">
                <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">Your Insight Gallery</h3>
                <p className="text-muted-foreground text-lg mb-8">Every thought becomes an organized, actionable insight</p>
              </div>
              
              {/* Gallery Items */}
              <div className="space-y-4">
                {/* Product Strategy */}
                <div className="bg-card/60 border border-border/40 rounded-lg p-4 hover:bg-card/80 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                    <span className="text-muted-foreground text-sm">2 hours ago</span>
                  </div>
                  <h4 className="font-semibold text-foreground mb-1">Product Strategy</h4>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-primary">Meeting Notes</span>
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">5 actions</span>
                    </div>
                  </div>
                </div>

                {/* Creative Writing */}
                <div className="bg-card/60 border border-border/40 rounded-lg p-4 hover:bg-card/80 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-muted-foreground text-sm">Yesterday</span>
                  </div>
                  <h4 className="font-semibold text-foreground mb-1">Creative Writing</h4>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-primary">Voice Memo</span>
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">3 actions</span>
                    </div>
                  </div>
                </div>

                {/* Business Model */}
                <div className="bg-card/60 border border-border/40 rounded-lg p-4 hover:bg-card/80 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-muted-foreground text-sm">3 days ago</span>
                  </div>
                  <h4 className="font-semibold text-foreground mb-1">Business Model</h4>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-primary">Random Thoughts</span>
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">7 actions</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20">
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Ready to see the magic yourself?
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 px-8 py-4 text-lg">
              <Brain className="w-6 h-6 mr-3" />
              Start Free Trial
            </Button>
            <Button variant="outline" size="lg" className="border-primary/30 text-primary hover:bg-primary/10 px-8 py-4 text-lg">
              <Sparkles className="w-6 h-6 mr-3" />
              View Demo Gallery
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}