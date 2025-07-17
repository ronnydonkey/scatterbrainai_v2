import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Mail, Sparkles, Check } from 'lucide-react';

export function LandingSignup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    
    try {
      const { error } = await signUp(email, password);
      if (!error) {
        toast({
          title: "Welcome to Scatterbrain!",
          description: "Check your email to verify your account and start synthesizing.",
        });
      }
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    "3 free syntheses daily",
    "Full insight viewing & export", 
    "Basic neural templates",
    "Mobile & desktop access"
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Value Proposition */}
            <div className="space-y-6">
              <div>
                <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                  Free Trial • No Credit Card
                </Badge>
                <h2 className="text-4xl font-bold mb-4">
                  Ready to organize your mind?
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Join thousands of scattered thinkers who've found clarity. Start with 3 free syntheses and experience the magic of neural organization.
                </p>
              </div>

              {/* Features List */}
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <p className="text-sm text-muted-foreground">
                  Already have scattered thoughts to organize? 
                  <Button 
                    variant="link" 
                    className="p-0 h-auto ml-1 text-primary"
                    onClick={() => navigate('/auth')}
                  >
                    Sign in here
                  </Button>
                </p>
              </div>
            </div>

            {/* Right: Signup Form */}
            <Card className="shadow-xl border-primary/20 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <Sparkles className="w-8 h-8 mx-auto mb-3 text-primary" />
                  <h3 className="text-xl font-semibold mb-2">Start Your Free Trial</h3>
                  <p className="text-sm text-muted-foreground">Begin organizing your thoughts in minutes</p>
                </div>

                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      className="border-primary/20 focus:border-primary/40"
                      required
                    />
                  </div>
                  
                  <div>
                    <Input
                      type="password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      className="border-primary/20 focus:border-primary/40"
                      required
                      minLength={6}
                    />
                  </div>

                  <Button 
                    type="submit"
                    disabled={!email || !password || isLoading}
                    className="w-full py-6 text-base font-medium bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Creating account...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span>Start Free Trial</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                  </Button>
                </form>

                <div className="mt-6 pt-6 border-t border-border/50">
                  <Button 
                    variant="outline" 
                    className="w-full border-primary/20 hover:border-primary/40"
                    onClick={() => navigate('/auth')}
                  >
                    Continue with Google
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center mt-4 leading-relaxed">
                  By signing up, you agree to our Terms of Service and Privacy Policy. 
                  Your thoughts remain private and secure.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}