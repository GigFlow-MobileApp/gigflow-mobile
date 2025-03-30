import { View, Pressable, Animated, Dimensions, StyleSheet } from "react-native";
import { useEffect, useRef, useState } from "react";

const screenHeight = Dimensions.get("window").height;
const SHEET_HEIGHT = screenHeight * 0.6;

type BottomSheetProps = {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
  };

export default function BottomSheet({ visible, onClose, children }: BottomSheetProps) {
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const [isSheetVisible, setIsSheetVisible] = useState(visible);

  useEffect(() => {
    if (visible) {
      setIsSheetVisible(true);
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: SHEET_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setIsSheetVisible(false);
      });
    }
  }, [visible]);

  if (!isSheetVisible) return null;

  return (
    <View className="absolute inset-0 z-50">
      {/* Mask */}
      <Pressable className="absolute inset-0 bg-black/40" onPress={onClose} />

      {/* Sheet */}
      <Animated.View
        style={[styles.animatedSheet, { transform: [{ translateY }] }]}
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4"
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
    animatedSheet: {
      height: SHEET_HEIGHT,
    },
});