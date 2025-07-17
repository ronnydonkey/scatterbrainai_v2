import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NeuralBrainIcon } from '@/components/ui/neural-brain-icon';
import { useIsMobile } from '@/hooks/use-mobile';

interface ReportHeaderProps {
  loading: boolean;
  report: any;
  baseInsight: any;
  onShare: () => void;
  onDownload: () => void;
}

export const ReportHeader: React.FC<ReportHeaderProps> = memo(({
  loading,
  report,
  baseInsight,
  onShare,
  onDownload
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <>
      {/* Mobile-optimized Header */}
      <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'items-center justify-between'} mb-8`}>
        <Button
          variant="outline"
          onClick={() => navigate('/gallery')}
          className="border-white/20 text-white hover:bg-white/10 self-start"
          size={isMobile ? "sm" : "default"}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Gallery
        </Button>
        
        <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'gap-2'}`}>
          <Button
            variant="outline"
            onClick={onShare}
            className="border-white/20 text-white hover:bg-white/10"
            disabled={loading || !report || !baseInsight}
            size={isMobile ? "sm" : "default"}
          >
            <Share2 className="w-4 h-4 mr-2" />
            {loading ? 'Preparing...' : 'Share Report'}
          </Button>
          <Button
            variant="outline"
            onClick={onDownload}
            className="border-white/20 text-white hover:bg-white/10"
            disabled={loading || !report || !baseInsight}
            size={isMobile ? "sm" : "default"}
          >
            <Download className="w-4 h-4 mr-2" />
            {loading ? 'Generating...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Mobile-optimized Title */}
      <div className="text-center mb-12">
        <div className={`flex items-center justify-center gap-3 mb-2 ${isMobile ? 'flex-col' : ''}`}>
          <NeuralBrainIcon size={isMobile ? 32 : 48} animate variant="premium" />
          <h1 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold text-white`}>
            SCATTERBRAINAI REPORT
          </h1>
        </div>
        <p className={`${isMobile ? 'text-lg' : 'text-xl'} text-gray-300`}>Insight Analysis</p>
      </div>
    </>
  );
});

ReportHeader.displayName = 'ReportHeader';
