import { Eye, MessageSquare, TrendingUp, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

export function MiniGalleryPreview() {
  const sampleInsights = [
    {
      title: "Product Strategy Deep Dive",
      type: "Meeting Notes",
      actions: 5,
      timeAgo: "2 hours ago",
      theme: "primary"
    },
    {
      title: "Creative Writing Session", 
      type: "Voice Memo",
      actions: 3,
      timeAgo: "Yesterday",
      theme: "secondary"
    },
    {
      title: "Business Model Brainstorm",
      type: "Random Thoughts",
      actions: 7,
      timeAgo: "3 days ago", 
      theme: "accent"
    }
  ];

  return (
    <div className="relative">
      {/* Header */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-foreground mb-2">Your Insight Gallery</h3>
        <p className="text-sm text-muted-foreground">Every thought becomes an organized, actionable insight</p>
      </div>

      {/* Mini Gallery Grid */}
      <div className="grid gap-4 max-w-md mx-auto">
        {sampleInsights.map((insight, index) => (
          <motion.div
            key={insight.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-card/60 to-card/40 border-border/30 hover:border-primary/30 transition-all duration-300 cursor-pointer group">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      insight.theme === 'primary' ? 'bg-primary' : 
                      insight.theme === 'secondary' ? 'bg-blue-500' : 'bg-green-500'
                    }`} />
                    <span className="text-xs text-muted-foreground">{insight.timeAgo}</span>
                  </div>
                  <Eye className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <h4 className="font-semibold text-sm text-foreground mb-2 line-clamp-1">
                  {insight.title}
                </h4>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                    {insight.type}
                  </span>
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <Zap className="w-3 h-3" />
                    <span>{insight.actions} actions</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Floating Elements */}
      <div className="absolute -top-4 -right-4 w-8 h-8 bg-primary/20 rounded-full animate-pulse" />
      <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-primary/30 rounded-full animate-pulse delay-1000" />
      
      {/* Connection Lines */}
      <svg className="absolute inset-0 pointer-events-none opacity-20" width="100%" height="100%">
        <defs>
          <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="currentColor" className="text-primary/50" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>
    </div>
  );
}