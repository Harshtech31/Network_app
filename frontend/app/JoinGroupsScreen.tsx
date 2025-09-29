import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
  Modal,
  Animated,
} from 'react-native';

// Types
type StudyGroup = {
  id: string;
  name: string;
  description: string;
  category: string;
  privacy: 'Public' | 'Private';
  activity: 'Very Active' | 'Active' | 'Moderate';
  rating: number;
  members: number;
  maxMembers: number;
  schedule: string;
  location: string;
  tags: string[];
  admin: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  image: string;
  isJoined: boolean;
};

// Mock Data
const STUDY_GROUPS: StudyGroup[] = [
  {
    id: '1',
    name: 'CS Study Group',
    description: 'Weekly study sessions for computer science students. We cover algorithms, data structures, and programming concepts.',
    category: 'Computer Science',
    privacy: 'Public',
    activity: 'Very Active',
    rating: 4.8,
    members: 45,
    maxMembers: 60,
    schedule: 'Wednesdays 6:00 PM',
    location: 'Library Study Room 3',
    tags: ['Study', 'Programming', 'Algorithms'],
    admin: {
      name: 'Sarah Chen',
      avatar: 'https://i.pravatar.cc/150?u=sarah',
      verified: true,
    },
    image: 'https://source.unsplash.com/400x300/?computer,study',
    isJoined: false,
  },
  {
    id: '2',
    name: 'Engineering Innovation Hub',
    description: 'Collaborative space for engineering students to work on innovative projects and share ideas.',
    category: 'Engineering',
    privacy: 'Public',
    activity: 'Active',
    rating: 4.6,
    members: 32,
    maxMembers: 50,
    schedule: 'Fridays 4:00 PM',
    location: 'Engineering Lab 2',
    tags: ['Innovation', 'Projects', 'Collaboration'],
    admin: {
      name: 'David Kim',
      avatar: 'https://i.pravatar.cc/150?u=david',
      verified: true,
    },
    image: 'https://source.unsplash.com/400x300/?engineering,innovation',
    isJoined: true,
  },
  {
    id: '3',
    name: 'Business Entrepreneurs',
    description: 'Network of aspiring entrepreneurs sharing business ideas, startup strategies, and market insights.',
    category: 'Business',
    privacy: 'Public',
    activity: 'Active',
    rating: 4.7,
    members: 28,
    maxMembers: 40,
    schedule: 'Tuesdays 7:00 PM',
    location: 'Business Center',
    tags: ['Entrepreneurship', 'Startups', 'Networking'],
    admin: {
      name: 'Emma Thompson',
      avatar: 'https://i.pravatar.cc/150?u=emma',
      verified: true,
    },
    image: 'https://source.unsplash.com/400x300/?business,meeting',
    isJoined: false,
  },
  {
    id: '4',
    name: 'Psychology Research Circle',
    description: 'Research-focused group for psychology students interested in conducting studies and analyzing behavioral data.',
    category: 'Psychology',
    privacy: 'Private',
    activity: 'Moderate',
    rating: 4.9,
    members: 18,
    maxMembers: 25,
    schedule: 'Mondays 5:00 PM',
    location: 'Psychology Lab',
    tags: ['Research', 'Psychology', 'Data Analysis'],
    admin: {
      name: 'Maria Rodriguez',
      avatar: 'https://i.pravatar.cc/150?u=maria',
      verified: true,
    },
    image: 'https://source.unsplash.com/400x300/?psychology,research',
    isJoined: false,
  },
  {
    id: '5',
    name: 'Creative Arts Collective',
    description: 'Community for artists, designers, and creative minds to collaborate on projects and showcase their work.',
    category: 'Arts',
    privacy: 'Public',
    activity: 'Very Active',
    rating: 4.5,
    members: 35,
    maxMembers: 45,
    schedule: 'Thursdays 6:30 PM',
    location: 'Art Studio',
    tags: ['Art', 'Design', 'Creative', 'Showcase'],
    admin: {
      name: 'Zara Ali',
      avatar: 'https://i.pravatar.cc/150?u=zara',
      verified: true,
    },
    image: 'https://source.unsplash.com/400x300/?art,creative',
    isJoined: false,
  },
  {
    id: '6',
    name: 'Medical Students Alliance',
    description: 'Support network for medical students with study groups, clinical experience sharing, and peer mentoring.',
    category: 'Medicine',
    privacy: 'Private',
    activity: 'Very Active',
    rating: 4.8,
    members: 52,
    maxMembers: 70,
    schedule: 'Sundays 3:00 PM',
    location: 'Medical Campus',
    tags: ['Medicine', 'Study', 'Clinical', 'Mentoring'],
    admin: {
      name: 'Dr. Fatima Al-Zahra',
      avatar: 'https://i.pravatar.cc/150?u=fatima',
      verified: true,
    },
    image: 'https://source.unsplash.com/400x300/?medical,students',
    isJoined: false,
  },
];

