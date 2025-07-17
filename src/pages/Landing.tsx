import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { LandingHero } from '@/components/landing/LandingHero';
import { LandingDemo } from '@/components/landing/LandingDemo';
import { LandingSocialProof } from '@/components/landing/LandingSocialProof';
import { LandingSignup } from '@/components/landing/LandingSignup';
import { LandingEmailCapture } from '@/components/landing/LandingEmailCapture';
import { useAuth } from '@/hooks/useAuth';

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [demoText, setDemoText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showEmailCapture, setShowEmailCapture] = useState(false);

  // Redirect authenticated users to main app
  if (user) {
    navigate('/');
    return null;
  }

  const handleDemo = async () => {
    if (!demoText.trim()) return;
    
    setIsProcessing(true);
    
    // Simulate processing with beautiful animation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsProcessing(false);
    setShowEmailCapture(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary/60 flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-full" />
            </div>
            <span className="text-xl font-bold">Scatterbrain</span>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate('/auth')}
            className="border-primary/20 hover:border-primary/40"
          >
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <LandingHero 
        demoText={demoText}
        setDemoText={setDemoText}
        handleDemo={handleDemo}
        isProcessing={isProcessing}
      />

      {/* Email Capture */}
      {showEmailCapture && (
        <LandingEmailCapture 
          demoText={demoText}
          onEmailSubmitted={() => setShowResults(true)}
        />
      )}

      {/* Demo Results */}
      <LandingDemo 
        showResults={showResults}
        demoText={demoText}
      />

      {/* Social Proof */}
      <LandingSocialProof />

      {/* Signup CTA */}
      <LandingSignup />

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 Scatterbrain. Transform scattered thoughts into clear insights.</p>
        </div>
      </footer>
    </div>
  );
}