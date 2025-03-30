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
import { useRouter } from "expo-router";

import QRCode from "react-native-qrcode-svg";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useColorScheme } from "@/components/ColorSchemeProvider";
import { Colors } from "@/constants/Colors";
import { useState, useEffect, useRef, useCallback } from "react";
import { getMyInfo, updateMyInfo } from "@/apis/infoAPI";
import { SignupResponse, SignupResponseSchema, UpdateMyInfoType, updateMyInfoZod } from "@/constants/customTypes";
import KeyboardAwareView from "@/components/KeyboardAwareView";

const screenHeight = Dimensions.get("window").height;
const screenWidth = Dimensions.get("window").width;
const topHeight = (screenHeight * (175 - 30)) / (844 - 40);
const iconWidth = screenWidth / 6;

// Form field type
interface FormField {
  key: string;
  label: string;
  ref: React.RefObject<TextInput>;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  apiKey?: string; // Maps to API field name if different from key
  position: number; // Approximate position from top for scrolling
}

// QR Code component
const QRCodeView = ({ profile, onClose }: { profile: SignupResponse; onClose: () => void }) => {
  const { colorScheme } = useColorScheme();
  
  return (
    <View className="flex-1 items-center justify-center" style={{ backgroundColor: Colors[colorScheme].background }}>
      <View className="absolute top-10 right-5 z-10">
        <TouchableOpacity onPress={onClose}>
          <IconSymbol name="close" size={24} color={Colors[colorScheme].primaryText} />
        </TouchableOpacity>
      </View>
      <View className="items-center p-6 rounded-xl" style={{ backgroundColor: Colors[colorScheme].background }}>
        <ThemedText type="mainSection" className="mb-4">Your QR Code</ThemedText>
        <QRCode
          value={JSON.stringify(profile)}
          size={200}
          backgroundColor={Colors[colorScheme].background}
          color={Colors[colorScheme].primaryText}
        />
        <ThemedText className="mt-4 text-center" style={{ maxWidth: 250 }}>
          Scan this code to share your contact information
        </ThemedText>
      </View>
    </View>
  );
};

// Field item component
const FieldItem = ({ 
  field, 
  value, 
  onChange, 
  onFocus, 
  enableEdit 
}: { 
  field: FormField; 
  value: string | null; 
  onChange: (key: string, value: string) => void; 
  onFocus: (fieldName: string) => void; 
  enableEdit: boolean; 
}) => {
  const { colorScheme } = useColorScheme();

  return (
    <View className="px-5 mt-2 mb-3">
      <ThemedText colorValue="secondaryText" type="section" className="pl-1 pb-1">
        {field.label}
      </ThemedText>
      <TextInput
        ref={field.ref}
        value={value ?? ""}
        onChangeText={(val) => onChange(field.key, val)}
        onFocus={() => onFocus(field.key)}
        editable={enableEdit}
        keyboardType={field.keyboardType}
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

// Error banner component
const ErrorBanner = ({ message, opacity }: { message: string; opacity: Animated.Value }) => {
  const { colorScheme } = useColorScheme();
  
  if (!message) return null;
  
  return (
    <Animated.View
      className="absolute left-0 right-0 z-50 px-4"
      style={{
        top: Platform.OS === "ios" ? 50 : 30,
        opacity,
        transform: [
          {
            translateY: opacity.interpolate({
              inputRange: [0, 1],
              outputRange: [-50, 0],
            }),
          },
        ],
      }}
    >
      <View
        className="p-3 rounded-lg"
        style={{
          backgroundColor: `${Colors[colorScheme].badBanner}19`,
          borderColor: `${Colors[colorScheme].badBanner}4C`,
          borderWidth: 1,
        }}
      >
        <ThemedText style={{ color: `${Colors[colorScheme].badBanner}4C` }}>{message}</ThemedText>
      </View>
    </Animated.View>
  );
};

// Save button component
const SaveButton = ({ onPress }: { onPress: () => void }) => {
  const { colorScheme } = useColorScheme();
  
  return (
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
        onPress={onPress}
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
  );
};

// Custom hook for keyboard handling
const useKeyboardHandling = () => {
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);
  
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
  
  return keyboardHeight;
};

// Custom hook for error handling
const useErrorHandling = () => {
  const [errorMessage, setErrorMessage] = useState<string>("");
  const errorBannerOpacity = useRef(new Animated.Value(0)).current;
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = null;
    }

    if (errorMessage) {
      Animated.timing(errorBannerOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();

      errorTimeoutRef.current = setTimeout(() => {
        Animated.timing(errorBannerOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
          setErrorMessage("");
        });
        errorTimeoutRef.current = null;
      }, 5000);
    }

    return () => {
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    };
  }, [errorMessage, errorBannerOpacity]);
  
  return { errorMessage, setErrorMessage, errorBannerOpacity };
};

