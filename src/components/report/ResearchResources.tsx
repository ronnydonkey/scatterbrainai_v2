
import React, { memo } from 'react';
import { BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

interface ResearchResourcesProps {
  report: any;
}

export const ResearchResources: React.FC<ResearchResourcesProps> = memo(({ report }) => {
  const isMobile = useIsMobile();

  return (
    <Card className="mb-8 bg-white/10 border-white/20 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Research & Resources
        </CardTitle>
        <p className="text-gray-300">Curated links and further reading</p>
      </CardHeader>
      <CardContent>
        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-6`}>
          {report.resources?.articles && (
            <div>
              <h4 className="font-semibold mb-3">Articles</h4>
              <ul className="space-y-2">
                {report.resources.articles.map((article: any, index: number) => (
                  <li key={index}>
                    <a 
                      href={article.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-300 hover:text-blue-200 underline text-sm font-medium"
                    >
                      {article.title}
                    </a>
                    {article.description && (
                      <p className="text-xs text-gray-400 mt-1">{article.description}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {report.resources?.tools && (
            <div>
              <h4 className="font-semibold mb-3">Tools</h4>
              <ul className="space-y-2">
                {report.resources.tools.map((tool: any, index: number) => (
                  <li key={index}>
                    <a 
                      href={tool.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-purple-300 hover:text-purple-200 underline text-sm font-medium"
                    >
                      {tool.name}
                    </a>
                    <p className="text-xs text-gray-400 mt-1">{tool.description}</p>
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

ResearchResources.displayName = 'ResearchResources';
