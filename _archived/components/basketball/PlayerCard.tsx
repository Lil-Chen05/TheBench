"use client";

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
      className="group relative bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-yellow-400/50 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-400/10 hover:-translate-y-1 cursor-pointer"
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-lg leading-tight group-hover:text-yellow-400 transition-colors duration-200 h-12 flex items-center" style={{wordBreak: 'break-word'}}>
              {player.name}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <Badge 
                variant="secondary" 
                className="text-xs bg-yellow-400/20 text-yellow-400 border-yellow-400/30 font-semibold"
              >
                #{player.jersey_number || '?'}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Team Name */}
          <div className="flex items-center gap-2 text-gray-300">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-sm">
              {player.basketballteams.team_name}
            </span>
          </div>

          {/* Action Button */}
          {showDetails && (
            <div className="pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500 transition-all duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
                }}
              >
                <User className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </div>
          )}
        </div>
      </CardContent>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-lg" />
    </Card>
  );
});

PlayerCard.displayName = 'PlayerCard';

export default PlayerCard;
