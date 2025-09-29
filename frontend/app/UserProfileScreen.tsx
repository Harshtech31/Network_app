import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ShareService } from '../utils/ShareService';
import apiService from '../utils/apiService';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  location: string;
  university: string;
  major: string;
  year: string;
  role: 'student' | 'teacher' | 'alumni';
  followers: number;
  following: number;
  projects: number;
  clubs: number;
  skills: string[];
  achievements: Array<{
    title: string;
    subtitle: string;
    icon: string;
  }>;
}

// Helper function to get role emoji
const getRoleEmoji = (role: 'student' | 'teacher' | 'alumni'): string => {
  switch (role) {
    case 'student':
      return '🎓';
    case 'teacher':
      return '👨‍🏫';
    case 'alumni':
      return '👥';
    default:
      return '🎓';
  }
};

// Mock user data - in real app this would come from API
const mockUser: User = {
  id: 'user123',
  name: 'Sarah Johnson',
  email: 'sarah.johnson@university.edu',
  avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
  bio: 'Computer Science student passionate about AI and machine learning. Always excited to collaborate on innovative projects!',
  location: 'Dubai, UAE',
  university: 'American University of Dubai',
  major: 'Computer Science',
  year: 'Junior',
  role: 'student',
  followers: 234,
  following: 189,
  projects: 12,
  clubs: 5,
  skills: ['Python', 'React', 'Machine Learning', 'Data Science', 'JavaScript', 'Node.js'],
  achievements: [
    { title: "Dean's List", subtitle: "Fall 2023 Semester", icon: "trophy" },
    { title: "Hackathon Winner", subtitle: "AI Challenge 2024", icon: "medal" },
    { title: "Research Assistant", subtitle: "ML Lab", icon: "book" },
    { title: "Club Vice President", subtitle: "CS Society", icon: "ribbon" },
  ],
};

