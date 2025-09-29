import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const PROJECT_CATEGORIES = ['Technology', 'Business', 'Sustainability', 'Research', 'Arts', 'Sports', 'Healthcare', 'Education'];
const PROJECT_SKILLS = ['React Native', 'Python', 'JavaScript', 'UI/UX Design', 'Machine Learning', 'Data Science', 'Marketing', 'Project Management'];
const PROJECT_STATUS = ['Planning', 'Active', 'Recruiting', 'On Hold'];

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400',
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400',
  'https://images.unsplash.com/photo-1569163139394-de4e4f43e4e3?w=400',
  'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400',
];

export default function CreateProjectScreen() {
  const router = useRouter();
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectLongDescription, setProjectLongDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('Planning');
  const [teamSize, setTeamSize] = useState('');
  const [duration, setDuration] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const isCreateButtonEnabled = projectTitle.trim().length > 0 && projectDescription.trim().length > 0 && selectedCategory;

  const selectImage = (imageUrl: string) => {
    setImage(imageUrl);
    setShowImagePicker(false);
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleCreateProject = () => {
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
      <StatusBar barStyle="light-content" backgroundColor="#7f1d1d" />
      
      {/* Header with gradient */}
      <LinearGradient colors={['#7f1d1d', '#b91c1c']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.headerButtonText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Project</Text>
        <TouchableOpacity 
          style={[styles.createButton, !isCreateButtonEnabled && styles.createButtonDisabled]} 
          disabled={!isCreateButtonEnabled}
          onPress={handleCreateProject}
        >
          <Text style={styles.createButtonText}>Post</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.scrollView}>
        <View style={styles.userInfo}>
          <Image source={{ uri: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' }} style={styles.avatar} />
          <View>
            <Text style={styles.userName}>John Doe</Text>
            <Text style={styles.userRole}>Project Creator</Text>
          </View>
        </View>

        {/* Project Image */}
        {image && (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: image }} style={styles.imagePreview} />
            <TouchableOpacity style={styles.removeImageButton} onPress={() => setImage(null)}>
              <Ionicons name="close-circle" size={24} color="#111111" />
            </TouchableOpacity>
          </View>
        )}

        {/* Project Title */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Project Title *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter your project title"
            value={projectTitle}
            onChangeText={setProjectTitle}
          />
        </View>

        {/* Short Description */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Short Description *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Brief description of your project"
            value={projectDescription}
            onChangeText={setProjectDescription}
            multiline
            numberOfLines={2}
          />
        </View>

        {/* Long Description */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Detailed Description</Text>
          <TextInput
            style={[styles.textInput, styles.longTextInput]}
            placeholder="Provide detailed information about your project, goals, and requirements"
            value={projectLongDescription}
            onChangeText={setProjectLongDescription}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Category Selection */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Category *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            <View style={styles.categoryContainer}>
              {PROJECT_CATEGORIES.map(category => (
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

        {/* Skills Required */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Skills Required</Text>
          <View style={styles.skillsContainer}>
            {PROJECT_SKILLS.map(skill => (
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

        {/* Project Details Row */}
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Text style={styles.inputLabel}>Team Size</Text>
            <TextInput
              style={styles.smallInput}
              placeholder="e.g., 3-5"
              value={teamSize}
              onChangeText={setTeamSize}
            />
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.inputLabel}>Duration</Text>
            <TextInput
              style={styles.smallInput}
              placeholder="e.g., 3 months"
              value={duration}
              onChangeText={setDuration}
            />
          </View>
        </View>

        {/* Status Selection */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Project Status</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            <View style={styles.statusContainer}>
              {PROJECT_STATUS.map(status => (
                <TouchableOpacity 
                  key={status} 
                  style={[styles.statusChip, selectedStatus === status && styles.statusChipSelected]}
                  onPress={() => setSelectedStatus(status)}
                >
                  <Text style={[styles.statusText, selectedStatus === status && styles.statusTextSelected]}>
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Add Media Section */}
        <View style={styles.mediaSection}>
          <TouchableOpacity style={styles.mediaButton} onPress={() => setShowImagePicker(true)}>
            <Ionicons name="image-outline" size={24} color="#059669" />
            <Text style={styles.mediaButtonText}>Add Project Image</Text>
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
            <Text style={styles.modalTitle}>Choose Project Image</Text>
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
            <LinearGradient colors={['#059669', '#10B981']} style={styles.successGradient}>
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Ionicons name="checkmark-circle" size={60} color="white" />
              </Animated.View>
              <Text style={styles.successTitle}>Project Created!</Text>
              <Text style={styles.successMessage}>Your project has been created successfully</Text>
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
  categoryChip: { backgroundColor: '#F0FDF4', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 12, borderWidth: 1, borderColor: '#059669' },
  categoryChipSelected: { backgroundColor: '#059669' },
  categoryText: { color: '#059669', fontWeight: '500' },
  categoryTextSelected: { color: '#FFFFFF' },
  skillsContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  skillChip: { backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: '#D1D5DB' },
  skillChipSelected: { backgroundColor: '#059669', borderColor: '#059669' },
  skillText: { color: '#6B7280', fontWeight: '500', fontSize: 14 },
  skillTextSelected: { color: '#FFFFFF' },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  detailItem: { flex: 1, marginHorizontal: 5 },
  smallInput: { backgroundColor: 'white', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', fontSize: 16, color: '#374151' },
  statusContainer: { flexDirection: 'row', paddingRight: 20 },
  statusChip: { backgroundColor: '#FEF3C7', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 12, borderWidth: 1, borderColor: '#F59E0B' },
  statusChipSelected: { backgroundColor: '#F59E0B' },
  statusText: { color: '#F59E0B', fontWeight: '500' },
  statusTextSelected: { color: '#FFFFFF' },
  mediaSection: { marginBottom: 30 },
  mediaButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', padding: 16, borderRadius: 12, borderWidth: 2, borderColor: '#059669', borderStyle: 'dashed' },
  mediaButtonText: { marginLeft: 8, fontSize: 16, color: '#059669', fontWeight: '500' },
  modalContainer: { flex: 1, backgroundColor: 'white' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  modalCancelText: { fontSize: 16, color: '#059669', fontWeight: '500' },
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
