import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Brain, Sparkles, CheckCircle, Crown, Zap } from 'lucide-react';
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
        toast.success('Account created! Welcome to Scatterbrain!');
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
          
          {/* Pricing Banner */}
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary to-primary/80 text-white px-6 py-3 rounded-full shadow-lg">
              <Crown className="w-5 h-5" />
              <span className="font-bold text-lg">FREE 7-Day Trial!</span>
              <Zap className="w-5 h-5" />
            </div>
            <p className="text-muted-foreground mt-2 text-sm">
              Try everything for free • No credit card required • Cancel anytime
            </p>
          </div>
          
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
                  Start Your Free Trial
                </span>
              </CardTitle>
              
              <p className="text-muted-foreground leading-relaxed">
                Get instant access to your complete analysis and start transforming your thoughts into action.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-primary">
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4" />
                  <span>Full insights</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4" />
                  <span>Content library</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4" />
                  <span>Action plans</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4" />
                  <span>Trending topics</span>
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
                      <span>Start Free Trial</span>
                      <Sparkles className="w-5 h-5" />
                    </div>
                  )}
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/50" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or</span>
                  </div>
                </div>
                
                <Button 
                  type="button"
                  variant="outline"
                  disabled={isSigningUp}
                  className="w-full h-12 border-primary/20 hover:border-primary/40"
                  onClick={() => toast.info('Google sign-in coming soon!')}
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </div>
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
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-3 text-xs text-center">
                  <div className="font-medium text-primary mb-1">🎉 Free 7-Day Trial Includes:</div>
                  <div className="text-muted-foreground">
                    Unlimited thought analysis • Content generation • Action plans
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}