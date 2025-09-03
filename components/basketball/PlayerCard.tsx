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
      className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 hover:border-yellow-400 dark:hover:border-yellow-400 transition-all duration-300 cursor-pointer group"
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
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg truncate group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors duration-200">
                {player.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant="outline" 
                  className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs"
                >
                  {player.basketballteams.team_name}
                </Badge>
                <Badge 
                  variant="secondary" 
                  className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  {player.basketballteams.abbr}
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className="flex flex-col items-end gap-1">
            <Badge 
              variant={player.is_active ? "default" : "secondary"}
              className={`text-xs ${
                player.is_active 
                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              {player.is_active ? 'Active' : 'Inactive'}
            </Badge>
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
            className="w-full border-yellow-400 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-400 hover:text-black transition-colors duration-200"
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
