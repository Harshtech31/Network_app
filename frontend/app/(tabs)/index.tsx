import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  Modal,
  TextInput,
  FlatList,
  Alert,
  Easing,
  ActivityIndicator,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { ErrorBoundary } from '../../components/ErrorBoundary';
import { ShareService } from '../../utils/ShareService';
import LinkService from '../../utils/linkService';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../utils/apiService';

// Mock Data & Types
type FeedItem = {
  id: string;
  type: 'event' | 'project' | 'post' | 'story' | 'club';
  title?: string;
  user?: { name: string; handle: string; avatar: string; verified?: boolean; role?: string };
  timestamp?: string;
  content?: string;
  media?: string | null;
  likes?: number;
  comments?: number;
  shares?: number;
  location?: string;
  date?: string;
  time?: string;
  tags?: string[];
  members?: number;
  posts?: number;
  priority?: 'high' | 'medium' | 'low';
  category?: string;
};

type QuickAction = {
  id: string;
  title: string;
  icon: string;
  color: string;
  route: string;
};

type StoryItem = {
  id: string;
  user: { name: string; avatar: string };
  preview: string;
  isViewed: boolean;
};

const QUICK_ACTIONS: QuickAction[] = [
  { id: '1', title: 'Find Collaborators', icon: 'people', color: '#7f1d1d', route: '/CollaborationScreen' },
  { id: '2', title: 'Create Project', icon: 'add-circle', color: '#d4a5a8', route: '/CreateScreen' },
  { id: '3', title: 'Join Events', icon: 'calendar', color: '#7f1d1d', route: '/EventsScreen' },
  { id: '4', title: 'Messages', icon: 'chatbubble-ellipses', color: '#d4a5a8', route: '/messages' },
  // Group features disabled - can be enabled when backend supports groups
  // { id: '5', title: 'Create Group', icon: 'people-circle', color: '#d4a5a8', route: '/CreateGroupsScreen' },
];

// Stories will be loaded from API
const STORIES_DATA: StoryItem[] = [];

// Feed data will be loaded from API
const FEED_DATA: FeedItem[] = [];

const AnimatedCard = ({ children, style, index }: { children: React.ReactNode, style?: any, index?: number }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    const delay = (index || 0) * 100;
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View 
      style={[
        styles.card, 
        style,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
          ]
        }
      ]}
    >
      {children}
    </Animated.View>
  );
};

