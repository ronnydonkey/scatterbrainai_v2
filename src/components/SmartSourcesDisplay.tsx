
import React, { memo, useCallback } from 'react';
import { Search, ExternalLink } from 'lucide-react';

interface SmartSources {
  communities: string[];
  websites: string[];
  contentFocus: string[];
  reasoning: string;
}

interface SmartSourcesDisplayProps {
  smartSources: SmartSources;
  onSourceClick?: (source: string, sourceType: 'community' | 'website') => void;
}

export const SmartSourcesDisplay = memo(({ smartSources, onSourceClick }: SmartSourcesDisplayProps) => {
  const handleSourceClick = useCallback((source: string, sourceType: 'community' | 'website') => {
    // Track engagement if callback provided
    onSourceClick?.(source, sourceType);
    
    // Open source in new tab
    let url = '';
    if (sourceType === 'community') {
      if (source.startsWith('r/')) {
        url = `https://reddit.com/${source}`;
      } else if (source === 'HackerNews') {
        url = 'https://news.ycombinator.com';
      } else if (source === 'IndieHackers') {
        url = 'https://indiehackers.com';
      } else if (source === 'Behance') {
        url = 'https://behance.net';
      } else if (source === 'Dribbble') {
        url = 'https://dribbble.com';
      } else {
        url = `https://${source}`;
      }
    } else {
      url = source.startsWith('http') ? source : `https://${source}`;
    }
    
    window.open(url, '_blank');
  }, [onSourceClick]);

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20 mb-6">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Search className="w-5 h-5 text-blue-400" />
        Research Sources
      </h3>
      
      <p className="text-slate-400 text-sm mb-4">{smartSources.reasoning}</p>
      
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <h4 className="text-purple-300 font-medium mb-2">Communities</h4>
          <div className="space-y-2">
            {smartSources.communities?.map(source => (
              <button
                key={source}
                onClick={() => handleSourceClick(source, 'community')}
                className="flex items-center justify-between w-full text-left p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 text-slate-300 text-sm transition-all hover:transform hover:scale-[1.02]"
              >
                <span className="flex items-center gap-2">
                  🌐 {source}
                </span>
                <ExternalLink className="w-3 h-3 opacity-50" />
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-purple-300 font-medium mb-2">Expert Sources</h4>
          <div className="space-y-2">
            {smartSources.websites?.map(source => (
              <button
                key={source}
                onClick={() => handleSourceClick(source, 'website')}
                className="flex items-center justify-between w-full text-left p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 text-slate-300 text-sm transition-all hover:transform hover:scale-[1.02]"
              >
                <span className="flex items-center gap-2">
                  📖 {source}
                </span>
                <ExternalLink className="w-3 h-3 opacity-50" />
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
        <div className="text-blue-300 text-sm font-medium mb-1">Content Focus:</div>
        <div className="text-slate-300 text-sm">
          {smartSources.contentFocus?.join(' • ')}
        </div>
      </div>
    </div>
  );
});

SmartSourcesDisplay.displayName = 'SmartSourcesDisplay';
