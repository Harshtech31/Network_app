import React, { useState, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ShareService } from '../utils/ShareService';

const { width, height } = Dimensions.get('window');

interface Comment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
}

interface Post {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  image?: string;
  isLiked?: boolean;
}

interface PostDetailModalProps {
  visible: boolean;
  post: Post | null;
  onClose: () => void;
}

export default function PostDetailModal({ visible, post, onClose }: PostDetailModalProps) {
  const [isLiked, setIsLiked] = useState(post?.isLiked || false);
  const [likesCount, setLikesCount] = useState(post?.likes || 0);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      author: 'Sarah Wilson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      content: 'This is amazing! Great work on the project. Would love to collaborate sometime.',
      timestamp: '2h',
      likes: 5,
    },
    {
      id: '2',
      author: 'Mike Chen',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      content: 'Impressive results! How did you handle the data preprocessing?',
      timestamp: '4h',
      likes: 2,
    },
    {
      id: '3',
      author: 'Emma Davis',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      content: 'Looking forward to seeing the full implementation. Keep it up! 🚀',
      timestamp: '6h',
      likes: 8,
    },
  ]);

  const slideAnim = useRef(new Animated.Value(height)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleShare = async () => {
    if (!post) return;
    
    try {
      const shareSuccess = await ShareService.sharePost({
        id: post.id,
        content: post.content,
        user: { name: post.author, avatar: post.avatar }
      });
      
      if (shareSuccess) {
        console.log('Post shared successfully');
      }
    } catch (error) {
      console.error('Error sharing post:', error);
      Alert.alert('Share Error', 'Unable to share this post.');
    }
  };

  const handleAddComment = () => {
    if (commentText.trim()) {
      const newComment: Comment = {
        id: Date.now().toString(),
        author: 'You',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        content: commentText.trim(),
        timestamp: 'now',
        likes: 0,
      };
      setComments(prev => [newComment, ...prev]);
      setCommentText('');
    }
  };

  if (!post) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        
        <Animated.View 
          style={[
            styles.modalContainer,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Post</Text>
            <TouchableOpacity style={styles.moreButton}>
              <Ionicons name="ellipsis-horizontal" size={24} color="#1F2937" />
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView 
            style={styles.content}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              {/* Post Content */}
              <View style={styles.postContainer}>
                <View style={styles.postHeader}>
                  <Image source={{ uri: post.avatar }} style={styles.authorAvatar} />
                  <View style={styles.authorInfo}>
                    <Text style={styles.authorName}>{post.author}</Text>
                    <Text style={styles.postTimestamp}>{post.timestamp}</Text>
                  </View>
                </View>

                <Text style={styles.postContent}>{post.content}</Text>

                {post.image && (
                  <Image source={{ uri: post.image }} style={styles.postImage} />
                )}

                {/* Post Actions */}
                <View style={styles.postActions}>
                  <TouchableOpacity 
                    style={[styles.actionButton, isLiked && styles.likedButton]}
                    onPress={handleLike}
                  >
                    <Ionicons 
                      name={isLiked ? "heart" : "heart-outline"} 
                      size={24} 
                      color={isLiked ? "#EF4444" : "#6B7280"} 
                    />
                    <Text style={[styles.actionText, isLiked && styles.likedText]}>
                      {likesCount}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="chatbubble-outline" size={24} color="#6B7280" />
                    <Text style={styles.actionText}>{comments.length}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                    <Ionicons name="share-outline" size={24} color="#6B7280" />
                    <Text style={styles.actionText}>{post.shares}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Comments Section */}
              <View style={styles.commentsSection}>
                <Text style={styles.commentsTitle}>Comments ({comments.length})</Text>
                
                {comments.map((comment) => (
                  <View key={comment.id} style={styles.commentItem}>
                    <Image source={{ uri: comment.avatar }} style={styles.commentAvatar} />
                    <View style={styles.commentContent}>
                      <View style={styles.commentBubble}>
                        <Text style={styles.commentAuthor}>{comment.author}</Text>
                        <Text style={styles.commentText}>{comment.content}</Text>
                      </View>
                      <View style={styles.commentActions}>
                        <Text style={styles.commentTimestamp}>{comment.timestamp}</Text>
                        <TouchableOpacity style={styles.commentLike}>
                          <Text style={styles.commentLikeText}>Like</Text>
                        </TouchableOpacity>
                        <TouchableOpacity>
                          <Text style={styles.commentReplyText}>Reply</Text>
                        </TouchableOpacity>
                        {comment.likes > 0 && (
                          <Text style={styles.commentLikesCount}>{comment.likes} likes</Text>
                        )}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>

            {/* Comment Input */}
            <View style={styles.commentInputContainer}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' }} 
                style={styles.inputAvatar} 
              />
              <TextInput
                style={styles.commentInput}
                placeholder="Write a comment..."
                value={commentText}
                onChangeText={setCommentText}
                multiline
                maxLength={500}
              />
              <TouchableOpacity 
                style={[styles.sendButton, !commentText.trim() && styles.sendButtonDisabled]}
                onPress={handleAddComment}
                disabled={!commentText.trim()}
              >
                <Ionicons 
                  name="send" 
                  size={20} 
                  color={commentText.trim() ? "#991B1B" : "#9CA3AF"} 
                />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: height * 0.9,
    maxHeight: height * 0.9,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  postContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  authorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  postTimestamp: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  postContent: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 16,
  },
  postImage: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginBottom: 16,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  likedButton: {
    backgroundColor: '#FEF2F2',
  },
  actionText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
    fontWeight: '500',
  },
  likedText: {
    color: '#EF4444',
  },
  commentsSection: {
    padding: 20,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentBubble: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
  },
  commentTimestamp: {
    fontSize: 12,
    color: '#6B7280',
    marginRight: 16,
  },
  commentLike: {
    marginRight: 16,
  },
  commentLikeText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  commentReplyText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginRight: 16,
  },
  commentLikesCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  inputAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 100,
    fontSize: 14,
    color: '#374151',
  },
  sendButton: {
    marginLeft: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
