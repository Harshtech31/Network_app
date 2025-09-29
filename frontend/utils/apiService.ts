// API Service for Backend Communication
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './apiConfig';

// API Response interface
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  success: boolean;
  status: number;
}

// Base API class
export class ApiService {
  private baseURL: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.timeout = 10000;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  // Get stored auth token
  async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  // Set auth token
  async setAuthToken(token: string | null): Promise<void> {
    try {
      if (token) {
        await AsyncStorage.setItem('authToken', token);
        this.defaultHeaders['Authorization'] = `Bearer ${token}`;
      } else {
        await AsyncStorage.removeItem('authToken');
        delete this.defaultHeaders['Authorization'];
      }
    } catch (error) {
      console.error('Error setting auth token:', error);
    }
  }

  // Initialize auth token on app start
  async initializeAuth(): Promise<void> {
    const token = await this.getAuthToken();
    if (token) {
      this.defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  // Generic request method
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      method: 'GET',
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
      ...options,
    };

    // Add body for POST/PUT requests
    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
      config.body = JSON.stringify(options.body);
    }

    try {
      console.log(`🌐 API Request: ${config.method} ${url}`);
      
      const response = await fetch(url, config);
      let data;
      
      // Get response text first, then try to parse as JSON
      const responseText = await response.text();
      
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        data = responseText;
      }

      if (!response.ok) {
        throw new Error(data.message || data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      console.log(`✅ API Success: ${config.method} ${url}`);
      return {
        success: true,
        status: response.status,
        data,
        message: data.message,
      };
    } catch (error: any) {
      console.error(`❌ API Error: ${config.method} ${url}`, error);
      
      // Handle specific error cases
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        // Token expired or invalid, clear it
        await this.setAuthToken(null);
        throw new Error('Session expired. Please login again.');
      }
      
      return {
        success: false,
        status: 0,
        error: error.message || 'Network error',
      };
    }
  }

  // GET request
  async get<T>(endpoint: string, params: Record<string, any> = {}): Promise<ApiResponse<T>> {
    const queryString = Object.keys(params).length 
      ? '?' + new URLSearchParams(params).toString() 
      : '';
    
    return this.request<T>(`${endpoint}${queryString}`, {
      method: 'GET',
    });
  }

  // POST request
  async post<T>(endpoint: string, data: any = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data: any = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  // PATCH request
  async patch<T>(endpoint: string, data: any = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data,
    });
  }

  // Upload file
  async uploadFile<T>(endpoint: string, file: any, additionalData: Record<string, any> = {}): Promise<ApiResponse<T>> {
    const formData = new FormData();
    
    formData.append('file', file);
    
    // Add additional form data
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        // Remove Content-Type to let browser set it for FormData
        'Content-Type': undefined,
      } as any,
    });
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL.replace('/api', '')}/health`);
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}

// Create singleton instance
const apiService = new ApiService();

// Initialize auth on import
apiService.initializeAuth();

export default apiService;
