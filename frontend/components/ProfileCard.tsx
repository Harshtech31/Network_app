import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface ProfileCardProps {
  name: string;
  headline: string;
  connections: string | number;
  location: string;
  role?: 'student' | 'teacher' | 'alumni';
  onMessagePress: () => void;
  onMorePress: () => void;
  onConnectPress: () => void;
  onFollowPress: () => void;
  isConnected?: boolean;
  isFollowing?: boolean;
  showConnect?: boolean;
  showMessage?: boolean;
  showMore?: boolean;
  showFollow?: boolean;
  style?: ViewStyle;
}

// Helper function to get role emoji
const getRoleEmoji = (role?: 'student' | 'teacher' | 'alumni'): string => {
  switch (role) {
    case 'student':
      return '🎓';
    case 'teacher':
      return '👨‍🏫';
    case 'alumni':
      return '👥';
    default:
      return '🎓'; // Default to student
  }
};

const ProfileCard: React.FC<ProfileCardProps> = ({
  name,
  headline,
  connections,
  location,
  role,
  onMessagePress,
  onMorePress,
  onConnectPress,
  onFollowPress,
  isConnected = false,
  isFollowing = false,
  showConnect = true,
  showMessage = true,
  showMore = true,
  showFollow = true,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {/* Background Cover */}
      <View style={styles.coverImage} />
      
      {/* Profile Info */}
      <View style={styles.profileInfo}>
        <View style={styles.avatarContainer}>
          <Image 
            source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }} 
            style={styles.avatar}
          />
          {/* Role Emoji Badge */}
          <View style={styles.roleBadge}>
            <Text style={styles.roleEmoji}>{getRoleEmoji(role)}</Text>
          </View>
          {isConnected && (
            <View style={styles.connectionBadge}>
              <Ionicons name="checkmark" size={12} color="#FFFFFF" />
            </View>
          )}
        </View>
        
        <View style={styles.detailsContainer}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.headline} numberOfLines={2}>{headline}</Text>
          <Text style={styles.location}>
            <Ionicons name="location-outline" size={14} color="#666666" /> {location}
          </Text>
          
          <View style={styles.connectionsContainer}>
            <View style={styles.connectionItem}>
              <Text style={styles.connectionCount}>{connections}</Text>
              <Text style={styles.connectionLabel}>connections</Text>
            </View>
            <View style={styles.connectionItem}>
              <Text style={styles.connectionCount}>500+</Text>
              <Text style={styles.connectionLabel}>followers</Text>
            </View>
          </View>
        </View>
      </View>
      
      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {showConnect && (
          <TouchableOpacity 
            style={[styles.button, isConnected ? styles.connectedButton : null]} 
            onPress={onConnectPress}
          >
            <Ionicons 
              name={isConnected ? 'checkmark' : 'person-add'} 
              size={16} 
              color={isConnected ? '#0A66C2' : '#0A66C2'} 
            />
            <Text style={[styles.buttonText, isConnected ? styles.connectedButtonText : null]}>
              {isConnected ? 'Connected' : 'Connect'}
            </Text>
          </TouchableOpacity>
        )}
        
        {showMessage && (
          <TouchableOpacity 
            style={[styles.button, styles.messageButton]}
            onPress={onMessagePress}
          >
            <Ionicons name="chatbubble-ellipses" size={16} color="#0A66C2" />
            <Text style={[styles.buttonText, styles.messageButtonText]}>Message</Text>
          </TouchableOpacity>
        )}
        
        {showFollow && (
          <TouchableOpacity 
            style={[styles.button, isFollowing ? styles.followingButton : styles.followButton]}
            onPress={onFollowPress}
          >
            <Ionicons 
              name={isFollowing ? 'checkmark' : 'add'} 
              size={16} 
              color={isFollowing ? '#666666' : '#0A66C2'} 
            />
            <Text style={[styles.buttonText, isFollowing ? styles.followingButtonText : styles.followButtonText]}>
              {isFollowing ? 'Following' : 'Follow'}
            </Text>
          </TouchableOpacity>
        )}
        
        {showMore && (
          <TouchableOpacity 
            style={[styles.button, styles.moreButton]}
            onPress={onMorePress}
          >
            <Ionicons name="ellipsis-horizontal" size={16} color="#666666" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
    marginBottom: 16,
  },
  coverImage: {
    height: 80,
    backgroundColor: '#E9E5DF',
  },
  profileInfo: {
    paddingHorizontal: 16,
    marginTop: -40,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  roleBadge: {
    position: 'absolute',
    top: -5,
    left: -5,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roleEmoji: {
    fontSize: 16,
  },
  connectionBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0A66C2',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  detailsContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000E6',
    marginBottom: 4,
  },
  headline: {
    fontSize: 14,
    color: '#00000099',
    textAlign: 'center',
    marginBottom: 4,
    maxWidth: width * 0.8,
  },
  location: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  connectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  connectionCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A66C2',
    marginRight: 4,
  },
  connectionLabel: {
    fontSize: 12,
    color: '#666666',
  },
  actionButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#E0E0E0',
    padding: 8,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  buttonText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
  },
  connectedButton: {
    backgroundColor: '#E2F0FE',
  },
  connectedButtonText: {
    color: '#0A66C2',
  },
  messageButton: {
    borderWidth: 1,
    borderColor: '#0A66C2',
  },
  messageButtonText: {
    color: '#0A66C2',
  },
  followButton: {
    borderWidth: 1,
    borderColor: '#0A66C2',
  },
  followButtonText: {
    color: '#0A66C2',
  },
  followingButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F3F2EF',
  },
  followingButtonText: {
    color: '#666666',
  },
  moreButton: {
    maxWidth: 40,
  },
});

export default ProfileCard;