export default function UserProfileScreen() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const params = useLocalSearchParams();
  const [isFollowing, setIsFollowing] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUserProfile();
  }, [params.userId]);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      const userId = params.userId as string;
      
      if (!userId) {
        setError('User ID not provided');
        return;
      }

      console.log('👤 Loading user profile:', userId);
      
      // Call API to get user profile
      const response = await apiService.get<any>(`/users/${userId}`);
      
      if (response.success && response.data) {
        const userData = response.data.user || response.data;
        
        // Convert backend user data to expected format
        const formattedUser: User = {
          id: userData.id,
          name: userData.firstName && userData.lastName ? `${userData.firstName} ${userData.lastName}` : userData.name || 'Unknown User',
          email: userData.email || '',
          avatar: userData.profileImage || `https://i.pravatar.cc/150?u=${userData.id}`,
          bio: userData.bio || 'No bio available',
          location: userData.location || 'Location not specified',
          university: userData.university || 'University not specified',
          major: userData.academic?.major || userData.major || 'Major not specified',
          year: userData.academic?.year?.toString() || userData.year || 'Year not specified',
          role: userData.role || 'student',
          followers: userData.followersCount || 0,
          following: userData.followingCount || 0,
          projects: userData.projectsCount || 0,
          clubs: userData.clubsCount || 0,
          skills: userData.skills || [],
          achievements: userData.achievements || [],
        };
        
        setUser(formattedUser);
        console.log('✅ User profile loaded:', formattedUser.name);
      } else {
        throw new Error('Failed to load user profile');
      }
    } catch (error) {
      console.error('❌ Error loading user profile:', error);
      setError('Failed to load user profile');
      // Fallback to mock data for demo purposes
      setUser(mockUser);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessage = () => {
    router.push(`/chat/${user.id}`);
  };

  const handleFollow = async () => {
    if (!user) return;
    
    try {
      console.log('👥 Following/unfollowing user:', user.id);
      
      const action = isFollowing ? 'unfollow' : 'follow';
      const response = await apiService.post(`/users/${user.id}/${action}`);
      
      if (response.success) {
        setIsFollowing(!isFollowing);
        console.log(`✅ Successfully ${action}ed user`);
        
        // Update follower count
        setUser(prev => prev ? {
          ...prev,
          followers: isFollowing ? prev.followers - 1 : prev.followers + 1
        } : null);
      } else {
        throw new Error(`Failed to ${action} user`);
      }
    } catch (error) {
      console.error('❌ Error following/unfollowing user:', error);
      Alert.alert('Error', 'Failed to update follow status. Please try again.');
    }
  };

  const handleShare = async () => {
    try {
      const shareSuccess = await ShareService.shareProfile({
        id: user.id,
        name: user.name,
        bio: user.bio,
        university: user.university,
        major: user.major
      });
      
      if (shareSuccess) {
        console.log('Profile shared successfully');
      }
    } catch (error) {
      console.error('Error sharing profile:', error);
      Alert.alert('Share Error', 'Unable to share this profile.');
    }
  };

  const navigateToFollowers = () => {
    router.push({
      pathname: '/FollowersScreen',
      params: {
        type: 'followers',
        userName: user.name,
        count: user.followers
      }
    });
  };

  const navigateToFollowing = () => {
    router.push({
      pathname: '/FollowersScreen',
      params: {
        type: 'following',
        userName: user.name,
        count: user.following
      }
    });
  };


  const renderProfileHeader = () => (
    <View style={styles.profileHeader}>
      <View style={styles.coverPhotoContainer}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80' }}
          style={styles.coverPhoto}
        />
        <View style={styles.floatingHeaderButtons}>
          <TouchableOpacity 
            style={styles.floatingButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.floatingButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.profileImageContainer}>
          <Image 
            source={{ uri: user.avatar }} 
            style={styles.profileImage}
            defaultSource={require('../assets/images/icon.png')}
          />
          {/* Role Emoji Badge */}
          <View style={styles.roleBadge}>
            <Text style={styles.roleEmoji}>{getRoleEmoji(user.role)}</Text>
          </View>
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
          </View>
        </View>
        
        <Text style={styles.profileName}>{user.name}</Text>
        <Text style={styles.profileHandle}>@{user.name.toLowerCase().replace(' ', '_')}</Text>
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={14} color="#7f1d1d" />
          <Text style={styles.profileLocation}>{user.university}</Text>
        </View>
        <View style={styles.joinedContainer}>
          <Ionicons name="calendar-outline" size={14} color="#7f1d1d" />
          <Text style={styles.joinedText}>{user.major} • {user.year}</Text>
        </View>
        
        <Text style={styles.bioText}>{user.bio}</Text>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.messageBtn} onPress={handleMessage}>
            <Ionicons name="chatbubble-ellipses" size={16} color="#FFFFFF" />
            <Text style={styles.messageBtnText}>Message</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.followBtn, isFollowing && styles.followingBtn]} 
            onPress={handleFollow}
          >
            <Ionicons 
              name={isFollowing ? "heart" : "heart-outline"} 
              size={16} 
              color={isFollowing ? "#FFFFFF" : "#8B1A1A"} 
            />
            <Text style={[styles.followBtnText, isFollowing && styles.followingBtnText]}>
              {isFollowing ? "Following" : "Follow"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <TouchableOpacity style={styles.statItem} onPress={navigateToFollowers}>
            <Text style={styles.statNumber}>{user.followers}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statItem} onPress={navigateToFollowing}>
            <Text style={styles.statNumber}>{user.following}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statItem}>
            <Text style={styles.statNumber}>{user.projects}</Text>
            <Text style={styles.statLabel}>Projects</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statItem}>
            <Text style={styles.statNumber}>{user.clubs}</Text>
            <Text style={styles.statLabel}>Clubs</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );



  const renderContent = () => (
    <View style={styles.contentContainer}>
      {/* Skills Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Skills</Text>
        <View style={styles.skillsContainer}>
          {user.skills.map((skill, index) => (
            <TouchableOpacity key={index} style={styles.skillChip}>
              <Text style={styles.skillText}>{skill}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Achievements Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        <View style={styles.achievementsGrid}>
          {user.achievements.map((achievement, index) => (
            <TouchableOpacity key={index} style={styles.achievementCard}>
              <View style={styles.achievementIcon}>
                <Ionicons name={achievement.icon as any} size={24} color="#8B1A1A" />
              </View>
              <Text style={styles.achievementTitle}>{achievement.title}</Text>
              <Text style={styles.achievementSubtitle}>{achievement.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Contact Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact</Text>
        <View style={styles.contactContainer}>
          <TouchableOpacity style={styles.contactItem}>
            <Ionicons name="mail-outline" size={16} color="#8B1A1A" />
            <Text style={styles.contactText}>{user.email}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactItem}>
            <Ionicons name="location-outline" size={16} color="#8B1A1A" />
            <Text style={styles.contactText}>{user.location}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );


  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7f1d1d" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />
        <View style={styles.errorContainer}>
          <Ionicons name="person-outline" size={64} color="#7f1d1d" />
          <Text style={styles.errorTitle}>Profile Not Found</Text>
          <Text style={styles.errorMessage}>
            {error || 'The user profile you\'re looking for doesn\'t exist.'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadUserProfile}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />
      <ScrollView style={styles.mainScrollView} showsVerticalScrollIndicator={false}>
        {renderProfileHeader()}
        {renderContent()}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF2E8',
  },
  mainScrollView: {
    flex: 1,
  },
  profileHeader: {
    backgroundColor: '#FFFFFF',
  },
  coverPhotoContainer: {
    height: 200,
    position: 'relative',
  },
  coverPhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  floatingHeaderButtons: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  floatingButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#991B1B',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
    marginTop: -60,
    marginHorizontal: 20,
    zIndex: 1,
    borderWidth: 1,
    borderColor: 'rgba(127, 29, 29, 0.1)',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    backgroundColor: '#F3F4F6',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
    textAlign: 'center',
  },
  profileHandle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 12,
    textAlign: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  profileLocation: {
    fontSize: 14,
    color: '#7f1d1d',
    marginLeft: 6,
  },
  joinedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  joinedText: {
    fontSize: 14,
    color: '#7f1d1d',
    marginLeft: 6,
  },
  bioText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  messageBtn: {
    backgroundColor: '#7f1d1d',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  messageBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  followBtn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#8B1A1A',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  followingBtn: {
    backgroundColor: '#7f1d1d',
    borderColor: '#8B1A1A',
  },
  followBtnText: {
    color: '#8B1A1A',
    fontSize: 14,
    fontWeight: '600',
  },
  followingBtnText: {
    color: '#FFFFFF',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  contactContainer: {
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
  },
  roleBadge: {
    position: 'absolute',
    top: -8,
    left: -8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roleEmoji: {
    fontSize: 20,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#7f1d1d',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#991B1B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  bottomSpacing: {
    height: 40,
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  skillText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementCard: {
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '47%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7f1d1d',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7f1d1d',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#7f1d1d',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});