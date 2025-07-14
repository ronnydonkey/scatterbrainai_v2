import { NeuralHeroSection } from '@/components/neural/NeuralHeroSection';
import { NeuralMetricsGrid } from '@/components/neural/NeuralMetricsGrid';
import { NeuralControlInterface } from '@/components/neural/NeuralControlInterface';

export default function NeuralCommandCenter() {
  return (
    <div className="h-full p-6 space-y-6 neural-scroll overflow-y-auto">
      <NeuralHeroSection />
      <NeuralMetricsGrid />
      <NeuralControlInterface />
    </div>
  );
}