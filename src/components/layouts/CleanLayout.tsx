import React from 'react';
import { CleanNavigation } from '@/components/ui/CleanNavigation';
import { NeuralAnimation } from '@/components/effects/NeuralAnimation';

interface CleanLayoutProps {
  children: React.ReactNode;
}

export const CleanLayout: React.FC<CleanLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
      <NeuralAnimation />
      <CleanNavigation />
      <main className="relative z-10 fade-in">
        {children}
      </main>
    </div>
  );
};