import { Slot, usePathname, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "@/components/ColorSchemeProvider";
import "react-native-gesture-handler";
import { Colors } from "@/constants/Colors";
import {
  View,
  TouchableOpacity,
  Dimensions,
  Animated,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DrawerItemsType, TabItemsType } from "@/constants/customTypes";
import { Sidebar } from "@/components/SideBar";
import { BottomTabs } from "@/components/BottomTabs";

const screenWdith = Dimensions.get("window").width;
const menuWidth = screenWdith * (216 / 390);

const drawerItems: DrawerItemsType[] = [
  {
    icon: "sync",
    label: "Sync Data",
    route: "/sync",
    onPress: () => console.log("Sync Data"),
  },
  { icon: "notifications", label: "Notifications", route: "/main/notifications" },
  { icon: "gift", label: "Invite Friends", route: "/main/inviteFriends" },
  { icon: "creditcard", label: "Payments", route: "/main/payment" },
  { icon: "tools", label: "Menu Item1", route: "/main" },
  { icon: "tools", label: "Menu Item2", route: "/main/about" },
  { icon: "tools", label: "Menu Item3", route: "/main/history" },
  { icon: "help", label: "Help", route: "/main/help" },
];

const tabItems: TabItemsType[] = [
  { icon: "house", label: "Home", route: "/main/home" },
  { icon: "grid", label: "Accounts", route: "/main/payment" },
  { icon: "file", label: "Fee/Tax", route: "/main/tax" },
  { icon: "gear", label: "Setting", route: "/main/settings" },
];

export default function DrawerLayout() {
  const { colorScheme } = useColorScheme();
  const router = useRouter();
  const pathname = usePathname();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const slideAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) router.replace("/auth");
      // setLoading(false);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isSidebarOpen ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [isSidebarOpen]);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, menuWidth],
  });

  const sidebarTranslateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-menuWidth, 0],
  });

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="flex-1 flex-col">
        <View className="flex-1 flex-row overflow-hidden">
          <Animated.View
            style={{
              width: menuWidth,
              transform: [{ translateX: sidebarTranslateX }],
              position: "absolute",
              zIndex: 10,
              height: "100%",
            }}
          >
            <Sidebar items={drawerItems} />
          </Animated.View>

          <Animated.View
            style={{
              flex: 1,
              transform: [{ translateX }],
            }}
          >
            {/* Header */}
            <View
              style={{
                position: "absolute",
                top: 10,
                left: 10,
                zIndex: 20,
                backgroundColor: Colors[colorScheme].background,
                borderRadius: 10,
                alignItems: "center",
                padding: 10,
                elevation: 5,
              }}
            >
              <TouchableOpacity
                onPress={() => setIsSidebarOpen((prev) => !prev)}
              >
                <Ionicons
                  name={isSidebarOpen ? "close" : "menu"}
                  size={28}
                  color={Colors[colorScheme].menuItemText}
                />
              </TouchableOpacity>
            </View>
            <Slot />
          </Animated.View>
        </View>
        <BottomTabs items={tabItems} />
      </View>
    </SafeAreaView>
  );
}
