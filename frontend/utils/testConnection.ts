// Test API Connection
import apiService from './apiService';
import authService from './authService';

export const testApiConnection = async () => {
  console.log('🧪 Testing API Connection...');
  
  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await apiService.get('/');
    console.log('Health Response:', healthResponse);
    
    // Test 2: Auth endpoint
    console.log('2. Testing auth endpoint...');
    const authResponse = await apiService.get('/auth');
    console.log('Auth Response:', authResponse);
    
    return {
      success: true,
      message: 'API connection successful!',
      details: {
        health: healthResponse.success,
        auth: authResponse.success,
      }
    };
  } catch (error: any) {
    console.error('API Connection Test Failed:', error);
    return {
      success: false,
      message: 'API connection failed',
      error: error.message,
    };
  }
};

export const testLogin = async () => {
  console.log('🧪 Testing Login...');
  
  try {
    // Test with demo credentials
    const loginResponse = await authService.login({
      email: 'demo@testapp.com',
      password: 'demo123456'
    });
    
    console.log('Login Response:', loginResponse);
    
    if (loginResponse.success) {
      console.log('✅ Login successful!');
      return {
        success: true,
        message: 'Login test successful!',
        user: loginResponse.data?.user,
      };
    } else {
      console.log('❌ Login failed:', loginResponse.error);
      return {
        success: false,
        message: 'Login test failed',
        error: loginResponse.error,
      };
    }
  } catch (error: any) {
    console.error('Login Test Failed:', error);
    return {
      success: false,
      message: 'Login test failed',
      error: error.message,
    };
  }
};
