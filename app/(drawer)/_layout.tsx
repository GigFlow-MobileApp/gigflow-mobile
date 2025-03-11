import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Drawer } from "expo-router/drawer";
import { useColorScheme } from "@/components/ColorSchemeProvider";
import { Colors } from "@/constants/Colors";
import { Dimensions } from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";
import CustomDrawer from "@/components/CustomDrawerContent";
import Logo from "@/assets/images/logo.svg";
import "../../global.css";
import { textStyles } from "@/constants/TextStyles";

const screenHeight = Dimensions.get("window").height;
const screenWdith = Dimensions.get("window").width;
const menuWidth = screenWdith * (216 / 390);

export default function DrawerLayout() {
  const {colorScheme} = useColorScheme();

  // const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) router.replace("/auth");
      // setLoading(false);
    };
    checkAuth();
  }, []);

  const removeToken = async() => {
    await AsyncStorage.removeItem('userToken')
  }

  return (
    <Drawer
      screenOptions={{
        headerTintColor: Colors[colorScheme].text,
        drawerStyle: {
          width: menuWidth,
          backgroundColor: Colors[colorScheme].background,
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
        },
        drawerLabelStyle: {
          ...textStyles.description,
        },
        drawerInactiveTintColor: Colors[colorScheme].menuItemText,
        drawerActiveTintColor: Colors[colorScheme].onPressText,
      }}
      drawerContent={(props) => (
        <CustomDrawer
          {...props}
          topItems={([
              {
                label: "Sync Data",
                iconName: "sync",
                onPress: () => {alert('sync data')},
              }
          ])}
          bottomItems={([
              {
                label: "Sign out",
                iconName: "log-out-outline",
                rotate: true,
                onPress: () => {removeToken(); router.replace("/auth");},
              }
          ])}
          logo=<Logo className={"w-25 h-25"} />
        />
      )}
    >
      <Drawer.Screen
        name="notifications"
        options={{
          drawerLabel: "Notification",
          drawerIcon: ({ color }) => (
            <IconSymbol size={28} name="notifications" color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="inviteFriends"
        options={{
          drawerLabel: "Invite Friend",
          drawerIcon: ({ color }) => (
            <IconSymbol size={28} name="gift" color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="payment"
        options={{
          drawerLabel: "Payment",
          drawerIcon: ({ color }) => (
            <IconSymbol size={28} name="card" color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="(tabs)"
        options={{
          drawerLabel: "Menu Item1",
          drawerIcon: ({ color }) => (
            <IconSymbol size={28} name="tools" color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="index"
        options={{
          drawerLabel: "Menu Item2",
          drawerIcon: ({ color }) => (
            <IconSymbol size={28} name="tools" color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="settings"
        options={{
          title: "Menu Item3",
          drawerIcon: ({ color }) => (
            <IconSymbol size={28} name="tools" color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="help"
        options={{
          title: "Help",
          drawerIcon: ({ color }) => (
            <IconSymbol size={28} name="help" color={color} />
          ),
        }}
      />
    </Drawer>
  );
}