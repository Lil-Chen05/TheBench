# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Start dev server with Turbopack at localhost:3000

# Build & Deploy
npm run build        # Production build
npm run start        # Start production server

# Code Quality
npm run lint         # ESLint check
```

## Environment Setup

Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your-anon-key-here
NODE_ENV=development
```

## Architecture

### Tech Stack
- **Next.js 15** with App Router and server components
- **Supabase** for PostgreSQL database, authentication, and Row Level Security (RLS)
- **Tailwind CSS + shadcn/ui** (Radix UI primitives) for styling
- **TypeScript** throughout

### Route Structure
```
app/
  page.tsx                   # Landing/marketing page
  layout.tsx                 # Root layout with ThemeProvider
  auth/                      # Auth flows (login, sign-up, forgot-password, etc.)
  dashboard/
    layout.tsx               # Dashboard shell: TopNavbar + Sidebar + ParlayCartProvider
    page.tsx                 # Main dashboard
    basketball/              # Basketball section
      page.tsx               # Basketball dashboard
      basketball/            # Nested basketball pages
  account/                   # User account/settings
  contact/                   # Contact page
  news/                      # News section
```

### Supabase Client Pattern
Two separate clients must be used — never mix them:
- `lib/supabase/server.ts` — async `createClient()` for Server Components and Server Actions (uses `next/headers` cookies)
- `lib/supabase/client.ts` — sync `createClient()` for Client Components (browser)
- `lib/supabase/middleware.ts` — `updateSession()` used in `middleware.ts` to refresh auth sessions

Always create a fresh server client per request — do not store it in a module-level variable.

### Database Layer (`lib/database/`)
- `index.ts` — re-exports from `teams.ts`, `profiles.ts`, `parlays.ts`
- `profiles.ts` / `profiles-client.ts` — user profile CRUD (server vs. client variants)
- `teams.ts` — favorite teams management
- `parlays.ts` — parlay/bet management

### Basketball API (`lib/basketball-api.ts`)
`BasketballAPI` is a static class providing all basketball data methods. It uses the browser Supabase client and is intended for Client Components. Key methods:
- `getTeams()`, `getSeasons()`, `getGames(seasonId?, limit?)`
- `getGamesFromView()`, `getPlayerPerformanceFromView()`, `getPopularPicksFromView()`, `getTeamPerformanceFromView()`, `getUserDashboardSummary(userId)`

### Database Views (`supabase/migrations/008_create_basketball_views.sql`)
Five Supabase views abstract complex joins — prefer these over raw table queries:
- `active_games_view` — games with home/away team names and computed `game_status`
- `player_performance_view` — player stats averages per season
- `popular_picks_view` — pick trends (over/under counts)
- `team_performance_view` — team aggregates
- `user_dashboard_view` — per-user betting summary

### Parlay/Betting System
The parlay cart is a global client-side context (`components/parlay/parlay-context.tsx`) wrapping the dashboard layout. Components:
- `ParlayCartProvider` — wraps `app/dashboard/layout.tsx`
- `ParlayCart` — slide-in cart UI
- `ParlayCartBadge` — navbar cart icon with count

### Types
All basketball domain types live in `types/basketball.ts`. Keep types there rather than co-locating in component files.

### Auth Flow
Supabase Auth handles authentication. The middleware (`middleware.ts`) intercepts all non-static routes to refresh sessions. Auth pages live under `app/auth/`. After login, users land at `/dashboard`.
