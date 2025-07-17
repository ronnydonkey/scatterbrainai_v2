import { ArrowRight, Sparkles, Star, TrendingUp, Users, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function LandingSocialProof() {
  const metrics = [
    { icon: Users, value: "10K+", label: "Thoughts Organized" },
    { icon: Zap, value: "3.2s", label: "Average Processing Time" },
    { icon: Star, value: "4.9", label: "User Rating" },
    { icon: TrendingUp, value: "89%", label: "Users Find Clarity" }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Product Manager",
      content: "Finally found a way to turn my chaotic brainstorming sessions into actual strategy. Game changer.",
      avatar: "🚀"
    },
    {
      name: "Marcus Rodriguez", 
      role: "Creative Director",
      content: "My scattered creative ideas now have structure. It's like having a personal insight assistant.",
      avatar: "🎨"
    },
    {
      name: "Dr. Emily Watson",
      role: "Researcher",
      content: "Transforms hours of research notes into clear, actionable findings. Incredible time saver.",
      avatar: "🔬"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-background/50 to-primary/5">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Trusted by Creative Minds
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands who've found their method in the madness
          </p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {metrics.map((metric) => (
            <Card key={metric.label} className="bg-card/50 backdrop-blur-sm border-border/50 text-center">
              <CardContent className="p-6">
                <metric.icon className="w-8 h-8 mx-auto mb-3 text-primary" />
                <div className="text-3xl font-bold text-foreground mb-1">{metric.value}</div>
                <div className="text-sm text-muted-foreground">{metric.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="text-2xl">{testimonial.avatar}</div>
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-muted-foreground italic">"{testimonial.content}"</p>
                <div className="flex mt-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Ready to transform your scattered thoughts?
              </h3>
              <p className="text-muted-foreground mb-6">
                Join the creative minds who've found clarity in their chaos. Start your free trial today.
              </p>
              <Button size="lg" className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                Start Your Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}