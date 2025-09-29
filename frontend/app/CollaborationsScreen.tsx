import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface Collaboration {
  id: string;
  title: string;
  type: 'project' | 'event';
  description: string;
  status: 'active' | 'completed' | 'upcoming';
  collaborators: number;
  role: string;
  startDate: string;
  endDate?: string;
  image?: string;
  tags: string[];
}

export default function CollaborationsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [filteredCollaborations, setFilteredCollaborations] = useState<Collaboration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'project' | 'event'>('all');

  // Mock collaborations data
  const mockCollaborations: Collaboration[] = [
    {
      id: '1',
      title: 'AI Study Group Platform',
      type: 'project',
      description: 'Building a collaborative platform for AI/ML students to share resources and study together.',
      status: 'active',
      collaborators: 5,
      role: 'Lead Developer',
      startDate: 'Jan 2024',
      image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=200&fit=crop',
      tags: ['React', 'Node.js', 'AI/ML']
    },
    {
      id: '2',
      title: 'Tech Innovation Summit 2024',
      type: 'event',
      description: 'Organizing the annual tech summit featuring industry leaders and student presentations.',
      status: 'upcoming',
      collaborators: 12,
      role: 'Event Coordinator',
      startDate: 'Mar 2024',
      endDate: 'Mar 2024',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=200&fit=crop',
      tags: ['Event Management', 'Networking']
    },
    {
      id: '3',
      title: 'Sustainable Campus Initiative',
      type: 'project',
      description: 'Developing IoT solutions to monitor and reduce campus energy consumption.',
      status: 'completed',
      collaborators: 8,
      role: 'IoT Developer',
      startDate: 'Sep 2023',
      endDate: 'Dec 2023',
      image: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=400&h=200&fit=crop',
      tags: ['IoT', 'Sustainability', 'Arduino']
    },
    {
      id: '4',
      title: 'Hackathon 2024: Future of Work',
      type: 'event',
      description: 'Co-organizing a 48-hour hackathon focused on workplace innovation and remote collaboration tools.',
      status: 'active',
      collaborators: 6,
      role: 'Technical Lead',
      startDate: 'Feb 2024',
      endDate: 'Feb 2024',
      image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=200&fit=crop',
      tags: ['Hackathon', 'Innovation']
    },
    {
      id: '5',
      title: 'Mobile Learning App',
      type: 'project',
      description: 'Creating a cross-platform mobile app for personalized learning experiences.',
      status: 'active',
      collaborators: 4,
      role: 'Mobile Developer',
      startDate: 'Nov 2023',
      image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=200&fit=crop',
      tags: ['React Native', 'Education', 'Mobile']
    }
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setCollaborations(mockCollaborations);
      setFilteredCollaborations(mockCollaborations);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = collaborations;

    // Filter by type
    if (activeFilter !== 'all') {
      filtered = filtered.filter(collab => collab.type === activeFilter);
    }

    // Filter by search query
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(collab =>
        collab.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        collab.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        collab.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredCollaborations(filtered);
  }, [searchQuery, collaborations, activeFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'completed': return '#6B7280';
      case 'upcoming': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'completed': return 'Completed';
      case 'upcoming': return 'Upcoming';
      default: return status;
    }
  };

  const navigateToDetail = (collaboration: Collaboration) => {
    if (collaboration.type === 'project') {
      router.push({
        pathname: '/ProjectDetailScreen',
        params: {
          id: collaboration.id,
          title: collaboration.title
        }
      });
    } else {
      router.push({
        pathname: '/EventDetailScreen',
        params: {
          id: collaboration.id,
          title: collaboration.title
        }
      });
    }
  };

  const renderCollaborationItem = ({ item }: { item: Collaboration }) => (
    <TouchableOpacity 
      style={styles.collaborationItem}
      onPress={() => navigateToDetail(item)}
      activeOpacity={0.7}
    >
      {item.image && (
        <Image source={{ uri: item.image }} style={styles.collaborationImage} />
      )}
      
      <View style={styles.collaborationContent}>
        <View style={styles.collaborationHeader}>
          <View style={styles.titleRow}>
            <Text style={styles.collaborationTitle} numberOfLines={2}>{item.title}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
            </View>
          </View>
          
          <View style={styles.typeRow}>
            <View style={styles.typeBadge}>
              <Ionicons 
                name={item.type === 'project' ? 'code-outline' : 'calendar-outline'} 
                size={12} 
                color="#991B1B" 
              />
              <Text style={styles.typeText}>{item.type === 'project' ? 'Project' : 'Event'}</Text>
            </View>
            <Text style={styles.roleText}>{item.role}</Text>
          </View>
        </View>

        <Text style={styles.collaborationDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.collaborationMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={14} color="#6B7280" />
            <Text style={styles.metaText}>{item.collaborators} collaborators</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
            <Text style={styles.metaText}>
              {item.startDate}{item.endDate ? ` - ${item.endDate}` : ''}
            </Text>
          </View>
        </View>

        <View style={styles.tagsContainer}>
          {item.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
          {item.tags.length > 3 && (
            <Text style={styles.moreTagsText}>+{item.tags.length - 3} more</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#7f1d1d" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Collaborations</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7f1d1d" />
          <Text style={styles.loadingText}>Loading collaborations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#7f1d1d" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Collaborations</Text>
          <Text style={styles.headerSubtitle}>{collaborations.length} collaborations</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#7f1d1d" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search collaborations..."
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

      <View style={styles.filterContainer}>
        {(['all', 'project', 'event'] as const).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterButton, activeFilter === filter && styles.activeFilterButton]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text style={[styles.filterText, activeFilter === filter && styles.activeFilterText]}>
              {filter === 'all' ? 'All' : filter === 'project' ? 'Projects' : 'Events'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredCollaborations}
        renderItem={renderCollaborationItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'No results found' : 'No collaborations yet'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery 
                ? 'Try searching for different keywords'
                : 'Start collaborating on projects and events'
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
    borderBottomColor: '#FECACA',
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
    color: '#7f1d1d',
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF2E8',
    borderBottomWidth: 1,
    borderBottomColor: '#FECACA',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#FEF2F2',
  },
  activeFilterButton: {
    backgroundColor: '#7f1d1d',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7f1d1d',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
  },
  collaborationItem: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  collaborationImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  collaborationContent: {
    padding: 16,
  },
  collaborationHeader: {
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  collaborationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7f1d1d',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  typeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF2E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#7f1d1d',
    marginLeft: 4,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  collaborationDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  collaborationMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  tag: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 11,
    color: '#7f1d1d',
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 11,
    color: '#7f1d1d',
    fontWeight: '500',
  },
  separator: {
    height: 8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#7f1d1d',
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
    color: '#7f1d1d',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});
