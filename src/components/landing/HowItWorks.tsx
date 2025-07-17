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
    <section className="py-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            From chaos to clarity in three simple steps. See how Scatterbrain transforms your scattered thoughts into actionable insights.
          </p>
        </div>

        {/* Interactive Steps */}
        <div className="max-w-7xl mx-auto">
          {/* Step Navigation */}
          <div className="flex justify-center mb-16">
            <div className="flex items-center space-x-6 bg-card/40 backdrop-blur-sm rounded-full p-3 border border-border/30 shadow-lg">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => setActiveStep(step.id)}
                    className={`flex items-center space-x-3 px-6 py-3 rounded-full transition-all duration-300 ${
                      activeStep === step.id 
                        ? 'bg-primary text-primary-foreground shadow-lg scale-105' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/50 hover:scale-102'
                    }`}
                  >
                    <step.icon className="w-5 h-5" />
                    <span className="text-sm font-medium hidden sm:inline">Step {step.id}</span>
                  </button>
                  {index < steps.length - 1 && (
                    <ArrowRight className="w-5 h-5 text-muted-foreground/60 mx-3" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Active Step Content */}
          {steps.map((step) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ 
                opacity: activeStep === step.id ? 1 : 0,
                y: activeStep === step.id ? 0 : 30,
                display: activeStep === step.id ? 'block' : 'none'
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="mb-12"
            >
              <Card className="bg-gradient-to-br from-card/60 to-card/30 border-primary/20 backdrop-blur-sm shadow-xl">
                <CardContent className="p-10 lg:p-12">
                  <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Content */}
                    <div className="space-y-8">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                          <step.icon className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-primary font-semibold mb-2 tracking-wide uppercase">
                            Step {step.id}
                          </div>
                          <h3 className="text-3xl lg:text-4xl font-bold text-foreground mb-3 leading-tight">
                            {step.title}
                          </h3>
                        </div>
                      </div>
                      
                      <p className="text-xl text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>

                      <Button 
                        variant="outline"
                        size="lg"
                        className="border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
                      >
                        <Play className="w-5 h-5 mr-3" />
                        {step.demo}
                      </Button>
                    </div>

                    {/* Visual */}
                    <div className="relative">
                      <div className="bg-gradient-to-br from-background/90 to-background/70 backdrop-blur-sm rounded-2xl border border-border/40 p-8 shadow-lg min-h-[280px] flex items-center justify-center">
                        {step.visual}
                      </div>
                      
                      {/* Decorative Elements */}
                      <div className="absolute -top-3 -right-3 w-6 h-6 bg-primary/40 rounded-full animate-ping" />
                      <div className="absolute -bottom-3 -left-3 w-4 h-4 bg-primary/60 rounded-full animate-pulse delay-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
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