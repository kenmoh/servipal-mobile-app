import React, { useEffect } from 'react';
import { Animated, TouchableOpacity, View, Text } from 'react-native';
import { useRiderStore } from '@/store/rider-store';

interface NewRidersBannerProps {
  onPress: () => void;  
}

const NewRidersBanner: React.FC<NewRidersBannerProps> = ({ onPress }) => {
  const { newRiderCount, clearNewRiders } = useRiderStore();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (newRiderCount > 0) {
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Auto-hide after 5s
      const timer = setTimeout(() => {
        clearNewRiders();
        Animated.timing(fadeAnim, { toValue: 0, duration: 300 }).start();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [newRiderCount, fadeAnim]);

  if (newRiderCount === 0) return null;

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
        backgroundColor: 'orange',
        padding: 12,
        marginHorizontal: 16,
        marginTop: 8,
        borderRadius: 20,
        alignItems: 'center',
        elevation: 3,  
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      }}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <Text className="text-white font-poppins-medium text-base">
          {newRiderCount} new rider{newRiderCount > 1 ? 's' : ''} nearby · Tap to load
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default NewRidersBanner;