import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl,
  Alert,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';

const { width } = Dimensions.get('window');

// Data & Types
type Event = {
  id: number;
  title: string;
  type: string;
  date: string;
  time: string;
  location: string;
  shortDesc: string;
  bannerUrl: string;
  tags: string[];
};

// Events will be loaded from API
const sampleEvents: Event[] = [];

const EventCard = ({ item, isListView, onPress }: { item: Event, isListView?: boolean, onPress?: (event: Event) => void }) => (
  <TouchableOpacity 
    style={[styles.modernEventCard, isListView && styles.eventCardListView]}
    onPress={() => onPress?.(item)}
    activeOpacity={0.8}
  >
    <View style={styles.eventImageContainer}>
      <Image source={{ uri: item.bannerUrl }} style={[styles.eventImage, isListView && styles.eventImageListView]} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.6)']}
        style={styles.eventImageOverlay}
      />
      <View style={styles.eventTypeChip}>
        <Text style={styles.eventTypeText}>{item.type}</Text>
      </View>
    </View>
    <View style={styles.modernEventContent}>
      <Text style={styles.modernEventTitle} numberOfLines={2}>{item.title}</Text>
      <View style={styles.eventMetaRow}>
        <Ionicons name="location-outline" size={14} color="#7f1d1d" />
        <Text style={styles.eventMetaText}>{item.location}</Text>
      </View>
      <View style={styles.eventMetaRow}>
        <Ionicons name="time-outline" size={14} color="#7f1d1d" />
        <Text style={styles.eventMetaText}>{item.date} • {item.time}</Text>
      </View>
      <View style={styles.eventTagsContainer}>
        {item.tags.map((tag, index) => (
          <View key={index} style={styles.eventTag}>
            <Text style={styles.eventTagText}>{tag}</Text>
          </View>
        ))}
      </View>
    </View>
  </TouchableOpacity>
);

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [viewMode, setViewMode] = useState('Grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [events, setEvents] = useState(sampleEvents);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Load events immediately without animations
  useEffect(() => {
    setEvents(sampleEvents);
    setIsLoading(false);
    // Set animations to final state immediately
    fadeAnim.setValue(1);
    slideAnim.setValue(0);
  }, []);

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Simulate refresh API delay
      await new Promise(resolve => setTimeout(resolve, 600));
      setEvents(sampleEvents);
      
      // Add refresh animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh events');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleEventPress = (event: Event) => {
    // Add press animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Navigate to event details or show modal
    Alert.alert(
      event.title,
      `${event.shortDesc}\n\nLocation: ${event.location}\nTime: ${new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} at ${event.time}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Join Event', style: 'default' },
        { text: 'Share', style: 'default' }
      ]
    );
  };

  const markedDates = useMemo(() => {
    const marks: { [key: string]: any } = {};
    sampleEvents.forEach(event => {
      marks[event.date] = { marked: true, dotColor: '#7f1d1d' };
    });
    marks[selectedDate] = { ...marks[selectedDate], selected: true, selectedColor: '#7f1d1d', selectedTextColor: '#FFFFFF', activeOpacity: 0.8 };
    return marks;
  }, [selectedDate]);

  const filteredBySearch = useMemo(() => {
    if (!searchQuery) return events;
    const q = searchQuery.trim().toLowerCase();
    return events.filter(event => 
      event.title.toLowerCase().includes(q) || event.tags.some(tag => tag.toLowerCase().includes(q))
    );
  }, [searchQuery, events]);

  const eventsOnSelectedDate = useMemo(() => 
    filteredBySearch.filter(event => event.date === selectedDate)
  , [filteredBySearch, selectedDate]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />
      
      {/* Simple Header */}
      <View style={styles.simpleHeader}>
        <Text style={styles.simpleHeaderTitle}>Events & Calendar</Text>
      </View>

      {/* Main Content */}
      <Animated.View style={[styles.mainContent, { opacity: fadeAnim }]}>
      
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7f1d1d" />
            <Text style={styles.loadingText}>Loading events...</Text>
          </View>
        ) : (
          <ScrollView 
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                colors={['#7f1d1d']}
                tintColor={'#7f1d1d'}
              />
            }
          >
            {/* Search Section */}
            <View style={styles.modernSearchSection}>
              <View style={styles.modernSearchBar}>
                <Ionicons name="search" size={20} color="#7f1d1d" />
                <TextInput 
                  placeholder="Search events, tags, or locations..." 
                  style={styles.modernSearchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholderTextColor="#7f1d1d"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Calendar Section */}
            <View style={styles.calendarSection}>
              <Text style={styles.modernSectionTitle}>Calendar</Text>
              <View style={styles.calendarContainer}>
                <Calendar
                  onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
                  markedDates={markedDates}
                  theme={{
                    calendarBackground: '#FFFFFF',
                    arrowColor: '#7f1d1d',
                    todayTextColor: '#7f1d1d',
                    textSectionTitleColor: '#7f1d1d',
                    selectedDayBackgroundColor: '#7f1d1d',
                    selectedDayTextColor: '#FFFFFF',
                    monthTextColor: '#7f1d1d',
                    dayTextColor: '#374151',
                    textDisabledColor: '#d1d5db',
                    textDayFontWeight: '500',
                    textMonthFontWeight: 'bold',
                    textDayHeaderFontWeight: '600',
                  }}
                />
              </View>
            </View>

            {/* Selected Date Events */}
            <View style={styles.selectedDateSection}>
              <Text style={styles.modernSectionTitle}>Events on {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</Text>
              {eventsOnSelectedDate.length > 0 ? (
                <View style={styles.selectedDateEvents}>
                  {eventsOnSelectedDate.map(event => (
                    <EventCard key={event.id} item={event} isListView={true} onPress={handleEventPress} />
                  ))}
                </View>
              ) : (
                <View style={styles.modernEmptyState}>
                  <Ionicons name="calendar-outline" size={48} color="#d1d5db" />
                  <Text style={styles.modernEmptyStateText}>No events scheduled for this date</Text>
                  <Text style={styles.modernEmptyStateSubtext}>Check other dates or browse all events below</Text>
                </View>
              )}
            </View>

            {/* All Events Section */}
            <View style={styles.allEventsSection}>
              <View style={styles.modernSectionHeader}>
                <Text style={styles.modernSectionTitle}>All Events</Text>
                <View style={styles.modernViewToggle}>
                  <TouchableOpacity 
                    onPress={() => setViewMode('Grid')} 
                    style={[styles.modernToggleButton, viewMode === 'Grid' && styles.modernToggleButtonActive]}
                  >
                    <Ionicons name="grid" size={18} color={viewMode === 'Grid' ? '#FFFFFF' : '#6B7280'} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => setViewMode('List')} 
                    style={[styles.modernToggleButton, viewMode === 'List' && styles.modernToggleButtonActive]}
                  >
                    <Ionicons name="list" size={18} color={viewMode === 'List' ? '#FFFFFF' : '#6B7280'} />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={[styles.eventsGrid, viewMode === 'List' && styles.eventsList]}>
                {filteredBySearch.map((event) => (
                  <EventCard key={event.id} item={event} isListView={viewMode === 'List'} onPress={handleEventPress} />
                ))}
              </View>
            </View>
            
            <View style={styles.bottomSpacing} />
          </ScrollView>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFF2E8' 
  },
  
  // Simple Header Styles
  simpleHeader: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: '#FFF2E8',
  },
  simpleHeaderTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#7f1d1d',
    textAlign: 'center',
    marginTop: 24,
  },
  floatingHeaderButtons: {
    position: 'absolute',
    top: 50,
    right: 20,
    flexDirection: 'row',
    gap: 12,
    zIndex: 10,
  },
  floatingButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 20,
  },
  coverHeaderTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  coverHeaderSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    paddingHorizontal: 20,
  },

  // Main Content
  mainContent: {
    flex: 1,
    backgroundColor: '#FFF2E8',
  },

  // Search Section
  modernSearchSection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  modernSearchBar: {
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
  modernSearchInput: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
    color: '#7f1d1d',
    fontWeight: '500',
  },

  // Calendar Section
  calendarSection: {
    paddingHorizontal: 24,
    marginBottom: 28,
  },
  modernSectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7f1d1d',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#7f1d1d',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },

  // Selected Date Section
  selectedDateSection: {
    paddingHorizontal: 24,
    marginBottom: 28,
  },
  selectedDateEvents: {
    gap: 16,
  },
  modernEmptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 4,
    shadowColor: '#7f1d1d',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  modernEmptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7f1d1d',
    marginTop: 16,
    textAlign: 'center',
  },
  modernEmptyStateSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },

  // All Events Section
  allEventsSection: {
    paddingHorizontal: 24,
    marginBottom: 28,
  },
  modernSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modernViewToggle: {
    flexDirection: 'row',
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 6,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  modernToggleButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
  },
  modernToggleButtonActive: {
    backgroundColor: '#7f1d1d',
    shadowColor: '#7f1d1d',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },

  // Events Grid/List
  eventsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  eventsList: {
    flexDirection: 'column',
    paddingHorizontal: 4,
  },

  // Modern Event Card
  modernEventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#7f1d1d',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    marginBottom: 16,
    marginHorizontal: 4,
    width: (width - 64) / 2 - 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  eventCardListView: {
    flexDirection: 'row',
    width: '100%',
    marginHorizontal: 0,
    marginBottom: 16,
  },
  eventImageContainer: {
    position: 'relative',
    height: 120,
  },
  eventImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  eventImageListView: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: 12,
  },
  eventImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  eventTypeChip: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#7f1d1d',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  eventTypeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  modernEventContent: {
    padding: 16,
    flex: 1,
  },
  modernEventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7f1d1d',
    marginBottom: 8,
    lineHeight: 22,
  },
  eventMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventMetaText: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 6,
    flex: 1,
    fontWeight: '500',
  },
  eventTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 6,
  },
  eventTag: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  eventTagText: {
    fontSize: 11,
    color: '#7f1d1d',
    fontWeight: '600',
  },

  // Loading States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },

  // Bottom Spacing
  bottomSpacing: {
    height: 120,
  },

  // Legacy styles (keeping for compatibility)
  header: { height: 44, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  searchBarContainer: { padding: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 12, paddingHorizontal: 12, height: 44 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 16 },
  dayEventsPanel: { padding: 16 },
  panelTitle: { fontSize: 20, fontWeight: 'bold' },
  emptyStateContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 20 },
  emptyStateText: { color: '#6B7280', fontSize: 16 },
  listHeaderContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  viewToggle: { flexDirection: 'row', backgroundColor: '#E5E7EB', borderRadius: 12 },
  toggleButton: { padding: 8, borderRadius: 10 },
  toggleButtonActive: { backgroundColor: '#FFFFFF' },
  eventsCollection: { paddingHorizontal: 12 },
  card: { flex: 1, margin: 6, backgroundColor: '#FFFFFF', borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, overflow: 'hidden' },
  cardListView: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 4, marginBottom: 8 },
  cardMedia: { width: '100%', aspectRatio: 16 / 9 },
  cardMediaListView: { width: 80, height: 80, aspectRatio: 1, borderRadius: 12 },
  cardContent: { flex: 1, padding: 12 },
  chip: { alignSelf: 'flex-start', backgroundColor: '#FEF2F2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: 6 },
  chipText: { color: '#7f1d1d', fontSize: 12, fontWeight: '600' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  metaText: { color: '#6B7280', fontSize: 12, marginBottom: 2 },
});