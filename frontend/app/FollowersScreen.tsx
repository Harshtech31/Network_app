import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio?: string;
  isFollowing: boolean;
  isVerified?: boolean;
  mutualFollowers?: number;
}

export default function FollowersScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [followers, setFollowers] = useState<User[]>([]);
  const [filteredFollowers, setFilteredFollowers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set());

  const screenTitle = params.type === 'following' ? 'Following' : 'Followers';
  const userName = params.userName || 'User';
  const totalCount = params.count || '0';

  // Mock followers data
  const mockFollowers: User[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      username: 'sarah.j',
      avatar: 'https://i.pravatar.cc/150?u=sarah',
      bio: 'Software Engineer at Google',
      isFollowing: true,
      isVerified: true,
      mutualFollowers: 12
    },
    {
      id: '2',
      name: 'Michael Chen',
      username: 'mike_chen',
      avatar: 'https://i.pravatar.cc/150?u=michael',
      bio: 'Product Designer • UI/UX',
      isFollowing: false,
      mutualFollowers: 8
    },
    {
      id: '3',
      name: 'Emma Wilson',
      username: 'emma.w',
      avatar: 'https://i.pravatar.cc/150?u=emma',
      bio: 'Data Scientist | ML Engineer',
      isFollowing: true,
      isVerified: true,
      mutualFollowers: 15
    },
    {
      id: '4',
      name: 'David Rodriguez',
      username: 'david_r',
      avatar: 'https://i.pravatar.cc/150?u=david',
      bio: 'Startup Founder',
      isFollowing: false,
      mutualFollowers: 5
    },
    {
      id: '5',
      name: 'Lisa Park',
      username: 'lisa.park',
      avatar: 'https://i.pravatar.cc/150?u=lisa',
      bio: 'Marketing Manager',
      isFollowing: true,
      mutualFollowers: 20
    },
    {
      id: '6',
      name: 'James Thompson',
      username: 'james_t',
      avatar: 'https://i.pravatar.cc/150?u=james',
      bio: 'Full Stack Developer',
      isFollowing: false,
      isVerified: true,
      mutualFollowers: 3
    },
    {
      id: '7',
      name: 'Anna Martinez',
      username: 'anna.m',
      avatar: 'https://i.pravatar.cc/150?u=anna',
      bio: 'Graphic Designer • Creative Director',
      isFollowing: true,
      mutualFollowers: 18
    },
    {
      id: '8',
      name: 'Ryan Kim',
      username: 'ryan_kim',
      avatar: 'https://i.pravatar.cc/150?u=ryan',
      bio: 'Cybersecurity Analyst',
      isFollowing: false,
      mutualFollowers: 7
    }
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setFollowers(mockFollowers);
      setFilteredFollowers(mockFollowers);
      setIsLoading(false);
      
      // Initialize following state
      const initialFollowing = new Set(
        mockFollowers.filter(user => user.isFollowing).map(user => user.id)
      );
      setFollowingUsers(initialFollowing);
    }, 1000);
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredFollowers(followers);
    } else {
      const filtered = followers.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFollowers(filtered);
    }
  }, [searchQuery, followers]);

  const handleFollowToggle = (userId: string) => {
    setFollowingUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });

    // Update the followers list
    setFollowers(prev => 
      prev.map(user => 
        user.id === userId 
          ? { ...user, isFollowing: !followingUsers.has(userId) }
          : user
      )
    );
  };

  const navigateToProfile = (user: User) => {
    router.push({
      pathname: '/UserProfileScreen',
      params: {
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar
      }
    });
  };

  const renderFollowerItem = ({ item }: { item: User }) => (
    <TouchableOpacity 
      style={styles.followerItem}
      onPress={() => navigateToProfile(item)}
      activeOpacity={0.7}
    >
      <View style={styles.followerInfo}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
          {item.isVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark" size={10} color="#FFFFFF" />
            </View>
          )}
        </View>
        
        <View style={styles.userDetails}>
          <View style={styles.nameRow}>
            <Text style={styles.userName} numberOfLines={1}>{item.name}</Text>
            {item.isVerified && (
              <Ionicons name="checkmark-circle" size={16} color="#991B1B" style={styles.verifiedIcon} />
            )}
          </View>
          <Text style={styles.userHandle} numberOfLines={1}>@{item.username}</Text>
          {item.bio && (
            <Text style={styles.userBio} numberOfLines={1}>{item.bio}</Text>
          )}
          {item.mutualFollowers && item.mutualFollowers > 0 && (
            <Text style={styles.mutualFollowers}>
              {item.mutualFollowers} mutual connections
            </Text>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.followButton,
          followingUsers.has(item.id) ? styles.followingButton : styles.followBtn
        ]}
        onPress={(e) => {
          e.stopPropagation();
          handleFollowToggle(item.id);
        }}
      >
        <Text style={[
          styles.followButtonText,
          followingUsers.has(item.id) ? styles.followingButtonText : styles.followBtnText
        ]}>
          {followingUsers.has(item.id) ? 'Following' : 'Follow'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{screenTitle}</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#991B1B" />
          <Text style={styles.loadingText}>Loading {screenTitle.toLowerCase()}...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{screenTitle}</Text>
          <Text style={styles.headerSubtitle}>{totalCount} {screenTitle.toLowerCase()}</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#7f1d1d" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search ${screenTitle.toLowerCase()}...`}
            placeholderTextColor="#7f1d1d"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filteredFollowers}
        renderItem={renderFollowerItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'No results found' : `No ${screenTitle.toLowerCase()} yet`}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery 
                ? `Try searching for a different name or username`
                : `When ${userName} has ${screenTitle.toLowerCase()}, they'll appear here`
              }
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 44,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#7f1d1d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#7f1d1d',
  },
  clearButton: {
    padding: 4,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
  },
  followerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  followerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#991B1B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginRight: 4,
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  userHandle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  userBio: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  mutualFollowers: {
    fontSize: 12,
    color: '#991B1B',
    fontWeight: '500',
  },
  followButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  followBtn: {
    backgroundColor: '#991B1B',
  },
  followingButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  followBtnText: {
    color: '#FFFFFF',
  },
  followingButtonText: {
    color: '#374151',
  },
  separator: {
    height: 1,
    backgroundColor: '#F9FAFB',
    marginLeft: 76,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});
