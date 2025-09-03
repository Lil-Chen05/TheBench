"use client";

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, MapPin } from 'lucide-react';
import { PlayerWithTeam } from '@/types/basketball';

interface PlayerCardProps {
  player: PlayerWithTeam;
  onViewDetails?: (player: PlayerWithTeam) => void;
  showDetails?: boolean;
}

const PlayerCard = React.memo<PlayerCardProps>(({ 
  player, 
  onViewDetails,
  showDetails = false 
}) => {
  const handleClick = () => {
    if (onViewDetails) {
      onViewDetails(player);
    }
  };

  return (
    <Card 
      className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-2 border-gray-200 dark:border-gray-700 hover:border-yellow-400 dark:hover:border-yellow-400 hover:shadow-xl transition-all duration-300 cursor-pointer group shadow-lg"
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Jersey Number Circle */}
            <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center group-hover:bg-yellow-500 transition-colors duration-200">
              <span className="text-black font-bold text-lg">
                {player.jersey_number || '?'}
              </span>
            </div>
            
            {/* Player Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg leading-tight group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors duration-200" style={{wordBreak: 'break-word'}}>
                {player.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant="secondary" 
                  className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-semibold"
                >
                  {player.basketballteams.abbr}
                </Badge>
              </div>
            </div>
          </div>
          

        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Team Location */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
          <MapPin className="w-4 h-4" />
          <span>{player.basketballteams.city}, {player.basketballteams.province}</span>
        </div>

        {/* Action Button */}
        {showDetails && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full border-yellow-400 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-400 hover:text-black transition-all duration-200 hover:scale-105"
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            <User className="w-4 h-4 mr-2" />
            View Details
          </Button>
        )}
      </CardContent>
    </Card>
  );
});

PlayerCard.displayName = 'PlayerCard';

export default PlayerCard;
