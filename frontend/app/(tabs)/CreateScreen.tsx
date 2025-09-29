import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import apiService from '../../utils/apiService';
import { useAuth } from '../../contexts/AuthContext';
import {
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface Document {
  name: string;
  uri: string;
  size: number;
  mimeType: string;
}

export default function CreateScreen() {
  const { user } = useAuth();
  const [postType, setPostType] = useState<'post' | 'project' | 'survey'>('post');
  const [postText, setPostText] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState('');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  
  // Project-specific states
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectStatus, setProjectStatus] = useState('Planning');
  const [teamSize, setTeamSize] = useState('');
  const [projectDuration, setProjectDuration] = useState('');
  const [projectIcon, setProjectIcon] = useState('');
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [customLocation, setCustomLocation] = useState('');
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [attachedDocuments, setAttachedDocuments] = useState<Document[]>([]);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  const validateProjectForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!projectTitle.trim()) {
      errors.projectTitle = 'Project title is required';
    }
    
    if (!projectDescription.trim()) {
      errors.projectDescription = 'Project description is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Survey specific states
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const tagInputRef = useRef<TextInput>(null);

  const predefinedTags = [
    'Technology', 'Business', 'Health', 'Education', 'Travel',
    'Food', 'Sports', 'Entertainment', 'Science', 'Art'
  ];

  const locations = [
    'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX',
    'Phoenix, AZ', 'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA',
    'Dallas, TX', 'San Jose, CA'
  ];

  // Validation functions
  const validatePost = () => {
    const errors: {[key: string]: string} = {};
    
    if (!postText.trim()) {
      errors.postText = 'Post content is required';
    } else if (postText.trim().length < 10) {
      errors.postText = 'Post content must be at least 10 characters';
    } else if (postText.trim().length > 2000) {
      errors.postText = 'Post content must be less than 2000 characters';
    }
    
    return errors;
  };


  const validateProject = () => {
    const errors: {[key: string]: string} = {};
    
    if (!projectTitle.trim()) {
      errors.projectTitle = 'Project title is required';
    } else if (projectTitle.trim().length < 5) {
      errors.projectTitle = 'Project title must be at least 5 characters';
    }
    
    if (!projectDescription.trim()) {
      errors.projectDescription = 'Project description is required';
    } else if (projectDescription.trim().length < 50) {
      errors.projectDescription = 'Project description must be at least 50 characters';
    }
    
    if (!projectDuration.trim()) {
      errors.projectDuration = 'Project duration is required';
    }
    
    if (!teamSize.trim()) {
      errors.teamSize = 'Team size is required';
    } else if (isNaN(Number(teamSize)) || Number(teamSize) < 1) {
      errors.teamSize = 'Team size must be a valid number greater than 0';
    }
    
    if (requiredSkills.length === 0) {
      errors.requiredSkills = 'At least one skill is required';
    }
    
    return errors;
  };

  const validateSurvey = () => {
    const errors: {[key: string]: string} = {};
    
    if (!pollQuestion.trim()) {
      errors.pollQuestion = 'Survey question is required';
    } else if (pollQuestion.trim().length < 10) {
      errors.pollQuestion = 'Survey question must be at least 10 characters';
    }
    
    const validOptions = pollOptions.filter(option => option.trim().length > 0);
    if (validOptions.length < 2) {
      errors.pollOptions = 'At least 2 survey options are required';
    }
    
    if (!postText.trim()) {
      errors.postText = 'Survey description is required';
    }
    
    return errors;
  };

  const validateForm = () => {
    let errors: {[key: string]: string} = {};
    
    switch (postType) {
      case 'post':
        errors = validatePost();
        break;
      case 'project':
        errors = validateProject();
        break;
      case 'survey':
        errors = validateSurvey();
        break;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const pickImageFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: 5,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const newImages = result.assets.map(asset => asset.uri);
        setImages([...images, ...newImages]);
      }
    } catch (error) {
      console.error('Error opening gallery:', error);
      Alert.alert('Error', 'Failed to open gallery');
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const selectLocation = (location: string) => {
    if (selectedLocations.includes(location)) {
      setSelectedLocations(prev => prev.filter(loc => loc !== location));
    } else {
      setSelectedLocations(prev => [...prev, location]);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const addCustomTag = () => {
    if (customTagInput.trim() && !selectedTags.includes(customTagInput.trim())) {
      setSelectedTags([...selectedTags, customTagInput.trim()]);
      setCustomTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const addCustomSkill = () => {
    if (customSkillInput.trim() && !requiredSkills.includes(customSkillInput.trim())) {
      setRequiredSkills([...requiredSkills, customSkillInput.trim()]);
      setCustomSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setRequiredSkills(requiredSkills.filter(skill => skill !== skillToRemove));
  };

  const removeLocation = (location: string) => {
    setSelectedLocations(selectedLocations.filter(l => l !== location));
  };

  const addPollOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const updatePollOption = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const createPoll = () => {
    if (pollQuestion.trim() && pollOptions.filter(opt => opt.trim()).length >= 2) {
      setShowPollModal(false);
    }
  };

  const removeDocument = (index: number) => {
    setAttachedDocuments(attachedDocuments.filter((_, i) => i !== index));
  };

  const handlePost = async () => {
    // Clear previous validation errors
    setValidationErrors({});
    
    // Validate form
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors below and try again.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('📝 Creating post...');
      
      // Prepare post data based on type
      let postData: any = {
        content: postText,
        type: postType,
        tags: selectedTags,
        locations: selectedLocations,
        isAnonymous: isAnonymous,
      };
      
      // Add type-specific data
      if (postType === 'project') {
        postData = {
          ...postData,
          title: projectTitle,
          description: projectDescription,
          status: projectStatus,
          teamSize: teamSize,
          duration: projectDuration,
          requiredSkills: requiredSkills,
        };
      } else if (postType === 'survey') {
        postData = {
          ...postData,
          pollQuestion: pollQuestion,
          pollOptions: pollOptions.filter(option => option.trim() !== ''),
        };
      }
      
      // Add images if any (for now, we'll store the URIs - in production you'd upload to cloud storage first)
      if (images.length > 0) {
        postData.imageUrl = images[0]; // For now, just use the first image
        postData.images = images;
      }
      
      // Call real API
      const response = await apiService.post('/posts', postData);
      
      if (response.success) {
        console.log('✅ Post created successfully');
        
        // Show success animation (keeping original design)
        setShowSuccessAnimation(true);
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ]).start(() => {
          setTimeout(() => {
            setShowSuccessAnimation(false);
            fadeAnim.setValue(0);
            scaleAnim.setValue(0);
            
            // Reset form
            resetForm();
            
            router.back();
          }, 2000);
        });
      } else {
        throw new Error(response.error || 'Failed to create post');
      }
    } catch (error) {
      console.error('❌ Error creating post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setPostText('');
    setImages([]);
    setSelectedTags([]);
    setSelectedLocations([]);
    setPollQuestion('');
    setPollOptions(['', '']);
    setAttachedDocuments([]);
    setProjectTitle('');
    setProjectDescription('');
    setProjectDuration('');
    setTeamSize('');
    setRequiredSkills([]);
    setIsAnonymous(false);
    setValidationErrors({});
  };

  const handleDocumentPress = () => {
    setShowDocumentModal(true);
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const newDocument: Document = {
          name: asset.name || 'Unknown Document',
          uri: asset.uri,
          size: asset.size || 0,
          mimeType: asset.mimeType || 'application/octet-stream',
        };
        setAttachedDocuments([...attachedDocuments, newDocument]);
        setShowDocumentModal(false);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document. Please try again.');
    }
  };

  const scrollToTagInput = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 300);
  };

  const isPostButtonEnabled = () => {
    switch (postType) {
      case 'post':
        return postText.trim().length > 0 || images.length > 0;
      case 'survey':
        return postText.trim().length > 0;
      case 'project':
        return projectTitle.trim().length > 0 && projectDescription.trim().length > 0;
      default:
        return false;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create post</Text>
        <TouchableOpacity 
          onPress={handlePost}
          disabled={!isPostButtonEnabled}
          style={[styles.postButton, !isPostButtonEnabled && styles.postButtonDisabled]}
        >
          <Text style={[styles.postButtonText, !isPostButtonEnabled && styles.postButtonTextDisabled]}>
            Post
          </Text>
        </TouchableOpacity>
      </View>

      {/* Post Type Toggle */}
      <View style={styles.postTypeContainer}>
        {(['post', 'project', 'survey'] as const).map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.postTypeButton, postType === type && styles.postTypeButtonActive]}
            onPress={() => setPostType(type)}
          >
            <Ionicons 
              name={type === 'post' ? 'chatbubble-outline' : type === 'project' ? 'briefcase-outline' : 'bar-chart-outline'} 
              size={20} 
              color={postType === type ? '#FFFFFF' : '#7f1d1d'} 
            />
            <Text style={[styles.postTypeText, postType === type && styles.postTypeTextActive]}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView 
          ref={scrollViewRef} 
          style={styles.content} 
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        {/* User Info */}
        <View style={styles.userSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>JD</Text>
          </View>
          <Text style={styles.username}>John Doe</Text>
        </View>

        {/* Dynamic Content Based on Post Type */}
        {postType === 'post' && (
          <View>
            <TextInput
              style={[styles.textInput, validationErrors.postText && styles.inputError]}
              placeholder="What's on your mind?"
              placeholderTextColor="#999"
              value={postText}
              onChangeText={setPostText}
              multiline
              textAlignVertical="top"
            />
            {validationErrors.postText && (
              <Text style={styles.errorText}>{validationErrors.postText}</Text>
            )}
          </View>
        )}

        {postType === 'project' && (
          <View>
            {/* Project Title */}
            <View style={styles.tagInputContainer}>
              <Text style={styles.tagInputLabel}>Project Title *</Text>
              <TextInput
                style={[styles.textInput, validationErrors.projectTitle && styles.inputError]}
                placeholder="Enter your project title (e.g., Campus Sustainability Tracker)"
                placeholderTextColor="#999"
                value={projectTitle}
                onChangeText={setProjectTitle}
              />
              {validationErrors.projectTitle && (
                <Text style={styles.errorText}>{validationErrors.projectTitle}</Text>
              )}
            </View>

            {/* Project Description */}
            <View style={styles.tagInputContainer}>
              <Text style={styles.tagInputLabel}>Project Description *</Text>
              <TextInput
                style={[styles.textInput, validationErrors.projectDescription && styles.inputError]}
                placeholder="Describe your project (e.g., AI-powered app to track and reduce campus carbon footprint)"
                placeholderTextColor="#999"
                value={projectDescription}
                onChangeText={setProjectDescription}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              {validationErrors.projectDescription && (
                <Text style={styles.errorText}>{validationErrors.projectDescription}</Text>
              )}
            </View>

            {/* Project Status */}
            <View style={styles.tagInputContainer}>
              <Text style={styles.tagInputLabel}>Project Status</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {['Planning', 'Active', 'Recruiting', 'On Hold', 'Completed'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[styles.tagChip, projectStatus === status && styles.tagChipSelected]}
                    onPress={() => setProjectStatus(status)}
                  >
                    <Text style={[styles.tagText, projectStatus === status && styles.tagTextSelected]}>
                      {status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Team Size and Duration Row */}
            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Text style={styles.tagInputLabel}>Team Size</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., 4"
                  placeholderTextColor="#999"
                  value={teamSize}
                  onChangeText={setTeamSize}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.tagInputLabel}>Duration</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., 3 months"
                  placeholderTextColor="#999"
                  value={projectDuration}
                  onChangeText={setProjectDuration}
                />
              </View>
            </View>

            {/* Required Skills */}
            <View style={styles.tagInputContainer}>
              <Text style={styles.tagInputLabel}>Required Skills</Text>
              
              {/* Custom Skill Input */}
              <View style={styles.customTagContainer}>
                <TextInput
                  style={styles.customTagInput}
                  placeholder="Type a skill and press Enter..."
                  placeholderTextColor="#999"
                  value={customSkillInput}
                  onChangeText={setCustomSkillInput}
                  onSubmitEditing={addCustomSkill}
                  returnKeyType="done"
                />
                {customSkillInput.trim() && (
                  <TouchableOpacity style={styles.addTagButton} onPress={addCustomSkill}>
                    <Ionicons name="add" size={20} color="#7f1d1d" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Selected Skills Display */}
              {requiredSkills.length > 0 && (
                <View style={styles.tagsContainer}>
                  {requiredSkills.map((skill) => (
                    <View key={skill} style={styles.customTagChip}>
                      <Text style={styles.customTagText}>{skill}</Text>
                      <TouchableOpacity onPress={() => removeSkill(skill)}>
                        <Ionicons name="close" size={16} color="#666" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        {postType === 'survey' && (
          <View>
            <TextInput
              style={styles.textInput}
              placeholder="Describe your startup idea, ask for feedback, or share your story..."
              placeholderTextColor="#999"
              value={postText}
              onChangeText={setPostText}
              multiline
              textAlignVertical="top"
            />
            
            {/* Anonymous Toggle */}
            <View style={styles.anonymousContainer}>
              <Text style={styles.anonymousLabel}>Anonymous Survey</Text>
              <TouchableOpacity 
                style={[styles.toggleButton, isAnonymous && styles.toggleButtonActive]}
                onPress={() => setIsAnonymous(!isAnonymous)}
              >
                <View style={[styles.toggleCircle, isAnonymous && styles.toggleCircleActive]} />
              </TouchableOpacity>
            </View>
            
            {/* Fixed Survey Options Preview */}
            <View style={styles.surveyOptionsContainer}>
              <Text style={styles.surveyOptionsTitle}>Voting Options:</Text>
              <View style={styles.surveyOption}>
                <Text style={styles.surveyOptionEmoji}>✅</Text>
                <Text style={styles.surveyOptionText}>Good Idea</Text>
              </View>
              <View style={styles.surveyOption}>
                <Text style={styles.surveyOptionEmoji}>❌</Text>
                <Text style={styles.surveyOptionText}>Needs improvement</Text>
              </View>
              <View style={styles.surveyOption}>
                <Text style={styles.surveyOptionEmoji}>💡</Text>
                <Text style={styles.surveyOptionText}>Has Potential</Text>
              </View>
            </View>
          </View>
        )}


        {/* Image Preview */}
        {images.length > 0 && (
          <View style={styles.imageContainer}>
            {images.map((uri, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri }} style={styles.imagePreview} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => removeImage(index)}
                >
                  <Ionicons name="close" size={16} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Poll Preview */}
        {pollQuestion.trim() && (
          <View style={styles.pollContainer}>
            <Text style={styles.pollQuestion}>{pollQuestion}</Text>
            {pollOptions.filter(opt => opt.trim()).map((option, index) => (
              <View key={index} style={styles.pollOption}>
                <Text style={styles.pollOptionText}>{option}</Text>
              </View>
            ))}
            <TouchableOpacity
              style={styles.removePollButton}
              onPress={() => {
                setPollQuestion('');
                setPollOptions(['', '']);
              }}
            >
              <Text style={styles.removePollText}>Remove Poll</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Documents Preview */}
        {attachedDocuments.length > 0 && (
          <View style={styles.documentsContainer}>
            {attachedDocuments.map((doc, index) => (
              <View key={index} style={styles.documentItem}>
                <Ionicons name="document-text" size={24} color="#7f1d1d" />
                <View style={styles.documentInfo}>
                  <Text style={styles.documentName}>{doc.name}</Text>
                  <Text style={styles.documentSize}>
                    {(doc.size / 1024 / 1024).toFixed(2)} MB
                  </Text>
                </View>
                <TouchableOpacity onPress={() => removeDocument(index)}>
                  <Ionicons name="close" size={20} color="#666" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Location Preview */}
        {selectedLocations.length > 0 && (
          <View style={styles.locationContainer}>
            {selectedLocations.map((location, index) => (
              <View key={index} style={styles.locationChip}>
                <Ionicons name="location" size={16} color="#7f1d1d" />
                <Text style={styles.locationText}>{location}</Text>
                <TouchableOpacity onPress={() => removeLocation(location)}>
                  <Ionicons name="close" size={16} color="#666" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionButton} onPress={pickImageFromGallery}>
            <Ionicons name="image" size={24} color="#7f1d1d" />
            <Text style={styles.actionButtonLabel}>Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => setShowLocationModal(true)}>
            <Ionicons name="location" size={24} color="#7f1d1d" />
            <Text style={styles.actionButtonLabel}>Location</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => setShowPollModal(true)}>
            <Ionicons name="bar-chart" size={24} color="#7f1d1d" />
            <Text style={styles.actionButtonLabel}>Poll</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleDocumentPress}>
            <Ionicons name="document" size={24} color="#7f1d1d" />
            <Text style={styles.actionButtonLabel}>Document</Text>
          </TouchableOpacity>
        </View>

        {/* Tags Section */}
        <View style={styles.tagsSection}>
          <Text style={styles.sectionTitle}>Add tags</Text>
          
          {/* Custom Tag Input */}
          <View style={styles.customTagContainer}>
            <TextInput
              ref={tagInputRef}
              style={styles.customTagInput}
              placeholder="Type a custom tag..."
              placeholderTextColor="#999"
              value={customTagInput}
              onChangeText={setCustomTagInput}
              onSubmitEditing={addCustomTag}
              onFocus={scrollToTagInput}
              returnKeyType="done"
            />
            {customTagInput.trim() && (
              <TouchableOpacity style={styles.addTagButton} onPress={addCustomTag}>
                <Ionicons name="add" size={20} color="#7f1d1d" />
              </TouchableOpacity>
            )}
          </View>

          {/* Predefined Tags */}
          <View style={styles.tagsContainer}>
            {predefinedTags.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[
                  styles.tagChip,
                  selectedTags.includes(tag) && styles.tagChipSelected
                ]}
                onPress={() => toggleTag(tag)}
              >
                <Text style={[
                  styles.tagText,
                  selectedTags.includes(tag) && styles.tagTextSelected
                ]}>
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Selected Custom Tags */}
          {selectedTags.filter(tag => !predefinedTags.includes(tag)).length > 0 && (
            <View style={styles.tagsContainer}>
              {selectedTags.filter(tag => !predefinedTags.includes(tag)).map((tag) => (
                <View key={tag} style={styles.customTagChip}>
                  <Text style={styles.customTagText}>{tag}</Text>
                  <TouchableOpacity onPress={() => removeTag(tag)}>
                    <Ionicons name="close" size={16} color="#666" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Location Modal */}
      <Modal visible={showLocationModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Location</Text>
              <TouchableOpacity onPress={() => setShowLocationModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <View style={styles.locationInputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Enter location (e.g., New York, NY or Remote)"
                placeholderTextColor="#999"
                value={customLocation}
                onChangeText={setCustomLocation}
                autoFocus
              />
              <TouchableOpacity 
                style={styles.addLocationButton}
                onPress={() => {
                  if (customLocation.trim()) {
                    setSelectedLocations([customLocation.trim()]);
                    setCustomLocation('');
                    setShowLocationModal(false);
                  }
                }}
              >
                <Text style={styles.addLocationButtonText}>Add Location</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Poll Modal */}
      <Modal visible={showPollModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Poll</Text>
              <TouchableOpacity onPress={() => setShowPollModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pollModalContent}>
              <TextInput
                style={styles.pollQuestionInput}
                placeholder="Ask a question..."
                placeholderTextColor="#999"
                value={pollQuestion}
                onChangeText={setPollQuestion}
                multiline
              />
              {pollOptions.map((option, index) => (
                <View key={index} style={styles.pollOptionContainer}>
                  <TextInput
                    style={styles.pollOptionInput}
                    placeholder={`Option ${index + 1}`}
                    placeholderTextColor="#999"
                    value={option}
                    onChangeText={(value) => updatePollOption(index, value)}
                  />
                  {pollOptions.length > 2 && (
                    <TouchableOpacity onPress={() => removePollOption(index)}>
                      <Ionicons name="close" size={20} color="#666" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              {pollOptions.length < 4 && (
                <TouchableOpacity style={styles.addOptionButton} onPress={addPollOption}>
                  <Ionicons name="add" size={20} color="#7f1d1d" />
                  <Text style={styles.addOptionText}>Add option</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.createPollButton} onPress={createPoll}>
                <Text style={styles.createPollText}>Create Poll</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Success Animation */}
      {showSuccessAnimation && (
        <Modal transparent visible={showSuccessAnimation}>
          <View style={styles.successOverlay}>
            <Animated.View
              style={[
                styles.successModal,
                {
                  opacity: fadeAnim,
                  transform: [
                    { scale: scaleAnim },
                    { translateY: slideAnim }
                  ]
                }
              ]}
            >
              <Ionicons name="checkmark-circle" size={60} color="#4CAF50" />
              <Text style={styles.successTitle}>{postType.charAt(0).toUpperCase() + postType.slice(1)} Created!</Text>
              <Text style={styles.successSubtitle}>Your {postType} has been shared successfully</Text>
            </Animated.View>
          </View>
        </Modal>
      )}

      {/* Document Picker Modal */}
      <Modal visible={showDocumentModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Attach Document</Text>
              <TouchableOpacity onPress={() => setShowDocumentModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <View style={styles.documentOptions}>
              <TouchableOpacity style={styles.documentOption} onPress={pickDocument}>
                <Ionicons name="document" size={32} color="#7f1d1d" />
                <Text style={styles.documentOptionText}>Browse Files</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  cancelButton: {
    fontSize: 16,
    color: '#6B7280',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  postButton: {
    backgroundColor: '#7f1d1d',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  postButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  postButtonTextDisabled: {
    color: '#9CA3AF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7f1d1d',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  username: {
    fontSize: 16,
    fontWeight: '500',
    color: '#7f1d1d',
  },
  textInput: {
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFF2E8',
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#fef2f2',
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 8,
    marginBottom: 8,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pollContainer: {
    backgroundColor: '#FFF2E8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fef2f2',
  },
  pollQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  pollOption: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pollOptionText: {
    fontSize: 14,
    color: '#374151',
  },
  removePollButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  removePollText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '500',
  },
  documentsContainer: {
    marginBottom: 16,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF2E8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#fef2f2',
  },
  documentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  documentName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  documentSize: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  locationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  locationText: {
    fontSize: 14,
    color: '#7f1d1d',
    marginLeft: 4,
    marginRight: 4,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 16,
  },
  actionButton: {
    padding: 8,
    alignItems: 'center',
  },
  actionButtonLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '500',
  },
  tagsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  customTagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF2E8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fef2f2',
    marginBottom: 12,
  },
  customTagInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  addTagButton: {
    padding: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tagChip: {
    backgroundColor: '#fef2f2',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#7f1d1d',
  },
  tagChipSelected: {
    backgroundColor: '#7f1d1d',
    borderColor: '#8B1A1A',
  },
  tagText: {
    fontSize: 14,
    color: '#7f1d1d',
  },
  tagTextSelected: {
    color: '#FFFFFF',
  },
  customTagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  customTagText: {
    fontSize: 14,
    color: '#7f1d1d',
    marginRight: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF2E8',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  locationList: {
    maxHeight: 400,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  locationItemSelected: {
    backgroundColor: '#FEF2F2',
  },
  locationItemText: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  locationItemTextSelected: {
    color: '#7f1d1d',
    fontWeight: '500',
  },
  pollModalContent: {
    padding: 16,
    maxHeight: 400,
  },
  pollQuestionInput: {
    backgroundColor: '#FFF2E8',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
    textAlignVertical: 'top',
    minHeight: 80,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fef2f2',
  },
  pollOptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pollOptionInput: {
    flex: 1,
    backgroundColor: '#FFF2E8',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#fef2f2',
  },
  addOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#8B1A1A',
    borderStyle: 'dashed',
  },
  addOptionText: {
    color: '#7f1d1d',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  createPollButton: {
    backgroundColor: '#7f1d1d',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  createPollText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  documentOptions: {
    padding: 20,
  },
  documentOption: {
    alignItems: 'center',
    backgroundColor: '#FFF2E8',
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: '#fef2f2',
    borderStyle: 'dashed',
  },
  documentOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#7f1d1d',
    marginTop: 8,
  },
  postTypeContainer: {
    flexDirection: 'row',
    backgroundColor: '#fef2f2',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#7f1d1d',
  },
  postTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 6,
  },
  postTypeButtonActive: {
    backgroundColor: '#7f1d1d',
  },
  postTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f1d1d',
  },
  postTypeTextActive: {
    color: '#FFFFFF',
  },
  inputField: {
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFF2E8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#fef2f2',
  },
  halfInputField: {
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFF2E8',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#fef2f2',
    flex: 1,
  },
  projectDetailsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  anonymousContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF2E8',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fef2f2',
  },
  anonymousLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  toggleButton: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleButtonActive: {
    backgroundColor: '#7f1d1d',
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
  },
  toggleCircleActive: {
    alignSelf: 'flex-end',
  },
  surveyOptionsContainer: {
    backgroundColor: '#FFF2E8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fef2f2',
  },
  surveyOptionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  surveyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  surveyOptionEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  surveyOptionText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  inputError: {
    borderColor: '#EF4444',
    borderWidth: 1,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  // Project-specific styles
  tagInputContainer: {
    marginBottom: 20,
  },
  tagInputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  detailItem: {
    flex: 1,
  },
  locationInputContainer: {
    padding: 20,
  },
  addLocationButton: {
    backgroundColor: '#7f1d1d',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  addLocationButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

// Install expo-document-picker: npx expo install expo-document-picker