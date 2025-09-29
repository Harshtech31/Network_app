import React, { useState, useRef, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { NotificationData } from '../../services/notificationService';
import apiService from '../../utils/apiService';
import { useAuth } from '../../contexts/AuthContext';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Image,
  FlatList,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useCallback } from 'react';

const initialNotifications: NotificationData[] = [
  {
    id: '1',
    type: 'like' as const,
    title: 'Emma Wilson liked your post',
    message: 'liked your Machine Learning project showcase',
    time: '2m ago',
    read: false,
    avatar: 'https://i.pravatar.cc/150?u=emmawilson',
    user: 'Emma Wilson',
  },
  {
    id: '2',
    type: 'comment' as const,
    title: 'New comment on your project',
    message: 'commented: "Great work on the neural network implementation!"',
    time: '15m ago',
    read: false,
    avatar: 'https://i.pravatar.cc/150?u=ryanchen',
    user: 'Ryan Chen',
  },
  {
    id: '3',
    type: 'follow' as const,
    title: 'New follower',
    message: 'started following you',
    time: '1h ago',
    read: false,
    avatar: 'https://i.pravatar.cc/150?u=zoem',
    user: 'Zoe Martinez',
  },
  {
    id: '4',
    type: 'event' as const,
    title: 'Event reminder',
    message: 'Tech Meetup starts in 1 hour at Innovation Lab',
    time: '2h ago',
    read: true,
    avatar: 'https://i.pravatar.cc/150?u=techclub',
    user: 'Tech Club',
  },
  {
    id: '5',
    type: 'message' as const,
    title: 'New message',
    message: 'sent you a message about the hackathon project',
    time: '3h ago',
    read: true,
    avatar: 'https://i.pravatar.cc/150?u=lisapark',
    user: 'Lisa Park',
  },
  {
    id: '6',
    type: 'like' as const,
    title: 'Multiple likes',
    message: 'and 5 others liked your Data Science workshop post',
    time: '5h ago',
    read: true,
    avatar: 'https://i.pravatar.cc/150?u=tomanderson',
    user: 'Tom Anderson',
  },
  {
    id: '7',
    type: 'comment' as const,
    title: 'Project feedback',
    message: 'commented: "Would love to collaborate on this!"',
    time: '1d ago',
    read: true,
    avatar: 'https://i.pravatar.cc/150?u=ninarodriguez',
    user: 'Nina Rodriguez',
  },
];

