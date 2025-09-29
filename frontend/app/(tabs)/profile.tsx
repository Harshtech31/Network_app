import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { router, useFocusEffect } from 'expo-router';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
    Animated,
    Dimensions,
    FlatList,
    Image,
    Modal,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Alert,
    Share,
} from 'react-native';
import PostDetailModal from '../../components/PostDetailModal';
import { useAuth } from '../../contexts/AuthContext';

const { width } = Dimensions.get('window');

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

export default function ProfileScreen() {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoType, setPhotoType] = useState('');
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [profileImage, setProfileImage] = useState('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80');
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80');
  const [userRole] = useState<'student' | 'teacher' | 'alumni'>('student');
  const [profileStats, setProfileStats] = useState({
    projects: 0,
    collaborations: 0,
    events: 0,
    connections: 0
  });
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const tabScrollRef = useRef<ScrollView>(null);

  // Refresh user data when screen comes into focus (only once)
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 Profile screen focused, refreshing user data...');
      refreshUser();
    }, []) // Remove refreshUser dependency to prevent infinite loop
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for profile image
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, []);

  // Refresh profile data when screen comes into focus (with debounce)
  const [lastRefresh, setLastRefresh] = useState(0);
  
  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      // Only refresh if it's been more than 5 seconds since last refresh
      if (now - lastRefresh > 5000) {
        setLastRefresh(now);
        refreshUser();
      }
    }, [refreshUser, lastRefresh])
  );

  const handleTabPress = (tab: string, index: number) => {
    setActiveTab(tab);
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  const handleSkillPress = (skill: string) => {
    // Add bounce animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    console.log(`Navigating to ${skill} details`);
  };

  const handlePhotoPress = (type: string) => {
    setPhotoType(type);
    setShowPhotoModal(true);
  };

  const handlePostPress = (post: any) => {
    setSelectedPost(post);
    setShowPostModal(true);
  };

  const handleUniversityPress = (university: string) => {
    console.log(`Navigating to ${university} page`);
  };

  // Image picker functionality
  const handleImagePicker = async (type: 'camera' | 'gallery') => {
    try {
      let result;
      if (type === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Camera permission is required to take photos');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: photoType === 'cover' ? [16, 9] : [1, 1],
          quality: 1,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Gallery permission is required to select photos');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: photoType === 'cover' ? [16, 9] : [1, 1],
          quality: 1,
        });
      }

      if (!result.canceled && result.assets[0]) {
        if (photoType === 'cover') {
          setCoverImage(result.assets[0].uri);
        } else {
          setProfileImage(result.assets[0].uri);
        }
        setShowPhotoModal(false);
        Alert.alert('Success', `${photoType === 'cover' ? 'Cover' : 'Profile'} photo updated!`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update photo');
    }
  };

  const handleRemovePhoto = () => {
    if (photoType === 'cover') {
      setCoverImage('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80');
    } else {
      setProfileImage('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80');
    }
    setShowPhotoModal(false);
    Alert.alert('Success', `${photoType === 'cover' ? 'Cover' : 'Profile'} photo removed!`);
  };

  // Share profile functionality
  const handleShareProfile = async () => {
    try {
      const profileUrl = 'https://campusconnect.app/profile/alexj_dev';
      const shareOptions = {
        message: `Check out Alex Johnson's profile on Campus Connect: ${profileUrl}`,
        url: profileUrl,
        title: 'Alex Johnson - Campus Connect Profile'
      };
      
      await Share.share(shareOptions);
    } catch (error) {
      Alert.alert('Error', 'Failed to share profile');
    }
  };

  // Edit profile navigation
  const handleEditProfile = () => {
    router.push('/profile/editProfile');
  };

  // Pull to refresh handler
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      // Refresh user data from backend
      await refreshUser();
      console.log('Profile data refreshed');
    } catch (error) {
      console.error('Error refreshing profile:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshUser]);

  const renderOverview = () => (
    <Animated.View style={{ opacity: fadeAnim }}>
      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.aboutText}>
          {user?.bio || (user ? `${user.firstName} ${user.lastName} is a student in ${user.department || 'their chosen field'}.` : 'No bio added yet. Edit your profile to add a description.')}
        </Text>
        {user?.username && (
          <Text style={styles.aboutText}>
            Username: @{user.username}
          </Text>
        )}
      </View>

      {/* Skills Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Skills</Text>
        <View style={styles.skillsContainer}>
          {user?.skills && user.skills.length > 0 ? (
            <View style={styles.skillsGrid}>
              {user.skills.map((skill: string, index: number) => (
                <View key={index} style={styles.skillTag}>
                  <Text style={styles.profileSkillText}>{skill}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.aboutText}>No skills added yet. Edit your profile to add skills.</Text>
          )}
        </View>
      </View>

      {/* Recent Projects */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Projects</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        {user?.projects && user.projects.length > 0 ? (
          user.projects.map((project: any, index: number) => (
            <View key={project.id || index} style={styles.projectCard}>
              <Text style={styles.projectTitle}>{project.title}</Text>
              <Text style={styles.projectDescription}>{project.description}</Text>
              <View style={styles.projectStatusContainer}>
                <View style={[styles.projectStatusBadge, 
                  project.status === 'Completed' ? styles.completedBadge : 
                  project.status === 'In Progress' ? styles.inProgressBadge : styles.onHoldBadge
                ]}>
                  <Text style={[styles.projectStatusText,
                    project.status === 'Completed' ? styles.completedText : 
                    project.status === 'In Progress' ? styles.inProgressText : styles.onHoldText
                  ]}>{project.status}</Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.projectCard}>
            <Text style={styles.aboutText}>No projects yet. Start creating to showcase your work!</Text>
          </View>
        )}
      </View>

      {/* Contact Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact</Text>
        <View style={styles.contactContainer}>
          {user?.contact?.email || user?.contact?.phone || user?.contact?.website || user?.contact?.github || user?.contact?.linkedin ? (
            <>
              {user.contact?.email && (
                <View style={styles.contactItem}>
                  <Ionicons name="mail-outline" size={16} color="#8B1A1A" />
                  <Text style={styles.contactText}>{user.contact.email}</Text>
                </View>
              )}
              {user.contact?.phone && (
                <View style={styles.contactItem}>
                  <Ionicons name="call-outline" size={16} color="#8B1A1A" />
                  <Text style={styles.contactText}>{user.contact.phone}</Text>
                </View>
              )}
              {user.contact?.website && (
                <View style={styles.contactItem}>
                  <Ionicons name="globe-outline" size={16} color="#8B1A1A" />
                  <Text style={styles.contactText}>{user.contact.website}</Text>
                </View>
              )}
              {user.contact?.github && (
                <View style={styles.contactItem}>
                  <Ionicons name="logo-github" size={16} color="#8B1A1A" />
                  <Text style={styles.contactText}>@{user.contact.github}</Text>
                </View>
              )}
              {user.contact?.linkedin && (
                <View style={styles.contactItem}>
                  <Ionicons name="logo-linkedin" size={16} color="#8B1A1A" />
                  <Text style={styles.contactText}>{user.contact.linkedin}</Text>
                </View>
              )}
            </>
          ) : (
            <Text style={styles.aboutText}>No contact information added yet. Edit your profile to add contact details.</Text>
          )}
        </View>
      </View>

      {/* Academic Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Academic</Text>
        <View style={styles.academicContainer}>
          {user?.academic?.major || user?.academic?.year || user?.academic?.gpa || user?.department || user?.year ? (
            <>
              {(user.academic?.major || user.department) && (
                <View style={styles.academicItem}>
                  <Text style={styles.academicLabel}>Major:</Text>
                  <Text style={styles.academicValue}>{user.academic?.major || user.department}</Text>
                </View>
              )}
              {(user.academic?.year || user.year) && (
                <View style={styles.academicItem}>
                  <Text style={styles.academicLabel}>Year:</Text>
                  <Text style={styles.academicValue}>{user.academic?.year || user.year}</Text>
                </View>
              )}
              {user.academic?.gpa && (
                <View style={styles.academicItem}>
                  <Text style={styles.academicLabel}>GPA:</Text>
                  <Text style={styles.academicValue}>{user.academic.gpa}</Text>
                </View>
              )}
            </>
          ) : (
            <Text style={styles.aboutText}>No academic information added yet. Edit your profile to add details.</Text>
          )}
        </View>
      </View>

      {/* Interests Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Interests</Text>
        <View style={styles.interestsContainer}>
          {user?.interests && user.interests.length > 0 ? (
            <View style={styles.skillsGrid}>
              {user.interests.map((interest: string, index: number) => (
                <View key={index} style={styles.interestTag}>
                  <Text style={styles.profileInterestText}>{interest}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.aboutText}>No interests added yet. Edit your profile to add your interests.</Text>
          )}
        </View>
      </View>
    </Animated.View>
  );

  const renderProjects = () => (
    <Animated.View style={{ opacity: fadeAnim }}>
      <View style={styles.projectsList}>
        {user?.projects && user.projects.length > 0 ? (
          user.projects.map((project: any, index: number) => (
            <View key={project.id || index} style={styles.modernProjectCard}>
              <Text style={styles.modernProjectTitle}>{project.title}</Text>
              <Text style={styles.modernProjectDescription}>{project.description}</Text>
              <View style={styles.projectStatusContainer}>
                <View style={[styles.projectStatusBadge, 
                  project.status === 'Completed' ? styles.completedBadge : 
                  project.status === 'In Progress' ? styles.inProgressBadge : styles.onHoldBadge
                ]}>
                  <Text style={[styles.projectStatusText,
                    project.status === 'Completed' ? styles.completedText : 
                    project.status === 'In Progress' ? styles.inProgressText : styles.onHoldText
                  ]}>{project.status}</Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.modernProjectCard}>
            <Text style={styles.aboutText}>No projects yet. Start creating to showcase your work!</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );

  const renderEvents = () => (
    <Animated.View style={{ opacity: fadeAnim }}>
      <View style={styles.eventCard}>
        {user?.events && user.events.length > 0 ? (
          user.events.map((event: any, index: number) => (
            <View key={event.id || index} style={styles.eventItem}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventDescription}>{event.description}</Text>
              {event.date && <Text style={styles.eventDate}>Date: {event.date}</Text>}
            </View>
          ))
        ) : (
          <Text style={styles.aboutText}>No events yet. Start organizing or attending events!</Text>
        )}
      </View>
    </Animated.View>
  );

  const renderPosts = () => (
    <Animated.View style={{ opacity: fadeAnim }}>
      <View style={styles.postsContainer}>
        <View style={styles.postCard}>
          <Text style={styles.aboutText}>No posts yet. Start sharing your thoughts and projects!</Text>
        </View>
      </View>
    </Animated.View>
  );

  const renderAchievements = () => (
    <Animated.View style={{ opacity: fadeAnim }}>
      <View style={styles.achievementsGrid}>
        <View style={styles.achievementCard}>
          <Text style={styles.aboutText}>No achievements yet. Keep working towards your goals!</Text>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#FFFFFF" 
        translucent={false} 
      />
      
      {/* Scrollable Profile Content */}
      <ScrollView 
        style={styles.mainScrollView} 
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#7f1d1d']}
            tintColor={'#7f1d1d'}
          />
        }
      >
        {/* Profile Header */}
        <Animated.View style={[styles.profileHeader, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.coverPhotoContainer}>
            <TouchableOpacity onPress={() => handlePhotoPress('cover')}>
              <Image
                source={{ uri: coverImage }}
                style={styles.coverPhoto}
              />
              <View style={styles.editCoverOverlay}>
                <Ionicons name="camera-outline" size={20} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.profileCard}>
            <TouchableOpacity onPress={() => handlePhotoPress('profile')} style={styles.profileImageContainer}>
              <Animated.Image
                source={{ uri: profileImage }}
                style={[styles.profileImage, { transform: [{ scale: pulseAnim }] }]}
              />
              {/* Role Emoji Badge */}
              <View style={styles.roleBadge}>
                <Text style={styles.roleEmoji}>{getRoleEmoji(userRole)}</Text>
              </View>
              <View style={styles.editProfileImageOverlay}>
                <Ionicons name="camera-outline" size={16} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            
            <Text style={styles.profileName}>
              {user ? `${user.firstName} ${user.lastName}` : 'Guest User'}
            </Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={14} color="#7f1d1d" />
              <Text style={styles.profileLocation}>
                {user?.department || 'No department set'}
              </Text>
            </View>
            <View style={styles.joinedContainer}>
              <Ionicons name="calendar-outline" size={14} color="#7f1d1d" />
              <Text style={styles.joinedText}>
                {user ? `Year ${user.year || 'N/A'}` : 'Recently joined'}
              </Text>
            </View>
            
            <Text style={styles.bioText}>
              {user?.email ? `Contact: ${user.email}` : 'No bio added yet. Edit your profile to add a description about yourself.'}
            </Text>

            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.editBtn} onPress={handleEditProfile}>
                <Ionicons name="create-outline" size={16} color="#FFFFFF" />
                <Text style={styles.editBtnText}>Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareBtn} onPress={handleShareProfile}>
                <Ionicons name="share-outline" size={16} color="#8B1A1A" />
                <Text style={styles.shareBtnText}>Share</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.statsContainer}>
              <TouchableOpacity style={styles.statItem} onPress={() => handleTabPress('projects', 1)}>
                <Text style={styles.statNumber}>{profileStats.projects}</Text>
                <Text style={styles.statLabel}>Projects</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.statItem} onPress={() => router.push('/CollaborationsScreen')}>
                <Text style={styles.statNumber}>{profileStats.collaborations}</Text>
                <Text style={styles.statLabel}>Collaborations</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.statItem} onPress={() => handleTabPress('events', 3)}>
                <Text style={styles.statNumber}>{profileStats.events}</Text>
                <Text style={styles.statLabel}>Events</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.statItem} onPress={() => router.push('/ConnectionsScreen')}>
                <Text style={styles.statNumber}>{profileStats.connections}</Text>
                <Text style={styles.statLabel}>Connections</Text>
              </TouchableOpacity>
            </View>

            {/* Tab Navigation inside Profile Box */}
            <ScrollView 
              ref={tabScrollRef}
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={[styles.tabScrollView, { marginTop: 24 }]}
            >
              <View style={styles.tabNavigation}>
                {['overview', 'projects', 'posts', 'events', 'achievements'].map((tab, index) => (
                  <TouchableOpacity
                    key={tab}
                    style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
                    onPress={() => handleTabPress(tab, index)}
                  >
                    <Text style={[styles.tabButtonText, activeTab === tab && styles.activeTabButtonText]}>
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </Animated.View>

        {/* Horizontal Swipeable Tab Content */}
        <View style={styles.swipeableContentContainer}>
          <FlatList
            ref={flatListRef}
            data={[
              { key: 'overview', component: renderOverview() },
              { key: 'projects', component: renderProjects() },
              { key: 'posts', component: renderPosts() },
              { key: 'events', component: renderEvents() },
              { key: 'achievements', component: renderAchievements() }
            ]}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.key}
            renderItem={({ item }) => (
              <ScrollView 
                style={styles.tabContentSwipeable}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
              >
                {item.component}
                <View style={styles.bottomSpacing} />
              </ScrollView>
            )}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / width);
              const tabs = ['overview', 'projects', 'posts', 'events', 'achievements'];
              setActiveTab(tabs[index]);
              
              // Auto-scroll the tab navigation to keep active tab visible
              if (tabScrollRef.current) {
                const tabWidth = 100; // minWidth from styles
                const scrollPosition = index * (tabWidth + 8); // tabWidth + marginHorizontal
                tabScrollRef.current.scrollTo({ x: scrollPosition, animated: true });
              }
            }}
          />
        </View>
      </ScrollView>

      {/* Photo Edit Modal */}
      <Modal
        visible={showPhotoModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPhotoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} onPress={() => setShowPhotoModal(false)} />
          <Animated.View style={styles.photoModal}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>
              Edit {photoType === 'cover' ? 'Cover Photo' : 'Profile Photo'}
            </Text>
            
            <TouchableOpacity style={styles.modalOption} onPress={() => handleImagePicker('camera')}>
              <Ionicons name="camera-outline" size={24} color="#8B1A1A" />
              <Text style={styles.modalOptionText}>Take Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.modalOption} onPress={() => handleImagePicker('gallery')}>
              <Ionicons name="image-outline" size={24} color="#8B1A1A" />
              <Text style={styles.modalOptionText}>Choose from Gallery</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.modalOption} onPress={handleRemovePhoto}>
              <Ionicons name="trash-outline" size={24} color="#EF4444" />
              <Text style={[styles.modalOptionText, { color: '#EF4444' }]}>Remove Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.modalCancel} onPress={() => setShowPhotoModal(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
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
  contentContainer: {
    height: 400,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profileHeaderSection: {
    backgroundColor: '#FFF2E8',
    paddingHorizontal: 0,
    paddingBottom: 20,
  },
  oldProjectCard: {
    width: (width - 60) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#7f1d1d',
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
  tabScrollView: {
    marginTop: 20,
    maxHeight: 50,
  },
  tabNavigation: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    backgroundColor: 'transparent',
    borderRadius: 25,
    padding: 4,
  },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    backgroundColor: '#fef2f2',
    minWidth: 100,
    borderWidth: 1,
    borderColor: 'rgba(127, 29, 29, 0.1)',
  },
  activeTabButton: {
    backgroundColor: '#7f1d1d',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7f1d1d',
  },
  activeTabButtonText: {
    color: '#FFFFFF',
  },
  tabContent: {
    width: width,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7f1d1d',
    marginBottom: 15,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  activitySubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  coverPhotoArea: {
    height: 200,
    width: '100%',
    position: 'relative',
  },
  coverGradient: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  editCoverButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 15,
    padding: 8,
  },
  profileInfo: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  editProfileButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#7f1d1d',
    borderRadius: 12,
    padding: 6,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7f1d1d',
    marginBottom: 4,
  },
  profileHandle: {
    fontSize: 16,
    color: '#7f1d1d',
    marginBottom: 10,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  profileLocation: {
    fontSize: 14,
    color: '#7f1d1d',
    marginLeft: 5,
  },
  joinedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  joinedText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 5,
  },
  bioText: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  messageBtn: {
    backgroundColor: '#7f1d1d',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  messageBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  followBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#7f1d1d',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  followBtnText: {
    color: '#7f1d1d',
    fontSize: 14,
    fontWeight: '500',
  },
  editBtn: {
    backgroundColor: '#7f1d1d',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  editBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  shareBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#7f1d1d',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  shareBtnText: {
    color: '#7f1d1d',
    fontSize: 14,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(127, 29, 29, 0.1)',
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#7f1d1d',
    marginBottom: 4,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  projectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  projectGridCard: {
    width: (width - 60) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  projectImagePlaceholder: {
    height: 100,
    borderRadius: 15,
    overflow: 'hidden',
  },
  projectGradient: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  projectContent: {
    padding: 15,
  },
  projectDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 10,
    lineHeight: 16,
  },
  projectTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  projectTag: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  projectTagText: {
    fontSize: 10,
    color: '#7f1d1d',
  },
  projectStatus: {
    marginBottom: 10,
  },
  projectMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricText: {
    fontSize: 12,
    color: '#6B7280',
  },
  seeAllButton: {
    alignItems: 'center',
    marginTop: 10,
  },
  seeAllText: {
    fontSize: 14,
    color: '#7f1d1d',
    fontWeight: '500',
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventImagePlaceholder: {
    width: 50,
    height: 50,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    marginRight: 15,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  eventAttendees: {
    fontSize: 12,
    color: '#6B7280',
  },
  eventRole: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  roleText: {
    fontSize: 12,
    color: '#7f1d1d',
    fontWeight: '500',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementCard: {
    width: (width - 60) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  achievementIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 5,
  },
  achievementSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 100,
  },
  aboutText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  skillChip: {
    backgroundColor: '#7f1d1d',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 14,
    color: '#7f1d1d',
    fontWeight: '600',
  },
  projectCard: {
    backgroundColor: '#FFF2E8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(127, 29, 29, 0.1)',
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: '#7f1d1d',
  },
  completedBadge: {
    backgroundColor: '#9a3412',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  activeStatusText: {
    color: '#FFFFFF',
  },
  completedStatusText: {
    color: '#FFFFFF',
  },
  projectDesc: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 18,
    marginBottom: 12,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  projectStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  projectStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  projectStatText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  contactContainer: {
    marginTop: 8,
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
  academicContainer: {
    marginTop: 8,
  },
  academicItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(127, 29, 29, 0.1)',
  },
  academicLabel: {
    fontSize: 14,
    color: '#7f1d1d',
    fontWeight: '500',
  },
  academicValue: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  interestChip: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  interestText: {
    fontSize: 12,
    color: '#7f1d1d',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
  },
  photoModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7f1d1d',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#FFF2E8',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#7f1d1d',
    marginLeft: 12,
    fontWeight: '500',
  },
  modalCancel: {
    backgroundColor: '#fef2f2',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  modalCancelText: {
    fontSize: 16,
    color: '#7f1d1d',
    fontWeight: '600',
  },
  postsContainer: {
    paddingVertical: 8,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  postHeaderText: {
    flex: 1,
  },
  postAuthor: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  postTimestamp: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  postContent: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(127, 29, 29, 0.1)',
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  postActionText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
    fontWeight: '500',
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
  editCoverOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editProfileImageOverlay: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#7f1d1d',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollableContentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  swipeableContentContainer: {
    flex: 1,
    marginTop: 20,
  },
  tabContentSwipeable: {
    width: width,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  // Modern project styles
  projectsList: {
    marginBottom: 20,
  },
  modernProjectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(127, 29, 29, 0.1)',
  },
  modernProjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  projectIconContainer: {
    marginRight: 12,
  },
  projectIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectHeaderInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modernProjectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  modernStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeStatusBadge: {
    backgroundColor: '#FEF2F2',
  },
  completedStatusBadge: {
    backgroundColor: '#fef2f2',
  },
  inProgressStatusBadge: {
    backgroundColor: '#FFF2E8',
  },
  modernStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  modernActiveStatusText: {
    color: '#7f1d1d',
  },
  modernCompletedStatusText: {
    color: '#7f1d1d',
  },
  inProgressStatusText: {
    color: '#7f1d1d',
  },
  modernProjectDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 16,
  },
  projectProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#FFF2E8',
    borderRadius: 3,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#7f1d1d',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    minWidth: 35,
  },
  modernProjectTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  modernProjectTag: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: 'rgba(139, 26, 26, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
  },
  modernProjectTagText: {
    fontSize: 12,
    color: '#7f1d1d',
    fontWeight: '500',
  },
  modernProjectMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  modernMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modernMetricText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  modernSeeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 26, 26, 0.2)',
    gap: 8,
  },
  modernSeeAllText: {
    fontSize: 14,
    color: '#7f1d1d',
    fontWeight: '600',
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
  // Skills and Interests Styles
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: 'rgba(139, 26, 26, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  profileSkillText: {
    fontSize: 12,
    color: '#7f1d1d',
    fontWeight: '500',
  },
  interestTag: {
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  profileInterestText: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '500',
  },
  // Project Styles (Alternative)
  projectTitleAlt: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  projectDescriptionAlt: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  projectStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  projectStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  completedBadgeAlt: {
    backgroundColor: '#f0fdf4',
    borderColor: '#16a34a',
  },
  inProgressBadge: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
  },
  onHoldBadge: {
    backgroundColor: '#fef2f2',
    borderColor: '#ef4444',
  },
  projectStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  completedText: {
    color: '#16a34a',
  },
  inProgressText: {
    color: '#f59e0b',
  },
  onHoldText: {
    color: '#ef4444',
  },
  // Event Styles
  eventItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#7f1d1d',
  },
  eventTitleAlt: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  eventDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 6,
  },
  eventDateAlt: {
    fontSize: 12,
    color: '#7f1d1d',
    fontWeight: '500',
  },
});