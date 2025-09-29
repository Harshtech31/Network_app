import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  StatusBar,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ShareService } from '../utils/ShareService';

const { width } = Dimensions.get('window');

export default function ClubDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState('about');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [membershipStatus, setMembershipStatus] = useState('none'); // 'none', 'pending', 'approved'
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'members', 'posts', 'events'
  const [memberCount, setMemberCount] = useState(1247);
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleStatClick = (type: string) => {
    if (membershipStatus !== 'approved') {
      Alert.alert(
        'Access Restricted',
        'You need admin approval to view detailed club information. Would you like to request access?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Request Access', 
            onPress: () => {
              setMembershipStatus('pending');
              Alert.alert('Request Sent', 'Your access request has been sent to club admins. You will be notified once approved.');
            }
          }
        ]
      );
    } else {
      setModalType(type);
      setShowMemberModal(true);
    }
  };

  const handleJoinClub = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (isJoined) {
        setIsJoined(false);
        setMembershipStatus('none');
        setMemberCount(prev => prev - 1);
        Alert.alert(
          'Left Club',
          'You have successfully left the club. You will no longer receive club updates or have access to member-only content.',
          [{ text: 'OK' }]
        );
      } else {
        setIsJoined(true);
        setMembershipStatus('pending');
        setMemberCount(prev => prev + 1);
        Alert.alert(
          'Join Request Sent!',
          'Your request to join the club has been sent to admins for approval. You will receive a notification once approved and gain access to exclusive content.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to join/leave club. Please check your connection and try again.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Retry', onPress: handleJoinClub }
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Simulate refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In real app, refetch club data here
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh club data.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleShare = async () => {
    try {
      const shareSuccess = await ShareService.shareClub({
        id: club.id,
        title: club.name,
        content: club.description,
        location: club.location
      });
      
      if (shareSuccess) {
        console.log('Club shared successfully');
      }
    } catch (error) {
      console.error('Error sharing club:', error);
      Alert.alert('Share Error', 'Unable to share this club.');
    }
  };

  const handleContactAdmin = (adminName: string) => {
    Alert.alert(
      'Contact Admin',
      `Initiating chat with ${adminName}... (Feature coming soon!)`,
      [{ text: 'OK' }]
    );
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    Alert.alert(
      isFollowing ? 'Unfollowed' : 'Following',
      isFollowing ? 'You are no longer following this club.' : 'You are now following this club and will receive updates.',
      [{ text: 'OK' }]
    );
  };

  const handleRSVP = (eventTitle: string) => {
    Alert.alert(
      'RSVP Confirmed',
      `You have successfully RSVP'd for "${eventTitle}". You will receive a confirmation email shortly.`,
      [{ text: 'OK' }]
    );
  };

  const handlePostAction = (action: string, postAuthor: string) => {
    Alert.alert(
      'Action Completed',
      `${action} action performed on ${postAuthor}'s post.`,
      [{ text: 'OK' }]
    );
  };

  // Mock club data - in real app this would come from API based on params.id
  const club = {
    id: Array.isArray(params.id) ? params.id[0] : params.id || '1',
    name: Array.isArray(params.name) ? params.name[0] : params.name || 'Tech Innovators Club',
    category: Array.isArray(params.category) ? params.category[0] : params.category || 'Technology',
    description: 'A community of passionate technologists exploring cutting-edge innovations, sharing knowledge, and building the future together.',
    longDescription: 'Tech Innovators Club is a vibrant community where technology enthusiasts, developers, designers, and entrepreneurs come together to explore the latest trends in tech. We organize workshops, hackathons, networking events, and guest speaker sessions featuring industry leaders.',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=200&fit=crop',
    members: memberCount,
    posts: 89,
    events: 24,
    membersList: [
      { id: 1, name: 'Sarah Johnson', role: 'Active Member', avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&size=40&background=8B1A1A&color=fff', joinDate: 'Jan 2023' },
      { id: 2, name: 'Michael Chen', role: 'Core Contributor', avatar: 'https://ui-avatars.com/api/?name=Michael+Chen&size=40&background=059669&color=fff', joinDate: 'Mar 2023' },
      { id: 3, name: 'Emily Davis', role: 'Event Organizer', avatar: 'https://ui-avatars.com/api/?name=Emily+Davis&size=40&background=7C3AED&color=fff', joinDate: 'Feb 2023' },
      { id: 4, name: 'Alex Rodriguez', role: 'Active Member', avatar: 'https://ui-avatars.com/api/?name=Alex+Rodriguez&size=40&background=DC2626&color=fff', joinDate: 'Apr 2023' },
      { id: 5, name: 'Jessica Kim', role: 'Mentor', avatar: 'https://ui-avatars.com/api/?name=Jessica+Kim&size=40&background=0891B2&color=fff', joinDate: 'Dec 2022' },
    ],
    founded: 'January 2022',
    location: 'San Francisco, CA',
    website: 'www.techinnovators.club',
    admins: [
      { name: 'David Kim', role: 'Founder & President', avatar: 'https://ui-avatars.com/api/?name=David+Kim&size=40&background=8B1A1A&color=fff' },
      { name: 'Emma Wilson', role: 'Vice President', avatar: 'https://ui-avatars.com/api/?name=Emma+Wilson&size=40&background=059669&color=fff' },
    ],
    upcomingEvents: [
      {
        title: 'AI & Machine Learning Workshop',
        date: 'March 15, 2024',
        time: '2:00 PM - 5:00 PM',
        location: 'Tech Hub, Downtown',
        attendees: 45
      },
      {
        title: 'Startup Pitch Night',
        date: 'March 22, 2024',
        time: '6:00 PM - 9:00 PM',
        location: 'Innovation Center',
        attendees: 78
      },
      {
        title: 'Blockchain Fundamentals',
        date: 'March 29, 2024',
        time: '1:00 PM - 4:00 PM',
        location: 'Virtual Event',
        attendees: 120
      }
    ],
    recentPosts: [
      {
        author: 'David Kim',
        time: '2 hours ago',
        content: 'Excited to announce our upcoming AI workshop! We have some amazing speakers lined up.',
        likes: 24,
        comments: 8
      },
      {
        author: 'Emma Wilson',
        time: '1 day ago',
        content: 'Great turnout at yesterday\'s networking event! Thanks to everyone who joined us.',
        likes: 31,
        comments: 12
      },
      {
        author: 'Tech Innovators Club',
        time: '3 days ago',
        content: 'Check out the highlights from our recent hackathon. Amazing projects from our community!',
        likes: 67,
        comments: 23
      }
    ],
    rules: [
      'Be respectful and professional in all interactions',
      'No spam or self-promotion without permission',
      'Share knowledge and help fellow members',
      'Attend events when you RSVP',
      'Follow community guidelines and code of conduct'
    ]
  };

  const renderAbout = () => (
    <View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.description}>{club.longDescription}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Club Information</Text>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color="#6B7280" />
          <Text style={styles.infoLabel}>Founded:</Text>
          <Text style={styles.infoValue}>{club.founded}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={16} color="#6B7280" />
          <Text style={styles.infoLabel}>Location:</Text>
          <Text style={styles.infoValue}>{club.location}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="globe-outline" size={16} color="#6B7280" />
          <Text style={styles.infoLabel}>Website:</Text>
          <Text style={[styles.infoValue, styles.linkText]}>{club.website}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Club Admins</Text>
        {club.admins.map((admin, index) => (
          <View key={index} style={styles.adminCard}>
            <Image source={{ uri: admin.avatar }} style={styles.adminAvatar} />
            <View style={styles.adminInfo}>
              <Text style={styles.adminName}>{admin.name}</Text>
              <Text style={styles.adminRole}>{admin.role}</Text>
            </View>
            <TouchableOpacity style={styles.messageButton} onPress={() => handleContactAdmin(admin.name)}>
              <Ionicons name="chatbubble-outline" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Community Rules</Text>
        {club.rules.map((rule, index) => (
          <View key={index} style={styles.ruleItem}>
            <Text style={styles.ruleNumber}>{index + 1}.</Text>
            <Text style={styles.ruleText}>{rule}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderEvents = () => (
    <View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Events</Text>
        {club.upcomingEvents.map((event, index) => (
          <View key={index} style={styles.eventCard}>
            <View style={styles.eventHeader}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <View style={styles.attendeeBadge}>
                <Ionicons name="people" size={12} color="#6B7280" />
                <Text style={styles.attendeeCount}>{event.attendees}</Text>
              </View>
            </View>
            <View style={styles.eventDetails}>
              <View style={styles.eventDetail}>
                <Ionicons name="calendar" size={14} color="#8B1A1A" />
                <Text style={styles.eventDetailText}>{event.date}</Text>
              </View>
              <View style={styles.eventDetail}>
                <Ionicons name="time" size={14} color="#8B1A1A" />
                <Text style={styles.eventDetailText}>{event.time}</Text>
              </View>
              <View style={styles.eventDetail}>
                <Ionicons name="location" size={14} color="#8B1A1A" />
                <Text style={styles.eventDetailText}>{event.location}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.rsvpButton} onPress={() => handleRSVP(event.title)}>
              <Text style={styles.rsvpButtonText}>RSVP</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );

  const renderPosts = () => (
    <View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Posts</Text>
        {club.recentPosts.map((post, index) => (
          <View key={index} style={styles.postCard}>
            <View style={styles.postHeader}>
              <Text style={styles.postAuthor}>{post.author}</Text>
              <Text style={styles.postTime}>{post.time}</Text>
            </View>
            <Text style={styles.postContent}>{post.content}</Text>
            <View style={styles.postActions}>
              <TouchableOpacity style={styles.postAction} onPress={() => handlePostAction('Like', post.author)}>
                <Ionicons name="heart-outline" size={16} color="#6B7280" />
                <Text style={styles.postActionText}>{post.likes}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.postAction} onPress={() => handlePostAction('Comment', post.author)}>
                <Ionicons name="chatbubble-outline" size={16} color="#6B7280" />
                <Text style={styles.postActionText}>{post.comments}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.postAction} onPress={() => handlePostAction('Share', post.author)}>
                <Ionicons name="share-outline" size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Animated Header */}
      <Animated.View style={[styles.animatedHeader, { opacity: headerOpacity }]}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.animatedHeaderTitle}>{club.name}</Text>
        <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
          <Ionicons name="share-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>

      <Animated.ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Image source={{ uri: club.image }} style={styles.heroImage} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.heroGradient}
          />
          
          {/* Floating Header Buttons */}
          <View style={styles.floatingHeader}>
            <TouchableOpacity 
              style={styles.floatingButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#1F2937" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.floatingButton} onPress={handleShare}>
              <Ionicons name="share-outline" size={24} color="#1F2937" />
            </TouchableOpacity>
          </View>

          {/* Club Info Overlay */}
          <Animated.View style={[styles.clubInfoOverlay, { opacity: fadeAnim }]}>
            <View style={styles.clubLogoContainer}>
              <Image source={{ uri: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(club.name) + '&size=80&background=8B1A1A&color=fff' }} style={styles.clubLogo} />
            </View>
            <Text style={styles.heroClubName}>{club.name}</Text>
            <Text style={styles.heroClubCategory}>{club.category}</Text>
            <Text style={styles.heroClubDescription}>{club.description}</Text>
          </Animated.View>
        </View>

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <TouchableOpacity style={styles.statItem} onPress={() => handleStatClick('members')}>
            <Text style={styles.statNumber}>{club.members.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Members</Text>
            {membershipStatus === 'approved' && <Ionicons name="chevron-forward" size={16} color="#8B1A1A" />}
            {membershipStatus === 'pending' && <Ionicons name="time-outline" size={16} color="#F59E0B" />}
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <TouchableOpacity style={styles.statItem} onPress={() => handleStatClick('posts')}>
            <Text style={styles.statNumber}>{club.posts}</Text>
            <Text style={styles.statLabel}>Posts</Text>
            {membershipStatus === 'approved' && <Ionicons name="chevron-forward" size={16} color="#8B1A1A" />}
            {membershipStatus === 'pending' && <Ionicons name="time-outline" size={16} color="#F59E0B" />}
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <TouchableOpacity style={styles.statItem} onPress={() => handleStatClick('events')}>
            <Text style={styles.statNumber}>{club.events}</Text>
            <Text style={styles.statLabel}>Events</Text>
            {membershipStatus === 'approved' && <Ionicons name="chevron-forward" size={16} color="#8B1A1A" />}
            {membershipStatus === 'pending' && <Ionicons name="time-outline" size={16} color="#F59E0B" />}
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={[styles.primaryButton, isJoined && styles.joinedButton]}
            onPress={handleJoinClub}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={isJoined ? "#8B1A1A" : "#FFFFFF"} />
            ) : (
              <>
                <Ionicons 
                  name={isJoined ? "checkmark-circle" : "add-circle"} 
                  size={20} 
                  color={isJoined ? "#8B1A1A" : "#FFFFFF"} 
                />
                <Text style={[styles.primaryButtonText, isJoined && styles.joinedButtonText]}>
                  {isJoined ? "Leave Club" : "Join Club"}
                </Text>
              </>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.secondaryButton, isFollowing && styles.followingButton]}
            onPress={handleFollow}
          >
            <Ionicons 
              name={isFollowing ? "heart" : "heart-outline"} 
              size={20} 
              color={isFollowing ? "#EF4444" : "#8B1A1A"} 
            />
            <Text style={[styles.secondaryButtonText, isFollowing && styles.followingButtonText]}>
              {isFollowing ? "Following" : "Follow"}
            </Text>
          </TouchableOpacity>
        </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {['about', 'events', 'posts'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'about' && renderAbout()}
          {activeTab === 'events' && renderEvents()}
          {activeTab === 'posts' && renderPosts()}
        </View>
      </Animated.ScrollView>

      {/* Member Info Modal */}
      <Modal
        visible={showMemberModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowMemberModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {modalType === 'members' && 'Club Members'}
              {modalType === 'posts' && 'Recent Posts'}
              {modalType === 'events' && 'Upcoming Events'}
            </Text>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowMemberModal(false)}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {modalType === 'members' && (
              <View>
                {club.membersList.map((member) => (
                  <View key={member.id} style={styles.memberItem}>
                    <Image source={{ uri: member.avatar }} style={styles.memberAvatar} />
                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName}>{member.name}</Text>
                      <Text style={styles.memberRole}>{member.role}</Text>
                      <Text style={styles.memberJoinDate}>Joined {member.joinDate}</Text>
                    </View>
                    <TouchableOpacity style={styles.memberActionButton} onPress={() => handleContactAdmin(member.name)}>
                      <Ionicons name="chatbubble-outline" size={20} color="#8B1A1A" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
            
            {modalType === 'posts' && (
              <View>
                {club.recentPosts.map((post, index) => (
                  <View key={index} style={styles.modalPostCard}>
                    <View style={styles.postHeader}>
                      <Text style={styles.postAuthor}>{post.author}</Text>
                      <Text style={styles.postTime}>{post.time}</Text>
                    </View>
                    <Text style={styles.postContent}>{post.content}</Text>
                    <View style={styles.postActions}>
                      <TouchableOpacity style={styles.postAction} onPress={() => handlePostAction('Like', post.author)}>
                        <Ionicons name="heart-outline" size={16} color="#6B7280" />
                        <Text style={styles.postActionText}>{post.likes}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.postAction} onPress={() => handlePostAction('Comment', post.author)}>
                        <Ionicons name="chatbubble-outline" size={16} color="#6B7280" />
                        <Text style={styles.postActionText}>{post.comments}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
            
            {modalType === 'events' && (
              <View>
                {club.upcomingEvents.map((event, index) => (
                  <View key={index} style={styles.modalEventCard}>
                    <View style={styles.eventHeader}>
                      <Text style={styles.eventTitle}>{event.title}</Text>
                      <Text style={styles.eventDate}>{event.date}</Text>
                    </View>
                    <Text style={styles.eventTime}>{event.time}</Text>
                    <Text style={styles.eventLocation}>{event.location}</Text>
                    <View style={styles.eventFooter}>
                      <Text style={styles.eventAttendees}>{event.attendees} attending</Text>
                      <TouchableOpacity style={styles.eventJoinButton} onPress={() => handleRSVP(event.title)}>
                        <Text style={styles.eventJoinText}>Join Event</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  animatedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: '#7f1d1d',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 15,
    zIndex: 1000,
    paddingTop: 50,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  animatedHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heroSection: {
    height: 300,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  floatingHeader: {
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
  clubInfoOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  clubLogoContainer: {
    alignSelf: 'center',
    marginBottom: 12,
  },
  clubLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  heroClubName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  heroClubCategory: {
    fontSize: 16,
    color: '#F3F4F6',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  heroClubDescription: {
    fontSize: 14,
    color: '#E5E7EB',
    textAlign: 'center',
    lineHeight: 20,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: -30,
    borderRadius: 16,
    flexDirection: 'row',
    paddingVertical: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#7f1d1d',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 28,
    gap: 8,
    elevation: 4,
    shadowColor: '#8B1A1A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  joinedButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#7f1d1d',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  joinedButtonText: {
    color: '#7f1d1d',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 28,
    gap: 8,
    borderWidth: 2,
    borderColor: '#7f1d1d',
  },
  followingButton: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  secondaryButtonText: {
    color: '#7f1d1d',
    fontSize: 16,
    fontWeight: '700',
  },
  followingButtonText: {
    color: '#EF4444',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#7f1d1d',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  tabContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 26,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 12,
    marginRight: 12,
    fontWeight: '500',
    minWidth: 80,
  },
  infoValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
    flex: 1,
  },
  linkText: {
    color: '#7f1d1d',
  },
  adminCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    marginBottom: 8,
  },
  adminAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  adminInfo: {
    flex: 1,
  },
  adminName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  adminRole: {
    fontSize: 14,
    color: '#6B7280',
  },
  messageButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#7f1d1d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ruleItem: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingVertical: 8,
  },
  ruleNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7f1d1d',
    marginRight: 12,
    minWidth: 24,
  },
  ruleText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    lineHeight: 22,
  },
  eventCard: {
    backgroundColor: '#FEF2F2',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#8B1A1A',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
    marginRight: 12,
  },
  attendeeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  attendeeCount: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  eventDetails: {
    marginBottom: 16,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  eventDetailText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  rsvpButton: {
    backgroundColor: '#7f1d1d',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  rsvpButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  postCard: {
    backgroundColor: '#FEF2F2',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  postAuthor: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  postTime: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  postContent: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 16,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  postActionText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingTop: 60,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    marginBottom: 12,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  memberRole: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  memberJoinDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  memberActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPostCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  modalEventCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#8B1A1A',
  },
  eventDate: {
    fontSize: 14,
    color: '#7f1d1d',
    fontWeight: '600',
  },
  eventTime: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  eventFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eventAttendees: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  eventJoinButton: {
    backgroundColor: '#7f1d1d',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  eventJoinText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});