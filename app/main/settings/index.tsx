import { View, Text, Image, Dimensions, TouchableOpacity} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useColorScheme } from "@/components/ColorSchemeProvider";
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { getMyInfo } from "@/apis/infoAPI";
import {
  SignupResponse,
  SignupResponseSchema
} from "@/constants/customTypes";

const screenHeight = Dimensions.get("window").height;
const topHeight = screenHeight * (269 / 844);

interface MenuItemProps {
  iconName: string;
  size: number;
  text: string;
  onPress: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({iconName, size, text, onPress}) => {
  const { colorScheme } = useColorScheme();

  return (
    <View className="px-5 py-3 mb-3">
      <TouchableOpacity
        onPress={onPress}
        style={{display: "flex", flexDirection: "row", justifyContent: "space-between"}}
      >
        <View className="flex-row">
          <IconSymbol name={iconName} size={size} color={Colors[colorScheme].menuItemText}/>
          <ThemedText colorValue="menuItemText" className="pl-3 pt-2">{text}</ThemedText>
        </View>
        <IconSymbol name="right-arrow" size={20} color={Colors[colorScheme].menuItemText} 
          style={{paddingTop: 7}}/>
      </TouchableOpacity>
    </View>
  )
}

export default function SettingScreen() {
  const { colorScheme } = useColorScheme();
  const router = useRouter();
  const iconSize = 32;
  const [name, setName] = useState<string | null>("");
  const [phoneNumber, setPhoneNumber] = useState<string | null>("");

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
      setPhoneNumber(data?.zipcode);
    } catch (error) {
      console.error("Failed to fetch info:", error);
    }
  };
  useEffect(() => {
    fetchData();
    console.log(`name: ${name}`);
    console.log(`phoneNumber: ${phoneNumber}`);
  }, []);
  
  return (
    <View className="flex-1 flex-col justify-between" style={{backgroundColor: Colors[colorScheme].background}}>
      {/* top avatar part*/}
      <View className="flex-row justify-center" style={{height: topHeight, backgroundColor: Colors[colorScheme].brandColor}}>
        <View className="flex-col justify-center items-center">
          <Image source={require('@/assets/images/Avatar.png')} className="w-21 h-21" resizeMode="cover"/>
          <ThemedText colorValue="btnText" type="section" className="mt-3">{name}</ThemedText>
          <ThemedText colorValue="btnText" type="defautlSmall" className="mt-1">{phoneNumber}</ThemedText>
        </View>
      </View>
      {/* bottom options part*/}
      <View className="flex-1">
        <View className="m-6">
          <MenuItem iconName="person.circle" size={iconSize} text="My Info" onPress={() => router.push("/main/settings/info")}/>
          <MenuItem iconName="grid" size={iconSize} text="My Account" onPress={() => router.push("/main/account")}/>
          <MenuItem iconName="coins" size={iconSize} text="Payment history" onPress={() => router.push("/main/payment")}/>
          <MenuItem iconName="notifications" size={iconSize} text="Notification" onPress={() => router.push("/main/notifications")}/>
          <MenuItem iconName="tools" size={iconSize} text="Setting" onPress={() => router.push("/main/settings/setting")}/>
        </View>
      </View>
    </View>
  );
}