const FILTER_TABS = ['All', 'Computer Science', 'Engineering', 'Business', 'Psychology', 'Arts', 'Medicine'];

export default function JoinGroupsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [groups, setGroups] = useState<StudyGroup[]>(STUDY_GROUPS);
  const [filteredGroups, setFilteredGroups] = useState<StudyGroup[]>(STUDY_GROUPS);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);
  const [joinMessage, setJoinMessage] = useState('');

  // Handle search functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    applyFilters(query, activeFilter);
  };

  // Handle filter functionality
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    applyFilters(searchQuery, filter);
  };

  // Apply both search and filter
  const applyFilters = (search: string, filter: string) => {
    let filtered = groups;

    // Apply search filter
    if (search.trim()) {
      filtered = filtered.filter(group => 
        group.name.toLowerCase().includes(search.toLowerCase()) ||
        group.description.toLowerCase().includes(search.toLowerCase()) ||
        group.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Apply category filter
    if (filter !== 'All') {
      filtered = filtered.filter(group => group.category === filter);
    }

    setFilteredGroups(filtered);
  };

  // Initialize filtered groups
  useEffect(() => {
    applyFilters(searchQuery, activeFilter);
  }, [groups]);

  const joinedGroupsCount = groups.filter(group => group.isJoined).length;

  const handleJoinGroup = useCallback((group: StudyGroup) => {
    if (group.isJoined) {
      Alert.alert('Already Joined', 'You are already a member of this group.');
      return;
    }
    
    setSelectedGroup(group);
    setJoinMessage(`Hi ${group.admin.name}, I would like to join the ${group.name} group. I'm interested in ${group.category.toLowerCase()} and believe I can contribute positively to the group.`);
    setShowJoinModal(true);
  }, []);

  const sendJoinRequest = useCallback(() => {
    if (!selectedGroup) return;
    
    // Simulate sending join request to admin
    Alert.alert(
      'Join Request Sent',
      `Your request to join "${selectedGroup.name}" has been sent to ${selectedGroup.admin.name}. You'll be notified when they respond.`,
      [{ text: 'OK', onPress: () => {
        setShowJoinModal(false);
        setSelectedGroup(null);
        setJoinMessage('');
      }}]
    );
  }, [selectedGroup]);

  const getActivityColor = (activity: string) => {
    switch (activity) {
      case 'Very Active': return '#22C55E';
      case 'Active': return '#3B82F6';
      case 'Moderate': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const renderGroupCard = ({ item }: { item: StudyGroup }) => (
    <View style={styles.groupCard}>
      <Image source={{ uri: item.image }} style={styles.groupImage} />
      
      <View style={styles.groupBadges}>
        <View style={[styles.categoryBadge, { backgroundColor: item.privacy === 'Private' ? '#FEF3C7' : '#DBEAFE' }]}>
          <Text style={[styles.categoryText, { color: item.privacy === 'Private' ? '#D97706' : '#2563EB' }]}>
            {item.category}
          </Text>
        </View>
        <View style={styles.privacyBadge}>
          <Text style={styles.privacyText}>{item.privacy}</Text>
        </View>
        <View style={[styles.activityBadge, { backgroundColor: getActivityColor(item.activity) }]}>
          <Text style={styles.activityText}>{item.activity}</Text>
        </View>
      </View>

      <View style={styles.groupContent}>
        <View style={styles.groupHeader}>
          <Text style={styles.groupName}>{item.name}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#F59E0B" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>

        <Text style={styles.groupDescription}>{item.description}</Text>

        <View style={styles.groupInfo}>
          <View style={styles.infoRow}>
            <Ionicons name="people-outline" size={16} color="#6B7280" />
            <Text style={styles.infoText}>{item.members}/{item.maxMembers} members</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={16} color="#6B7280" />
            <Text style={styles.infoText}>{item.schedule}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color="#6B7280" />
            <Text style={styles.infoText}>{item.location}</Text>
          </View>
        </View>

        <View style={styles.groupTags}>
          {item.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        <View style={styles.groupFooter}>
          <View style={styles.adminInfo}>
            <Image source={{ uri: item.admin.avatar }} style={styles.adminAvatar} />
            <View>
              <View style={styles.adminNameRow}>
                <Text style={styles.adminName}>{item.admin.name}</Text>
                {item.admin.verified && (
                  <Ionicons name="checkmark-circle" size={16} color="#3B82F6" />
                )}
              </View>
              <Text style={styles.adminRole}>Admin</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.joinButton, item.isJoined && styles.joinedButton]}
            onPress={() => handleJoinGroup(item)}
          >
            <Ionicons 
              name={item.isJoined ? "checkmark" : "person-add"} 
              size={18} 
              color="#FFFFFF" 
            />
            <Text style={styles.joinButtonText}>
              {item.isJoined ? 'Joined' : 'Join Group'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fef2f2" translucent={true} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Join Study Groups</Text>
        
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="close" size={24} color="#7f1d1d" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#7f1d1d" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search groups..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor="#7f1d1d"
            returnKeyType="search"
          />
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {FILTER_TABS.map((filter, index) => (
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

      {/* Groups List */}
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>Found {filteredGroups.length} groups</Text>
          <Text style={styles.statsText}>You've joined {joinedGroupsCount} group{joinedGroupsCount !== 1 ? 's' : ''}</Text>
        </View>

        <View style={styles.groupsList}>
          {filteredGroups.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyStateTitle}>No groups found</Text>
              <Text style={styles.emptyStateText}>
                {searchQuery ? `No results for "${searchQuery}"` : `No ${activeFilter.toLowerCase()} groups`}
              </Text>
            </View>
          ) : (
            filteredGroups.map((item) => (
              <View key={item.id}>
                {renderGroupCard({ item })}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Create Group Button */}
      <View style={styles.createGroupContainer}>
        <TouchableOpacity 
          style={styles.createGroupButton}
          onPress={() => router.push('/CreateGroupsScreen')}
        >
          <View style={styles.createGroupIconContainer}>
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Join Group Modal */}
      <Modal
        visible={showJoinModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowJoinModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowJoinModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Join Group</Text>
            <TouchableOpacity onPress={sendJoinRequest}>
              <Text style={styles.modalSend}>Send</Text>
            </TouchableOpacity>
          </View>

          {selectedGroup && (
            <View style={styles.modalContent}>
              <View style={styles.modalGroupInfo}>
                <Image source={{ uri: selectedGroup.image }} style={styles.modalGroupImage} />
                <View>
                  <Text style={styles.modalGroupName}>{selectedGroup.name}</Text>
                  <Text style={styles.modalAdminName}>Admin: {selectedGroup.admin.name}</Text>
                </View>
              </View>

              <Text style={styles.messageLabel}>Message to Admin:</Text>
              <TextInput
                style={styles.messageInput}
                multiline
                numberOfLines={6}
                value={joinMessage}
                onChangeText={setJoinMessage}
                placeholder="Write a message to the group admin..."
                placeholderTextColor="#9CA3AF"
                textAlignVertical="top"
              />
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#fef2f2',
  },
  backButton: {
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#7f1d1d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#7f1d1d',
    letterSpacing: -0.5,
  },
  headerRight: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#fef2f2',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 44,
    shadowColor: '#7f1d1d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#7f1d1d',
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  filterScroll: {
    paddingHorizontal: 20,
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
    borderColor: '#E5E7EB',
  },
  firstTab: {
    marginLeft: 0,
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
    marginRight: 8,
  },
  activeFilterDot: {
    backgroundColor: '#FFFFFF',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  statsText: {
    fontSize: 14,
    color: '#6B7280',
  },
  groupsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
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
  groupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: '#7f1d1d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(153, 27, 27, 0.05)',
  },
  groupImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  groupBadges: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  privacyBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  privacyText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  activityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activityText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  groupContent: {
    padding: 20,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  groupName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
    marginRight: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
    fontWeight: '600',
  },
  groupDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  groupInfo: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  groupTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#fef2f2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#7f1d1d',
    fontWeight: '500',
  },
  groupFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  adminInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  adminAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  adminNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginRight: 4,
  },
  adminRole: {
    fontSize: 12,
    color: '#6B7280',
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7f1d1d',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  joinedButton: {
    backgroundColor: '#22C55E',
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalCancel: {
    fontSize: 16,
    color: '#6B7280',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalSend: {
    fontSize: 16,
    color: '#7f1d1d',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalGroupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  modalGroupImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  modalGroupName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  modalAdminName: {
    fontSize: 14,
    color: '#6B7280',
  },
  messageLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    minHeight: 120,
  },
  createGroupContainer: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    zIndex: 1000,
  },
  createGroupButton: {
    backgroundColor: '#7f1d1d',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7f1d1d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  createGroupIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});