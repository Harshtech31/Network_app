import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput,
  Animated,
  Image,
  Modal,
  Alert,
  BackHandler,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import PostDetailModal from '../../components/PostDetailModal';
import RecentlySearchedCard from '../../components/RecentlySearchedCard';
import apiService from '../../utils/apiService';
import { useAuth } from '../../contexts/AuthContext';

const { width } = Dimensions.get('window');

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Set animations to final state immediately
    fadeAnim.setValue(1);
    slideAnim.setValue(0);
  }, []);

  const [showFilter, setShowFilter] = useState(false);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [showAllPeople, setShowAllPeople] = useState(false);
  const [showAllPosts, setShowAllPosts] = useState(false);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [showAllClubs, setShowAllClubs] = useState(false);
  const [postInteractions, setPostInteractions] = useState<{[key: string]: {liked: boolean, likes: number, comments: number}}>({});
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  // Filtered data states
  const [filteredPeople, setFilteredPeople] = useState<any[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<any[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<any[]>([]);
  const [filteredClubs, setFilteredClubs] = useState<any[]>([]);
  
  // Data will be loaded from API
  const MOCK_PEOPLE: any[] = [];
  const MOCK_POSTS: any[] = [];
  const MOCK_PROJECTS: any[] = [];
  const MOCK_CLUBS: any[] = [];
  
  // Initialize filtered data on component mount
  useEffect(() => {
    setFilteredPeople(MOCK_PEOPLE);
    setFilteredPosts(MOCK_POSTS);
    setFilteredProjects(MOCK_PROJECTS);
    setFilteredClubs(MOCK_CLUBS);
  }, []);

  // Handle back button to return to previous state instead of home
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        // If any section is expanded, collapse it and return to main search
        if (showAllPeople || showAllPosts || showAllProjects || showAllClubs) {
          setActiveCategory('All');
          setShowAllPeople(false);
          setShowAllPosts(false);
          setShowAllProjects(false);
          setShowAllClubs(false);
          return true; // Prevent default back action
        }
        return false; // Allow default back action
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [showAllPeople, showAllPosts, showAllProjects, showAllClubs])
  );

  const handleSearch = useCallback(async () => {
    if (query.trim()) {
      setIsSearching(true);
      
      try {
        console.log('🔍 Searching for:', query);
        
        // Search users
        const usersResponse = await apiService.get<any>(`/users/search?q=${encodeURIComponent(query)}`);
        let searchedPeople = [];
        
        if (usersResponse.success && usersResponse.data) {
          const usersData = usersResponse.data.users || [];
          searchedPeople = usersData.map((user: any) => ({
            id: user.id,
            name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.name || 'Unknown User',
            handle: user.username || 'unknown',
            avatar: user.profileImage || `https://i.pravatar.cc/150?u=${user.id}`,
            bio: user.bio || 'No bio available',
            verified: user.isVerified || false,
            followers: user.followersCount || 0,
            following: user.followingCount || 0,
            university: user.university || 'University not specified',
            major: user.academic?.major || user.major || 'Major not specified',
            year: user.academic?.year || user.year || 'Year not specified',
            skills: user.skills || [],
          }));
        }
        
        // Search posts (using existing posts endpoint with search)
        const postsResponse = await apiService.get<any>(`/posts?search=${encodeURIComponent(query)}`);
        let searchedPosts = [];
        
        if (postsResponse.success && postsResponse.data) {
          const postsData = postsResponse.data.posts || postsResponse.data.data?.posts || [];
          searchedPosts = postsData.map((post: any) => ({
            id: post.id,
            user: {
              name: post.user ? `${post.user.firstName} ${post.user.lastName}` : 'Unknown User',
              handle: post.user?.username || 'unknown',
              avatar: post.user?.profileImage || `https://i.pravatar.cc/150?u=${post.userId}`,
              verified: post.user?.isVerified || false,
            },
            content: post.content,
            media: post.imageUrl || null,
            likes: post.likesCount || 0,
            comments: post.commentsCount || 0,
            shares: 0,
            timestamp: new Date(post.createdAt).toLocaleDateString(),
            type: 'post'
          }));
        }
        
        // Update filtered data
        setFilteredPeople(searchedPeople);
        setFilteredPosts(searchedPosts);
        
        // For now, projects and clubs will be empty until those endpoints are integrated
        setFilteredProjects([]);
        setFilteredClubs([]);
        
        console.log('✅ Search completed:', {
          people: searchedPeople.length,
          posts: searchedPosts.length
        });
        
      } catch (error) {
        console.error('❌ Search error:', error);
        Alert.alert('Search Error', 'Failed to search. Please try again.');
        
        // Clear results on error
        setFilteredPeople([]);
        setFilteredPosts([]);
        setFilteredProjects([]);
        setFilteredClubs([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      // Clear results when query is empty
      setFilteredPosts(MOCK_POSTS);
      setFilteredProjects(MOCK_PROJECTS);
      setFilteredClubs(MOCK_CLUBS);
    }
  }, [query]);

  const handleFilterPress = () => {
    setShowFilter(!showFilter);
    if (!showFilter) {
      setFilteredPeople(MOCK_PEOPLE);
      setFilteredPosts(MOCK_POSTS);
      setFilteredProjects(MOCK_PROJECTS);
      setFilteredClubs(MOCK_CLUBS);
    }
  };

  const handleSeeAllPeople = () => {
    if (showAllPeople) {
      // See Less - return to main search page
      setActiveCategory('All');
      setShowAllPeople(false);
    } else {
      // See All - show only people
      setActiveCategory('People');
      setShowAllPeople(true);
    }
  };

  const handleSeeAllPosts = () => {
    if (showAllPosts) {
      // See Less - return to main search page
      setActiveCategory('All');
      setShowAllPosts(false);
    } else {
      // See All - show only posts
      setActiveCategory('Posts');
      setShowAllPosts(true);
    }
  };

  const handleSeeAllProjects = () => {
    if (showAllProjects) {
      // See Less - return to main search page
      setActiveCategory('All');
      setShowAllProjects(false);
    } else {
      // See All - show only projects
      setActiveCategory('Projects');
      setShowAllProjects(true);
    }
  };

  const handleSeeAllClubs = () => {
    if (showAllClubs) {
      // See Less - return to main search page
      setActiveCategory('All');
      setShowAllClubs(false);
    } else {
      // See All - show only clubs
      setActiveCategory('Clubs');
      setShowAllClubs(true);
    }
  };

  const handlePersonPress = (person: any) => {
    router.push(`/UserProfileScreen?userId=${person.id}&name=${encodeURIComponent(person.name)}&field=${encodeURIComponent(person.field)}`);
  };

  const handlePostPress = (post: any) => {
    // Navigate to post detail modal (similar to profile posts)
    setSelectedPost(post);
    setShowPostModal(true);
  };

  const handleJoinProject = (projectId: string, projectTitle: string) => {
    Alert.alert(
      'Join Project Request',
      `Your request to join "${projectTitle}" has been sent to the project lead. You will receive a notification once approved.`,
      [{ text: 'OK' }]
    );
  };

  const handleProjectPress = (project: any) => {
    router.push(`/ProjectDetailScreen?id=${project.id}&title=${encodeURIComponent(project.title)}&status=${project.status}`);
  };

  const handleClubPress = (club: any) => {
    router.push(`/ClubDetailScreen?id=${club.id}&name=${encodeURIComponent(club.name)}&category=${encodeURIComponent(club.category)}`);
  };

  // Post interaction handlers
  const handleLikePost = (postId: string, currentLikes: number) => {
    setPostInteractions(prev => {
      const current = prev[postId] || { liked: false, likes: currentLikes, comments: 0 };
      return {
        ...prev,
        [postId]: {
          ...current,
          liked: !current.liked,
          likes: current.liked ? current.likes - 1 : current.likes + 1
        }
      };
    });
  };

  const handleCommentPost = (postId: string) => {
    // TODO: Open comment modal or navigate to post detail
    console.log('Comment on post:', postId);
  };

  const handleSharePost = (postId: string) => {
    // TODO: Open share modal
    console.log('Share post:', postId);
  };

  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate'];
  const departments = ['Computer Science', 'AI/ML', 'Electrical', 'Mechanical', 'Civil', 'Chemical', 'Biotechnology', 'Electronics'];
  const categories = ['All', 'People', 'Posts', 'Projects', 'Clubs'];
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#FFFFFF" 
        translucent={false} 
      />
      
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        
        {/* Header with Search Bar - Now inside ScrollView for Instagram-style scrolling */}
        <Animated.View style={[styles.scrollingHeader, { opacity: fadeAnim }]}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#7f1d1d" />
            <TextInput
              placeholder="Search events, people, projects..."
              placeholderTextColor="#7f1d1d"
              style={styles.searchInput}
              value={query}
              onChangeText={(text) => {
                setQuery(text);
                // Trigger search on text change for real-time filtering
                if (text.trim()) {
                  handleSearch();
                } else {
                  // Reset to original data if query is empty
                  setFilteredPeople(MOCK_PEOPLE);
                  setFilteredPosts(MOCK_POSTS);
                  setFilteredProjects(MOCK_PROJECTS);
                  setFilteredClubs(MOCK_CLUBS);
                  setIsSearching(false);
                }
              }}
              onSubmitEditing={handleSearch}
            />
            {isSearching ? (
              <ActivityIndicator size="small" color="#7f1d1d" style={styles.searchLoader} />
            ) : (
              <TouchableOpacity onPress={handleFilterPress} style={styles.filterButton}>
                <Ionicons name="funnel-outline" size={20} color="#7f1d1d" />
              </TouchableOpacity>
            )}
          </View>

          {/* Modern Filter Panel */}
          {showFilter && (
            <Animated.View style={styles.filterPanel}>
              <View style={styles.filterHeader}>
                <Text style={styles.filterHeaderTitle}>Filter & Discover</Text>
                <TouchableOpacity onPress={() => setShowFilter(false)} style={styles.closeFilterButton}>
                  <Ionicons name="close" size={20} color="#8B1A1A" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.filterSection}>
                <Text style={styles.filterTitle}>Category</Text>
                <View style={styles.filterGrid}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[styles.modernFilterChip, activeCategory === category && styles.modernFilterChipActive]}
                      onPress={() => setActiveCategory(category)}
                    >
                      <Text style={[styles.modernFilterChipText, activeCategory === category && styles.modernFilterChipTextActive]}>
                        {category}
                      </Text>
                      {activeCategory === category && (
                        <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" style={styles.chipIcon} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterTitle}>Academic Year</Text>
                <View style={styles.filterGrid}>
                  {years.map((year) => (
                    <TouchableOpacity
                      key={year}
                      style={[styles.modernFilterChip, selectedYears.includes(year) && styles.modernFilterChipActive]}
                      onPress={() => {
                        if (selectedYears.includes(year)) {
                          setSelectedYears(selectedYears.filter(y => y !== year));
                        } else {
                          setSelectedYears([...selectedYears, year]);
                        }
                      }}
                    >
                      <Text style={[styles.modernFilterChipText, selectedYears.includes(year) && styles.modernFilterChipTextActive]}>
                        {year}
                      </Text>
                      {selectedYears.includes(year) && (
                        <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" style={styles.chipIcon} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <View style={styles.filterSection}>
                <Text style={styles.filterTitle}>Department</Text>
                <View style={styles.filterGrid}>
                  {departments.map((dept) => (
                    <TouchableOpacity
                      key={dept}
                      style={[styles.modernFilterChip, selectedDepartments.includes(dept) && styles.modernFilterChipActive]}
                      onPress={() => {
                        if (selectedDepartments.includes(dept)) {
                          setSelectedDepartments(selectedDepartments.filter(d => d !== dept));
                        } else {
                          setSelectedDepartments([...selectedDepartments, dept]);
                        }
                      }}
                    >
                      <Text style={[styles.modernFilterChipText, selectedDepartments.includes(dept) && styles.modernFilterChipTextActive]}>
                        {dept}
                      </Text>
                      {selectedDepartments.includes(dept) && (
                        <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" style={styles.chipIcon} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <View style={styles.modernFilterActions}>
                <TouchableOpacity style={styles.modernClearButton} onPress={() => { setSelectedYears([]); setSelectedDepartments([]); setActiveCategory('All'); }}>
                  <Ionicons name="refresh-outline" size={18} color="#6B7280" />
                  <Text style={styles.modernClearButtonText}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modernApplyButton} onPress={() => setShowFilter(false)}>
                  <LinearGradient
                    colors={['#7f1d1d', '#DC2626']}
                    style={styles.applyButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="search" size={18} color="#FFFFFF" />
                    <Text style={styles.modernApplyButtonText}>Find Matches</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
        </Animated.View>

        {/* LinkedIn-style Content Sections */}
        {(activeCategory === 'All' || activeCategory === 'People') && (
          <Animated.View style={[styles.sectionContainer, { opacity: fadeAnim }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>People</Text>
              <TouchableOpacity onPress={handleSeeAllPeople}>
                <Text style={styles.seeAllText}>{showAllPeople ? 'See less' : 'See all people'}</Text>
              </TouchableOpacity>
            </View>
            
            {filteredPeople.slice(0, activeCategory === 'People' || showAllPeople ? 10 : 2).map((person, index) => (
              <TouchableOpacity key={person.id} onPress={() => handlePersonPress(person)} activeOpacity={0.7}>
                <Animated.View style={[styles.personCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                  <Image source={{ uri: person.avatar }} style={styles.personAvatar} />
                  <View style={styles.personInfo}>
                    <Text style={styles.personName}>{person.name}</Text>
                    <Text style={styles.personField}>{person.department} • {person.year}</Text>
                    <Text style={styles.personLocation}>{person.field}</Text>
                    <Text style={styles.mutualConnections}>Connect to collaborate</Text>
                  </View>
                  <TouchableOpacity style={styles.connectButton} onPress={(e) => { e.stopPropagation(); }}>
                    <Ionicons name="person-add-outline" size={20} color="#8B1A1A" />
                  </TouchableOpacity>
                </Animated.View>
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}

        {(activeCategory === 'All' || activeCategory === 'Posts') && (
          <Animated.View style={[styles.sectionContainer, { opacity: fadeAnim }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>Posts</Text>
              <TouchableOpacity onPress={handleSeeAllPosts}>
                <Text style={styles.seeAllText}>{showAllPosts ? 'See less' : 'See all posts'}</Text>
              </TouchableOpacity>
            </View>
            
            {filteredPosts.slice(0, activeCategory === 'Posts' || showAllPosts ? 10 : 1).map((post, index) => (
              <TouchableOpacity key={post.id} onPress={() => handlePostPress(post)} activeOpacity={0.95}>
                <Animated.View style={[styles.postCard, { opacity: fadeAnim }]}>
                  <View style={styles.postHeader}>
                    <View style={styles.postAuthorInfo}>
                      <View style={styles.authorAvatar}>
                        <Text style={styles.authorInitial}>{post.author[0]}</Text>
                      </View>
                      <View>
                        <Text style={styles.postAuthor}>{post.author}</Text>
                        <Text style={styles.postTime}>{post.timestamp}</Text>
                      </View>
                    </View>
                    <TouchableOpacity onPress={(e) => { e.stopPropagation(); }}>
                      <Ionicons name="ellipsis-horizontal" size={20} color="#6B7280" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.postContent}>{post.content}</Text>
                  {post.image && <Image source={{ uri: post.image }} style={styles.postImage} />}
                  <View style={styles.postActions}>
                    <TouchableOpacity 
                      style={styles.postAction} 
                      onPress={(e) => { 
                        e.stopPropagation(); 
                        handleLikePost(post.id, post.likes);
                      }}
                    >
                      <Ionicons 
                        name={postInteractions[post.id]?.liked ? "heart" : "heart-outline"} 
                        size={20} 
                        color={postInteractions[post.id]?.liked ? "#DC2626" : "#6B7280"} 
                      />
                      <Text style={[styles.postActionText, postInteractions[post.id]?.liked && { color: "#DC2626" }]}>
                        {postInteractions[post.id]?.likes ?? post.likes}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.postAction} 
                      onPress={(e) => { 
                        e.stopPropagation(); 
                        handleCommentPost(post.id);
                      }}
                    >
                      <Ionicons name="chatbubble-outline" size={20} color="#6B7280" />
                      <Text style={styles.postActionText}>{post.comments}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.postAction} 
                      onPress={(e) => { 
                        e.stopPropagation(); 
                        handleSharePost(post.id);
                      }}
                    >
                      <Ionicons name="share-outline" size={20} color="#6B7280" />
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}

        {(activeCategory === 'All' || activeCategory === 'Projects') && (
          <Animated.View style={[styles.sectionContainer, { opacity: fadeAnim }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>Projects</Text>
              <TouchableOpacity onPress={handleSeeAllProjects}>
                <Text style={styles.seeAllText}>{showAllProjects ? 'See less' : 'See all projects'}</Text>
              </TouchableOpacity>
            </View>
            
            {filteredProjects.slice(0, activeCategory === 'Projects' || showAllProjects ? 10 : 1).map((project, index) => (
              <TouchableOpacity key={project.id} onPress={() => handleProjectPress(project)} activeOpacity={0.7}>
                <Animated.View style={[styles.projectCard, { opacity: fadeAnim }]}>
                  <View style={styles.projectHeader}>
                    <Text style={styles.projectTitle}>{project.title}</Text>
                    <View style={[styles.projectStatus, project.status === 'Active' ? styles.statusActive : styles.statusRecruiting]}>
                      <Text style={[styles.statusText, project.status === 'Active' ? styles.statusActiveText : styles.statusRecruitingText]}>
                        {project.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.projectDescription}>{project.description}</Text>
                  <View style={styles.projectTech}>
                    <View style={styles.techChip}>
                      <Text style={styles.techText}>{project.status}</Text>
                    </View>
                  </View>
                  <View style={styles.projectFooter}>
                    <Text style={styles.teamSize}>{project.members} team members</Text>
                    <TouchableOpacity style={styles.joinButton} onPress={(e) => { e.stopPropagation(); handleJoinProject(project.id, project.title); }}>
                      <Text style={styles.joinButtonText}>Join Project</Text>
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}

        {(activeCategory === 'All' || activeCategory === 'Clubs') && (
          <Animated.View style={[styles.sectionContainer, { opacity: fadeAnim }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>Clubs</Text>
              <TouchableOpacity onPress={handleSeeAllClubs}>
                <Text style={styles.seeAllText}>{showAllClubs ? 'See less' : 'See all clubs'}</Text>
              </TouchableOpacity>
            </View>
            
            {filteredClubs.slice(0, activeCategory === 'Clubs' || showAllClubs ? 10 : 1).map((club, index) => (
              <TouchableOpacity key={club.id} onPress={() => handleClubPress(club)} activeOpacity={0.7}>
                <Animated.View style={[styles.clubCard, { opacity: fadeAnim }]}>
                  <View style={styles.clubImagePlaceholder}>
                    <Ionicons name="people" size={24} color="#8B1A1A" />
                  </View>
                  <View style={styles.clubInfo}>
                    <Text style={styles.clubName}>{club.name}</Text>
                    <Text style={styles.clubCategory}>{club.category}</Text>
                    <Text style={styles.clubDescription}>{club.description}</Text>
                    <Text style={styles.clubMembers}>{club.members} members</Text>
                  </View>
                  <TouchableOpacity style={styles.interestedButton} onPress={(e) => { e.stopPropagation(); }}>
                    <Ionicons name="flame" size={16} color="#FF6B35" />
                    <Text style={styles.interestedButtonText}>Interested</Text>
                  </TouchableOpacity>
                </Animated.View>
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <PostDetailModal
        visible={showPostModal}
        post={selectedPost}
        onClose={() => setShowPostModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF2E8',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#FFF2E8',
  },
  scrollingHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#FFF2E8',
  },
  searchContainer: {
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
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#7f1d1d',
    marginLeft: 12,
  },
  filterButton: {
    padding: 5,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  filterPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(127, 29, 29, 0.1)',
    shadowColor: '#7f1d1d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeFilterButton: {
    padding: 5,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  filterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modernFilterChip: {
    backgroundColor: '#FEF2F2',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FECACA',
    flexDirection: 'row',
    alignItems: 'center',
  },
  modernFilterChipActive: {
    backgroundColor: '#7f1d1d',
    borderColor: '#7f1d1d',
  },
  modernFilterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7f1d1d',
  },
  modernFilterChipTextActive: {
    color: '#FFFFFF',
  },
  chipIcon: {
    marginLeft: 8,
  },
  modernFilterActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  modernClearButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingVertical: 12,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  modernClearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  modernApplyButton: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  applyButtonGradient: {
    flex: 1,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  modernApplyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f1d1d',
  },
  personCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(127, 29, 29, 0.1)',
    shadowColor: '#7f1d1d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  personAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  personField: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  personLocation: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  connectButton: {
    backgroundColor: '#FEF2F2',
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  searchLoader: {
    padding: 8,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(127, 29, 29, 0.1)',
    shadowColor: '#7f1d1d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  postAuthorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  authorInitial: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7f1d1d',
  },
  postAuthor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  postTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  postContent: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: 12,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  postActionText: {
    fontSize: 14,
    color: '#6B7280',
  },
  projectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(127, 29, 29, 0.1)',
    shadowColor: '#7f1d1d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  projectStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#D1FAE5',
  },
  statusActiveText: {
    color: '#065F46',
    fontWeight: '600',
  },
  statusRecruiting: {
    backgroundColor: '#DBEAFE',
  },
  statusRecruitingText: {
    color: '#1E40AF',
    fontWeight: '600',
  },
  statusText: {
    fontSize: 12,
  },
  projectDescription: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 12,
  },
  projectTech: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  techChip: {
    backgroundColor: '#FEF2F2',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  techText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#7f1d1d',
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  teamSize: {
    fontSize: 14,
    color: '#6B7280',
  },
  joinButton: {
    backgroundColor: '#7f1d1d',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  clubCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(127, 29, 29, 0.1)',
    shadowColor: '#7f1d1d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  clubImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  clubInfo: {
    flex: 1,
  },
  clubName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  clubCategory: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  clubDescription: {
    fontSize: 14,
    color: '#374151',
    marginTop: 8,
  },
  clubMembers: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  interestedButton: {
    backgroundColor: '#FEF2F2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FECACA',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mutualConnections: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  interestedButtonText: {
    color: '#7f1d1d',
    fontWeight: '600',
  },
});