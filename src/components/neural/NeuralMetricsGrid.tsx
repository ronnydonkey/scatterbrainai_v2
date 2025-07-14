import { motion } from 'framer-motion';
import { Activity, Cpu, Zap, Brain } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNeuralMetrics, type NeuralMetric } from './useNeuralData';

export function NeuralMetricsGrid() {
  const { neuralActivity, connectedNodes, processingSpeed } = useNeuralMetrics();

  const neuralMetrics: NeuralMetric[] = [
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

  return (
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
  );
}