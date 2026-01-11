# Database Schema Setup Guide

This guide explains how to set up and populate your sports fantasy database schema for The Bench.

## Overview

The database is designed to be:
- **Multi-sport ready** (currently basketball, expandable to other sports)
- **Scalable** for your expected user base (~100 users, 4000 player records)
- **Optimized** for common queries (player stats, popular picks, favorite teams)
- **Simple but effective** - no over-engineering

## Schema Structure

### Core Tables

#### 1. **Sports & Seasons**
- `sports` - Different sports (Basketball, future: Hockey, Soccer, etc.)
- `seasons` - Sport seasons (e.g., "2021-22", "2022-23")

#### 2. **Teams & Players**
- `basketballteams` - Canadian university basketball teams (already exists)
- `players` - Individual players linked to teams and sports

#### 3. **Games & Stats**
- `games` - Individual games between teams
- `player_game_stats` - Player performance in each game (main stats table)

#### 4. **Fantasy/Betting Features**
- `player_props` - Available betting props (points, rebounds, assists, minutes)
- `pick_popularity` - Track how many users pick each option
- `user_favorite_teams` - User's favorite teams (replaces jsonb in profiles)
- Enhanced `parlay_picks` - Links to structured prop data

## Migration Files

Run these migrations in order:

1. `001_create_profiles_and_teams.sql` ✅ (already exists)
2. `002_auto_profile_creation.sql` ✅ (already exists)  
3. `003_create_parlay_schema.sql` ✅ (already exists)
4. `004_add_balance_management.sql` ✅ (already exists)
5. **`005_create_basketball_core_schema.sql`** 🆕 (core basketball tables)
6. **`006_create_pick_tracking_schema.sql`** 🆕 (pick popularity & favorites)
7. **`007_add_helper_functions.sql`** 🆕 (useful query functions)

## Setup Instructions

### 1. Run Migrations

```bash
# If using Supabase CLI
supabase db reset

# Or run each migration manually in Supabase dashboard
```

### 2. Install Python Dependencies

```bash
cd scripts
pip install -r requirements.txt
```

### 3. Set Environment Variables

Create `.env` file in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Import Basketball Data

```bash
cd scripts
python import_basketball_data.py ../playerGameDataAllFinal.csv
```

This script will:
- Create seasons (2021-22, 2022-23, etc.)
- Create players and link them to teams
- Create games between teams
- Import all 50,000+ player game stats
- Handle data validation and error reporting

## Key Features

### 📊 **Useful Query Functions**

The schema includes pre-built functions for common operations:

```sql
-- Get player's last 5 games points
SELECT * FROM get_player_last_n_games(123, 'points', 5);

-- Get player season averages
SELECT * FROM get_player_season_averages(123, '2023-24');

-- Get popular picks for a game
SELECT * FROM get_popular_picks_for_game(456, 10);

-- Get upcoming games for user's favorite teams
SELECT * FROM get_favorite_team_games('user-uuid', 7);

-- Get top scorers this season
SELECT * FROM get_top_performers('points', '2023-24', 10);
```

### 🎯 **Pick Popularity Tracking**

Automatically tracks how many users choose each pick:

```sql
-- Popular picks are automatically updated via triggers
-- View popular picks:
SELECT pp.prop_type, p.name, 
       pop_over.pick_count as over_picks,
       pop_under.pick_count as under_picks
FROM player_props pp
JOIN players p ON pp.player_id = p.id
LEFT JOIN pick_popularity pop_over ON pp.id = pop_over.player_prop_id AND pop_over.pick_type = 'over'
LEFT JOIN pick_popularity pop_under ON pp.id = pop_under.player_prop_id AND pop_under.pick_type = 'under'
WHERE pp.game_id = 123;
```

### ⭐ **Favorite Teams**

Structured favorite teams (replacing jsonb):

```sql
-- Add favorite team
INSERT INTO user_favorite_teams (user_id, team_id, sport_id) 
VALUES ('user-uuid', 1, 1);

-- Get user's favorite teams
SELECT bt.team_name, bt.abbr 
FROM user_favorite_teams uft
JOIN basketballteams bt ON uft.team_id = bt.id
WHERE uft.user_id = 'user-uuid';
```

## Performance Optimizations

### Indexes
- Player stats by player, game, team
- Games by date, teams, season
- Pick popularity by prop and type
- All foreign key relationships

### Query Patterns
- Use the helper functions for common operations
- Leverage indexes for filtering by date, team, player
- Batch operations when possible

## Data Import Results

After running the import script, you'll have:
- **~1,000 unique players** across all teams
- **~800 games** across multiple seasons  
- **~50,000 player game stat records**
- **4 seasons** of historical data
- **All teams** properly linked

## Next Steps

### For MVP Launch:
1. **Run migrations** ✅
2. **Import data** ✅  
3. **Create player props** - You'll need to generate betting lines
4. **Build frontend queries** - Use the helper functions
5. **Test with sample users** - Create picks and verify popularity tracking

### For Future Expansion:
1. **Add new sports** - Insert into `sports` table, create sport-specific team tables
2. **Real-time data** - Set up daily import scripts
3. **Advanced analytics** - Add more helper functions as needed
4. **Performance monitoring** - Add query logging if needed

## Troubleshooting

### Common Issues:

1. **Import fails on team mapping**
   - Check that all team abbreviations in CSV match database
   - Verify `basketballteams` table is populated

2. **Permission errors**
   - Ensure you're using `SUPABASE_SERVICE_ROLE_KEY` not anon key
   - Check RLS policies allow data insertion

3. **Data validation errors**
   - Script handles most edge cases (null values, type conversion)
   - Check error logs for specific issues

### Performance Issues:

1. **Slow queries**
   - Use `EXPLAIN ANALYZE` to check query plans
   - Ensure you're using indexes effectively
   - Consider adding more specific indexes for your use cases

2. **Import too slow**
   - Adjust batch size in import script (default: 100)
   - Run during off-peak hours
   - Consider splitting large imports

## Contact

If you run into issues with the schema or import process, the design prioritizes:
1. **Simplicity** - Easy to understand and modify
2. **Functionality** - Supports all your MVP requirements  
3. **Scalability** - Can grow with your user base
4. **Performance** - Optimized for your expected query patterns

The schema is production-ready for your initial launch and can easily scale as The Bench grows!