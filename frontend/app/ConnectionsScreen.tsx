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
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface Connection {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio?: string;
  isConnected: boolean;
  isVerified?: boolean;
  mutualConnections?: number;
  field?: string;
  userType: 'student' | 'teacher' | 'alumni';
  department?: string; // For students
  qualification?: string; // For teachers
  jobProfession?: string; // For alumni
}

export default function ConnectionsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [connections, setConnections] = useState<Connection[]>([]);
  const [filteredConnections, setFilteredConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock connections data with different user types
  const mockConnections: Connection[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      username: 'sarah.j',
      avatar: 'https://i.pravatar.cc/150?u=sarah',
      bio: 'Computer Science Student',
      isConnected: true,
      isVerified: true,
      mutualConnections: 12,
      userType: 'student',
      department: 'Computer Science',
      field: 'Computer Science'
    },
    {
      id: '2',
      name: 'Michael Chen',
      username: 'mike_chen',
      avatar: 'https://i.pravatar.cc/150?u=michael',
      bio: 'Mechanical Engineering Student',
      isConnected: true,
      mutualConnections: 8,
      userType: 'student',
      department: 'Mechanical Engineering',
      field: 'Mechanical Engineering'
    },
    {
      id: '3',
      name: 'Dr. Emma Wilson',
      username: 'emma.w',
      avatar: 'https://i.pravatar.cc/150?u=emma',
      bio: 'Data Science Professor',
      isConnected: true,
      isVerified: true,
      mutualConnections: 15,
      userType: 'teacher',
      qualification: 'PhD in Data Science',
      field: 'Data Science'
    },
    {
      id: '4',
      name: 'David Rodriguez',
      username: 'david_r',
      avatar: 'https://i.pravatar.cc/150?u=david',
      bio: 'Alumni - Class of 2018',
      isConnected: true,
      mutualConnections: 5,
      userType: 'alumni',
      jobProfession: 'Startup Founder',
      field: 'Entrepreneurship'
    },
    {
      id: '5',
      name: 'Lisa Park',
      username: 'lisa.park',
      avatar: 'https://i.pravatar.cc/150?u=lisa',
      bio: 'Alumni - Class of 2020',
      isConnected: true,
      mutualConnections: 20,
      userType: 'alumni',
      jobProfession: 'Marketing Manager at Meta',
      field: 'Marketing'
    },
    {
      id: '6',
      name: 'Prof. James Thompson',
      username: 'james_t',
      avatar: 'https://i.pravatar.cc/150?u=james',
      bio: 'Software Engineering Professor',
      isConnected: true,
      isVerified: true,
      mutualConnections: 3,
      userType: 'teacher',
      qualification: 'PhD in Software Engineering',
      field: 'Software Engineering'
    },
    {
      id: '7',
      name: 'Alex Kumar',
      username: 'alex_k',
      avatar: 'https://i.pravatar.cc/150?u=alex',
      bio: 'Electrical Engineering Student',
      isConnected: true,
      mutualConnections: 9,
      userType: 'student',
      department: 'Electrical Engineering',
      field: 'Electrical Engineering'
    }
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setConnections(mockConnections);
      setFilteredConnections(mockConnections);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredConnections(connections);
    } else {
      const filtered = connections.filter(connection =>
        connection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        connection.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        connection.field?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredConnections(filtered);
    }
  }, [searchQuery, connections]);

  const navigateToProfile = (connection: Connection) => {
    router.push({
      pathname: '/UserProfileScreen',
      params: {
        userId: connection.id,
        userName: connection.name,
        userAvatar: connection.avatar
      }
    });
  };

  const renderConnectionItem = ({ item }: { item: Connection }) => (
    <TouchableOpacity 
      style={styles.connectionItem}
      onPress={() => navigateToProfile(item)}
      activeOpacity={0.7}
    >
      <View style={styles.connectionInfo}>
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
              <Ionicons name="checkmark-circle" size={16} color="#7f1d1d" style={styles.verifiedIcon} />
            )}
          </View>
          <Text style={styles.userHandle} numberOfLines={1}>@{item.username}</Text>
          {/* Display appropriate field based on user type */}
          {item.userType === 'student' && item.department && (
            <Text style={styles.userField} numberOfLines={1}>{item.department}</Text>
          )}
          {item.userType === 'teacher' && item.qualification && (
            <Text style={styles.userField} numberOfLines={1}>{item.qualification}</Text>
          )}
          {item.userType === 'alumni' && item.jobProfession && (
            <Text style={styles.userField} numberOfLines={1}>{item.jobProfession}</Text>
          )}
          {item.bio && (
            <Text style={styles.userBio} numberOfLines={1}>{item.bio}</Text>
          )}
          {item.mutualConnections && item.mutualConnections > 0 && (
            <Text style={styles.mutualConnections}>
              {item.mutualConnections} mutual connections
            </Text>
          )}
        </View>
      </View>

      <TouchableOpacity 
        style={styles.messageButton}
        onPress={() => router.push(`/chat/${item.id}`)}
      >
        <Ionicons name="chatbubble-outline" size={20} color="#7f1d1d" />
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
          <Text style={styles.headerTitle}>Connections</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7f1d1d" />
          <Text style={styles.loadingText}>Loading connections...</Text>
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
          <Text style={styles.headerTitle}>Connections</Text>
          <Text style={styles.headerSubtitle}>{connections.length} connections</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#7f1d1d" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search connections..."
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
        data={filteredConnections}
        renderItem={renderConnectionItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.listContent, { paddingBottom: 100 }]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'No results found' : 'No connections yet'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery 
                ? 'Try searching for a different name or field'
                : 'Start connecting with people to build your network'
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
    backgroundColor: '#FFF2E8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 39,
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
    color: '#7f1d1d',
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
    backgroundColor: '#FFF2E8',
    borderBottomWidth: 1,
    borderBottomColor: '#FECACA',
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
  connectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF2E8',
  },
  connectionInfo: {
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
    backgroundColor: '#7f1d1d',
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
    color: '#7f1d1d',
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
  userField: {
    fontSize: 13,
    color: '#7f1d1d',
    fontWeight: '500',
    marginBottom: 2,
  },
  userBio: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  mutualConnections: {
    fontSize: 12,
    color: '#7f1d1d',
    fontWeight: '500',
  },
  messageButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FFF2E8',
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
    color: '#7f1d1d',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});
