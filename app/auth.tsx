import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
  Button,
  Platform,
} from "react-native";
import { useState, useRef, useMemo, useEffect } from "react";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { useNavigation } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";

export default function AuthScreen() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secureText, setSecureText] = useState(true);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const inputFocusCount = useRef(0);

  const snapPoints = useMemo(() => ["65%", "100%"], []);

  useEffect(() => {
    const showSub =
      Platform.OS === "ios"
        ? Keyboard.addListener("keyboardWillShow", () =>
            setKeyboardVisible(true)
          )
        : Keyboard.addListener("keyboardDidShow", () =>
            setKeyboardVisible(true)
          );

    const hideSub =
      Platform.OS === "ios"
        ? Keyboard.addListener("keyboardWillHide", () =>
            setKeyboardVisible(false)
          )
        : Keyboard.addListener("keyboardDidHide", () =>
            setKeyboardVisible(false)
          );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleInputFocus = () => {
    inputFocusCount.current += 1;
    bottomSheetRef.current?.snapToIndex(2);
  };

  const handleInputBlur = () => {
    inputFocusCount.current -= 1;

    setTimeout(() => {
      if (inputFocusCount.current <= 0) {
        bottomSheetRef.current?.snapToIndex(1);
      }
    }, 50); // Give time for another input to focus if applicable
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="bg-cyan-500" style={{ flex: 1 }}>
        {/* Top Blue Header */}
        <View className="flex-[4] items-center justify-start rounded-b-3xl mt-20">
          <Image
            source={require("@/assets/images/icon.png")}
            className="w-20 h-20 mb-2"
            resizeMode="contain"
          />
          <Text className="text-white text-2xl font-semibold">GIG-Flow</Text>
        </View>

        {/* BottomSheet */}
        <BottomSheet
          ref={bottomSheetRef}
          index={1}
          snapPoints={snapPoints}
          enablePanDownToClose={false}
          enableContentPanningGesture={false}
          enableHandlePanningGesture={false}
          backgroundStyle={{
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            backgroundColor: "white",
          }}
          handleIndicatorStyle={{
            backgroundColor: "#ccc",
            width: 56,
            height: 4,
            alignSelf: "center",
          }}
          keyboardBehavior="interactive"
        >
          <BottomSheetView className="flex-1 px-6">
            <View
              className="h-3/5 justify-between"
              style={{ paddingBottom: isKeyboardVisible ? 35 : 0 }}
            >
              {/* Title + Inputs */}
              <View>
                <View className="items-center">
                  <ThemedText className="text-gray-800" type="title">
                    {isLogin ? "Sign In" : "Sign Up"}
                  </ThemedText>
                </View>

                {/* Email Input */}
                <View className="mt-8">
                  <ThemedText className="text-gray-700 mb-1" type="section">
                    Email Address
                  </ThemedText>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    placeholder="apple@apple.com"
                    className="border border-gray-300 rounded-lg px-4 pb-3 pt-2 mb-4 text-lg"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />

                  {/* Password Input */}
                  <ThemedText className="text-gray-700 mb-1" type="section">
                    Password
                  </ThemedText>
                  <View className="flex-row border border-gray-300 rounded-lg px-4 items-center">
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                      placeholder="Password"
                      secureTextEntry={secureText}
                      className="flex-1 pb-3 pt-2 text-lg"
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      onPress={() => setSecureText(!secureText)}
                    >
                      <Feather
                        name={secureText ? "eye-off" : "eye"}
                        size={20}
                        color="gray"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Bottom Buttons */}
              <View className="pb-10">
                <View className="rounded-lg bg-cyan-500">
                  <Button
                    title={isLogin ? "Log In" : "Sign Up"}
                    color="white"
                    onPress={() => router.push("/home")}
                  />
                </View>

                <View className="flex flex-row justify-center">
                  <ThemedText className="text-center text-gray-500 pt-5">
                    {isLogin
                      ? "Don't have an account? "
                      : "Already have an account? "}
                  </ThemedText>
                  <TouchableOpacity
                    style={{display: "flex", alignSelf: "flex-end"}}
                    onPress={() => setIsLogin(!isLogin)}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                  >
                    <ThemedText
                      className="text-cyan-500 text-base p-0 m-0"
                    >
                      {isLogin ? "Sign up" : "Sign in"}
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </BottomSheetView>
        </BottomSheet>
      </View>
    </TouchableWithoutFeedback>
  );
}
