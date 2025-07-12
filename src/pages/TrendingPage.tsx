import { motion } from 'framer-motion';
import { TrendingUp, Flame, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingTopics } from '@/components/TrendingTopics';
import { Badge } from '@/components/ui/badge';

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

export default function TrendingPage() {
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
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ 
            rotate: { duration: 2, repeat: Infinity },
            scale: { type: "spring", stiffness: 300 }
          }}
        >
          <TrendingUp className="w-8 h-8 text-white" />
        </motion.div>
        
        <h1 className="text-3xl font-bold mb-2 bg-gradient-secondary bg-clip-text text-transparent">
          Cultural Intelligence
        </h1>
        <p className="text-cosmic-muted text-lg">
          Discover what's trending and shape the conversation
        </p>
      </motion.div>

      {/* Trending Metrics */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        variants={itemVariants}
      >
        <Card className="neural-border bg-cosmic-surface/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cosmic-muted">Hot Topics</p>
                <p className="text-2xl font-bold text-cosmic-light">15</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-secondary/20 flex items-center justify-center">
                <Flame className="w-6 h-6 text-cosmic-glow" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="neural-border bg-cosmic-surface/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cosmic-muted">Rising Fast</p>
                <p className="text-2xl font-bold text-cosmic-light">7</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-accent/20 flex items-center justify-center">
                <Zap className="w-6 h-6 text-cosmic-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="neural-border bg-cosmic-surface/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cosmic-muted">Researched</p>
                <p className="text-2xl font-bold text-cosmic-light">23</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-primary/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-cosmic-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Trending Topics Component */}
      <motion.div variants={itemVariants}>
        <TrendingTopics 
          onTopicSelect={(topic) => console.log('Selected topic:', topic)}
          onNavigateToResearch={() => console.log('Navigate to research')}
        />
      </motion.div>

      {/* Trending Categories */}
      <motion.div variants={itemVariants}>
        <Card className="neural-border bg-cosmic-surface/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-cosmic-light">Trending Categories</CardTitle>
            <CardDescription className="text-cosmic-muted">
              Popular topic categories right now
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[
                { name: 'AI & Technology', count: 12, trend: 'up' },
                { name: 'Finance', count: 8, trend: 'up' },
                { name: 'Lifestyle', count: 6, trend: 'down' },
                { name: 'Business', count: 15, trend: 'up' },
                { name: 'Health & Wellness', count: 4, trend: 'stable' }
              ].map((category, index) => (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Badge 
                    variant="secondary" 
                    className="bg-cosmic-surface/50 text-cosmic-light border-cosmic-accent/30 px-3 py-1"
                  >
                    {category.name} ({category.count})
                  </Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}