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
  Clipboard,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
3
import { LinearGradient } from 'expo-linear-gradient';
import { ShareService } from '../utils/ShareService';

const { width } = Dimensions.get('window');

export default function ProjectDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'contributors', 'updates', 'resources'
  const [memberCount, setMemberCount] = useState(4);
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // Mock project data - in real app this would come from API based on params.id
  const project = {
    id: Array.isArray(params.id) ? params.id[0] : params.id || '1',
    title: Array.isArray(params.title) ? params.title[0] : params.title || 'AI-Powered Study Assistant',
    status: Array.isArray(params.status) ? params.status[0] : params.status || 'recruiting',
    description: 'A comprehensive study assistant that uses AI to help students organize their learning materials, create personalized study plans, and track progress. Features include smart note-taking, quiz generation, and collaborative study groups.',
    longDescription: 'This project aims to revolutionize how students approach learning by leveraging artificial intelligence and machine learning. The platform will analyze study patterns, identify knowledge gaps, and provide personalized recommendations to improve learning outcomes.',
    technologies: ['React Native', 'Node.js', 'Python', 'TensorFlow', 'MongoDB', 'AWS'],
    teamSize: '4/6 members',
    duration: '6 months',
    startDate: 'March 2024',
    leader: {
      name: 'Alex Johnson',
      role: 'Project Lead',
      avatar: 'https://ui-avatars.com/api/?name=Alex+Johnson&size=40&background=8B1A1A&color=fff'
    },
    team: [
      { name: 'Sarah Chen', role: 'Frontend Developer', avatar: 'https://ui-avatars.com/api/?name=Sarah+Chen&size=40&background=059669&color=fff' },
      { name: 'Mike Rodriguez', role: 'Backend Developer', avatar: 'https://ui-avatars.com/api/?name=Mike+Rodriguez&size=40&background=DC2626&color=fff' },
      { name: 'Lisa Wang', role: 'UI/UX Designer', avatar: 'https://ui-avatars.com/api/?name=Lisa+Wang&size=40&background=7C3AED&color=fff' },
    ],
    openRoles: [
      { title: 'ML Engineer', description: 'Experience with TensorFlow and Python required' },
      { title: 'Mobile Developer', description: 'React Native expertise needed' }
    ],
    milestones: [
      { title: 'Project Setup & Planning', status: 'completed', date: 'March 2024' },
      { title: 'Backend API Development', status: 'in-progress', date: 'April 2024' },
      { title: 'Frontend Implementation', status: 'pending', date: 'May 2024' },
      { title: 'AI Model Integration', status: 'pending', date: 'June 2024' },
      { title: 'Testing & Deployment', status: 'pending', date: 'July 2024' }
    ],
    updates: [
      {
        date: '2 days ago',
        author: 'Alex Johnson',
        content: 'Completed the initial database schema design. Ready to start backend development!'
      },
      {
        date: '1 week ago',
        author: 'Lisa Wang',
        content: 'Finished the wireframes and user flow diagrams. Check out the Figma link in our Discord.'
      },
      {
        date: '2 weeks ago',
        author: 'Sarah Chen',
        content: 'Set up the project repository and CI/CD pipeline. All team members have access now.'
      }
    ]
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return { bg: '#D1FAE5', text: '#065F46' };
      case 'recruiting': return { bg: '#FEF3C7', text: '#92400E' };
      case 'completed': return { bg: '#E0E7FF', text: '#3730A3' };
      default: return { bg: '#F3F4F6', text: '#6B7280' };
    }
  };

  const getMilestoneIcon = (status: string) => {
    switch (status) {
      case 'completed': return 'checkmark-circle';
      case 'in-progress': return 'play-circle';
      default: return 'ellipse-outline';
    }
  };

  const getMilestoneColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'in-progress': return '#F59E0B';
      default: return '#9CA3AF';
    }
  };

  const renderOverview = () => (
    <View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About This Project</Text>
        <Text style={styles.description}>{project.longDescription}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Technologies</Text>
        <View style={styles.techContainer}>
          {project.technologies.map((tech, index) => (
            <View key={index} style={styles.techChip}>
              <Text style={styles.techText}>{tech}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Project Details</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Duration:</Text>
          <Text style={styles.detailValue}>{project.duration}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Start Date:</Text>
          <Text style={styles.detailValue}>{project.startDate}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Team Size:</Text>
          <Text style={styles.detailValue}>{project.teamSize}</Text>
        </View>
      </View>
    </View>
  );

  const renderTeam = () => (
    <View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Project Leader</Text>
        <View style={styles.memberCard}>
          <Image source={{ uri: project.leader.avatar }} style={styles.memberAvatar} />
          <View style={styles.memberInfo}>
            <Text style={styles.memberName}>{project.leader.name}</Text>
            <Text style={styles.memberRole}>{project.leader.role}</Text>
          </View>
          <TouchableOpacity style={styles.contactButton} onPress={() => handleContact(project.leader.name)}>
            <Ionicons name="chatbubble-outline" size={16} color="#8B1A1A" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Team Members</Text>
        {project.team.map((member, index) => (
          <View key={index} style={styles.memberCard}>
            <Image source={{ uri: member.avatar }} style={styles.memberAvatar} />
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>{member.name}</Text>
              <Text style={styles.memberRole}>{member.role}</Text>
            </View>
            <TouchableOpacity style={styles.contactButton} onPress={() => handleContact(member.name)}>
              <Ionicons name="chatbubble-outline" size={16} color="#8B1A1A" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Open Positions</Text>
        {project.openRoles.map((role, index) => (
          <View key={index} style={styles.roleCard}>
            <Text style={styles.roleTitle}>{role.title}</Text>
            <Text style={styles.roleDescription}>{role.description}</Text>
            <TouchableOpacity style={styles.applyButton} onPress={() => handleApplyPosition(role.title, project.title)}>
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );

  const renderProgress = () => (
    <View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Project Milestones</Text>
        {project.milestones.map((milestone, index) => (
          <View key={index} style={styles.milestoneItem}>
            <Ionicons 
              name={getMilestoneIcon(milestone.status)} 
              size={20} 
              color={getMilestoneColor(milestone.status)} 
            />
            <View style={styles.milestoneContent}>
              <Text style={styles.milestoneTitle}>{milestone.title}</Text>
              <Text style={styles.milestoneDate}>{milestone.date}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Updates</Text>
        {project.updates.map((update, index) => (
          <View key={index} style={styles.updateItem}>
            <View style={styles.updateHeader}>
              <Text style={styles.updateAuthor}>{update.author}</Text>
              <Text style={styles.updateDate}>{update.date}</Text>
            </View>
            <Text style={styles.updateContent}>{update.content}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    Alert.alert(
      isFollowing ? 'Unfollowed' : 'Following',
      isFollowing ? 'You are no longer following this project.' : 'You are now following this project and will receive updates.',
      [{ text: 'OK' }]
    );
  };

  const handleJoinProject = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (isJoined) {
        setIsJoined(false);
        setMemberCount(prev => prev - 1);
        Alert.alert(
          'Left Project',
          'You have successfully left this project. You will no longer receive project updates or have access to team resources.',
          [{ text: 'OK' }]
        );
      } else {
        setIsJoined(true);
        setMemberCount(prev => prev + 1);
        Alert.alert(
          'Joined Project!',
          'Welcome to the team! You now have access to project resources and will receive updates. Check your email for team collaboration details.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to join/leave project. Please check your connection and try again.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Retry', onPress: handleJoinProject }
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
      // In real app, refetch project data here
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh project data.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleShare = async () => {
    try {
      const shareSuccess = await ShareService.shareProject({
        id: project.id,
        title: project.title,
        content: project.description,
        user: { name: project.leader.name }
      });
      
      if (shareSuccess) {
        console.log('Project shared successfully');
      } else {
        // Fallback to custom modal if native share fails
        setShowShareModal(true);
      }
    } catch (error) {
      console.error('Error sharing project:', error);
      // Fallback to custom modal
      setShowShareModal(true);
    }
  };

  const copyProjectLink = () => {
    const projectLink = `https://yourapp.com/project/${project.id}`;
    Clipboard.setString(projectLink);
    Alert.alert("Copied!", "Project link copied to clipboard");
    setShowShareModal(false);
  };

  const handleApplyPosition = (position: string, projectTitle: string) => {
    Alert.alert(
      'Application Sent',
      `Your application for "${position}" position in "${projectTitle}" has been sent to the project lead. You will receive a notification once reviewed.`,
      [{ text: 'OK' }]
    );
  };

  const handleContact = (name: string) => {
    Alert.alert(
      'Contact Member',
      `Initiating chat with ${name}... (Feature coming soon!)`,
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      

      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={['#8B1A1A', '#DC2626', '#EF4444']}
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

          {/* Project Info Overlay */}
          <Animated.View style={[styles.projectInfoOverlay, { opacity: headerOpacity }]}>
            <View style={styles.statusBadgeContainer}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(project.status).bg }]}>
                <Text style={[styles.statusText, { color: getStatusColor(project.status).text }]}>
                  {project.status}
                </Text>
              </View>
            </View>
            <Text style={styles.heroProjectTitle}>{project.title}</Text>
            <Text style={styles.heroProjectDescription}>{project.description}</Text>
          </Animated.View>
        </View>

        {/* Stats Card */}
        <View style={styles.modernStatsCard}>
          <View style={styles.modernStatItem}>
            <View style={styles.statIconContainer}>
              <Ionicons name="people-outline" size={20} color="#7f1d1d" />
            </View>
            <View style={styles.statTextContainer}>
              <Text style={styles.modernStatNumber}>4/6</Text>
              <Text style={styles.modernStatSubtext}>members</Text>
            </View>
            <Text style={styles.modernStatLabel}>Team Size</Text>
          </View>
          <View style={styles.modernStatItem}>
            <View style={styles.statIconContainer}>
              <Ionicons name="time-outline" size={20} color="#7f1d1d" />
            </View>
            <View style={styles.statTextContainer}>
              <Text style={styles.modernStatNumber}>{project.duration}</Text>
            </View>
            <Text style={styles.modernStatLabel}>Duration</Text>
          </View>
          <View style={styles.modernStatItem}>
            <View style={styles.statIconContainer}>
              <Ionicons name="calendar-outline" size={20} color="#7f1d1d" />
            </View>
            <View style={styles.statTextContainer}>
              <Text style={styles.modernStatNumber}>{project.startDate}</Text>
            </View>
            <Text style={styles.modernStatLabel}>Start Date</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={[styles.secondaryButton, { flex: 1 }]}
            onPress={handleFollow}
          >
            <Ionicons 
              name={isFollowing ? "heart" : "heart-outline"} 
              size={20} 
              color={isFollowing ? "#EF4444" : "#7f1d1d"} 
            />
            <Text style={styles.secondaryButtonText}>
              {isFollowing ? "Following" : "Follow"}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.primaryButton, { flex: 2 }]}
            onPress={handleJoinProject}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons 
                  name={isJoined ? "checkmark-circle" : "add-circle"} 
                  size={20} 
                  color="#FFFFFF" 
                />
                <Text style={styles.primaryButtonText}>
                  {isJoined ? "Leave Project" : "Join Project"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          {['overview', 'team', 'progress'].map((tab) => (
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
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'team' && renderTeam()}
          {activeTab === 'progress' && renderProgress()}
        </View>
      </Animated.ScrollView>

      {/* Share Modal */}
      <Modal
        visible={showShareModal}
        transparent={true}
        onRequestClose={() => setShowShareModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.shareModal}>
            <Text style={styles.shareModalTitle}>Share Project</Text>
            <View style={styles.linkContainer}>
              <Text style={styles.shareLink}>https://yourapp.com/project/{project.id}</Text>
            </View>
            <TouchableOpacity style={styles.copyButton} onPress={copyProjectLink}>
              <Ionicons name="copy-outline" size={16} color="#7f1d1d" />
              <Text style={styles.copyButtonText}>Copy Link</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeModalButton} onPress={() => setShowShareModal(false)}>
              <Text style={styles.closeModalText}>Close</Text>
            </TouchableOpacity>
          </View>
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
  animatedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 90,
    backgroundColor: '#7f1d1d',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 44,
    zIndex: 1000,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(127, 29, 29, 0.1)',
  },
  animatedHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    height: 300,
    backgroundColor: '#7f1d1d',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 150,
  },
  floatingHeader: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  floatingButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(127, 29, 29, 0.1)',
  },
  fixedShareButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1000,
  },
  shareButtonFixed: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(127, 29, 29, 0.1)',
  },
  projectInfoOverlay: {
    padding: 20,
    paddingBottom: 30,
  },
  statusBadgeContainer: {
    position: 'absolute',
    top: 10,
    right: 20,
    zIndex: 1,
  },
  heroProjectTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  heroProjectDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 24,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(127, 29, 29, 0.1)',
    zIndex: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#7f1d1d',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: '#7f1d1d',
    marginRight: 12,
  },
  secondaryButtonText: {
    color: '#7f1d1d',
    fontSize: 16,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(127, 29, 29, 0.1)',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#7f1d1d',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  tabContent: {
    padding: 20,
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(127, 29, 29, 0.1)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  techContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  techChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  techText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  memberRole: {
    fontSize: 14,
    color: '#6B7280',
  },
  contactButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(127, 29, 29, 0.1)',
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  applyButton: {
    backgroundColor: '#8B1A1A',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  milestoneContent: {
    marginLeft: 12,
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  milestoneDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  updateItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  updateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  updateAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  updateDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  updateContent: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  shareModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  linkContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(127, 29, 29, 0.1)',
  },
  shareLink: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 12,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#7f1d1d',
  },
  copyButtonText: {
    color: '#7f1d1d',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  closeModalButton: {
    backgroundColor: '#7f1d1d',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  closeModalText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modernStatsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(127, 29, 29, 0.1)',
    shadowColor: '#7f1d1d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  modernStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTextContainer: {
    minHeight: 50, // Adjust this value as needed for alignment
    alignItems: 'center',
    justifyContent: 'center',
  },
  modernStatNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  modernStatSubtext: {
    fontSize: 14,
    color: '#374151',
  },
  modernStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
});