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
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const INTEREST_TAGS = ['Technology', 'Business', 'Sustainability', 'Research', 'Arts', 'Sports'];

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

export default function CreatePostScreen() {
  const router = useRouter();
  const [postText, setPostText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [image, setImage] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const isPostButtonEnabled = postText.trim().length > 0 || image !== null;

  const pickImage = () => {
    setShowImagePicker(true);
  };

  const selectImage = (imageUrl: string) => {
    setImage(imageUrl);
    setShowImagePicker(false);
  };

  const selectLocation = (location: string) => {
    setLocation(location);
    setShowLocationPicker(false);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handlePost = () => {
    setShowSuccessAnimation(true);
    
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Hide animation and navigate back after delay
    setTimeout(() => {
      setShowSuccessAnimation(false);
      fadeAnim.setValue(0);
      scaleAnim.setValue(0);
      slideAnim.setValue(50);
      router.back();
    }, 2000);
  };

  const handleNavigateToProjects = () => {
    router.push('/CreateProjectScreen');
  };

  const handleNavigateToClubs = () => {
    router.push('/CreateClubScreen');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FEF2F2" translucent={true} />
      
      {/* Modern Header */}
      <View style={styles.modernHeader}>
        <TouchableOpacity style={styles.modernBackButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#8B1A1A" />
        </TouchableOpacity>
        <Text style={styles.modernHeaderTitle}>Create Post</Text>
        <TouchableOpacity 
          style={[styles.modernPostButton, !isPostButtonEnabled && styles.modernPostButtonDisabled]} 
          disabled={!isPostButtonEnabled}
          onPress={handlePost}
        >
          <Text style={[styles.modernPostButtonText, !isPostButtonEnabled && styles.modernPostButtonTextDisabled]}>Share</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.modernUserInfo}>
          <View style={styles.modernAvatarContainer}>
            <Image source={{ uri: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' }} style={styles.modernAvatar} />
            <View style={styles.modernAvatarGlow} />
          </View>
          <View style={styles.modernUserDetails}>
            <Text style={styles.modernUserName}>John Doe</Text>
            <TouchableOpacity style={styles.modernAudienceSelector}>
              <Ionicons name="globe-outline" size={16} color="#8B1A1A" />
              <Text style={styles.modernAudienceText}>Public</Text>
              <Ionicons name="chevron-down" size={16} color="#8B1A1A" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.modernInputContainer}>
          <TextInput
            style={styles.modernTextInput}
            multiline
            placeholder="Share your professional insights and updates..."
            placeholderTextColor="#9CA3AF"
            value={postText}
            onChangeText={setPostText}
          />
        </View>

        {image && (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: image }} style={styles.imagePreview} />
            <TouchableOpacity style={styles.removeImageButton} onPress={() => setImage(null)}>
              <Ionicons name="close-circle" size={24} color="#111111" />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.modernExtrasRow}>
          <TouchableOpacity style={styles.modernExtraButton} onPress={pickImage}>
            <View style={styles.modernExtraIconContainer}>
              <Ionicons name="image" size={20} color="#8B1A1A" />
            </View>
            <Text style={styles.modernExtraText}>Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modernExtraButton} onPress={() => setShowLocationPicker(true)}>
            <View style={styles.modernExtraIconContainer}>
              <Ionicons name="location" size={20} color="#8B1A1A" />
            </View>
            <Text style={styles.modernExtraText}>Location</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modernExtraButton}>
            <View style={[styles.modernExtraIconContainer, styles.modernExtraIconDisabled]}>
              <Ionicons name="stats-chart" size={20} color="#9CA3AF" />
            </View>
            <Text style={[styles.modernExtraText, styles.modernExtraTextDisabled]}>Poll</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modernExtraButton}>
            <View style={[styles.modernExtraIconContainer, styles.modernExtraIconDisabled]}>
              <Ionicons name="document-attach" size={20} color="#9CA3AF" />
            </View>
            <Text style={[styles.modernExtraText, styles.modernExtraTextDisabled]}>File</Text>
          </TouchableOpacity>
        </View>

        {/* Selected Location Display */}
        {location && (
          <View style={styles.selectedLocationContainer}>
            <Ionicons name="location" size={16} color="#8B1A1A" />
            <Text style={styles.selectedLocationText}>{location}</Text>
            <TouchableOpacity onPress={() => setLocation(null)}>
              <Ionicons name="close-circle" size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.modernTagsSection}>
          <Text style={styles.modernTagsHeader}>Add Tags</Text>
          <Text style={styles.modernTagsSubheader}>Categorize your content for better discoverability</Text>
          <View style={styles.modernTagsContainer}>
            {INTEREST_TAGS.map(tag => (
              <TouchableOpacity 
                key={tag} 
                style={[styles.modernTagChip, selectedTags.includes(tag) && styles.modernTagChipSelected]}
                onPress={() => toggleTag(tag)}
              >
                <Text style={[styles.modernTagText, selectedTags.includes(tag) && styles.modernTagTextSelected]}>{tag}</Text>
                {selectedTags.includes(tag) && (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" style={styles.modernTagCheckmark} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Modern Bottom Navigation */}
      <View style={styles.modernBottomNavigation}>
        <Text style={styles.modernBottomNavTitle}>Create Additional Content</Text>
        <View style={styles.modernBottomNavOptions}>
          <TouchableOpacity style={styles.modernNavOption} onPress={handleNavigateToProjects}>
            <LinearGradient colors={['#8B1A1A', '#B91C1C']} style={styles.modernNavIconContainer}>
              <Ionicons name="code-slash" size={20} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.modernNavOptionText}>Project</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.modernNavOption} onPress={handleNavigateToClubs}>
            <LinearGradient colors={['#8B1A1A', '#DC2626']} style={styles.modernNavIconContainer}>
              <Ionicons name="people" size={20} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.modernNavOptionText}>Organization</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Image Picker Modal */}
      <Modal visible={showImagePicker} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowImagePicker(false)}>
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
              <TouchableOpacity style={styles.imageOption} onPress={() => selectImage(item)}>
                <Image source={{ uri: item }} style={styles.imageOptionPreview} />
              </TouchableOpacity>
            )}
            keyExtractor={(item, index) => index.toString()}
          />
        </SafeAreaView>
      </Modal>

      {/* Location Picker Modal */}
      <Modal visible={showLocationPicker} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowLocationPicker(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Location</Text>
            <View style={{ width: 60 }} />
          </View>
          <ScrollView style={styles.locationList}>
            {LOCATIONS.map((location, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.locationOption}
                onPress={() => selectLocation(location)}
              >
                <Ionicons name="location-outline" size={20} color="#8B1A1A" />
                <Text style={styles.locationText}>{location}</Text>
                <Ionicons name="chevron-forward" size={16} color="#6B7280" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Success Animation Modal */}
      <Modal visible={showSuccessAnimation} transparent animationType="fade">
        <View style={styles.successOverlay}>
          <Animated.View 
            style={[
              styles.successContainer,
              {
                opacity: fadeAnim,
                transform: [
                  { scale: scaleAnim },
                  { translateY: slideAnim }
                ]
              }
            ]}
          >
            <LinearGradient colors={['#8B1A1A', '#A52A2A']} style={styles.successGradient}>
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Ionicons name="checkmark-circle" size={60} color="white" />
              </Animated.View>
              <Text style={styles.successTitle}>Post Created!</Text>
              <Text style={styles.successMessage}>Your post has been shared successfully</Text>
            </LinearGradient>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef2f2',
  },
  
  // Modern Header
  modernHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 70,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#7f1d1d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 26, 26, 0.1)',
  },
  modernBackButton: {
    padding: 8,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
  },
  modernHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7f1d1d',
    letterSpacing: -0.3,
  },
  modernPostButton: {
    backgroundColor: '#7f1d1d',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#7f1d1d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modernPostButtonDisabled: {
    backgroundColor: '#E5E7EB',
    shadowOpacity: 0,
    elevation: 0,
  },
  modernPostButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modernPostButtonTextDisabled: {
    color: '#9CA3AF',
  },
  
  scrollView: { flex: 1, padding: 20 },
  
  // Modern User Info
  modernUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#7f1d1d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  modernAvatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  modernAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#8B1A1A',
  },
  modernAvatarGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 32,
    backgroundColor: 'rgba(139, 26, 26, 0.1)',
  },
  modernUserDetails: {
    flex: 1,
  },
  modernUserName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  modernAudienceSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#8B1A1A',
  },
  modernAudienceText: {
    marginHorizontal: 6,
    color: '#7f1d1d',
    fontWeight: '600',
    fontSize: 14,
  },
  
  // Modern Input
  modernInputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#7f1d1d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  modernTextInput: {
    fontSize: 18,
    minHeight: 140,
    textAlignVertical: 'top',
    color: '#111827',
    padding: 20,
    borderRadius: 20,
    lineHeight: 26,
  },
  imagePreviewContainer: {
    marginBottom: 20,
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#7f1d1d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  imagePreview: {
    width: '100%',
    height: 240,
  },
  removeImageButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
    padding: 8,
  },
  
  // Modern Extras Row
  modernExtrasRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#7f1d1d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  modernExtraButton: {
    alignItems: 'center',
    flex: 1,
  },
  modernExtraIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#8B1A1A',
  },
  modernExtraIconDisabled: {
    backgroundColor: '#fef2f2',
    borderColor: 'rgba(127, 29, 29, 0.2)',
  },
  modernExtraText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7f1d1d',
  },
  modernExtraTextDisabled: {
    color: '#9CA3AF',
  },
  
  selectedLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 20,
    alignSelf: 'flex-start',
    gap: 8,
    shadowColor: '#7f1d1d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#8B1A1A',
  },
  selectedLocationText: {
    color: '#7f1d1d',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Modern Tags
  modernTagsSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#7f1d1d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  modernTagsHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#111827',
  },
  modernTagsSubheader: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  modernTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modernTagChip: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: 'rgba(127, 29, 29, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modernTagChipSelected: {
    backgroundColor: '#7f1d1d',
  },
  modernTagText: {
    color: '#7f1d1d',
    fontWeight: '500',
    fontSize: 14,
  },
  modernTagTextSelected: {
    color: '#FFFFFF',
  },
  removeTagButton: {
    marginLeft: 6,
    padding: 2,
  },
  // Modern Bottom Navigation
  modernBottomNavigation: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#FEF2F2',
    shadowColor: '#7f1d1d',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  modernBottomNavTitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  modernBottomNavOptions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 60,
  },
  modernNavOption: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: 'rgba(127, 29, 29, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 12,
    shadowColor: '#7f1d1d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  modernNavIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#7f1d1d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  modernNavOptionText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#7f1d1d',
  },
  
  bottomNavigation: {
    backgroundColor: '#fef2f2',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(139, 26, 26, 0.1)',
    shadowColor: '#7f1d1d',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  bottomNavTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    textAlign: 'center',
  },
  bottomNavOptions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
  },
  navOption: {
    alignItems: 'center',
  },
  navIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  navOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  modalContainer: { flex: 1, backgroundColor: 'white' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  modalCancelText: { fontSize: 16, color: '#8B1A1A', fontWeight: '500' },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#374151' },
  imageGrid: { padding: 20 },
  imageOption: { flex: 1, margin: 8, aspectRatio: 1, borderRadius: 12, overflow: 'hidden' },
  imageOptionPreview: { width: '100%', height: '100%' },
  locationList: { flex: 1, padding: 20 },
  locationOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 12, backgroundColor: '#F9FAFB', borderRadius: 12, marginBottom: 8, gap: 12 },
  locationText: { flex: 1, fontSize: 16, color: '#374151', fontWeight: '500' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(139, 26, 26, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successContainer: { margin: 40, borderRadius: 20, overflow: 'hidden' },
  successGradient: { paddingVertical: 40, paddingHorizontal: 30, alignItems: 'center' },
  successTitle: { fontSize: 24, fontWeight: 'bold', color: 'white', marginTop: 16, marginBottom: 8 },
  successMessage: { fontSize: 16, color: 'rgba(255,255,255,0.9)', textAlign: 'center' },
  tagInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(127, 29, 29, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    marginBottom: 16,
    shadowColor: '#7f1d1d',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#7f1d1d',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(139, 26, 26, 0.1)',
  },
  modernTagCheckmark: {
    marginLeft: 6,
    color: '#FFFFFF',
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(139, 26, 26, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});
