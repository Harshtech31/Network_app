import { Dimensions } from 'react-native';

// Image optimization utilities
export class ImageOptimizer {
  static getOptimizedImageUrl(url: string, width?: number, height?: number): string {
    if (!url) return '';
    
    // For external URLs, add optimization parameters
    if (url.startsWith('http')) {
      const params = new URLSearchParams();
      if (width) params.append('w', width.toString());
      if (height) params.append('h', height.toString());
      params.append('q', '80'); // Quality
      params.append('f', 'webp'); // Format
      
      return `${url}?${params.toString()}`;
    }
    
    return url;
  }

  static getResponsiveImageSize(containerWidth: number, aspectRatio: number = 1): { width: number; height: number } {
    const { width: screenWidth } = Dimensions.get('window');
    const maxWidth = Math.min(containerWidth, screenWidth * 0.9);
    
    return {
      width: maxWidth,
      height: maxWidth / aspectRatio,
    };
  }

  static preloadImages(urls: string[]): Promise<void[]> {
    return Promise.all(
      urls.map(url => 
        new Promise<void>((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve();
          image.onerror = reject;
          image.src = url;
        })
      )
    );
  }
}

// FlatList optimization configurations
export const FlatListOptimizations = {
  getItemLayout: (itemHeight: number) => (data: any, index: number) => ({
    length: itemHeight,
    offset: itemHeight * index,
    index,
  }),
  keyExtractor: (item: any, index: number) => item.id?.toString() ?? index.toString(),

  defaultProps: {
    removeClippedSubviews: true,
    maxToRenderPerBatch: 10,
    updateCellsBatchingPeriod: 50,
    initialNumToRender: 10,
    windowSize: 10,
    getItemLayout: undefined, // Set this per component
  },

  messageListProps: {
    removeClippedSubviews: true,
    maxToRenderPerBatch: 5,
    updateCellsBatchingPeriod: 100,
    initialNumToRender: 15,
    windowSize: 5,
    inverted: true,
  },

  feedListProps: {
    removeClippedSubviews: true,
    maxToRenderPerBatch: 3,
    updateCellsBatchingPeriod: 200,
    initialNumToRender: 5,
    windowSize: 8,
  },
};

// Memory management utilities
export class MemoryManager {
  private static imageCache = new Map<string, string>();
  private static maxCacheSize = 50;

  static cacheImage(key: string, uri: string): void {
    if (this.imageCache.size >= this.maxCacheSize) {
      const firstKey = this.imageCache.keys().next().value;
      if (firstKey !== undefined) {
        this.imageCache.delete(firstKey);
      }
    }
    this.imageCache.set(key, uri);
  }

  static getCachedImage(key: string): string | undefined {
    return this.imageCache.get(key);
  }

  static clearImageCache(): void {
    this.imageCache.clear();
  }

  static getMemoryUsage(): { used: number; total: number } {
    // This is a mock implementation - in real apps you'd use native modules
    return {
      used: this.imageCache.size * 1024, // Rough estimate
      total: 100 * 1024 * 1024, // 100MB
    };
  }
}

// Animation performance utilities
export const AnimationConfig = {
  spring: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
  
  timing: {
    duration: 300,
    useNativeDriver: true,
  },

  layout: {
    springDamping: 0.8,
    springStiffness: 100,
  },
};

// Lazy loading utilities
export class LazyLoader {
  private static loadedComponents = new Set<string>();

  static async loadComponent<T>(
    componentName: string,
    loader: () => Promise<{ default: T }>
  ): Promise<T> {
    if (this.loadedComponents.has(componentName)) {
      return loader().then(module => module.default);
    }

    try {
      const module = await loader();
      this.loadedComponents.add(componentName);
      return module.default;
    } catch (error) {
      console.error(`Failed to load component ${componentName}:`, error);
      throw error;
    }
  }

  static preloadComponents(loaders: Array<{ name: string; loader: () => Promise<any> }>): void {
    // Preload components in the background
    setTimeout(() => {
      loaders.forEach(({ name, loader }) => {
        this.loadComponent(name, loader).catch(console.error);
      });
    }, 1000);
  }
}

// Network optimization
export class NetworkOptimizer {
  private static requestCache = new Map<string, { data: any; timestamp: number }>();
  private static cacheTimeout = 5 * 60 * 1000; // 5 minutes

  static async cachedRequest<T>(
    key: string,
    requestFn: () => Promise<T>,
    cacheTimeout: number = this.cacheTimeout
  ): Promise<T> {
    const cached = this.requestCache.get(key);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < cacheTimeout) {
      return cached.data;
    }

    try {
      const data = await requestFn();
      this.requestCache.set(key, { data, timestamp: now });
      return data;
    } catch (error) {
      // Return cached data if available, even if expired
      if (cached) {
        return cached.data;
      }
      throw error;
    }
  }

  static clearCache(): void {
    this.requestCache.clear();
  }

  static cleanExpiredCache(): void {
    const now = Date.now();
    for (const [key, value] of this.requestCache.entries()) {
      if (now - value.timestamp > this.cacheTimeout) {
        this.requestCache.delete(key);
      }
    }
  }
}

import React from 'react';

// Bundle size optimization utilities
export const BundleOptimizer = {
  // Lazy import utilities
  lazyImport: <T extends React.ComponentType<any>>(importFn: () => Promise<{ default: T }>) => {
    return React.lazy(importFn);
  },

  // Code splitting helpers
  splitByRoute: (routes: Record<string, () => Promise<any>>) => {
    return Object.entries(routes).reduce((acc, [key, loader]) => {
      acc[key] = React.lazy(loader);
      return acc;
    }, {} as Record<string, React.LazyExoticComponent<any>>);
  },
};
