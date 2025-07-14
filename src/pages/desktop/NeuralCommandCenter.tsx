import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Zap, 
  Activity, 
  Cpu, 
  Layers,
  TrendingUp,
  MessageSquare,
  Sparkles,
  PlayCircle,
  PauseCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function NeuralCommandCenter() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [neuralActivity, setNeuralActivity] = useState(75);
  const [connectedNodes, setConnectedNodes] = useState(12847);
  const [processingSpeed, setProcessingSpeed] = useState(340);

  // Simulate real-time neural activity
  useEffect(() => {
    const interval = setInterval(() => {
      setNeuralActivity(prev => Math.max(20, Math.min(100, prev + (Math.random() - 0.5) * 10)));
      setConnectedNodes(prev => prev + Math.floor(Math.random() * 10 - 5));
      setProcessingSpeed(prev => Math.max(100, Math.min(500, prev + (Math.random() - 0.5) * 50)));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const neuralMetrics = [
    {
      label: 'Neural Activity',
      value: neuralActivity,
      unit: '%',
      icon: Activity,
      color: 'cosmic-purple',
      description: 'Current processing intensity'
    },
    {
      label: 'Connected Nodes',
      value: connectedNodes,
      unit: '',
      icon: Cpu,
      color: 'neural-blue',
      description: 'Active neural connections'
    },
    {
      label: 'Processing Speed',
      value: processingSpeed,
      unit: 'ops/sec',
      icon: Zap,
      color: 'stardust-gold',
      description: 'Thoughts processed per second'
    },
    {
      label: 'Intelligence Level',
      value: 94,
      unit: '%',
      icon: Brain,
      color: 'plasma-pink',
      description: 'Current intelligence capacity'
    }
  ];

  const recentActivities = [
    {
      type: 'thought-processing',
      message: 'Processed creative thought cluster on "sustainable innovation"',
      timestamp: '2 minutes ago',
      priority: 'high'
    },
    {
      type: 'trend-analysis',
      message: 'Identified emerging trend in AI-powered creativity',
      timestamp: '5 minutes ago',
      priority: 'medium'
    },
    {
      type: 'content-generation',
      message: 'Generated 3 content variations with 95% authenticity score',
      timestamp: '8 minutes ago',
      priority: 'high'
    },
    {
      type: 'neural-optimization',
      message: 'Optimized neural pathways for improved performance',
      timestamp: '12 minutes ago',
      priority: 'low'
    }
  ];

  return (
    <div className="h-full p-6 space-y-6 neural-scroll overflow-y-auto">
      {/* Hero Section */}
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

      {/* Neural Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {neuralMetrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Card className="neural-card hover:shadow-neural-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <metric.icon className={`h-5 w-5 text-${metric.color}`} />
                  <Badge variant="secondary" className="text-xs">
                    Live
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="text-2xl font-bold">
                      {typeof metric.value === 'number' && metric.value > 1000 
                        ? metric.value.toLocaleString() 
                        : metric.value}
                      <span className="text-sm font-normal text-muted-foreground ml-1">
                        {metric.unit}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-card-foreground">
                      {metric.label}
                    </div>
                  </div>
                  {metric.label !== 'Connected Nodes' && (
                    <Progress 
                      value={typeof metric.value === 'number' ? metric.value : 0} 
                      className="h-2"
                    />
                  )}
                  <p className="text-xs text-muted-foreground">
                    {metric.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Control Interface */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card className="neural-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Layers className="h-5 w-5 mr-2" />
              Neural Control Interface
            </CardTitle>
            <CardDescription>
              Manage your creative intelligence processes and neural network operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="processing">Processing</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
                <TabsTrigger value="optimization">Optimization</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* 3D Brain Visualization Placeholder */}
                  <div className="neural-card p-8 text-center bg-gradient-to-br from-primary/5 to-accent/5">
                    <Brain className="h-24 w-24 mx-auto text-primary/50 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">3D Neural Visualization</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Interactive 3D brain model showing real-time neural activity and connections
                    </p>
                    <Button className="neural-glow">
                      Launch 3D View
                    </Button>
                  </div>

                  {/* Control Panel */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Neural Operations</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30">
                        <div className="flex items-center space-x-3">
                          {isProcessing ? (
                            <PauseCircle className="h-5 w-5 text-orange-500" />
                          ) : (
                            <PlayCircle className="h-5 w-5 text-green-500" />
                          )}
                          <div>
                            <div className="font-medium">Neural Processing</div>
                            <div className="text-xs text-muted-foreground">
                              {isProcessing ? 'Active processing' : 'Standby mode'}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant={isProcessing ? "destructive" : "default"}
                          size="sm"
                          onClick={() => setIsProcessing(!isProcessing)}
                        >
                          {isProcessing ? 'Pause' : 'Start'}
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30">
                        <div className="flex items-center space-x-3">
                          <TrendingUp className="h-5 w-5 text-blue-500" />
                          <div>
                            <div className="font-medium">Trend Analysis</div>
                            <div className="text-xs text-muted-foreground">
                              Real-time trend monitoring
                            </div>
                          </div>
                        </div>
                        <Badge variant="secondary">Active</Badge>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30">
                        <div className="flex items-center space-x-3">
                          <Sparkles className="h-5 w-5 text-purple-500" />
                          <div>
                            <div className="font-medium">Content Generation</div>
                            <div className="text-xs text-muted-foreground">
                              AI-powered content creation
                            </div>
                          </div>
                        </div>
                        <Badge variant="secondary">Ready</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="processing" className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Recent Neural Activity</h3>
                  <div className="space-y-3">
                    {recentActivities.map((activity, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-start space-x-3 p-3 rounded-lg bg-muted/20 border border-border/30"
                      >
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          activity.priority === 'high' ? 'bg-red-500' :
                          activity.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{activity.message}</div>
                          <div className="text-xs text-muted-foreground">{activity.timestamp}</div>
                        </div>
                        <Badge 
                          variant={activity.priority === 'high' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {activity.priority}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="insights" className="space-y-6">
                <div className="neural-card p-6 text-center">
                  <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">AI Insights</h3>
                  <p className="text-muted-foreground">
                    Deep learning insights and recommendations will be displayed here based on your neural activity patterns.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="optimization" className="space-y-6">
                <div className="neural-card p-6 text-center">
                  <Cpu className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Neural Optimization</h3>
                  <p className="text-muted-foreground">
                    Advanced optimization tools for enhancing neural network performance and efficiency.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}