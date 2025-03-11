import React, { useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const AnimatedSyncIcon = ({ rotating }: { rotating: boolean }) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (rotating) {
      rotateAnim.setValue(0); // Reset rotation
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start();
    }
  }, [rotating]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={{ transform: [{ rotate: rotation }], marginRight: 13}}>
      <Ionicons name="sync" size={24} />
    </Animated.View>
  );
};
