
import React from 'react';
import { Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ExecutiveSummaryProps {
  report: any;
}

export const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({ report }) => {
  return (
    <Card className="mb-8 bg-white/10 border-white/20 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Executive Summary
        </CardTitle>
        <p className="text-gray-300">Your key insights at a glance</p>
      </CardHeader>
      <CardContent>
        {report.summary?.keyFindings?.map((finding: string, index: number) => (
          <div key={index} className="mb-4 p-4 bg-white/5 rounded-lg">
            <p className="text-white">{finding}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
