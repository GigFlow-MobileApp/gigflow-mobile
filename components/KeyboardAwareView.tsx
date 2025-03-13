import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";

type KeyboardAwareViewProps = {
  children: React.ReactNode;
  style?: any;
  contentContainerStyle?: any;
  avoidOffset?: number;
};

export default function KeyboardAwareView({
  children,
  style,
  contentContainerStyle,
  avoidOffset = 0,
}: KeyboardAwareViewProps) {
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showListener =
      Platform.OS === "ios"
        ? Keyboard.addListener("keyboardWillShow", () =>
            setKeyboardVisible(true)
          )
        : Keyboard.addListener("keyboardDidShow", () =>
            setKeyboardVisible(true)
          );

    const hideListener =
      Platform.OS === "ios"
        ? Keyboard.addListener("keyboardWillHide", () =>
            setKeyboardVisible(false)
          )
        : Keyboard.addListener("keyboardDidHide", () =>
            setKeyboardVisible(false)
          );

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  return (
    <KeyboardAvoidingView
      style={[{ flex: 1 }, style]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={avoidOffset}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[{ flex: 1 }, contentContainerStyle]}>{children}</View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
