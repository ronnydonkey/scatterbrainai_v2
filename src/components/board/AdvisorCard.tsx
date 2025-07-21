import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Check, X, Crown, Star, Gem, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { TIERS, type Advisor } from '@/data/advisorsDirectory';

interface AdvisorCardProps {
  advisor: Advisor;
  isSelected?: boolean;
  onSelect?: () => void;
  onRemove?: () => void;
  variant?: 'default' | 'compact' | 'detailed';
  showActions?: boolean;
}

export const AdvisorCard: React.FC<AdvisorCardProps> = ({
  advisor,
  isSelected = false,
  onSelect,
  onRemove,
  variant = 'default',
  showActions = true
}) => {
  const tierInfo = TIERS[advisor.tier];
  
  const getTierIcon = () => {
    const icons = {
      legendary: Crown,
      elite: Star,
      expert: Gem,
      insider: Flame
    };
    const Icon = icons[advisor.tier];
    return <Icon className="h-3 w-3" />;
  };

  const cardVariants = {
    default: "h-auto",
    compact: "h-32",
    detailed: "h-auto min-h-48"
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`
        relative overflow-hidden border-0 
        bg-gradient-to-br from-white/80 to-white/40 
        backdrop-blur-xl shadow-lg hover:shadow-xl 
        transition-all duration-300 group
        ${cardVariants[variant]}
        ${isSelected ? 'ring-2 ring-purple-400 shadow-purple-200/50' : ''}
      `}>
        {/* Neural Network Background Effect */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-2 left-2 w-16 h-16 rounded-full bg-gradient-to-r from-purple-400 to-blue-400" />
          <div className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-gradient-to-r from-pink-400 to-purple-400" />
          <div className="absolute top-1/2 left-1/2 w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 transform -translate-x-1/2 -translate-y-1/2" />
        </div>

        <CardContent className="p-4 relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <Avatar className={`
                ${variant === 'compact' ? 'h-10 w-10' : 'h-12 w-12'} 
                border-2 border-white shadow-md
                bg-gradient-to-br from-gray-100 to-gray-200
              `}>
                <AvatarFallback className="text-lg font-medium">
                  {advisor.avatar}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate text-sm">
                  {advisor.name}
                </h3>
                <p className="text-xs text-gray-600 truncate">
                  {advisor.role}
                </p>
                {advisor.era && variant === 'detailed' && (
                  <p className="text-xs text-gray-500 mt-1">
                    {advisor.era}
                  </p>
                )}
              </div>
            </div>

            {/* Tier Badge */}
            <Badge 
              variant="outline" 
              className={`
                text-xs font-medium border-0 text-white shadow-sm
                bg-gradient-to-r ${tierInfo.color}
                flex items-center gap-1
              `}
            >
              {getTierIcon()}
              <span className="hidden sm:inline">{tierInfo.label}</span>
            </Badge>
          </div>

          {/* Voice Description */}
          {variant !== 'compact' && (
            <div className="mb-3">
              <p className={`
                text-xs leading-relaxed text-gray-700 
                ${variant === 'detailed' ? 'line-clamp-4' : 'line-clamp-2'}
              `}>
                {advisor.voice}
              </p>
            </div>
          )}

          {/* Category & Specialties */}
          <div className="flex flex-wrap gap-1 mb-3">
            <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
              {advisor.category}
            </Badge>
            {variant === 'detailed' && advisor.specialty && (
              advisor.specialty.slice(0, 2).map((spec, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {spec}
                </Badge>
              ))
            )}
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex gap-2">
              {isSelected ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRemove}
                  className="flex-1 h-8 text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                >
                  <X className="h-3 w-3 mr-1" />
                  Remove
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={onSelect}
                  className="flex-1 h-8 text-xs bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add to Board
                </Button>
              )}
            </div>
          )}

          {/* Selected Indicator */}
          {isSelected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-2 right-2 bg-purple-600 text-white rounded-full p-1"
            >
              <Check className="h-3 w-3" />
            </motion.div>
          )}
        </CardContent>

        {/* Hover Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-purple-400/5 to-blue-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </Card>
    </motion.div>
  );
};