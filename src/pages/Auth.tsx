import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTurnstile } from '@/hooks/useTurnstile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Brain, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  
  const TURNSTILE_SITE_KEY = '0x4AAAAAABlbYQOWR4osFhfH';
  
  
  const { containerRef, isLoaded, error: captchaError, reset } = useTurnstile(
    TURNSTILE_SITE_KEY,
    (token: string) => setCaptchaToken(token)
  );

  // Redirect if already authenticated
  if (user) {
    navigate('/');
    return null;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    console.log('Starting sign in process...');
    setLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      console.log('Sign in result:', { error });
      
      if (!error) {
        navigate('/');
      }
    } catch (err) {
      console.error('Sign in catch block:', err);
    }
    
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    if (!captchaToken) {
      toast({
        title: "Verification Required",
        description: "Please complete the security verification",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Verify captcha token first
      const { data: captchaData } = await supabase.functions.invoke('verify-turnstile', {
        body: { token: captchaToken }
      });
      
      if (!captchaData?.success) {
        toast({
          title: "Verification Failed",
          description: "Security verification failed. Please try again.",
          variant: "destructive",
        });
        reset();
        setCaptchaToken(null);
        setLoading(false);
        return;
      }
      
      // Proceed with signup if captcha is valid
      const { error } = await signUp(email, password, firstName, displayName);
      
      if (!error) {
        toast({
          title: "Account Created",
          description: "Please check your email to verify your account.",
        });
        // Reset form
        setEmail('');
        setPassword('');
        setFirstName('');
        setDisplayName('');
        setCaptchaToken(null);
        reset();
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: "Error",
        description: "An error occurred during signup. Please try again.",
        variant: "destructive",
      });
      reset();
      setCaptchaToken(null);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800/50 backdrop-blur-xl border-gray-700/50">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">ScatterBrain</CardTitle>
          </div>
          <CardDescription className="text-gray-300">
            AI-Powered Content Intelligence Platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-700/50">
              <TabsTrigger value="signin" className="text-gray-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="text-gray-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-300">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="first-name" className="text-gray-300">First Name</Label>
                  <Input
                    id="first-name"
                    type="text"
                    placeholder="Your first name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="display-name" className="text-gray-300">Display Name (Optional)</Label>
                  <Input
                    id="display-name"
                    type="text"
                    placeholder="Your display name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-signup" className="text-gray-300">Email</Label>
                  <Input
                    id="email-signup"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signup" className="text-gray-300">Password</Label>
                  <Input
                    id="password-signup"
                    type="password"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    required
                  />
                </div>
                
                {/* Turnstile Captcha */}
                <div className="space-y-2">
                  <Label className="text-gray-300 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Security Verification
                  </Label>
                  <div 
                    ref={containerRef} 
                    className="flex justify-center"
                  />
                  {captchaError && (
                    <p className="text-red-400 text-sm">{captchaError}</p>
                  )}
                  {!isLoaded && (
                    <p className="text-gray-400 text-sm text-center">Loading security verification...</p>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-purple-600 hover:bg-purple-700" 
                  disabled={loading || !captchaToken || !isLoaded}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign Up
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;