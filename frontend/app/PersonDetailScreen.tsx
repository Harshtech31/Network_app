import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function PersonDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Mock person data - in real app this would come from API based on params.id
  const person = {
    id: Array.isArray(params.id) ? params.id[0] : params.id || '1',
    name: Array.isArray(params.name) ? params.name[0] : params.name || 'Sarah Chen',
    field: Array.isArray(params.field) ? params.field[0] : params.field || 'Senior Software Engineer at Google',
    location: 'San Francisco, CA',
    connections: '500+',
    mutualConnections: 12,
    about: 'Passionate software engineer with 8+ years of experience building scalable web applications. Love working with React, Node.js, and cloud technologies. Always excited to connect with fellow developers and share knowledge.',
    experience: [
      {
        title: 'Senior Software Engineer',
        company: 'Google',
        duration: '2021 - Present',
        description: 'Leading frontend development for Google Cloud Console, managing a team of 5 engineers.'
      },
      {
        title: 'Software Engineer',
        company: 'Facebook',
        duration: '2019 - 2021',
        description: 'Developed key features for Facebook Marketplace using React and GraphQL.'
      },
      {
        title: 'Junior Developer',
        company: 'Startup Inc.',
        duration: '2017 - 2019',
        description: 'Full-stack development using MERN stack for various client projects.'
      }
    ],
    education: [
      {
        degree: 'Master of Computer Science',
        school: 'Stanford University',
        year: '2017'
      },
      {
        degree: 'Bachelor of Computer Science',
        school: 'UC Berkeley',
        year: '2015'
      }
    ],
    skills: ['React', 'Node.js', 'TypeScript', 'Python', 'AWS', 'GraphQL', 'MongoDB', 'Docker'],
    posts: 45,
    followers: 1250,
    following: 890
  };

  const navigateToFollowers = () => {
    router.push({
      pathname: '/FollowersScreen',
      params: {
        type: 'followers',
        userName: person.name,
        count: person.followers.toString()
      }
    });
  };

  const navigateToFollowing = () => {
    router.push({
      pathname: '/FollowersScreen',
      params: {
        type: 'following',
        userName: person.name,
        count: person.following.toString()
      }
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.coverPhoto}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: `https://ui-avatars.com/api/?name=${person.name}&size=120&background=8B1A1A&color=fff&bold=true` }}
              style={styles.profileImage}
            />
          </View>
        </View>
        
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{person.name}</Text>
          <Text style={styles.field}>{person.field}</Text>
          <Text style={styles.location}>
            <Ionicons name="location-outline" size={16} color="#6B7280" />
            {' '}{person.location}
          </Text>
          <Text style={styles.connections}>
            {person.connections} connections • {person.mutualConnections} mutual
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.connectButton}>
            <Ionicons name="person-add" size={18} color="#FFFFFF" />
            <Text style={styles.connectButtonText}>Connect</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.messageButton}>
            <Ionicons name="chatbubble-outline" size={18} color="#8B1A1A" />
            <Text style={styles.messageButtonText}>Message</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{person.posts}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <TouchableOpacity style={styles.statItem} onPress={navigateToFollowers}>
            <Text style={styles.statNumber}>{person.followers}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statItem} onPress={navigateToFollowing}>
            <Text style={styles.statNumber}>{person.following}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.aboutText}>{person.about}</Text>
      </View>

      {/* Experience Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Experience</Text>
        {person.experience.map((exp, index) => (
          <View key={index} style={styles.experienceItem}>
            <View style={styles.expHeader}>
              <Text style={styles.expTitle}>{exp.title}</Text>
              <Text style={styles.expDuration}>{exp.duration}</Text>
            </View>
            <Text style={styles.expCompany}>{exp.company}</Text>
            <Text style={styles.expDescription}>{exp.description}</Text>
          </View>
        ))}
      </View>

      {/* Education Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Education</Text>
        {person.education.map((edu, index) => (
          <View key={index} style={styles.educationItem}>
            <Text style={styles.eduDegree}>{edu.degree}</Text>
            <Text style={styles.eduSchool}>{edu.school}</Text>
            <Text style={styles.eduYear}>{edu.year}</Text>
          </View>
        ))}
      </View>

      {/* Skills Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Skills</Text>
        <View style={styles.skillsContainer}>
          {person.skills.map((skill, index) => (
            <View key={index} style={styles.skillChip}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF2E8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  coverPhoto: {
    height: 120,
    backgroundColor: '#7f1d1d',
    position: 'relative',
  },
  profileImageContainer: {
    position: 'absolute',
    bottom: -40,
    left: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  field: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  location: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  connections: {
    fontSize: 14,
    color: '#7f1d1d',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  connectButton: {
    flex: 1,
    backgroundColor: '#7f1d1d',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  messageButton: {
    flex: 1,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#8B1A1A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  messageButtonText: {
    color: '#7f1d1d',
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  aboutText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  experienceItem: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  expHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  expTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  expDuration: {
    fontSize: 12,
    color: '#6B7280',
  },
  expCompany: {
    fontSize: 14,
    color: '#7f1d1d',
    fontWeight: '500',
    marginBottom: 8,
  },
  expDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  educationItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  eduDegree: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  eduSchool: {
    fontSize: 14,
    color: '#7f1d1d',
    fontWeight: '500',
    marginBottom: 2,
  },
  eduYear: {
    fontSize: 12,
    color: '#6B7280',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  skillText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
});