const AnimatedButton = ({ children, onPress, style }: { children: React.ReactNode, onPress: () => void, style?: any }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
    >
      <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [showMessagesScreen, setShowMessagesScreen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [messagesIsNavigating, setMessagesIsNavigating] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showSideMenu, setShowSideMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  
  
  
  const [postInteractions, setPostInteractions] = useState<{[key: string]: {likes: number, comments: number, shares: number, isLiked: boolean, saved: boolean}}>({});
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [comments, setComments] = useState<{[key: string]: any[]}>({});
  const [newComment, setNewComment] = useState('');
  const [feedData, setFeedData] = useState<FeedItem[]>([]);
  
  // In-app sharing states
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedSharePost, setSelectedSharePost] = useState<FeedItem | null>(null);
  
  // Group creation states
  const [groupNameStep, setGroupNameStep] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  
  const swipeX = useRef(new Animated.Value(0)).current;
  const transitionOpacity = useRef(new Animated.Value(1)).current;

  // Reset messages screen when home tab is focused
  useFocusEffect(
    useCallback(() => {
      setShowMessagesScreen(false);
      setShowSideMenu(false);
      // Reset all navigation states when home tab is focused
      setIsNavigating(false);
      setMessagesIsNavigating(false);
      setIsTransitioning(false);
    }, [])
  );
  const { width } = Dimensions.get('window');

  // Messages data will be loaded from API
  const MESSAGES_DATA: any[] = [];

  // Contacts data will be loaded from API
  const AVAILABLE_CONTACTS: any[] = [];

  // Messages data state
  const [messagesData, setMessagesData] = useState(MESSAGES_DATA);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      // Don't allow swipe if already navigating, in messages screen, or side menu is open
      if (isNavigating || showMessagesScreen || showSideMenu) return false;
      // Only respond to right-to-left swipes (negative dx)
      return gestureState.dx < 0 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 10;
    },
    onStartShouldSetPanResponderCapture: () => false,
    onMoveShouldSetPanResponderCapture: () => false,
    onPanResponderGrant: () => {
      if (isNavigating) return;
      setIsTransitioning(true);
      Animated.timing(transitionOpacity, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }).start();
      swipeX.setOffset((swipeX as any)._value);
      swipeX.setValue(0);
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dx < 0) {
        // Instagram-style progressive resistance curve
        const progress = Math.abs(gestureState.dx) / width;
        let resistance = 1;
        
        if (progress > 0.3) {
          // Gradual resistance increase after 30% of screen width
          resistance = 1 - (progress - 0.3) * 0.8;
          resistance = Math.max(resistance, 0.15); // Minimum 15% movement
        }
        
        swipeX.setValue(gestureState.dx * resistance);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      swipeX.flattenOffset();
      
      // Instagram-style threshold: 25% of screen width OR fast velocity
      const swipeThreshold = width * 0.25;
      const velocityThreshold = 0.8;
      const shouldNavigate = 
        (Math.abs(gestureState.dx) > swipeThreshold) || 
        (Math.abs(gestureState.vx) > velocityThreshold && gestureState.dx < -30);
      
      if (shouldNavigate && !isNavigating) {
        setIsNavigating(true);
        
        // Smooth completion animation to full messages screen
        Animated.parallel([
          Animated.timing(swipeX, {
            toValue: -width,
            duration: 180,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(transitionOpacity, {
            toValue: 1,
            duration: 180,
            useNativeDriver: true,
          })
        ]).start(() => {
          // Use setTimeout to ensure state updates happen after animation completes
          setTimeout(() => {
            setIsNavigating(false);
            setIsTransitioning(false);
          }, 50);
        });
      } else {
        // Smooth bounce back without haptic
        Animated.parallel([
          Animated.spring(swipeX, {
            toValue: 0,
            tension: 220,
            friction: 10,
            useNativeDriver: true,
          }),
          Animated.timing(transitionOpacity, {
            toValue: 1,
            duration: 80,
            useNativeDriver: true,
          })
        ]).start(() => {
          // Use setTimeout to ensure state updates happen after animation completes
          setTimeout(() => {
            setIsNavigating(false);
            setIsTransitioning(false);
          }, 50);
        });
      }
    },
    onPanResponderTerminate: () => {
      swipeX.flattenOffset();
      Animated.spring(swipeX, {
        toValue: 0,
        tension: 220,
        friction: 10,
        useNativeDriver: true,
      }).start(() => {
        // Use setTimeout to ensure state updates happen after animation completes
        setTimeout(() => {
          setIsNavigating(false);
        }, 50);
      });
    },
  });

  // Quick actions data
  const quickActions = [
    {
      id: 'erp',
      title: 'ERP Portal',
      icon: 'school',
      route: 'erp',
      description: 'Access BITS Pilani ERP system'
    },
    {
      id: 'leaderboard',
      title: 'Leaderboard',
      icon: 'trophy',
      route: '/LeaderboardScreen',
      description: 'See top contributors and rankings'
    },
    {
      id: 'collaborations',
      title: 'Find Collaborators',
      icon: 'people',
      route: '/CollaborationScreen',
      description: 'Connect with like-minded individuals'
    },
    // Group features disabled - can be enabled when backend supports groups
    // {
    //   id: 'groups',
    //   title: 'Join Groups',
    //   icon: 'chatbubbles',
    //   route: '/JoinGroupsScreen',
    //   description: 'Discover and join communities'
    // },
    {
      id: 'saved',
      title: 'Saved',
      icon: 'bookmark',
      route: '/SavedScreen',
      description: 'Your saved posts and content'
    }
  ];

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      console.log('🔄 Refreshing posts...');
      
      // Reload posts from API
      const response = await apiService.get<any>('/posts');
      
      if (response.success && response.data) {
        let postsData = [];
        
        if (response.data.posts) {
          postsData = response.data.posts;
        } else if (response.data.data && response.data.data.posts) {
          postsData = response.data.data.posts;
        } else if (Array.isArray(response.data)) {
          postsData = response.data;
        }
        
        const feedItems: FeedItem[] = postsData.map((post: any) => ({
          id: post.id,
          type: 'post' as const,
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
        }));
        
        setFeedData(feedItems);
      }
      
      console.log('✅ Posts refreshed');
    } catch (error) {
      console.error('❌ Error refreshing posts:', error);
      Alert.alert('Error', 'Failed to refresh feed. Please try again.');
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Load real posts from API
  useEffect(() => {
    loadPosts();
  }, []);

  // Reload posts when screen comes into focus (e.g., after creating a post)
  useFocusEffect(
    useCallback(() => {
      loadPosts();
      loadMessages();
    }, [])
  );

  const loadMessages = async () => {
    try {
      setIsLoadingMessages(true);
      console.log('💬 Loading messages from API...');
      
      // Call real API endpoint
      const response = await apiService.get<any>('/messages/conversations');
      
      if (response.success && response.data) {
        // Handle response structure
        let conversationsData = [];
        
        if (response.data.conversations) {
          conversationsData = response.data.conversations;
        } else if (Array.isArray(response.data)) {
          conversationsData = response.data;
        }
        
        console.log('✅ Messages loaded:', conversationsData.length);
        
        // Convert backend conversations to expected format
        const formattedMessages = conversationsData.map((conversation: any) => ({
          id: conversation.id,
          name: conversation.participant ? `${conversation.participant.firstName} ${conversation.participant.lastName}` : 'Unknown User',
          message: conversation.lastMessage?.content || 'No messages yet',
          time: conversation.lastMessage ? new Date(conversation.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
          avatar: conversation.participant?.profileImage || `https://i.pravatar.cc/150?u=${conversation.participant?.id}`,
          unread: conversation.unreadCount || 0,
          status: conversation.lastMessage?.senderId === user?.id ? 'sent' : 'received',
          isOnline: conversation.participant?.isOnline || false,
        }));
        
        setMessagesData(formattedMessages);
      } else {
        console.log('⚠️ No messages data received');
        setMessagesData([]);
      }
    } catch (error) {
      console.error('❌ Error loading messages:', error);
      // Don't show alert for messages as it's not critical
      setMessagesData([]);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      console.log('📝 Loading posts from API...');
      
      const response = await apiService.get<any>('/posts');
      
      if (response.success && response.data) {
        // Handle nested response structure similar to leaderboard
        let postsData = [];
        
        if (response.data.posts) {
          postsData = response.data.posts;
        } else if (response.data.data && response.data.data.posts) {
          postsData = response.data.data.posts;
        } else if (Array.isArray(response.data)) {
          postsData = response.data;
        }
        
        console.log('✅ Posts loaded:', postsData.length);
        
        // Convert backend posts to FeedItem format
        const feedItems: FeedItem[] = postsData.map((post: any) => ({
          id: post.id,
          type: 'post' as const,
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
        }));
        
        setFeedData(feedItems);
      } else {
        console.log('⚠️ No posts data received');
        setFeedData([]);
      }
    } catch (error) {
      console.error('❌ Error loading posts:', error);
      Alert.alert('Error', 'Failed to load posts. Please try again.');
      setFeedData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostInteraction = async (postId: string, action: 'like' | 'comment' | 'share' | 'save') => {
    // Since FEED_DATA is now empty, we'll handle interactions differently
    // In a real app, these would be API calls to the backend
    
    switch (action) {
      case 'like':
        try {
          console.log(`🤍 Liking post ${postId}...`);
          
          // Call real API
          const response = await apiService.post(`/posts/${postId}/like`);
          
          if (response.success) {
            console.log('✅ Post liked successfully');
            
            // Update local state with API response
            setPostInteractions(prev => {
              const current = prev[postId] || { isLiked: false, likes: 0, comments: 0, shares: 0, saved: false };
              return {
                ...prev,
                [postId]: {
                  ...current,
                  isLiked: !current.isLiked,
                  likes: current.isLiked ? current.likes - 1 : current.likes + 1
                }
              };
            });
            
            // Update feed data with new like count
            setFeedData(prev => prev.map(item => 
              item.id === postId 
                ? { ...item, likes: (item.likes || 0) + (postInteractions[postId]?.isLiked ? -1 : 1) }
                : item
            ));
            
            // Haptic feedback
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          } else {
            throw new Error('Failed to like post');
          }
        } catch (error) {
          console.error('❌ Error liking post:', error);
          Alert.alert('Error', 'Failed to like post. Please try again.');
        }
        break;
        
      case 'comment':
        console.log('Opening comments for post:', postId);
        setSelectedPostId(postId);
        setShowCommentsModal(true);
        loadComments(postId);
        break;
        
      case 'share':
        try {
          // Real API call - ready for backend integration
          // const postResponse = await apiService.get(`/posts/${postId}`);
          // if (postResponse.success && postResponse.data) {
          //   await ShareService.sharePost(postResponse.data);
          // }
          console.log(`Share post ${postId} - API ready for integration`);
          
          // Update local state
          setPostInteractions(prev => {
            const current = prev[postId] || { isLiked: false, likes: 0, comments: 0, shares: 0, saved: false };
            return {
              ...prev,
              [postId]: {
                ...current,
                shares: current.shares + 1
              }
            };
          });
        } catch (error) {
          console.error('Error sharing post:', error);
        }
        break;
        
      case 'save':
        try {
          console.log(`💾 Saving post ${postId}...`);
          
          // Check current saved state
          const current = postInteractions[postId] || { isLiked: false, likes: 0, comments: 0, shares: 0, saved: false };
          
          // Real API call
          if (current.saved) {
            // Unsave the post
            const response = await apiService.delete(`/posts/${postId}/save`);
            if (response.success) {
              console.log('✅ Post unsaved successfully');
            }
          } else {
            // Save the post
            const response = await apiService.post(`/posts/${postId}/save`);
            if (response.success) {
              console.log('✅ Post saved successfully');
            }
          }
          
          // Update local state
          setPostInteractions(prev => {
            const current = prev[postId] || { isLiked: false, likes: 0, comments: 0, shares: 0, saved: false };
            return {
              ...prev,
              [postId]: {
                ...current,
                saved: !current.saved
              }
            };
          });
        } catch (error) {
          console.error('Error saving post:', error);
        }
        break;
    }
  };

  // Create Group Modal Handlers
  const handleCreateGroup = () => {
    if (!groupNameStep) {
      // First step: Select members
      if (selectedMembers.length === 0) {
        Alert.alert('Select Members', 'Please select at least one member to create a group.');
        return;
      }
      setGroupNameStep(true);
    } else {
      // Second step: Create group with name
      if (!groupName.trim()) {
        Alert.alert('Group Name Required', 'Please enter a name for your group.');
        return;
      }
      
      // Create the group (mock implementation)
      Alert.alert(
        'Group Created!', 
        `"${groupName}" has been created with ${selectedMembers.length} members.`,
        [
          {
            text: 'OK',
            onPress: () => {
            }
          }
        ]
      );
    }
  };

  const toggleMemberSelection = (memberId: string) => {
    setSelectedMembers((prev: string[]) => 
      prev.includes(memberId) 
        ? prev.filter((id: string) => id !== memberId)
        : [...prev, memberId]
    );
  };



  const handleShare = (item: FeedItem) => {
    setSelectedSharePost(item);
    setShowShareModal(true);
  };

  const handleExternalShare = async (item: FeedItem) => {
    try {
      let shareSuccess = false;
      
      switch (item.type) {
        case 'post':
          shareSuccess = await ShareService.sharePost({
            id: item.id,
            content: item.content || item.title || 'Check out this post',
            user: item.user || { name: 'Anonymous' }
          });
          break;
          
        case 'event':
          shareSuccess = await ShareService.shareEvent({
            id: item.id,
            title: item.title || 'Event',
            content: item.content,
            location: item.location,
            date: item.date,
            time: item.time,
            organizer: item.user
          });
          break;
          
        case 'project':
          shareSuccess = await ShareService.shareProject({
            id: item.id,
            title: item.title || 'Project',
            content: item.content,
            user: item.user
          });
          break;
          
        case 'club':
          shareSuccess = await ShareService.shareClub({
            id: item.id,
            title: item.title || 'Club',
            content: item.content,
            location: item.location
          });
          break;
          
        default:
          shareSuccess = await ShareService.quickShareText(
            item.content || item.title || 'Check this out on NetworkX!',
            'Shared from NetworkX'
          );
      }
      
      if (shareSuccess) {
        console.log(`Successfully shared ${item.type}:`, item.id);
        // Update share count
        setPostInteractions(prev => ({
          ...prev,
          [item.id]: {
            ...prev[item.id],
            shares: (prev[item.id]?.shares || 0) + 1
          }
        }));
      }
    } catch (error) {
      console.error('Error sharing item:', error);
      Alert.alert('Share Error', 'Unable to share this content.');
    }
  };

  const loadComments = async (postId: string) => {
    try {
      console.log('💬 Loading comments for post:', postId);
      
      const response = await apiService.get<any>(`/posts/${postId}/comments`);
      
      if (response.success && response.data) {
        const commentsData = response.data.comments || [];
        
        // Convert backend comments to expected format
        const formattedComments = commentsData.map((comment: any) => ({
          id: comment.id,
          user: comment.user ? `${comment.user.firstName} ${comment.user.lastName}` : 'Unknown User',
          text: comment.content,
          time: new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          userId: comment.userId,
          avatar: comment.user?.profileImage || `https://i.pravatar.cc/150?u=${comment.userId}`,
        }));
        
        setComments(prev => ({
          ...prev,
          [postId]: formattedComments
        }));
        
        console.log('✅ Comments loaded:', formattedComments.length);
      } else {
        console.log('⚠️ No comments data received');
        setComments(prev => ({
          ...prev,
          [postId]: []
        }));
      }
    } catch (error) {
      console.error('❌ Error loading comments:', error);
      setComments(prev => ({
        ...prev,
        [postId]: []
      }));
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedPostId) return;
    
    const commentText = newComment.trim();
    setNewComment('');
    
    try {
      console.log('💬 Adding comment to post:', selectedPostId);
      
      const response = await apiService.post(`/posts/${selectedPostId}/comments`, {
        content: commentText
      });
      
      if (response.success && response.data) {
        const newCommentData = (response.data as any).comment || response.data;
        
        // Format the new comment
        const formattedComment = {
          id: newCommentData.id,
          user: newCommentData.user ? `${newCommentData.user.firstName} ${newCommentData.user.lastName}` : 'You',
          text: newCommentData.content,
          time: new Date(newCommentData.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          userId: newCommentData.userId,
          avatar: newCommentData.user?.profileImage || `https://i.pravatar.cc/150?u=${newCommentData.userId}`,
        };
        
        // Add to local state
        setComments(prev => ({
          ...prev,
          [selectedPostId]: [...(prev[selectedPostId] || []), formattedComment]
        }));
        
        // Update comment count in feed data
        setFeedData(prev => prev.map(item => 
          item.id === selectedPostId 
            ? { ...item, comments: (item.comments || 0) + 1 }
            : item
        ));
        
        console.log('✅ Comment added successfully');
      } else {
        throw new Error('Failed to add comment');
      }
    } catch (error) {
      console.error('❌ Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment. Please try again.');
      setNewComment(commentText); // Restore comment text
    }
  };

  const handleMenuItemPress = (route: string) => {
    setShowSideMenu(false);
    if (route === 'erp') {
      // Open ERP portal in browser
      LinkService.openERP();
    } else if (route === '/LeaderboardScreen') {
      router.push('/LeaderboardScreen');
    } else if (route === '/CollaborationScreen') {
      router.push('/CollaborationScreen');
    } else if (route === '/SavedScreen') {
      router.push('/SavedScreen');
    // Group features disabled - can be enabled when backend supports groups
    // } else if (route === '/JoinGroupsScreen') {
    //   router.push('/JoinGroupsScreen');
    } else {
      console.log(`Navigate to ${route}`);
    }
  };

  // Theme toggle handled by context

  const handleProfilePress = () => {
    router.push('/(tabs)/profile');
  };

  const handleQuickAction = (route: string) => {
    if (route === '/CollaborationScreen') {
      router.push('/CollaborationScreen');
    } else if (route === '/CreateScreen') {
      router.push('/CreateScreen');
    } else if (route === '/messages') {
      setShowMessagesScreen(true);
    } else {
      console.log(`Navigate to ${route}`);
    }
  };

  const handleStoryPress = (storyId: string) => {
    console.log('Story pressed:', storyId);
    // Navigate to story view
  };

  const handleEventPress = (eventId: string) => {
    const event = FEED_DATA.find(item => item.id === eventId && item.type === 'event');
    if (event) {
      router.push({
        pathname: '/EventDetailScreen',
        params: {
          id: eventId,
          title: event.title,
          date: event.date,
          location: event.location
        }
      });
    }
  };

  const handleProjectPress = (projectId: string) => {
    const project = FEED_DATA.find(item => item.id === projectId && item.type === 'project');
    if (project) {
      router.push({
        pathname: '/ProjectDetailScreen',
        params: {
          id: projectId,
          title: project.title,
          user: project.user?.name,
          content: project.content
        }
      });
    }
  };

  const handleClubPress = (clubId: string) => {
    const club = FEED_DATA.find(item => item.id === clubId && item.type === 'club');
    if (club) {
      router.push({
        pathname: '/ClubDetailScreen',
        params: {
          id: clubId,
          title: club.title,
          location: club.location,
          members: club.members?.toString(),
          content: club.content
        }
      });
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              // Use real logout from AuthContext
              await logout();
              
              // Reset app state
              setShowSideMenu(false);
              setActiveFilter('all');
              setPostInteractions({});
              
              console.log('User logged out successfully');
              
              // Navigate to login screen
              router.replace('/LoginScreen');
              
              // Show logout confirmation
              setTimeout(() => {
                Alert.alert('Logged Out', 'You have been successfully logged out');
              }, 500);
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const filteredData = useMemo(() => {
    if (activeFilter === 'All') return feedData;
    if (activeFilter === 'Posts') return feedData.filter(item => item.type === 'post');
    if (activeFilter === 'Projects') return feedData.filter(item => item.type === 'project');
    if (activeFilter === 'Clubs') return feedData.filter(item => item.type === 'club');
    return feedData.filter(item => item.type === activeFilter.toLowerCase().slice(0, -1));
  }, [activeFilter, feedData]);



  const renderItem = React.useCallback(({ item, index }: { item: FeedItem, index: number }) => {
    const interactions = postInteractions[item.id] || { liked: false, likes: item.likes || 0, comments: item.comments || 0, shares: item.shares || 0, saved: false };

    if (item.type === 'event') {
      const eventDate = new Date(item.date || '');
      const day = eventDate.getDate();
      const month = eventDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
      
      return (
        <View style={styles.cleanEventCard}>
          
          <View style={styles.eventMainContent}>
            <View style={styles.eventDateBox}>
              <Text style={styles.eventDay}>{day}</Text>
              <Text style={styles.eventMonth}>{month}</Text>
            </View>
            
            <View style={styles.eventInfo}>
              <Text style={styles.eventTitle}>{item.title}</Text>
              <View style={styles.eventDetails}>
                <View style={styles.eventDetailRow}>
                  <Ionicons name="location-outline" size={14} color="#7f1d1d" />
                  <Text style={styles.eventDetailText}>{item.location}</Text>
                </View>
                <View style={styles.eventDetailRow}>
                  <Ionicons name="time-outline" size={14} color="#d4a5a8" />
                  <Text style={styles.eventDetailText}>{item.time}</Text>
                </View>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.bookmarkIcon}
              onPress={() => handlePostInteraction(item.id, 'save')}
            >
              <Ionicons 
                name={interactions.saved ? "bookmark" : "bookmark-outline"} 
                size={20} 
                color={interactions.saved ? "#7f1d1d" : "#7f1d1d"} 
              />
            </TouchableOpacity>
          </View>
          
          {item.media && (
            <View style={styles.eventImageSection}>
              <Image source={{ uri: item.media }} style={styles.eventImage} resizeMode="cover" />
              <View style={styles.eventImageOverlay}>
                <TouchableOpacity 
                  style={styles.joinEventButton}
                  onPress={() => handleEventPress(item.id)}
                >
                  <Text style={styles.joinEventText}>Join Event</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          
          <View style={styles.eventTags}>
            {item.tags?.slice(0, 3).map((tag, tagIndex) => (
              <View key={tagIndex} style={styles.eventTag}>
                <Text style={styles.eventTagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      );
    }

    if (item.type === 'project') {
      return (
        <View style={styles.cleanProjectCard}>
          <View style={styles.projectMainContent}>
            <View style={styles.projectIconBox}>
              <Ionicons name="code-working" size={24} color="#7f1d1d" />
            </View>
            <View style={styles.projectInfo}>
              <Text style={styles.projectTitle}>{item.title}</Text>
              <View style={styles.projectDetails}>
                <View style={styles.projectDetailRow}>
                  <Ionicons name="person-outline" size={14} color="#7f1d1d" />
                  <Text style={styles.projectDetailText}>{item.user?.name}</Text>
                </View>
                <View style={styles.projectDetailRow}>
                  <Ionicons name="time-outline" size={14} color="#d4a5a8" />
                  <Text style={styles.projectDetailText}>No deadline</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.bookmarkIcon}
              onPress={() => handlePostInteraction(item.id, 'save')}
            >
              <Ionicons 
                name={interactions.saved ? "bookmark" : "bookmark-outline"} 
                size={20} 
                color={interactions.saved ? "#7f1d1d" : "#7f1d1d"} 
              />
            </TouchableOpacity>
          </View>
          <View style={styles.projectDescription}>
            <Text style={styles.projectDescriptionText}>{item.content}</Text>
          </View>
          <View style={styles.projectActions}>
            <TouchableOpacity 
              style={styles.projectActionButton}
              onPress={() => handleProjectPress(item.id)}
            >
              <Text style={styles.projectActionText}>View Project</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.projectStats}>
              <TouchableOpacity 
                style={styles.projectStatButton}
                onPress={() => handlePostInteraction(item.id, 'like')}
              >
                <Ionicons 
                  name={(interactions as any).isLiked || (interactions as any).liked ? "heart" : "heart-outline"} 
                  size={18} 
                  color={(interactions as any).isLiked || (interactions as any).liked ? "#d4a5a8" : "#6B7280"} 
                />
                <Text style={styles.projectStatText}>{interactions.likes}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.projectStatButton}
                onPress={() => handlePostInteraction(item.id, 'comment')}
              >
                <Ionicons name="chatbubble-outline" size={18} color="#6B7280" />
                <Text style={styles.projectStatText}>{interactions.comments}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.projectTags}>
            {item.tags?.slice(0, 3).map((tag, tagIndex) => (
              <View key={tagIndex} style={styles.projectTag}>
                <Text style={styles.projectTagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      );
    }

    if (item.type === 'club') {
      return (
        <View style={styles.cleanClubCard}>
          <View style={styles.clubMainContent}>
            <View style={styles.clubIconBox}>
              <Ionicons name="people" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.clubInfo}>
              <Text style={styles.clubTitle}>{item.title}</Text>
              <View style={styles.clubDetails}>
                <View style={styles.clubDetailRow}>
                  <Ionicons name="location-outline" size={14} color="#7f1d1d" />
                  <Text style={styles.clubDetailText}>{item.location || 'Online'}</Text>
                </View>
                <View style={styles.clubDetailRow}>
                  <Ionicons name="person-outline" size={14} color="#d4a5a8" />
                  <Text style={styles.clubDetailText}>{item.members || '0'} members</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.bookmarkIcon}
              onPress={() => handlePostInteraction(item.id, 'save')}
            >
              <Ionicons 
                name={interactions.saved ? "bookmark" : "bookmark-outline"} 
                size={20} 
                color={interactions.saved ? "#7f1d1d" : "#7f1d1d"} 
              />
            </TouchableOpacity>
          </View>
          <View style={styles.clubDescription}>
            <Text style={styles.clubDescriptionText}>{item.content}</Text>
          </View>
          <View style={styles.clubActions}>
            <TouchableOpacity 
              style={styles.clubActionButton}
              onPress={() => handleClubPress(item.id)}
            >
              <Ionicons name="flame" size={16} color="#FFFFFF" />
              <Text style={styles.clubActionText}>View Club</Text>
            </TouchableOpacity>
            <View style={styles.clubStats}>
              <TouchableOpacity style={styles.clubStatButton}>
                <Ionicons name="people-outline" size={18} color="#6B7280" />
                <Text style={styles.clubStatText}>{item.members || '0'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.clubStatButton}>
                <Ionicons name="chatbubble-outline" size={18} color="#6B7280" />
                <Text style={styles.clubStatText}>{item.posts || '0'}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.clubTags}>
            {item.tags?.slice(0, 3).map((tag, tagIndex) => (
              <View key={tagIndex} style={styles.clubTag}>
                <Text style={styles.clubTagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      );
    }

    return (
      <View style={styles.premiumPostCard}>
        <View style={styles.postHeaderNew}>
          <View style={styles.userAvatarContainerNew}>
            <Image source={{ uri: item.user?.avatar }} style={styles.premiumUserAvatar} />
            <View style={styles.storyRingNew} />
          </View>
          <View style={styles.userInfoNew}>
            <View style={styles.userNameRowNew}>
              <Text style={styles.premiumUserName}>{item.user?.name}</Text>
              {item.user?.verified && (
                <Ionicons name="checkmark-circle" size={16} color="#7f1d1d" />
              )}
            </View>
            <Text style={styles.postTimestampNew}>{item.timestamp}</Text>
          </View>
          <TouchableOpacity style={styles.postMoreBtnNew}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
        <View style={styles.postContentContainerNew}>
          <Text style={styles.premiumPostContent}>{item.content}</Text>
        </View>
        {item.media && (
          <View style={styles.postImageContainerNew}>
            <Image source={{ uri: item.media }} style={styles.premiumPostImage} resizeMode="cover" />
          </View>
        )}
        <View style={styles.postActionsNew}>
          <View style={styles.postActionsLeftNew}>
            <TouchableOpacity 
              style={styles.modernActionButtonNew}
              onPress={() => handlePostInteraction(item.id, 'like')}
            >
              <Ionicons 
                name={(interactions as any).isLiked || (interactions as any).liked ? "heart" : "heart-outline"} 
                size={24} 
                color={(interactions as any).isLiked || (interactions as any).liked ? "#e11d48" : "#7f1d1d"} 
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.modernActionButtonNew}
              onPress={() => handlePostInteraction(item.id, 'comment')}
            >
              <Ionicons name="chatbubble-outline" size={22} color="#7f1d1d" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.modernActionButtonNew}
              onPress={() => handlePostInteraction(item.id, 'share')}
            >
              <Ionicons name="paper-plane-outline" size={22} color="#7f1d1d" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            style={styles.bookmarkBtnNew}
            onPress={() => handlePostInteraction(item.id, 'save')}
          >
            <Ionicons 
              name={interactions.saved ? "bookmark" : "bookmark-outline"} 
              size={24} 
              color={interactions.saved ? "#7f1d1d" : "#7f1d1d"} 
            />
          </TouchableOpacity>
        </View>
        <View style={styles.postStatsNew}>
          <Text style={styles.likesCountNew}>{interactions.likes} likes</Text>
          <TouchableOpacity>
            <Text style={styles.commentsLinkNew}>View all {interactions.comments} comments</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [postInteractions]);

  // Loading Screen Component
  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF2E8" />
        <View style={styles.loadingContent}>
          <LinearGradient
            colors={['#7f1d1d', '#FFF4E9']}
            style={styles.loadingLogo}
          >
            <Ionicons name="home" size={40} color="#FFFFFF" />
          </LinearGradient>
          <ActivityIndicator size="large" color="#7f1d1d" style={styles.loadingSpinner} />
          <Text style={styles.loadingText}>Loading your feed...</Text>
          <Text style={styles.loadingSubtext}>Getting the latest updates</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Import the actual MessagesScreen component content
  const MessagesScreenComponent = () => {
    const [activeFilter, setActiveFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredMessages, setFilteredMessages] = useState(messagesData);
    
    // Add swipe gesture for messages screen to go back to home
    const messagesSwipeX = useRef(new Animated.Value(0)).current;
    const [messagesIsNavigating, setMessagesIsNavigating] = useState(false);

    // Update filtered messages when messagesData changes
    useEffect(() => {
      setFilteredMessages(messagesData);
    }, [messagesData]);

    const messagesPanResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        if (messagesIsNavigating) return false;
        // Only respond to left-to-right swipes (positive dx) to go back
        return gestureState.dx > 0 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 10;
      },
      onPanResponderGrant: () => {
        if (messagesIsNavigating) return;
        messagesSwipeX.setOffset((messagesSwipeX as any)._value);
        messagesSwipeX.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx > 0) {
          const progress = gestureState.dx / width;
          let resistance = 1;
          
          if (progress > 0.3) {
            resistance = 1 - (progress - 0.3) * 0.8;
            resistance = Math.max(resistance, 0.15);
          }
          
          messagesSwipeX.setValue(gestureState.dx * resistance);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        messagesSwipeX.flattenOffset();
        
        const swipeThreshold = width * 0.25;
        const velocityThreshold = 0.8;
        const shouldGoBack = 
          (Math.abs(gestureState.dx) > swipeThreshold) || 
          (Math.abs(gestureState.vx) > velocityThreshold && gestureState.dx > 30);
        
        if (shouldGoBack && !messagesIsNavigating) {
          setMessagesIsNavigating(true);
          Animated.timing(messagesSwipeX, {
            toValue: width,
            duration: 180,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }).start(() => {
            setShowMessagesScreen(false);
            messagesSwipeX.setValue(0);
            swipeX.setValue(0);
            // Use setTimeout to ensure proper state cleanup
            setTimeout(() => {
              setIsNavigating(false);
              setMessagesIsNavigating(false);
            }, 50);
          });
        } else {
          Animated.spring(messagesSwipeX, {
            toValue: 0,
            tension: 220,
            friction: 10,
            useNativeDriver: true,
          }).start(() => {
            // Use setTimeout to ensure state updates happen after animation completes
            setTimeout(() => {
              setMessagesIsNavigating(false);
            }, 50);
          });
        }
      },
      onPanResponderTerminate: () => {
        messagesSwipeX.flattenOffset();
        Animated.spring(messagesSwipeX, {
          toValue: 0,
          tension: 220,
          friction: 10,
          useNativeDriver: true,
        }).start(() => {
          // Use setTimeout to ensure state updates happen after animation completes
          setTimeout(() => {
            setMessagesIsNavigating(false);
          }, 50);
        });
      },
    });

    const handleSearch = (query: string) => {
      setSearchQuery(query);
      
      if (!query.trim()) {
        setFilteredMessages(messagesData);
        return;
      }
      
      const filtered = messagesData.filter(message => 
        message.name.toLowerCase().includes(query.toLowerCase()) ||
        message.message.toLowerCase().includes(query.toLowerCase())
      );
      
      setFilteredMessages(filtered);
    };

    const handleFilterChange = (filter: string) => {
      setActiveFilter(filter);
      
      let filtered = messagesData;
      
      if (searchQuery.trim()) {
        filtered = filtered.filter(message => 
          message.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          message.message.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      switch (filter) {
        case 'Unread':
          filtered = filtered.filter(message => message.unread > 0);
          break;
        case 'All':
        default:
          break;
      }
      
      setFilteredMessages(filtered);
    };

    return (
      <Animated.View 
        style={[
          { flex: 1, backgroundColor: '#FFF2E8' },
          { transform: [{ translateX: messagesSwipeX }] }
        ]}
        {...messagesPanResponder.panHandlers}
      >
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          {/* Header with Title */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingTop: 50,
            paddingBottom: 16,
            backgroundColor: '#FFF2E8'
          }}>
            <TouchableOpacity 
              style={{ 
                padding: 8,
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                shadowColor: '#7f1d1d',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                elevation: 2
              }}
              onPress={() => {
                // Simple immediate navigation back without complex animations
                setShowMessagesScreen(false);
                // Reset all animation values to prevent conflicts
                messagesSwipeX.setValue(0);
                swipeX.setValue(0);
                // Use setTimeout to ensure proper state cleanup
                setTimeout(() => {
                  setIsNavigating(false);
                  setMessagesIsNavigating(false);
                  setIsTransitioning(false);
                }, 50);
              }}
            >
              <Ionicons name="arrow-back" size={24} color="#7f1d1d" />
            </TouchableOpacity>
            
            <Text style={{
              fontSize: 28,
              fontWeight: 'bold',
              color: '#7f1d1d',
              letterSpacing: -0.5,
              position: 'absolute',
              left: '50%',
              top: 51,
              transform: [{ translateX: -50 }]
            }}>Messages</Text>
            
          </View>
          {/* Search Bar */}
          <View style={{
            paddingHorizontal: 20,
            paddingBottom: 16,
            backgroundColor: '#FFF2E8'
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              paddingHorizontal: 16,
              height: 44,
              borderWidth: 1,
              borderColor: 'rgba(127, 29, 29, 0.1)',
              shadowColor: '#7f1d1d',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 6,
              elevation: 2
            }}>
              <Ionicons name="search" size={20} color="#7f1d1d" />
              <TextInput
                placeholder="Search messages..."
                placeholderTextColor="#7f1d1d"
                style={{
                  flex: 1,
                  fontSize: 16,
                  color: '#7f1d1d',
                  marginLeft: 12
                }}
                value={searchQuery}
                onChangeText={handleSearch}
              />
            </View>
          </View>

          {/* Filter Tabs */}
          <View style={{
            flexDirection: 'row',
            paddingHorizontal: 20,
            paddingBottom: 16,
            backgroundColor: '#FFF2E8'
          }}>
            {['All', 'Unread'].map((filter) => (
              <TouchableOpacity
                key={filter}
                onPress={() => handleFilterChange(filter)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  marginRight: 12,
                  borderRadius: 20,
                  backgroundColor: activeFilter === filter ? '#7f1d1d' : '#FFFFFF',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 2
                }}
              >
                <Text style={{
                  color: activeFilter === filter ? '#FFFFFF' : '#6B7280',
                  fontWeight: activeFilter === filter ? '600' : '400',
                  fontSize: 14
                }}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Chat List */}
          <View style={{ backgroundColor: '#FFF2E8' }}>
            {isLoadingMessages ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#7f1d1d" />
                <Text style={{ marginTop: 16, color: '#7f1d1d', fontSize: 16 }}>Loading conversations...</Text>
              </View>
            ) : filteredMessages.length === 0 ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <Ionicons name="chatbubbles-outline" size={64} color="#7f1d1d" />
                <Text style={{ marginTop: 16, color: '#7f1d1d', fontSize: 18, fontWeight: 'bold' }}>No Conversations Yet</Text>
                <Text style={{ marginTop: 8, color: '#6B7280', textAlign: 'center' }}>Start chatting with your connections!</Text>
              </View>
            ) : (
              filteredMessages.map((item, index) => (
              <TouchableOpacity 
                key={item.id} 
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#FFF2E8',
                  borderBottomWidth: 1,
                  borderBottomColor: '#F3F4F6'
                }}
                onPress={() => router.push(`/chat/${item.id}`)}
              >
                <View style={{ position: 'relative', marginRight: 12 }}>
                  <Image 
                    source={{ uri: item.avatar }} 
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                    }}
                  />
                  {item.online && (
                    <View style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: 14,
                      height: 14,
                      borderRadius: 7,
                      backgroundColor: '#10B981',
                      borderWidth: 2,
                      borderColor: '#FFFFFF',
                    }} />
                  )}
                  {item.type === 'group' && (
                    <View style={{
                      position: 'absolute',
                      top: -2,
                      right: -2,
                      width: 16,
                      height: 16,
                      borderRadius: 8,
                      backgroundColor: '#7f1d1d',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Ionicons name="people" size={10} color="#FFFFFF" />
                    </View>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: '#1F2937',
                    }}>{item.name}</Text>
                    <Text style={{
                      fontSize: 12,
                      color: '#6B7280',
                    }}>{item.time}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text 
                      style={{
                        fontSize: 14,
                        color: '#6B7280',
                        flex: 1,
                        marginRight: 8
                      }}
                      numberOfLines={1}
                    >
                      {item.message}
                    </Text>
                    {item.unread > 0 && (
                      <View style={{
                        backgroundColor: '#7f1d1d',
                        borderRadius: 10,
                        minWidth: 20,
                        height: 20,
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingHorizontal: 6
                      }}>
                        <Text style={{
                          color: '#FFFFFF',
                          fontSize: 12,
                          fontWeight: '600'
                        }}>
                          {item.unread}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>
      </Animated.View>
    );
  };



  // Show swipe messages screen if triggered by swipe gesture
  if (showMessagesScreen) {
    return (
      <ErrorBoundary>
        <View style={{ flex: 1, position: 'relative' }}>
          <StatusBar barStyle="dark-content" backgroundColor="#FFF2E8" translucent={true} />
          
          {/* Home Screen Background - always visible */}
          <SafeAreaView style={[{ flex: 1, backgroundColor: '#FFF2E8' }]}>
            {/* Render home screen content behind messages */}
            <View style={{ flex: 1, position: 'relative' }}>
              <Animated.View 
                style={[{ flex: 1 }]}
              >
                {/* Header */}
                <Animated.View style={[{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  paddingHorizontal: 20,
                  paddingTop: 10,
                  paddingBottom: 15,
                  backgroundColor: '#FFF2E8'
                }]}>
                  <Text style={{
                    fontSize: 32,
                    fontWeight: 'bold',
                    color: '#7f1d1d',
                    letterSpacing: -1
                  }}>Harshtech</Text>
                  
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                    <TouchableOpacity
                      onPress={() => setShowMessagesScreen(true)}
                    >
                      <Ionicons name="chatbubble-outline" size={28} color="#7f1d1d" />
                    </TouchableOpacity>
                  </View>
                </Animated.View>
                
                {/* Rest of home content would go here */}
                <View style={{ flex: 1, backgroundColor: '#FFF2E8' }} />
              </Animated.View>
            </View>
          </SafeAreaView>
          
          {/* Messages Screen Overlay */}
          <View 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: '#FFF2E8',
              zIndex: 1
            }}
          >
            <MessagesScreenComponent />
          </View>
        </View>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaView style={[{ flex: 1, backgroundColor: '#FFF2E8' }]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF2E8" translucent={true} />
        
        {/* Entire Home Screen with Swipe Gesture */}
        <View style={{ flex: 1, position: 'relative' }}>
          {/* Messages Screen positioned off-screen to the right - always rendered */}
          <Animated.View 
            style={[
              { 
                position: 'absolute',
                top: 0,
                left: width,
                right: -width,
                bottom: 0,
                backgroundColor: '#FFF2E8',
                zIndex: 1
              },
              { transform: [{ translateX: swipeX }] }
            ]}
          >
            <MessagesScreenComponent />
          </Animated.View>
          
          <Animated.View 
            style={[
              { flex: 1 }, 
              { transform: [{ translateX: swipeX }] },
              { opacity: transitionOpacity }
            ]}
            {...(!showSideMenu ? panResponder.panHandlers : {})}
          >
            {/* Main Feed with Scrolling Header */}
            <ScrollView 
              style={{ backgroundColor: '#FFF2E8', flex: 1 }}
              contentContainerStyle={{ paddingBottom: 100 }}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  colors={['#7f1d1d']}
                  tintColor={'#7f1d1d'}
                />
              }
            >
              {/* Header - Now inside ScrollView */}
              <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                paddingHorizontal: 20, 
                paddingTop: 50, 
                paddingBottom: 16, 
                backgroundColor: '#FFF2E8'
              }}>
                <TouchableOpacity 
                  style={{ 
                    padding: 8,
                    backgroundColor: '#FFFFFF',
                    borderRadius: 12,
                    shadowColor: '#7f1d1d',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                    zIndex: 9999
                  }}
                  activeOpacity={0.7}
                  onPress={() => {
                    console.log('Menu button pressed', { isNavigating, isTransitioning, messagesIsNavigating, showSideMenu });
                    setShowSideMenu(true);
                  }}
                >
                  <Ionicons name="menu" size={24} color="#7f1d1d" />
                </TouchableOpacity>
                
                <Text style={{ 
                  fontSize: 28, 
                  fontWeight: 'bold', 
                  color: '#7f1d1d',
                  letterSpacing: -0.5
                }}>Home</Text>
                
                <TouchableOpacity 
                  style={{ 
                    padding: 8,
                    backgroundColor: '#FFFFFF',
                    borderRadius: 12,
                    shadowColor: '#7f1d1d',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3
                  }}
                  onPress={() => setShowMessagesScreen(true)}
                >
                  <Ionicons name="chatbubble-outline" size={24} color="#7f1d1d" />
                </TouchableOpacity>
              </View>

              {/* Feed Content */}
              <View style={{ paddingTop: 8, paddingBottom: 16 }}>
                {isLoading ? (
                  <View style={{ padding: 40, alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#7f1d1d" />
                    <Text style={{ marginTop: 16, color: '#7f1d1d', fontSize: 16 }}>Loading posts...</Text>
                  </View>
                ) : feedData.length === 0 ? (
                  <View style={{ padding: 40, alignItems: 'center' }}>
                    <Ionicons name="document-text-outline" size={64} color="#7f1d1d" />
                    <Text style={{ marginTop: 16, color: '#7f1d1d', fontSize: 18, fontWeight: 'bold' }}>No Posts Yet</Text>
                    <Text style={{ marginTop: 8, color: '#6B7280', textAlign: 'center' }}>Be the first to share something with the community!</Text>
                  </View>
                ) : (
                  feedData.map((item, index) => (
                    <View key={item.id}>
                      {renderItem({ item, index })}
                    </View>
                  ))
                )}
              </View>
            </ScrollView>
          </Animated.View>
          
          {/* Messages Screen Preview */}
          <Animated.View 
            style={[{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: width,
              backgroundColor: '#FFF2E8',
              transform: [{
                translateX: swipeX.interpolate({
                  inputRange: [-width, 0],
                  outputRange: [0, width],
                  extrapolate: 'clamp',
                }),
              }],
            }]}
            pointerEvents="box-none"
          >
            {/* Messages Header */}
            <View 
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 20,
                paddingTop: 50,
                paddingBottom: 16,
                backgroundColor: '#7f1d1d'
              }}
              pointerEvents="auto"
            >
              <Text style={{
                fontSize: 28,
                fontWeight: 'bold',
                color: '#FFFFFF',
                letterSpacing: -0.5
              }}>Messages</Text>
            </View>
            
            {/* Chat List */}
            <ScrollView 
              style={{ flex: 1, backgroundColor: '#FFF2E8' }}
              contentContainerStyle={{ paddingBottom: 100 }}
              scrollEnabled={true}
              nestedScrollEnabled={true}
              pointerEvents="auto"
            >
              {messagesData.map((item) => (
                <View
                  key={item.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    backgroundColor: '#7f1d1d',
                  }}
                >
                  <Pressable
                    onPress={() => router.push(`/chat/${item.id}`)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      flex: 1,
                    }}
                  >
                  <View style={{ position: 'relative', marginRight: 12 }}>
                    <Image 
                      source={{ uri: item.avatar }} 
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                      }}
                    />
                    {item.online && (
                      <View style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: 14,
                        height: 14,
                        borderRadius: 7,
                        backgroundColor: '#10B981',
                        borderWidth: 2,
                        borderColor: '#FFFFFF',
                      }} />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <Text style={{
                        fontSize: 16,
                        fontWeight: '600',
                        color: '#1F2937',
                      }}>{item.name}</Text>
                      <Text style={{
                        fontSize: 12,
                        color: '#6B7280',
                      }}>{item.time}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{
                        fontSize: 14,
                        color: '#6B7280',
                        flex: 1,
                        marginRight: 8,
                      }} numberOfLines={1}>{item.message}</Text>
                      {item.unread > 0 && (
                        <View style={{
                          backgroundColor: '#7f1d1d',
                          borderRadius: 10,
                          minWidth: 20,
                          height: 20,
                          justifyContent: 'center',
                          alignItems: 'center',
                          paddingHorizontal: 6,
                        }}>
                          <Text style={{
                            color: '#FFFFFF',
                            fontSize: 12,
                            fontWeight: 'bold',
                          }}>{item.unread}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          </Animated.View>
        </View>



        {/* Enhanced Side Menu Modal */}
        <Modal
          animationType="none"
          transparent={true}
          visible={showSideMenu}
          onRequestClose={() => setShowSideMenu(false)}
        >
          <TouchableOpacity 
            style={styles.premiumModalOverlay}
            activeOpacity={1}
            onPress={() => setShowSideMenu(false)}
          >
            <View 
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '75%',
                backgroundColor: '#FFF2E8',
                shadowColor: '#000',
                shadowOffset: { width: 2, height: 0 },
                shadowOpacity: 0.25,
                shadowRadius: 10,
                elevation: 10
              }}
            >
              <View
                style={{
                  backgroundColor: '#FFF2E8',
                  padding: 20,
                  paddingTop: 40,
                  borderBottomWidth: 1,
                  borderBottomColor: 'rgba(255, 255, 255, 0.2)'
                }}
              >
                <TouchableOpacity 
                  style={styles.premiumProfileContainer}
                  onPress={() => {
                    setShowSideMenu(false);
                    router.push('/(tabs)/profile');
                  }}
                >
                  <View style={styles.premiumProfileImageContainer}>
                    <Image 
                      source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' }} 
                      style={styles.premiumProfileImage}
                    />
                    <View style={styles.profileStatusIndicator} />
                  </View>
                  <View style={styles.premiumProfileInfo}>
                    <Text style={[styles.premiumProfileName, {color: '#7f1d1d'}]}>
                      {user ? `${user.firstName} ${user.lastName}` : 'Guest User'}
                    </Text>
                    <Text style={[styles.premiumProfileEmail, {color: '#374151'}]}>
                      {user?.email || 'guest@example.com'}
                    </Text>
                    <View style={styles.profileStats}>
                      <Text style={[styles.profileStatsText, {color: '#374151'}]}>
                        {user?.department || 'No department'}
                      </Text>
                    </View>
                  </View>
                  
                </TouchableOpacity>
              </View>

              <ScrollView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
                {quickActions.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 20,
                      paddingVertical: 16,
                      borderBottomWidth: 1,
                      borderBottomColor: '#E5E7EB'
                    }}
                    onPress={() => handleMenuItemPress(item.route)}
                  >
                    <View style={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: 20, 
                      backgroundColor: '#F9FAFB', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      marginRight: 16 
                    }}>
                      <Ionicons 
                        name={item.icon as any} 
                        size={22} 
                        color={'#7f1d1d'} 
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ 
                        fontSize: 16, 
                        fontWeight: '600', 
                        color: '#1F2937', 
                        marginBottom: 2 
                      }}>
                        {item.title}
                      </Text>
                      <Text style={{ 
                        fontSize: 14, 
                        color: '#6B7280' 
                      }}>{item.description}</Text>
                    </View>
                    <Ionicons 
                      name="chevron-forward" 
                      size={18} 
                      color={'#6B7280'} 
                    />
                  </TouchableOpacity>
                ))}
                
                {/* Logout Button at Bottom */}
                <TouchableOpacity 
                  style={{
                    paddingHorizontal: 20,
                    paddingVertical: 16,
                    marginTop: 20,
                    marginHorizontal: 16,
                    borderRadius: 8,
                    alignItems: 'center'
                  }}
                  onPress={handleLogout}
                >
                  <Text style={{ 
                    fontSize: 14, 
                    color: '#7f1d1d', 
                    fontWeight: '600' 
                  }}>Logout</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>



        {/* Comments Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showCommentsModal}
          onRequestClose={() => setShowCommentsModal(false)}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.commentsModalOverlay}
          >
            <View style={styles.commentsModalContainer}>
              <View style={styles.commentsModalHeader}>
                <Text style={styles.commentsModalTitle}>Comments</Text>
                <TouchableOpacity 
                  onPress={() => setShowCommentsModal(false)}
                  style={styles.commentsModalClose}
                >
                  <Ionicons name="close" size={24} color="#374151" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.commentsScrollView}>
                {selectedPostId && comments[selectedPostId]?.map((comment) => (
                  <View key={comment.id} style={styles.commentItem}>
                    <View style={styles.commentAvatar}>
                      <Text style={styles.commentAvatarText}>{comment.user[0]}</Text>
                    </View>
                    <View style={styles.commentContent}>
                      <Text style={styles.commentUser}>{comment.user}</Text>
                      <Text style={styles.commentText}>{comment.text}</Text>
                      <Text style={styles.commentTimestamp}>{comment.time}</Text>
                    </View>
                  </View>
                ))}
                {selectedPostId && (!comments[selectedPostId] || comments[selectedPostId].length === 0) && (
                  <View style={styles.noCommentsContainer}>
                    <Text style={styles.noCommentsText}>No comments yet. Be the first to comment!</Text>
                  </View>
                )}
              </ScrollView>
              
              <View style={styles.commentInputContainer}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Add a comment..."
                  value={newComment}
                  onChangeText={setNewComment}
                  multiline
                />
                <TouchableOpacity 
                  style={styles.commentSendButton}
                  onPress={handleAddComment}
                  disabled={!newComment.trim()}
                >
                  <Ionicons 
                    name="send" 
                    size={20} 
                    color={newComment.trim() ? "#7f1d1d" : "#9CA3AF"} 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Share Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showShareModal}
          onRequestClose={() => setShowShareModal(false)}
        >
          <View style={styles.shareModalOverlay}>
            <View style={styles.shareModalContainer}>
              {/* Modal Header */}
              <View style={styles.shareModalHeader}>
                <TouchableOpacity onPress={() => setShowShareModal(false)}>
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
                <Text style={styles.shareModalTitle}>Share</Text>
                <View style={{ width: 24 }} />
              </View>

              {selectedSharePost && (
                <>
                  {/* Post Preview */}
                  <View style={styles.sharePostPreview}>
                    <View style={styles.sharePostHeader}>
                      <Image 
                        source={{ uri: selectedSharePost.user?.avatar || 'https://i.pravatar.cc/150?u=default' }} 
                        style={styles.sharePostAvatar}
                      />
                      <View style={styles.sharePostUserInfo}>
                        <Text style={styles.sharePostUsername}>{selectedSharePost.user?.name || 'Anonymous'}</Text>
                        <Text style={styles.sharePostTime}>{selectedSharePost.time || 'now'}</Text>
                      </View>
                    </View>
                    <Text style={styles.sharePostContent} numberOfLines={3}>
                      {selectedSharePost.content || selectedSharePost.title}
                    </Text>
                  </View>

                  {/* Share Options */}
                  <ScrollView style={styles.shareOptionsContainer}>
                    {/* External Share */}
                    <TouchableOpacity 
                      style={styles.shareOption}
                      onPress={() => {
                        setShowShareModal(false);
                        handleExternalShare(selectedSharePost);
                      }}
                    >
                      <View style={styles.shareOptionIcon}>
                        <Ionicons name="share-outline" size={24} color="#7f1d1d" />
                      </View>
                      <View style={styles.shareOptionText}>
                        <Text style={styles.shareOptionTitle}>Share externally</Text>
                        <Text style={styles.shareOptionSubtitle}>Share to other apps</Text>
                      </View>
                    </TouchableOpacity>

                    {/* Copy Link */}
                    <TouchableOpacity 
                      style={styles.shareOption}
                      onPress={() => {
                        Alert.alert('Link Copied!', 'Post link copied to clipboard');
                        setShowShareModal(false);
                      }}
                    >
                      <View style={styles.shareOptionIcon}>
                        <Ionicons name="link" size={24} color="#7f1d1d" />
                      </View>
                      <View style={styles.shareOptionText}>
                        <Text style={styles.shareOptionTitle}>Copy link</Text>
                        <Text style={styles.shareOptionSubtitle}>Copy post link</Text>
                      </View>
                    </TouchableOpacity>
                  </ScrollView>
                </>
              )}
            </View>
          </View>
        </Modal>

      </SafeAreaView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  // Premium Container & Layout
  premiumContainer: {
    flex: 1,
    backgroundColor: '#2d1b1e'
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF2E8'
  },
  
  // Premium Header Styles
  premiumHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingTop: 50, 
    paddingBottom: 16, 
    backgroundColor: '#2d1b1e', 
    borderBottomWidth: 1, 
    borderBottomColor: '#7f1d1d', 
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FFF2E8',
    borderBottomWidth: 2,
    borderBottomColor: '#7f1d1d'
  },
  premiumHamburgerButton: { 
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#7f1d1d'
  },
  premiumHeaderButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF'
  },
  linkedinHeaderCenter: {
    flex: 1,
    alignItems: 'center'
  },
  linkedinTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#7f1d1d'
  },
  linkedinHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  linkedinNotificationButton: {
    padding: 8,
    position: 'relative'
  },
  linkedinNotificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#0a66c2',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  linkedinNotificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold'
  },

  // LinkedIn Main Content & Create Post
  linkedinMainContent: {
    flex: 1,
    paddingTop: 8
  },
  linkedinCreatePostCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 8,
    padding: 16,
    shadowColor: '#7f1d1d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(127, 29, 29, 0.1)'
  },
  linkedinCreatePostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  linkedinUserAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12
  },
  linkedinCreatePostInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f9f9f9'
  },
  linkedinCreatePostPlaceholder: {
    color: '#666666',
    fontSize: 16
  },
  linkedinCreatePostActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0'
  },
  linkedinActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12
  },
  linkedinActionText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#666666'
  },

  // Burgundy Pill Navigation Tabs
  linkedinNavTabs: {
    backgroundColor: '#f8f4f4',
    paddingVertical: 16,
    paddingHorizontal: 16
  },
  tabsScrollView: {
    flexGrow: 0
  },
  linkedinTab: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginRight: 12,
    borderRadius: 25,
    backgroundColor: 'transparent'
  },
  linkedinActiveTab: {
    backgroundColor: '#7f1d1d'
  },
  linkedinTabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7f1d1d'
  },
  linkedinActiveTabText: {
    color: '#FFFFFF',
    fontWeight: '600'
  },
  linkedinTabIndicator: {
    display: 'none'
  },

  // Dark Mode Styles
  darkContainer: {
    backgroundColor: '#1a1a1a'
  },
  darkHeader: {
    backgroundColor: '#2d2d2d',
    borderBottomColor: '#404040'
  },
  darkText: {
    color: '#FFFFFF'
  },
  darkModeToggle: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)'
  },
  logoutButton: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0'
  },
  logoutText: {
    fontSize: 14,
    color: '#7f1d1d',
    fontWeight: '500'
  },

  // Dark Mode Navigation Tabs
  darkNavTabs: {
    backgroundColor: '#2d2d2d',
    borderBottomColor: '#404040'
  },
  darkTab: {
    backgroundColor: '#404040',
    borderColor: '#666666'
  },
  darkActiveTab: {
    backgroundColor: '#7f1d1d',
    borderColor: '#7f1d1d'
  },
  darkTabText: {
    color: '#CCCCCC'
  },
  darkActiveTabText: {
    color: '#FFFFFF'
  },

  // Dark Mode Main Content
  darkMainContent: {
    backgroundColor: '#1a1a1a'
  },
  darkCard: {
    backgroundColor: '#2d2d2d',
    borderColor: '#404040'
  },
  darkCardText: {
    color: '#FFFFFF'
  },
  darkCardSubtext: {
    color: '#CCCCCC'
  },
  darkSideMenu: {
    backgroundColor: '#2d2d2d'
  },
  darkMenuItem: {
    backgroundColor: '#404040'
  },
  darkMenuText: {
    color: '#FFFFFF'
  },
  darkMessagesButton: {
    shadowColor: '#7f1d1d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },

  // Premium Menu Header (was missing)
  premiumMenuHeader: {
    padding: 20,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)'
  },
  premiumProfileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  premiumProfileImageContainer: {
    position: 'relative',
    marginRight: 12
  },
  premiumProfileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#FFFFFF'
  },
  premiumProfileInfo: {
    flex: 1
  },
  premiumProfileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4
  },
  premiumProfileEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8
  },
  profileStats: {
    flexDirection: 'row'
  },
  profileStatsText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500'
  },
  profileStatusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF'
  },
  logoGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  premiumHeaderTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#FFFFFF',
    letterSpacing: 1
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
    fontWeight: '500'
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  searchButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#fef2f2'
  },
  notificationButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#fef2f2',
    position: 'relative'
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#d4a5a8',
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold'
  },

  // Feed Layout
  premiumFeedList: { 
    paddingBottom: 100 
  },
  feedHeader: {
    backgroundColor: '#FFF2E8'
  },

  // Section Titles
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
    paddingHorizontal: 20
  },

  // Stories Section
  storiesContainer: {
    paddingVertical: 20,
    backgroundColor: '#FFF2E8',
    marginBottom: 8,
    borderTopWidth: 3,
    borderTopColor: '#7f1d1d',
    borderBottomWidth: 3,
    borderBottomColor: '#7f1d1d',
    shadowColor: '#7f1d1d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8
  },
  storiesScroll: {
    paddingHorizontal: 20
  },
  storyItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 70
  },
  storyImageContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    padding: 3,
    marginBottom: 8
  },
  unviewedStory: {
    backgroundColor: '#7f1d1d'
  },
  viewedStory: {
    backgroundColor: '#D1D5DB'
  },
  storyImage: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#F3F4F6'
  },
  addStoryIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#7f1d1d',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF'
  },
  storyName: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '500'
  },

  // Quick Actions Section
  quickActionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFF2E8',
    borderTopWidth: 3,
    borderTopColor: '#7f1d1d',
    borderBottomWidth: 3,
    borderBottomColor: '#7f1d1d',
    shadowColor: '#7f1d1d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: '#2d1b1e',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#7f1d1d',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 2,
    borderColor: '#7f1d1d'
  },
  quickActionIcon: {
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f1d1d'
  },

  // Premium Filter Container
  premiumFilterContainer: {
    paddingVertical: 20,
    backgroundColor: '#FFF2E8',
    borderBottomWidth: 3,
    borderBottomColor: '#7f1d1d',
    borderTopWidth: 3,
    borderTopColor: '#7f1d1d',
    shadowColor: '#7f1d1d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8
  },
  premiumFilterButton: {
    backgroundColor: '#2d1b1e',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 8,
    borderRadius: 20,
    position: 'relative',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#7f1d1d',
    shadowColor: '#7f1d1d',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6
  },
  premiumActiveFilter: {
    backgroundColor: '#7f1d1d'
  },
  premiumFilterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f1d1d'
  },
  premiumActiveFilterText: {
    color: '#FFFFFF'
  },
  filterIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    marginLeft: -12,
    width: 24,
    height: 3,
    backgroundColor: '#7f1d1d',
    borderRadius: 2
  },

  // Premium Event Card
  premiumEventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#7f1d1d',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(127, 29, 29, 0.1)'
  },
  priorityBanner: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#d4a5a8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomLeftRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    zIndex: 1
  },
  priorityText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold'
  },
  eventHeaderNew: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20
  },
  eventDateBadgeNew: {
    width: 70,
    height: 70,
    backgroundColor: '#7f1d1d',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#7f1d1d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5
  },
  eventDateLarge: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF'
  },
  eventMonthSmall: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 1
  },
  eventInfoNew: {
    flex: 1
  },
  premiumEventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8
  },
  eventMetaRowNew: {
    gap: 16
  },
  eventMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  eventMetaText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500'
  },
  eventBookmarkBtnNew: {
    padding: 12,
    backgroundColor: '#fef2f2',
    borderRadius: 16
  },
  eventImageContainerNew: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative'
  },
  premiumEventImage: {
    width: '100%',
    height: 200,
    borderRadius: 16
  },
  eventImageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: 16
  },
  eventJoinBtnNew: {
    backgroundColor: 'rgba(127, 29, 29, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  eventJoinTextNew: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold'
  },
  eventTagsNew: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 8
  },
  premiumTag: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FECACA'
  },
  premiumTagText: {
    color: '#d4a5a8',
    fontSize: 12,
    fontWeight: '600'
  },

  // Premium Project Card
  premiumProjectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#7f1d1d',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(127, 29, 29, 0.1)'
  },
  projectHeaderNew: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16
  },
  userAvatarContainerNew: {
    position: 'relative',
    marginRight: 12
  },
  premiumUserAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#fef2f2'
  },
  onlineIndicatorNew: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    backgroundColor: '#10B981',
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#FFFFFF'
  },
  userInfoNew: {
    flex: 1
  },
  userNameRowNew: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6
  },
  premiumUserName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827'
  },
  userRole: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500'
  },
  projectMoreBtnNew: {
    padding: 8
  },
  projectContentNew: {
    paddingHorizontal: 20,
    paddingBottom: 16
  },
  premiumProjectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10
  },
  premiumProjectDescription: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 24
  },
  projectTagsNew: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8
  },
  gradientTagNew: {
    backgroundColor: '#7f1d1d',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16
  },
  gradientTagTextNew: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600'
  },
  projectActionsNew: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(127, 29, 29, 0.1)'
  },
  projectActionBtnNew: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#fef2f2',
    gap: 6
  },
  likedButton: {
    backgroundColor: '#7f1d1d'
  },
  projectActionTextNew: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f1d1d'
  },
  likedText: {
    color: '#FFFFFF'
  },

  // Premium Post Card
  premiumPostCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#7f1d1d',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(127, 29, 29, 0.1)'
  },
  postHeaderNew: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16
  },
  storyRingNew: {
    position: 'absolute',
    top: -3,
    left: -3,
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 3,
    borderColor: '#7f1d1d'
  },
  postTimestampNew: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500'
  },
  postMoreBtnNew: {
    padding: 8
  },
  postContentContainerNew: {
    paddingHorizontal: 20,
    paddingBottom: 16
  },
  premiumPostContent: {
    fontSize: 16,
    color: '#111827',
    lineHeight: 26
  },
  postImageContainerNew: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden'
  },
  premiumPostImage: {
    width: '100%',
    height: 250,
    borderRadius: 16
  },
  postActionsNew: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16
  },
  postActionsLeftNew: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20
  },
  modernActionButtonNew: {
    padding: 8
  },
  bookmarkBtnNew: {
    padding: 8
  },
  postStatsNew: {
    paddingHorizontal: 20,
    paddingBottom: 20
  },
  likesCountNew: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4
  },
  commentsLinkNew: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500'
  },

  // Messages Button
  messagesButton: {
    position: 'absolute',
    bottom: 100,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#7f1d1d',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10
  },
  messagesButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center'
  },

  // Premium Side Menu
  premiumModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    flexDirection: 'row'
  },
  premiumSideMenu: {
    backgroundColor: '#FFFFFF',
    width: '80%',
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20
  },
  menuHeaderGradient: {
    backgroundColor: '#FFF2E8',
    padding: 24,
    paddingTop: 60
  },
  premiumProfileSection: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 16
  },
  premiumMenuProfileImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#FFFFFF'
  },
  premiumMenuContent: {
    flex: 1,
    paddingTop: 16
  },
  premiumMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  premiumMenuItemIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16
  },
  premiumMenuItemContent: {
    flex: 1
  },
  premiumMenuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2
  },
  premiumMenuItemDescription: {
    fontSize: 14,
    color: '#6B7280'
  },

  // Logout Menu Item Styles
  logoutMenuItem: {
    backgroundColor: '#fef2f2',
    borderTopWidth: 1,
    borderTopColor: '#fecaca'
  },
  logoutMenuItemIcon: {
    backgroundColor: '#fee2e2'
  },
  logoutMenuItemTitle: {
    color: '#7f1d1d',
    fontWeight: '600'
  },

  // Legacy styles (keeping for compatibility)
  headerBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: 'rgba(127, 29, 29, 0.1)', paddingTop: 70, paddingBottom: 10, shadowColor: '#7f1d1d', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 4 },
  hamburgerButton: { 
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#7f1d1d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#7f1d1d' },
  feedList: { paddingHorizontal: 16, paddingBottom: 100 },
  filterContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 12 },
  filterButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16, backgroundColor: '#FFFFFF' },
  activeFilter: { backgroundColor: '#7f1d1d' },
  filterText: { color: '#7f1d1d', fontWeight: '600' },
  activeFilterText: { color: '#FFFFFF' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 6, marginBottom: 20, overflow: 'hidden' },
  
  // Modern Event Card Styles (Legacy)
  modernEventCard: { backgroundColor: '#FFFFFF', borderRadius: 0, shadowColor: '#000000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2, marginBottom: 8, overflow: 'hidden', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#e0e0e0' },
  eventHeader: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  eventDateBadge: { width: 60, height: 60, backgroundColor: '#7f1d1d', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  oldEventInfo: { flex: 1 },
  modernEventTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 6 },
  eventMetaRow: { flexDirection: 'row', alignItems: 'center' },
  eventLocation: { fontSize: 14, color: '#6B7280', marginLeft: 4 },
  eventTime: { fontSize: 14, color: '#6B7280', marginLeft: 4 },
  eventBookmarkBtn: { padding: 8, backgroundColor: '#fef2f2', borderRadius: 12 },
  eventImageContainer: { position: 'relative', marginHorizontal: 20, marginBottom: 16, borderRadius: 16, overflow: 'hidden' },
  modernEventImage: { width: '100%', height: 180, borderRadius: 16 },
  oldEventImageOverlay: { position: 'absolute', bottom: 12, right: 12 },
  eventJoinBtn: { backgroundColor: 'rgba(139, 26, 26, 0.9)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  eventJoinText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  modernEventTags: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, paddingBottom: 20 },
  modernTag: { backgroundColor: '#fef2f2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: '#7f1d1d' },
  modernTagText: { color: '#7f1d1d', fontSize: 12, fontWeight: '600' },

  // Modern Project Card Styles  
  modernProjectCard: { backgroundColor: '#FFFFFF', borderRadius: 0, shadowColor: '#000000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2, marginBottom: 8, overflow: 'hidden', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#e0e0e0' },
  modernProjectHeader: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingBottom: 16 },
  userAvatarContainer: { position: 'relative', marginRight: 12 },
  modernUserAvatar: { width: 48, height: 48, borderRadius: 24 },
  onlineIndicator: { position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, backgroundColor: '#10B981', borderRadius: 7, borderWidth: 2, borderColor: '#FFFFFF' },
  userInfo: { flex: 1 },
  userNameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  modernUserName: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginRight: 6 },
  verifiedBadge: { marginLeft: 4 },
  modernUserHandle: { fontSize: 14, color: '#6B7280' },
  projectMoreBtn: { padding: 8 },
  projectContent: { paddingHorizontal: 20, paddingBottom: 16 },
  modernProjectTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  modernProjectDescription: { fontSize: 15, color: '#374151', lineHeight: 22 },
  modernProjectTags: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, paddingBottom: 16 },
  gradientTag: { backgroundColor: '#7f1d1d', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 8, marginBottom: 8 },
  gradientTagText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  oldProjectActions: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1, borderTopColor: 'rgba(127, 29, 29, 0.1)' },
  projectActionBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fef2f2' },
  oldProjectActionText: { marginLeft: 6, fontSize: 14, fontWeight: '600', color: '#7f1d1d' },

  // Modern Post Card Styles
  modernPostCard: { backgroundColor: '#FFFFFF', borderRadius: 0, shadowColor: '#000000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2, marginBottom: 8, overflow: 'hidden', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#e0e0e0' },
  modernPostHeader: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingBottom: 16 },
  storyRing: { position: 'absolute', top: -2, left: -2, width: 52, height: 52, borderRadius: 26, borderWidth: 2, borderColor: '#7f1d1d' },
  modernPostTimestamp: { fontSize: 14, color: '#6B7280' },
  postMoreBtn: { padding: 8 },
  postContentContainer: { paddingHorizontal: 20, paddingBottom: 16 },
  modernPostContent: { fontSize: 16, color: '#111827', lineHeight: 24 },
  postImageContainer: { position: 'relative', marginBottom: 16, overflow: 'hidden' },
  modernPostImage: { width: '100%', height: 240, borderRadius: 0 },
  postImageActions: { position: 'absolute', top: 12, right: 12 },
  imageActionBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modernPostActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16 },
  postActionsLeft: { flexDirection: 'row', alignItems: 'center' },
  modernActionButton: { marginRight: 20, padding: 8 },
  bookmarkBtn: { padding: 8 },
  postStats: { paddingHorizontal: 20, paddingBottom: 20 },
  likesCount: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 4 },
  commentsLink: { fontSize: 14, color: '#6B7280' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  headerTextContainer: { flex: 1, marginLeft: 12 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  metaText: { fontSize: 13, color: '#6B7280', marginBottom: 2 },
  chip: { backgroundColor: '#fef2f2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  chipText: { color: '#7f1d1d', fontSize: 12, fontWeight: '500' },
  projectBadge: { backgroundColor: '#fef2f2' },
  projectBadgeText: { color: '#7f1d1d' },

  // Clean Event Card Styles
  cleanEventCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden'
  },
  eventMainContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16
  },
  eventDateBox: {
    backgroundColor: '#7f1d1d',
    borderRadius: 12,
    width: 50,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  eventDay: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold'
  },
  eventMonth: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600'
  },
  eventInfo: {
    flex: 1,
    marginRight: 8
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8
  },
  eventDetails: {
    gap: 4
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  eventDetailText: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1
  },
  bookmarkIcon: {
    padding: 4
  },
  eventImageSection: {
    position: 'relative',
    height: 120,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden'
  },
  eventImage: {
    width: '100%',
    height: '100%'
  },
  eventImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.3)'
  },
  joinEventButton: {
    backgroundColor: '#7f1d1d',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6
  },
  joinEventText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600'
  },
  eventTags: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8
  },
  eventTag: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FECACA'
  },
  eventTagText: {
    color: '#7f1d1d',
    fontSize: 12,
    fontWeight: '500'
  },

  // Clean Project Card Styles
  cleanProjectCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden'
  },
  projectMainContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16
  },
  projectIconBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#FECACA'
  },
  projectInfo: {
    flex: 1,
    marginRight: 8
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8
  },
  projectDetails: {
    gap: 4
  },
  projectDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  projectDetailText: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1
  },
  projectDescription: {
    paddingHorizontal: 16,
    paddingBottom: 16
  },
  projectDescriptionText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20
  },
  projectActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16
  },
  projectActionButton: {
    backgroundColor: '#7f1d1d',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6
  },
  projectActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600'
  },
  projectStats: {
    flexDirection: 'row',
    gap: 16
  },
  projectStatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  projectStatText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500'
  },
  projectTags: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8
  },
  projectTag: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FECACA'
  },
  projectTagText: {
    color: '#7f1d1d',
    fontSize: 12,
    fontWeight: '500'
  },

  // Clean Club Card Styles
  cleanClubCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden'
  },
  clubMainContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16
  },
  clubIconBox: {
    backgroundColor: '#7f1d1d',
    borderRadius: 12,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  clubInfo: {
    flex: 1,
    marginRight: 8
  },
  clubTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8
  },
  clubDetails: {
    gap: 4
  },
  clubDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  clubDetailText: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1
  },
  clubDescription: {
    paddingHorizontal: 16,
    paddingBottom: 16
  },
  clubDescriptionText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20
  },
  clubActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16
  },
  clubActionButton: {
    backgroundColor: '#7f1d1d',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6
  },
  clubActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600'
  },
  clubStats: {
    flexDirection: 'row',
    gap: 16
  },
  clubStatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  clubStatText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500'
  },
  clubTags: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8
  },
  clubTag: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FECACA'
  },
  clubTagText: {
    color: '#7f1d1d',
    fontSize: 12,
    fontWeight: '500'
  },
  media: { width: '100%', height: 160 },
  cardBody: { padding: 16 },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingVertical: 10 },
  
  // Loading Screen Styles
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFF2E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#7f1d1d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingSpinner: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7f1d1d',
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#d4a5a8',
    textAlign: 'center',
  },

  // Comments Modal Styles
  commentsModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  commentsModalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 0,
  },
  commentsModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  commentsModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7f1d1d',
  },
  commentsModalClose: {
    padding: 4,
  },
  commentsScrollView: {
    maxHeight: 400,
    paddingHorizontal: 20,
  },
  commentItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#7f1d1d',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  commentAvatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  commentContent: {
    flex: 1,
  },
  commentUser: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f1d1d',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: '#d4a5a8',
    lineHeight: 20,
    marginBottom: 4,
  },
  commentTimestamp: {
    fontSize: 12,
    color: '#d4a5a8',
  },
  noCommentsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noCommentsText: {
    fontSize: 16,
    color: '#d4a5a8',
    textAlign: 'center',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(127, 29, 29, 0.2)',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 100,
    fontSize: 14,
  },
  commentSendButton: {
    padding: 12,
    borderRadius: 20,
    backgroundColor: '#FFF2E8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  createGroupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  createGroupBackButton: {
    padding: 8,
    borderRadius: 8
  },
  createGroupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7f1d1d'
  },
  createGroupNextButton: {
    backgroundColor: '#7f1d1d',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8
  },
  createGroupNextButtonDisabled: {
    backgroundColor: '#D1D5DB',
    opacity: 0.6
  },
  createGroupNextButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600'
  },
  createGroupNextButtonTextDisabled: {
    color: '#9CA3AF'
  },
  createGroupContent: {
    flex: 1,
    padding: 20
  },
  createGroupSubtitle: {
    fontSize: 16,
    color: '#d4a5a8',
    marginBottom: 20
  },
  selectedMembersContainer: {
    marginBottom: 24
  },
  selectedMembersTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f1d1d',
    marginBottom: 12
  },
  selectedMembersList: {
    flexDirection: 'row',
    paddingHorizontal: 4
  },
  selectedMemberItem: {
    alignItems: 'center',
    marginRight: 16,
    position: 'relative'
  },
  selectedMemberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 4
  },
  selectedMemberName: {
    fontSize: 12,
    color: '#7f1d1d',
    textAlign: 'center',
    maxWidth: 60
  },
  removeMemberButton: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2
  },
  availableContactsList: {
    flex: 1
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#FEF2F2'
  },
  contactItemSelected: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA'
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  contactAvatarContainer: {
    position: 'relative',
    marginRight: 12
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20
  },
  onlineIndicatorShare: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF'
  },
  contactName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#7f1d1d'
  },
  selectionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center'
  },
  selectionIndicatorSelected: {
    backgroundColor: '#7f1d1d',
    borderColor: '#7f1d1d'
  },
  groupNameInputContainer: {
    marginBottom: 24
  },
  groupNameInput: {
    borderWidth: 1,
    borderColor: 'rgba(127, 29, 29, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#7f1d1d',
    backgroundColor: '#FFFFFF'
  },
  characterCount: {
    fontSize: 12,
    color: '#d4a5a8',
    textAlign: 'right',
    marginTop: 4
  },
  groupPreview: {
    marginTop: 24
  },
  groupPreviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7f1d1d',
    marginBottom: 12
  },
  groupPreviewCard: {
    backgroundColor: '#FFF2E8',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(127, 29, 29, 0.1)'
  },
  groupPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  groupPreviewAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  groupPreviewInfo: {
    flex: 1
  },
  groupPreviewName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7f1d1d',
    marginBottom: 2
  },
  groupPreviewMembers: {
    fontSize: 14,
    color: '#d4a5a8',
    marginTop: 4,
  },

  // Share Modal Styles
  shareModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  shareModalContainer: {
    backgroundColor: '#FFF2E8',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 34, // Safe area padding
  },
  shareModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  shareModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7f1d1d',
  },
  sharePostPreview: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sharePostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sharePostAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  sharePostUserInfo: {
    flex: 1,
  },
  sharePostUsername: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7f1d1d',
  },
  sharePostTime: {
    fontSize: 14,
    color: '#d4a5a8',
    marginTop: 2,
  },
  sharePostContent: {
    fontSize: 15,
    color: '#7f1d1d',
    lineHeight: 20,
  },
  shareOptionsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  shareSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7f1d1d',
    marginTop: 20,
    marginBottom: 12,
  },
  shareOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  shareOptionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  shareOptionIconContainer: {
    position: 'relative',
    marginRight: 12,
  },
  shareFriendAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  shareOnlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  shareOptionText: {
    flex: 1,
  },
  shareOptionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#7f1d1d',
  },
  shareOptionSubtitle: {
    fontSize: 14,
    color: '#d4a5a8',
    marginTop: 2,
  },

  // Advanced Share Modal Styles
  shareModalSendButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7f1d1d',
  },
  shareModalNextButton: {
    fontSize: 16,
    fontWeight: '500',
    color: '#d4a5a8',
  },
  shareSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  shareSearchIcon: {
    marginRight: 12,
  },
  shareSearchInput: {
    flex: 1,
    fontSize: 16,
    color: '#7f1d1d',
    paddingVertical: 8,
  },
  selectedProfilesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  selectedProfileItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 70,
  },
  selectedProfileAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 8,
  },
  selectedProfileRemove: {
    position: 'absolute',
    top: -2,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedProfileName: {
    fontSize: 12,
    color: '#7f1d1d',
    textAlign: 'center',
    maxWidth: 60,
  },
  profilesGridContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profilesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  profileGridItem: {
    width: '23%',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileGridItemSelected: {
    opacity: 0.8,
  },
  profileGridAvatarContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  profileGridAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profileGridOnlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileGridSelectedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 30,
    backgroundColor: 'rgba(153, 27, 27, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileGridName: {
    fontSize: 12,
    color: '#7f1d1d',
    textAlign: 'center',
    maxWidth: 70,
  },
});