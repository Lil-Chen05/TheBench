# Supabase Configuration Guide

## Email Templates Configuration

### 1. Confirm Signup Email Template

**HTML Template:**
```html
<h2>Welcome to The Bench!</h2>
<p>Thanks for signing up for Canadian University Sports Betting.</p>
<p>Please click the button below to confirm your email address:</p>
<a href="{{ .ConfirmationURL }}" style="background-color: #F4D03F; color: #000000; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Confirm Email</a>
<p>If the button doesn't work, copy and paste this link into your browser:</p>
<p>{{ .ConfirmationURL }}</p>
<p>This link will expire in 24 hours.</p>
<p>Best regards,<br>The Bench Team</p>
```

**Text Template:**
```
Welcome to The Bench!

Thanks for signing up for Canadian University Sports Betting.

Please click the link below to confirm your email address:

{{ .ConfirmationURL }}

This link will expire in 24 hours.

Best regards,
The Bench Team
```

### 2. Magic Link Email Template

**HTML Template:**
```html
<h2>Sign in to The Bench</h2>
<p>Click the button below to sign in to your account:</p>
<a href="{{ .TokenHash }}" style="background-color: #F4D03F; color: #000000; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Sign In</a>
<p>If the button doesn't work, copy and paste this link into your browser:</p>
<p>{{ .TokenHash }}</p>
<p>This link will expire in 1 hour.</p>
<p>Best regards,<br>The Bench Team</p>
```

### 3. Password Reset Email Template

**HTML Template:**
```html
<h2>Reset Your Password</h2>
<p>You requested a password reset for your The Bench account.</p>
<p>Click the button below to reset your password:</p>
<a href="{{ .TokenHash }}" style="background-color: #F4D03F; color: #000000; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
<p>If the button doesn't work, copy and paste this link into your browser:</p>
<p>{{ .TokenHash }}</p>
<p>This link will expire in 1 hour.</p>
<p>If you didn't request this reset, you can safely ignore this email.</p>
<p>Best regards,<br>The Bench Team</p>
```

## URL Configuration

### Site URL Settings
- **Site URL**: `https://playthebench.vercel.app`
- **Redirect URLs**:
  ```
  https://playthebench.vercel.app/auth/callback
  https://playthebench.vercel.app/dashboard
  http://localhost:3000/auth/callback
  http://localhost:3000/dashboard
  ```

### Environment-Specific URLs

**Production:**
- Site URL: `https://playthebench.vercel.app`
- Redirect URLs: `https://playthebench.vercel.app/auth/callback`

**Development:**
- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/auth/callback`

**Preview Deployments:**
- Site URL: `https://[preview-url].vercel.app`
- Redirect URLs: `https://[preview-url].vercel.app/auth/callback`

## RLS Policies for Production

### Profiles Table Policies
```sql
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

-- Allow profile creation via trigger
CREATE POLICY "Enable insert for authenticated users only" ON public.profiles
FOR INSERT TO authenticated WITH CHECK (true);
```

### Parlays Table Policies
```sql
-- Users can view their own parlays
CREATE POLICY "Users can view own parlays" ON public.parlays
FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own parlays
CREATE POLICY "Users can insert own parlays" ON public.parlays
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Users can update their own parlays
CREATE POLICY "Users can update own parlays" ON public.parlays
FOR UPDATE USING (auth.uid() = user_id);
```

### Basketball Teams Table Policies
```sql
-- Everyone can view teams
CREATE POLICY "Everyone can view teams" ON public.basketballteams
FOR SELECT TO authenticated USING (true);
```

## Environment Variables

### Required Environment Variables
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://vpqxanjysirybilymstg.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your_anon_key_here

# Optional: Staging URL (if using staging environment)
NEXT_PUBLIC_STAGING_URL=https://staging.playthebench.vercel.app
```

## Security Best Practices

### 1. Email Security
- Use HTTPS for all production URLs
- Set appropriate expiration times for tokens
- Implement rate limiting for email sending

### 2. Database Security
- Enable Row Level Security (RLS) on all tables
- Use parameterized queries only
- Regularly audit RLS policies

### 3. Authentication Security
- Require email confirmation for new accounts
- Implement password strength requirements
- Use secure session management

## Monitoring and Logging

### 1. Enable Supabase Logs
- Go to Supabase Dashboard → Logs
- Enable real-time logs for authentication events
- Monitor failed login attempts

### 2. Set up Alerts
- Configure alerts for unusual authentication patterns
- Monitor email delivery rates
- Set up alerts for database errors

## Testing Checklist

### Email Templates
- [ ] Test signup confirmation email
- [ ] Test password reset email
- [ ] Test magic link email
- [ ] Verify all links work correctly
- [ ] Test email rendering on different clients

### Authentication Flow
- [ ] Test signup flow
- [ ] Test email confirmation
- [ ] Test login flow
- [ ] Test password reset
- [ ] Test logout flow
- [ ] Test session persistence

### Environment Testing
- [ ] Test on localhost:3000
- [ ] Test on production domain
- [ ] Test on preview deployments
- [ ] Verify redirect URLs work in all environments 