import {
  View,
  Pressable,
  Animated,
  Dimensions,
  StyleSheet,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { useThemeColors } from "@/components/ColorSchemeProvider";

const screenHeight = Dimensions.get("window").height;

const getSheetHeight = (height: number = 0.6) => screenHeight * height;

type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  height?: number;
  children: React.ReactNode;
};

export default function BottomSheet({
  visible,
  onClose,
  height,
  children,
}: BottomSheetProps) {
  const SHEET_HEIGHT = getSheetHeight(height);
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const [isSheetVisible, setIsSheetVisible] = useState(visible);
  const { colors } = useThemeColors();

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
        style={[
          { height: SHEET_HEIGHT },
          { transform: [{ translateY }] },
          { backgroundColor: colors.backgroundCard },
        ]}
        className="absolute bottom-0 left-0 right-0 rounded-t-2xl"
      >
        {children}
      </Animated.View>
    </View>
  );
}
