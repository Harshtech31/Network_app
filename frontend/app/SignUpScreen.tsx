import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

export default function SignUpScreen() {
  const router = useRouter();
  const { register, isLoading: authLoading } = useAuth();
  const { email: verifiedEmail, verified } = useLocalSearchParams<{ email?: string; verified?: string }>();
  
  // Simplified form fields to match backend requirements
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState(verifiedEmail || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  
  // Additional state variables for the original design
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [branch, setBranch] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [campus, setCampus] = useState('');
  const [gender, setGender] = useState('');
  const [designation, setDesignation] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  
  // OTP related states
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  
  // Dropdown visibility states
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showCampusDropdown, setShowCampusDropdown] = useState(false);
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showDesignationDropdown, setShowDesignationDropdown] = useState(false);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);

  const roles = [
    { label: 'Student', value: 'student', icon: 'school-outline' },
    { label: 'Alumni', value: 'alumni', icon: 'ribbon-outline' },
    { label: 'Teacher', value: 'teacher', icon: 'person-outline' }
  ];

  const branches = [
    'Computer Science & Engineering',
    'Electronics & Communication Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Chemical Engineering',
    'Electrical & Electronics Engineering',
    'Biotechnology',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Economics',
    'Management'
  ];

  const graduationYears = Array.from({ length: 30 }, (_, i) => (new Date().getFullYear() - i + 4).toString());

  const designations = [
    'Professor',
    'Associate Professor',
    'Assistant Professor',
    'Lecturer',
    'Research Scholar',
    'Lab Instructor',
    'Administrative Staff'
  ];

  const campuses = [
    { label: 'Pilani Campus', value: 'pilani', domain: '@pilani.bits-pilani.ac.in' },
    { label: 'Goa Campus', value: 'goa', domain: '@goa.bits-pilani.ac.in' },
    { label: 'Hyderabad Campus', value: 'hyderabad', domain: '@hyderabad.bits-pilani.ac.in' },
    { label: 'Dubai Campus', value: 'dubai', domain: '@dubai.bits-pilani.ac.in' }
  ];

  const genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Prefer not to say', value: 'prefer_not_to_say' },
    { label: 'Custom', value: 'custom' }
  ];

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    // Backend requires minimum 6 characters
    return password.length >= 6;
  };

  const validateEmailDomain = (email: string, userRole: string) => {
    if (!email || !userRole) return false;
    
    const selectedCampus = campuses.find(c => c.value === campus);
    if (!selectedCampus) return false;

    if (userRole === 'student') {
      return email.endsWith(selectedCampus.domain);
    } else if (userRole === 'alumni') {
      return email.includes('@alumni.bits-pilani.ac.in') || email.endsWith(selectedCampus.domain);
    } else if (userRole === 'teacher') {
      return email.endsWith(selectedCampus.domain);
    }
    return false;
  };

  const sendOTP = async () => {
    if (!validateEmailDomain(email, role)) {
      Alert.alert('Invalid Email', 'Please use your official BITS Pilani email address for your selected role and campus.');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate OTP sending
      await new Promise(resolve => setTimeout(resolve, 1500));
      setOtpSent(true);
      Alert.alert('OTP Sent', 'Please check your email for the verification code.');
    } catch (error) {
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter a valid 6-digit OTP.');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate OTP verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      setEmailVerified(true);
      Alert.alert('Email Verified', 'Your email has been successfully verified!');
    } catch (error) {
      Alert.alert('Error', 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setPasswordError('');
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    if (text && password && text !== password) {
      setPasswordError('Passwords do not match');
    } else {
      setPasswordError('');
    }
  };

  const handleSignUp = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Please create a password');
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    if (!confirmPassword.trim()) {
      Alert.alert('Error', 'Please confirm your password');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (!role) {
      Alert.alert('Error', 'Please select your role');
      return;
    }

    if (!campus) {
      Alert.alert('Error', 'Please select your campus');
      return;
    }

    if (!emailVerified) {
      Alert.alert('Error', 'Please verify your email address first');
      return;
    }

    if ((role === 'student' || role === 'alumni') && !branch) {
      Alert.alert('Error', 'Please select your branch');
      return;
    }

    if ((role === 'student' || role === 'alumni') && !graduationYear) {
      Alert.alert('Error', 'Please select your graduation year');
      return;
    }

    if (role === 'teacher' && !designation) {
      Alert.alert('Error', 'Please select your designation');
      return;
    }

    if (!gender) {
      Alert.alert('Error', 'Please select your gender');
      return;
    }

    setIsLoading(true);

    try {
      // Parse name into firstName and lastName
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || nameParts[0] || '';
      
      // Create username from email if not provided
      const generatedUsername = username || email.split('@')[0];
      
      const result = await register({
        firstName,
        lastName,
        username: generatedUsername,
        email,
        password,
        department: branch || department || '',
        year: graduationYear ? parseInt(graduationYear) : undefined,
      });
      
      if (result.success) {
        Alert.alert('Success', 'Account created successfully!', [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)'),
          },
        ]);
      } else {
        Alert.alert('Registration Failed', result.error || 'Please try again.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    router.push('/LoginScreen');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Ionicons name="chevron-back" size={24} color="#7f1d1d" />
              </TouchableOpacity>
              <Text style={styles.title}>Complete Your Profile</Text>
              <Text style={styles.subtitle}>Tell us more about yourself</Text>
              
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Name Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor="#9CA3AF"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>

              {/* Role Selection */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Role</Text>
                <TouchableOpacity
                  style={[styles.input, styles.dropdownButton]}
                  onPress={() => setShowRoleDropdown(true)}
                >
                  <View style={styles.dropdownContent}>
                    {role ? (
                      <View style={styles.selectedRole}>
                        <Ionicons 
                          name={roles.find(r => r.value === role)?.icon as any} 
                          size={20} 
                          color="#7f1d1d" 
                        />
                        <Text style={styles.selectedRoleText}>
                          {roles.find(r => r.value === role)?.label}
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.dropdownPlaceholder}>Select your role</Text>
                    )}
                    <Ionicons name="chevron-down" size={20} color="#6B7280" />
                  </View>
                </TouchableOpacity>
              </View>

              {/* Campus Selection */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Campus *</Text>
                <TouchableOpacity
                  style={[styles.input, styles.dropdownButton]}
                  onPress={() => setShowCampusDropdown(true)}
                >
                  <View style={styles.dropdownContent}>
                    {campus ? (
                      <Text style={styles.selectedText}>
                        {campuses.find(c => c.value === campus)?.label}
                      </Text>
                    ) : (
                      <Text style={styles.dropdownPlaceholder}>Select your campus</Text>
                    )}
                    <Ionicons name="chevron-down" size={20} color="#6B7280" />
                  </View>
                </TouchableOpacity>
              </View>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>College Email ID *</Text>
                <View style={styles.emailContainer}>
                  <TextInput
                    style={[styles.input, styles.emailInput, emailVerified && styles.verifiedInput]}
                    placeholder={campus ? `your-email${campuses.find(c => c.value === campus)?.domain}` : "Select campus first"}
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!emailVerified}
                  />
                  {emailVerified && (
                    <View style={styles.verifiedBadge}>
                      <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                    </View>
                  )}
                </View>
                {campus && email && !emailVerified && (
                  <TouchableOpacity
                    style={styles.otpButton}
                    onPress={sendOTP}
                    disabled={isLoading || !validateEmailDomain(email, role)}
                  >
                    <Text style={styles.otpButtonText}>
                      {otpSent ? 'Resend OTP' : 'Send OTP'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* OTP Verification */}
              {otpSent && !emailVerified && (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Enter OTP *</Text>
                  <View style={styles.otpContainer}>
                    <TextInput
                      style={[styles.input, styles.otpInput]}
                      placeholder="Enter 6-digit OTP"
                      placeholderTextColor="#9CA3AF"
                      value={otp}
                      onChangeText={setOtp}
                      keyboardType="numeric"
                      maxLength={6}
                    />
                    <TouchableOpacity
                      style={styles.verifyButton}
                      onPress={verifyOTP}
                      disabled={isLoading || otp.length !== 6}
                    >
                      <Text style={styles.verifyButtonText}>Verify</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

          {/* Role-specific Fields */}
          {(role === 'student' || role === 'alumni') && (
            <>
              {/* Branch Selection */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Branch *</Text>
                <TouchableOpacity
                  style={[styles.input, styles.dropdownButton]}
                  onPress={() => setShowBranchDropdown(true)}
                >
                  <View style={styles.dropdownContent}>
                    {branch ? (
                      <Text style={styles.selectedText}>{branch}</Text>
                    ) : (
                      <Text style={styles.dropdownPlaceholder}>Select your branch</Text>
                    )}
                    <Ionicons name="chevron-down" size={20} color="#6B7280" />
                  </View>
                </TouchableOpacity>
              </View>

              {/* Graduation Year */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Graduation Year *</Text>
                <TouchableOpacity
                  style={[styles.input, styles.dropdownButton]}
                  onPress={() => setShowYearDropdown(true)}
                >
                  <View style={styles.dropdownContent}>
                    {graduationYear ? (
                      <Text style={styles.selectedText}>{graduationYear}</Text>
                    ) : (
                      <Text style={styles.dropdownPlaceholder}>Select graduation year</Text>
                    )}
                    <Ionicons name="chevron-down" size={20} color="#6B7280" />
                  </View>
                </TouchableOpacity>
              </View>
            </>
          )}

          {role === 'teacher' && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Role/Designation *</Text>
              <TouchableOpacity
                style={[styles.input, styles.dropdownButton]}
                onPress={() => setShowDesignationDropdown(true)}
              >
                <View style={styles.dropdownContent}>
                  {designation ? (
                    <Text style={styles.selectedText}>{designation}</Text>
                  ) : (
                    <Text style={styles.dropdownPlaceholder}>Select your designation</Text>
                  )}
                  <Ionicons name="chevron-down" size={20} color="#6B7280" />
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Date of Birth (Optional) */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Date of Birth <Text style={styles.optionalText}>(Optional)</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="DD/MM/YYYY"
              placeholderTextColor="#9CA3AF"
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
            />
          </View>

          {/* Gender Selection */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Gender *</Text>
            <TouchableOpacity
              style={[styles.input, styles.dropdownButton]}
              onPress={() => setShowGenderDropdown(true)}
            >
              <View style={styles.dropdownContent}>
                {gender ? (
                  <Text style={styles.selectedText}>
                    {genderOptions.find(g => g.value === gender)?.label}
                  </Text>
                ) : (
                  <Text style={styles.dropdownPlaceholder}>Select gender</Text>
                )}
                <Ionicons name="chevron-down" size={20} color="#6B7280" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Phone Number (Optional) */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Phone Number <Text style={styles.optionalText}>(Optional)</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="+91 XXXXX XXXXX"
              placeholderTextColor="#9CA3AF"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
          </View>

          {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Create a strong password"
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={handlePasswordChange}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <View style={[
                  styles.passwordContainer,
                  passwordError ? styles.passwordContainerError : null
                ]}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Repeat your password"
                    placeholderTextColor="#9CA3AF"
                    value={confirmPassword}
                    onChangeText={handleConfirmPasswordChange}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                </View>
                {passwordError ? (
                  <Text style={styles.errorText}>{passwordError}</Text>
                ) : null}
              </View>

              {/* Sign Up Button */}
              <TouchableOpacity
                style={[styles.signUpButton, isLoading && styles.signUpButtonDisabled]}
                onPress={handleSignUp}
                disabled={isLoading}
              >
                <Text style={styles.signUpButtonText}>
                  {isLoading ? 'Creating Account...' : 'Sign Up'}
                </Text>
              </TouchableOpacity>

              {/* Login Link */}
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={handleLoginRedirect}>
                  <Text style={styles.loginLink}>Log In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Role Selection Modal */}
      <Modal
        visible={showRoleDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowRoleDropdown(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Your Role</Text>
            
            {roles.map((roleOption) => (
              <TouchableOpacity
                key={roleOption.value}
                style={[
                  styles.roleOption,
                  role === roleOption.value && { backgroundColor: '#FEF2F2' }
                ]}
                onPress={() => setRole(roleOption.value)}
              >
                <Ionicons 
                  name={roleOption.icon as any} 
                  size={24} 
                  color={role === roleOption.value ? '#7f1d1d' : '#6B7280'} 
                />
                <Text 
                  style={[
                    styles.roleOptionText,
                    role === roleOption.value && { color: '#7f1d1d', fontWeight: '600' }
                  ]}
                >
                  {roleOption.label}
                </Text>
              </TouchableOpacity>
            ))}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowRoleDropdown(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => setShowRoleDropdown(false)}
                disabled={!role}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Campus Selection Modal */}
      <Modal
        visible={showCampusDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCampusDropdown(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Your Campus</Text>
            
            {campuses.map((campusOption) => (
              <TouchableOpacity
                key={campusOption.value}
                style={[
                  styles.roleOption,
                  campus === campusOption.value && { backgroundColor: '#FEF2F2' }
                ]}
                onPress={() => setCampus(campusOption.value)}
              >
                <Ionicons 
                  name="location-outline" 
                  size={24} 
                  color={campus === campusOption.value ? '#7f1d1d' : '#6B7280'} 
                />
                <View style={{ flex: 1 }}>
                  <Text 
                    style={[
                      styles.roleOptionText,
                      campus === campusOption.value && { color: '#7f1d1d', fontWeight: '600' }
                    ]}
                  >
                    {campusOption.label}
                  </Text>
                  <Text style={styles.domainText}>{campusOption.domain}</Text>
                </View>
              </TouchableOpacity>
            ))}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCampusDropdown(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => setShowCampusDropdown(false)}
                disabled={!campus}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Branch Selection Modal */}
      <Modal
        visible={showBranchDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowBranchDropdown(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Your Branch</Text>
            
            <ScrollView style={{ maxHeight: 300 }}>
              {branches.map((branchOption) => (
                <TouchableOpacity
                  key={branchOption}
                  style={[
                    styles.roleOption,
                    branch === branchOption && { backgroundColor: '#FEF2F2' }
                  ]}
                  onPress={() => setBranch(branchOption)}
                >
                  <Ionicons 
                    name="school-outline" 
                    size={24} 
                    color={branch === branchOption ? '#7f1d1d' : '#6B7280'} 
                  />
                  <Text 
                    style={[
                      styles.roleOptionText,
                      branch === branchOption && { color: '#7f1d1d', fontWeight: '600' }
                    ]}
                  >
                    {branchOption}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowBranchDropdown(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => setShowBranchDropdown(false)}
                disabled={!branch}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Graduation Year Modal */}
      <Modal
        visible={showYearDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowYearDropdown(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Graduation Year</Text>
            
            <ScrollView style={{ maxHeight: 300 }}>
              {graduationYears.map((year) => (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.roleOption,
                    graduationYear === year && { backgroundColor: '#FEF2F2' }
                  ]}
                  onPress={() => setGraduationYear(year)}
                >
                  <Ionicons 
                    name="calendar-outline" 
                    size={24} 
                    color={graduationYear === year ? '#7f1d1d' : '#6B7280'} 
                  />
                  <Text 
                    style={[
                      styles.roleOptionText,
                      graduationYear === year && { color: '#7f1d1d', fontWeight: '600' }
                    ]}
                  >
                    {year}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowYearDropdown(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => setShowYearDropdown(false)}
                disabled={!graduationYear}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Designation Modal */}
      <Modal
        visible={showDesignationDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDesignationDropdown(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Your Designation</Text>
            
            {designations.map((designationOption) => (
              <TouchableOpacity
                key={designationOption}
                style={[
                  styles.roleOption,
                  designation === designationOption && { backgroundColor: '#FEF2F2' }
                ]}
                onPress={() => setDesignation(designationOption)}
              >
                <Ionicons 
                  name="person-outline" 
                  size={24} 
                  color={designation === designationOption ? '#7f1d1d' : '#6B7280'} 
                />
                <Text 
                  style={[
                    styles.roleOptionText,
                    designation === designationOption && { color: '#7f1d1d', fontWeight: '600' }
                  ]}
                >
                  {designationOption}
                </Text>
              </TouchableOpacity>
            ))}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDesignationDropdown(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => setShowDesignationDropdown(false)}
                disabled={!designation}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Gender Selection Modal */}
      <Modal
        visible={showGenderDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowGenderDropdown(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Gender</Text>
            
            {genderOptions.map((genderOption) => (
              <TouchableOpacity
                key={genderOption.value}
                style={[
                  styles.roleOption,
                  gender === genderOption.value && { backgroundColor: '#FEF2F2' }
                ]}
                onPress={() => setGender(genderOption.value)}
              >
                <Ionicons 
                  name="person-outline" 
                  size={24} 
                  color={gender === genderOption.value ? '#7f1d1d' : '#6B7280'} 
                />
                <Text 
                  style={[
                    styles.roleOptionText,
                    gender === genderOption.value && { color: '#7f1d1d', fontWeight: '600' }
                  ]}
                >
                  {genderOption.label}
                </Text>
              </TouchableOpacity>
            ))}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowGenderDropdown(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => setShowGenderDropdown(false)}
                disabled={!gender}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
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
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    shadowColor: '#7f1d1d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 26, 26, 0.1)',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#7f1d1d',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(127, 29, 29, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
    shadowColor: '#7f1d1d',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(127, 29, 29, 0.2)',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    shadowColor: '#7f1d1d',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  passwordContainerError: {
    borderColor: '#DC2626',
    shadowColor: '#DC2626',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  eyeButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    marginTop: 4,
  },
  signUpButton: {
    backgroundColor: '#7f1d1d',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  signUpButtonDisabled: {
    backgroundColor: 'rgba(139, 26, 26, 0.5)',
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#6B7280',
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    color: '#7f1d1d',
    fontWeight: '500',
  },
  dropdownButton: {
    justifyContent: 'center',
  },
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedRole: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedRoleText: {
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 8,
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: '#9CA3AF',
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
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 20,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  roleOptionText: {
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  confirmButton: {
    backgroundColor: '#7f1d1d',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontWeight: '500',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  selectedText: {
    fontSize: 16,
    color: '#1F2937',
  },
  emailContainer: {
    position: 'relative',
  },
  emailInput: {
    paddingRight: 50,
  },
  verifiedInput: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  verifiedBadge: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  otpButton: {
    backgroundColor: '#7f1d1d',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  otpButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  otpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  otpInput: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    letterSpacing: 2,
  },
  verifyButton: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  domainText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  optionalText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '400',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 20,
  },
  progressContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  progressBar: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  progressStep: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E7EB',
    marginRight: 8,
    borderRadius: 2,
  },
  progressStepActive: {
    backgroundColor: '#7f1d1d',
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});
