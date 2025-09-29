import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  Alert,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../utils/authService';

const { width } = Dimensions.get('window');

export default function EditProfileScreen() {
  const { user, refreshUser } = useAuth();
  
  // Profile data state - initialized with real user data
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    handle: '',
    college: '',
    joinedDate: '',
    bio: '',
    about: '',
    role: 'student' as 'student' | 'teacher' | 'alumni',
    skills: [] as string[],
    contact: {
      email: '',
      phone: '',
      website: '',
      github: '',
      linkedin: ''
    },
    academic: {
      year: '',
      major: '',
      gpa: ''
    },
    interests: [] as string[],
    projects: [] as Array<{id: string, title: string, description: string, status: string}>,
    events: [] as Array<{id: string, title: string, date: string, description: string}>,
    achievements: [] as Array<{id: string, title: string, description: string, date: string}>
  });

  // Calendar and modal states
  const [showCalendar, setShowCalendar] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showAchievementModal, setShowAchievementModal] = useState(false);

  // Form states for modals
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    status: 'In Progress'
  });
  
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: ''
  });
  
  const [achievementForm, setAchievementForm] = useState({
    title: '',
    description: '',
    date: ''
  });

  // Initialize profile data with user data
  useEffect(() => {
    if (user) {
      setProfileData({
        name: `${user.firstName} ${user.lastName}`,
        handle: user.username ? `@${user.username}` : '',
        college: user.department || '',
        joinedDate: 'Recently joined',
        bio: `${user.firstName} is a student in ${user.department || 'their chosen field'}.`,
        about: `${user.firstName} is a student in ${user.department || 'their chosen field'}.`,
        role: 'student' as 'student' | 'teacher' | 'alumni',
        skills: [],
        contact: {
          email: user.email || '',
          phone: '',
          website: '',
          github: '',
          linkedin: ''
        },
        academic: {
          year: user.year ? user.year.toString() : '',
          major: user.department || '',
          gpa: ''
        },
        interests: [],
        projects: [],
        events: [],
        achievements: []
      });
    }
  }, [user]);

  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');

  // Helper function to get role emoji
  const getRoleEmoji = (role: string) => {
    switch (role) {
      case 'student': return '🎓';
      case 'teacher': return '👨‍🏫';
      case 'alumni': return '👥';
      default: return '🎓';
    }
  };

  // Check if teacher role is accessible based on email domain
  const isTeacherRoleAccessible = () => {
    const email = profileData.contact.email;
    // Teacher role is only accessible for staff/faculty email domains
    return email.includes('@staff.') || email.includes('@faculty.') || email.includes('@birmingham.ac.ae');
  };

  // Available roles based on email domain
  const availableRoles = useMemo(() => {
    const roles = [
      { value: 'student', label: 'Student', emoji: '🎓' },
      { value: 'alumni', label: 'Alumni', emoji: '👥' }
    ];
    
    if (isTeacherRoleAccessible()) {
      roles.push({ value: 'teacher', label: 'Teacher', emoji: '👨‍🏫' });
    }
    
    return roles;
  }, [profileData.contact.email]);

  const handleSave = useCallback(async () => {
    if (isSaving) return; // Prevent multiple submissions
    
    try {
      setIsSaving(true);
      
      // Validate required fields
      const nameParts = profileData.name.trim().split(' ');
      const firstName = nameParts[0]?.trim() || '';
      const lastName = nameParts.slice(1).join(' ').trim() || '';
      
      if (!firstName) {
        Alert.alert('Validation Error', 'First name is required.');
        return;
      }
      
      if (!lastName || lastName.length < 1) {
        Alert.alert('Validation Error', 'Please enter last name.');
        return;
      }
      
      const username = profileData.handle.replace('@', '').trim();
      if (!username) {
        Alert.alert('Validation Error', 'Username is required.');
        return;
      }
      
      // Prepare profile data for API
      const updateData = {
        firstName,
        lastName,
        username,
        department: profileData.academic.major || profileData.college || '',
        year: profileData.academic.year ? parseInt(profileData.academic.year) : undefined,
        bio: profileData.about || '',
        skills: profileData.skills || [],
        interests: profileData.interests || [],
        joinedDate: profileData.joinedDate || '',
        role: profileData.role || 'student',
        contact: JSON.stringify({
          email: profileData.contact.email || '',
          phone: profileData.contact.phone || '',
          website: profileData.contact.website || '',
          github: profileData.contact.github || '',
          linkedin: profileData.contact.linkedin || ''
        }),
        academic: JSON.stringify({
          year: profileData.academic.year || '',
          major: profileData.academic.major || '',
          gpa: profileData.academic.gpa || ''
        }),
        projects: JSON.stringify(profileData.projects || []),
        events: JSON.stringify(profileData.events || []),
        achievements: JSON.stringify(profileData.achievements || [])
      };

      console.log('Sending update data:', JSON.stringify(updateData, null, 2));

      console.log('Updating profile with data:', updateData);

      // Call the API to update profile
      const response = await authService.updateProfile(updateData);
      
      if (response.success) {
        console.log('Profile update successful, updating user data...');
        
        // Show success message with restart instruction
        Alert.alert(
          'Success', 
          'Profile updated successfully! Please restart the app to see changes.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate back to profile
                router.back();
              }
            }
          ]
        );
        
        try {
          // Try to refresh user data from server
          await refreshUser();
        } catch (refreshError) {
          console.error('Error refreshing user data:', refreshError);
        }
        
        // Update local state to reflect changes
        setProfileData(prev => {
          // Parse the stringified data back to objects for local state
          const updatedState = {
            ...prev,
            name: `${updateData.firstName} ${updateData.lastName}`.trim(),
            handle: `@${updateData.username}`,
            college: updateData.department,
            about: updateData.bio,
            role: updateData.role,
            skills: updateData.skills || [],
            interests: updateData.interests || [],
            joinedDate: updateData.joinedDate,
            // Parse the stringified data back to objects
            contact: typeof updateData.contact === 'string' 
              ? JSON.parse(updateData.contact) as typeof prev['contact'] 
              : updateData.contact || {},
            academic: typeof updateData.academic === 'string'
              ? JSON.parse(updateData.academic) as typeof prev['academic'] 
              : updateData.academic || {},
            projects: typeof updateData.projects === 'string'
              ? JSON.parse(updateData.projects) as typeof prev['projects'] 
              : updateData.projects || [],
            events: typeof updateData.events === 'string'
              ? JSON.parse(updateData.events) as typeof prev['events'] 
              : updateData.events || [],
            achievements: typeof updateData.achievements === 'string'
              ? JSON.parse(updateData.achievements) as typeof prev['achievements'] 
              : updateData.achievements || []
          };
          
          return updatedState as typeof prev;
        });
        
        // Navigate back to profile
        router.back();
      } else {
        console.error('Profile update failed:', response.error);
        throw new Error(response.error || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [profileData, refreshUser, isSaving]);

  const handleAddSkill = useCallback(() => {
    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  }, [newSkill, profileData.skills]);

  const handleRemoveSkill = useCallback((skillToRemove: string) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  }, []);

  const handleAddInterest = useCallback(() => {
    if (newInterest.trim() && !profileData.interests.includes(newInterest.trim())) {
      setProfileData(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }));
      setNewInterest('');
    }
  }, [newInterest, profileData.interests]);

  const handleRemoveInterest = useCallback((interestToRemove: string) => {
    setProfileData(prev => ({
      ...prev,
      interests: prev.interests.filter(interest => interest !== interestToRemove)
    }));
  }, []);

  // Handlers for projects, events, and achievements
  const handleAddProject = useCallback(() => {
    if (!projectForm.title.trim()) {
      Alert.alert('Validation Error', 'Please enter project title.');
      return;
    }
    
    const newProject = {
      id: Date.now().toString(),
      title: projectForm.title.trim(),
      description: projectForm.description.trim(),
      status: projectForm.status
    };
    
    setProfileData(prev => ({
      ...prev,
      projects: [...prev.projects, newProject]
    }));
    
    // Reset form and close modal
    setProjectForm({ title: '', description: '', status: 'In Progress' });
    setShowProjectModal(false);
  }, [projectForm]);

  const handleAddEvent = useCallback(() => {
    if (!eventForm.title.trim()) {
      Alert.alert('Validation Error', 'Please enter event title.');
      return;
    }
    
    const newEvent = {
      id: Date.now().toString(),
      title: eventForm.title.trim(),
      description: eventForm.description.trim(),
      date: eventForm.date || new Date().toISOString().split('T')[0]
    };
    
    setProfileData(prev => ({
      ...prev,
      events: [...prev.events, newEvent]
    }));
    
    // Reset form and close modal
    setEventForm({ title: '', description: '', date: '' });
    setShowEventModal(false);
  }, [eventForm]);

  const handleAddAchievement = useCallback(() => {
    if (!achievementForm.title.trim()) {
      Alert.alert('Validation Error', 'Please enter achievement title.');
      return;
    }
    
    const newAchievement = {
      id: Date.now().toString(),
      title: achievementForm.title.trim(),
      description: achievementForm.description.trim(),
      date: achievementForm.date || new Date().toISOString().split('T')[0]
    };
    
    setProfileData(prev => ({
      ...prev,
      achievements: [...prev.achievements, newAchievement]
    }));
    
    // Reset form and close modal
    setAchievementForm({ title: '', description: '', date: '' });
    setShowAchievementModal(false);
  }, [achievementForm]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fef2f2" />
        
        {/* Header */}
        <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#7f1d1d" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity 
          onPress={handleSave} 
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.textInput}
              value={profileData.name}
              onChangeText={(text) => setProfileData(prev => ({ ...prev, name: text }))}
              placeholder="Enter your full name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Username</Text>
            <View style={styles.usernameContainer}>
              <Text style={styles.usernamePrefix}>@</Text>
              <TextInput
                style={[styles.textInput, styles.usernameInput]}
                value={profileData.handle.replace('@', '')}
                onChangeText={(text) => {
                  // Only allow letters, numbers, and underscores, convert to lowercase
                  const cleanText = text.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
                  setProfileData(prev => ({ ...prev, handle: `@${cleanText}` }));
                }}
                placeholder="your_username"
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={30}
              />
            </View>
            <Text style={styles.usernameHint}>
              This will be your unique identifier. Only letters, numbers, and underscores allowed.
            </Text>
          </View>

          {/* Role Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Role</Text>
            <View style={styles.roleContainer}>
              {availableRoles.map((role) => (
                <TouchableOpacity
                  key={role.value}
                  style={[
                    styles.roleOption,
                    profileData.role === role.value && styles.selectedRole
                  ]}
                  onPress={() => setProfileData(prev => ({ ...prev, role: role.value as 'student' | 'teacher' | 'alumni' }))}
                >
                  <Text style={styles.roleEmoji}>{role.emoji}</Text>
                  <Text style={[
                    styles.roleLabel,
                    profileData.role === role.value && styles.selectedRoleLabel
                  ]}>
                    {role.label}
                  </Text>
                </TouchableOpacity>
              ))}
              
              {/* Locked Teacher Role (if not accessible) */}
              {!isTeacherRoleAccessible() && (
                <View style={styles.lockedRoleOption}>
                  <Text style={styles.roleEmoji}>👨‍🏫</Text>
                  <Text style={styles.lockedRoleLabel}>Teacher</Text>
                  <Ionicons name="lock-closed" size={16} color="#9CA3AF" style={styles.lockIcon} />
                </View>
              )}
            </View>
            {!isTeacherRoleAccessible() && (
              <Text style={styles.roleHint}>
                Teacher role requires a staff/faculty email address
              </Text>
            )}
          </View>


          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>College/University</Text>
            <TextInput
              style={styles.textInput}
              value={profileData.college}
              onChangeText={(text) => setProfileData(prev => ({ ...prev, college: text }))}
              placeholder="Enter your college name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Joined Date</Text>
            <TouchableOpacity 
              style={styles.datePickerButton}
              onPress={() => setShowCalendar(true)}
            >
              <Text style={styles.datePickerText}>
                {profileData.joinedDate || 'Select joining date'}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#7f1d1d" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Bio Description</Text>
            <TextInput
              style={[styles.textInput, styles.largeBioInput]}
              value={profileData.bio}
              onChangeText={(text) => setProfileData(prev => ({ ...prev, bio: text }))}
              placeholder="Write a short bio about yourself"
              multiline
              numberOfLines={5}
            />
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.inputGroup}>
            <TextInput
              style={[styles.textInput, styles.largeAboutInput]}
              value={profileData.about}
              onChangeText={(text) => setProfileData(prev => ({ ...prev, about: text }))}
              placeholder="Tell others about yourself, your interests, and what you're passionate about"
              multiline
              numberOfLines={6}
            />
          </View>
        </View>

        {/* Skills Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills & Expertise</Text>
          <View style={styles.addItemContainer}>
            <TextInput
              style={[styles.textInput, styles.addItemInput]}
              value={newSkill}
              onChangeText={setNewSkill}
              placeholder="Add a new skill"
              onSubmitEditing={handleAddSkill}
            />
            <TouchableOpacity onPress={handleAddSkill} style={styles.addButton}>
              <Ionicons name="add" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.chipsContainer}>
            {profileData.skills.map((skill, index) => (
              <View key={index} style={styles.skillChip}>
                <Text style={styles.skillText}>{skill}</Text>
                <TouchableOpacity onPress={() => handleRemoveSkill(skill)}>
                  <Ionicons name="close" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.textInput}
              value={profileData.contact.email}
              onChangeText={(text) => setProfileData(prev => ({ 
                ...prev, 
                contact: { ...prev.contact, email: text }
              }))}
              placeholder="your.email@example.com"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone</Text>
            <TextInput
              style={styles.textInput}
              value={profileData.contact.phone}
              onChangeText={(text) => setProfileData(prev => ({ 
                ...prev, 
                contact: { ...prev.contact, phone: text }
              }))}
              placeholder="+1 234 567 8900"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Website</Text>
            <TextInput
              style={styles.textInput}
              value={profileData.contact.website}
              onChangeText={(text) => setProfileData(prev => ({ 
                ...prev, 
                contact: { ...prev.contact, website: text }
              }))}
              placeholder="yourwebsite.com"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>GitHub Username</Text>
            <TextInput
              style={styles.textInput}
              value={profileData.contact.github}
              onChangeText={(text) => setProfileData(prev => ({ 
                ...prev, 
                contact: { ...prev.contact, github: text }
              }))}
              placeholder="github_username"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>LinkedIn Profile</Text>
            <TextInput
              style={styles.textInput}
              value={profileData.contact.linkedin}
              onChangeText={(text) => setProfileData(prev => ({ 
                ...prev, 
                contact: { ...prev.contact, linkedin: text }
              }))}
              placeholder="linkedin-profile-name"
            />
          </View>
        </View>

        {/* Academic Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Academic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Academic Year</Text>
            <TextInput
              style={styles.textInput}
              value={profileData.academic.year}
              onChangeText={(text) => setProfileData(prev => ({ 
                ...prev, 
                academic: { ...prev.academic, year: text }
              }))}
              placeholder="e.g., 3rd Year, Graduate, etc."
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Major/Field of Study</Text>
            <TextInput
              style={styles.textInput}
              value={profileData.academic.major}
              onChangeText={(text) => setProfileData(prev => ({ 
                ...prev, 
                academic: { ...prev.academic, major: text }
              }))}
              placeholder="Computer Science, Engineering, etc."
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>GPA</Text>
            <TextInput
              style={styles.textInput}
              value={profileData.academic.gpa}
              onChangeText={(text) => setProfileData(prev => ({ 
                ...prev, 
                academic: { ...prev.academic, gpa: text }
              }))}
              placeholder="3.8/4.0"
            />
          </View>
        </View>

        {/* Interests Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interests</Text>
          <View style={styles.addItemContainer}>
            <TextInput
              style={[styles.textInput, styles.addItemInput]}
              value={newInterest}
              onChangeText={setNewInterest}
              placeholder="Add a new interest"
              onSubmitEditing={handleAddInterest}
            />
            <TouchableOpacity onPress={handleAddInterest} style={styles.addButton}>
              <Ionicons name="add" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.chipsContainer}>
            {profileData.interests.map((interest, index) => (
              <View key={index} style={styles.interestChip}>
                <Text style={styles.interestText}>{interest}</Text>
                <TouchableOpacity onPress={() => handleRemoveInterest(interest)}>
                  <Ionicons name="close" size={16} color="#7f1d1d" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Projects Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Projects</Text>
            <TouchableOpacity onPress={() => setShowProjectModal(true)} style={styles.addButton}>
              <Ionicons name="add" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          {profileData.projects.map((project, index) => (
            <View key={project.id} style={styles.itemCard}>
              <Text style={styles.itemTitle}>{project.title}</Text>
              <Text style={styles.itemDescription}>{project.description}</Text>
              <Text style={styles.itemStatus}>Status: {project.status}</Text>
            </View>
          ))}
        </View>

        {/* Events Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Events</Text>
            <TouchableOpacity onPress={() => setShowEventModal(true)} style={styles.addButton}>
              <Ionicons name="add" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          {profileData.events.map((event, index) => (
            <View key={event.id} style={styles.itemCard}>
              <Text style={styles.itemTitle}>{event.title}</Text>
              <Text style={styles.itemDescription}>{event.description}</Text>
              <Text style={styles.itemDate}>Date: {event.date}</Text>
            </View>
          ))}
        </View>

        {/* Achievements Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <TouchableOpacity onPress={() => setShowAchievementModal(true)} style={styles.addButton}>
              <Ionicons name="add" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          {profileData.achievements.map((achievement, index) => (
            <View key={achievement.id} style={styles.itemCard}>
              <Text style={styles.itemTitle}>{achievement.title}</Text>
              <Text style={styles.itemDescription}>{achievement.description}</Text>
              <Text style={styles.itemDate}>Date: {achievement.date}</Text>
            </View>
          ))}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Calendar Modal */}
      <Modal visible={showCalendar} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Joining Date</Text>
            <Calendar
              onDayPress={(day) => {
                setProfileData(prev => ({ ...prev, joinedDate: day.dateString }));
                setShowCalendar(false);
              }}
              markedDates={{
                [profileData.joinedDate]: { selected: true, selectedColor: '#7f1d1d' }
              }}
              theme={{
                selectedDayBackgroundColor: '#7f1d1d',
                todayTextColor: '#7f1d1d',
                arrowColor: '#7f1d1d',
              }}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCalendar(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Project Modal */}
      <Modal visible={showProjectModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Project</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Project Title</Text>
              <TextInput
                style={styles.textInput}
                value={projectForm.title}
                onChangeText={(text) => setProjectForm(prev => ({ ...prev, title: text }))}
                placeholder="Enter project title"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                value={projectForm.description}
                onChangeText={(text) => setProjectForm(prev => ({ ...prev, description: text }))}
                placeholder="Describe your project"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Status</Text>
              <View style={styles.statusContainer}>
                {['In Progress', 'Completed', 'On Hold'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusOption,
                      projectForm.status === status && styles.selectedStatus
                    ]}
                    onPress={() => setProjectForm(prev => ({ ...prev, status }))}
                  >
                    <Text style={[
                      styles.statusText,
                      projectForm.status === status && styles.selectedStatusText
                    ]}>
                      {status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setProjectForm({ title: '', description: '', status: 'In Progress' });
                  setShowProjectModal(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleAddProject}
              >
                <Text style={styles.confirmButtonText}>Add Project</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Event Modal */}
      <Modal visible={showEventModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Event</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Event Title</Text>
              <TextInput
                style={styles.textInput}
                value={eventForm.title}
                onChangeText={(text) => setEventForm(prev => ({ ...prev, title: text }))}
                placeholder="Enter event title"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                value={eventForm.description}
                onChangeText={(text) => setEventForm(prev => ({ ...prev, description: text }))}
                placeholder="Describe the event"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Date</Text>
              <TextInput
                style={styles.textInput}
                value={eventForm.date}
                onChangeText={(text) => setEventForm(prev => ({ ...prev, date: text }))}
                placeholder="YYYY-MM-DD"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setEventForm({ title: '', description: '', date: '' });
                  setShowEventModal(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleAddEvent}
              >
                <Text style={styles.confirmButtonText}>Add Event</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Achievement Modal */}
      <Modal visible={showAchievementModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Achievement</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Achievement Title</Text>
              <TextInput
                style={styles.textInput}
                value={achievementForm.title}
                onChangeText={(text) => setAchievementForm(prev => ({ ...prev, title: text }))}
                placeholder="Enter achievement title"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                value={achievementForm.description}
                onChangeText={(text) => setAchievementForm(prev => ({ ...prev, description: text }))}
                placeholder="Describe your achievement"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Date</Text>
              <TextInput
                style={styles.textInput}
                value={achievementForm.date}
                onChangeText={(text) => setAchievementForm(prev => ({ ...prev, date: text }))}
                placeholder="YYYY-MM-DD"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setAchievementForm({ title: '', description: '', date: '' });
                  setShowAchievementModal(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleAddAchievement}
              >
                <Text style={styles.confirmButtonText}>Add Achievement</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF2E8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 41,
    backgroundColor: '#FFF2E8',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  saveButton: {
    backgroundColor: '#7f1d1d',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  saveButtonDisabled: {
    backgroundColor: '#cccccc',
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7f1d1d',
    marginBottom: 16,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#7f1d1d',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(127, 29, 29, 0.1)',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f1d1d',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  largeBioInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  largeAboutInput: {
    height: 140,
    textAlignVertical: 'top',
  },
  addItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  addItemInput: {
    flex: 1,
    marginRight: 12,
  },
  addButton: {
    backgroundColor: '#7f1d1d',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillChip: {
    backgroundColor: '#7f1d1d',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
    marginRight: 6,
  },
  interestChip: {
    backgroundColor: '#FEF2F2',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  interestText: {
    fontSize: 12,
    color: '#7f1d1d',
    fontWeight: '500',
    marginRight: 6,
  },
  bottomSpacing: {
    height: 40,
  },
  roleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    minWidth: 100,
  },
  selectedRole: {
    borderColor: '#7f1d1d',
    backgroundColor: '#FEF2F2',
  },
  roleEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  selectedRoleLabel: {
    color: '#7f1d1d',
    fontWeight: '600',
  },
  lockedRoleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    minWidth: 100,
    opacity: 0.6,
  },
  lockedRoleLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
    marginRight: 8,
  },
  lockIcon: {
    marginLeft: 4,
  },
  roleHint: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  datePickerText: {
    fontSize: 16,
    color: '#111827',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: width * 0.9,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  confirmButton: {
    backgroundColor: '#7f1d1d',
  },
  cancelButtonText: {
    color: '#374151',
    fontWeight: '500',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  itemStatus: {
    fontSize: 12,
    color: '#7f1d1d',
    fontWeight: '500',
  },
  itemDate: {
    fontSize: 12,
    color: '#7f1d1d',
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  selectedStatus: {
    borderColor: '#7f1d1d',
    backgroundColor: '#FEF2F2',
  },
  statusText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  selectedStatusText: {
    color: '#7f1d1d',
    fontWeight: '600',
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 0,
  },
  usernamePrefix: {
    fontSize: 16,
    color: '#7f1d1d',
    fontWeight: '600',
    marginRight: 4,
  },
  usernameInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 12,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  usernameHint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    fontStyle: 'italic',
  },
});
