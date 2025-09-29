import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { ErrorBoundary } from '../../components/ErrorBoundary';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Chat, Message } from '../../types';
import { Validator } from '../../utils/errorHandler';
import apiService from '../../utils/apiService';
import { useAuth } from '../../contexts/AuthContext';

// Styles defined first to avoid hoisting issues
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FEF2F2' 
  },
  
  // Error styles
  errorContainer: {
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'space-between',
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 14,
    flex: 1,
  },
  dismissError: {
    padding: 4,
  },

  // Redesigned Header Styles
  redesignedHeader: {
    backgroundColor: '#7f1d1d',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTopSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  redesignedBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  redesignedChatInfo: {
    flex: 1,
    marginLeft: 16,
  },
  redesignedAvatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  redesignedAvatarContainer: {
    position: 'relative',
  },
  redesignedChatAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  redesignedStatusRing: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  redesignedOnlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  redesignedChatDetails: {
    marginLeft: 12,
  },
  redesignedChatTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  redesignedGroupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  redesignedGroupBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  redesignedGroupText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 4,
  },
  redesignedStatusDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 6,
  },
  redesignedLastSeen: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  redesignedHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  redesignedActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonGlow: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Quick Actions Bar
  quickActionsBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#7f1d1d',
    gap: 16,
  },
  quickAction: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
  },
  quickActionText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    marginTop: 4,
  },

  // Members Section
  membersSection: { 
    backgroundColor: '#FEF2F2', 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    borderTopWidth: 1, 
    borderTopColor: 'rgba(139, 26, 26, 0.1)' 
  },
  membersTitle: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#7f1d1d', 
    marginBottom: 12 
  },
  membersContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap' 
  },
  memberChip: { 
    backgroundColor: '#FEF2F2', 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 16, 
    marginRight: 8, 
    marginBottom: 8, 
    borderWidth: 1, 
    borderColor: '#7f1d1d', 
  },
  memberChipText: { 
    fontSize: 12, 
    color: '#7f1d1d', 
    fontWeight: '600' 
  },

  // Messages Area Styles
  redesignedMessagesWrapper: {
    flex: 1,
  },
  redesignedMessagesContainer: {
    flex: 1,
    backgroundColor: '#FFF2E8',
  },
  redesignedMessagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateSeparator: {
    alignItems: 'center',
    marginVertical: 16,
    flexDirection: 'row',
  },
  dateLine: {
    height: 1,
    backgroundColor: '#E5E7EB',
    flex: 1,
  },
  dateText: {
    backgroundColor: '#FFF2E8',
    paddingHorizontal: 12,
    fontSize: 12,
    color: '#7f1d1d',
    fontWeight: '500',
  },

  // Modern Message Styles
  modernMessageContainer: { 
    marginVertical: 6 
  },
  myModernMessageContainer: { 
    alignItems: 'flex-end' 
  },
  otherModernMessageContainer: { 
    alignItems: 'flex-start' 
  },
  modernSenderName: { 
    fontSize: 13, 
    color: '#7f1d1d', 
    marginBottom: 6, 
    marginHorizontal: 16, 
    fontWeight: '600' 
  },
  modernMessageBubble: { 
    maxWidth: '80%', 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    borderRadius: 24 
  },
  myModernMessage: { 
    backgroundColor: '#7f1d1d', 
    borderBottomRightRadius: 8 
  },
  otherModernMessage: { 
    backgroundColor: '#FFFFFF', 
    borderBottomLeftRadius: 8, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 8, 
    elevation: 4, 
    borderWidth: 1, 
    borderColor: 'rgba(139, 26, 26, 0.1)' 
  },
  modernMessageText: { 
    fontSize: 16, 
    lineHeight: 22 
  },
  myModernMessageText: { 
    color: '#FFFFFF' 
  },
  otherModernMessageText: { 
    color: '#111827' 
  },
  messageFooter: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'flex-end', 
    marginTop: 6 
  },
  modernMessageTime: { 
    fontSize: 11, 
    fontWeight: '500' 
  },
  myModernMessageTime: { 
    color: 'rgba(255, 255, 255, 0.8)' 
  },
  otherModernMessageTime: { 
    color: '#9CA3AF' 
  },
  readIndicator: { 
    marginLeft: 4 
  },
  deletedMessageText: {
    fontStyle: 'italic',
    color: '#9CA3AF',
    opacity: 0.7
  },

  // Typing Indicator Styles
  typingIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9CA3AF',
  },
  dot1: {},
  dot2: {},
  dot3: {},
  typingText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 8,
  },

  // Modern Input Styles
  inputContainer: { 
    backgroundColor: '#FFF2E8', 
    borderTopWidth: 1, 
    borderTopColor: 'rgba(139, 26, 26, 0.1)' 
  },
  modernInputContainer: { 
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    backgroundColor: '#FFF2E8' 
  },
  attachButton: { 
    padding: 12, 
    backgroundColor: '#FFF2E8', 
    borderRadius: 20, 
    marginRight: 12 
  },
  inputWrapper: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    backgroundColor: '#FFFFFF', 
    borderRadius: 24, 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    marginRight: 12, 
    borderWidth: 1, 
    borderColor: '#FECACA' 
  },
  modernTextInput: { 
    flex: 1, 
    fontSize: 16, 
    color: '#111827', 
    maxHeight: 100, 
    paddingVertical: 8 
  },
  emojiButton: { 
    padding: 8, 
    marginLeft: 8 
  },
  modernSendButton: { 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  activeSendButton: { 
    backgroundColor: '#7f1d1d' 
  },
  inactiveSendButton: { 
    backgroundColor: '#D1D5DB' 
  },
  
  // WhatsApp-style Header Styles
  whatsappHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF2E8',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 54,
    shadowColor: '#8B1A1A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 26, 26, 0.1)',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  chatHeaderInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  chatHeaderName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7f1d1d',
    marginBottom: 2,
  },
  chatHeaderStatus: {
    fontSize: 14,
    color: '#6B7280',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActionButton: {
    padding: 8,
    marginLeft: 4,
  },

});

