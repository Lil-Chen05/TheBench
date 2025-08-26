"use client";

import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';
import { GameWithTeams } from '@/types/basketball';
import GameCard from './GameCard';

interface GamesListProps {
  games: GameWithTeams[];
  loading: boolean;
  title?: string;
  showFilters?: boolean;
  maxGames?: number;
  gameType?: string;
}

export default function GamesList({ 
  games, 
  loading,
  title,
  showFilters,
  maxGames,
  gameType 
}: GamesListProps) {
  // Remove ALL existing useState for games loading
  // Remove ALL existing useEffect for loading games
  // Remove ALL API calls inside this component
  
  if (loading) {
    return (
      <Card className="bg-white dark:bg-gray-900">
        <CardContent className="flex items-center justify-center p-8">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-yellow-400" />
            <span className="text-gray-600 dark:text-gray-400">Loading games...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!games || games.length === 0) {
    return (
      <Card className="bg-white dark:bg-gray-900">
        <CardContent className="p-8 text-center">
          <div className="w-12 h-12 bg-gray-400 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-white font-bold text-lg">🏀</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No games found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Try adjusting your filters or search terms.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game, index) => (
          <GameCard
            key={game.id || index}
            game={game}
            onViewProps={(gameId) => console.log('View props for game:', gameId)}
          />
        ))}
      </div>
    </div>
  );
}
