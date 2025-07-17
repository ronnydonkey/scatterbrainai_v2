import { useState } from 'react';
import { ArrowRight, Sparkles, Brain, Zap, FileText, Share2, CheckCircle, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { NeuralThinkingAnimation } from '@/components/ui/neural-thinking-animation';
import { motion } from 'framer-motion';

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    {
      id: 1,
      icon: FileText,
      title: "Drop in scattered thoughts",
      description: "Voice memos, meeting notes, random ideas - just dump everything in.",
      demo: "Try with Meeting Notes",
      visual: (
        <div className="bg-background/30 rounded-lg p-4 text-sm font-mono text-left">
          <div className="text-primary/60 mb-2">// Your raw thoughts:</div>
          <div className="text-muted-foreground leading-relaxed">
            Team sync - need to fix onboarding...<br/>
            Coffee shop idea keeps coming up...<br/>
            Random dream about flying library...
          </div>
        </div>
      )
    },
    {
      id: 2,
      icon: Brain,
      title: "AI synthesizes insights",
      description: "Our neural engine finds patterns, themes, and actionable items in seconds.",
      demo: "Neural Processing",
      visual: (
        <div className="flex items-center justify-center h-24">
          <NeuralThinkingAnimation size="sm" />
        </div>
      )
    },
    {
      id: 3,
      icon: Share2,
      title: "Organize in your gallery",
      description: "Beautiful, shareable insights you can actually use and build upon.",
      demo: "View Results",
      visual: (
        <div className="space-y-2">
          <div className="bg-primary/10 rounded-lg p-3 text-left">
            <div className="font-semibold text-sm mb-1">🎯 Product Strategy Session</div>
            <div className="text-xs text-muted-foreground">3 action items • 2 key quotes</div>
          </div>
          <div className="bg-primary/10 rounded-lg p-3 text-left">
            <div className="font-semibold text-sm mb-1">💡 Coffee Shop Business Idea</div>
            <div className="text-xs text-muted-foreground">5 action items • 1 key theme</div>
          </div>
        </div>
      )
    }
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From chaos to clarity in three simple steps. See how Scatterbrain transforms your scattered thoughts.
          </p>
        </div>

        {/* Interactive Steps */}
        <div className="max-w-6xl mx-auto">
          {/* Step Navigation */}
          <div className="flex justify-center mb-12">
            <div className="flex items-center space-x-4 bg-card/30 backdrop-blur-sm rounded-full p-2 border border-border/50">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => setActiveStep(step.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
                      activeStep === step.id 
                        ? 'bg-primary text-primary-foreground shadow-lg' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    }`}
                  >
                    <step.icon className="w-4 h-4" />
                    <span className="text-sm font-medium hidden sm:inline">{step.id}</span>
                  </button>
                  {index < steps.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-muted-foreground mx-2" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Active Step Content */}
          {steps.map((step) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: activeStep === step.id ? 1 : 0,
                y: activeStep === step.id ? 0 : 20,
                display: activeStep === step.id ? 'block' : 'none'
              }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              <Card className="bg-gradient-to-br from-card/50 to-card/30 border-primary/20 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    {/* Content */}
                    <div className="space-y-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary/80 rounded-lg flex items-center justify-center">
                          <step.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-foreground">{step.title}</h3>
                          <div className="text-sm text-primary font-medium">Step {step.id}</div>
                        </div>
                      </div>
                      
                      <p className="text-lg text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>

                      <Button 
                        variant="outline"
                        className="border-primary/30 text-primary hover:bg-primary/10"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {step.demo}
                      </Button>
                    </div>

                    {/* Visual */}
                    <div className="relative">
                      <div className="bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm rounded-xl border border-border/50 p-6">
                        {step.visual}
                      </div>
                      
                      {/* Decorative Elements */}
                      <div className="absolute -top-2 -right-2 w-4 h-4 bg-primary/40 rounded-full animate-ping" />
                      <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-primary/60 rounded-full animate-pulse delay-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-lg text-muted-foreground mb-6">
            Ready to see the magic yourself?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
              <Brain className="w-5 h-5 mr-2" />
              Start Free Trial
            </Button>
            <Button variant="outline" size="lg" className="border-primary/30 text-primary hover:bg-primary/10">
              <Sparkles className="w-5 h-5 mr-2" />
              View Demo Gallery
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}