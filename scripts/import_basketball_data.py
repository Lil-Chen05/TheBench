#!/usr/bin/env python3
"""
Basketball Data Import Script for Supabase
Imports player game stats from CSV into the database
"""

import csv
import os
import sys
from datetime import datetime
from typing import Dict, List, Optional
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Supabase client
def get_supabase_client() -> Client:
    url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")  # Use service role for data import
    
    if not url or not key:
        raise ValueError("Missing Supabase credentials in environment variables")
    
    return create_client(url, key)

class BasketballDataImporter:
    def __init__(self, csv_file_path: str):
        self.csv_file_path = csv_file_path
        self.supabase = get_supabase_client()
        self.team_mapping = {}
        self.player_mapping = {}
        self.game_mapping = {}
        self.season_mapping = {}
        
    def load_existing_data(self):
        """Load existing teams, players, games, and seasons for mapping"""
        print("Loading existing data for mapping...")
        
        # Load teams
        teams_response = self.supabase.table("basketballteams").select("id,abbr,team_name").execute()
        self.team_mapping = {team["abbr"]: team for team in teams_response.data}
        
        # Load players
        players_response = self.supabase.table("players").select("id,name,team_id").execute()
        self.player_mapping = {f"{player['name']}_{player['team_id']}": player for player in players_response.data}
        
        # Load seasons
        seasons_response = self.supabase.table("seasons").select("id,name").execute()
        self.season_mapping = {season["name"]: season for season in seasons_response.data}
        
        # Load games
        games_response = self.supabase.table("games").select("id,game_date,home_team_id,away_team_id").execute()
        for game in games_response.data:
            key = f"{game['game_date']}_{game['home_team_id']}_{game['away_team_id']}"
            self.game_mapping[key] = game
    
    def create_or_get_season(self, season_name: str) -> int:
        """Create season if it doesn't exist"""
        if season_name in self.season_mapping:
            return self.season_mapping[season_name]["id"]
        
        # Create new season
        season_data = {
            "sport_id": 1,  # Basketball
            "name": season_name,
            "is_active": season_name == "2024-25"  # Make current season active
        }
        
        response = self.supabase.table("seasons").insert(season_data).execute()
        season_id = response.data[0]["id"]
        self.season_mapping[season_name] = {"id": season_id, "name": season_name}
        
        print(f"Created season: {season_name}")
        return season_id
    
    def create_or_get_player(self, player_name: str, jersey_number: Optional[int], team_id: int) -> int:
        """Create player if they don't exist"""
        player_key = f"{player_name}_{team_id}"
        
        if player_key in self.player_mapping:
            return self.player_mapping[player_key]["id"]
        
        # Create new player
        player_data = {
            "name": player_name,
            "jersey_number": jersey_number,
            "team_id": team_id,
            "sport_id": 1  # Basketball
        }
        
        response = self.supabase.table("players").insert(player_data).execute()
        player_id = response.data[0]["id"]
        self.player_mapping[player_key] = {"id": player_id, "name": player_name, "team_id": team_id}
        
        return player_id
    
    def create_or_get_game(self, game_date: str, home_team_id: int, away_team_id: int, 
                          season_id: int, location: str) -> int:
        """Create game if it doesn't exist"""
        game_key = f"{game_date}_{home_team_id}_{away_team_id}"
        
        if game_key in self.game_mapping:
            return self.game_mapping[game_key]["id"]
        
        # Create new game
        game_data = {
            "season_id": season_id,
            "game_date": game_date,
            "home_team_id": home_team_id,
            "away_team_id": away_team_id,
            "location": location,
            "is_completed": True  # Historical data is completed
        }
        
        response = self.supabase.table("games").insert(game_data).execute()
        game_id = response.data[0]["id"]
        self.game_mapping[game_key] = {"id": game_id, "game_date": game_date, 
                                      "home_team_id": home_team_id, "away_team_id": away_team_id}
        
        return game_id
    
    def safe_float(self, value: str) -> Optional[float]:
        """Safely convert string to float"""
        if not value or value == '':
            return None
        try:
            return float(value)
        except ValueError:
            return None
    
    def safe_int(self, value: str) -> Optional[int]:
        """Safely convert string to int"""
        if not value or value == '':
            return None
        try:
            return int(float(value))  # Handle cases like "13.0"
        except ValueError:
            return None
    
    def process_csv_row(self, row: Dict[str, str]) -> Optional[Dict]:
        """Process a single CSV row into database format"""
        try:
            # Get team info
            team_abbr = row["Abbr"]
            if team_abbr not in self.team_mapping:
                print(f"Warning: Team {team_abbr} not found in database")
                return None
            
            team_info = self.team_mapping[team_abbr]
            
            # Determine opponent team
            opponent_name = row["Opponent"]
            opponent_team = None
            for abbr, team in self.team_mapping.items():
                if team["team_name"] == opponent_name:
                    opponent_team = team
                    break
            
            if not opponent_team:
                print(f"Warning: Opponent team {opponent_name} not found")
                return None
            
            # Determine home/away
            home_away = row["HomeAway"]
            if home_away == "Home":
                home_team_id = team_info["id"]
                away_team_id = opponent_team["id"]
            else:
                home_team_id = opponent_team["id"]
                away_team_id = team_info["id"]
            
            # Create or get season
            season_id = self.create_or_get_season(row["Season"])
            
            # Create or get game
            game_date = datetime.strptime(row["Date"], "%Y-%m-%d").date().isoformat()
            game_id = self.create_or_get_game(
                game_date, home_team_id, away_team_id, season_id, row["Location"]
            )
            
            # Create or get player
            player_name = row["PlayerName"]
            jersey_number = self.safe_int(row["Jersey"])
            player_id = self.create_or_get_player(player_name, jersey_number, team_info["id"])
            
            # Prepare player game stats
            stats_data = {
                "player_id": player_id,
                "game_id": game_id,
                "team_id": team_info["id"],
                "is_starter": row["StarterFlag"] == "True",
                "minutes_played": self.safe_int(row["Mins"]) or 0,
                "points": self.safe_int(row["Pts"]) or 0,
                "field_goals_made": self.safe_int(row["FGM"]) or 0,
                "field_goals_attempted": self.safe_int(row["FGA"]) or 0,
                "field_goal_percentage": self.safe_float(row["FG_Pct"]),
                "three_point_made": self.safe_int(row["3PTM"]) or 0,
                "three_point_attempted": self.safe_int(row["3PTA"]) or 0,
                "three_point_percentage": self.safe_float(row["3PT_Pct"]),
                "free_throws_made": self.safe_int(row["FTM"]) or 0,
                "free_throws_attempted": self.safe_int(row["FTA"]) or 0,
                "free_throw_percentage": self.safe_float(row["FT_Pct"]),
                "true_shooting_percentage": self.safe_float(row["TS_Pct"]),
                "effective_field_goal_percentage": self.safe_float(row["eFG_Pct"]),
                "offensive_rebounds": self.safe_int(row["Reb_O"]) or 0,
                "defensive_rebounds": self.safe_int(row["Reb_D"]) or 0,
                "total_rebounds": self.safe_int(row["Reb_T"]) or 0,
                "assists": self.safe_int(row["AST"]) or 0,
                "turnovers": self.safe_int(row["TO"]) or 0,
                "steals": self.safe_int(row["STL"]) or 0,
                "blocks": self.safe_int(row["BLK"]) or 0,
                "personal_fouls": self.safe_int(row["PF"]) or 0
            }
            
            return stats_data
            
        except Exception as e:
            print(f"Error processing row: {e}")
            print(f"Row data: {row}")
            return None
    
    def import_data(self, batch_size: int = 100):
        """Import CSV data in batches"""
        print(f"Starting import from {self.csv_file_path}")
        
        # Load existing data for mapping
        self.load_existing_data()
        
        batch = []
        processed_count = 0
        error_count = 0
        
        with open(self.csv_file_path, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            
            for row in reader:
                processed_count += 1
                
                # Process row
                stats_data = self.process_csv_row(row)
                
                if stats_data:
                    batch.append(stats_data)
                else:
                    error_count += 1
                
                # Insert batch when it reaches batch_size
                if len(batch) >= batch_size:
                    try:
                        response = self.supabase.table("player_game_stats").upsert(
                            batch, on_conflict="player_id,game_id"
                        ).execute()
                        print(f"Inserted batch of {len(batch)} records. Total processed: {processed_count}")
                        batch = []
                    except Exception as e:
                        print(f"Error inserting batch: {e}")
                        error_count += len(batch)
                        batch = []
                
                # Progress update
                if processed_count % 1000 == 0:
                    print(f"Processed {processed_count} rows, {error_count} errors")
        
        # Insert remaining batch
        if batch:
            try:
                response = self.supabase.table("player_game_stats").upsert(
                    batch, on_conflict="player_id,game_id"
                ).execute()
                print(f"Inserted final batch of {len(batch)} records")
            except Exception as e:
                print(f"Error inserting final batch: {e}")
                error_count += len(batch)
        
        print(f"\nImport completed!")
        print(f"Total rows processed: {processed_count}")
        print(f"Total errors: {error_count}")
        print(f"Success rate: {((processed_count - error_count) / processed_count * 100):.1f}%")

def main():
    if len(sys.argv) != 2:
        print("Usage: python import_basketball_data.py <csv_file_path>")
        sys.exit(1)
    
    csv_file_path = sys.argv[1]
    
    if not os.path.exists(csv_file_path):
        print(f"Error: File {csv_file_path} not found")
        sys.exit(1)
    
    importer = BasketballDataImporter(csv_file_path)
    importer.import_data()

if __name__ == "__main__":
    main()