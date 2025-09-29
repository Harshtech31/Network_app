import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.25;

interface CollaborationEvent {
  id: string;
  title: string;
  description: string;
  author: string;
  authorAvatar: string;
  skills: string[];
  duration: string;
  location: string;
  teamSize: string;
  experience: string;
  timeCommitment: string;
  tags: string[];
  image: string;
  category: string;
}

export default function CollaborationScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedEvents, setLikedEvents] = useState<CollaborationEvent[]>([]);
  const [passedEvents, setPassedEvents] = useState<CollaborationEvent[]>([]);
  const [showLikedModal, setShowLikedModal] = useState(false);
  const [showPassedModal, setShowPassedModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CollaborationEvent | null>(null);

  const position = useRef(new Animated.ValueXY()).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const likeOpacity = useRef(new Animated.Value(0)).current;
  const passOpacity = useRef(new Animated.Value(0)).current;

  // Collaboration events will be loaded from API
  const events: CollaborationEvent[] = [];

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gesture) => {
      position.setValue({ x: gesture.dx, y: gesture.dy });
      
      const rotateValue = gesture.dx / width * 0.4;
      rotate.setValue(rotateValue);
      
      if (gesture.dx > 50) {
        likeOpacity.setValue(Math.min(gesture.dx / 120, 1));
        passOpacity.setValue(0);
      } else if (gesture.dx < -50) {
        passOpacity.setValue(Math.min(Math.abs(gesture.dx) / 120, 1));
        likeOpacity.setValue(0);
      } else {
        likeOpacity.setValue(0);
        passOpacity.setValue(0);
      }
    },
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx > SWIPE_THRESHOLD) {
        handleLike();
      } else if (gesture.dx < -SWIPE_THRESHOLD) {
        handlePass();
      } else {
        resetPosition();
      }
    },
  });

  const resetPosition = () => {
    Animated.parallel([
      Animated.spring(position, { toValue: { x: 0, y: 0 }, useNativeDriver: false }),
      Animated.spring(rotate, { toValue: 0, useNativeDriver: false }),
      Animated.timing(likeOpacity, { toValue: 0, duration: 200, useNativeDriver: false }),
      Animated.timing(passOpacity, { toValue: 0, duration: 200, useNativeDriver: false }),
    ]).start();
  };

  const handleLike = () => {
    if (currentIndex >= events.length) return;
    const currentEvent = events[currentIndex];
    setLikedEvents(prev => [...prev, currentEvent]);
    animateCardOut(true);
  };

  const handlePass = () => {
    if (currentIndex >= events.length) return;
    const currentEvent = events[currentIndex];
    setPassedEvents(prev => [...prev, currentEvent]);
    animateCardOut(false);
  };

  const animateCardOut = (isLike: boolean) => {
    const toValue = isLike ? width + 100 : -width - 100;
    Animated.parallel([
      Animated.timing(position, {
        toValue: { x: toValue, y: 0 },
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(rotate, {
        toValue: isLike ? 0.3 : -0.3,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start(() => {
      setCurrentIndex(prev => prev + 1);
      position.setValue({ x: 0, y: 0 });
      rotate.setValue(0);
      likeOpacity.setValue(0);
      passOpacity.setValue(0);
    });
  };

  const handleCardPress = () => {
    if (currentIndex >= events.length) return;
    setSelectedEvent(events[currentIndex]);
    setShowDetailModal(true);
  };

  const renderCard = (event: CollaborationEvent, index: number) => {
    if (index < currentIndex) return null;
    
    const isTopCard = index === currentIndex;
    const cardStyle = isTopCard ? {
      transform: [
        ...position.getTranslateTransform(),
        {
          rotate: rotate.interpolate({
            inputRange: [-1, 0, 1],
            outputRange: ['-30deg', '0deg', '30deg'],
          }),
        },
      ],
    } : {};

    return (
      <Animated.View
        key={event.id}
        style={[
          styles.card,
          cardStyle,
          { zIndex: events.length - index }
        ]}
        {...(isTopCard ? panResponder.panHandlers : {})}
      >
        <TouchableOpacity 
          style={styles.cardContent}
          onPress={handleCardPress}
          activeOpacity={0.95}
        >
          <Image source={{ uri: event.image }} style={styles.cardImage} />
          
          {/* Like/Pass Overlays */}
          {isTopCard && (
            <>
              <Animated.View style={[styles.likeOverlay, { opacity: likeOpacity }]}>
                <Text style={styles.overlayText}>LIKE</Text>
              </Animated.View>
              <Animated.View style={[styles.passOverlay, { opacity: passOpacity }]}>
                <Text style={styles.overlayText}>PASS</Text>
              </Animated.View>
            </>
          )}

          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.cardGradient}
          >
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>{event.title}</Text>
              <Text style={styles.cardAuthor}>by {event.author}</Text>
              <Text style={styles.cardDescription} numberOfLines={2}>
                {event.description}
              </Text>
              
              <View style={styles.cardDetails}>
                <View style={styles.detailItem}>
                  <Ionicons name="time-outline" size={14} color="#FFF" />
                  <Text style={styles.detailText}>{event.duration}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="location-outline" size={14} color="#FFF" />
                  <Text style={styles.detailText}>{event.location}</Text>
                </View>
              </View>

              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.skillsContainer}
              >
                {event.skills.slice(0, 3).map((skill, idx) => (
                  <View key={idx} style={styles.skillChip}>
                    <Text style={styles.skillText}>{skill}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fef2f2" translucent={true} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find Collaborators</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.createCollabButton}
            onPress={() => router.push('/CreateCollaborationScreen')}
          >
            <Ionicons name="add" size={16} color="#FFFFFF" />
            <Text style={styles.createCollabText}>New</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
            <Ionicons name="close" size={24} color="#7f1d1d" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <TouchableOpacity 
          style={styles.statButton}
          onPress={() => setShowLikedModal(true)}
        >
          <Ionicons name="heart" size={20} color="#7f1d1d" />
          <Text style={styles.statText}>Liked ({likedEvents.length})</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.statButton}
          onPress={() => setShowPassedModal(true)}
        >
          <Ionicons name="close" size={20} color="#666" />
          <Text style={styles.statText}>Passed ({passedEvents.length})</Text>
        </TouchableOpacity>
      </View>

      {/* Cards Container */}
      <View style={styles.cardsContainer}>
        {currentIndex >= events.length ? (
          <View style={styles.noMoreCards}>
            <Ionicons name="checkmark-circle" size={80} color="#7f1d1d" />
            <Text style={styles.noMoreText}>No more collaborations!</Text>
            <Text style={styles.noMoreSubtext}>Check back later for new opportunities</Text>
          </View>
        ) : (
          events.map((event, index) => renderCard(event, index))
        )}
      </View>

      {/* Action Buttons - moved down with cards */}
      {currentIndex < events.length && (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.passButton]}
            onPress={handlePass}
          >
            <Ionicons name="close" size={30} color="#666" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.likeButton]}
            onPress={handleLike}
          >
            <Ionicons name="heart" size={30} color="#7f1d1d" />
          </TouchableOpacity>
        </View>
      )}

      {/* Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {selectedEvent && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Event Details</Text>
              <View style={{ width: 24 }} />
            </View>
            
            <ScrollView style={styles.modalContent}>
              <Image source={{ uri: selectedEvent.image }} style={styles.modalImage} />
              
              <View style={styles.modalInfo}>
                <Text style={styles.modalEventTitle}>{selectedEvent.title}</Text>
                <Text style={styles.modalAuthor}>by {selectedEvent.author}</Text>
                
                <Text style={styles.modalDescription}>{selectedEvent.description}</Text>
                
                <View style={styles.modalDetails}>
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>Duration:</Text>
                    <Text style={styles.modalDetailValue}>{selectedEvent.duration}</Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>Location:</Text>
                    <Text style={styles.modalDetailValue}>{selectedEvent.location}</Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>Team Size:</Text>
                    <Text style={styles.modalDetailValue}>{selectedEvent.teamSize}</Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>Experience:</Text>
                    <Text style={styles.modalDetailValue}>{selectedEvent.experience}</Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>Time Commitment:</Text>
                    <Text style={styles.modalDetailValue}>{selectedEvent.timeCommitment}</Text>
                  </View>
                </View>
                
                <Text style={styles.skillsTitle}>Skills Needed:</Text>
                <View style={styles.modalSkills}>
                  {selectedEvent.skills.map((skill, idx) => (
                    <View key={idx} style={styles.modalSkillChip}>
                      <Text style={styles.modalSkillText}>{skill}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>

      {/* Liked Events Modal */}
      <Modal
        visible={showLikedModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowLikedModal(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Liked Events ({likedEvents.length})</Text>
            <View style={{ width: 24 }} />
          </View>
          
          <ScrollView style={styles.listContainer}>
            {likedEvents.map((event) => (
              <TouchableOpacity 
                key={event.id} 
                style={styles.listItem}
                onPress={() => {
                  setSelectedEvent(event);
                  setShowLikedModal(false);
                  setShowDetailModal(true);
                }}
              >
                <Image source={{ uri: event.image }} style={styles.listImage} />
                <View style={styles.listInfo}>
                  <Text style={styles.listTitle}>{event.title}</Text>
                  <Text style={styles.listAuthor}>by {event.author}</Text>
                  <Text style={styles.listDescription} numberOfLines={2}>
                    {event.description}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Passed Events Modal */}
      <Modal
        visible={showPassedModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowPassedModal(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Passed Events ({passedEvents.length})</Text>
            <View style={{ width: 24 }} />
          </View>
          
          <ScrollView style={styles.listContainer}>
            {passedEvents.map((event) => (
              <TouchableOpacity 
                key={event.id} 
                style={styles.listItem}
                onPress={() => {
                  setSelectedEvent(event);
                  setShowPassedModal(false);
                  setShowDetailModal(true);
                }}
              >
                <Image source={{ uri: event.image }} style={styles.listImage} />
                <View style={styles.listInfo}>
                  <Text style={styles.listTitle}>{event.title}</Text>
                  <Text style={styles.listAuthor}>by {event.author}</Text>
                  <Text style={styles.listDescription} numberOfLines={2}>
                    {event.description}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF2E8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FFF2E8'
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#7f1d1d',
    letterSpacing: -0.5
  },
  closeBtn: {
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#7f1d1d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  statsBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF2E8',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#FECACA',
  },
  statButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'transparent',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  statText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#7f1d1d',
  },
  cardsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFF2E8',
  },
  card: {
    position: 'absolute',
    width: width - 60,
    height: height * 0.55,
    borderRadius: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  cardContent: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '60%',
    resizeMode: 'cover',
  },
  cardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    justifyContent: 'flex-end',
  },
  cardInfo: {
    padding: 20,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  cardAuthor: {
    fontSize: 16,
    color: '#E5E7EB',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#F3F4F6',
    lineHeight: 20,
    marginBottom: 12,
  },
  cardDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#E5E7EB',
  },
  skillsContainer: {
    marginTop: 8,
  },
  skillChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  skillText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  likeOverlay: {
    position: 'absolute',
    top: 50,
    left: 30,
    backgroundColor: '#42C767',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    transform: [{ rotate: '-30deg' }],
    zIndex: 10,
  },
  passOverlay: {
    position: 'absolute',
    top: 50,
    right: 30,
    backgroundColor: '#FF4458',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    transform: [{ rotate: '30deg' }],
    zIndex: 10,
  },
  overlayText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    paddingVertical: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    backgroundColor: '#FFF2E8',
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  passButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#666',
  },
  likeButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#7f1d1d',
  },
  noMoreCards: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  noMoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7f1d1d',
    marginTop: 20,
  },
  noMoreSubtext: {
    fontSize: 16,
    color: '#7f1d1d',
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFF2E8',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#FECACA',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7f1d1d',
  },
  modalContent: {
    flex: 1,
  },
  modalImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  modalInfo: {
    padding: 20,
  },
  modalEventTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7f1d1d',
    marginBottom: 4,
  },
  modalAuthor: {
    fontSize: 16,
    color: '#7f1d1d',
    marginBottom: 16,
  },
  modalDescription: {
    fontSize: 16,
    color: '#7f1d1d',
    lineHeight: 24,
    marginBottom: 20,
  },
  modalDetails: {
    marginBottom: 20,
  },
  modalDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#FECACA',
  },
  modalDetailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f1d1d',
  },
  modalDetailValue: {
    fontSize: 14,
    color: '#7f1d1d',
  },
  skillsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7f1d1d',
    marginBottom: 12,
  },
  modalSkills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalSkillChip: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#7f1d1d',
  },
  modalSkillText: {
    fontSize: 12,
    color: '#7f1d1d',
    fontWeight: '500',
  },
  listContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFF2E8',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    shadowColor: '#7f1d1d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  listImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  listInfo: {
    flex: 1,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7f1d1d',
    marginBottom: 2,
  },
  listAuthor: {
    fontSize: 14,
    color: '#7f1d1d',
    marginBottom: 4,
  },
  listDescription: {
    fontSize: 12,
    color: '#7f1d1d',
    lineHeight: 16,
  },
  createCollabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#7f1d1d',
    borderRadius: 16,
    shadowColor: '#7f1d1d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  createCollabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});