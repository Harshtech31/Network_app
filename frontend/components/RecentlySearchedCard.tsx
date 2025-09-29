import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Person {
  name: string;
  handle: string;
  field: string;
  location: string;
  rating: number;
  projects: number;
  collaborations: number;
  gpa: string;
}

interface RecentlySearchedCardProps {
  person: Person;
}

const RecentlySearchedCard: React.FC<RecentlySearchedCardProps> = ({ person }) => {
  return (
    <TouchableOpacity style={styles.card} accessibilityLabel={`View ${person.name}'s profile`}>
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=faces' }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{person.name}</Text>
            <Text style={styles.handle}>{person.handle}</Text>
            <View style={styles.metaRow}>
              <Ionicons name="school-outline" size={12} color="#6B7280" />
              <Text style={styles.field}>{person.field}</Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={12} color="#6B7280" />
              <Text style={styles.location}>{person.location}</Text>
            </View>
          </View>
        </View>
        <View style={styles.statusContainer}>
          <View style={styles.availableTag}>
            <Text style={styles.availableText}>Available</Text>
          </View>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color="#FFB800" />
            <Text style={styles.rating}>{person.rating}</Text>
          </View>
        </View>
      </View>
      
      <Text style={styles.bio}>
        Passionate about AI/ML and full-stack development. Love working on innovative projects.
      </Text>
      
      <View style={styles.skillsContainer}>
        {['Python', 'React', 'Machine Learning', 'Data Science'].map((skill) => (
          <View key={skill} style={styles.skillTag}>
            <Text style={styles.skillText}>{skill}</Text>
          </View>
        ))}
      </View>
      
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ionicons name="briefcase-outline" size={14} color="#6B7280" />
          <Text style={styles.statText}>{person.projects} projects</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="people-outline" size={14} color="#6B7280" />
          <Text style={styles.statText}>{person.collaborations} collaborations</Text>
        </View>
        <Text style={styles.gpa}>GPA: {person.gpa}</Text>
      </View>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.messageButton} accessibilityLabel="Send message">
          <Ionicons name="chatbubble-outline" size={16} color="#FFFFFF" />
          <Text style={styles.messageButtonText}>Message</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.connectButton} accessibilityLabel="Connect">
          <Ionicons name="person-add-outline" size={16} color="#991B1B" />
          <Text style={styles.connectButtonText}>Connect</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  profileSection: {
    flexDirection: 'row',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 2,
  },
  handle: {
    fontSize: 14,
    color: '#991B1B',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  field: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  location: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  availableTag: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 4,
  },
  availableText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    color: '#111111',
    marginLeft: 2,
    fontWeight: '500',
  },
  bio: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  skillTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 4,
  },
  skillText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  gpa: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 'auto',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  messageButton: {
    backgroundColor: '#991B1B',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
  },
  messageButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  connectButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#991B1B',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
  },
  connectButtonText: {
    color: '#991B1B',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default RecentlySearchedCard;
