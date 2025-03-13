import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  Keyboard,
  TouchableWithoutFeedback,
  StyleProp,
  ViewStyle,
} from "react-native";
import React from "react";

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  avoidOffset?: number;
};

export default function KeyboardAwareScrollView({
  children,
  style,
  contentContainerStyle,
  avoidOffset = 0,
}: Props) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={avoidOffset}
      style={[{ flex: 1 }, style]}
    >
      <TouchableWithoutFeedback
        onPress={Keyboard.dismiss}
        accessible={false} // ✅ ensures buttons/inputs stay touchable
      >
        <ScrollView
          contentContainerStyle={[{ flexGrow: 1 }, contentContainerStyle]}
          keyboardShouldPersistTaps="handled" // ✅ ensures inputs/buttons respond
        >
          {children}
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
