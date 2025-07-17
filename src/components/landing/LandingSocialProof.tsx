import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Brain, Users, TrendingUp } from 'lucide-react';

export function LandingSocialProof() {
  const testimonials = [
    {
      quote: "Finally, my ADHD brain feels organized. Scatterbrain turns my chaos into clarity.",
      author: "Sarah K.",
      role: "Creative Director",
      rating: 5
    },
    {
      quote: "Like having a thought translator in my pocket. My voice memos actually become useful insights.",
      author: "Marcus R.", 
      role: "Startup Founder",
      rating: 5
    },
    {
      quote: "Turns my scattered meeting notes into actionable plans. Game changer for productivity.",
      author: "Jennifer L.",
      role: "Product Manager", 
      rating: 5
    }
  ];

  const stats = [
    { icon: Brain, label: "Insights Created", value: "10,000+", subtitle: "This week" },
    { icon: Users, label: "Active Thinkers", value: "2,000+", subtitle: "Finding clarity" },
    { icon: TrendingUp, label: "Success Rate", value: "94%", subtitle: "User satisfaction" }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Stats Row */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {stats.map(({ icon: Icon, label, value, subtitle }) => (
              <Card key={label} className="text-center border-primary/10 hover:border-primary/20 transition-colors">
                <CardContent className="p-6">
                  <Icon className="w-8 h-8 mx-auto mb-3 text-primary" />
                  <div className="text-3xl font-bold text-primary mb-1">{value}</div>
                  <div className="font-medium text-foreground">{label}</div>
                  <div className="text-sm text-muted-foreground">{subtitle}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Testimonials */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What Scattered Thinkers Say</h2>
            <p className="text-muted-foreground">Real feedback from users finding clarity</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-primary/10 hover:border-primary/20 transition-colors">
                <CardContent className="p-6">
                  {/* Rating Stars */}
                  <div className="flex space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>

                  {/* Quote */}
                  <blockquote className="text-sm leading-relaxed mb-4 italic">
                    "{testimonial.quote}"
                  </blockquote>

                  {/* Author */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">{testimonial.author}</div>
                      <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                    </div>
                    <Badge variant="secondary" className="text-xs">Verified</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="mt-16 flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full" />
              </div>
              <span>Privacy First</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full" />
              </div>
              <span>SOC 2 Compliant</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full" />
              </div>
              <span>GDPR Ready</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}