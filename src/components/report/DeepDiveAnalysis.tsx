
import React from 'react';
import { Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DeepDiveAnalysisProps {
  report: any;
}

export const DeepDiveAnalysis: React.FC<DeepDiveAnalysisProps> = ({ report }) => {
  return (
    <Card className="mb-8 bg-white/10 border-white/20 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Deep Dive Analysis
        </CardTitle>
        <p className="text-gray-300">Detailed breakdown of your thoughts</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {report.analysis?.detailedBreakdown && (
            <div>
              <h4 className="font-semibold mb-2">Detailed Breakdown</h4>
              <p className="text-gray-300">{report.analysis.detailedBreakdown}</p>
            </div>
          )}
          {report.analysis?.patterns && (
            <div>
              <h4 className="font-semibold mb-2">Patterns Identified</h4>
              <div className="flex flex-wrap gap-2">
                {report.analysis.patterns.map((pattern: string, index: number) => (
                  <Badge key={index} variant="secondary" className="bg-purple-600 text-white">
                    {pattern}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {report.analysis?.recommendations && (
            <div>
              <h4 className="font-semibold mb-2">Recommendations</h4>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                {report.analysis.recommendations.map((rec: string, index: number) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
