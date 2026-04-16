"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Trophy, Users } from 'lucide-react';
import { GameWithTeams } from '@/types/basketball';
import Link from 'next/link';

interface GameCardProps {
  game: GameWithTeams;
  showActions?: boolean;
  onViewProps?: (gameId: number) => void;
}

export default function GameCard({ game, showActions = true, onViewProps }: GameCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };



  const getGameStatus = () => {
    if (game.is_completed) {
      return { text: 'Final', variant: 'secondary' as const };
    }
    
    const gameDate = new Date(game.game_date);
    const now = new Date();
    const diffTime = gameDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return { text: 'Today', variant: 'default' as const };
    } else if (diffDays === 1) {
      return { text: 'Tomorrow', variant: 'default' as const };
    } else if (diffDays > 1) {
      return { text: `${diffDays} days`, variant: 'outline' as const };
    } else {
      return { text: 'Live', variant: 'destructive' as const };
    }
  };

  const status = getGameStatus();

  return (
    <Card className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 hover:border-yellow-400 dark:hover:border-yellow-400 transition-all duration-300 hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {formatDate(game.game_date)}
            </span>
          </div>
          <Badge variant={status.variant} className="text-xs font-medium">
            {status.text}
          </Badge>
        </div>
        
        {game.location && (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <MapPin className="w-4 h-4" />
            <span>{game.location}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {/* Teams Section */}
        <div className="space-y-4">
          {/* Home Team */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-sm">
                  {game.home_team.abbreviation}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {game.home_team.team_name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Home Team
                </p>
              </div>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                HOME
              </Badge>
            </div>
          </div>

          {/* VS Divider */}
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-gray-700 dark:text-gray-300 font-bold text-sm">VS</span>
            </div>
          </div>

          {/* Away Team */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {game.away_team.abbreviation}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {game.away_team.team_name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Away Team
                </p>
              </div>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                AWAY
              </Badge>
            </div>
          </div>
        </div>

        {/* Season Info */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Trophy className="w-4 h-4" />
              <span>{game.season.name}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Users className="w-4 h-4" />
              <span>View Props</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <Button 
              onClick={() => onViewProps?.(game.id)}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
            >
              View Player Props
            </Button>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setIsFavorite(!isFavorite)}
              >
                {isFavorite ? '❤️' : '🤍'} Favorite
              </Button>
              
              <Link href={`/dashboard/basketball/game/${game.id}`} className="flex-1">
                <Button variant="outline" className="w-full">
                  Game Details
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
