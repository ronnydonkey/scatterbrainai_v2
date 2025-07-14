import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

export function NeuralHeroSection() {
  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4"
      >
        <div className="relative inline-block">
          <Brain className="h-16 w-16 text-primary mx-auto neural-pulse" />
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg animate-glow-pulse" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-plasma-pink bg-clip-text text-transparent">
          Neural Command Center
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your creative intelligence at work. Monitor, analyze, and optimize your AI-powered content creation processes.
        </p>
      </motion.div>
    </div>
  );
}