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
        <div className="max-w-2xl mx-auto">
          <Card className="border-primary/30 shadow-2xl bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
            <CardHeader className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <Brain className="w-6 h-6 text-primary" />
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              
              <CardTitle className="text-2xl">
                <span className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  Analysis Complete!
                </span>
              </CardTitle>
              
              <p className="text-muted-foreground leading-relaxed">
                Your thoughts have been processed and we've discovered some fascinating patterns. 
                Create a free account to unlock your personalized neural map.
              </p>
              
              <div className="flex items-center justify-center space-x-4 text-sm text-primary">
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4" />
                  <span>5 key insights found</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4" />
                  <span>7 action items identified</span>
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
                      <span>Reveal My Insights</span>
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
                  Free forever • No credit card required • Unsubscribe anytime
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}