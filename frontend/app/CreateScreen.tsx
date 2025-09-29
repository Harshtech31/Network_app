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


export default function CreateScreen() {
  const router = useRouter();

  const createOptions = [
    {
      id: 'post',
      title: 'Create Post',
      description: 'Share professional updates and insights with the network',
      icon: 'document-text',
      gradient: ['#8B1A1A', '#A52A2A'],
    },
    {
      id: 'project',
      title: 'Create Project',
      description: 'Initiate collaborative projects and recruit team members',
      icon: 'code-slash',
      gradient: ['#8B1A1A', '#B91C1C'],
    },
    {
      id: 'club',
      title: 'Create Organization',
      description: 'Establish professional groups and communities',
      icon: 'people',
      gradient: ['#8B1A1A', '#DC2626'],
    },
    {
      id: 'collaboration',
      title: 'Create Partnership',
      description: 'Connect with partners for business opportunities',
      icon: 'handshake',
      gradient: ['#8B1A1A', '#EF4444'],
    },
    {
      id: 'event',
      title: 'Create Event',
      description: 'Organize professional meetings and conferences',
      icon: 'calendar',
      gradient: ['#8B1A1A', '#F87171'],
    }
  ];

  const handleCreateOptionSelect = (optionId: string) => {
    const screenName = `Create${optionId.charAt(0).toUpperCase() + optionId.slice(1)}Screen`;
    router.push(screenName as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FEF2F2" translucent={true} />
      
      <View style={styles.modernHeader}>
        <TouchableOpacity style={styles.modernBackButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#8B1A1A" />
        </TouchableOpacity>
        <Text style={styles.modernHeaderTitle}>Create</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.modernScrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <Text style={styles.modernOptionsTitle}>Create Content</Text>
          <Text style={styles.modernOptionsSubtitle}>Select the type of professional content you would like to create</Text>
        </View>
        
        <View style={styles.modernOptionsContainer}>
          {createOptions.map((option, index) => (
            <TouchableOpacity
              key={option.id}
              style={[styles.modernOptionCard, { marginTop: index * 8 }]}
              onPress={() => handleCreateOptionSelect(option.id)}
            >
              <LinearGradient colors={option.gradient as any} style={styles.modernOptionGradient}>
                <View style={styles.modernOptionContent}>
                  <View style={styles.modernOptionLeft}>
                    <View style={styles.modernIconContainer}>
                      <Ionicons name={option.icon as any} size={24} color="#FFFFFF" />
                    </View>
                    <View style={styles.modernOptionTextContainer}>
                      <Text style={styles.modernOptionTitle}>{option.title}</Text>
                      <Text style={styles.modernOptionDescription}>{option.description}</Text>
                    </View>
                  </View>
                  <View style={styles.modernOptionRight}>
                    <View style={styles.modernArrowContainer}>
                      <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.8)" />
                    </View>
                  </View>
                </View>
                <View style={styles.modernOptionGlow} />
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FEF2F2' },
  
  // Modern Header
  modernHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#8B1A1A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  modernBackButton: {
    padding: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
  },
  modernHeaderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B1A1A',
    letterSpacing: -0.5,
  },
  headerPlaceholder: { width: 40 },
  
  // Modern Content
  modernScrollView: { flex: 1 },
  heroSection: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    alignItems: 'center',
  },
  modernOptionsTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.8,
  },
  modernOptionsSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  
  // Modern Options
  modernOptionsContainer: {
    paddingHorizontal: 20,
  },
  modernOptionCard: {
    marginBottom: 16,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#8B1A1A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  modernOptionGradient: {
    position: 'relative',
    overflow: 'hidden',
  },
  modernOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    minHeight: 100,
  },
  modernOptionLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modernIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modernOptionTextContainer: {
    flex: 1,
  },
  modernOptionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  modernOptionDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  modernOptionRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  modernArrowContainer: {
    marginTop: 8,
    padding: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  modernOptionGlow: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  bottomSpacing: {
    height: 40,
  },
});
