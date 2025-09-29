import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InterestsModalProps {
  visible: boolean;
  onClose: () => void;
  initialData: string[];
  onSave: (data: string[]) => void;
}

export default function InterestsModal({ visible, onClose, initialData, onSave }: InterestsModalProps) {
  const [interests, setInterests] = useState(initialData.join(', '));

  const handleSave = () => {
    const interestsArray = interests.split(',').map(interest => interest.trim()).filter(interest => interest.length > 0);
    onSave(interestsArray);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.title}>Edit Interests</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.saveButton}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Interests</Text>
            <Text style={styles.helper}>Separate interests with commas</Text>
            <TextInput
              style={styles.textArea}
              value={interests}
              onChangeText={setInterests}
              placeholder="e.g., Artificial Intelligence, Photography, Music"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>Popular Interests</Text>
            <View style={styles.suggestionsGrid}>
              {[
                'Artificial Intelligence',
                'Machine Learning',
                'Web Development',
                'Mobile Development',
                'Data Science',
                'Cybersecurity',
                'Blockchain',
                'IoT',
                'Photography',
                'Music',
                'Sports',
                'Travel',
                'Reading',
                'Gaming',
                'Entrepreneurship',
                'Sustainability'
              ].map((suggestion) => (
                <TouchableOpacity
                  key={suggestion}
                  style={styles.suggestionChip}
                  onPress={() => {
                    const currentInterests = interests.split(',').map(i => i.trim());
                    if (!currentInterests.includes(suggestion)) {
                      const newInterests = [...currentInterests.filter(i => i.length > 0), suggestion];
                      setInterests(newInterests.join(', '));
                    }
                  }}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#991B1B',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  helper: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111827',
    height: 100,
    textAlignVertical: 'top',
  },
  suggestionsContainer: {
    marginTop: 20,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 12,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  suggestionText: {
    fontSize: 14,
    color: '#374151',
  },
});
