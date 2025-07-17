
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ContentMultiplier } from '@/components/ContentMultiplier';
import { useIsMobile } from '@/hooks/use-mobile';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ReportHeader } from '@/components/report/ReportHeader';
import { ExecutiveSummary } from '@/components/report/ExecutiveSummary';
import { ContentSuggestions } from '@/components/report/ContentSuggestions';
import { DeepDiveAnalysis } from '@/components/report/DeepDiveAnalysis';
import { ActionPlan } from '@/components/report/ActionPlan';
import { ResearchResources } from '@/components/report/ResearchResources';

const DetailedReport: React.FC = () => {
  const { insightId } = useParams();
  const isMobile = useIsMobile();
  const { handleError, handleAsyncError } = useErrorHandler();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [baseInsight, setBaseInsight] = useState(null);

  const generateDetailedReport = useCallback(async (id: string) => {
    const result = await handleAsyncError(async () => {
      setLoading(true);
      console.log('Looking for detailed report with insight ID:', id);
      
      // Get base insight from storage first and store it
      const insights = JSON.parse(localStorage.getItem('scatterbrain_insights') || '[]');
      console.log('Available insights in localStorage:', insights.map(i => ({ id: i.id, timestamp: i.timestamp })));
      const foundInsight = insights.find(i => i.id === id);
      
      if (foundInsight) {
        console.log('Found base insight:', foundInsight);
        setBaseInsight(foundInsight);
      } else {
        console.warn('Base insight not found in localStorage for ID:', id);
        // Set a minimal base insight to prevent errors
        setBaseInsight({
          id: id,
          originalInput: 'Insight content not available in localStorage',
          timestamp: Date.now()
        });
      }
      
      // First, check if a detailed report already exists
      const { data: existingReport, error: fetchError } = await supabase
        .from('detailed_reports')
        .select('report_data')
        .eq('insight_id', id)
        .maybeSingle();

      if (existingReport && !fetchError) {
        console.log('Loading existing detailed report from database');
        setReport(existingReport.report_data);
        return;
      }

      console.log('No existing report found in database, checking localStorage');
      
      if (!foundInsight) {
        console.error('Insight not found in localStorage for ID:', id);
        console.log('Available insights:', insights.map(i => ({ id: i.id, timestamp: i.timestamp })));
        
        // If we can't find the insight in localStorage but there might be a report in the database
        // with a similar timestamp, let's try to find any report for this user
        const { data: anyReports, error: anyError } = await supabase
          .from('detailed_reports')
          .select('insight_id, report_data, created_at')
          .order('created_at', { ascending: false })
          .limit(10);
          
        console.log('Recent reports in database:', anyReports);
        
        if (anyReports && anyReports.length > 0) {
          // Extract timestamp from the current ID
          const currentTimestamp = id.split('_')[1];
          console.log('Looking for timestamp:', currentTimestamp);
          
          // Try to find a report with a matching or very close timestamp
          const potentialMatch = anyReports.find(report => {
            const reportTimestamp = report.insight_id.split('_')[1];
            const timeDiff = Math.abs(parseInt(currentTimestamp) - parseInt(reportTimestamp));
            console.log(`Comparing ${currentTimestamp} vs ${reportTimestamp}, diff: ${timeDiff}`);
            return timeDiff <= 5000; // Within 5 seconds
          });
          
          if (potentialMatch) {
            console.log('Found matching report by timestamp:', potentialMatch.insight_id);
            setReport(potentialMatch.report_data);
            return;
          }
          
          // If no timestamp match, try the most recent report as fallback
          console.log('No timestamp match found, using most recent report:', anyReports[0].insight_id);
          setReport(anyReports[0].report_data);
          return;
        }
        
        throw new Error('Insight not found');
      }

      // Call backend for detailed analysis
      const { data, error } = await supabase.functions.invoke('detailed-report', {
        body: {
          insightId: id,
          originalInput: foundInsight.originalInput,
          basicInsights: foundInsight.insights,
          generateResources: true,
          includeAffiliateLinks: true
        }
      });

      if (error) throw error;

      setReport(data.report);
    }, { component: 'DetailedReport', action: 'generate report' });

    if (result !== null) {
      toast.success('Report loaded successfully!');
    }
    
    setLoading(false);
  }, [handleAsyncError]);

  const shareReport = useCallback(async () => {
    if (!report || !baseInsight) {
      handleError('Report or base insight data is not available', { 
        component: 'DetailedReport', 
        action: 'share report' 
      });
      return;
    }

    const email = prompt('Enter email address to share this report:');
    if (!email) return;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      handleError('Please enter a valid email address', { 
        component: 'DetailedReport', 
        action: 'validate email' 
      });
      return;
    }

    const result = await handleAsyncError(async () => {
      setLoading(true);
      
      console.log('Attempting to generate shareable report for:', email);
      
      // Call the improved email function
      const { data, error } = await supabase.functions.invoke('email-analysis', {
        body: {
          email,
          analysisData: report,
          thoughtContent: baseInsight.originalInput,
          thoughtTitle: `Insight Analysis - ${new Date(baseInsight.timestamp).toLocaleDateString()}`
        }
      });

      console.log('Email response:', { data, error });

      if (error) {
        console.error('Email function error:', error);
        throw error;
      }

      if (data?.downloadUrl) {
        // If email service isn't available, offer download instead
        const link = document.createElement('a');
        link.href = data.downloadUrl;
        link.download = `scatterbrain-report-${insightId}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success('Report downloaded! You can share this HTML file via email.');
      } else {
        toast.success('Report prepared successfully!');
      }
    }, { component: 'DetailedReport', action: 'share report' });

    if (result === null) {
      // Fallback: create a simple text version
      try {
        const simpleReport = `
ScatterBrainAI Report
${new Date().toLocaleDateString()}

Original Thought: ${baseInsight.originalInput}

Key Findings:
${report.summary?.keyFindings?.map(f => `• ${f}`).join('\n') || 'No findings available'}

Recommendations:
${report.analysis?.recommendations?.map(r => `• ${r}`).join('\n') || 'No recommendations available'}

Generated by ScatterBrainAI
        `;
        
        const blob = new Blob([simpleReport], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `scatterbrain-report-${insightId}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast.success('Report downloaded as text file! You can share this via email.');
      } catch (fallbackError) {
        handleError(fallbackError, { component: 'DetailedReport', action: 'create fallback report' });
      }
    }
    
    setLoading(false);
  }, [report, baseInsight, insightId, handleError, handleAsyncError]);

  const downloadReport = useCallback(async () => {
    if (!report || !baseInsight) {
      handleError('Report or base insight data is not available', { 
        component: 'DetailedReport', 
        action: 'download report' 
      });
      return;
    }

    const result = await handleAsyncError(async () => {
      setLoading(true);
      
      console.log('Attempting to download report');
      
      // Call the improved PDF generation function
      const { data, error } = await supabase.functions.invoke('generate-pdf-report', {
        body: {
          insightId,
          reportData: report,
          originalInput: baseInsight.originalInput,
          timestamp: baseInsight.timestamp
        }
      });

      if (error) throw error;

      // Create blob and download
      const fileType = data.contentType || 'text/plain';
      const fileExtension = data.contentType === 'application/pdf' ? 'pdf' : 'txt';
      const fileName = data.filename || `scatterbrain-report-${insightId}.${fileExtension}`;
      
      const reportBlob = new Blob([new Uint8Array(data.pdfBuffer)], { type: fileType });
      const url = URL.createObjectURL(reportBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      toast.success('Report downloaded successfully!');
    }, { component: 'DetailedReport', action: 'download report' });
    
    setLoading(false);
  }, [report, baseInsight, insightId, handleAsyncError]);

  const handleContentGenerate = useCallback((content) => {
    console.log('Generated content suite:', content);
    toast.success('Content suite generated successfully!');
  }, []);

  const originalInsightMemo = useMemo(() => ({
    originalInput: baseInsight?.originalInput || '',
    id: insightId || ''
  }), [baseInsight?.originalInput, insightId]);

  useEffect(() => {
    if (insightId) {
      generateDetailedReport(insightId);
    }
  }, [insightId, generateDetailedReport]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading report...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <p>Report not found</p>
          <button onClick={() => window.location.href = '/gallery'} className="mt-4 px-4 py-2 bg-white/10 rounded">
            Back to Gallery
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className={`${isMobile ? 'px-4 py-4' : 'p-6'} max-w-4xl mx-auto`}>
          
          <ErrorBoundary>
            <ReportHeader 
              loading={loading}
              report={report}
              baseInsight={baseInsight}
              onShare={shareReport}
              onDownload={downloadReport}
            />
          </ErrorBoundary>

          <ErrorBoundary>
            <ExecutiveSummary report={report} />
          </ErrorBoundary>

          <ErrorBoundary>
            <ContentSuggestions report={report} />
          </ErrorBoundary>

          <ErrorBoundary>
            <DeepDiveAnalysis report={report} />
          </ErrorBoundary>

          {/* 10x Your Content - Content Multiplication Engine */}
          <ErrorBoundary>
            <Card className="mb-8 bg-white/10 border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  10x Your Content
                </CardTitle>
                <p className="text-gray-300">Transform your insight into multiple content formats</p>
              </CardHeader>
              <CardContent>
                <ContentMultiplier 
                  originalInsight={originalInsightMemo}
                  onGenerate={handleContentGenerate}
                />
              </CardContent>
            </Card>
          </ErrorBoundary>

          <ErrorBoundary>
            <ActionPlan report={report} />
          </ErrorBoundary>

          <ErrorBoundary>
            <ResearchResources report={report} />
          </ErrorBoundary>

          {/* Footer */}
          <div className="text-center py-8 border-t border-white/20">
            <p className="text-gray-400 text-sm">
              Generated by ScatterBrainAI • {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default DetailedReport;