export default function InfoScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const scrollViewRef = useRef<ScrollView>(null);
  
  // State
  const [profile, setProfile] = useState<SignupResponse>({} as SignupResponse);
  const [showQR, setShowQR] = useState<boolean>(false);
  const [enableEdit, setEnableEdit] = useState<boolean>(false);
  
  // Form state
  const [formData, setFormData] = useState<{[key: string]: string | null}>({
    name: "",
    email: "",
    recipientName: "",
    phone: "",
    country: "",
    state: "",
    city: "",
    zipcode: "",
    address: "",
  });
  
  // Track changes
  const [originalValues, setOriginalValues] = useState<{[key: string]: string | null}>({});
  const [hasChanges, setHasChanges] = useState<{[key: string]: boolean}>({});
  const [anyChanges, setAnyChanges] = useState<boolean>(false);
  
  // Refs for TextInputs
  const nameInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const phoneInputRef = useRef<TextInput>(null);
  const countryInputRef = useRef<TextInput>(null);
  const stateInputRef = useRef<TextInput>(null);
  const cityInputRef = useRef<TextInput>(null);
  const zipcodeInputRef = useRef<TextInput>(null);
  const addressInputRef = useRef<TextInput>(null);
  
  // Custom hooks
  const keyboardHeight = useKeyboardHandling();
  const { errorMessage, setErrorMessage, errorBannerOpacity } = useErrorHandling();
  
  // Form field configuration
  const formFields: FormField[] = [
    { key: 'name', label: 'Name', ref: nameInputRef, position: 120 },
    { key: 'email', label: 'Email Address', ref: emailInputRef, keyboardType: 'email-address', position: 200 },
    { key: 'phone', label: 'Phone Number', ref: phoneInputRef, keyboardType: 'phone-pad', position: 280 },
    { key: 'country', label: 'Country/Region', ref: countryInputRef, position: 360 },
    { key: 'state', label: 'State', ref: stateInputRef, position: 440 },
    { key: 'city', label: 'City', ref: cityInputRef, position: 520 },
    { key: 'zipcode', label: 'Zipcode', ref: zipcodeInputRef, keyboardType: 'numeric', position: 600 },
    { key: 'address', label: 'Address', ref: addressInputRef, position: 680 },
  ];
  
  // Function to handle field changes
  const handleFieldChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    checkFieldModified(key, value);
  };
  
  // Function to handle input focus and scroll to the focused input
  const handleInputFocus = (fieldName: string) => {
    if (!scrollViewRef.current) return;
    
    const field = formFields.find(f => f.key === fieldName);
    if (!field) return;

    // Use a timeout to allow the keyboard to appear first
    setTimeout(() => {
      // Get screen height and calculate visible area
      const visibleHeight = screenHeight - keyboardHeight;

      // For fields near the bottom, ensure they're well above the keyboard
      // The multiplier increases the scroll amount for lower fields
      const adjustmentFactor = fieldName === "address" || fieldName === "zipcode" ? 0.7 : 0.5;
      const targetY = Math.max(0, field.position - visibleHeight * adjustmentFactor);

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

      console.log("Modified field:", fieldName, "Is modified:", isModified);

      setHasChanges(newChanges);

      // Check if any field has changes
      const hasAnyChanges = Object.values(newChanges).some((changed) => changed);
      setAnyChanges(hasAnyChanges);
    }

    return isModified;
  };

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
      setProfile(data);

      // Set current values
      const newFormData = {
        name: data?.full_name,
        recipientName: data?.recipient_name,
        email: data?.email,
        phone: data?.phone_number,
        country: data?.country,
        state: data?.state,
        city: data?.city,
        zipcode: data?.zipcode,
        address: data?.street,
      };
      
      setFormData(newFormData);

      // Store original values for change detection
      setOriginalValues(newFormData);

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
        full_name: formData.name,
        email: formData.email ?? "",
        recipient_name: formData.recipientName ?? "",
        street: formData.address,
        city: formData.city,
        state: formData.state,
        zipcode: formData.zipcode,
      };

      // console.log(newInfo);

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
      
      // console.log(newInfo);

      const newData = await updateMyInfo(newInfo);
      console.log("Info updated successfully:", newData);

      // Update original values after successful update
      setOriginalValues(formData);

      // Reset change tracking
      setHasChanges({});

      setEnableEdit(false);
    } catch (error) {
      console.error("Failed to update info:", error);
      setErrorMessage("Failed to update information");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if(!enableEdit) saveChanges();
  }, [enableEdit]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAwareView style={{ backgroundColor: Colors[colorScheme].brandColor }} avoidOffset={0}>
        {showQR ? (
          <QRCodeView profile={profile} onClose={() => setShowQR(false)} />
        ) : (
          <View className="flex-1 flex-col justify-between" style={{ backgroundColor: Colors[colorScheme].brandColor }}>
            {/* Error Banner */}
            <ErrorBanner message={errorMessage} opacity={errorBannerOpacity} />

            {/* Top */}
            <View
              className="flex-col justify-between"
              style={{
                height: topHeight,
                backgroundColor: Colors[colorScheme].brandColor,
              }}
            >
              {/* Header */}
              <View className="flex-row items-start justify-start" style={{ height: topHeight - 6 }}>
                <TouchableOpacity onPress={() => router.back()} className="self-start p-4 my-2">
                  <IconSymbol name="left-arrow" size={22} color={Colors[colorScheme].logoText} className="p-2" />
                </TouchableOpacity>
                <ThemedText className="absolute left-1/2 -translate-x-1/2 mt-8" type="mainSection" colorValue="logoText">
                  My Info
                </ThemedText>
                {/* Optional edit icon */}
                <View className="absolute right-5 top-5 flex-row justify-between" style={{ width: iconWidth }}>
                  <TouchableOpacity
                    onPress={() => setShowQR(true)}
                    style={{
                      backgroundColor: 'transparent',
                    }}
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
                {formFields.map((field) => (
                  <FieldItem
                    key={field.key}
                    field={field}
                    value={formData[field.key]}
                    onChange={handleFieldChange}
                    onFocus={handleInputFocus}
                    enableEdit={enableEdit}
                  />
                ))}

                {/* Save Changes Button */}
                {enableEdit && anyChanges && (
                  <SaveButton onPress={saveChanges} />
                )}

                {/* Add extra padding at the bottom to ensure the last field is not covered by keyboard */}
                <View style={{ height: 100 }} />
              </ScrollView>
            </View>
          </View>
        )}
      </KeyboardAwareView>
    </SafeAreaView>
  );
}
