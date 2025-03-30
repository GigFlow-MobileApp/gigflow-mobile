import {
  View,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useThemeColors } from "@/components/ColorSchemeProvider";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { getMyInfo } from "@/apis/infoAPI";
import BottomSheet from "@/components/Dialog";
import { SignupResponse, SignupResponseSchema } from "@/constants/customTypes";

const screenHeight = Dimensions.get("window").height;
const topHeight = screenHeight * (269 / 844);

interface PressableCardProps {
  children: React.ReactNode;
  onPress?: () => void;
}

const PressableCard: React.FC<PressableCardProps> = ({ children, onPress }) => {
  const { colors } = useThemeColors();
  const [isPressed, setIsPressed] = useState(false);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      onPress={onPress}
      style={{
        position: "relative",
        shadowColor: colors.shadow,
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: isPressed ? 0 : 0.3,
        shadowRadius: 4,
        elevation: isPressed ? 0 : 5,
        backgroundColor: colors.backgroundCard,
        borderRadius: 8,
        padding: 12,
        overflow: "hidden",
      }}
    >
      {isPressed && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 8,
            pointerEvents: "none",
          }}
        />
      )}
      {children}
    </TouchableOpacity>
  );
};

interface MenuItemProps {
  iconName: string;
  size: number;
  text: string;
  onPress: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({
  iconName,
  size,
  text,
  onPress,
}) => {
  const { colors } = useThemeColors();

  return (
    <View className="px-5 py-3 mb-3">
      <TouchableOpacity
        onPress={onPress}
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <View className="flex-row">
          <IconSymbol name={iconName} size={size} color={colors.menuItemText} />
          <ThemedText colorValue="menuItemText" className="pl-3 pt-2">
            {text}
          </ThemedText>
        </View>
        <IconSymbol
          name="right-arrow"
          size={20}
          color={colors.menuItemText}
          style={{ paddingTop: 7 }}
        />
      </TouchableOpacity>
    </View>
  );
};

export default function SettingScreen() {
  const { colors } = useThemeColors();
  const router = useRouter();
  const iconSize = 32;
  const [name, setName] = useState<string | null>("");
  const [phoneNumber, setPhoneNumber] = useState<string | null>("");
  const [showSheet, setShowSheet] = useState(false);

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
      setPhoneNumber(data?.phone_number);
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
    <View
      className="flex-1 flex-col justify-between"
      style={{ backgroundColor: colors.background }}
    >
      {/* top avatar part*/}
      <View
        className="flex-row justify-center"
        style={{ height: topHeight, backgroundColor: colors.brandColor }}
      >
        <View className="flex-col justify-center items-center">
          <Image
            source={require("@/assets/images/Avatar.png")}
            className="w-21 h-21"
            resizeMode="cover"
          />
          <ThemedText colorValue="btnText" type="section" className="mt-3">
            {name}
          </ThemedText>
          <ThemedText colorValue="btnText" type="defautlSmall" className="mt-1">
            {phoneNumber}
          </ThemedText>
        </View>
      </View>
      {/* bottom options part*/}
      <View className="flex-1">
        <View className="m-6">
          <MenuItem
            iconName="person.circle"
            size={iconSize}
            text="My Info"
            onPress={() => router.push("/main/settings/info")}
          />
          <MenuItem
            iconName="grid"
            size={iconSize}
            text="My Account"
            onPress={() => router.push("/main/account")}
          />
          <MenuItem
            iconName="coins"
            size={iconSize}
            text="Payment history"
            onPress={() => router.push("/main/payment")}
          />
          <MenuItem
            iconName="notifications"
            size={iconSize}
            text="Notification"
            onPress={() => router.push("/main/notifications")}
          />
          <MenuItem
            iconName="tools"
            size={iconSize}
            text="Setting"
            onPress={() => setShowSheet(true)}
          />
        </View>
      </View>
      <BottomSheet visible={showSheet} onClose={() => setShowSheet(false)}>
        {/* Header */}
        <View className="relative h-12 mt-3 mb-2 justify-center items-center">
          <TouchableOpacity
            onPress={() => setShowSheet(false)}
            className="absolute left-5"
          >
            <IconSymbol name="back" size={24} color={colors.primaryText} />
          </TouchableOpacity>
          <ThemedText
            colorValue="primaryText"
            type="title"
            className="absolute inset-x-0 text-center"
          >
            Settings
          </ThemedText>
        </View>
        {/* Divider */}
        <View
          className="w-full h-[1.5px]"
          style={{ backgroundColor: colors.divider }}
        />
        <ScrollView
          showsVerticalScrollIndicator={false}
        >
          {/* Account Section */}
          <View className="mt-6 mx-5">
            <ThemedText
              type="defaultSemiBold"
              colorValue="primaryText"
              style={{ fontFamily: "Poppins", height: 26 }}
            >
              Your Accounts
            </ThemedText>
            <View className="flex-row justify-between mt-4">
              {/* Accounts */}
              <View className="flex-1">
                <PressableCard>
                  <View className="flex-row justify-between items-center">
                    <IconSymbol name="grid" size={32} color={colors.cardText} />
                    <View className="flex-col">
                      <ThemedText
                        className="text-center ml-2"
                        colorValue="cardText"
                        type="defautlSmall"
                        style={{ fontWeight: 700, height: 22 }}
                      >
                        Accounts
                      </ThemedText>
                      <ThemedText
                        className="text-center ml-1"
                        colorValue="cardText"
                        type="semiSmall"
                        style={{ height: 20 }}
                      >
                        Connected Account
                      </ThemedText>
                    </View>
                  </View>
                </PressableCard>
              </View>
              <View className="w-3" />
              {/* Profile */}
              <View className="flex-1">
                <PressableCard>
                  <View className="flex-row justify-between items-center">
                    <IconSymbol
                      name="person"
                      size={32}
                      color={colors.cardText}
                    />
                    <View className="flex-col ml-2">
                      <ThemedText
                        colorValue="cardText"
                        type="defautlSmall"
                        style={{ fontWeight: 700, height: 22 }}
                      >
                        Profile
                      </ThemedText>
                      <ThemedText
                        colorValue="cardText"
                        type="semiSmall"
                        style={{ height: 20 }}
                      >
                        Your Profile
                      </ThemedText>
                    </View>
                  </View>
                </PressableCard>
              </View>
            </View>
          </View>
          {/* Financial Management Section */}
          <View className="mt-6 mx-5">
            <ThemedText
              type="defaultSemiBold"
              colorValue="primaryText"
              style={{ fontFamily: "Poppins", height: 26 }}
            >
              Financial Management
            </ThemedText>
            <View className="flex-row justify-between mt-4">
              {/* Payout */}
              <View className="flex-1">
                <PressableCard>
                  <View className="flex-col justify-between items-center">
                    <IconSymbol
                      name="coins"
                      size={32}
                      color={colors.cardText}
                    />
                    <ThemedText
                      colorValue="cardText"
                      type="defautlSmall"
                      style={{ fontWeight: 700, marginTop: 8 }}
                    >
                      Payout
                    </ThemedText>
                    <ThemedText
                      colorValue="textTertiary"
                      type="semiSmall"
                      style={{ textAlign: "center", marginTop: 4 }}
                    >
                      Check current available balance and payout
                    </ThemedText>
                  </View>
                </PressableCard>
              </View>
              <View className="w-3" />
              {/* Payment History */}
              <View className="flex-1">
                <PressableCard>
                  <View className="flex-col items-center">
                    <IconSymbol
                      name="person"
                      size={32}
                      color={colors.cardText}
                    />
                    <ThemedText
                      colorValue="cardText"
                      type="defautlSmall"
                      style={{ fontWeight: 700, marginTop: 8 }}
                    >
                      Payment History
                    </ThemedText>
                    <ThemedText
                      colorValue="textTertiary"
                      type="semiSmall"
                      style={{ textAlign: "center", marginTop: 4 }}
                    >
                      Check all history from your connectd account
                    </ThemedText>
                  </View>
                </PressableCard>
              </View>
            </View>
          </View>
          {/*Settings */}
          <View className="mt-6 mx-5 pb-10">
            <ThemedText
              type="defaultSemiBold"
              colorValue="primaryText"
              style={{ fontFamily: "Poppins", height: 26 }}
            >
              Settings
            </ThemedText>
            <View className="flex-row justify-between mt-4">
              {/* System Settings */}
              <View className="flex-1">
                <PressableCard>
                  <View className="flex-row justify-start items-center ml-2">
                    <IconSymbol name="gear" size={24} color={colors.cardText} />
                    <ThemedText colorValue="cardText" type="btnText" className="ml-4">
                      System Settings
                    </ThemedText>
                  </View>
                </PressableCard>
              </View>
            </View>
          </View>
        </ScrollView>
      </BottomSheet>
    </View>
  );
}
