"use client";

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trophy } from 'lucide-react';
import Link from 'next/link';

interface FavoriteSportsDisplayProps {
  favoriteSports: string[];
}

export default function FavoriteSportsDisplay({ favoriteSports }: FavoriteSportsDisplayProps) {
  const sports = [
    { id: 'basketball', name: 'Basketball', icon: '🏀', available: true },
    { id: 'womens-basketball', name: 'Women\'s Basketball', icon: '🏀', available: false },
    { id: 'football', name: 'Football', icon: '🏈', available: false },
    { id: 'hockey', name: 'Hockey', icon: '🏒', available: false },
    { id: 'soccer', name: 'Soccer', icon: '⚽', available: false },
  ];

  const availableSports = sports.filter(sport => sport.available);
  const userSports = sports.filter(sport => favoriteSports.includes(sport.id));

  return (
    <Card className="group relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-gray-900/95 to-black/95 group-hover:from-black/90 group-hover:via-gray-800/95 group-hover:to-black/90 transition-all duration-500 rounded-lg"></div>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-yellow-400/10 via-yellow-400/20 to-yellow-400/10 transition-opacity duration-700 rounded-lg"></div>
      
      <div className="relative z-10 p-6 rounded-lg border-2 border-yellow-400/30 shadow-lg group-hover:border-yellow-400/60 transition-all duration-300 group-hover:scale-105 h-full flex flex-col justify-between min-h-[200px]">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-black text-yellow-400 uppercase tracking-wide pixelated-text group-hover:text-yellow-300 transition-colors duration-300">
              Your Sports
            </h3>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-semibold">{userSports.length}</span>
            </div>
          </div>
          
          {userSports.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-yellow-300/80 text-sm mb-3">No favorite sports yet</p>
              <Link href="/dashboard/basketball">
                <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded transition-colors duration-300 text-sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Explore Basketball
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {userSports.map((sport) => (
                <div key={sport.id} className="flex items-center justify-between p-2 bg-gray-800/50 rounded border border-yellow-400/20">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{sport.icon}</span>
                    <span className="text-yellow-300 text-sm font-medium">{sport.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-green-400 text-xs">●</span>
                    <span className="text-green-400 text-xs">Active</span>
                  </div>
                </div>
              ))}
              
              {availableSports.length > userSports.length && (
                <div className="pt-2">
                  <Link href="/dashboard/basketball">
                    <Button variant="outline" className="w-full text-xs border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/20 hover:text-yellow-300 transition-colors duration-200">
                      <Plus className="w-3 h-3 mr-2" />
                      Add More Sports
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
          
          {/* Coming Soon Section */}
          <div className="mt-4 pt-3 border-t border-yellow-400/20">
            <p className="text-yellow-300/60 text-xs mb-2">Coming Soon:</p>
            <div className="flex flex-wrap gap-1">
              {sports.filter(sport => !sport.available).map((sport) => (
                <span key={sport.id} className="text-yellow-300/40 text-xs px-2 py-1 bg-gray-800/30 rounded border border-yellow-400/10">
                  {sport.icon} {sport.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
