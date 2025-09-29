import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ShareService } from '../utils/ShareService';

export default function EventDetailScreen() {
  const router = useRouter();
  const { id, title, date, location } = useLocalSearchParams<{
    id: string;
    title?: string;
    date?: string;
    location?: string;
  }>();

  const [isRegistered, setIsRegistered] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [attendeeCount, setAttendeeCount] = useState(156);

  // Mock event data
  const eventData = {
    id: id || '1',
    title: title || 'AI & Machine Learning Workshop',
    description: 'Join us for an intensive workshop covering the latest developments in artificial intelligence and machine learning. Perfect for students and professionals looking to enhance their skills.',
    date: date || 'March 15, 2024',
    time: '2:00 PM - 6:00 PM',
    location: location || 'Innovation Hub, Room 301',
    organizer: {
      name: 'Tech Society',
      avatar: 'https://i.pravatar.cc/150?u=techsociety',
      verified: true,
    },
    category: 'Technology',
    price: 'Free',
    requirements: [
      'Basic programming knowledge',
      'Laptop with Python installed',
      'Enthusiasm to learn!',
    ],
    agenda: [
      { time: '2:00 PM', topic: 'Introduction to AI/ML' },
      { time: '2:30 PM', topic: 'Hands-on Python Workshop' },
      { time: '4:00 PM', topic: 'Break & Networking' },
      { time: '4:30 PM', topic: 'Advanced ML Techniques' },
      { time: '5:30 PM', topic: 'Q&A Session' },
    ],
    tags: ['AI', 'Machine Learning', 'Python', 'Workshop'],
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=200&fit=crop',
  };

  const handleRegister = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (isRegistered) {
        setIsRegistered(false);
        setAttendeeCount(prev => prev - 1);
        Alert.alert('Unregistered', 'You have been unregistered from this event.');
      } else {
        setIsRegistered(true);
        setAttendeeCount(prev => prev + 1);
        Alert.alert('Success!', 'You have been registered for this event. Check your email for confirmation.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    Alert.alert(
      isBookmarked ? 'Removed from Bookmarks' : 'Bookmarked',
      isBookmarked ? 'Event removed from your bookmarks.' : 'Event saved to your bookmarks.'
    );
  };

  const handleShare = async () => {
    try {
      const shareSuccess = await ShareService.shareEvent({
        id: eventData.id,
        title: eventData.title,
        date: eventData.date,
        location: eventData.location,
      });
      
      if (shareSuccess) {
        console.log('Event shared successfully');
      }
    } catch (error) {
      console.error('Error sharing event:', error);
      Alert.alert('Error', 'Failed to share event. Please try again.');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#7f1d1d" />
      
      {/* Modern Header with Gradient */}
      <LinearGradient colors={['#7f1d1d', '#b91c1c']} style={styles.modernHeader}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.modernBackButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.modernHeaderTitle}>Event Details</Text>
          <TouchableOpacity
            style={styles.modernShareButton}
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image Card */}
        <View style={styles.heroCard}>
          <Image source={{ uri: eventData.image }} style={styles.heroImage} />
          <View style={styles.heroOverlay}>
            <TouchableOpacity onPress={handleBookmark} style={styles.modernBookmarkButton}>
              <Ionicons 
                name={isBookmarked ? "bookmark" : "bookmark-outline"} 
                size={24} 
                color={isBookmarked ? "#7f1d1d" : "#FFFFFF"} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content Card */}
        <View style={styles.mainContentCard}>
          {/* Event Header */}
          <View style={styles.eventHeader}>
            <View style={styles.titleSection}>
              <Text style={styles.modernEventTitle}>{eventData.title}</Text>
              <View style={styles.modernCategoryBadge}>
                <Text style={styles.modernCategoryText}>{eventData.category}</Text>
              </View>
            </View>
            
            <View style={styles.modernOrganizerInfo}>
              <Image source={{ uri: eventData.organizer.avatar }} style={styles.modernOrganizerAvatar} />
              <View style={styles.modernOrganizerDetails}>
                <View style={styles.modernOrganizerNameRow}>
                  <Text style={styles.modernOrganizerName}>{eventData.organizer.name}</Text>
                  {eventData.organizer.verified && (
                    <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  )}
                </View>
                <Text style={styles.modernOrganizerRole}>Event Organizer</Text>
              </View>
            </View>

            {/* Event Details Grid */}
            <View style={styles.modernEventDetails}>
              <View style={styles.modernDetailCard}>
                <View style={styles.modernDetailIcon}>
                  <Ionicons name="calendar-outline" size={20} color="#7f1d1d" />
                </View>
                <View style={styles.modernDetailContent}>
                  <Text style={styles.modernDetailLabel}>Date & Time</Text>
                  <Text style={styles.modernDetailValue}>{eventData.date}</Text>
                  <Text style={styles.modernDetailSubValue}>{eventData.time}</Text>
                </View>
              </View>
              
              <View style={styles.modernDetailCard}>
                <View style={styles.modernDetailIcon}>
                  <Ionicons name="location-outline" size={20} color="#7f1d1d" />
                </View>
                <View style={styles.modernDetailContent}>
                  <Text style={styles.modernDetailLabel}>Location</Text>
                  <Text style={styles.modernDetailValue}>{eventData.location}</Text>
                </View>
              </View>
              
              <View style={styles.modernDetailCard}>
                <View style={styles.modernDetailIcon}>
                  <Ionicons name="people-outline" size={20} color="#7f1d1d" />
                </View>
                <View style={styles.modernDetailContent}>
                  <Text style={styles.modernDetailLabel}>Attendees</Text>
                  <Text style={styles.modernDetailValue}>{attendeeCount} registered</Text>
                </View>
              </View>
              
              <View style={styles.modernDetailCard}>
                <View style={styles.modernDetailIcon}>
                  <Ionicons name="pricetag-outline" size={20} color="#7f1d1d" />
                </View>
                <View style={styles.modernDetailContent}>
                  <Text style={styles.modernDetailLabel}>Price</Text>
                  <Text style={styles.modernDetailValue}>{eventData.price}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>About This Event</Text>
          <Text style={styles.description}>{eventData.description}</Text>
        </View>

        {/* Agenda Section */}
        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>Agenda</Text>
          {eventData.agenda.map((item, index) => (
            <View key={index} style={styles.agendaItem}>
              <Text style={styles.agendaTime}>{item.time}</Text>
              <Text style={styles.agendaTopic}>{item.topic}</Text>
            </View>
          ))}
        </View>

        {/* Requirements Section */}
        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>Requirements</Text>
          {eventData.requirements.map((requirement, index) => (
            <View key={index} style={styles.requirementItem}>
              <Ionicons name="checkmark-circle-outline" size={16} color="#10B981" />
              <Text style={styles.requirementText}>{requirement}</Text>
            </View>
          ))}
        </View>

        {/* Tags Section */}
        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>Tags</Text>
          <View style={styles.tagsContainer}>
            {eventData.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Register Button */}
      <View style={styles.registerSection}>
        <TouchableOpacity 
          style={[styles.registerButton, isRegistered && styles.unregisterButton]}
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <LinearGradient colors={['#7f1d1d', '#b91c1c']} style={styles.registerButtonGradient}>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={styles.registerButtonText}>Processing...</Text>
            </LinearGradient>
          ) : (
            <LinearGradient colors={['#7f1d1d', '#b91c1c']} style={styles.registerButtonGradient}>
              <Ionicons 
                name={isRegistered ? "checkmark-circle" : "add-circle"} 
                size={20} 
                color="#FFFFFF" 
              />
              <Text style={styles.registerButtonText}>
                {isRegistered ? 'Registered' : 'Register Now'}
              </Text>
            </LinearGradient>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  // Modern Header Styles
  modernHeader: {
    paddingTop: 10,
    paddingBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modernBackButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  modernHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modernShareButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  scrollView: {
    flex: 1,
  },
  // Hero Section Styles
  heroCard: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  heroImage: {
    width: '100%',
    height: 200,
  },
  heroOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  modernBookmarkButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
    borderRadius: 20,
  },
  // Main Content Card
  mainContentCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  // Event Header Section
  eventHeader: {
    marginBottom: 24,
  },
  titleSection: {
    marginBottom: 16,
  },
  modernEventTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 32,
  },
  modernCategoryBadge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#7f1d1d',
  },
  modernCategoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7f1d1d',
  },
  // Organizer Section
  modernOrganizerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
  },
  modernOrganizerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  modernOrganizerDetails: {
    flex: 1,
  },
  modernOrganizerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  modernOrganizerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  modernOrganizerRole: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  // Event Details Grid
  modernEventDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 20,
  },
  modernDetailCard: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    minHeight: 80,
  },
  modernDetailIcon: {
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  modernDetailContent: {
    flex: 1,
  },
  modernDetailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  modernDetailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  modernDetailSubValue: {
    fontSize: 12,
    color: '#6B7280',
  },
  // Content Sections
  contentSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  agendaItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  agendaTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f1d1d',
    width: 80,
  },
  agendaTopic: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  requirementText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    flex: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#7f1d1d',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#7f1d1d',
  },
  // Register Section
  registerSection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  registerButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  registerButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  unregisterButton: {
    opacity: 0.8,
  },
});
