import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Sparkles, MessageSquare, Crown, Star, Gem, Flame, 
  Copy, Share, Download, Lightbulb, Target, TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import { TIERS } from '@/data/advisorsDirectory';
import { toast } from 'sonner';

interface SynthesisPanelProps {
  synthesis: {
    advisors: Array<{
      name: string;
      avatar: string;
      tier: string;
      insight: string;
    }>;
    combinedSummary: string;
    keyThemes?: string[];
    actionPlan?: string[];
    timestamp: string;
  };
}

export const SynthesisPanel: React.FC<SynthesisPanelProps> = ({ synthesis }) => {
  const getTierIcon = (tier: string) => {
    const icons = {
      legendary: Crown,
      elite: Star,
      expert: Gem,
      insider: Flame
    };
    const Icon = icons[tier as keyof typeof icons] || Gem;
    return <Icon className="h-4 w-4" />;
  };

  const copyToClipboard = () => {
    const text = `Advisory Board Insights\n\n${synthesis.combinedSummary}\n\nIndividual Insights:\n${synthesis.advisors.map(a => `${a.name}: ${a.insight}`).join('\n\n')}`;
    navigator.clipboard.writeText(text);
    toast.success('Insights copied to clipboard');
  };

  const shareInsights = () => {
    // Implement sharing functionality
    toast.success('Sharing functionality coming soon!');
  };

  const downloadReport = () => {
    // Implement download functionality
    toast.success('Download functionality coming soon!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header Card */}
      <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-xl">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-purple-50/50 to-blue-50/50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              Board Synthesis
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={copyToClipboard}
                className="bg-white/50 hover:bg-white/80"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={shareInsights}
                className="bg-white/50 hover:bg-white/80"
              >
                <Share className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={downloadReport}
                className="bg-white/50 hover:bg-white/80"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Generated on {new Date(synthesis.timestamp).toLocaleString()}
          </p>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Executive Summary */}
          <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-purple-50 rounded-2xl p-6 border border-purple-100/50">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-3 text-gray-900">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg shadow-sm">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              Executive Summary
            </h3>
            <p className="text-base leading-relaxed text-gray-800 font-medium">
              {synthesis.combinedSummary}
            </p>
          </div>

          <Separator className="opacity-30" />

          {/* Individual Insights */}
          <div>
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-3 text-gray-900">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg shadow-sm">
                <Crown className="h-5 w-5 text-white" />
              </div>
              Individual Insights ({synthesis.advisors.length})
            </h3>
            
            <ScrollArea className="h-96">
              <div className="space-y-4 pr-4">
                {synthesis.advisors.map((advisor, index) => {
                  const tierInfo = TIERS[advisor.tier as keyof typeof TIERS];
                  const TierIcon = getTierIcon(advisor.tier);
                  
                  return (
                    <motion.div
                      key={advisor.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="bg-white/70 backdrop-blur-sm border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-200">
                        <CardContent className="p-5">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-14 w-14 border-2 border-white shadow-lg">
                              <AvatarFallback className="text-xl bg-gradient-to-br from-gray-100 to-gray-200 font-medium">
                                {advisor.avatar}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <h4 className="font-semibold text-base text-gray-900">{advisor.name}</h4>
                                <Badge 
                                  className={`
                                    text-xs font-medium border-0 text-white shadow-sm
                                    bg-gradient-to-r ${tierInfo?.color || 'from-gray-400 to-gray-500'}
                                    flex items-center gap-1
                                  `}
                                >
                                  {TierIcon}
                                  <span>{tierInfo?.label || 'Advisor'}</span>
                                </Badge>
                              </div>
                              
                              <blockquote className="text-sm text-gray-700 leading-relaxed border-l-4 border-gradient-to-b from-purple-400 to-blue-400 pl-4 bg-gradient-to-r from-gray-50 to-white rounded-r-lg p-4 shadow-sm">
                                "{advisor.insight}"
                              </blockquote>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Key Themes */}
          {synthesis.keyThemes && synthesis.keyThemes.length > 0 && (
            <>
              <Separator className="opacity-30" />
              <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 rounded-2xl p-6 border border-blue-100/50">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg shadow-sm">
                    <Lightbulb className="h-5 w-5 text-white" />
                  </div>
                  Key Themes
                </h3>
                <div className="flex flex-wrap gap-3">
                  {synthesis.keyThemes.map((theme, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Badge className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200/50 px-4 py-2 text-sm font-medium hover:from-blue-200 hover:to-cyan-200 transition-all duration-200 shadow-sm">
                        {theme}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Action Plan */}
          <Separator className="opacity-30" />
          {synthesis.actionPlan && synthesis.actionPlan.length > 0 ? (
            <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 rounded-2xl p-6 border border-green-100/50">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg shadow-sm">
                  <Target className="h-5 w-5 text-white" />
                </div>
                Action Plan
              </h3>
              <ul className="space-y-3">
                {synthesis.actionPlan.map((action, index) => (
                  <motion.li 
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 text-sm text-gray-800"
                  >
                    <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-green-400 to-emerald-400 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5 shadow-sm">
                      {index + 1}
                    </div>
                    <span className="leading-relaxed font-medium">{action}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 rounded-2xl p-6 border border-purple-100/50">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-sm">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                Next Steps
              </h3>
              <ul className="space-y-3">
                {[
                  'Review each advisor\'s perspective for unique angles',
                  'Identify common themes across insights',
                  'Create an action plan based on the synthesis',
                  'Return to the board for follow-up questions'
                ].map((step, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-gray-800">
                    <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-purple-400 to-pink-400 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5 shadow-sm">
                      {index + 1}
                    </div>
                    <span className="leading-relaxed font-medium">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};