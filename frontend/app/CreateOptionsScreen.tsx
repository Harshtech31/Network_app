import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function CreateOptionsScreen() {
  const router = useRouter();

  const createOptions = [
    {
      id: 'post',
      title: 'Create Post',
      description: 'Share your thoughts and updates',
      icon: 'document-text-outline',
      color: '#7f1d1d',
      gradient: ['#7f1d1d', '#b91c1c']
    },
    {
      id: 'project',
      title: 'Create Project',
      description: 'Start a new collaborative project',
      icon: 'code-slash-outline',
      color: '#7f1d1d',
      gradient: ['#7f1d1d', '#b91c1c']
    },
    {
      id: 'club',
      title: 'Create Club',
      description: 'Build a community around shared interests',
      icon: 'people-outline',
      color: '#7C3AED',
      gradient: ['#7C3AED', '#8B5CF6']
    }
  ];

  const handleCreateOptionSelect = (optionId: string) => {
    const screenName = `Create${optionId.charAt(0).toUpperCase() + optionId.slice(1)}Screen`;
    router.push(screenName as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#7f1d1d" />
      
      {/* Header with gradient */}
      <LinearGradient colors={['#7f1d1d', '#b91c1c']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.headerButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create</Text>
        <View style={{ width: 60 }} />
      </LinearGradient>

      <ScrollView style={styles.scrollView}>
        <Text style={styles.optionsTitle}>What would you like to create?</Text>
        <View style={styles.optionsContainer}>
          {createOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionCard}
              onPress={() => handleCreateOptionSelect(option.id)}
            >
              <LinearGradient colors={option.gradient as any} style={styles.optionGradient}>
                <View style={styles.optionIconContainer}>
                  <Ionicons name={option.icon as any} size={32} color="#FFFFFF" />
                </View>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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
  scrollView: { padding: 20 },
  optionsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  optionsContainer: {
    paddingHorizontal: 10,
  },
  optionCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  optionGradient: {
    padding: 24,
    alignItems: 'center',
    minHeight: 140,
    justifyContent: 'center',
  },
  optionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  optionDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 20,
  },
});
