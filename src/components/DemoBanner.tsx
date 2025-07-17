import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, RotateCcw, ArrowRight } from 'lucide-react';

interface DemoBannerProps {
  onStartFresh: () => void;
  onCreateAccount: () => void;
  className?: string;
}

export function DemoBanner({ onStartFresh, onCreateAccount, className = "" }: DemoBannerProps) {
  return (
    <Card className={`bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-primary/20 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-medium text-foreground">
                🎭 Demo Mode Active
              </p>
              <p className="text-sm text-muted-foreground">
                These are sample insights to showcase Scatterbrain's capabilities
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onStartFresh}
              className="border-primary/30 text-primary hover:bg-primary/10"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Start Fresh
            </Button>
            
            <Button
              size="sm"
              onClick={onCreateAccount}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white"
            >
              Create Account
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}