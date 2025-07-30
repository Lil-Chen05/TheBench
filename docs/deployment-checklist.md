# Production Deployment Checklist

## Pre-Deployment Validation

### Environment Variables Check
```bash
# Required variables
NEXT_PUBLIC_SUPABASE_URL=https://vpqxanjysirybilymstg.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your_key_here

# Optional variables
NEXT_PUBLIC_STAGING_URL=https://staging.playthebench.vercel.app
```

### Build Validation
```bash
# Run these commands before deployment
npm run build
npm run lint
npm run type-check
```

### Supabase Configuration
- [ ] Email templates are updated with correct branding
- [ ] Site URL is set to `https://playthebench.vercel.app`
- [ ] Redirect URLs include production and development URLs
- [ ] RLS policies are enabled and configured
- [ ] Authentication settings are correct

## Deployment Steps

### 1. Environment Setup
```bash
# Validate environment detection
npm run build
# Check console for environment detection logs
```

### 2. Vercel Deployment
```bash
# Deploy to Vercel
git add .
git commit -m "Production-ready auth flow with environment detection"
git push origin main
```

### 3. Environment Variables in Vercel
- [ ] Set `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Set `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY`
- [ ] Set `NEXT_PUBLIC_STAGING_URL` (if using staging)

### 4. Post-Deployment Verification
- [ ] Check build logs for errors
- [ ] Verify environment detection works
- [ ] Test authentication flow
- [ ] Check email delivery
- [ ] Monitor error logs

## Rollback Procedures

### Emergency Rollback
```bash
# If deployment breaks authentication
git revert HEAD
git push origin main
```

### Database Rollback
```sql
-- If RLS policies cause issues
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
-- Then re-enable with correct policies
```

### Environment Variable Rollback
- [ ] Revert to previous environment variables in Vercel
- [ ] Update Supabase configuration if needed
- [ ] Test authentication flow

## Monitoring Setup

### Error Tracking
```javascript
// Add to your app for production monitoring
if (process.env.NODE_ENV === 'production') {
  // Initialize Sentry or similar
  // Sentry.init({ dsn: 'your-dsn' });
}
```

### Performance Monitoring
- [ ] Set up Vercel Analytics
- [ ] Monitor Core Web Vitals
- [ ] Track authentication success rates
- [ ] Monitor email delivery rates

### Security Monitoring
- [ ] Set up alerts for failed login attempts
- [ ] Monitor for unusual authentication patterns
- [ ] Track redirect failures
- [ ] Monitor database access patterns

## Production Checklist

### Authentication Flow
- [ ] Signup works on production domain
- [ ] Email confirmation redirects correctly
- [ ] Login works for confirmed users
- [ ] Password reset works
- [ ] Logout clears session
- [ ] Protected routes redirect unauthenticated users

### Environment Detection
- [ ] Production URLs are detected correctly
- [ ] Preview deployments work
- [ ] Development URLs work locally
- [ ] No hardcoded localhost references

### Error Handling
- [ ] Invalid tokens show user-friendly errors
- [ ] Network errors are handled gracefully
- [ ] No sensitive information in error messages
- [ ] Users are redirected to appropriate error pages

### Performance
- [ ] Page load times are acceptable
- [ ] Authentication flows are fast
- [ ] Database queries are optimized
- [ ] No memory leaks

### Security
- [ ] HTTPS is enforced
- [ ] Session tokens are secure
- [ ] RLS policies are working
- [ ] No sensitive data in logs

## Post-Deployment Monitoring

### First 24 Hours
- [ ] Monitor error rates
- [ ] Check authentication success rates
- [ ] Verify email delivery
- [ ] Monitor user signups
- [ ] Check redirect success rates

### First Week
- [ ] Analyze user engagement
- [ ] Monitor performance metrics
- [ ] Check for any edge cases
- [ ] Gather user feedback
- [ ] Optimize based on usage patterns

### Ongoing Monitoring
- [ ] Weekly security audits
- [ ] Monthly performance reviews
- [ ] Quarterly feature updates
- [ ] Continuous error monitoring

## Troubleshooting Guide

### Common Issues

#### Email Confirmation Not Working
1. Check Supabase email template configuration
2. Verify redirect URLs in Supabase dashboard
3. Check environment variables
4. Review server logs
5. Test with different email providers

#### Users Redirected to Wrong URL
1. Check environment detection logic
2. Verify URL configuration in Supabase
3. Test with different browsers
4. Check for CORS issues
5. Verify middleware configuration

#### Authentication Failures
1. Check Supabase authentication settings
2. Verify RLS policies are correct
3. Check for database connection issues
4. Review authentication logs
5. Test with different user accounts

#### Performance Issues
1. Check database query performance
2. Monitor API response times
3. Review client-side code optimization
4. Check for memory leaks
5. Monitor resource usage

### Emergency Contacts
- **Vercel Support**: https://vercel.com/support
- **Supabase Support**: https://supabase.com/support
- **Your Team**: [Add contact information]

## Success Metrics

### Technical Metrics
- [ ] Authentication success rate > 95%
- [ ] Email delivery rate > 99%
- [ ] Page load time < 3 seconds
- [ ] Error rate < 1%

### Business Metrics
- [ ] User signup conversion rate
- [ ] Email confirmation rate
- [ ] User engagement metrics
- [ ] Customer satisfaction scores

### Security Metrics
- [ ] Zero security incidents
- [ ] All security scans pass
- [ ] No sensitive data exposure
- [ ] Compliance requirements met 