// Mock chat data with proper types
const CHAT_DATA: Record<string, Chat> = {
  '1': {
    id: '1',
    name: 'Sarah Chen',
    avatar: 'https://i.pravatar.cc/150?u=sarahchen',
    type: 'personal',
    members: [],
    messages: [
      { id: '1', sender: 'Sarah Chen', senderId: 'sarah1', message: 'Hey! Are you coming to the meetup?', time: '8:00 PM', timestamp: new Date(), isMe: false, read: true },
      { id: '2', sender: 'You', senderId: 'me', message: 'Yes! Just finishing class now', time: '8:02 PM', timestamp: new Date(), isMe: true, read: true },
      { id: '3', sender: 'Sarah Chen', senderId: 'sarah1', message: 'Great! See you there', time: '8:03 PM', timestamp: new Date(), isMe: false, read: true },
      { id: '4', sender: 'Sarah Chen', senderId: 'sarah1', message: 'Can anyone help with the ML project?', time: '2:45 PM', timestamp: new Date(), isMe: false, read: true },
      { id: '5', sender: 'You', senderId: 'me', message: 'I can help! What do you need?', time: '2:47 PM', timestamp: new Date(), isMe: true, read: true },
      { id: '6', sender: 'Sarah Chen', senderId: 'sarah1', message: 'Thanks! Need help with data preprocessing', time: '2:48 PM', timestamp: new Date(), isMe: false, read: false },
    ]
  },
  '2': {
    id: '2',
    name: 'AI Club Group',
    avatar: 'https://i.pravatar.cc/150?u=aiclub',
    type: 'group',
    members: [
      { id: 'alex1', name: 'Alex Kumar', email: 'alex@example.com', avatar: '', bio: '', skills: [], isOnline: true },
      { id: 'maya1', name: 'Maya Patel', email: 'maya@example.com', avatar: '', bio: '', skills: [], isOnline: false },
      { id: 'jordan1', name: 'Jordan Smith', email: 'jordan@example.com', avatar: '', bio: '', skills: [], isOnline: true },
      { id: 'me', name: 'You', email: 'you@example.com', avatar: '', bio: '', skills: [], isOnline: true }
    ],
    messages: [
      { id: '1', sender: 'Alex Kumar', senderId: 'alex1', message: 'Hey! Are you coming to the meetup?', time: '8:00 PM', timestamp: new Date(), isMe: false, read: true },
      { id: '2', sender: 'You', senderId: 'me', message: 'Yes! Just finishing class now', time: '8:02 PM', timestamp: new Date(), isMe: true, read: true },
      { id: '3', sender: 'Maya Patel', senderId: 'maya1', message: 'Great! See you there', time: '8:03 PM', timestamp: new Date(), isMe: false, read: true },
      { id: '4', sender: 'Jordan Smith', senderId: 'jordan1', message: 'Can anyone help with the ML project?', time: '2:45 PM', timestamp: new Date(), isMe: false, read: true },
      { id: '5', sender: 'You', senderId: 'me', message: 'I can help! What do you need?', time: '2:47 PM', timestamp: new Date(), isMe: true, read: false },
      { id: '6', sender: 'Alex Kumar', senderId: 'alex1', message: 'Thanks! Need help with data preprocessing', time: '2:48 PM', timestamp: new Date(), isMe: false, read: false },
    ]
  },
  '3': {
    id: '3',
    name: 'David Lee',
    avatar: 'https://i.pravatar.cc/150?u=davidlee',
    type: 'personal',
    members: [],
    messages: [
      { id: '1', sender: 'David Lee', senderId: 'david1', message: 'Just pushed the latest commit.', time: 'Yesterday', timestamp: new Date(), isMe: false, read: true },
      { id: '2', sender: 'You', senderId: 'me', message: 'Thanks! I\'ll review it now', time: 'Yesterday', timestamp: new Date(), isMe: true, read: true },
      { id: '3', sender: 'David Lee', senderId: 'david1', message: 'Let me know if you need any changes', time: 'Yesterday', timestamp: new Date(), isMe: false, read: true },
      { id: '4', sender: 'You', senderId: 'me', message: 'Looks good! Ready to merge', time: 'Yesterday', timestamp: new Date(), isMe: true, read: false },
    ]
  },
  '4': {
    id: '4',
    name: 'Hackathon Squad',
    avatar: 'https://i.pravatar.cc/150?u=hackathon',
    type: 'group',
    members: [
      { id: 'emma1', name: 'Emma Wilson', email: 'emma@example.com', avatar: '', bio: '', skills: [], isOnline: true },
      { id: 'ryan1', name: 'Ryan Chen', email: 'ryan@example.com', avatar: '', bio: '', skills: [], isOnline: false },
      { id: 'zoe1', name: 'Zoe Martinez', email: 'zoe@example.com', avatar: '', bio: '', skills: [], isOnline: true },
      { id: 'me', name: 'You', email: 'you@example.com', avatar: '', bio: '', skills: [], isOnline: true }
    ],
    messages: [
      { id: '1', sender: 'Emma Wilson', senderId: 'emma1', message: 'What time should we meet tomorrow?', time: 'Yesterday', timestamp: new Date(), isMe: false, read: true },
      { id: '2', sender: 'You', senderId: 'me', message: 'How about 9 AM at the library?', time: 'Yesterday', timestamp: new Date(), isMe: true, read: true },
      { id: '3', sender: 'Ryan Chen', senderId: 'ryan1', message: 'Sounds good! 10 AM?', time: 'Yesterday', timestamp: new Date(), isMe: false, read: true },
      { id: '4', sender: 'Zoe Martinez', senderId: 'zoe1', message: 'Perfect, see you all there!', time: 'Yesterday', timestamp: new Date(), isMe: false, read: true },
      { id: '5', sender: 'You', senderId: 'me', message: 'Bring your laptops and chargers', time: 'Yesterday', timestamp: new Date(), isMe: true, read: false },
    ]
  },
  '5': {
    id: '5',
    name: 'Study Buddies',
    avatar: 'https://i.pravatar.cc/150?u=studybuddies',
    type: 'group',
    members: [
      { id: 'lisa1', name: 'Lisa Park', email: 'lisa@example.com', avatar: '', bio: '', skills: [], isOnline: true },
      { id: 'tom1', name: 'Tom Anderson', email: 'tom@example.com', avatar: '', bio: '', skills: [], isOnline: false },
      { id: 'nina1', name: 'Nina Rodriguez', email: 'nina@example.com', avatar: '', bio: '', skills: [], isOnline: true },
      { id: 'me', name: 'You', email: 'you@example.com', avatar: '', bio: '', skills: [], isOnline: true }
    ],
    messages: [
      { id: '1', sender: 'Lisa Park', senderId: 'lisa1', message: 'Anyone free for coffee study session?', time: '3h', timestamp: new Date(), isMe: false, read: true },
      { id: '2', sender: 'Tom Anderson', senderId: 'tom1', message: 'I\'m in! When and where?', time: '3h', timestamp: new Date(), isMe: false, read: true },
      { id: '3', sender: 'You', senderId: 'me', message: 'How about the campus café at 2 PM?', time: '2h', timestamp: new Date(), isMe: true, read: true },
      { id: '4', sender: 'Nina Rodriguez', senderId: 'nina1', message: 'Perfect! I\'ll bring my notes', time: '2h', timestamp: new Date(), isMe: false, read: true },
      { id: '5', sender: 'Lisa Park', senderId: 'lisa1', message: 'Great! See you all there', time: '2h', timestamp: new Date(), isMe: false, read: false },
    ]
  }
};

