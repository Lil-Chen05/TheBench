# The Bench - AI Sports Betting Platform Development Plan

## Project Overview
Full-stack sports betting platform for Canadian university athletics (USports Basketball), built with Next.js 15, Supabase, and TypeScript. Currently has complete authentication system and betting interface with mock data. Goal: Integrate AI predictions and real sports data.

**Live Demo:** https://playthebench.vercel.app

## Current Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript  
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Styling:** Tailwind CSS + shadcn/ui
- **Deployment:** Vercel

## Current Data Situation
- 2 Python scripts that scrape USports Basketball data locally
- Covers last 3 years of matches
- Basic processing only
- Runs manually on local machine
- Plans to expand to more sports and years

## Business Model Understanding

### How Sportsbooks Actually Make Money (Priority Order):
1. **House Edge/Vig (70% of profit)** - Built-in margin on every bet (e.g., -110/-110 odds = 4.8% edge)
2. **Volume Balancing (25% of profit)** - Keep equal money on both sides
3. **Risk Management (4% of profit)** - Betting limits, fraud detection
4. **Prediction Accuracy (1% of profit)** - "Good enough" predictions, not perfection

### Key Insight: 
Even with mediocre predictions (48% accuracy), you profit from house edge if volume is balanced. Perfect predictions aren't necessary for profitability.

## Betting Mechanics
- **Lines/Spreads:** Point thresholds (e.g., 14.5 points) - set 2 days before game, don't change
- **Odds:** Payout multipliers (+100, -120) - change constantly based on betting volume until 1 hour before game
- **Parlay Odds:** Multiplicative with "parlay tax" (slightly worse odds)
- **No live betting during games**

## Technology Choices Explained

### Why XGBoost > TensorFlow for Sports Betting:
- **Industry Standard:** Major sportsbooks use gradient boosting, not deep learning
- **Data Type:** Sports data is tabular/structured, not unstructured
- **Performance:** Usually outperforms neural networks on sports data
- **Speed:** Faster training and inference
- **Interpretability:** Can explain which features matter most
- **Resource Efficiency:** Smaller models, less infrastructure needed

### Odds Adjustment Strategy:
- **Industry Standard:** Rule-based mathematical formulas, NOT ML models
- **Reason:** Need real-time updates (seconds), regulatory transparency
- **Implementation:** Simple volume-based adjustments with house edge preservation

## Revised Priority Framework

### Most Important (80% of effort): Data Pipeline Architecture
1. **Automated scraping and data collection**
2. **Data validation and cleaning**  
3. **Feature engineering pipeline**
4. **Efficient database schema design**
5. **Real-time data updates**

### Moderately Important (15% of effort): ML Implementation
1. **Separate XGBoost models per statistic** (points, rebounds, minutes, assists)
2. **Model retraining automation** (incremental updates after each game)
3. **Prediction accuracy monitoring**

### Least Important (5% of effort): Odds Mathematics
1. **Simple rule-based odds adjustment formulas**
2. **Volume balancing algorithms**

## Proposed Architecture

### Phase 1: MVP (Free/Nearly Free)
```
Data Pipeline:
Python Scripts (GitHub Actions) → Data Processing → Supabase PostgreSQL → Next.js App

ML Pipeline:
Raw Data → Feature Engineering → XGBoost Models → Predictions → Database Storage

Deployment:
- GitHub Actions (2000 free minutes/month)
- Supabase Free Tier
- Vercel Free Tier
```

### Phase 2: Production Scaling (When 100+ users)
- Supabase Pro ($25/month)
- Railway Pro or Google Cloud Run for model serving
- Redis for caching predictions
- Advanced job scheduling with Temporal

## Database Schema Design

### Core Tables:
```sql
-- Teams table
teams (id, name, university, conference, created_at)

-- Players table  
players (id, name, team_id, position, jersey_number, active, created_at)

-- Games table (central hub)
games (id, home_team_id, away_team_id, game_date, season, game_type, home_score, away_score, status, created_at)

-- Player Game Stats (raw data)
player_stats (id, player_id, game_id, minutes_played, points, rebounds, assists, steals, blocks, turnovers, field_goals_made, field_goals_attempted, three_pointers_made, three_pointers_attempted, free_throws_made, free_throws_attempted, created_at)

-- Feature Store (ML-ready data)
player_features (id, player_id, game_id, points_last_5_avg, points_last_10_avg, minutes_last_5_avg, rebounds_last_5_avg, points_vs_opponent_avg, minutes_vs_opponent_avg, points_trend_last_5, home_away_split, days_rest, created_at)

-- Betting Infrastructure
predictions (player_id, game_id, stat_type, predicted_value, confidence, created_at)
betting_lines (game_id, player_id, stat_type, line_value, over_odds, under_odds, updated_at)
bet_volumes (line_id, over_volume, under_volume)
```

## Implementation Timeline

### Week 1: Data Pipeline Foundation
- Move Python scripts to GitHub Actions
- Set up automated scraping workflow
- Design and implement database schema
- Create data validation and cleaning processes

### Week 2: Feature Engineering
- Build rolling averages calculation
- Implement matchup-specific features
- Create trend analysis features
- Automate feature pipeline

### Week 3: ML Model Development
- Train separate XGBoost models for each statistic
- Deploy models to Supabase Edge Functions or FastAPI
- Implement prediction generation and storage
- Set up model retraining automation

### Week 4: Integration and Testing
- Integrate predictions with Next.js frontend
- Implement rule-based odds adjustment
- Create real-time odds updates
- End-to-end testing and optimization

## Key Success Factors
1. **Robust data pipeline** - Most critical component
2. **Consistent data quality** - Better than perfect predictions
3. **Simple, reliable odds system** - Mathematical formulas over ML complexity
4. **Scalable architecture** - Start free, scale gradually
5. **Volume balancing focus** - Core to profitability

## Next Steps
Begin with Phase 1 implementation, starting with GitHub Actions setup for automated data collection and processing pipeline design.
