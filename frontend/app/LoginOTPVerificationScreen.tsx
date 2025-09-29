import React, { useState, useRef, useEffect } from 'react';
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
  Animated,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function LoginOTPVerificationScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (value: string) => {
    // Only allow numeric input and limit to 6 digits
    const numericValue = value.replace(/[^0-9]/g, '').slice(0, 6);
    setOtp(numericValue);
  };

  const shakeInputs = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const verifyOTP = async () => {
    if (otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter the complete 6-digit OTP.');
      shakeInputs();
      return;
    }

    setIsLoading(true);
    try {
      // Simulate OTP verification API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, accept any 6-digit OTP
      // In real implementation, verify with backend
      
      Alert.alert('Success', 'Login successful!', [
        {
          text: 'Continue',
          onPress: () => router.replace('/(tabs)'),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Invalid OTP. Please try again.');
      shakeInputs();
      // Clear OTP input
      setOtp('');
    } finally {
      setIsLoading(false);
    }
  };

  const resendOTP = async () => {
    if (!canResend) return;
    
    setIsLoading(true);
    try {
      // Simulate resend OTP API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setTimer(60);
      setCanResend(false);
      Alert.alert('OTP Sent', 'A new OTP has been sent to your email.');
      
      // Restart timer
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Title */}
            <View style={styles.header}>
              <Text style={styles.title}>Verify Login</Text>
              <Text style={styles.subtitle}>
                We've sent a 6-digit verification code to
              </Text>
              <Text style={styles.email}>{email}</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* OTP Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Enter Verification Code</Text>
                <Animated.View 
                  style={[
                    styles.otpInputWrapper,
                    { transform: [{ translateX: shakeAnimation }] }
                  ]}
                >
                  <TextInput
                    style={styles.otpInput}
                    value={otp}
                    onChangeText={handleOtpChange}
                    keyboardType="numeric"
                    maxLength={6}
                    textAlign="center"
                    placeholder="Enter 6-digit code"
                    placeholderTextColor="#9CA3AF"
                    autoFocus
                  />
                </Animated.View>
              </View>

              {/* Timer and Resend */}
              <View style={styles.timerContainer}>
                {!canResend ? (
                  <Text style={styles.timerText}>
                    Resend code in {formatTime(timer)}
                  </Text>
                ) : (
                  <TouchableOpacity onPress={resendOTP} disabled={isLoading}>
                    <Text style={styles.resendText}>
                      {isLoading ? 'Sending...' : 'Resend Code'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Verify Button */}
              <TouchableOpacity
                style={[
                  styles.verifyButton,
                  (isLoading || otp.length !== 6) && styles.verifyButtonDisabled
                ]}
                onPress={verifyOTP}
                disabled={isLoading || otp.length !== 6}
              >
                <Text style={styles.verifyButtonText}>
                  {isLoading ? 'Verifying...' : 'Complete Login'}
                </Text>
              </TouchableOpacity>

              {/* Help Text */}
              <Text style={styles.helpText}>
                Didn't receive the code? Check your spam folder or try resending.
              </Text>

              {/* Back to Login Link */}
              <View style={styles.backToLoginContainer}>
                <Text style={styles.backToLoginText}>Having trouble? </Text>
                <TouchableOpacity onPress={() => router.back()}>
                  <Text style={styles.backToLoginLink}>Back to Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff7ed',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#7f1d1d',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7f1d1d',
    textAlign: 'center',
    marginBottom: 20,
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  otpInputWrapper: {
    alignItems: 'center',
    marginBottom: 32,
  },
  otpInput: {
    width: 200,
    height: 50,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  timerText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  resendText: {
    fontSize: 14,
    color: '#7f1d1d',
    fontWeight: '600',
    textAlign: 'center',
  },
  verifyButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#7f1d1d',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#7f1d1d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  verifyButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
  verifyButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  helpText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  backToLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  backToLoginText: {
    fontSize: 16,
    color: '#6B7280',
  },
  backToLoginLink: {
    fontSize: 16,
    color: '#7f1d1d',
    fontWeight: '600',
  },
});
