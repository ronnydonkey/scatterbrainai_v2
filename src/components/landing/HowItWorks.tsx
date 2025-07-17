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

        {/* Main Content Grid */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            
            {/* Step 1: Neural Processing */}
            <div className="lg:col-span-1 space-y-6">
              <div className="text-center lg:text-left">
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg mx-auto lg:mx-0 mb-4">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">Neural Processing</h3>
                <p className="text-muted-foreground text-sm">AI finds patterns in your chaos</p>
              </div>
              
              <Card className="bg-card/40 border-border/30">
                <CardContent className="p-4">
                  <div className="text-xs text-primary/70 mb-3 font-medium">Raw Input</div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 bg-background/50 rounded">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-xs text-muted-foreground">Team sync notes...</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-background/50 rounded">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-xs text-muted-foreground">Coffee shop idea...</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-background/50 rounded">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-muted-foreground">Random thoughts...</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Step 2: Instant Clarity */}
            <div className="lg:col-span-1 space-y-6">
              <div className="text-center lg:text-left">
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg mx-auto lg:mx-0 mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">Instant Clarity</h3>
                <p className="text-muted-foreground text-sm">Seconds to structured insights</p>
              </div>
              
              <Card className="bg-card/40 border-border/30">
                <CardContent className="p-4">
                  <div className="text-xs text-primary/70 mb-3 font-medium">Analysis Complete</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-primary/10 rounded">
                      <span className="text-xs font-medium">Patterns Found</span>
                      <span className="text-xs bg-primary/20 px-2 py-1 rounded">3</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-primary/10 rounded">
                      <span className="text-xs font-medium">Action Items</span>
                      <span className="text-xs bg-primary/20 px-2 py-1 rounded">7</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-primary/10 rounded">
                      <span className="text-xs font-medium">Key Themes</span>
                      <span className="text-xs bg-primary/20 px-2 py-1 rounded">2</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Step 3: Actionable Results */}
            <div className="lg:col-span-1 space-y-6">
              <div className="text-center lg:text-left">
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg mx-auto lg:mx-0 mb-4">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">Actionable Results</h3>
                <p className="text-muted-foreground text-sm">Clear next steps, not more confusion</p>
              </div>
              
              <Card className="bg-card/40 border-border/30">
                <CardContent className="p-4">
                  <div className="text-xs text-primary/70 mb-3 font-medium">Ready to Execute</div>
                  <div className="space-y-2">
                    <div className="p-2 bg-background/50 rounded">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs font-medium">Schedule team review</span>
                      </div>
                      <span className="text-xs text-muted-foreground">High Priority</span>
                    </div>
                    <div className="p-2 bg-background/50 rounded">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-xs font-medium">Research competitors</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Medium Priority</span>
                    </div>
                    <div className="p-2 bg-background/50 rounded">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-xs font-medium">Draft proposal</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Low Priority</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Step 4: Your Insight Gallery */}
            <div className="lg:col-span-1 space-y-6">
              <div className="text-center lg:text-left">
                <h3 className="text-2xl font-bold text-foreground mb-2">Your Insight Gallery</h3>
                <p className="text-muted-foreground text-sm">Every thought becomes an organized, actionable insight</p>
              </div>
              
              <div className="space-y-3">
                <Card className="bg-card/60 border-border/40 hover:bg-card/80 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm font-medium">Product Strategy</span>
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">Meeting Notes</div>
                    <div className="text-xs text-muted-foreground">5 actions • 2 hours ago</div>
                  </CardContent>
                </Card>

                <Card className="bg-card/60 border-border/40 hover:bg-card/80 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium">Creative Writing</span>
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">Voice Memo</div>
                    <div className="text-xs text-muted-foreground">3 actions • Yesterday</div>
                  </CardContent>
                </Card>

                <Card className="bg-card/60 border-border/40 hover:bg-card/80 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">Business Model</span>
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">Random Thoughts</div>
                    <div className="text-xs text-muted-foreground">7 actions • 3 days ago</div>
                  </CardContent>
                </Card>
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