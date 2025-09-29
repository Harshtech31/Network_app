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

const GROUP_CATEGORIES = ['Study Group', 'Project Team', 'Research Circle', 'Social Club', 'Academic', 'Professional', 'Creative', 'Sports'];
const GROUP_PRIVACY = ['Public', 'Private', 'Invite Only'];
const GROUP_SIZE = ['Small (5-15)', 'Medium (16-30)', 'Large (31-50)', 'Extra Large (50+)'];
const MEETING_FREQUENCY = ['Daily', 'Weekly', 'Bi-weekly', 'Monthly', 'As Needed'];

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400',
  'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400',
  'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=400',
  'https://images.unsplash.com/photo-1515378791036-0648a814c963?w=400',
];

export default function CreateGroupScreen() {
  const router = useRouter();
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupPurpose, setGroupPurpose] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPrivacy, setSelectedPrivacy] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedFrequency, setSelectedFrequency] = useState('');
  const [meetingLocation, setMeetingLocation] = useState('');
  const [groupRules, setGroupRules] = useState('');
  const [expectations, setExpectations] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const isCreateButtonEnabled = groupName.trim().length > 0 && groupDescription.trim().length > 0 && selectedCategory && selectedPrivacy;

  const selectImage = (imageUrl: string) => {
    setImage(imageUrl);
    setShowImagePicker(false);
  };

  const handleCreateGroup = () => {
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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#7f1d1d" translucent={false} />
      
      {/* Cover Header with gradient */}
      <View style={styles.coverHeader}>
        <LinearGradient
          colors={['#7f1d1d', '#7f1d1d', '#7f1d1d']}
          style={styles.coverGradient}
        >
          <View style={styles.headerContent}>
            <Text style={styles.coverHeaderTitle}>Build Your Community</Text>
            <Text style={styles.coverHeaderSubtitle}>Create a space where like-minded individuals can connect, learn, and grow together</Text>
          </View>
        </LinearGradient>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Main Content Card */}
        <View style={styles.mainContentCard}>
          <View style={styles.userInfo}>
            <Image source={{ uri: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' }} style={styles.avatar} />
            <View>
              <Text style={styles.userName}>John Doe</Text>
              <Text style={styles.userRole}>Group Creator</Text>
            </View>
          </View>

          {/* Group Image */}
          {image && (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: image }} style={styles.imagePreview} />
              <TouchableOpacity style={styles.removeImageButton} onPress={() => setImage(null)}>
                <Ionicons name="close-circle" size={24} color="#111111" />
              </TouchableOpacity>
            </View>
          )}

          {/* Group Name */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Group Name *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter group name"
              value={groupName}
              onChangeText={setGroupName}
            />
          </View>

          {/* Description */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Description *</Text>
            <TextInput
              style={[styles.textInput, styles.longTextInput]}
              placeholder="Describe what your group is about"
              value={groupDescription}
              onChangeText={setGroupDescription}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Purpose & Goals */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Purpose & Goals</Text>
            <TextInput
              style={[styles.textInput, styles.longTextInput]}
              placeholder="What do you hope to achieve with this group?"
              value={groupPurpose}
              onChangeText={setGroupPurpose}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Category Selection */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Group Category *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              <View style={styles.categoryContainer}>
                {GROUP_CATEGORIES.map(category => (
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

          {/* Privacy Setting */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Privacy Setting *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              <View style={styles.privacyContainer}>
                {GROUP_PRIVACY.map(privacy => (
                  <TouchableOpacity 
                    key={privacy} 
                    style={[styles.privacyChip, selectedPrivacy === privacy && styles.privacyChipSelected]}
                    onPress={() => setSelectedPrivacy(privacy)}
                  >
                    <Text style={[styles.privacyText, selectedPrivacy === privacy && styles.privacyTextSelected]}>
                      {privacy}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Group Size */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Expected Group Size</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.sizeContainer}>
                {GROUP_SIZE.map(size => (
                  <TouchableOpacity 
                    key={size} 
                    style={[styles.sizeChip, selectedSize === size && styles.sizeChipSelected]}
                    onPress={() => setSelectedSize(size)}
                  >
                    <Text style={[styles.sizeText, selectedSize === size && styles.sizeTextSelected]}>
                      {size}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Meeting Frequency */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Meeting Frequency</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              <View style={styles.frequencyContainer}>
                {MEETING_FREQUENCY.map(frequency => (
                  <TouchableOpacity 
                    key={frequency} 
                    style={[styles.frequencyChip, selectedFrequency === frequency && styles.frequencyChipSelected]}
                    onPress={() => setSelectedFrequency(frequency)}
                  >
                    <Text style={[styles.frequencyText, selectedFrequency === frequency && styles.frequencyTextSelected]}>
                      {frequency}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Meeting Location */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Meeting Location <Text style={styles.optionalText}>(Optional)</Text></Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., Library Room 201, Online via Zoom, Campus Café"
              value={meetingLocation}
              onChangeText={setMeetingLocation}
            />
          </View>

          {/* Group Rules */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Group Rules & Guidelines</Text>
            <TextInput
              style={[styles.textInput, styles.longTextInput]}
              placeholder="Set clear expectations and rules for group members"
              value={groupRules}
              onChangeText={setGroupRules}
              multiline
              numberOfLines={2}
            />
          </View>

          {/* Member Expectations */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>What We Expect From Members</Text>
            <TextInput
              style={[styles.textInput, styles.longTextInput]}
              placeholder="Describe what kind of commitment and participation you expect"
              value={expectations}
              onChangeText={setExpectations}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Add Media Section */}
          <View style={styles.mediaSection}>
            <TouchableOpacity style={styles.mediaButton} onPress={() => setShowImagePicker(true)}>
              <Ionicons name="image-outline" size={24} color="#7f1d1d" />
              <Text style={styles.mediaButtonText}>Add Group Image</Text>
            </TouchableOpacity>
          </View>

          {/* Create Group Button */}
          <View style={styles.postButtonContainer}>
            <TouchableOpacity 
              style={[styles.createGroupButton, !isCreateButtonEnabled && styles.postButtonDisabled]} 
              disabled={!isCreateButtonEnabled}
              onPress={handleCreateGroup}
            >
              <Text style={styles.postButtonText}>Create Group</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Image Picker Modal */}
      <Modal visible={showImagePicker} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowImagePicker(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Choose Group Image</Text>
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
            <LinearGradient colors={['#7f1d1d', '#7f1d1d']} style={styles.successGradient}>
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Ionicons name="checkmark-circle" size={60} color="white" />
              </Animated.View>
              <Text style={styles.successTitle}>Group Created!</Text>
              <Text style={styles.successMessage}>Your group has been created successfully and is ready for members</Text>
            </LinearGradient>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF2E8' },
  coverHeader: {
    height: 200,
    position: 'relative',
  },
  coverGradient: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
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
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  scrollView: { 
    flex: 1,
    backgroundColor: '#FFF2E8',
  },
  mainContentCard: {
    backgroundColor: '#FFF4E9',
    borderRadius: 20,
    margin: 20,
    marginTop: 20,
    padding: 20,
    shadowColor: '#7f1d1d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  userInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#374151' },
  userRole: { fontSize: 14, color: '#6B7280', marginTop: 2 },
  imagePreviewContainer: { marginBottom: 20, position: 'relative' },
  imagePreview: { width: '100%', height: 200, borderRadius: 12 },
  removeImageButton: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 12, padding: 4 },
  inputSection: { marginBottom: 20 },
  inputLabel: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8 },
  textInput: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(153, 27, 27, 0.2)', fontSize: 16, color: '#374151' },
  longTextInput: { minHeight: 100, textAlignVertical: 'top' },
  horizontalScroll: { marginTop: 8 },
  categoryContainer: { flexDirection: 'row', paddingRight: 20 },
  categoryChip: { backgroundColor: '#fef2f2', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 12, borderWidth: 1, borderColor: '#7f1d1d' },
  categoryChipSelected: { backgroundColor: '#7f1d1d' },
  categoryText: { color: '#7f1d1d', fontWeight: '500' },
  categoryTextSelected: { color: '#FFFFFF' },
  privacyContainer: { flexDirection: 'row', paddingRight: 20 },
  privacyChip: { backgroundColor: '#fef2f2', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 12, borderWidth: 1, borderColor: '#7f1d1d' },
  privacyChipSelected: { backgroundColor: '#7f1d1d' },
  privacyText: { color: '#7f1d1d', fontWeight: '500' },
  privacyTextSelected: { color: '#FFFFFF' },
  sizeContainer: { flexDirection: 'row', paddingRight: 20 },
  sizeChip: { backgroundColor: '#fef2f2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 8, borderWidth: 1, borderColor: '#7f1d1d' },
  sizeChipSelected: { backgroundColor: '#7f1d1d' },
  sizeText: { color: '#7f1d1d', fontWeight: '500', fontSize: 12 },
  sizeTextSelected: { color: '#FFFFFF' },
  frequencyContainer: { flexDirection: 'row', paddingRight: 20 },
  frequencyChip: { backgroundColor: '#fef2f2', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 12, borderWidth: 1, borderColor: '#7f1d1d' },
  frequencyChipSelected: { backgroundColor: '#7f1d1d' },
  frequencyText: { color: '#7f1d1d', fontWeight: '500' },
  frequencyTextSelected: { color: '#FFFFFF' },
  mediaSection: { marginBottom: 30 },
  mediaButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', padding: 16, borderRadius: 12, borderWidth: 2, borderColor: '#7f1d1d', borderStyle: 'dashed' },
  mediaButtonText: { marginLeft: 8, fontSize: 16, color: '#7f1d1d', fontWeight: '500' },
  postButtonContainer: {
    marginTop: 30,
    marginBottom: 20,
  },
  createGroupButton: {
    backgroundColor: '#7f1d1d',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#7f1d1d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  postButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0.1,
  },
  postButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  optionalText: { fontSize: 14, color: '#9CA3AF', fontWeight: '400' },
  modalContainer: { flex: 1, backgroundColor: 'white' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  modalCancelText: { fontSize: 16, color: '#7f1d1d', fontWeight: '500' },
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