import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Play, Brain } from 'lucide-react';

interface DemoModeButtonProps {
  onEnterDemo: () => void;
  className?: string;
}

export function DemoModeButton({ onEnterDemo, className = "" }: DemoModeButtonProps) {
  return (
    <Card className={`bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 hover:border-primary/30 transition-all duration-300 ${className}`}>
      <CardContent className="p-6 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
        </div>
        
        <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
          See the Magic First
        </h3>
        
        <p className="text-muted-foreground mb-6 leading-relaxed">
          Explore Scatterbrain with realistic examples showing how scattered thoughts become clear insights, organized action items, and shareable content.
        </p>
        
        <Button 
          onClick={onEnterDemo}
          className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-medium px-6 py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <Play className="w-4 h-4 mr-2" />
          View Demo Gallery
          <Sparkles className="w-4 h-4 ml-2" />
        </Button>
        
        <p className="text-xs text-muted-foreground mt-3">
          No signup required • See real examples
        </p>
      </CardContent>
    </Card>
  );
}