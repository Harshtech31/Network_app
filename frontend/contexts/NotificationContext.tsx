import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as Notifications from 'expo-notifications';
import { notificationService, NotificationData } from '../services/notificationService';

interface NotificationContextType {
  notifications: NotificationData[];
  unreadCount: number;
  isLoading: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Initialize notifications and push notification listeners
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        // Initialize push notifications
        await notificationService.initializePushNotifications();
        
        // Load initial notifications
        await refreshNotifications();
      } catch (error) {
        console.error('Error initializing notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeNotifications();

    // Listen for incoming notifications
    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification: Notifications.Notification) => {
        console.log('📱 Notification received:', notification);
        
        // Add the new notification to the list
        const newNotification: NotificationData = {
          id: Date.now().toString(),
          type: (notification.request.content.data?.type as any) || 'message',
          title: notification.request.content.title || 'New Notification',
          message: notification.request.content.body || '',
          time: 'now',
          read: false,
          avatar: (notification.request.content.data?.avatar as string) || undefined,
          user: (notification.request.content.data?.user as string) || 'System',
          data: notification.request.content.data
        };

        setNotifications(prev => [newNotification, ...prev]);
      }
    );

    // Listen for notification responses (when user taps notification)
    const responseListener = Notifications.addNotificationResponseReceivedListener(
      (response: Notifications.NotificationResponse) => {
        console.log('📱 Notification tapped:', response);
        
        // Handle notification tap - navigate to relevant screen
        const notificationData = response.notification.request.content.data;
        if (notificationData?.type === 'message' && notificationData?.conversationId) {
          // Navigate to conversation
          console.log('Navigate to conversation:', notificationData.conversationId);
        } else if (notificationData?.type === 'like' && notificationData?.postId) {
          // Navigate to post
          console.log('Navigate to post:', notificationData.postId);
        }
      }
    );

    // Cleanup listeners
    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  // Refresh notifications from backend
  const refreshNotifications = async () => {
    try {
      const backendNotifications = await notificationService.getNotifications();
      setNotifications(backendNotifications);
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const success = await notificationService.markAsRead(notificationId);
      if (success) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, read: true }
              : notification
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    refreshNotifications,
    markAsRead,
    clearAllNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
