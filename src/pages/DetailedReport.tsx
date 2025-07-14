import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Download, Target, Search, CheckSquare, BookOpen, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

const DetailedReport: React.FC = () => {
  const { insightId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (insightId) {
      generateDetailedReport(insightId);
    }
  }, [insightId]);

  const generateDetailedReport = async (id: string) => {
    try {
      // Get base insight from storage
      const insights = JSON.parse(localStorage.getItem('scatterbrain_insights') || '[]');
      const baseInsight = insights.find(i => i.id === id);
      
      if (!baseInsight) throw new Error('Insight not found');

      // Call backend for detailed analysis
      const { data, error } = await supabase.functions.invoke('detailed-report', {
        body: {
          insightId: id,
          originalInput: baseInsight.originalInput,
          basicInsights: baseInsight.insights,
          generateResources: true,
          includeAffiliateLinks: true
        }
      });

      if (error) throw error;

      setReport(data.report);
      setLoading(false);
    } catch (error) {
      console.error('Failed to generate detailed report:', error);
      setLoading(false);
    }
  };

  const shareReport = async () => {
    if (navigator.share) {
      // Native sharing on mobile
      await navigator.share({
        title: 'My Scatterbrain Insight Report',
        text: report?.summary?.keyFindings?.[0] || 'Check out my insight report',
        url: window.location.href
      });
    } else {
      // Copy link to clipboard
      await navigator.clipboard.writeText(window.location.href);
      // You can add a toast notification here
    }
  };

  const downloadReport = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-pdf', {
        body: { report }
      });

      if (error) throw error;

      // Create download link
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scatterbrain-report-${report?.id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF generation failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Generating detailed report...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <p>Report not found</p>
          <Button onClick={() => navigate('/gallery')} className="mt-4">
            Back to Gallery
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/gallery')}
            className="border-white/20 text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Gallery
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={shareReport}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button
              variant="outline"
              onClick={downloadReport}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Download className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">🧠 SCATTERBRAIN REPORT</h1>
          <p className="text-xl text-gray-300">Insight Analysis</p>
        </div>

        {/* Executive Summary */}
        <Card className="mb-8 bg-white/10 border-white/20 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Executive Summary
            </CardTitle>
            <p className="text-gray-300">Your key insights at a glance</p>
          </CardHeader>
          <CardContent>
            {report.summary?.keyFindings?.map((finding, index) => (
              <div key={index} className="mb-4 p-4 bg-white/5 rounded-lg">
                <p className="text-white">{finding}</p>
              </div>
            ))}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-300">{report.summary?.confidence || 'N/A'}</p>
                <p className="text-sm text-gray-400">Confidence Level</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-300">{report.summary?.timeToImplement || 'N/A'}</p>
                <p className="text-sm text-gray-400">Time to Implement</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-300">{report.summary?.impactLevel || 'N/A'}</p>
                <p className="text-sm text-gray-400">Impact Level</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deep Dive Analysis */}
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
                    {report.analysis.patterns.map((pattern, index) => (
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
                    {report.analysis.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Plan */}
        <Card className="mb-8 bg-white/10 border-white/20 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5" />
              Your Action Plan
            </CardTitle>
            <p className="text-gray-300">Prioritized next steps</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {report.actionPlan?.immediate && (
                <div>
                  <h4 className="font-semibold mb-3 text-red-300">Immediate Actions</h4>
                  <ul className="space-y-2">
                    {report.actionPlan.immediate.map((action, index) => (
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
                    {report.actionPlan.shortTerm.map((action, index) => (
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
                    {report.actionPlan.longTerm.map((action, index) => (
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

        {/* Research & Resources */}
        <Card className="mb-8 bg-white/10 border-white/20 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Research & Resources
            </CardTitle>
            <p className="text-gray-300">Curated links and further reading</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {report.resources?.articles && (
                <div>
                  <h4 className="font-semibold mb-3">Articles</h4>
                  <ul className="space-y-2">
                    {report.resources.articles.map((article, index) => (
                      <li key={index}>
                        <a 
                          href={article.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-300 hover:text-blue-200 text-sm underline"
                        >
                          {article.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {report.resources?.tools && (
                <div>
                  <h4 className="font-semibold mb-3">Tools</h4>
                  <ul className="space-y-2">
                    {report.resources.tools.map((tool, index) => (
                      <li key={index}>
                        <a 
                          href={tool.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-purple-300 hover:text-purple-200 text-sm underline"
                        >
                          {tool.name}
                        </a>
                        <p className="text-xs text-gray-400">{tool.description}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Content Ready to Share */}
        <Card className="mb-8 bg-white/10 border-white/20 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Content Ready to Share
            </CardTitle>
            <p className="text-gray-300">Social posts, emails, presentations</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {report.contentSuggestions?.socialPosts && (
                <div>
                  <h4 className="font-semibold mb-3">Social Media Posts</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(report.contentSuggestions.socialPosts).map(([platform, content]: [string, any]) => (
                      <div key={platform} className="p-4 bg-white/5 rounded-lg">
                        <h5 className="font-medium mb-2 capitalize">{platform}</h5>
                        <p className="text-sm text-gray-300 mb-2">{content?.content || 'No content available'}</p>
                        <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                          Copy to Clipboard
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-8 border-t border-white/20">
          <p className="text-gray-400 text-sm">
            Generated by Scatterbrain AI • {new Date(report.timestamp).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DetailedReport;