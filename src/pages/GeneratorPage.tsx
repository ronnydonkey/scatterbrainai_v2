import { motion } from 'framer-motion';
import { Sparkles, Wand2, Cpu } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ContentGenerator } from '@/components/ContentGenerator';

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

export default function GeneratorPage() {
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
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-accent mb-4"
          whileHover={{ scale: 1.1 }}
          animate={{ 
            boxShadow: [
              "0 0 20px rgba(139, 92, 246, 0.3)",
              "0 0 40px rgba(139, 92, 246, 0.5)",
              "0 0 20px rgba(139, 92, 246, 0.3)"
            ]
          }}
          transition={{ 
            boxShadow: { duration: 2, repeat: Infinity },
            scale: { type: "spring", stiffness: 300 }
          }}
        >
          <Sparkles className="w-8 h-8 text-white" />
        </motion.div>
        
        <h1 className="text-3xl font-bold mb-2 bg-gradient-accent bg-clip-text text-transparent">
          Content Creation Lab
        </h1>
        <p className="text-cosmic-muted text-lg">
          Transform your thoughts into engaging content
        </p>
      </motion.div>

      {/* Generation Stats */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        variants={itemVariants}
      >
        <Card className="neural-border bg-cosmic-surface/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cosmic-muted">Generated Today</p>
                <p className="text-2xl font-bold text-cosmic-light">24</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-accent/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-cosmic-glow" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="neural-border bg-cosmic-surface/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cosmic-muted">In Progress</p>
                <p className="text-2xl font-bold text-cosmic-light">3</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-secondary/20 flex items-center justify-center">
                <Cpu className="w-6 h-6 text-cosmic-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="neural-border bg-cosmic-surface/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cosmic-muted">Templates</p>
                <p className="text-2xl font-bold text-cosmic-light">12</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-primary/20 flex items-center justify-center">
                <Wand2 className="w-6 h-6 text-cosmic-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Content Generator Component */}
      <motion.div variants={itemVariants}>
        <ContentGenerator />
      </motion.div>

      {/* Quick Templates */}
      <motion.div variants={itemVariants}>
        <Card className="neural-border bg-cosmic-surface/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-cosmic-light">Quick Templates</CardTitle>
            <CardDescription className="text-cosmic-muted">
              Start generating with these popular templates
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'Social Media Post', description: 'Engaging posts for all platforms', icon: '📱' },
              { name: 'Blog Article', description: 'Long-form content pieces', icon: '📝' },
              { name: 'Email Newsletter', description: 'Weekly updates and insights', icon: '📧' },
              { name: 'Product Description', description: 'Compelling product copy', icon: '🛍️' }
            ].map((template, index) => (
              <motion.div
                key={template.name}
                className="p-4 rounded-lg bg-cosmic-void/30 neural-border cursor-pointer"
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{template.icon}</span>
                  <div>
                    <h3 className="font-medium text-cosmic-light">{template.name}</h3>
                    <p className="text-sm text-cosmic-muted">{template.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}