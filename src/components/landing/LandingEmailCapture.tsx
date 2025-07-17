import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Brain, Sparkles, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface LandingEmailCaptureProps {
  demoText: string;
  onEmailSubmitted: () => void;
}

export function LandingEmailCapture({ demoText, onEmailSubmitted }: LandingEmailCaptureProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setIsSigningUp(true);
    
    try {
      const { error } = await signUp(email, password);
      
      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('Email already exists. Redirecting to sign in...');
          setTimeout(() => navigate('/auth'), 1000);
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success('Account created! Revealing your insights...');
        setTimeout(onEmailSubmitted, 1000);
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSigningUp(false);
    }
  };

  return (
    <section className="py-16 bg-gradient-to-br from-primary/10 to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Teaser Report Preview */}
          <Card className="border-primary/20 shadow-xl bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent mb-4">
                  Your Method Preview
                </h2>
                <p className="text-muted-foreground text-lg">
                  Here's a glimpse of what we found in your thoughts...
                </p>
              </div>
              
              {/* Teaser Insights */}
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-primary">Key Patterns Detected</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-primary/5 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-sm">Strategic thinking patterns identified</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-primary/5 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-sm">Action-oriented mindset detected</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-primary/5 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-sm">Innovation opportunities found</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-primary">Ready Actions</h3>
                  <div className="space-y-3">
                    <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                      <div className="font-medium mb-1">Priority Focus Area</div>
                      <div className="text-sm text-muted-foreground">Your thoughts reveal a clear direction...</div>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                      <div className="font-medium mb-1">Next Steps Mapped</div>
                      <div className="text-sm text-muted-foreground">We've organized your ideas into...</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Blur Effect for Teaser */}
              <div className="relative">
                <div className="p-6 bg-gradient-to-br from-card/50 to-primary/10 rounded-lg border border-primary/20">
                  <h3 className="text-xl font-semibold mb-4">Full Analysis Report</h3>
                  <div className="space-y-3 relative">
                    <div className="h-4 bg-gradient-to-r from-primary/20 to-primary/10 rounded"></div>
                    <div className="h-4 bg-gradient-to-r from-primary/15 to-primary/5 rounded w-4/5"></div>
                    <div className="h-4 bg-gradient-to-r from-primary/10 to-transparent rounded w-3/5"></div>
                    
                    {/* Blur overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary mb-2">🔒</div>
                        <div className="text-sm font-medium">Unlock your complete method</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Email Capture */}
          <Card className="border-primary/30 shadow-2xl bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
            <CardHeader className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <Brain className="w-6 h-6 text-primary" />
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              
              <CardTitle className="text-2xl">
                <span className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  Ready to See Everything?
                </span>
              </CardTitle>
              
              <p className="text-muted-foreground leading-relaxed">
                Create your free account to unlock the complete analysis, personalized action plan, and content suggestions.
              </p>
              
              <div className="flex items-center justify-center space-x-4 text-sm text-primary">
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4" />
                  <span>Full insights report</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4" />
                  <span>Content suggestions</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4" />
                  <span>Action roadmap</span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 border-primary/20 focus:border-primary/40"
                    disabled={isSigningUp}
                    required
                  />
                </div>
                
                <div>
                  <Input
                    type="password"
                    placeholder="Create a password (min 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 border-primary/20 focus:border-primary/40"
                    disabled={isSigningUp}
                    minLength={6}
                    required
                  />
                </div>
                
                <Button 
                  type="submit"
                  disabled={!email.trim() || !password.trim() || isSigningUp}
                  className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-lg font-medium"
                >
                  {isSigningUp ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating account...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>Show Me My Method</span>
                      <Sparkles className="w-5 h-5" />
                    </div>
                  )}
                </Button>
              </form>
              
              <div className="text-center space-y-2">
                <p className="text-xs text-muted-foreground">
                  Already have an account?{' '}
                  <button 
                    onClick={() => navigate('/auth')}
                    className="text-primary hover:underline"
                  >
                    Sign in here
                  </button>
                </p>
                <p className="text-xs text-muted-foreground">
                  Free forever • No spam • Unsubscribe anytime
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}