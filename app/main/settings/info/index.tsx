import {
  View,
  Platform,
  Image,
  Dimensions,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { NativeSyntheticEvent, TextInputFocusEventData } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useColorScheme } from "@/components/ColorSchemeProvider";
import { Colors } from "@/constants/Colors";
import { TextInput } from "react-native-gesture-handler";
import { useState, useEffect } from "react";
import { getMyInfo, updateMyInfo } from "@/apis/infoAPI";
import {
  SignupResponse,
  SignupResponseSchema,
  UpdateMyInfoType,
  updateMyInfoZod,
} from "@/constants/customTypes";
import KeyboardAwareView from "@/components/KeyboardAwareView";

const screenHeight = Dimensions.get("window").height;
const screenWdith = Dimensions.get("window").width;
const topHeight = (screenHeight * (175 - 40)) / (844 - 40);
const iconWidth = screenWdith / 6;

interface FieldItemProps {
  text: string;
  value: string | null;
  onChange: (val: string) => void;
  onBlur?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  enableEdit: boolean;
}

const FieldItem: React.FC<FieldItemProps> = ({
  text,
  value,
  onChange,
  onBlur,
  enableEdit,
}) => {
  const { colorScheme } = useColorScheme();

  return (
    <View className="px-5 mt-2 mb-3">
      <ThemedText
        colorValue="secondaryText"
        type="section"
        className="pl-1 pb-1"
      >
        {text}
      </ThemedText>
      <TextInput
        value={value ?? ""}
        onChangeText={onChange}
        onBlur={onBlur}
        editable={enableEdit}
        className="border rounded-lg px-4 pb-1 mb-4 text-lg"
        style={{
          borderColor: Colors[colorScheme].border,
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
      setName(data?.full_name);
      setRecipientName(data?.recipient_name);
      setEmail(data?.email);
      setPhone(data?.zipcode);
      setCountry(data?.state);
      setState(data?.state);
      setCity(data?.city);
      setZipcode(data?.zipcode);
      setAddress(data?.street);
    } catch (error) {
      console.error("Failed to fetch info:", error);
    }
  };

  const updateData = async () => {
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
        const firstError = Object.values(parsed.error.format())[0]
          ?._errors?.[0];
        if (firstError) alert(firstError);

        return;
      }

      const newData = await updateMyInfo(newInfo);
      console.log("Info updated successfully:", newData);
      setEnableEdit(false);
    } catch (error) {
      console.error("Failed to fetch info:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAwareView
        style={{ backgroundColor: Colors[colorScheme].background }}
        avoidOffset={Platform.OS === "ios" ? 50 : 30}
      >
        <View
          className="flex-1 flex-col justify-between"
          style={{ backgroundColor: Colors[colorScheme].brandColor }}
        >
          {/* Top */}
          <View
            className="flex-col justify-between"
            style={{
              height: topHeight,
              backgroundColor: Colors[colorScheme].brandColor,
            }}
          >
            {/* Top banner */}
            <View
              className="flex-row items-start justify-center"
              style={{ height: topHeight - 6 }}
            >
              <ThemedText
                className="mt-8"
                type="mainSection"
                colorValue="logoText"
              >
                My Info
              </ThemedText>
              {/* Optional edit icon */}
              <View
                className="absolute right-5 top-5 flex-row justify-between"
                style={{ width: iconWidth }}
              >
                <IconSymbol
                  name="qrcode"
                  size={24}
                  color={Colors[colorScheme].shadow}
                />
                <TouchableOpacity onPress={() => setEnableEdit(true)}>
                  <IconSymbol
                    name="edit"
                    size={24}
                    color={Colors[colorScheme].shadow}
                  />
                </TouchableOpacity>
              </View>
            </View>
            {/* top avatar part*/}
            <View className="items-center -mt-16 mb-4">
              <Image
                source={require("@/assets/images/Avatar.png")}
                className="w-36 h-36 rounded-full z-50"
                resizeMode="cover"
              />
            </View>
          </View>

          {/* bottom fields part*/}
          <View
            className="flex-1 flex-col rounded-t-2xl pt-20"
            style={{ backgroundColor: Colors[colorScheme].background }}
          >
            <View className="h-18" />
            <ScrollView>
              <FieldItem
                text="Name"
                value={name}
                onChange={setName}
                onBlur={updateData}
                enableEdit={enableEdit}
              />
              <FieldItem
                text="Email Address"
                value={email}
                onChange={setEmail}
                onBlur={updateData}
                enableEdit={enableEdit}
              />
              <FieldItem
                text="Phone Number"
                value={phone}
                onChange={setPhone}
                onBlur={updateData}
                enableEdit={enableEdit}
              />
              <FieldItem
                text="Country/Region"
                value={country}
                onChange={setCountry}
                onBlur={updateData}
                enableEdit={enableEdit}
              />
              <FieldItem
                text="State"
                value={state}
                onChange={setState}
                onBlur={updateData}
                enableEdit={enableEdit}
              />
              <FieldItem
                text="City"
                value={city}
                onChange={setCity}
                onBlur={updateData}
                enableEdit={enableEdit}
              />
              <FieldItem
                text="Zipcode"
                value={zipcode}
                onChange={setZipcode}
                onBlur={updateData}
                enableEdit={enableEdit}
              />
              <FieldItem
                text="Address"
                value={address}
                onChange={setAddress}
                onBlur={updateData}
                enableEdit={enableEdit}
              />
            </ScrollView>
          </View>
        </View>
      </KeyboardAwareView>
    </SafeAreaView>
  );
}
