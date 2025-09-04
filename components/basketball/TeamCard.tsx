"use client";

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Users, Star } from 'lucide-react';
import { BasketballTeam } from '@/types/basketball';

interface TeamCardProps {
  team: BasketballTeam;
  isFavorite?: boolean;
  onToggleFavorite?: (teamId: number) => void;
}

export default function TeamCard({ team, isFavorite = false, onToggleFavorite }: TeamCardProps) {
  const handleToggleFavorite = () => {
    if (onToggleFavorite) {
      onToggleFavorite(team.id);
    }
  };

  return (
    <Card className="group relative bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-yellow-400/50 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-400/10 hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-lg leading-tight group-hover:text-yellow-400 transition-colors duration-200 truncate">
              {team.team_name}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <Badge 
                variant="secondary" 
                className="text-xs bg-yellow-400/20 text-yellow-400 border-yellow-400/30 font-semibold"
              >
                {team.abbr}
              </Badge>
            </div>
          </div>
          
          {/* Favorite Button */}
          {onToggleFavorite && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleFavorite}
              className="w-8 h-8 p-0 hover:bg-yellow-400/20 transition-colors duration-200"
            >
              <Star 
                className={`w-4 h-4 transition-colors duration-200 ${
                  isFavorite 
                    ? 'text-yellow-400 fill-current' 
                    : 'text-gray-400 hover:text-yellow-400'
                }`} 
              />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Location */}
          <div className="flex items-center gap-2 text-gray-300">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-sm">
              {team.city}, {team.province}
            </span>
          </div>

          {/* Team Info */}
          <div className="flex items-center gap-2 text-gray-300">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-sm">Basketball Team</span>
          </div>

          {/* Conference/Division (if available) */}
          {team.conference && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs text-gray-400 border-gray-600">
                {team.conference}
              </Badge>
              {team.division && (
                <Badge variant="outline" className="text-xs text-gray-400 border-gray-600">
                  {team.division}
                </Badge>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 text-xs border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500 transition-all duration-200"
            >
              View Players
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 text-xs border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500 transition-all duration-200"
            >
              View Games
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-lg" />
    </Card>
  );
}
