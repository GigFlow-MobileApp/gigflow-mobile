import {
  View,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  Dimensions,
  SafeAreaView,
  Pressable,
  Animated,
  Image
} from "react-native";
import { useState, useRef, useMemo, useEffect } from "react";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import Checkbox from "expo-checkbox";
import { ThemedText } from "@/components/ThemedText";
import { useNavigation } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Feather from "react-native-vector-icons/Feather";
import { useColorScheme } from "@/components/ColorSchemeProvider";
import { loginApi, signupApi } from "@/apis/authAPI";
import { Colors } from "@/constants/Colors";
import Config from '@/constants/config';
import { IconSymbol } from "@/components/ui/IconSymbol";
import { StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from "react-native";

const screenHeight = Dimensions.get("window").height;
const topMargin = Platform.OS === "ios" ? 60 : screenHeight * (108 - 40)/ (844 - 40);
const field_btn_margin = screenHeight * (42 / (844 - 40));

const STATUS_BAR_HEIGHT =
  Platform.OS === "android" ? RNStatusBar.currentHeight || 30 : 50;
const BOTTOM_INSET_HEIGHT = 34; // approx height for iPhone home indicator

type FormErrors = {
  email?: string;
  password?: string;
};

export default function Auth() {
  const { colorScheme } = useColorScheme();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const navigation = useNavigation();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secureText, setSecureText] = useState(true);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [agreeTermConditions, setAgreeTermConditions] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const inputFocusCount = useRef(0);
  const errorBannerOpacity = useRef(new Animated.Value(0)).current;
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Adjust snap points based on platform
  const snapPoints = useMemo(() => {
    if (Platform.OS === "ios") {
      return ["65%", "95%"];
    } else {
      return ["85%", "95%"]; // Increased initial height for Android
    }
  }, []);

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

  // Show/hide error banner animation
  useEffect(() => {
    // Clear any existing timeout
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = null;
    }

    if (errorMessage) {
      // Show the error banner immediately
      Animated.timing(errorBannerOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Set a timeout to clear the error message after 5 seconds
      errorTimeoutRef.current = setTimeout(() => {
        // Fade out the banner
        Animated.timing(errorBannerOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          // Clear the error message after the animation completes
          setErrorMessage("");
        });
        errorTimeoutRef.current = null;
      }, 5000);
    }

    // Cleanup function to clear the timeout when component unmounts or when errorMessage changes
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, [errorMessage, errorBannerOpacity]);

  const handleInputFocus = () => {
    inputFocusCount.current += 1;
    const targetIdx = Platform.OS === "ios" ? 2 : 1;
    bottomSheetRef.current?.snapToIndex(targetIdx);
  };

  const handleInputBlur = () => {
    inputFocusCount.current -= 1;

    setTimeout(() => {
      if (inputFocusCount.current <= 0) {
        const targetIdx = Platform.OS === "ios" ? 1 : 0;
        bottomSheetRef.current?.snapToIndex(targetIdx);
      }
    }, 50); // Give time for another input to focus if applicable
  };

  const validate = () => {
    setErrorMessage("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage('Invalid email format');
      return false;
    }
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters');
      return false;
    }
    return true;
  };

  const login = async () => {
    setErrorMessage("");
    // if(Config.debug) {
    //   const result = await loginApi(Config.username, Config.password);
    //   if(result.success) {
    //     router.replace("/main");
    //   } else {
    //     setErrorMessage(result.error || "Login failed");
    //   }
    //   return;
    // }
    
    if (!validate()) return;
    
    const result = await loginApi(email, password);
    if (result.success) {
      console.log("routing to main");
      router.replace("/main/home");
    } else {
      setErrorMessage(result.error || "Login failed");
    }
  };

  const signup = async () => {
    setErrorMessage("");
    if(!validate()) return;
    
    if(!agreeTermConditions) {
      setErrorMessage("You have to agree on the Terms & Conditions before continue");
      return;
    }
    
    const result = await signupApi(email, password);
    if (!result.success) {
      setErrorMessage(result.error || "Signup failed");
    } else {
      // Proceed to login after successful signup
      login();
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Add StatusBar component at the top */}
      <StatusBar barStyle="light-content" backgroundColor={Colors[colorScheme].brandColor} />
      
      {/* Remove the TOP SAFE AREA FIX view since we'll handle it differently */}
      <View
        style={{
          flex: 1,
          backgroundColor: Colors[colorScheme].brandColor // This ensures the entire background is the brand color
        }}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors[colorScheme].brandColor }}>
          {/* Rest of your existing code */}
          <View
            className="flex-1"
            style={{ backgroundColor: Colors[colorScheme].brandColor }}
          >
            {/* Top Logo with Blue background */}
            <View
              className="items-center justify-start rounded-b-3xl"
              style={{ 
                marginTop: Platform.OS === "ios" ? topMargin : topMargin * 0.5, // Reduced top margin for Android
                paddingBottom: Platform.OS === "ios" ? 20 : 0 
              }}
            >
              <Image 
                source={require("@/assets/images/logo_transparent.png")}
                style={{
                  height: Platform.OS === "ios" ? 80 : 100, 
                  width: Platform.OS === "ios" ? 80 : 100
                }}
                resizeMode="contain"
              />
              <ThemedText 
                style={{
                  fontSize: Platform.OS === "ios" ? 24 : 30,
                  marginTop: Platform.OS === "ios" ? 8 : 0
                }} 
                colorValue="logoText" 
                type="logo"
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
              android_keyboardInputMode="adjustResize" // Add this for Android
              keyboardBehavior="interactive"
              backgroundStyle={{
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                backgroundColor: Colors[colorScheme].backgroundCard,
              }}
              handleIndicatorStyle={{
                backgroundColor: Colors[colorScheme].border,
                width: 40,
                height: 4,
                alignSelf: "center",
                marginTop: 8
              }}
            >
              <BottomSheetView className="flex-1 px-6">
                <View
                  className="h-1/2 justify-between"
                  style={{ 
                    paddingBottom: isKeyboardVisible ? 
                      Platform.OS === "ios" ? 20 : 45 
                      : 0 
                  }}
                >
                  {/* Title + Inputs */}
                  <View>
                    <View className="items-center mt-2">
                      <ThemedText 
                        type="title" 
                        colorValue="primaryText"
                        style={{ fontSize: Platform.OS === "ios" ? 20 : 24 }}
                      >
                        {isLogin ? "Sign In" : "Sign Up"}
                      </ThemedText>
                    </View>

                    {/* Email Input */}
                    <View className="mt-6">
                      <ThemedText
                        className="mb-1"
                        type="section"
                        colorValue="secondaryText"
                      >
                        Email Address
                      </ThemedText>
                      <TextInput
                        value={email}
                        onChangeText={setEmail}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        placeholder="apple@apple.com"
                        className="border rounded-lg px-4 mb-4"
                        style={{
                          borderColor: Colors[colorScheme].border,
                          color: Colors[colorScheme].primaryText,
                          height: Platform.OS === "ios" ? 44 : 42,
                          fontSize: Platform.OS === "ios" ? 16 : 18,
                          paddingVertical: Platform.OS === "ios" ? 12 : 8
                        }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />

                      {/* Password Input */}
                      <ThemedText
                        className="mb-1"
                        type="section"
                        colorValue="secondaryText"
                      >
                        Password
                      </ThemedText>
                      <View
                        className="flex-row border rounded-lg px-4 items-center"
                        style={{ 
                          borderColor: Colors[colorScheme].border,
                          height: Platform.OS === "ios" ? 44 : 42
                        }}
                      >
                        <TextInput
                          value={password}
                          onChangeText={setPassword}
                          onFocus={handleInputFocus}
                          onBlur={handleInputBlur}
                          style={{ 
                            color: Colors[colorScheme].primaryText,
                            flex: 1,
                            fontSize: Platform.OS === "ios" ? 16 : 18,
                            paddingVertical: Platform.OS === "ios" ? 12 : 8
                          }}
                          placeholder="Password"
                          secureTextEntry={secureText}
                          autoCapitalize="none"
                        />
                        <TouchableOpacity
                          onPress={() => setSecureText(!secureText)}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <IconSymbol
                            name={secureText ? "eye-off" : "eye"}
                            size={20}
                            color={Colors[colorScheme].primaryText}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  {/* Bottom Buttons */}
                  <View style={{
                    marginTop: isKeyboardVisible ? 
                      Platform.OS === "ios" ? 16 : field_btn_margin / 2 
                      : field_btn_margin
                  }}>
                    {!isLogin ? (
                      <View className="flex-row pb-3">
                        <Checkbox
                          value={agreeTermConditions}
                          onValueChange={setAgreeTermConditions}
                          color={
                            agreeTermConditions
                              ? Colors[colorScheme].brandColor
                              : undefined
                          }
                        />
                        <ThemedText colorValue="textTertiary">
                          {" "}
                          I agree with Terms & Conditions{" "}
                        </ThemedText>
                      </View>
                    ) : (
                      <View className="pb-3" style={{height: Platform.OS === 'ios' ? 31 : 32}}/>
                    )}
                    <Pressable
                      onPress={() => (isLogin ? login() : signup())}
                      style={{
                        backgroundColor: Colors[colorScheme].brandColor,
                        paddingVertical: 12,
                        borderRadius: 8,
                        alignItems: "center",
                      }}
                    >
                      <ThemedText type="btnText" colorValue="btnText">
                        {isLogin ? "Log In" : "Sign Up"}
                      </ThemedText>
                    </Pressable>
                    <View className="flex flex-row justify-center">
                      <ThemedText
                        className="text-center pt-4"
                        colorValue="textTertiary"
                      >
                        {isLogin
                          ? "Don't have an account? "
                          : "Already have an account? "}
                      </ThemedText>
                      <TouchableOpacity
                        style={{ display: "flex", alignSelf: "flex-end" }}
                        onPress={() => setIsLogin(!isLogin)}
                        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                      >
                        <ThemedText type="defaultSemiBold" colorValue="brandColor">
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
      </View>

      {/* Keep the bottom safe area fix */}
      <View
        className="absolute left-0 right-0 z-0"
        style={{
          bottom: 0,
          height: BOTTOM_INSET_HEIGHT,
          backgroundColor: Colors[colorScheme].backgroundCard,
        }}
      />
    </GestureHandlerRootView>
  );
}
