import { Brain } from 'lucide-react';

interface DetectedTopic {
  topic: string;
  confidence: number;
}

interface UserProfile {
  adaptationLevel: number;
  topInterests: string[];
  totalInsights: number;
}

interface AdaptationIndicatorProps {
  userProfile?: UserProfile;
  detectedTopics?: DetectedTopic[];
}

export const AdaptationIndicator = ({ userProfile, detectedTopics }: AdaptationIndicatorProps) => {
  if (!userProfile) return null;
  
  const adaptationLevel = userProfile.adaptationLevel || 0;
  const totalInsights = userProfile.totalInsights || 0;
  
  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-4 mb-6 border border-purple-500/20">
      <div className="flex items-center gap-3 mb-3">
        <Brain className="w-5 h-5 text-purple-400" />
        <span className="text-white font-medium">
          Brain Adaptation: {Math.round(adaptationLevel * 100)}%
        </span>
        <span className="text-slate-400 text-sm">
          ({totalInsights} insights analyzed)
        </span>
      </div>
      
      <div className="w-full bg-slate-700 rounded-full h-2 mb-3">
        <div 
          className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${adaptationLevel * 100}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between items-center text-sm">
        <span className="text-slate-400">
          {totalInsights < 5 
            ? "Learning your interests..."
            : totalInsights < 15
            ? "Understanding your patterns..."
            : "Fully adapted to your thinking style"
          }
        </span>
        
        {detectedTopics?.length > 0 && (
          <div className="flex gap-1">
            {detectedTopics.slice(0, 2).map(({ topic }) => (
              <span key={topic} className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                {topic}
              </span>
            ))}
          </div>
        )}
      </div>
      
      {userProfile.topInterests?.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-700">
          <p className="text-xs text-slate-500 mb-2">Your main interests:</p>
          <div className="flex flex-wrap gap-1">
            {userProfile.topInterests.map((interest) => (
              <span key={interest} className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};