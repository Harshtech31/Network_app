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

const CLUB_CATEGORIES = ['Technology', 'Business', 'Arts', 'Sports', 'Academic', 'Social', 'Professional', 'Hobby'];
const CLUB_INTERESTS = ['Networking', 'Learning', 'Innovation', 'Community Service', 'Career Development', 'Research', 'Entertainment', 'Skill Building'];
const CLUB_TYPES = ['Public', 'Private', 'Invite Only'];

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400',
  'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400',
  'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
];

export default function CreateClubScreen() {
  const router = useRouter();
  const [clubName, setClubName] = useState('');
  const [clubDescription, setClubDescription] = useState('');
  const [clubLongDescription, setClubLongDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState('Public');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [clubRules, setClubRules] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const isCreateButtonEnabled = clubName.trim().length > 0 && clubDescription.trim().length > 0 && selectedCategory;

  const selectImage = (imageUrl: string) => {
    setImage(imageUrl);
    setShowImagePicker(false);
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleCreateClub = () => {
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#7C3AED" />
      
      {/* Header with gradient */}
      <LinearGradient colors={['#7C3AED', '#8B5CF6']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.headerButtonText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Club</Text>
        <TouchableOpacity 
          style={[styles.createButton, !isCreateButtonEnabled && styles.createButtonDisabled]} 
          disabled={!isCreateButtonEnabled}
          onPress={handleCreateClub}
        >
          <Text style={styles.createButtonText}>Create</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.scrollView}>
        <View style={styles.userInfo}>
          <Image source={{ uri: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' }} style={styles.avatar} />
          <View>
            <Text style={styles.userName}>John Doe</Text>
            <Text style={styles.userRole}>Club Founder</Text>
          </View>
        </View>

        {/* Club Image */}
        {image && (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: image }} style={styles.imagePreview} />
            <TouchableOpacity style={styles.removeImageButton} onPress={() => setImage(null)}>
              <Ionicons name="close-circle" size={24} color="#111111" />
            </TouchableOpacity>
          </View>
        )}

        {/* Club Name */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Club Name *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter your club name"
            value={clubName}
            onChangeText={setClubName}
          />
        </View>

        {/* Short Description */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Short Description *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Brief description of your club"
            value={clubDescription}
            onChangeText={setClubDescription}
            multiline
            numberOfLines={2}
          />
        </View>

        {/* Long Description */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Detailed Description</Text>
          <TextInput
            style={[styles.textInput, styles.longTextInput]}
            placeholder="Provide detailed information about your club, mission, and activities"
            value={clubLongDescription}
            onChangeText={setClubLongDescription}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Category Selection */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Category *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            <View style={styles.categoryContainer}>
              {CLUB_CATEGORIES.map(category => (
                <TouchableOpacity 
                  key={category} 
                  style={[styles.categoryChip, selectedCategory === category && styles.categoryChipSelected]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text style={[styles.categoryText, selectedCategory === category && styles.categoryTextSelected]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Interests */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Club Interests</Text>
          <View style={styles.interestsContainer}>
            {CLUB_INTERESTS.map(interest => (
              <TouchableOpacity 
                key={interest} 
                style={[styles.interestChip, selectedInterests.includes(interest) && styles.interestChipSelected]}
                onPress={() => toggleInterest(interest)}
              >
                <Text style={[styles.interestText, selectedInterests.includes(interest) && styles.interestTextSelected]}>
                  {interest}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Location and Website Row */}
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Text style={styles.inputLabel}>Location</Text>
            <TextInput
              style={styles.smallInput}
              placeholder="e.g., Dubai, UAE"
              value={location}
              onChangeText={setLocation}
            />
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.inputLabel}>Website</Text>
            <TextInput
              style={styles.smallInput}
              placeholder="www.example.com"
              value={website}
              onChangeText={setWebsite}
            />
          </View>
        </View>

        {/* Club Type Selection */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Club Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            <View style={styles.typeContainer}>
              {CLUB_TYPES.map(type => (
                <TouchableOpacity 
                  key={type} 
                  style={[styles.typeChip, selectedType === type && styles.typeChipSelected]}
                  onPress={() => setSelectedType(type)}
                >
                  <Text style={[styles.typeText, selectedType === type && styles.typeTextSelected]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Club Rules */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Club Rules & Guidelines</Text>
          <TextInput
            style={[styles.textInput, styles.longTextInput]}
            placeholder="Define the rules and guidelines for your club members"
            value={clubRules}
            onChangeText={setClubRules}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Add Media Section */}
        <View style={styles.mediaSection}>
          <TouchableOpacity style={styles.mediaButton} onPress={() => setShowImagePicker(true)}>
            <Ionicons name="image-outline" size={24} color="#7C3AED" />
            <Text style={styles.mediaButtonText}>Add Club Image</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Image Picker Modal */}
      <Modal visible={showImagePicker} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowImagePicker(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Choose Club Image</Text>
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
            <LinearGradient colors={['#7C3AED', '#8B5CF6']} style={styles.successGradient}>
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Ionicons name="checkmark-circle" size={60} color="white" />
              </Animated.View>
              <Text style={styles.successTitle}>Club Created!</Text>
              <Text style={styles.successMessage}>Your club has been created successfully</Text>
            </LinearGradient>
          </Animated.View>
        </View>
      </Modal>
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
  createButton: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  createButtonDisabled: { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.1)' },
  createButtonText: { color: '#FFFFFF', fontWeight: '600' },
  scrollView: { padding: 20 },
  userInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#374151' },
  userRole: { fontSize: 14, color: '#6B7280', marginTop: 2 },
  imagePreviewContainer: { marginBottom: 20, position: 'relative' },
  imagePreview: { width: '100%', height: 200, borderRadius: 12 },
  removeImageButton: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 12, padding: 4 },
  inputSection: { marginBottom: 20 },
  inputLabel: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8 },
  textInput: { backgroundColor: 'white', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', fontSize: 16, color: '#374151' },
  longTextInput: { minHeight: 100, textAlignVertical: 'top' },
  horizontalScroll: { marginTop: 8 },
  categoryContainer: { flexDirection: 'row', paddingRight: 20 },
  categoryChip: { backgroundColor: '#F3F4F6', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 12, borderWidth: 1, borderColor: '#7C3AED' },
  categoryChipSelected: { backgroundColor: '#7C3AED' },
  categoryText: { color: '#7C3AED', fontWeight: '500' },
  categoryTextSelected: { color: '#FFFFFF' },
  interestsContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  interestChip: { backgroundColor: '#F9FAFB', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: '#D1D5DB' },
  interestChipSelected: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  interestText: { color: '#6B7280', fontWeight: '500', fontSize: 14 },
  interestTextSelected: { color: '#FFFFFF' },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  detailItem: { flex: 1, marginHorizontal: 5 },
  smallInput: { backgroundColor: 'white', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', fontSize: 16, color: '#374151' },
  typeContainer: { flexDirection: 'row', paddingRight: 20 },
  typeChip: { backgroundColor: '#EDE9FE', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 12, borderWidth: 1, borderColor: '#7C3AED' },
  typeChipSelected: { backgroundColor: '#7C3AED' },
  typeText: { color: '#7C3AED', fontWeight: '500' },
  typeTextSelected: { color: '#FFFFFF' },
  mediaSection: { marginBottom: 30 },
  mediaButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', padding: 16, borderRadius: 12, borderWidth: 2, borderColor: '#7C3AED', borderStyle: 'dashed' },
  mediaButtonText: { marginLeft: 8, fontSize: 16, color: '#7C3AED', fontWeight: '500' },
  modalContainer: { flex: 1, backgroundColor: 'white' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  modalCancelText: { fontSize: 16, color: '#7C3AED', fontWeight: '500' },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#374151' },
  imageGrid: { padding: 20 },
  imageOption: { flex: 1, margin: 8, aspectRatio: 1, borderRadius: 12, overflow: 'hidden' },
  imageOptionPreview: { width: '100%', height: '100%' },
  successOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  successContainer: { margin: 40, borderRadius: 20, overflow: 'hidden' },
  successGradient: { paddingVertical: 40, paddingHorizontal: 30, alignItems: 'center' },
  successTitle: { fontSize: 24, fontWeight: 'bold', color: 'white', marginTop: 16, marginBottom: 8 },
  successMessage: { fontSize: 16, color: 'rgba(255,255,255,0.9)', textAlign: 'center' },
});
