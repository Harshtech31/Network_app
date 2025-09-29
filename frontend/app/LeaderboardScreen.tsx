import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import apiService from '../utils/apiService';

const { width: screenWidth } = Dimensions.get('window');

interface Contributor {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  profileImage?: string;
  department?: string;
  year?: number;
  rank: number;
  postCount: number;
  connectionCount: number;
  projectCount: number;
  score: number;
  // Legacy properties for compatibility
  avatar?: string;
  name?: string;
  title?: string;
  badgeColor?: string;
  badge?: string;
  posts?: number;
  likes?: number;
  collabs?: number;
}

export default function LeaderboardScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [leaderboardType, setLeaderboardType] = useState<'posts' | 'connections' | 'projects'>('posts');

  const topThree = contributors?.slice(0, 3) || [];

  useEffect(() => {
    loadLeaderboard();
  }, [leaderboardType]);

  const loadLeaderboard = async () => {
    try {
      setIsLoading(true);
      console.log('🏆 Loading leaderboard:', leaderboardType);
      
      const response = await apiService.get<any>(`/leaderboard?type=${leaderboardType}`);
      
      console.log('📊 API Response:', JSON.stringify(response, null, 2));
      
      if (response.success && response.data) {
        // Handle nested response structure: response.data.data.leaderboard
        let leaderboardData = [];
        
        if (response.data.leaderboard) {
          // Direct structure: response.data.leaderboard
          leaderboardData = response.data.leaderboard;
        } else if (response.data.data && response.data.data.leaderboard) {
          // Nested structure: response.data.data.leaderboard
          leaderboardData = response.data.data.leaderboard;
        } else if (Array.isArray(response.data)) {
          // Array directly in data
          leaderboardData = response.data;
        }
        
        console.log('📋 Extracted leaderboard data:', leaderboardData);
        
        if (Array.isArray(leaderboardData)) {
          setContributors(leaderboardData);
          console.log('✅ Leaderboard loaded:', leaderboardData.length, 'users');
        } else {
          console.log('⚠️ Leaderboard data is not an array:', typeof leaderboardData);
          setContributors([]);
        }
      } else {
        console.log('⚠️ No leaderboard data received or API failed');
        setContributors([]);
      }
    } catch (error) {
      console.error('❌ Error loading leaderboard:', error);
      Alert.alert('Error', 'Failed to load leaderboard');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToProfile = (contributor: Contributor) => {
    router.push({
      pathname: '/UserProfileScreen',
      params: {
        userId: contributor.id,
        userName: `${contributor.firstName} ${contributor.lastName}`,
        userAvatar: contributor.profileImage || ''
      }
    });
  };

  const getTotalScore = (contributor: Contributor) => {
    return contributor?.score || 0;
  };

  const renderPodiumSection = () => (
    <LinearGradient
      colors={['#7f1d1d', '#991b1b', '#FEF2F2']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.podiumContainer}
    >
      <Text style={styles.podiumTimer}>Ends in 20 23Hours</Text>
      
      <View style={styles.podiumStands}>
        {/* Second Place */}
        {contributors[1] && (
          <TouchableOpacity 
            style={styles.podiumPlace}
            onPress={() => navigateToProfile(contributors[1])}
          >
            <Image 
              source={{ uri: contributors[1]?.profileImage || `https://i.pravatar.cc/150?u=${contributors[1]?.id}` }} 
              style={styles.podiumAvatar} 
            />
            <Text style={styles.podiumName}>{contributors[1]?.firstName || 'User'}</Text>
            <View style={styles.scoreChip}>
              <Text style={styles.scoreText}>{getTotalScore(contributors[1])}</Text>
            </View>
            <View style={styles.podiumNumber}>
              <Text style={styles.podiumNumberText}>2</Text>
            </View>
          </TouchableOpacity>
        )}
        
        {/* First Place */}
        {contributors[0] && (
          <TouchableOpacity 
            style={[styles.podiumPlace, styles.firstPlace]}
            onPress={() => navigateToProfile(contributors[0])}
          >
            <Image 
              source={{ uri: contributors[0]?.profileImage || `https://i.pravatar.cc/150?u=${contributors[0]?.id}` }} 
              style={styles.podiumAvatar} 
            />
            <Text style={styles.podiumName}>{contributors[0]?.firstName || 'User'}</Text>
            <View style={styles.scoreChip}>
              <Text style={styles.scoreText}>{getTotalScore(contributors[0])}</Text>
            </View>
            <View style={styles.podiumNumber}>
              <Text style={styles.podiumNumberText}>1</Text>
            </View>
          </TouchableOpacity>
        )}
        
        {/* Third Place */}
        {contributors[2] && (
          <TouchableOpacity 
            style={styles.podiumPlace}
            onPress={() => navigateToProfile(contributors[2])}
          >
            <Image 
              source={{ uri: contributors[2]?.profileImage || `https://i.pravatar.cc/150?u=${contributors[2]?.id}` }} 
              style={styles.podiumAvatar} 
            />
            <Text style={styles.podiumName}>{contributors[2]?.firstName || 'User'}</Text>
            <View style={styles.scoreChip}>
              <Text style={styles.scoreText}>{getTotalScore(contributors[2])}</Text>
            </View>
            <View style={styles.podiumNumber}>
              <Text style={styles.podiumNumberText}>3</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </LinearGradient>
  );

  const renderContributorCard = ({ item: contributor }: { item: Contributor }) => (
    <View style={styles.contributorCardWrapper}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollableCardContent}
      >
        <TouchableOpacity 
          style={styles.contributorCard}
          onPress={() => navigateToProfile(contributor)}
          activeOpacity={0.95}
        >
          {/* Position Icon */}
          <View style={styles.positionIconContainer}>
            {contributor.rank === 1 && <Ionicons name="trophy" size={20} color="#F59E0B" />}
            {contributor.rank === 2 && <Ionicons name="medal" size={20} color="#6B7280" />}
            {contributor.rank === 3 && <Ionicons name="medal" size={20} color="#CD7C2F" />}
            {contributor.rank > 3 && <Ionicons name="star-outline" size={20} color="#9CA3AF" />}
          </View>
          
          {/* Profile Picture */}
          <View style={styles.avatarContainer}>
            <Image 
              source={{ 
                uri: contributor.profileImage || contributor.avatar || `https://i.pravatar.cc/150?u=${contributor.id}` 
              }} 
              style={styles.avatar} 
            />
          </View>
          
          {/* Name and Title */}
          <View style={styles.nameSection}>
            <Text style={styles.contributorName}>
              {contributor.name || `${contributor.firstName} ${contributor.lastName}`}
            </Text>
            <Text style={styles.contributorRole}>
              {contributor.title || contributor.department || 'Student'}
            </Text>
          </View>
          
          {/* Stats Count */}
          <View style={styles.statsCount}>
            <Text style={styles.totalScore}>{getTotalScore(contributor)}</Text>
            <Text style={styles.scoreLabel}>Total Score</Text>
          </View>
          
          {/* Achievement Badge */}
          <View style={[styles.badge, { backgroundColor: contributor.badgeColor || '#7f1d1d' }]}>
            <Text style={styles.badgeLabel}>{contributor.badge || `#${contributor.rank}`}</Text>
          </View>
          
          {/* Additional Stats - Now visible with horizontal scroll */}
          <View style={styles.additionalStats}>
            <View style={styles.additionalStatItem}>
              <Text style={styles.additionalStatNumber}>
                {contributor.posts || contributor.postCount || 0}
              </Text>
              <Text style={styles.additionalStatLabel}>Posts</Text>
            </View>
            <View style={styles.additionalStatItem}>
              <Text style={styles.additionalStatNumber}>
                {contributor.likes || contributor.connectionCount || 0}
              </Text>
              <Text style={styles.additionalStatLabel}>Connections</Text>
            </View>
            <View style={styles.additionalStatItem}>
              <Text style={styles.additionalStatNumber}>
                {contributor.collabs || contributor.projectCount || 0}
              </Text>
              <Text style={styles.additionalStatLabel}>Projects</Text>
            </View>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );


  const renderTopThreeSection = () => (
    <LinearGradient
      colors={['#7f1d1d', '#991b1b', '#FEF2F2']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.topThreeContainer}
    >
      <View style={styles.topThreeHeader}>
        <Ionicons name="trophy" size={24} color="#FFFFFF" />
        <Text style={styles.topThreeTitle}>This Month's Top 3</Text>
      </View>
      
      <View style={styles.topThreeList}>
        {topThree.map((contributor, index) => (
          <TouchableOpacity 
            key={contributor.id}
            style={styles.topThreeItem}
            onPress={() => navigateToProfile(contributor)}
          >
            <View style={styles.topThreeAvatar}>
              <Image 
                source={{ 
                  uri: contributor.profileImage || contributor.avatar || `https://i.pravatar.cc/150?u=${contributor.id}` 
                }} 
                style={styles.topThreeAvatarImage} 
              />
              <View style={[styles.topThreeRank, { backgroundColor: index === 0 ? '#F59E0B' : index === 1 ? '#6B7280' : '#CD7C2F' }]}>
                <Text style={styles.topThreeRankText}>{index + 1}</Text>
              </View>
            </View>
            <Text style={styles.topThreeName}>
              {contributor.name || `${contributor.firstName} ${contributor.lastName}`}
            </Text>
            <Text style={styles.topThreeStats}>
              {contributor.posts || contributor.postCount || 0} posts • {contributor.likes || contributor.connectionCount || 0} connections
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </LinearGradient>
  );


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Simple Header */}
      <View style={styles.simpleHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#7f1d1d" />
        </TouchableOpacity>
        <Text style={styles.simpleHeaderTitle}>Leaderboard</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Leaderboard Type Selector */}
      <View style={styles.typeSelector}>
        {(['posts', 'connections', 'projects'] as const).map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.typeButton,
              leaderboardType === type && styles.activeTypeButton
            ]}
            onPress={() => setLeaderboardType(type)}
          >
            <Text style={[
              styles.typeButtonText,
              leaderboardType === type && styles.activeTypeButtonText
            ]}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7f1d1d" />
          <Text style={styles.loadingMessage}>Loading leaderboard...</Text>
        </View>
      ) : contributors.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="trophy-outline" size={64} color="#7f1d1d" />
          <Text style={styles.emptyTitle}>No Rankings Yet</Text>
          <Text style={styles.emptyMessage}>Be the first to contribute and climb the leaderboard!</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Podium Section */}
          {contributors.length >= 3 && renderPodiumSection()}

          {/* Top 3 Section */}
          {renderTopThreeSection()}

          {/* All Contributors List */}
          <View style={styles.allContributorsContainer}>
            <Text style={styles.sectionTitle}>All Contributors</Text>
            <FlatList
              data={contributors}
              renderItem={renderContributorCard}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF2E8',
  },
  simpleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 43,
    backgroundColor: '#FFF2E8',
    borderBottomWidth: 1,
    borderBottomColor: '#FECACA',
  },
  backButton: {
    padding: 8,
  },
  simpleHeaderTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#7f1d1d',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  podiumContainer: {
    marginHorizontal: 0,
    marginBottom: 0,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  podiumTimer: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'left',
    marginBottom: 30,
    fontWeight: '500',
  },
  podiumStands: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
  },
  podiumPlace: {
    alignItems: 'center',
    position: 'relative',
  },
  firstPlace: {
    marginBottom: 0,
  },
  podiumAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 8,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  podiumName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  scoreChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
    marginBottom: 12,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  podiumNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  podiumNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7f1d1d',
  },
  cardsContainer: {
    backgroundColor: '#F9FAFB',
    paddingTop: 20,
  },
  cardsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  contributorCardWrapper: {
    marginBottom: 12,
  },
  scrollableCardContent: {
    paddingRight: 20,
  },
  contributorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#FECACA',
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 600,
  },
  positionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  rankIcon: {
    fontSize: 16,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 48,
    marginBottom: 16,
  },
  cardAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  userDetails: {
    flex: 1,
  },
  cardName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7f1d1d',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  achievementBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  topThreeContainer: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
  },
  topThreeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 8,
  },
  topThreeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  topThreeList: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  topThreeItem: {
    alignItems: 'center',
    flex: 1,
  },
  topThreeAvatar: {
    position: 'relative',
    marginBottom: 12,
  },
  topThreeAvatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  topThreeRank: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  topThreeRankText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  topThreeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  topThreeStats: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingMessage: {
    marginTop: 16,
    fontSize: 16,
    color: '#7f1d1d',
    fontWeight: '500',
  },
  loadingText: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  userCardDesktop: {
    maxWidth: 600,
    alignSelf: 'center',
  },
  topThreeCard: {
    backgroundColor: '#fef2f2',
    borderWidth: 2,
    borderColor: '#FECACA',
  },
  userCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  userAvatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
  },
  rankBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userBadge: {
    position: 'absolute',
    bottom: -8,
    left: -8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 60,
  },
  userBadgeText: {
    fontSize: 8,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  userTitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  rankNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#7f1d1d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  topThreeDesktopItem: {
    alignItems: 'center',
    flex: 1,
    maxWidth: 200,
  },
  topThreeScrollContainer: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  topThreeScroll: {
    flexGrow: 0,
  },
  // All Users Section
  allUsersContainer: {
    backgroundColor: '#FFFFFF',
    paddingTop: 24,
  },
  allUsersTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  usersList: {
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7f1d1d',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  horizontalList: {
    paddingHorizontal: 20,
  },
  bottomSpacing: {
    paddingBottom: 100,
  },
  // New Contributor Card Styles
  allContributorsContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  duplicateContributorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F3F4F6',
  },
  rankText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  nameSection: {
    flex: 1,
    marginRight: 12,
  },
  contributorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7f1d1d',
    marginBottom: 2,
  },
  contributorRole: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  statsCount: {
    alignItems: 'center',
    marginRight: 12,
    minWidth: 60,
  },
  totalScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7f1d1d',
    marginBottom: 2,
  },
  scoreLabel: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    minWidth: 50,
  },
  badgeLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  additionalStats: {
    flexDirection: 'row',
    marginLeft: 16,
    gap: 16,
  },
  additionalStatItem: {
    alignItems: 'center',
    minWidth: 50,
  },
  additionalStatNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7f1d1d',
  },
  additionalStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  contributorTitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  leaderboardRankBadge: {
    backgroundColor: '#7f1d1d',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  leaderboardRankText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  typeSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF2E8',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeTypeButton: {
    backgroundColor: '#7f1d1d',
    borderColor: '#7f1d1d',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTypeButtonText: {
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7f1d1d',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});
