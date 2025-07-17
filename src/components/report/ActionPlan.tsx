
import React, { memo } from 'react';
import { CheckSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

interface ActionPlanProps {
  report: any;
}

export const ActionPlan: React.FC<ActionPlanProps> = memo(({ report }) => {
  const isMobile = useIsMobile();

  return (
    <Card className="mb-8 bg-white/10 border-white/20 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5" />
          Your Action Plan
        </CardTitle>
        <p className="text-gray-300">Prioritized next steps</p>
      </CardHeader>
      <CardContent>
        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'} gap-6`}>
          {report.actionPlan?.immediate && (
            <div>
              <h4 className="font-semibold mb-3 text-red-300">Immediate Actions</h4>
              <ul className="space-y-2">
                {report.actionPlan.immediate.map((action: string, index: number) => (
                  <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {report.actionPlan?.shortTerm && (
            <div>
              <h4 className="font-semibold mb-3 text-yellow-300">Short Term</h4>
              <ul className="space-y-2">
                {report.actionPlan.shortTerm.map((action: string, index: number) => (
                  <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {report.actionPlan?.longTerm && (
            <div>
              <h4 className="font-semibold mb-3 text-green-300">Long Term</h4>
              <ul className="space-y-2">
                {report.actionPlan.longTerm.map((action: string, index: number) => (
                  <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

ActionPlan.displayName = 'ActionPlan';
