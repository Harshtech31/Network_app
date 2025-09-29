// Authentication Service for Backend Integration
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService, { ApiResponse } from './apiService';

// Auth interfaces
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  department?: string;
  year?: number;
}

export interface AcademicInfo {
  year?: string;
  major?: string;
  gpa?: string;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  website?: string;
  github?: string;
  linkedin?: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  message: string;
}

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  profileImage?: string;
  department?: string;
  year?: number;
  isVerified?: boolean;
  createdAt: string;
  academic?: AcademicInfo;
  contact?: ContactInfo;
  projects?: any[];
  [key: string]: any; // Index signature for dynamic access
}

export class AuthService {
  private userKey = 'currentUser';

  // Login
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await apiService.post<any>('/auth/login', credentials);
      
      console.log('🔍 Login response:', JSON.stringify(response, null, 2));
      
      if (response.success && response.data) {
        // Handle Lambda response format: { success: true, data: { user: {...}, token: "..." } }
        const authData = response.data.data || response.data;
        
        if (authData && authData.token && authData.user) {
          await apiService.setAuthToken(authData.token);
          await this.setCurrentUser(authData.user);
          
          // Return in expected format
          return {
            success: true,
            status: 200,
            data: {
              user: authData.user,
              token: authData.token,
              message: response.data.message || 'Login successful'
            }
          };
        } else {
          console.error('❌ Invalid auth data structure:', authData);
          return {
            success: false,
            status: 400,
            error: 'Invalid response format from server',
          };
        }
      }
      
