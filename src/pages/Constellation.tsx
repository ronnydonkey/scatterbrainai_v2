import { motion } from 'framer-motion';
import { Brain, Sparkles, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThoughtCapture } from '@/components/ThoughtCapture';

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

export default function Constellation() {
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
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-primary mb-4"
          whileHover={{ scale: 1.1, rotate: 180 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Brain className="w-8 h-8 text-white" />
        </motion.div>
        
        <h1 className="text-3xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
          Your Neural Constellation
        </h1>
        <p className="text-cosmic-muted text-lg">
          Capture thoughts and watch them evolve into content
        </p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        variants={itemVariants}
      >
        <Card className="neural-border bg-cosmic-surface/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cosmic-muted">Thoughts Today</p>
                <p className="text-2xl font-bold text-cosmic-light">12</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-primary/20 flex items-center justify-center">
                <Brain className="w-6 h-6 text-cosmic-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="neural-border bg-cosmic-surface/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cosmic-muted">Generated</p>
                <p className="text-2xl font-bold text-cosmic-light">8</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-secondary/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-cosmic-glow" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="neural-border bg-cosmic-surface/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cosmic-muted">Trending</p>
                <p className="text-2xl font-bold text-cosmic-light">3</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-accent/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-cosmic-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Thought Capture */}
      <motion.div variants={itemVariants}>
        <ThoughtCapture />
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={itemVariants}>
        <Card className="neural-border bg-cosmic-surface/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-cosmic-light">Recent Activity</CardTitle>
            <CardDescription className="text-cosmic-muted">
              Your latest thoughts and insights
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((item) => (
              <motion.div
                key={item}
                className="flex items-start space-x-3 p-3 rounded-lg bg-cosmic-void/30 neural-border"
                whileHover={{ scale: 1.02, x: 10 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <div className="w-2 h-2 rounded-full bg-gradient-primary mt-2" />
                <div className="flex-1">
                  <p className="text-cosmic-light font-medium">
                    New content idea about AI trends
                  </p>
                  <p className="text-sm text-cosmic-muted mt-1">
                    2 hours ago • Ready for generation
                  </p>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}