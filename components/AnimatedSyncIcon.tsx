import { useState, useEffect, useRef} from "react";
import { Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/components/ColorSchemeProvider";

export const AnimatedSyncIcon = ({ rotating }: { rotating: boolean }) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [syncing, setSyncing] = useState(false);
    const { colorScheme } = useColorScheme();

  useEffect(() => {
    if (rotating) {
      setSyncing(true);
      const timer = setTimeout(() => setSyncing(false), 600);
      return () => clearTimeout(timer);
    }
  }, [rotating]);

  useEffect(() => {
    if (syncing) {
      rotateAnim.setValue(0);

      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start();
      setSyncing(false);
    }
  }, [syncing]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={{ transform: [{ rotate: rotation }]}}>
      <Ionicons name="sync" size={28} color={Colors[colorScheme].menuItemText}/>
    </Animated.View>
  );
};
