# Environment Setup Guide

## 🚀 **To Run The Bench Locally**

### **Step 1: Create Environment File**
Create a `.env.local` file in your project root with the following content:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your-anon-key-here

# Environment
NODE_ENV=development
```

### **Step 2: Get Your Supabase Values**
1. Go to [https://supabase.com](https://supabase.com)
2. Open your project dashboard
3. Go to Settings → API
4. Copy the "Project URL" and "anon public" key
5. Replace the placeholder values in `.env.local`

### **Step 3: Run the App**
```bash
npm run dev
```

### **Step 4: Open in Browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🔑 **What You'll See**

✅ **Landing Page** - The Bench branding and authentication  
✅ **Dashboard** - User dashboard with basketball section  
✅ **Basketball Dashboard** - `/dashboard/basketball`  
✅ **Games Page** - `/dashboard/basketball/games`  

## 🏀 **Basketball Features Available**

- **Game Browsing** - View upcoming and recent games
- **Player Stats** - Individual player performance data
- **Team Management** - Favorite teams functionality
- **Database Integration** - Real data from your Supabase database

## ⚠️ **Note**
The app requires a valid Supabase connection to display basketball data. Without proper environment variables, you'll see authentication errors.
