import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
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

const COLLABORATION_TYPES = ['Research', 'Business', 'Creative', 'Technical', 'Academic', 'Social Impact', 'Innovation', 'Startup'];
const COLLABORATION_SKILLS = ['Leadership', 'Communication', 'Technical Writing', 'Design', 'Development', 'Marketing', 'Finance', 'Strategy'];
const COLLABORATION_DURATION = ['1-3 months', '3-6 months', '6-12 months', '1+ years', 'Ongoing'];
const COMMITMENT_LEVELS = ['Part-time', 'Full-time', 'Flexible', 'Weekend only'];

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400',
  'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400',
  'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=400',
  'https://images.unsplash.com/photo-1515378791036-0648a814c963?w=400',
];

export default function CreateCollaborationScreen() {
  const router = useRouter();
  const [collaborationTitle, setCollaborationTitle] = useState('');
  const [collaborationDescription, setCollaborationDescription] = useState('');
  const [collaborationGoals, setCollaborationGoals] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedDuration, setSelectedDuration] = useState('');
  const [selectedCommitment, setSelectedCommitment] = useState('');
  const [lookingFor, setLookingFor] = useState('');
  const [requirements, setRequirements] = useState('');
  const [benefits, setBenefits] = useState('');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const isCreateButtonEnabled = collaborationTitle.trim().length > 0 && collaborationDescription.trim().length > 0 && selectedType;

  const selectImage = (imageUrl: string) => {
    setImage(imageUrl);
    setShowImagePicker(false);
  };

  const pickImageFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
      setShowImagePicker(false);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
      setShowImagePicker(false);
    }
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleCreateCollaboration = () => {
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
      
      {/* Header like home screen */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#7f1d1d" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Create Collaboration</Text>
        
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Main Content Card */}
        <View style={styles.mainContentCard}>
          <View style={styles.userInfo}>
            <Image source={{ uri: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' }} style={styles.avatar} />
            <View>
              <Text style={styles.userName}>John Doe</Text>
              <Text style={styles.userRole}>Collaboration Initiator</Text>
            </View>
          </View>

          {/* Collaboration Image */}
          {image && (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: image }} style={styles.imagePreview} />
              <TouchableOpacity style={styles.removeImageButton} onPress={() => setImage(null)}>
                <Ionicons name="close-circle" size={24} color="#111111" />
              </TouchableOpacity>
            </View>
          )}

          {/* Collaboration Title */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Collaboration Title *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter collaboration title"
              value={collaborationTitle}
              onChangeText={setCollaborationTitle}
            />
          </View>

          {/* Description */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Description *</Text>
            <TextInput
              style={[styles.textInput, styles.longTextInput]}
              placeholder="Describe what you want to collaborate on"
              value={collaborationDescription}
              onChangeText={setCollaborationDescription}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Goals & Objectives */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Goals & Objectives</Text>
            <TextInput
              style={[styles.textInput, styles.longTextInput]}
              placeholder="What do you hope to achieve through this collaboration?"
              value={collaborationGoals}
              onChangeText={setCollaborationGoals}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Type Selection */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Collaboration Type *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              <View style={styles.typeContainer}>
                {COLLABORATION_TYPES.map(type => (
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

          {/* Skills Needed */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Skills Needed</Text>
            <View style={styles.skillsContainer}>
              {COLLABORATION_SKILLS.map(skill => (
                <TouchableOpacity 
                  key={skill} 
                  style={[styles.skillChip, selectedSkills.includes(skill) && styles.skillChipSelected]}
                  onPress={() => toggleSkill(skill)}
                >
                  <Text style={[styles.skillText, selectedSkills.includes(skill) && styles.skillTextSelected]}>
                    {skill}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Duration */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Duration</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.durationContainer}>
                {COLLABORATION_DURATION.map(duration => (
                  <TouchableOpacity 
                    key={duration} 
                    style={[styles.durationChip, selectedDuration === duration && styles.durationChipSelected]}
                    onPress={() => setSelectedDuration(duration)}
                  >
                    <Text style={[styles.durationText, selectedDuration === duration && styles.durationTextSelected]}>
                      {duration}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Location (Optional) */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Location <Text style={styles.optionalText}>(Optional)</Text></Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., Remote, Hybrid, On-campus, Specific building/room"
              value={location}
              onChangeText={setLocation}
            />
          </View>

          {/* Commitment Level */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Commitment Level</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              <View style={styles.commitmentContainer}>
                {COMMITMENT_LEVELS.map(commitment => (
                  <TouchableOpacity 
                    key={commitment} 
                    style={[styles.commitmentChip, selectedCommitment === commitment && styles.commitmentChipSelected]}
                    onPress={() => setSelectedCommitment(commitment)}
                  >
                    <Text style={[styles.commitmentText, selectedCommitment === commitment && styles.commitmentTextSelected]}>
                      {commitment}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Looking For */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Looking For</Text>
            <TextInput
              style={[styles.textInput, styles.longTextInput]}
              placeholder="Describe the type of collaborators you're seeking"
              value={lookingFor}
              onChangeText={setLookingFor}
              multiline
              numberOfLines={2}
            />
          </View>

          {/* Requirements */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Requirements</Text>
            <TextInput
              style={[styles.textInput, styles.longTextInput]}
              placeholder="Any specific requirements or qualifications"
              value={requirements}
              onChangeText={setRequirements}
              multiline
              numberOfLines={2}
            />
          </View>

          {/* Benefits */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>What's In It For Collaborators</Text>
            <TextInput
              style={[styles.textInput, styles.longTextInput]}
              placeholder="What benefits, learning opportunities, or rewards can collaborators expect?"
              value={benefits}
              onChangeText={setBenefits}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Add Media Section */}
          <View style={styles.mediaSection}>
            <Text style={styles.inputLabel}>Add Collaboration Images</Text>
            <View style={styles.imagePickerContainer}>
              <TouchableOpacity style={styles.mediaButton} onPress={pickImageFromGallery}>
                <Ionicons name="image-outline" size={24} color="#7f1d1d" />
                <Text style={styles.mediaButtonText}>Choose from Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.mediaButton} onPress={takePhoto}>
                <Ionicons name="camera-outline" size={24} color="#7f1d1d" />
                <Text style={styles.mediaButtonText}>Take Photo</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Post Collaboration Button */}
          <View style={styles.postButtonContainer}>
            <TouchableOpacity 
              style={[styles.postCollaborationButton, !isCreateButtonEnabled && styles.postButtonDisabled]} 
              disabled={!isCreateButtonEnabled}
              onPress={handleCreateCollaboration}
            >
              <Text style={styles.postButtonText}>Post Collaboration</Text>
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
            <Text style={styles.modalTitle}>Choose Collaboration Image</Text>
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
            <LinearGradient colors={['#DC2626', '#EF4444']} style={styles.successGradient}>
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Ionicons name="checkmark-circle" size={60} color="white" />
              </Animated.View>
              <Text style={styles.successTitle}>Collaboration Created!</Text>
              <Text style={styles.successMessage}>Your collaboration opportunity has been posted successfully</Text>
            </LinearGradient>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF2E8' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FFF2E8',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7f1d1d',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
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
  floatingHeaderButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  floatingButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
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
  createButton: { backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  createButtonDisabled: { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.1)' },
  scrollView: { 
    flex: 1,
    backgroundColor: '#FFF2E8',
  },
  mainContentCard: {
    backgroundColor: '#FFFFFF',
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
  typeContainer: { flexDirection: 'row', paddingRight: 20 },
  typeChip: { backgroundColor: '#FEF2F2', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 12, borderWidth: 1, borderColor: '#7f1d1d' },
  typeChipSelected: { backgroundColor: '#7f1d1d' },
  typeText: { color: '#7f1d1d', fontWeight: '500' },
  typeTextSelected: { color: '#FFFFFF' },
  skillsContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  skillChip: { backgroundColor: '#FEF2F2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: '#7f1d1d' },
  skillChipSelected: { backgroundColor: '#7f1d1d', borderColor: '#7f1d1d' },
  skillText: { color: '#6B7280', fontWeight: '500', fontSize: 14 },
  skillTextSelected: { color: '#FFFFFF' },
  detailsRow: { marginBottom: 20 },
  detailItem: { flex: 1 },
  durationContainer: { flexDirection: 'row', paddingRight: 20 },
  durationChip: { backgroundColor: '#FEF2F2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 8, borderWidth: 1, borderColor: '#7f1d1d' },
  durationChipSelected: { backgroundColor: '#7f1d1d' },
  durationText: { color: '#7f1d1d', fontWeight: '500', fontSize: 12 },
  durationTextSelected: { color: '#FFFFFF' },
  commitmentContainer: { flexDirection: 'row', paddingRight: 20 },
  commitmentChip: { backgroundColor: '#FEF2F2', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 12, borderWidth: 1, borderColor: '#7f1d1d' },
  commitmentChipSelected: { backgroundColor: '#7f1d1d' },
  commitmentText: { color: '#7f1d1d', fontWeight: '500' },
  commitmentTextSelected: { color: '#FFFFFF' },
  mediaSection: { marginBottom: 30 },
  imagePickerContainer: { flexDirection: 'row', gap: 12 },
  mediaButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', padding: 16, borderRadius: 12, borderWidth: 2, borderColor: '#7f1d1d', borderStyle: 'dashed' },
  mediaButtonText: { marginLeft: 8, fontSize: 14, color: '#7f1d1d', fontWeight: '500' },
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
  optionalText: { fontSize: 14, color: '#9CA3AF', fontWeight: '400' },
  postButtonContainer: {
    marginTop: 30,
    marginBottom: 20,
  },
  postCollaborationButton: {
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
});