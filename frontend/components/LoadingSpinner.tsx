import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  color = '#991B1B' 
}) => {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spin = () => {
      spinValue.setValue(0);
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => spin());
    };
    spin();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const sizeStyles = {
    small: { width: 20, height: 20, borderWidth: 2 },
    medium: { width: 32, height: 32, borderWidth: 3 },
    large: { width: 48, height: 48, borderWidth: 4 },
  };

  return (
    <Animated.View
      style={[
        styles.spinner,
        sizeStyles[size],
        { borderTopColor: color, transform: [{ rotate: spin }] },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  spinner: {
    borderRadius: 50,
    borderColor: 'transparent',
    borderTopColor: '#991B1B',
  },
});

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  visible, 
  message = 'Loading...' 
}) => {
  if (!visible) return null;

  return (
    <View style={overlayStyles.container}>
      <View style={overlayStyles.content}>
        <LoadingSpinner size="large" />
        <Text style={overlayStyles.message}>{message}</Text>
      </View>
    </View>
  );
};

const overlayStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    minWidth: 120,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
});
