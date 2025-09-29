import { AppError, ValidationResult } from '../types';

export class ErrorHandler {
  static createError(code: string, message: string, details?: any): AppError {
    return {
      code,
      message,
      details
    };
  }

  static handleNetworkError(error: any): AppError {
    if (!navigator.onLine) {
      return this.createError('NETWORK_OFFLINE', 'No internet connection available');
    }
    
    if (error.code === 'NETWORK_REQUEST_FAILED') {
      return this.createError('NETWORK_FAILED', 'Network request failed. Please check your connection.');
    }
    
    return this.createError('NETWORK_ERROR', 'An unexpected network error occurred');
  }

  static handleValidationError(field: string, message: string): AppError {
    return this.createError('VALIDATION_ERROR', `${field}: ${message}`);
  }

  static handleAuthError(error: any): AppError {
    switch (error.code) {
      case 'auth/user-not-found':
        return this.createError('AUTH_USER_NOT_FOUND', 'User not found');
      case 'auth/wrong-password':
        return this.createError('AUTH_INVALID_CREDENTIALS', 'Invalid credentials');
      case 'auth/too-many-requests':
        return this.createError('AUTH_TOO_MANY_REQUESTS', 'Too many failed attempts. Please try again later.');
      default:
        return this.createError('AUTH_ERROR', 'Authentication failed');
    }
  }

  static logError(error: AppError, context?: string): void {
    console.error(`[${context || 'APP'}] Error ${error.code}:`, error.message, error.details);
    
    // In production, send to crash reporting service
    // crashlytics().recordError(new Error(error.message));
  }
}

export class Validator {
  static validateEmail(email: string): ValidationResult {
    const errors: string[] = [];
    
    if (!email) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Please enter a valid email address');
    }
    
    return { isValid: errors.length === 0, errors };
  }

  static validatePassword(password: string): ValidationResult {
    const errors: string[] = [];
    
    if (!password) {
      errors.push('Password is required');
    } else {
      if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
      }
      if (!/(?=.*[a-z])/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
      }
      if (!/(?=.*[A-Z])/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
      }
      if (!/(?=.*\d)/.test(password)) {
        errors.push('Password must contain at least one number');
      }
    }
    
    return { isValid: errors.length === 0, errors };
  }

  static validateName(name: string): ValidationResult {
    const errors: string[] = [];
    
    if (!name) {
      errors.push('Name is required');
    } else if (name.length < 2) {
      errors.push('Name must be at least 2 characters long');
    } else if (name.length > 50) {
      errors.push('Name must be less than 50 characters');
    } else if (!/^[a-zA-Z\s]+$/.test(name)) {
      errors.push('Name can only contain letters and spaces');
    }
    
    return { isValid: errors.length === 0, errors };
  }

  static validatePostContent(content: string): ValidationResult {
    const errors: string[] = [];
    
    if (!content) {
      errors.push('Post content is required');
    } else if (content.length > 2000) {
      errors.push('Post content must be less than 2000 characters');
    }
    
    return { isValid: errors.length === 0, errors };
  }

  static validateEventTitle(title: string): ValidationResult {
    const errors: string[] = [];
    
    if (!title) {
      errors.push('Event title is required');
    } else if (title.length < 5) {
      errors.push('Event title must be at least 5 characters long');
    } else if (title.length > 100) {
      errors.push('Event title must be less than 100 characters');
    }
    
    return { isValid: errors.length === 0, errors };
  }

  static validateDate(date: Date): ValidationResult {
    const errors: string[] = [];
    const now = new Date();
    
    if (!date) {
      errors.push('Date is required');
    } else if (date < now) {
      errors.push('Date cannot be in the past');
    }
    
    return { isValid: errors.length === 0, errors };
  }

  static sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/[<>]/g, '') // Remove < and > characters
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, ''); // Remove event handlers
  }

  static validateFileSize(file: any, maxSizeMB: number = 10): ValidationResult {
    const errors: string[] = [];
    
    if (!file) {
      errors.push('File is required');
    } else if (file.size > maxSizeMB * 1024 * 1024) {
      errors.push(`File size must be less than ${maxSizeMB}MB`);
    }
    
    return { isValid: errors.length === 0, errors };
  }

  static validateImageFile(file: any): ValidationResult {
    const errors: string[] = [];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    if (!file) {
      errors.push('Image file is required');
    } else if (!allowedTypes.includes(file.type)) {
      errors.push('Only JPEG, PNG, GIF, and WebP images are allowed');
    }
    
    const sizeValidation = this.validateFileSize(file, 5);
    if (!sizeValidation.isValid) {
      errors.push(...sizeValidation.errors);
    }
    
    return { isValid: errors.length === 0, errors };
  }
}

export const sanitizeHtml = (html: string): string => {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};
