"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface PlayerGameData {
  id: number;
  season: string;
  date: string;
  location: string;
  team: string;
  opponent: string;
  abbr: string;
  jersey: number;
  player_name: string;
  starter_flag: boolean;
  mins: number;
  three_pt_pct: number;
  fg_pct: number;
  ft_pct: number;
  reb_o: number;
  reb_d: number;
  reb_t: number;
  pf: number;
  ast: number;
  turnovers: number;
  blk: number;
  stl: number;
  pts: number;
  three_ptm: number;
  three_pta: number;
  fgm: number;
  fga: number;
  ftm: number;
  fta: number;
  ts_pct: number;
  efg_pct: number;
  home_away: string;
}

export default function BasketballSearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("player_name");
  const [results, setResults] = useState<PlayerGameData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError("");

    try {
      let query = supabase
        .from('player_game_data')
        .select('*');

      if (searchType === 'player_name') {
        query = query.ilike('player_name', `%${searchTerm}%`);
      } else if (searchType === 'team') {
        query = query.ilike('team', `%${searchTerm}%`);
      } else if (searchType === 'opponent') {
        query = query.ilike('opponent', `%${searchTerm}%`);
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;

      setResults(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat relative super-pixelated-bg" style={{backgroundImage: "url('https://images.sidearmdev.com/convert?url=https%3a%2f%2fdxbhsrqyrr690.cloudfront.net%2fsidearm.nextgen.sites%2fmcgill.sidearmsports.com%2fimages%2f2019%2f11%2f15%2fBBALL_m_Whyne_Quarry_McG_UQAM_2018_19_MG.jpg&type=webp')"}}>
      <div className="absolute inset-0 bg-black/20"></div>
      
      <main className="relative z-10 ml-[60px] mt-[60px] flex flex-col gap-8 p-10">
        {/* Header */}
        <div className="group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-yellow-300/10 to-yellow-400/10 group-hover:from-yellow-400/20 group-hover:via-yellow-300/20 group-hover:to-yellow-400/20 transition-all duration-500 rounded-xl"></div>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-yellow-400/5 via-yellow-300/10 to-yellow-400/5 transition-opacity duration-700 rounded-xl"></div>
          
          <div className="relative z-10 bg-black/10 backdrop-blur-sm text-yellow-400 text-3xl font-black p-6 rounded-xl border-2 border-yellow-400/40 shadow-2xl group-hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02] group-hover:text-yellow-300">
            <span className="pixelated-text uppercase tracking-wide drop-shadow-lg">Basketball Player Search</span>
          </div>
        </div>

        {/* Search Form */}
        <div className="group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-gray-900/95 to-black/95 group-hover:from-black/90 group-hover:via-gray-800/95 group-hover:to-black/90 transition-all duration-500 rounded-lg"></div>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-yellow-400/10 via-yellow-400/20 to-yellow-400/10 transition-opacity duration-700 rounded-lg"></div>
          
          <div className="relative z-10 p-6 rounded-lg border-2 border-yellow-400/30 shadow-lg group-hover:border-yellow-400/60 transition-all duration-300">
            <div className="flex flex-col md:flex-row gap-4">
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="px-4 py-3 bg-black/30 border-2 border-yellow-400/30 rounded-lg text-yellow-400 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 transition-all duration-200 font-bold"
              >
                <option value="player_name">Player Name</option>
                <option value="team">Team</option>
                <option value="opponent">Opponent</option>
              </select>
              
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Search by ${searchType.replace('_', ' ')}...`}
                className="flex-1 px-4 py-3 bg-black/30 border-2 border-yellow-400/30 rounded-lg text-yellow-400 placeholder-yellow-400/50 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 transition-all duration-200 font-bold"
              />
              
              <button
                onClick={handleSearch}
                disabled={loading || !searchTerm.trim()}
                className={cn(
                  "px-8 py-3 rounded-lg font-black uppercase tracking-wide transition-all duration-200",
                  loading || !searchTerm.trim()
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-yellow-400 text-black hover:bg-yellow-300 hover:scale-105 shadow-lg hover:shadow-xl"
                )}
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/50 border-2 border-red-500 rounded-lg p-4 text-red-300">
            <p className="font-bold">Error: {error}</p>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-gray-900/95 to-black/95 transition-all duration-500 rounded-lg"></div>
            
            <div className="relative z-10 p-6 rounded-lg border-2 border-yellow-400/30 shadow-lg">
              <h3 className="text-xl font-black text-yellow-400 mb-4 uppercase tracking-wide pixelated-text">
                Search Results ({results.length})
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-yellow-400/30">
                      <th className="text-left p-3 text-yellow-400 font-black">Player</th>
                      <th className="text-left p-3 text-yellow-400 font-black">Team</th>
                      <th className="text-left p-3 text-yellow-400 font-black">Opponent</th>
                      <th className="text-left p-3 text-yellow-400 font-black">Date</th>
                      <th className="text-left p-3 text-yellow-400 font-black">Points</th>
                      <th className="text-left p-3 text-yellow-400 font-black">Rebounds</th>
                      <th className="text-left p-3 text-yellow-400 font-black">Assists</th>
                      <th className="text-left p-3 text-yellow-400 font-black">FG%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result) => (
                      <tr key={result.id} className="border-b border-yellow-400/10 hover:bg-yellow-400/5 transition-colors duration-200">
                        <td className="p-3 text-yellow-300 font-bold">{result.player_name}</td>
                        <td className="p-3 text-yellow-100">{result.team}</td>
                        <td className="p-3 text-yellow-100">{result.opponent}</td>
                        <td className="p-3 text-yellow-100">{new Date(result.date).toLocaleDateString()}</td>
                        <td className="p-3 text-yellow-300 font-bold">{result.pts}</td>
                        <td className="p-3 text-yellow-100">{result.reb_t}</td>
                        <td className="p-3 text-yellow-100">{result.ast}</td>
                        <td className="p-3 text-yellow-100">{(result.fg_pct * 100).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}