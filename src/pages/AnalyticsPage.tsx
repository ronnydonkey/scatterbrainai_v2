import { motion } from 'framer-motion';
import { TrendingUp, Target, Zap, ArrowUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function AnalyticsPage() {
  return (
    <motion.div
      className="p-4 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Section */}
      <motion.div 
        className="text-center py-6"
        variants={itemVariants}
      >
        <h1 className="text-2xl font-bold mb-2 text-cosmic-light">
          What's Working?
        </h1>
        <p className="text-cosmic-muted">
          Your content performance at a glance
        </p>
      </motion.div>

      {/* Top Performing Content */}
      <motion.div variants={itemVariants}>
        <Card className="neural-border bg-cosmic-surface/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-cosmic-light flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cosmic-accent" />
              Top Performers
            </CardTitle>
            <CardDescription className="text-cosmic-muted">
              Your best content this week
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              {
                title: "How to build a personal brand online",
                platform: "LinkedIn",
                engagement: "2.3K",
                growth: "+127%"
              },
              {
                title: "Morning productivity routine",
                platform: "Twitter",
                engagement: "1.8K", 
                growth: "+89%"
              },
              {
                title: "Remote work setup essentials",
                platform: "Instagram",
                engagement: "1.2K",
                growth: "+56%"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="p-3 rounded-lg bg-cosmic-void/20 neural-border flex items-center justify-between"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex-1">
                  <p className="text-cosmic-light font-medium text-sm">{item.title}</p>
                  <p className="text-xs text-cosmic-muted">{item.platform}</p>
                </div>
                <div className="text-right">
                  <p className="text-cosmic-light font-semibold">{item.engagement}</p>
                  <p className="text-xs text-cosmic-accent flex items-center gap-1">
                    <ArrowUp className="w-3 h-3" />
                    {item.growth}
                  </p>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Platform Performance */}
      <motion.div variants={itemVariants}>
        <Card className="neural-border bg-cosmic-surface/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-cosmic-light flex items-center gap-2">
              <Target className="w-5 h-5 text-cosmic-glow" />
              Best Platforms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {[
                { platform: "LinkedIn", score: "94", growth: "+23%" },
                { platform: "Twitter", score: "87", growth: "+18%" },
                { platform: "Instagram", score: "82", growth: "+12%" }
              ].map((item, index) => (
                <div key={index} className="text-center p-3 rounded-lg bg-cosmic-void/20">
                  <p className="text-cosmic-light font-semibold">{item.platform}</p>
                  <p className="text-2xl font-bold text-cosmic-accent">{item.score}</p>
                  <p className="text-xs text-cosmic-glow">{item.growth}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Win */}
      <motion.div variants={itemVariants}>
        <Card className="neural-border bg-gradient-accent/10 border-cosmic-accent/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-cosmic-accent/20 flex items-center justify-center">
                <Zap className="w-4 h-4 text-cosmic-accent" />
              </div>
              <div className="flex-1">
                <p className="text-cosmic-light font-medium">Quick Win</p>
                <p className="text-sm text-cosmic-muted">Post between 2-4 PM for 40% better engagement</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}