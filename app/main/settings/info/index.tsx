import {
  View,
  Platform,
  Image,
  Dimensions,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Animated,
  Keyboard,
  TextInput,
  KeyboardEvent,
} from "react-native";
import { NativeSyntheticEvent, TextInputFocusEventData } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useColorScheme } from "@/components/ColorSchemeProvider";
import { Colors } from "@/constants/Colors";
import { useState, useEffect, useRef } from "react";
import { getMyInfo, updateMyInfo } from "@/apis/infoAPI";
import { SignupResponse, SignupResponseSchema, UpdateMyInfoType, updateMyInfoZod } from "@/constants/customTypes";
import KeyboardAwareView from "@/components/KeyboardAwareView";

const screenHeight = Dimensions.get("window").height;
const screenWdith = Dimensions.get("window").width;
const topHeight = (screenHeight * (175 - 30)) / (844 - 40);
const iconWidth = screenWdith / 6;

interface FieldItemProps {
  text: string;
  value: string | null;
  onChange: (val: string) => void;
  onBlur?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  onFocus?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  enableEdit: boolean;
  inputRef?: React.RefObject<TextInput>;
}

const FieldItem: React.FC<FieldItemProps> = ({ text, value, onChange, onBlur, onFocus, enableEdit, inputRef }) => {
  const { colorScheme } = useColorScheme();

  return (
    <View className="px-5 mt-2 mb-3">
      <ThemedText colorValue="secondaryText" type="section" className="pl-1 pb-1">
        {text}
      </ThemedText>
      <TextInput
        ref={inputRef}
        value={value ?? ""}
        onChangeText={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        editable={enableEdit}
        className="border rounded-lg px-4 pb-1 mb-4 text-lg"
        style={{
          borderColor: enableEdit ? Colors[colorScheme].brandColor : Colors[colorScheme].border,
          backgroundColor: enableEdit
            ? `${Colors[colorScheme].brandColor}10` // 10% opacity
            : "transparent",
          color: Colors[colorScheme].primaryText,
          height: 51,
        }}
        autoCapitalize="none"
      />
    </View>
  );
};

export default function InfoScreen() {
  const { colorScheme } = useColorScheme();
  const [name, setName] = useState<string | null>("");
  const [email, setEmail] = useState<string | null>("");
  const [recipientName, setRecipientName] = useState<string | null>("");
  const [phone, setPhone] = useState<string | null>("");
  const [country, setCountry] = useState<string | null>("");
  const [state, setState] = useState<string | null>("");
  const [city, setCity] = useState<string | null>("");
  const [zipcode, setZipcode] = useState<string | null>("");
  const [address, setAddress] = useState<string | null>("");
  const [enableEdit, setEnableEdit] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  // const [notificationMessage, setNotificationMessage] = useState<string>("");

  // Refs for TextInputs and ScrollView
  const scrollViewRef = useRef<ScrollView>(null);
  const nameInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const phoneInputRef = useRef<TextInput>(null);
  const countryInputRef = useRef<TextInput>(null);
  const stateInputRef = useRef<TextInput>(null);
  const cityInputRef = useRef<TextInput>(null);
  const zipcodeInputRef = useRef<TextInput>(null);
  const addressInputRef = useRef<TextInput>(null);

  // Animation values and timeouts
  const errorBannerOpacity = useRef(new Animated.Value(0)).current;
  const notificationBannerOpacity = useRef(new Animated.Value(0)).current;
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track original values to detect changes
  const [originalValues, setOriginalValues] = useState<{
    [key: string]: string | null;
  }>({});
  const [hasChanges, setHasChanges] = useState<{ [key: string]: boolean }>({});
  const [anyChanges, setAnyChanges] = useState<boolean>(false);
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);

  // Keyboard event listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e: KeyboardEvent) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Function to handle input focus and scroll to the focused input
  const handleInputFocus = (inputRef: React.RefObject<TextInput>, fieldName: string) => {
    if (!inputRef.current || !scrollViewRef.current) return;

    // Use a timeout to allow the keyboard to appear first
    setTimeout(() => {
      // Get screen height and calculate visible area
      const screenHeight = Dimensions.get("window").height;
      const visibleHeight = screenHeight - keyboardHeight;

      // Calculate approximate positions for each field
      // These are relative positions from the top of the scroll view
      const fieldPositions = {
        name: 120,
        email: 200,
        phone: 280,
        country: 360,
        state: 440,
        city: 520,
        zipcode: 600,
        address: 680,
      };

      const fieldPosition = fieldPositions[fieldName as keyof typeof fieldPositions] || 0;

      // For fields near the bottom, ensure they're well above the keyboard
      // The multiplier increases the scroll amount for lower fields
      const adjustmentFactor = fieldName === "address" || fieldName === "zipcode" ? 0.7 : 0.5;
      const targetY = Math.max(0, fieldPosition - visibleHeight * adjustmentFactor);

      // Scroll to the target position with animation
      scrollViewRef.current?.scrollTo({ y: targetY, animated: true });
    }, 300); // Delay to allow keyboard to appear
  };

  // Function to check if a field has been modified
  const checkFieldModified = (fieldName: string, value: string | null) => {
    const original = originalValues[fieldName] || "";
    const current = value || "";
    const isModified = original !== current;

    // Update the hasChanges state if needed
    if (hasChanges[fieldName] !== isModified) {
      const newChanges = {
        ...hasChanges,
        [fieldName]: isModified,
      };

      setHasChanges(newChanges);

      // Check if any field has changes
      const hasAnyChanges = Object.values(newChanges).some((changed) => changed);
      setAnyChanges(hasAnyChanges);
    }

    return isModified;
  };

  // Handle error message animation and auto-hide
  useEffect(() => {
    // Clear any existing timeout
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = null;
    }

    if (errorMessage) {
      // Show the error banner immediately
      Animated.timing(errorBannerOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();

      // Set a timeout to clear the error message after 5 seconds
      errorTimeoutRef.current = setTimeout(() => {
        // Fade out the banner
        Animated.timing(errorBannerOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
          setErrorMessage("");
        });
        errorTimeoutRef.current = null;
      }, 5000);
    }

    // Cleanup function to clear the timeout when component unmounts or when errorMessage changes
    return () => {
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    };
  }, [errorMessage, errorBannerOpacity]);

  const fetchData = async () => {
    try {
      const raw = await getMyInfo();
      if (!raw) throw new Error("User info not found");
      const parsed = SignupResponseSchema.safeParse(raw);
      if (!parsed.success) {
        console.error(parsed.error);
        throw new Error("Invalid user info format");
      }

      const data: SignupResponse = parsed.data;

      // Set current values
      setName(data?.full_name);
      setRecipientName(data?.recipient_name);
      setEmail(data?.email);
      setPhone(data?.zipcode);
      setCountry(data?.state);
      setState(data?.state);
      setCity(data?.city);
      setZipcode(data?.zipcode);
      setAddress(data?.street);

      // Store original values for change detection
      setOriginalValues({
        name: data?.full_name,
        recipientName: data?.recipient_name,
        email: data?.email,
        phone: data?.zipcode,
        country: data?.state,
        state: data?.state,
        city: data?.city,
        zipcode: data?.zipcode,
        address: data?.street,
      });

      // Reset change tracking
      setHasChanges({});
    } catch (error) {
      console.error("Failed to fetch info:", error);
      setErrorMessage("Failed to fetch user information");
    }
  };

  const saveChanges = async () => {
    // Check if any field has been modified
    if (!anyChanges) {
      console.log("No changes detected, skipping update");
      return;
    }
    setAnyChanges(false);
    try {
      const newInfo: UpdateMyInfoType = {
        full_name: name,
        email: email ?? "",
        recipient_name: recipientName ?? "",
        street: address,
        city,
        state,
        zipcode,
      };

      const parsed = updateMyInfoZod.safeParse(newInfo);
      if (!parsed.success) {
        console.error("Validation failed:", parsed.error.format());

        // Get the first error message in a type-safe way
        const errorMap = parsed.error.format();
        let errorMessage = "Validation failed";

        // Check for specific field errors we know exist in our schema
        const fieldNames = ["email", "full_name", "recipient_name", "street", "city", "state", "zipcode"];

        for (const field of fieldNames) {
          const fieldError = errorMap[field as keyof typeof errorMap];
          if (fieldError && "_errors" in fieldError && fieldError._errors.length > 0) {
            errorMessage = `${field}: ${fieldError._errors[0]}`;
            break;
          }
        }

        // Fallback to general errors
        if (errorMessage === "Validation failed" && errorMap._errors.length > 0) {
          errorMessage = errorMap._errors[0];
        }

        setErrorMessage(errorMessage);
        return;
      }

      const newData = await updateMyInfo(newInfo);
      console.log("Info updated successfully:", newData);

      // Update original values after successful update
      setOriginalValues({
        name,
        recipientName,
        email,
        phone,
        country,
        state,
        city,
        zipcode,
        address,
      });

      // Reset change tracking
      setHasChanges({});

      setEnableEdit(false);
      // setNotificationMessage("Information updated successfully");
    } catch (error) {
      console.error("Failed to update info:", error);
      setErrorMessage("Failed to update information");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAwareView style={{ backgroundColor: Colors[colorScheme].brandColor }} avoidOffset={0}>
        <View className="flex-1 flex-col justify-between" style={{ backgroundColor: Colors[colorScheme].brandColor }}>
          {/* Error Banner */}
          <Animated.View
            className="absolute left-0 right-0 z-50 px-4"
            style={{
              top: Platform.OS === "ios" ? 50 : 30,
              opacity: errorBannerOpacity,
              transform: [
                {
                  translateY: errorBannerOpacity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-50, 0],
                  }),
                },
              ],
            }}
          >
            {errorMessage ? (
              <View
                className="p-3 rounded-lg"
                style={{
                  backgroundColor: `${Colors[colorScheme].badBanner}19`,
                  borderColor: `${Colors[colorScheme].badBanner}4C`,
                  borderWidth: 1,
                }}
              >
                <ThemedText style={{ color: `${Colors[colorScheme].badBanner}4C` }}>{errorMessage}</ThemedText>
              </View>
            ) : null}
          </Animated.View>

          {/* Top */}
          <View
            className="flex-col justify-between"
            style={{
              height: topHeight,
              backgroundColor: Colors[colorScheme].brandColor,
            }}
          >
            {/* Top banner */}
            <View className="flex-row items-start justify-center" style={{ height: topHeight - 6 }}>
              <ThemedText className="mt-8" type="mainSection" colorValue="logoText">
                My Info
              </ThemedText>
              {/* Optional edit icon */}
              <View className="absolute right-5 top-5 flex-row justify-between" style={{ width: iconWidth }}>
                <TouchableOpacity
                // onPress={() => setEnableEdit(!enableEdit)}
                // style={{
                //   backgroundColor: enableEdit ? Colors[colorScheme].brandColor : 'transparent',
                // }}
                >
                  <IconSymbol name="qrcode" size={24} color={Colors[colorScheme].shadow} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setEnableEdit(!enableEdit)}
                  style={{
                    backgroundColor: enableEdit ? Colors[colorScheme].brandColor : "transparent",
                  }}
                >
                  <IconSymbol
                    name="edit"
                    size={24}
                    color={enableEdit ? Colors[colorScheme].logoText : Colors[colorScheme].shadow}
                  />
                </TouchableOpacity>
              </View>
            </View>
            {/* top avatar part*/}
            <View className="items-center -mt-16 mb-4">
              <Image
                source={require("@/assets/images/Avatar.png")}
                className="w-36 h-36 rounded-full z-30"
                resizeMode="cover"
              />
            </View>
          </View>

          {/* bottom fields part*/}
          <View
            className="flex-1 flex-col rounded-t-2xl"
            style={{
              backgroundColor: Colors[colorScheme].background,
              marginTop: 0,
            }}
          >
            <View className="h-16" />
            <ScrollView
              ref={scrollViewRef}
              style={{
                backgroundColor: Colors[colorScheme].background,
              }}
              contentContainerStyle={{
                paddingBottom: Platform.OS === "ios" ? 120 : 80,
                backgroundColor: Colors[colorScheme].background,
                flexGrow: 1, // Ensure content fills the scroll view
              }}
              keyboardShouldPersistTaps="handled"
              bounces={false}
              overScrollMode="never" // Android property to disable overscroll
              showsVerticalScrollIndicator={false}
              alwaysBounceVertical={false} // iOS property to disable vertical bounce
            >
              <FieldItem
                text="Name"
                value={name}
                onChange={(val) => {
                  setName(val);
                  checkFieldModified("name", val);
                }}
                onFocus={() => handleInputFocus(nameInputRef, "name")}
                enableEdit={enableEdit}
                inputRef={nameInputRef}
              />
              <FieldItem
                text="Email Address"
                value={email}
                onChange={(val) => {
                  setEmail(val);
                  checkFieldModified("email", val);
                }}
                onFocus={() => handleInputFocus(emailInputRef, "email")}
                enableEdit={enableEdit}
                inputRef={emailInputRef}
              />
              <FieldItem
                text="Phone Number"
                value={phone}
                onChange={(val) => {
                  setPhone(val);
                  checkFieldModified("phone", val);
                }}
                onFocus={() => handleInputFocus(phoneInputRef, "phone")}
                enableEdit={enableEdit}
                inputRef={phoneInputRef}
              />
              <FieldItem
                text="Country/Region"
                value={country}
                onChange={(val) => {
                  setCountry(val);
                  checkFieldModified("country", val);
                }}
                onFocus={() => handleInputFocus(countryInputRef, "country")}
                enableEdit={enableEdit}
                inputRef={countryInputRef}
              />
              <FieldItem
                text="State"
                value={state}
                onChange={(val) => {
                  setState(val);
                  checkFieldModified("state", val);
                }}
                onFocus={() => handleInputFocus(stateInputRef, "state")}
                enableEdit={enableEdit}
                inputRef={stateInputRef}
              />
              <FieldItem
                text="City"
                value={city}
                onChange={(val) => {
                  setCity(val);
                  checkFieldModified("city", val);
                }}
                onFocus={() => handleInputFocus(cityInputRef, "city")}
                enableEdit={enableEdit}
                inputRef={cityInputRef}
              />
              <FieldItem
                text="Zipcode"
                value={zipcode}
                onChange={(val) => {
                  setZipcode(val);
                  checkFieldModified("zipcode", val);
                }}
                onFocus={() => handleInputFocus(zipcodeInputRef, "zipcode")}
                enableEdit={enableEdit}
                inputRef={zipcodeInputRef}
              />
              <FieldItem
                text="Address"
                value={address}
                onChange={(val) => {
                  setAddress(val);
                  checkFieldModified("address", val);
                }}
                onFocus={() => handleInputFocus(addressInputRef, "address")}
                enableEdit={enableEdit}
                inputRef={addressInputRef}
              />
              {/* Save Changes Button */}
              {enableEdit && anyChanges && (
                <View
                  style={{
                    position: "absolute",
                    bottom: Platform.OS === "ios" ? 40 : 20,
                    right: 20,
                    backgroundColor: Colors[colorScheme].brandColor,
                    borderRadius: 30,
                    elevation: 5,
                    shadowColor: Colors[colorScheme].shadow,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                  }}
                >
                  <TouchableOpacity
                    onPress={saveChanges}
                    style={{
                      paddingVertical: 12,
                      paddingHorizontal: 20,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <IconSymbol name="save" size={20} color={Colors[colorScheme].logoText} />
                    <ThemedText colorValue="logoText" style={{ marginLeft: 8, fontWeight: "bold" }}>
                      Save Changes
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              )}

              {/* Add extra padding at the bottom to ensure the last field is not covered by keyboard */}
              <View style={{ height: 100 }} />
            </ScrollView>
          </View>
        </View>
      </KeyboardAwareView>
    </SafeAreaView>
  );
}
