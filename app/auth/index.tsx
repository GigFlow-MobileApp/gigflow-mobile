import {
  View,
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
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

const STATUS_BAR_HEIGHT =
  Platform.OS === "android" ? StatusBar.currentHeight || 30 : 50;
const BOTTOM_INSET_HEIGHT = 34; // approx height for iPhone home indicator

export default function AuthScreen() {
  const colorScheme = useColorScheme();
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
        className="absolute left-0 right-0 z-0"
        style={{ top: 0, height: STATUS_BAR_HEIGHT, backgroundColor: Colors[colorScheme ?? "light"].brandColor }}
      />
      {/* BOTTOM SAFE AREA FIX white bg color*/}
      <View
        className="absolute left-0 right-0 z-0"
        style={{ bottom: 0, height: BOTTOM_INSET_HEIGHT, backgroundColor: Colors[colorScheme ?? "light"].backgroundCard}}
      />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={{ flex: 1 }}>
          <View className="flex-1" style={{backgroundColor: Colors[colorScheme ?? "light"].brandColor}}>
            {/* Top Logo with Blue background */}
            <View className={"items-center justify-start rounded-b-3xl mt-20"}>
              <Image
                source={require("@/assets/images/logo2.png")}
                className={"w-20 h-20 mb-2"}
                resizeMode="contain"
              />
              <ThemedText 
                className={"text-[32px] pt-3"}
                colorValue="primaryText"
                type="title"
              >
                GIG-Flow
              </ThemedText>
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
                backgroundColor: Colors[colorScheme ?? "light"].backgroundCard
              }}
              handleIndicatorStyle={{
                backgroundColor: Colors[colorScheme ?? "light"].secondaryText,
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
                        className="text-light"
                        type="title"
                        colorValue="primaryText"
                      >
                        {isLogin ? "Sign In" : "Sign Up"}
                      </ThemedText>
                    </View>

                    {/* Email Input */}
                    <View className="mt-8">
                      <ThemedText className="mb-1" type="section" colorValue="secondaryText">
                        Email Address
                      </ThemedText>
                      <TextInput
                        value={email}
                        onChangeText={setEmail}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        placeholder="apple@apple.com"
                        className="border rounded-lg px-4 pb-3 pt-2 mb-4 text-lg"
                        style={{borderColor: Colors[colorScheme ?? "light"].border}}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />

                      {/* Password Input */}
                      <ThemedText className="mb-1" type="section" colorValue="secondaryText">
                        Password
                      </ThemedText>
                      <View 
                        className="flex-row border rounded-lg px-4 items-center"
                        style={{borderColor: Colors[colorScheme ?? "light"].border}}
                      >
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
                          color={agreeTermConditions ? Colors[colorScheme ?? "light"].brandColor : undefined}
                        />
                        <ThemedText colorValue="textTertiary">
                          {" "}
                          I agree with Terms & Conditions{" "}
                        </ThemedText>
                      </View>
                    )}
                    <View className="rounded-lg" style={{backgroundColor: Colors[colorScheme ?? "light"].brandColor }}>
                      <Button
                        title={isLogin ? "Log In" : "Sign Up"}
                        color={Colors[colorScheme ?? "light"].text}
                        onPress={() => (isLogin ? login() : signup())}
                      />
                    </View>
                    <View className="flex flex-row justify-center">
                      <ThemedText className="text-center pt-5" colorValue="textTertiary">
                        {isLogin
                          ? "Don't have an account? "
                          : "Already have an account? "}
                      </ThemedText>
                      <TouchableOpacity
                        style={{ display: "flex", alignSelf: "flex-end" }}
                        onPress={() => setIsLogin(!isLogin)}
                        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                      >
                        <ThemedText colorValue="brandColor">
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
