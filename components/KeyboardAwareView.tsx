import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  StyleProp,
  ViewStyle,
  Dimensions,
  KeyboardEvent,
  LayoutAnimation,
  UIManager,
} from "react-native";
import React, { useEffect, useState } from "react";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  avoidOffset?: number;
};

export default function KeyboardAwareScrollView({ children, style, contentContainerStyle, avoidOffset = 0 }: Props) {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const screenHeight = Dimensions.get("window").height;

  useEffect(() => {
    const showListener =
      Platform.OS === "ios"
        ? Keyboard.addListener("keyboardWillShow", onKeyboardShow)
        : Keyboard.addListener("keyboardDidShow", onKeyboardShow);

    const hideListener =
      Platform.OS === "ios"
        ? Keyboard.addListener("keyboardWillHide", onKeyboardHide)
        : Keyboard.addListener("keyboardDidHide", onKeyboardHide);

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  const onKeyboardShow = (event: KeyboardEvent) => {
    if (Platform.OS === "ios") {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    const keyboardHeight = event.endCoordinates.height;
    setKeyboardHeight(keyboardHeight);
  };

  const onKeyboardHide = () => {
    if (Platform.OS === "ios") {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    setKeyboardHeight(0);
  };

  // Calculate the actual offset based on screen size and keyboard height
  const calculatedOffset =
    Platform.OS === "ios"
      ? avoidOffset + (keyboardHeight > 0 ? 20 : 0) // Add extra padding when keyboard is visible
      : avoidOffset;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={calculatedOffset}
      style={[{ flex: 1 }, style]}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          contentContainerStyle={[
            { flexGrow: 1 },
            // Add bottom padding when keyboard is shown on iOS
            Platform.OS === "ios" && keyboardHeight > 0
              ? { paddingBottom: Math.min(keyboardHeight, screenHeight * 0.3) }
              : {},
            contentContainerStyle,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {children}
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
