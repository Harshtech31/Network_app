import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import apiService from '../utils/apiService';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationData {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'event' | 'message';
  title: string;
  message: string;
  time: string;
  read: boolean;
  avatar?: string;
  user: string;
  data?: any;
}

class NotificationService {
  private expoPushToken: string | null = null;

  // Initialize push notifications
  async initializePushNotifications(): Promise<string | null> {
    try {
      if (!Device.isDevice) {
        console.log('Push notifications only work on physical devices');
        return null;
      }

      // Check if running in Expo Go (which doesn't support push notifications in SDK 53+)
      const isExpoGo = __DEV__ && !Device.isDevice;
      if (isExpoGo) {
        console.log('⚠️ Push notifications are not supported in Expo Go. Use a development build for full functionality.');
        return null;
      }

      // Check existing permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permissions if not granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Permission not granted for push notifications');
        return null;
      }

      // Get push token
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      });

      this.expoPushToken = token.data;
      console.log('✅ Push token obtained:', this.expoPushToken);

      // Register device with backend
      await this.registerDeviceWithBackend(this.expoPushToken);

      return this.expoPushToken;
    } catch (error) {
      console.error('❌ Error initializing push notifications:', error);
      return null;
    }
  }

  // Register device token with backend
  private async registerDeviceWithBackend(deviceToken: string): Promise<void> {
    try {
      const response = await apiService.post('/notifications/register', {
        deviceToken,
        platform: Platform.OS,
        userId: 'user_demo' // This should come from auth context
      });

      if (response.success) {
        console.log('✅ Device registered for notifications');
      }
    } catch (error: any) {
      console.error('❌ Error registering device:', error);
    }
  }

  // Get notifications from backend
  async getNotifications(): Promise<NotificationData[]> {
    try {
      const response = await apiService.get<any>('/notifications');
      
      if (response.success && response.data) {
        const notificationsData = response.data.notifications || [];
        
        // Sort notifications by createdAt in descending order
        notificationsData.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        return notificationsData;
      }
      
      return [];
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const response = await apiService.put(`/notifications/${notificationId}/read`);
      return response.success;
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }
}

export const notificationService = new NotificationService();
