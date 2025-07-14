import { useState, useEffect } from 'react';

// Neural metrics data and state management
export interface NeuralMetric {
  label: string;
  value: number;
  unit: string;
  icon: any;
  color: string;
  description: string;
}

export interface NeuralActivity {
  type: string;
  message: string;
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
}

export function useNeuralMetrics() {
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

  return {
    neuralActivity,
    connectedNodes,
    processingSpeed
  };
}

export function useNeuralActivities(): NeuralActivity[] {
  return [
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
}