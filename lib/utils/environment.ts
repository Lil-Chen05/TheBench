export type Environment = 'development' | 'staging' | 'preview' | 'production';

export interface EnvironmentConfig {
  environment: Environment;
  baseUrl: string;
  apiUrl: string;
  isProduction: boolean;
  isDevelopment: boolean;
  isStaging: boolean;
  isPreview: boolean;
}

/**
 * Robust environment detection that handles various deployment scenarios
 */
export function getEnvironment(): EnvironmentConfig {
  // Get the current URL
  const url = typeof window !== 'undefined' ? window.location.href : '';
  
  // Check for Vercel preview deployments
  const isVercelPreview = url.includes('vercel.app') && !url.includes('playthebench.vercel.app');
  
  // Check for staging environments
  const isStaging = url.includes('staging') || url.includes('dev') || url.includes('test');
  
  // Check for production
  const isProduction = url.includes('playthebench.vercel.app') || 
                      process.env.NODE_ENV === 'production' && !isVercelPreview;
  
  // Determine environment
  let environment: Environment;
  if (isProduction) {
    environment = 'production';
  } else if (isVercelPreview) {
    environment = 'preview';
  } else if (isStaging) {
    environment = 'staging';
  } else {
    environment = 'development';
  }
  
  // Determine base URL
  let baseUrl: string;
  switch (environment) {
    case 'production':
      baseUrl = 'https://playthebench.vercel.app';
      break;
    case 'preview':
      baseUrl = url.split('/')[0] + '//' + url.split('/')[2];
      break;
    case 'staging':
      baseUrl = process.env.NEXT_PUBLIC_STAGING_URL || 'https://staging.playthebench.vercel.app';
      break;
    default:
      baseUrl = 'http://localhost:3000';
  }
  
  return {
    environment,
    baseUrl,
    apiUrl: `${baseUrl}/api`,
    isProduction: environment === 'production',
    isDevelopment: environment === 'development',
    isStaging: environment === 'staging',
    isPreview: environment === 'preview',
  };
}

/**
 * Get the appropriate redirect URL for authentication flows
 */
export function getAuthRedirectUrl(path: string = '/dashboard'): string {
  const config = getEnvironment();
  return `${config.baseUrl}${path}`;
}

/**
 * Validate environment configuration
 */
export function validateEnvironment(): void {
  const config = getEnvironment();
  
  if (!config.baseUrl) {
    throw new Error('Environment configuration error: baseUrl is required');
  }
  
  if (config.isProduction && !config.baseUrl.startsWith('https://')) {
    console.warn('Production environment should use HTTPS');
  }
}

/**
 * Get environment-specific configuration
 */
export function getEnvironmentConfig() {
  const config = getEnvironment();
  
  return {
    ...config,
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY,
    },
    auth: {
      redirectUrl: getAuthRedirectUrl(),
      successUrl: getAuthRedirectUrl('/dashboard'),
      errorUrl: getAuthRedirectUrl('/auth/error'),
    },
  };
} 