      return {
        success: false,
        status: response.status || 400,
        error: response.error || response.message || 'Login failed',
      };
    } catch (error: any) {
      console.error('❌ Login error:', error);
      return {
        success: false,
        status: 0,
        error: error.message || 'Login failed',
      };
    }
  }

  // Register
  async register(userData: RegisterData): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await apiService.post<AuthResponse>('/auth/register', userData);
      
      if (response.success && response.data) {
        await apiService.setAuthToken(response.data.token);
        await this.setCurrentUser(response.data.user);
      }
      
      return response;
    } catch (error: any) {
      return {
        success: false,
        status: 0,
        error: error.message || 'Registration failed',
      };
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await apiService.setAuthToken(null);
      await AsyncStorage.removeItem(this.userKey);
      console.log('✅ User logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  // Forgot password
  async forgotPassword(email: string): Promise<ApiResponse<{ message: string }>> {
    try {
      return await apiService.post<{ message: string }>('/auth/forgot-password', { email });
    } catch (error: any) {
      return {
        success: false,
        status: 0,
        error: error.message || 'Forgot password failed',
      };
    }
  }

  // Reset password
  async resetPassword(token: string, password: string): Promise<ApiResponse<{ message: string }>> {
    try {
      return await apiService.post<{ message: string }>('/auth/reset-password', {
        token,
        password,
      });
    } catch (error: any) {
      return {
        success: false,
        status: 0,
        error: error.message || 'Reset password failed',
      };
    }
  }

  // Verify OTP
  async verifyOTP(email: string, otp: string): Promise<ApiResponse<{ message: string }>> {
    try {
      return await apiService.post<{ message: string }>('/auth/verify-otp', {
        email,
        otp,
      });
    } catch (error: any) {
      return {
        success: false,
        status: 0,
        error: error.message || 'OTP verification failed',
      };
    }
  }

  // Get current user from storage
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const userData = await AsyncStorage.getItem(this.userKey);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Set current user in storage
  async setCurrentUser(user: AuthUser): Promise<void> {
    try {
      if (!user || typeof user !== 'object') {
        console.error('❌ Cannot set current user: invalid user data', user);
        return;
      }
      
      console.log('✅ Setting current user:', user);
      await AsyncStorage.setItem(this.userKey, JSON.stringify(user));
    } catch (error) {
      console.error('Error setting current user:', error);
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await apiService.getAuthToken();
      const user = await this.getCurrentUser();
      
      return !!(token && user);
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  // Upload profile image
  async uploadProfileImage(imageFile: any): Promise<ApiResponse<{ imageUrl: string }>> {
    try {
      const response = await apiService.uploadFile<{ imageUrl: string }>('/auth/upload-profile-image', imageFile);
      
      // Update current user with new image URL
      if (response.success && response.data) {
        const currentUser = await this.getCurrentUser();
        if (currentUser) {
          currentUser.profileImage = response.data.imageUrl;
          await this.setCurrentUser(currentUser);
        }
      }
      
      return response;
    } catch (error: any) {
      return {
        success: false,
        status: 0,
        error: error.message || 'Profile image upload failed',
      };
    }
  }

  // Update user profile
  async updateProfile(profileData: any): Promise<ApiResponse<AuthUser>> {
    try {
      console.log('🔄 Updating profile with data:', profileData);
      
      // Prepare clean JSON data for the API
      const cleanProfileData = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        username: profileData.username,
        department: profileData.department,
        year: profileData.year,
        bio: profileData.bio,
        skills: profileData.skills || [],
        interests: profileData.interests || [],
        joinedDate: profileData.joinedDate,
        role: profileData.role,
        // Parse stringified contact data if needed
        contact: typeof profileData.contact === 'string' 
          ? JSON.parse(profileData.contact) 
          : profileData.contact || {},
        // Parse stringified academic data if needed  
        academic: typeof profileData.academic === 'string'
          ? JSON.parse(profileData.academic)
          : profileData.academic || {},
        // Parse stringified arrays if needed
        projects: typeof profileData.projects === 'string'
          ? JSON.parse(profileData.projects)
          : profileData.projects || [],
        events: typeof profileData.events === 'string'
          ? JSON.parse(profileData.events)
          : profileData.events || [],
        achievements: typeof profileData.achievements === 'string'
          ? JSON.parse(profileData.achievements)
          : profileData.achievements || []
      };
      
      console.log('📤 Sending clean profile data:', cleanProfileData);
      
      // Send JSON request instead of FormData
      const response = await apiService.put<any>(
        '/users/profile', 
        cleanProfileData
      );
      
      console.log('📥 Profile update response:', response);
      
      if (response.success && response.data) {
        // Handle nested response structure: response.data.data.user
        const userData = response.data.data?.user || response.data.user;
        
        if (userData) {
          await this.setCurrentUser(userData);
          return {
            success: true,
            status: 200,
            data: userData
          };
        }
      }
      
      return {
        success: false,
        status: response.status || 0,
        error: response.error || 'Profile update failed',
      };
    } catch (error: any) {
      console.error('❌ Profile update error:', error);
      return {
        success: false,
        status: 0,
        error: error.message || 'Profile update failed',
      };
    }
  }

  // Verify registration OTP
  async verifyRegistrationOTP(userId: string, otp: string): Promise<ApiResponse<AuthResponse>> {
    try {
      console.log('🔐 Verifying registration OTP...');
      
      const response = await apiService.post<AuthResponse>('/auth/verify-registration-otp', {
        userId,
        otp
      });
      
      console.log('📥 Registration OTP verification response:', response);
      
      if (response.success && response.data) {
        // Store token and user data
        await this.setToken(response.data.token);
        await this.setCurrentUser(response.data.user);
        
        return {
          success: true,
          status: 200,
          data: response.data
        };
      }
      
      return {
        success: false,
        status: response.status || 400,
        error: response.error || 'OTP verification failed'
      };
    } catch (error: any) {
      console.error('❌ Registration OTP verification error:', error);
      return {
        success: false,
        status: 0,
        error: error.message || 'OTP verification failed'
      };
    }
  }

  // Verify login OTP
  async verifyLoginOTP(userId: string, otp: string): Promise<ApiResponse<AuthResponse>> {
    try {
      console.log('🔐 Verifying login OTP...');
      
      const response = await apiService.post<AuthResponse>('/auth/verify-login-otp', {
        userId,
        otp
      });
      
      console.log('📥 Login OTP verification response:', response);
      
      if (response.success && response.data) {
        // Store token and user data
        await this.setToken(response.data.token);
        await this.setCurrentUser(response.data.user);
        
        return {
          success: true,
          status: 200,
          data: response.data
        };
      }
      
      return {
        success: false,
        status: response.status || 400,
        error: response.error || 'OTP verification failed'
      };
    } catch (error: any) {
      console.error('❌ Login OTP verification error:', error);
      return {
        success: false,
        status: 0,
        error: error.message || 'OTP verification failed'
      };
    }
  }

  // Resend registration OTP
  async resendRegistrationOTP(userId: string): Promise<ApiResponse<any>> {
    try {
      console.log('📧 Resending registration OTP...');
      
      const response = await apiService.post('/auth/resend-registration-otp', {
        userId
      });
      
      console.log('📥 Resend OTP response:', response);
      
      return {
        success: response.success,
        status: response.status || (response.success ? 200 : 400),
        data: response.data,
        error: response.error
      };
    } catch (error: any) {
      console.error('❌ Resend OTP error:', error);
      return {
        success: false,
        status: 0,
        error: error.message || 'Failed to resend OTP'
      };
    }
  }

  // Refresh user data
  async refreshUserData(): Promise<AuthUser | null> {
    try {
      const isAuth = await this.isAuthenticated();
      if (!isAuth) {
        return null;
      }
      
      // Fetch the latest user data from the server
      const response = await apiService.get<any>('/users/profile');
      
      console.log('📥 Refresh user response:', response);
      
      if (response.success && response.data) {
        // Handle nested response structure: response.data.data.user
        const userData = response.data.data?.user || response.data.user;
        
        if (userData) {
          // Update the current user in storage
          await this.setCurrentUser(userData);
          return userData;
        }
      }
      
      throw new Error('Failed to fetch user data');
    } catch (error: any) {
      console.error('Error refreshing user data:', error);
      // Return current user from storage as fallback
      const currentUser = await this.getCurrentUser();
      return currentUser;
    }
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;
