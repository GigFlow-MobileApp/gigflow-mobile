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
  Alert,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useState, useRef, useMemo, useEffect } from "react";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import Checkbox from "expo-checkbox";
import { ThemedText } from "@/components/ThemedText";
import { useNavigation } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Feather from "react-native-vector-icons/Feather";

const STATUS_BAR_HEIGHT =
  Platform.OS === "android" ? StatusBar.currentHeight || 30 : 50;
const BOTTOM_INSET_HEIGHT = 34; // approx height for iPhone home indicator

export default function AuthScreen() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secureText, setSecureText] = useState(true);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [agreeTermConditions, setAgreeTermConditions] = useState(false);
  const inputFocusCount = useRef(0);

  const snapPoints = useMemo(() => ["65%", "95%"], []);

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

  const login = async () => {
    await AsyncStorage.setItem("userToken", "temp_id");
    console.log("token_set");
    router.replace("/(drawer)");
  };

  const signup = () => {
    alert("Not Implemented yet!");
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* ABSOLUTE BG COLOR FIXERS */}
      {/* TOP SAFE AREA FIX cyan bg color*/}
      <View
        className="absolute left-0 right-0 bg-cyan-500 z-0"
        style={{ top: 0, height: STATUS_BAR_HEIGHT }}
      />
      {/* BOTTOM SAFE AREA FIX white bg color*/}
      <View
        className="absolute left-0 right-0 bg-white z-0"
        style={{ bottom: 0, height: BOTTOM_INSET_HEIGHT }}
      />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={{ flex: 1 }}>
          <View className="bg-cyan-500 flex-1">
            {/* Top Logo with Blue background */}
            <View className={"items-center justify-start rounded-b-3xl mt-20"}>
              <Image
                source={require("@/assets/images/logo2.png")}
                className={"w-20 h-20 mb-2"}
                resizeMode="contain"
              />
              <Text className={"text-white font-semibold text-[32px] pt-3"}>
                GIG-Flow
              </Text>
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
                  style={{ paddingBottom: isKeyboardVisible ? 45 : 0 }}
                >
                  {/* Title + Inputs */}
                  <View>
                    <View className="items-center">
                      <ThemedText
                        className="text-gray-800 text-light"
                        type="title"
                      >
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
                  <View className="">
                    {!isLogin && (
                      <View className="flex-row pb-5">
                        <Checkbox
                          value={agreeTermConditions}
                          onValueChange={setAgreeTermConditions}
                          color={agreeTermConditions ? "#00b8db" : undefined}
                        />
                        <ThemedText className="text-gray-500">
                          {" "}
                          I agree with Terms & Conditions{" "}
                        </ThemedText>
                      </View>
                    )}
                    <View className="rounded-lg bg-cyan-500">
                      <Button
                        title={isLogin ? "Log In" : "Sign Up"}
                        color="white"
                        onPress={() => (isLogin ? login() : signup())}
                      />
                    </View>
                    <View className="flex flex-row justify-center">
                      <ThemedText className="text-center text-gray-500 pt-5">
                        {isLogin
                          ? "Don't have an account? "
                          : "Already have an account? "}
                      </ThemedText>
                      <TouchableOpacity
                        style={{ display: "flex", alignSelf: "flex-end" }}
                        onPress={() => setIsLogin(!isLogin)}
                        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                      >
                        <ThemedText className="text-cyan-500">
                          {isLogin ? "Sign up" : "Sign in"}
                        </ThemedText>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </BottomSheetView>
            </BottomSheet>
          </View>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </GestureHandlerRootView>
  );
}
