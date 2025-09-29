// API Configuration for Backend Integration
import Constants from 'expo-constants';

// Environment Configuration
export const Environment = {
  // Development Configuration
  development: {
    API_BASE_URL: 'http://192.168.0.186:5000/api', // Your backend IP
    WS_BASE_URL: 'ws://192.168.0.186:5000',
    DEBUG: true,
  },
  
  // Staging Configuration (AWS Lambda)
  staging: {
    API_BASE_URL: 'https://okwqa5c1hk.execute-api.us-east-1.amazonaws.com/staging/api',
    WS_BASE_URL: 'wss://okwqa5c1hk.execute-api.us-east-1.amazonaws.com/staging',
    DEBUG: true,
  },
  
  // Production Configuration
  production: {
    API_BASE_URL: 'https://api.network-cli.com/api',
    WS_BASE_URL: 'wss://api.network-cli.com',
    DEBUG: false,
  },
};

// Define valid environment types
type EnvironmentType = 'development' | 'production' | 'staging' | 'test';

// Get current environment
const getCurrentEnvironment = () => {
  // Try multiple sources for environment detection
  const processNodeEnv = process.env.NODE_ENV as EnvironmentType;
  const expoNodeEnv = Constants.expoConfig?.extra?.NODE_ENV as EnvironmentType;
  const manifestNodeEnv = (Constants.manifest as any)?.extra?.NODE_ENV as EnvironmentType;
  const expoPublicApiUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  
  // Determine the final NODE_ENV value
  const nodeEnv = processNodeEnv || expoNodeEnv || manifestNodeEnv;
  
  console.log('🔧 Environment Detection:', {
    'process.env.NODE_ENV': processNodeEnv,
    'Constants.expoConfig.extra.NODE_ENV': expoNodeEnv,
    'Constants.manifest.extra.NODE_ENV': manifestNodeEnv,
    'EXPO_PUBLIC_API_BASE_URL': expoPublicApiUrl,
    'Final NODE_ENV': nodeEnv,
    '__DEV__': __DEV__,
    'Constants.executionEnvironment': Constants.executionEnvironment,
    'Constants.appOwnership': Constants.appOwnership
  });
  
  // Check for explicit API URL override
  if (expoPublicApiUrl && expoPublicApiUrl.includes('amazonaws.com')) {
    console.log('🚀 Using STAGING environment (AWS Lambda detected via EXPO_PUBLIC_API_BASE_URL)');
    return Environment.staging;
  }
  
  // FORCE STAGING ENVIRONMENT FOR TESTING
  // TODO: Remove this once environment detection works properly
  console.log('🚀 FORCING STAGING environment (AWS Lambda) for testing');
  return Environment.staging;
  
  // Prioritize NODE_ENV over __DEV__ flag
  if (nodeEnv === 'production') {
    console.log('✅ Using PRODUCTION environment');
    return Environment.production;
  }
  
  if (nodeEnv === 'staging') {
    console.log('✅ Using STAGING environment (AWS Lambda)');
    return Environment.staging;
  }
  
  // Fallback to __DEV__ only if NODE_ENV is not set
  if (__DEV__) {
    console.log('✅ Using DEVELOPMENT environment (__DEV__ fallback)');
    return Environment.development;
  }
  
  // Final fallback to production
  console.log('✅ Using PRODUCTION environment (final fallback)');
  return Environment.production;
};

export const config = getCurrentEnvironment();

// Export individual config values for easy access
export const API_BASE_URL = config.API_BASE_URL;
export const WS_BASE_URL = config.WS_BASE_URL;
export const DEBUG = config.DEBUG;
