import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Layers,
  PlayCircle,
  PauseCircle,
  TrendingUp,
  Sparkles,
  MessageSquare,
  Cpu
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NeuralVisualization from '@/components/NeuralVisualization';
import { useNeuralActivities } from './useNeuralData';

export function NeuralControlInterface() {
  const [isProcessing, setIsProcessing] = useState(false);
  const recentActivities = useNeuralActivities();

  return (
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
                {/* 3D Neural Visualization */}
                <div className="neural-card p-2 bg-gradient-to-br from-primary/5 to-accent/5 h-[500px]">
                  <NeuralVisualization
                    viewMode="3d-brain"
                    onNodeSelect={(node) => console.log('Selected node:', node)}
                    onNodeHover={(node) => console.log('Hovered node:', node)}
                  />
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
  );
}