const NotificationItem = ({ item, onMarkAsRead }: { item: NotificationData, onMarkAsRead: (id: string) => void }) => {
  const getIcon = () => {
    switch (item.type) {
      case 'like': return 'heart';
      case 'comment': return 'chatbubble-ellipses';
      case 'follow': return 'person-add';
      case 'event': return 'calendar';
      case 'message': return 'mail';
      default: return 'notifications';
    }
  };

  const getIconColor = () => {
    switch (item.type) {
      case 'like': return '#EF4444';
      case 'comment': return '#3B82F6';
      case 'follow': return '#10B981';
      case 'event': return '#F59E0B';
      case 'message': return '#8B1A1A';
      default: return '#6B7280';
    }
  };

  const getGradientColors = () => {
    switch (item.type) {
      case 'like': return ['#FEF2F2', '#FEE2E2'];
      case 'comment': return ['#EFF6FF', '#DBEAFE'];
      case 'follow': return ['#ECFDF5', '#D1FAE5'];
      case 'event': return ['#FFFBEB', '#FEF3C7'];
      case 'message': return ['#FEF2F2', '#FEE2E2'];
      default: return ['#F9FAFB', '#F3F4F6'];
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.notificationItem, !item.read && styles.unreadItem]}
      onPress={() => {
        if (!item.read) {
          onMarkAsRead(item.id);
        }
      }}
    >
      <View style={styles.avatarContainer}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.iconContainer}>
            <Ionicons name={getIcon()} size={20} color="#8B1A1A" />
          </View>
        )}
        {!item.read && <View style={styles.unreadIndicator} />}
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.messageRow}>
          <Text style={styles.notificationText} numberOfLines={2}>
            <Text style={styles.userName}>{item.user}</Text> {item.message}
          </Text>
          <Text style={styles.timeText}>{item.time}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function NotificationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<NotificationData[]>([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load notifications from API
  const loadNotifications = async () => {
    try {
      console.log('🔔 Loading notifications from API...');
      
      const response = await apiService.get<any>('/notifications');
      
      if (response.success && response.data) {
        const notificationsData = response.data.notifications || [];
        
        // Convert backend notifications to expected format
        const formattedNotifications: NotificationData[] = notificationsData.map((notification: any) => ({
          id: notification.id,
          type: notification.type || 'message',
          title: notification.title,
          message: notification.message || notification.content,
          time: notification.createdAt ? new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'now',
          read: notification.read || false,
          avatar: notification.avatar || `https://i.pravatar.cc/150?u=${notification.userId}`,
          user: notification.user || 'System',
          data: notification.data
        }));
        
        setNotifications(formattedNotifications);
        setFilteredNotifications(formattedNotifications);
        console.log('✅ Notifications loaded:', formattedNotifications.length);
      } else {
        console.log('⚠️ No notifications data received, using demo data');
        setNotifications(initialNotifications);
        setFilteredNotifications(initialNotifications);
      }
    } catch (error) {
      console.error('❌ Error loading notifications:', error);
      // Fallback to demo data
      setNotifications(initialNotifications);
      setFilteredNotifications(initialNotifications);
    } finally {
      setIsLoading(false);
    }
  };

  // Load notifications when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [])
  );

  // Filter notifications based on active filter
  const filterNotifications = (filter: string) => {
    let filtered = notifications;
    
    switch (filter) {
      case 'Events':
        filtered = notifications.filter(notification => notification.type === 'event');
        break;
      case 'Likes':
        filtered = notifications.filter(notification => notification.type === 'like');
        break;
      case 'Comments':
        filtered = notifications.filter(notification => notification.type === 'comment');
        break;
      case 'Follows':
        filtered = notifications.filter(notification => notification.type === 'follow');
        break;
      case 'All':
      default:
        filtered = notifications;
        break;
    }
    
    setFilteredNotifications(filtered);
  };

  // Handle filter change
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    filterNotifications(filter);
  };

  // Handle marking notification as read
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      console.log('📖 Marking notification as read:', notificationId);
      
      const response = await apiService.post(`/notifications/${notificationId}/read`);
      
      if (response.success) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, read: true }
              : notification
          )
        );
        
        // Update filtered notifications as well
        setFilteredNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, read: true }
              : notification
          )
        );
        
        console.log('✅ Notification marked as read');
      } else {
        throw new Error('Failed to mark notification as read');
      }
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      Alert.alert('Error', 'Failed to mark notification as read. Please try again.');
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadNotifications();
    setIsRefreshing(false);
  };

  // Initialize push notifications on mount
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        console.log('🔔 Initializing push notifications...');
        // Push notification initialization would go here
      } catch (error) {
        console.error('Error initializing push notifications:', error);
      }
    };
    
    initializeNotifications();
  }, []);

  // Update filtered notifications when notifications change
  useEffect(() => {
    filterNotifications(activeFilter);
  }, [notifications]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fef2f2" translucent={false} />
      
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ paddingBottom: 100 }} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#7f1d1d']}
            tintColor="#7f1d1d"
          />
        }
      >
        
        {/* Header - Now inside ScrollView for Instagram-style scrolling */}
        <View style={styles.scrollingHeader}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#7f1d1d" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>

        {/* Filter Tabs with Sliding */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {['All', 'Events', 'Likes', 'Comments', 'Follows'].map((filter, index) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterTab,
                  activeFilter === filter && styles.activeFilterTab,
                  index === 0 && styles.firstTab
                ]}
                onPress={() => handleFilterChange(filter)}
              >
                <Text style={[
                  styles.filterText,
                  activeFilter === filter && styles.activeFilterText
                ]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7f1d1d" />
            <Text style={styles.loadingText}>Loading notifications...</Text>
          </View>
        ) : (
          <View style={styles.notificationsContainer}>
            {filteredNotifications.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="notifications-outline" size={48} color="#D1D5DB" />
                <Text style={styles.emptyStateTitle}>No notifications</Text>
                <Text style={styles.emptyStateText}>
                  No {activeFilter.toLowerCase()} notifications found
                </Text>
              </View>
            ) : (
              filteredNotifications.map((item, index) => (
                <View key={item.id}>
                  <NotificationItem item={item} onMarkAsRead={handleMarkAsRead} />
                  {index < filteredNotifications.length - 1 && <View style={styles.separator} />}
                </View>
              ))
            )}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Main Container
  container: { 
    flex: 1, 
    backgroundColor: '#FFF2E8', 
  },
  
  // Scrolling Header Styles
  scrollingHeader: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FFF2E8',
    alignItems: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 56,
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#7f1d1d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#7f1d1d',
    letterSpacing: -0.5,
    textAlign: 'center'
  },
  
  // Filter Tabs with Sliding
  filterContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: '#FFF2E8',
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
  },
  filterScroll: { 
    paddingHorizontal: 20 
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  firstTab: {
    marginLeft: 0
  },
  activeFilterTab: { 
    backgroundColor: '#7f1d1d',
    borderColor: '#7f1d1d',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
  },
  activeFilterText: { 
    color: '#FFFFFF',
    fontWeight: '600'
  },
  
  // Notifications Container
  notificationsContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#7f1d1d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 68
  },
  
  // Simplified Notification Item (like Messages)
  notificationItem: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  unreadItem: {
    backgroundColor: '#FFF2E8',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  unreadIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#7f1d1d',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  notificationText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 20,
    flex: 1,
    marginRight: 8,
  },
  userName: {
    fontWeight: '600',
    color: '#7f1d1d',
  },
  timeText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '400',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  
  // Empty State Styles
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
