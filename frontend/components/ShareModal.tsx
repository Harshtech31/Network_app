import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Clipboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  profileUrl: string;
}

export default function ShareModal({ visible, onClose, profileUrl }: ShareModalProps) {
  const copyToClipboard = () => {
    Clipboard.setString(profileUrl);
    Alert.alert('Copied!', 'Profile link copied to clipboard');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Share Profile</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.linkContainer}>
              <Text style={styles.linkText}>{profileUrl}</Text>
            </View>

            <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
              <Ionicons name="copy-outline" size={20} color="#991B1B" />
              <Text style={styles.copyButtonText}>Copy Link</Text>
            </TouchableOpacity>

            <View style={styles.shareOptions}>
              <TouchableOpacity style={styles.shareOption}>
                <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
                <Text style={styles.shareOptionText}>WhatsApp</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.shareOption}>
                <Ionicons name="logo-instagram" size={24} color="#E4405F" />
                <Text style={styles.shareOptionText}>Instagram</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.shareOption}>
                <Ionicons name="logo-linkedin" size={24} color="#0077B5" />
                <Text style={styles.shareOptionText}>LinkedIn</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.shareOption}>
                <Ionicons name="mail-outline" size={24} color="#374151" />
                <Text style={styles.shareOptionText}>Email</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
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
  content: {
    padding: 20,
  },
  linkContainer: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  linkText: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(127, 29, 29, 0.1)',
  },
  copyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#991B1B',
    marginLeft: 8,
  },
  shareOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  shareOption: {
    alignItems: 'center',
    padding: 12,
  },
  shareOptionText: {
    fontSize: 12,
    color: '#374151',
    marginTop: 4,
  },
});
