# 🗄️ Database Views Management Guide

## 🔍 **Where to Find Your Views**

### **1. Supabase Dashboard - Table Editor**
```
1. Go to your Supabase project dashboard
2. Click "Table Editor" in the left sidebar
3. Look for "Views" tab alongside your tables
4. You'll see all 5 basketball views listed
```

### **2. Supabase Dashboard - SQL Editor**
```
1. Click "SQL Editor" in the left sidebar
2. Run this query to see all views:
   \dv
   
3. Or run this SQL:
   SELECT schemaname, viewname, definition 
   FROM pg_views 
   WHERE schemaname = 'public';
```

### **3. Database Migrations**
```
Your views are defined in:
supabase/migrations/008_create_basketball_views.sql
```

## 🏀 **Basketball Views Created**

### **View 1: `active_games_view`**
**Purpose**: Optimized games display with team info and status
**Use Case**: Dashboard games list, upcoming games
**Key Fields**: 
- `game_id`, `game_date`, `location`
- `home_team_name`, `away_team_name`
- `game_status` (Today, Tomorrow, Upcoming, Live, Completed)

### **View 2: `player_performance_view`**
**Purpose**: Player statistics and performance metrics
**Use Case**: Player cards, leaderboards, stats display
**Key Fields**:
- `player_name`, `team_name`, `jersey_number`
- `avg_points`, `avg_rebounds`, `avg_assists`
- `games_played`, `total_points`

### **View 3: `popular_picks_view`**
**Purpose**: Betting picks popularity and trends
**Use Case**: Popular picks display, betting insights
**Key Fields**:
- `player_name`, `prop_type`, `over_line`, `under_line`
- `over_picks`, `under_picks`, `total_picks`
- `popular_side` (Over, Under, Even)

### **View 4: `team_performance_view`**
**Purpose**: Team statistics and performance
**Use Case**: Team rankings, performance metrics
**Key Fields**:
- `team_name`, `abbreviation`
- `games_played`, `completed_games`, `upcoming_games`
- `avg_team_points`, `active_players`

### **View 5: `user_dashboard_view`**
**Purpose**: User betting performance and favorites
**Use Case**: User dashboard, profile statistics
**Key Fields**:
- `favorite_teams_count`, `active_picks_count`
- `winning_picks_count`, `losing_picks_count`
- `win_percentage`

## 🚀 **How to Use Views in Your Code**

### **Option 1: Use New View Methods (Recommended)**
```typescript
import { BasketballAPI } from '@/lib/basketball-api';

// Get games using optimized view
const games = await BasketballAPI.getGamesFromView(undefined, 20);

// Get player performance using view
const topPlayers = await BasketballAPI.getPlayerPerformanceFromView('2023-24', 10);

// Get popular picks using view
const popularPicks = await BasketballAPI.getPopularPicksFromView(15);

// Get team performance using view
const teamStats = await BasketballAPI.getTeamPerformanceFromView('2023-24');

// Get user dashboard summary using view
const userStats = await BasketballAPI.getUserDashboardSummary(userId);
```

### **Option 2: Direct Supabase Queries**
```typescript
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

// Query views directly
const { data: games, error } = await supabase
  .from('active_games_view')
  .select('*')
  .eq('game_status', 'Upcoming')
  .limit(10);

const { data: players, error } = await supabase
  .from('player_performance_view')
  .select('*')
  .gte('avg_points', 20)
  .order('avg_points', { ascending: false });
```

## 📊 **Performance Benefits of Views**

### **Before (Complex Joins)**
```sql
-- Old way - multiple joins in each query
SELECT g.*, ht.team_name as home_team, at.team_name as away_team
FROM games g
JOIN basketballteams ht ON g.home_team_id = ht.id
JOIN basketballteams at ON g.away_team_id = at.id
JOIN seasons s ON g.season_id = s.id
WHERE g.game_date >= CURRENT_DATE - INTERVAL '30 days';
```

### **After (Optimized View)**
```sql
-- New way - pre-computed view with indexes
SELECT * FROM active_games_view 
WHERE game_status IN ('Today', 'Tomorrow', 'Upcoming');
```

## 🔧 **Managing Views**

### **Create New Views**
```sql
-- In Supabase SQL Editor
CREATE OR REPLACE VIEW public.your_new_view AS
SELECT column1, column2, column3
FROM your_table
WHERE your_condition;
```

### **Modify Existing Views**
```sql
-- Update view definition
CREATE OR REPLACE VIEW public.active_games_view AS
SELECT 
  -- Your new column selection
FROM your_tables
WHERE your_conditions;
```

### **Drop Views**
```sql
-- Remove a view
DROP VIEW IF EXISTS public.your_view_name;
```

### **View Permissions**
```sql
-- Grant access to authenticated users
GRANT SELECT ON public.your_view TO authenticated;

-- Revoke access
REVOKE SELECT ON public.your_view FROM authenticated;
```

## 📈 **Monitoring View Performance**

### **Check View Usage**
```sql
-- See which views are being used
SELECT schemaname, viewname, definition 
FROM pg_views 
WHERE schemaname = 'public';

-- Check view statistics
SELECT schemaname, tablename, n_tup_ins, n_tup_upd, n_tup_del
FROM pg_stat_user_tables
WHERE tablename LIKE '%view%';
```

### **View Performance Tips**
1. **Use indexes** on columns frequently filtered
2. **Limit results** with `.limit()` in queries
3. **Cache results** for frequently accessed data
4. **Monitor query performance** in Supabase dashboard

## 🎯 **Best Practices**

### **✅ Do's**
- Use views for **complex, frequently-run queries**
- **Index columns** used in WHERE clauses
- **Grant appropriate permissions** to views
- **Test view performance** with real data

### **❌ Don'ts**
- Don't create views for **simple, single-table queries**
- Don't **over-complicate** view logic
- Don't **forget to update** views when tables change
- Don't **ignore performance** - monitor and optimize

## 🚀 **Next Steps**

1. **Run the migration**: Apply `008_create_basketball_views.sql`
2. **Test the views**: Use the new API methods
3. **Monitor performance**: Check query execution times
4. **Create custom views**: Add views for your specific needs
5. **Optimize queries**: Use views in your components

## 💡 **Pro Tips**

- **Views are read-only** by default - perfect for data display
- **Views automatically update** when underlying data changes
- **Views can be materialized** for even better performance
- **Views work with RLS** - users only see data they're allowed to see
- **Views can be nested** - create views of views for complex logic

Your basketball platform now has a **professional, optimized data layer** that will scale beautifully! 🏀
