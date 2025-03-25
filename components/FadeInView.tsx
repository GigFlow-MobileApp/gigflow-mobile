import React, { useEffect, useRef } from "react";
import { Animated, Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;

type SlideDirection = "left" | "right";

const FadeInView: React.FC<{ index: number; children: React.ReactNode }> = ({ index, children }) => {
  const opacity = React.useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Stagger animation based on index (each item starts 100ms after the previous)
    const delay = index * 200;
    
    Animated.timing(opacity, {
      toValue: 1,
      duration: 500,
      delay,
      useNativeDriver: true,
    }).start();
  }, [opacity, index]);
  
  return (
    <Animated.View style={{ opacity }}>
      {children}
    </Animated.View>
  );
};

export const SlideInView: React.FC<{
  children: React.ReactNode;
  i?: number;
  direction?: SlideDirection;
}> = ({ 
  children, 
  i = 0, 
  direction = "right" // default slide-in from right
}) => {
  const initialX = direction === "left" ? -screenWidth : screenWidth;
  const translateX = useRef(new Animated.Value(initialX)).current;

  useEffect(() => {
    const animationDelay = i * 100; // 100ms delay per index
    Animated.timing(translateX, {
      toValue: 0,
      duration: 500,
      delay: animationDelay,
      useNativeDriver: true,
    }).start();
  }, [translateX, i]);

  return (
    <Animated.View
      style={{
        transform: [{ translateX }],
      }}
    >
      {children}
    </Animated.View>
  );
};

export default FadeInView;
