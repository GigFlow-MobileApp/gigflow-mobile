import { Slot, usePathname, useRouter } from "expo-router";
import { useEffect, useState, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "@/components/ColorSchemeProvider";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-gesture-handler";
import { Colors } from "@/constants/Colors";
import {
  View,
  TouchableOpacity,
  Dimensions,
  Animated,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DrawerItemsType, TabItemsType } from "@/constants/customTypes";
import { Sidebar } from "@/components/SideBar";
import { BottomTabs } from "@/components/BottomTabs";

const screenWdith = Dimensions.get("window").width;
const menuWidth = screenWdith * (216 / 390);
const STATUS_BAR_HEIGHT =
  Platform.OS === "android" ? StatusBar.currentHeight || 30 : 50;
const BOTTOM_INSET_HEIGHT = 34;

const drawerItems: DrawerItemsType[] = [
  {
    icon: "sync",
    label: "Sync Data",
    route: "/sync",
    onPress: () => console.log("Sync Data"),
  },
  {
    icon: "notifications",
    label: "Notifications",
    route: "/main/notifications",
  },
  { icon: "gift", label: "Invite Friends", route: "/main/inviteFriends" },
  { icon: "creditcard", label: "Payments", route: "/main/payment" },
  { icon: "tools", label: "Menu Item1", route: "/main/item1" },
  { icon: "tools", label: "Menu Item2", route: "/main/about" },
  { icon: "tools", label: "Menu Item3", route: "/main/history" },
  { icon: "help", label: "Help", route: "/main/help" },
];

const tabItems: TabItemsType[] = [
  { icon: "house", label: "Home", route: "/main/home" },
  { icon: "grid", label: "Accounts", route: "/main/account" },
  { icon: "file", label: "Fee/Tax", route: "/main/tax" },
  { icon: "gear", label: "Setting", route: "/main/settings" },
];

export default function DrawerLayout() {
  const { colorScheme } = useColorScheme();
  const router = useRouter();
  const pathname = usePathname();
  const pathDepth =
  pathname.includes('/notifications')
    ? 9
    : pathname.startsWith('/main')
      ? pathname.replace('/main', '').split('/').filter(Boolean).length
      : 0;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const slideAnim = useState(new Animated.Value(0))[0];

  // check user token exists
  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) router.replace("/auth");
      // setLoading(false);
    };
    checkAuth();
  }, []);

  // check side bar open or not
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isSidebarOpen ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [isSidebarOpen]);

  // close side bar when change route
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, menuWidth],
    extrapolate: "clamp",
  });

  const sidebarTranslateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-menuWidth, 0],
    extrapolate: "clamp",
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* TOP SAFE AREA FIX cyan bg color*/}
      {/* <View
        className="absolute left-0 right-0 z-0"
        style={{
          top: 0,
          height: STATUS_BAR_HEIGHT,
          backgroundColor: Colors[colorScheme].brandColor,
        }}
      /> */}
      {/* BOTTOM SAFE AREA FIX white bg color*/}
      <View
        className="absolute left-0 right-0 z-0"
        style={{
          bottom: 0,
          height: BOTTOM_INSET_HEIGHT,
          backgroundColor: Colors[colorScheme].backgroundCard,
        }}
      />
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
              // {...panResponder.panHandlers}
            >
              {/* Header button*/}
              <View
                style={{
                  position: "absolute",
                  top: 10,
                  left: 10,
                  zIndex: 20,
                  // backgroundColor: Colors[colorScheme].background,
                  alignItems: "center",
                  padding: 10,
                  // opacity: 0.8
                }}
              >
                {pathDepth <= 1 && (
                  <TouchableOpacity onPress={() => setIsSidebarOpen((prev) => !prev)}>
                    <Ionicons
                      name={isSidebarOpen ? "close" : "menu"}
                      size={28}
                      color={Colors[colorScheme].menuItemText}
                    />
                  </TouchableOpacity>
                )}
              </View>
              <Slot />
            </Animated.View>
          </View>
          <BottomTabs items={tabItems} />
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
