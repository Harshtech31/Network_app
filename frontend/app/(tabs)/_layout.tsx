// app/(tabs)/_layout.tsx
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { NotificationBadge } from '../../components/NotificationBadge';

// Animated Tab Icon Component
const AnimatedTabIcon = ({ name, size, color, focused, onPress }: {
  name: keyof typeof Ionicons.glyphMap;
  size: number;
  color: string;
  focused: boolean;
  onPress?: () => void;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (focused) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1.1,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [focused]);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={{
      backgroundColor: focused ? "#7f1d1d" : "transparent",
      borderRadius: 20,
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 2,
      transform: [{ scale: scaleAnim }],
    }}>
      <Animated.View style={{ transform: [{ rotate }] }}>
        <Ionicons name={name} size={size} color={color} />
      </Animated.View>
    </Animated.View>
  );
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#7f1d1d',
        tabBarInactiveTintColor: '#111111',
        tabBarStyle: {
          backgroundColor: '#FFF2E8',
          borderTopWidth: 0,
          marginHorizontal: 0,
          marginBottom: 0,
          height: 64,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 4,
          paddingTop: 10,
          paddingBottom: 10,
          paddingHorizontal: 20,
          boxShadow: '0px 8px 12px rgba(0, 0, 0, 0.08)',
        },
        headerShown: false,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <View style={focused ? styles.activeTabContainer : styles.inactiveTabContainer}>
              <Ionicons 
                name={focused ? "home" : "home-outline"} 
                size={24}
                color={focused ? "#FFFFFF" : "#111111"}
              />
            </View>
          ),
        }} 
      />
      <Tabs.Screen 
        name="CalenderScreen" 
        options={{
          title: 'Calendar',
          tabBarIcon: ({ focused }) => (
            <View style={focused ? styles.activeTabContainer : styles.inactiveTabContainer}>
              <Ionicons 
                name={focused ? "calendar" : "calendar-outline"} 
                size={24}
                color={focused ? "#FFFFFF" : "#111111"}
              />
            </View>
          ),
        }} 
      />
      <Tabs.Screen 
        name="CreateScreen" 
        options={{
          title: 'Create',
          tabBarIcon: ({ focused }) => (
            <View style={focused ? styles.activeTabContainer : styles.inactiveTabContainer}>
              <Ionicons 
                name={focused ? "add-circle" : "add-circle-outline"} 
                size={28}
                color={focused ? "#FFFFFF" : "#111111"}
              />
            </View>
          ),
        }} 
      />
      <Tabs.Screen 
        name="NotificationsScreen" 
        options={{
          title: 'Notifications',
          tabBarIcon: ({ focused }) => (
            <View style={focused ? styles.activeTabContainer : styles.inactiveTabContainer}>
              <Ionicons 
                name={focused ? "notifications" : "notifications-outline"} 
                size={24}
                color={focused ? "#FFFFFF" : "#111111"}
              />
              <NotificationBadge style={{ top: -6, right: -6 }} />
            </View>
          ),
        }} 
      />
      <Tabs.Screen 
        name="SearchScreen" 
        options={{
          title: 'Search',
          tabBarIcon: ({ focused }) => (
            <View style={focused ? styles.activeTabContainer : styles.inactiveTabContainer}>
              <Ionicons 
                name={focused ? "search" : "search-outline"} 
                size={24}
                color={focused ? "#FFFFFF" : "#111111"}
              />
            </View>
          ),
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{
          title: 'Profile',
          href: null,
        }} 
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  activeTabContainer: {
    backgroundColor: '#7f1d1d',
    borderRadius: 20,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactiveTabContainer: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});