import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import authService, { AuthUser, LoginCredentials, RegisterData } from '../utils/authService';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string; requiresOTP?: boolean; userId?: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string; requiresOTP?: boolean; userId?: string }>;
  logout: () => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  verifyRegistrationOTP: (userId: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  verifyLoginOTP: (userId: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  resendRegistrationOTP: (userId: string) => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (token: string, password: string) => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: AuthUser | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
        error: null,
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'LOGOUT':
      return { ...initialState, isLoading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check authentication status on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const isAuth = await authService.isAuthenticated();
      if (isAuth) {
        const user = await authService.getCurrentUser();
        dispatch({ type: 'SET_USER', payload: user });
      } else {
        dispatch({ type: 'SET_USER', payload: null });
      }
    } catch (error: any) {
      console.error('Auth check error:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const response = await authService.login(credentials);
      
      if (response.success && response.data) {
        dispatch({ type: 'SET_USER', payload: response.data.user });
        return { success: true };
      } else if (response.error?.includes('verification required') || response.error?.includes('requiresLoginOTP')) {
        // Login requires OTP verification
        dispatch({ type: 'SET_LOADING', payload: false });
        return { 
          success: false, 
          error: response.error,
          requiresOTP: true,
          userId: (response as any).userId
        };
      } else if (response.error?.includes('Email verification required')) {
        // Email needs to be verified first
        dispatch({ type: 'SET_LOADING', payload: false });
        return { 
          success: false, 
          error: response.error,
          requiresOTP: true,
          userId: (response as any).userId
        };
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Login failed' });
        return { success: false, error: response.error };
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const response = await authService.register(userData);
      
      if (response.success && response.data) {
        dispatch({ type: 'SET_USER', payload: response.data.user });
        return { success: true };
      } else if (response.error?.includes('check your email') || response.error?.includes('requiresOTP')) {
        // Registration successful but requires OTP verification
        dispatch({ type: 'SET_LOADING', payload: false });
        return { 
          success: false, 
          error: response.error,
          requiresOTP: true,
          userId: (response as any).userId
        };
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Registration failed' });
        return { success: false, error: response.error };
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      dispatch({ type: 'LOGOUT' });
    }
  };

  const verifyOTP = async (email: string, otp: string) => {
    try {
      dispatch({ type: 'CLEAR_ERROR' });
      const response = await authService.verifyOTP(email, otp);
      
      if (response.success) {
        return { success: true };
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'OTP verification failed' });
        return { success: false, error: response.error };
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      dispatch({ type: 'CLEAR_ERROR' });
      const response = await authService.forgotPassword(email);
      
      if (response.success) {
        return { success: true };
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Forgot password failed' });
        return { success: false, error: response.error };
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const resetPassword = async (token: string, password: string) => {
    try {
      dispatch({ type: 'CLEAR_ERROR' });
      const response = await authService.resetPassword(token, password);
      
      if (response.success) {
        return { success: true };
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Reset password failed' });
        return { success: false, error: response.error };
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const refreshUser = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const user = await authService.refreshUserData();
      if (user) {
        dispatch({ type: 'SET_USER', payload: user });
      } else {
        // If refresh fails, keep current user but stop loading
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error: any) {
      console.error('Error refreshing user:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const verifyRegistrationOTP = async (userId: string, otp: string) => {
    try {
      dispatch({ type: 'CLEAR_ERROR' });
      const response = await authService.verifyRegistrationOTP(userId, otp);
      
      if (response.success && response.data) {
        dispatch({ type: 'SET_USER', payload: response.data.user });
        return { success: true };
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'OTP verification failed' });
        return { success: false, error: response.error };
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const verifyLoginOTP = async (userId: string, otp: string) => {
    try {
      dispatch({ type: 'CLEAR_ERROR' });
      const response = await authService.verifyLoginOTP(userId, otp);
      
      if (response.success && response.data) {
        dispatch({ type: 'SET_USER', payload: response.data.user });
        return { success: true };
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'OTP verification failed' });
        return { success: false, error: response.error };
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const resendRegistrationOTP = async (userId: string) => {
    try {
      dispatch({ type: 'CLEAR_ERROR' });
      const response = await authService.resendRegistrationOTP(userId);
      
      if (response.success) {
        return { success: true };
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Failed to resend OTP' });
        return { success: false, error: response.error };
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    login,
    register,
    logout,
    verifyOTP,
    verifyRegistrationOTP,
    verifyLoginOTP,
    resendRegistrationOTP,
    forgotPassword,
    resetPassword,
    clearError,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
