import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Target, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PerformanceAnalytics } from '@/components/PerformanceAnalytics';

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
        className="text-center py-8"
        variants={itemVariants}
      >
        <motion.div
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-secondary mb-4"
          whileHover={{ scale: 1.1 }}
          animate={{ 
            background: [
              "linear-gradient(135deg, #ec4899, #f97316)",
              "linear-gradient(135deg, #f97316, #eab308)",
              "linear-gradient(135deg, #eab308, #ec4899)"
            ]
          }}
          transition={{ 
            background: { duration: 3, repeat: Infinity },
            scale: { type: "spring", stiffness: 300 }
          }}
        >
          <BarChart3 className="w-8 h-8 text-white" />
        </motion.div>
        
        <h1 className="text-3xl font-bold mb-2 bg-gradient-secondary bg-clip-text text-transparent">
          Performance Insights
        </h1>
        <p className="text-cosmic-muted text-lg">
          Track your content's impact and optimize your strategy
        </p>
      </motion.div>

      {/* Key Metrics */}
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        variants={itemVariants}
      >
        <Card className="neural-border bg-cosmic-surface/50 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-gradient-primary/20 flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-5 h-5 text-cosmic-accent" />
            </div>
            <p className="text-2xl font-bold text-cosmic-light">85%</p>
            <p className="text-xs text-cosmic-muted">Engagement Rate</p>
          </CardContent>
        </Card>

        <Card className="neural-border bg-cosmic-surface/50 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-gradient-secondary/20 flex items-center justify-center mx-auto mb-2">
              <Target className="w-5 h-5 text-cosmic-glow" />
            </div>
            <p className="text-2xl font-bold text-cosmic-light">12.4K</p>
            <p className="text-xs text-cosmic-muted">Total Reach</p>
          </CardContent>
        </Card>

        <Card className="neural-border bg-cosmic-surface/50 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-gradient-accent/20 flex items-center justify-center mx-auto mb-2">
              <Zap className="w-5 h-5 text-cosmic-accent" />
            </div>
            <p className="text-2xl font-bold text-cosmic-light">94</p>
            <p className="text-xs text-cosmic-muted">Content Score</p>
          </CardContent>
        </Card>

        <Card className="neural-border bg-cosmic-surface/50 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-gradient-primary/20 flex items-center justify-center mx-auto mb-2">
              <BarChart3 className="w-5 h-5 text-cosmic-accent" />
            </div>
            <p className="text-2xl font-bold text-cosmic-light">+23%</p>
            <p className="text-xs text-cosmic-muted">Growth</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Performance Analytics Component */}
      <motion.div variants={itemVariants}>
        <PerformanceAnalytics />
      </motion.div>

      {/* Quick Insights */}
      <motion.div variants={itemVariants}>
        <Card className="neural-border bg-cosmic-surface/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-cosmic-light">AI Insights</CardTitle>
            <CardDescription className="text-cosmic-muted">
              Data-driven recommendations for your content strategy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                insight: "Your posts perform 40% better when published between 2-4 PM",
                action: "Schedule more content during peak hours",
                impact: "High"
              },
              {
                insight: "Tech-focused content gets 2.3x more engagement",
                action: "Increase technology topic coverage",
                impact: "Medium"
              },
              {
                insight: "Questions in your posts increase comments by 65%",
                action: "Add more interactive elements",
                impact: "High"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="p-4 rounded-lg bg-cosmic-void/30 neural-border"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.01, x: 5 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-cosmic-light font-medium mb-1">{item.insight}</p>
                    <p className="text-sm text-cosmic-muted">{item.action}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    item.impact === 'High' 
                      ? 'bg-cosmic-accent/20 text-cosmic-accent' 
                      : 'bg-cosmic-glow/20 text-cosmic-glow'
                  }`}>
                    {item.impact}
                  </span>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}