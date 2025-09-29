import { Ionicons } from '@expo/vector-icons';
import React, { useState, useRef } from 'react';
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400',
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400',
  'https://images.unsplash.com/photo-1569163139394-de4e4f43e4e3?w=400',
  'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
  'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
];

const LOCATIONS = [
  'Dubai, UAE', 'Abu Dhabi, UAE', 'Sharjah, UAE', 'Ajman, UAE', 
  'Remote', 'Hybrid', 'On Campus', 'Innovation Hub'
];

const EVENT_CATEGORIES = [
  'Conference', 'Workshop', 'Networking', 'Social', 'Educational', 'Sports', 'Cultural', 'Business'
];

export default function CreateEventScreen() {
  const router = useRouter();
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [maxAttendees, setMaxAttendees] = useState('');
  const [eventPrice, setEventPrice] = useState('');
  const [requirements, setRequirements] = useState('');
  
  const [showImageModal, setShowImageModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const successScale = useRef(new Animated.Value(0)).current;

  const canPost = eventTitle.trim().length > 0 && eventDescription.trim().length > 0 && eventDate.trim().length > 0;

  const handleCreateEvent = () => {
    if (!canPost) return;
    
    setShowSuccessModal(true);
    Animated.spring(successScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();

    setTimeout(() => {
      setShowSuccessModal(false);
      successScale.setValue(0);
      router.back();
    }, 2000);
  };

  const renderImageModal = () => (
    <Modal visible={showImageModal} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowImageModal(false)}>
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Choose Image</Text>
          <View style={{ width: 60 }} />
        </View>
        <FlatList
          data={SAMPLE_IMAGES}
          numColumns={2}
          contentContainerStyle={styles.imageGrid}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.imageOption}
              onPress={() => {
                setSelectedImage(item);
                setShowImageModal(false);
              }}
            >
              <Image source={{ uri: item }} style={styles.imageOptionPreview} />
            </TouchableOpacity>
          )}
        />
      </View>
    </Modal>
  );

  const renderLocationModal = () => (
    <Modal visible={showLocationModal} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowLocationModal(false)}>
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Choose Location</Text>
          <View style={{ width: 60 }} />
        </View>
        <ScrollView style={styles.locationList}>
          {LOCATIONS.map((location) => (
            <TouchableOpacity
              key={location}
              style={styles.locationOption}
              onPress={() => {
                setSelectedLocation(location);
                setShowLocationModal(false);
              }}
            >
              <Ionicons name="location-outline" size={20} color="#F59E0B" />
              <Text style={styles.locationText}>{location}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );

  const renderCategoryModal = () => (
    <Modal visible={showCategoryModal} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Choose Category</Text>
          <View style={{ width: 60 }} />
        </View>
        <ScrollView style={styles.locationList}>
          {EVENT_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              style={styles.locationOption}
              onPress={() => {
                setSelectedCategory(category);
                setShowCategoryModal(false);
              }}
            >
              <Ionicons name="pricetag-outline" size={20} color="#F59E0B" />
              <Text style={styles.locationText}>{category}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );

  const renderSuccessModal = () => (
    <Modal visible={showSuccessModal} transparent animationType="fade">
      <View style={styles.successOverlay}>
        <Animated.View style={[styles.successContainer, { transform: [{ scale: successScale }] }]}>
          <LinearGradient colors={['#F59E0B', '#FBBF24']} style={styles.successGradient}>
            <Ionicons name="checkmark-circle" size={64} color="white" />
            <Text style={styles.successTitle}>Event Created!</Text>
            <Text style={styles.successMessage}>Your event has been successfully created and is now live.</Text>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#F59E0B" />
      
      <LinearGradient colors={['#F59E0B', '#FBBF24']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.headerButtonText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Event</Text>
        <TouchableOpacity 
          style={[styles.postButton, !canPost && styles.postButtonDisabled]}
          onPress={handleCreateEvent}
          disabled={!canPost}
        >
          <Text style={styles.postButtonText}>Create</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.scrollView}>
        <View style={styles.userInfo}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' }} 
            style={styles.avatar} 
          />
          <View>
            <Text style={styles.userName}>John Doe</Text>
            <View style={styles.audienceSelector}>
              <Text style={styles.audienceText}>Public</Text>
              <Ionicons name="chevron-down" size={16} color="#374151" />
            </View>
          </View>
        </View>

        <TextInput
          style={styles.titleInput}
          placeholder="Event title..."
          placeholderTextColor="#9CA3AF"
          value={eventTitle}
          onChangeText={setEventTitle}
          multiline={false}
        />

        <TextInput
          style={styles.textInput}
          placeholder="Describe your event..."
          placeholderTextColor="#9CA3AF"
          value={eventDescription}
          onChangeText={setEventDescription}
          multiline
        />

        {selectedImage && (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
            <TouchableOpacity 
              style={styles.removeImageButton}
              onPress={() => setSelectedImage(null)}
            >
              <Ionicons name="close" size={20} color="#374151" />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.extrasRow}>
          <TouchableOpacity onPress={() => setShowImageModal(true)}>
            <Ionicons name="image-outline" size={24} color="#F59E0B" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowLocationModal(true)}>
            <Ionicons name="location-outline" size={24} color="#F59E0B" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowCategoryModal(true)}>
            <Ionicons name="pricetag-outline" size={24} color="#F59E0B" />
          </TouchableOpacity>
        </View>

        {selectedLocation && (
          <View style={styles.selectedLocationContainer}>
            <Ionicons name="location" size={16} color="#F59E0B" />
            <Text style={styles.selectedLocationText}>{selectedLocation}</Text>
            <TouchableOpacity onPress={() => setSelectedLocation(null)}>
              <Ionicons name="close" size={16} color="#F59E0B" />
            </TouchableOpacity>
          </View>
        )}

        {selectedCategory && (
          <View style={styles.selectedLocationContainer}>
            <Ionicons name="pricetag" size={16} color="#F59E0B" />
            <Text style={styles.selectedLocationText}>{selectedCategory}</Text>
            <TouchableOpacity onPress={() => setSelectedCategory(null)}>
              <Ionicons name="close" size={16} color="#F59E0B" />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.eventDetailsSection}>
          <Text style={styles.sectionTitle}>Event Details</Text>
          
          <View style={styles.inputRow}>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>Date</Text>
              <TextInput
                style={styles.detailInput}
                placeholder="DD/MM/YYYY"
                placeholderTextColor="#9CA3AF"
                value={eventDate}
                onChangeText={setEventDate}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>Time</Text>
              <TextInput
                style={styles.detailInput}
                placeholder="HH:MM"
                placeholderTextColor="#9CA3AF"
                value={eventTime}
                onChangeText={setEventTime}
              />
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>Max Attendees</Text>
              <TextInput
                style={styles.detailInput}
                placeholder="100"
                placeholderTextColor="#9CA3AF"
                value={maxAttendees}
                onChangeText={setMaxAttendees}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>Price (AED)</Text>
              <TextInput
                style={styles.detailInput}
                placeholder="Free"
                placeholderTextColor="#9CA3AF"
                value={eventPrice}
                onChangeText={setEventPrice}
                keyboardType="numeric"
              />
            </View>
          </View>

          <Text style={styles.inputLabel}>Requirements</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Any special requirements or prerequisites..."
            placeholderTextColor="#9CA3AF"
            value={requirements}
            onChangeText={setRequirements}
            multiline
          />
        </View>
      </ScrollView>

      {renderImageModal()}
      {renderLocationModal()}
      {renderCategoryModal()}
      {renderSuccessModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 20,
    paddingTop: 40,
  },
  headerButtonText: { fontSize: 16, color: 'white', fontWeight: '500' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: 'white' },
  postButton: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  postButtonDisabled: { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.1)' },
  postButtonText: { color: '#FFFFFF', fontWeight: '600' },
  scrollView: { padding: 20 },
  userInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#374151' },
  audienceSelector: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginTop: 4 },
  audienceText: { marginRight: 4, color: '#374151' },
  titleInput: { fontSize: 20, fontWeight: '600', color: '#374151', backgroundColor: 'white', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 12 },
  textInput: { fontSize: 18, minHeight: 120, textAlignVertical: 'top', color: '#374151', backgroundColor: 'white', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  imagePreviewContainer: { marginTop: 16, position: 'relative' },
  imagePreview: { width: '100%', height: 200, borderRadius: 12 },
  removeImageButton: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 12, padding: 4 },
  extrasRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 16, backgroundColor: 'white', borderRadius: 12, marginTop: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  selectedLocationContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginTop: 12, alignSelf: 'flex-start', gap: 6 },
  selectedLocationText: { color: '#F59E0B', fontSize: 14, fontWeight: '500' },
  eventDetailsSection: { marginTop: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16, color: '#374151' },
  inputRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  halfInput: { width: '48%' },
  inputLabel: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 },
  detailInput: { fontSize: 16, color: '#374151', backgroundColor: 'white', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  modalContainer: { flex: 1, backgroundColor: 'white' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  modalCancelText: { fontSize: 16, color: '#F59E0B', fontWeight: '500' },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#374151' },
  imageGrid: { padding: 20 },
  imageOption: { flex: 1, margin: 8, aspectRatio: 1, borderRadius: 12, overflow: 'hidden' },
  imageOptionPreview: { width: '100%', height: '100%' },
  locationList: { flex: 1, padding: 20 },
  locationOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 12, backgroundColor: '#F9FAFB', borderRadius: 12, marginBottom: 8, gap: 12 },
  locationText: { flex: 1, fontSize: 16, color: '#374151', fontWeight: '500' },
  successOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  successContainer: { margin: 40, borderRadius: 20, overflow: 'hidden' },
  successGradient: { paddingVertical: 40, paddingHorizontal: 30, alignItems: 'center' },
  successTitle: { fontSize: 24, fontWeight: 'bold', color: 'white', marginTop: 16, marginBottom: 8 },
  successMessage: { fontSize: 16, color: 'rgba(255,255,255,0.9)', textAlign: 'center' },
});