interface MessageBubbleProps {
  message: Message;
  onDelete: (messageId: string) => void;
  isFirst: boolean;
  isLast: boolean;
}

const RedesignedMessageBubble: React.FC<MessageBubbleProps> = ({ message, onDelete, isFirst, isLast }) => {
  const handleLongPress = () => {
    if (message.isMe) {
      Alert.alert(
        'Delete Message',
        'Are you sure you want to delete this message?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => onDelete(message.id) }
        ]
      );
    }
  };

  return (
    <View style={[styles.modernMessageContainer, message.isMe ? styles.myModernMessageContainer : styles.otherModernMessageContainer]}>
      {!message.isMe && (
        <Text style={styles.modernSenderName}>{message.sender}</Text>
      )}
      <TouchableOpacity
        onLongPress={handleLongPress}
        delayLongPress={500}
        style={[styles.modernMessageBubble, message.isMe ? styles.myModernMessage : styles.otherModernMessage]}
      >
        <Text style={[
          styles.modernMessageText, 
          message.isMe ? styles.myModernMessageText : styles.otherModernMessageText,
          message.isDeleted && styles.deletedMessageText
        ]}>
          {message.message}
        </Text>
        <View style={styles.messageFooter}>
          <Text style={[styles.modernMessageTime, message.isMe ? styles.myModernMessageTime : styles.otherModernMessageTime]}>
            {message.time}
          </Text>
          {message.isMe && (
            <Ionicons 
              name={message.read ? "checkmark-done" : "checkmark"} 
              size={14} 
              color={message.read ? "#10B981" : "#9CA3AF"} 
              style={styles.readIndicator}
            />
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const MemberChip = ({ name }: { name: string }) => (
  <View style={styles.memberChip}>
    <Text style={styles.memberChipText}>{name}</Text>
  </View>
);

interface ChatScreenProps {}

const ChatScreen: React.FC<ChatScreenProps> = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { id, name, type } = useLocalSearchParams<{ id: string; name?: string; type?: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [chatData, setChatData] = useState<any>(null);
  
  // Keyboard and scroll handling
  const flatListRef = useRef<FlatList>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  
  // Load messages when component mounts
  useEffect(() => {
    loadMessages();
  }, [id]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      console.log('💬 Loading messages for conversation:', id);
      
      // Load conversation messages
      const response = await apiService.get<any>(`/messages/conversations/${id}/messages`);
      
      if (response.success && response.data) {
        const messagesData = response.data.messages || [];
        
        // Convert backend messages to expected format
        const formattedMessages = messagesData.map((msg: any) => ({
          id: msg.id,
          sender: msg.sender?.firstName ? `${msg.sender.firstName} ${msg.sender.lastName}` : 'Unknown',
          senderId: msg.senderId,
          message: msg.content,
          time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: new Date(msg.createdAt),
          isMe: msg.senderId === user?.id,
          read: msg.read || false,
        }));
        
        setMessages(formattedMessages);
        
        // Also get conversation info
        if (response.data.conversation) {
          setChatData(response.data.conversation);
        }
        
        console.log('✅ Messages loaded:', formattedMessages.length);
      } else {
        console.log('⚠️ No messages data received');
        setMessages([]);
      }
    } catch (error) {
      console.error('❌ Error loading messages:', error);
      setError('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    const messageText = newMessage.trim();
    setNewMessage('');
    
    try {
      console.log('📤 Sending message:', messageText);
      
      // Call API to send message
      const response = await apiService.post(`/messages/conversations/${id}/messages`, {
        content: messageText
      });
      
      if (response.success) {
        console.log('✅ Message sent successfully');
        
        // Add message to local state immediately for better UX
        const newMsg = {
          id: Date.now().toString(),
          sender: user?.firstName ? `${user.firstName} ${user.lastName}` : 'You',
          senderId: user?.id || 'me',
          message: messageText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: new Date(),
          isMe: true,
          read: false,
        };
        
        setMessages(prev => [...prev, newMsg]);
        
        // Scroll to bottom
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
      setNewMessage(messageText); // Restore message text
    }
  };

  // Keyboard event listeners for WhatsApp-style behavior
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        setKeyboardHeight(event.endCoordinates.height);
        setIsKeyboardVisible(true);
        // Scroll to bottom when keyboard appears
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
        setIsKeyboardVisible(false);
      }
    );

    return () => {
      keyboardWillShowListener?.remove();
      keyboardWillHideListener?.remove();
    };
  }, []);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);



  const deleteMessage = (messageId: string) => {
    setMessages((prev: Message[]) => prev.map((msg: Message) => 
      msg.id === messageId 
        ? { ...msg, message: 'This message was deleted', isDeleted: true }
        : msg
    ));
  };

  const handleDeleteMessage = (messageId: string) => {
    deleteMessage(messageId);
  };

  return (
    <ErrorBoundary>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        enabled={true}
      >
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="light-content" backgroundColor="#8B1A1A" translucent={false} />
          
          {/* Error Display */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={() => setError(null)} style={styles.dismissError}>
                <Ionicons name="close" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}
          
          {/* Loading Overlay */}
          {isLoading && <LoadingSpinner size="large" />}
        
          {/* WhatsApp-style Chat Header */}
          <View style={styles.whatsappHeader}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color="#8B1A1A" />
            </TouchableOpacity>
            <View style={styles.chatHeaderInfo}>
              <Image 
                source={{ 
                  uri: chatData?.avatar || `https://i.pravatar.cc/150?u=${id}` 
                }} 
                style={styles.headerAvatar} 
              />
              <TouchableOpacity style={styles.headerTextContainer} onPress={() => router.push('/PersonDetailScreen')}>
                <Text style={styles.chatHeaderName}>
                  {chatData?.name || name || 'Chat'}
                </Text>
                <Text style={styles.chatHeaderStatus}>
                  {chatData?.type === 'group' 
                    ? `${chatData?.members?.length || 0} members` 
                    : (chatData?.isOnline ? 'Online' : 'Last seen recently')
                  }
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.headerActions}>
            </View>
          </View>
        
          {/* Messages List */}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={({ item, index }) => (
              <RedesignedMessageBubble 
                message={item}
                onDelete={handleDeleteMessage}
                isFirst={index === 0}
                isLast={index === messages.length - 1}
              />
            )}
            keyExtractor={(item) => item.id}
            style={styles.redesignedMessagesContainer}
            contentContainerStyle={[
              styles.redesignedMessagesContent, 
              { 
                paddingBottom: 20
              }
            ]}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
              autoscrollToTopThreshold: 10,
            }}
            inverted={false}
            removeClippedSubviews={true}
            windowSize={10}
          />

          {/* Message Input */}
          <View style={styles.inputContainer}>
            <View style={styles.modernInputContainer}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.modernTextInput}
                  placeholder="Message..."
                  placeholderTextColor="#9CA3AF"
                  value={newMessage}
                  onChangeText={setNewMessage}
                  onFocus={() => {
                    // Scroll to bottom when input is focused
                    setTimeout(() => {
                      flatListRef.current?.scrollToEnd({ animated: true });
                    }, 200);
                  }}
                  onBlur={() => {
                    // Dismiss keyboard and reset layout when input loses focus
                    Keyboard.dismiss();
                  }}
                  multiline
                  maxLength={500}
                />
              </View>
              <TouchableOpacity 
                onPress={sendMessage} 
                style={[styles.modernSendButton, newMessage.trim() ? styles.activeSendButton : styles.inactiveSendButton]}
                disabled={!newMessage.trim()}
              >
                <Ionicons name="send" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

        </SafeAreaView>
      </KeyboardAvoidingView>
    </ErrorBoundary>
  );
};

export default ChatScreen;
