import React, { useState, useEffect, useRef } from "react";
import { Animated, TouchableOpacity, ViewStyle } from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useThemeColors } from "@/components/ColorSchemeProvider";

interface FloatingActionButtonProps {
  iconName: string;
  backgroundColor?: string;
  onPress: () => void;
  position?: "left" | "right";
  iconColor?: string;
  initialTranslate?: number;
  customAnimation?: (animatedValue: Animated.Value) => void;
  style?: ViewStyle;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  iconName,
  backgroundColor,
  onPress,
  position = "right",
  iconColor,
  initialTranslate = 100,
  customAnimation,
  style
}) => {
  const { colors } = useThemeColors();
  const translateX = useRef(new Animated.Value(initialTranslate)).current;
  
  useEffect(() => {
    // Use custom animation if provided, otherwise use default spring animation
    if (customAnimation) {
      customAnimation(translateX);
    } else {
      // Default animation
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: false,
        friction: 5,
        tension: 40
      }).start();
    }
  }, []);

  const positionStyle: ViewStyle = {
    position: "absolute",
    bottom: 28,
    [position]: 20,
    marginBottom: 16
  };

  return (
    <Animated.View
      style={[
        positionStyle,
        {
          backgroundColor: backgroundColor || colors.brandColor,
          transform: [{ translateX }],
          borderRadius: 28,
          padding: 10
        },
        style
      ]}
    >
      <TouchableOpacity onPress={onPress}>
        <IconSymbol 
          name={iconName} 
          size={34} 
          color={iconColor || colors.background} 
        />
      </TouchableOpacity>
    </Animated.View>
  );
};
