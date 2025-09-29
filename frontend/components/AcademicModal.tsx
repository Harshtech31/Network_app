import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AcademicData {
  university: string;
  major: string;
  graduationYear: string;
}

interface AcademicModalProps {
  visible: boolean;
  onClose: () => void;
  initialData: AcademicData;
  onSave: (data: AcademicData) => void;
}

export default function AcademicModal({ visible, onClose, initialData, onSave }: AcademicModalProps) {
  const [university, setUniversity] = useState(initialData.university);
  const [major, setMajor] = useState(initialData.major);
  const [graduationYear, setGraduationYear] = useState(initialData.graduationYear);

  const handleSave = () => {
    onSave({ university, major, graduationYear });
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
          <Text style={styles.title}>Edit Academic Info</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.saveButton}>Save</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>University</Text>
            <TextInput
              style={styles.input}
              value={university}
              onChangeText={setUniversity}
              placeholder="e.g., American University of Dubai"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Major</Text>
            <TextInput
              style={styles.input}
              value={major}
              onChangeText={setMajor}
              placeholder="e.g., Computer Science"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Graduation Year</Text>
            <TextInput
              style={styles.input}
              value={graduationYear}
              onChangeText={setGraduationYear}
              placeholder="e.g., 2025"
              keyboardType="numeric"
            />
          </View>
        </View>
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
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111827',
  },
});
