import React, { useState, useRef, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import apiService from '../utils/apiService';
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

// Notifications will be loaded from API
const initialNotifications: any[] = [];

const NotificationItem = ({ item }: { item: typeof initialNotifications[0] }) => {
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
    <TouchableOpacity style={[styles.notificationItem, !item.read && styles.unreadItem]}>
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
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filteredNotifications, setFilteredNotifications] = useState(initialNotifications);
  const [activeFilter, setActiveFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter notifications based on active filter
  const filterNotifications = (filter: string) => {
    let filtered = notifications;
    
    switch (filter) {
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

  // Load notifications from API
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const response = await apiService.get<{notifications: any[]}>('/notifications');
        if (response.success && response.data) {
          const notificationsData = response.data.notifications || [];
          setNotifications(notificationsData);
          setFilteredNotifications(notificationsData);
        } else {
          // If no notifications or API fails, show empty state
          setNotifications([]);
          setFilteredNotifications([]);
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
        // Don't show error alert for empty notifications, just show empty state
        setNotifications([]);
        setFilteredNotifications([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
  }, []);

  // Update filtered notifications when notifications change
  useEffect(() => {
    filterNotifications(activeFilter);
  }, [notifications]);

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const response = await apiService.get<{notifications: any[]}>('/notifications');
      if (response.success && response.data) {
        const notificationsData = response.data.notifications || [];
        setNotifications(notificationsData);
        setFilteredNotifications(notificationsData);
      } else {
        setNotifications([]);
        setFilteredNotifications([]);
      }
    } catch (error) {
      console.error('Error refreshing notifications:', error);
      // Don't show error for refresh, just keep current state
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fef2f2" translucent={true} />
      
      {/* Header with Title */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.push('/(tabs)')}>
          <Ionicons name="close" size={24} color="#7f1d1d" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs with Sliding */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {['All', 'Likes', 'Comments', 'Follows'].map((filter, index) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterTab,
                activeFilter === filter && styles.activeFilterTab,
                index === 0 && styles.firstTab
              ]}
              onPress={() => handleFilterChange(filter)}
            >
              <View style={[
                styles.filterDot,
                activeFilter === filter && styles.activeFilterDot
              ]} />
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
        <FlatList
          data={filteredNotifications}
          renderItem={({ item }) => <NotificationItem item={item} />}
          keyExtractor={(item) => item.id}
          style={styles.notificationsList}
          contentContainerStyle={styles.notificationsContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={['#7f1d1d']}
              tintColor="#7f1d1d"
            />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Ionicons name="notifications-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyStateTitle}>No notifications</Text>
              <Text style={styles.emptyStateText}>
                No {activeFilter.toLowerCase()} notifications found
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Main Container
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF', 
    paddingTop: 0 
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#fef2f2'
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#7f1d1d',
    letterSpacing: -0.5
  },
  closeBtn: {
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#7f1d1d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  
  // Filter Tabs with Sliding
  filterContainer: { 
    backgroundColor: '#fef2f2', 
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  filterScroll: { 
    paddingHorizontal: 20 
  },
  filterTab: { 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    marginRight: 8, 
    borderRadius: 18, 
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  firstTab: {
    marginLeft: 0
  },
  activeFilterTab: { 
    backgroundColor: '#7f1d1d',
    borderColor: '#7f1d1d',
  },
  filterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
    marginRight: 8
  },
  activeFilterDot: {
    backgroundColor: '#FFFFFF'
  },
  filterText: { 
    fontSize: 13, 
    fontWeight: '500', 
    color: '#6B7280' 
  },
  activeFilterText: { 
    color: '#FFFFFF' 
  },
  
  // Notifications List
  notificationsList: { 
    flex: 1, 
    backgroundColor: '#FFFFFF' 
  },
  notificationsContent: { 
    paddingHorizontal: 0 
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 68
  },
  
  // Simplified Notification Item (like Messages)
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  unreadItem: {
    backgroundColor: '#fef2f2',
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#8B1A1A',
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
