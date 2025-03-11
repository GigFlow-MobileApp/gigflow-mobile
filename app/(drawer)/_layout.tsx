import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Drawer } from "expo-router/drawer";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { Image, View, StyleSheet } from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";
import CustomDrawer from "@/components/CustomDrawerContent";
import "../../global.css";

export default function DrawerLayout() {
  const colorScheme = useColorScheme();

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

  return (
    <Drawer
      drawerContent={(props) => (
        <CustomDrawer
          {...props}
          topItems={
            ([
              {
                label: "Sync Data",
                iconName: "sync",
                onPress: {},
              },
              {
                label: "Notification",
                iconName: "notifications-outline",
                onPress: {},
              },
              {
                label: "Invite Friend",
                iconName: "gift-outline",
                onPress: {},
              },
              {
                label: "Payment",
                iconName: "card-outline",
                onPress: {},
              },
            ])
          }
          bottomItems={
            ([
              {
                label: "Help",
                iconName: "help",
                onPress: {},
              },
              {
                label: "Sign out",
                iconName: "log-out-outline",
                rotate: true,
                onPress: {},
              }
            ])
          }
        />
      )}
      screenOptions={{
        headerTintColor: Colors[colorScheme ?? "light"].text,
        drawerStyle: {
          backgroundColor: Colors[colorScheme ?? "light"].background,
        },
        drawerActiveTintColor: Colors[colorScheme ?? "light"].tint,
      }}
    >
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
        name="menuItem2"
        options={{
          drawerLabel: "Menu Item2",
          drawerIcon: ({ color }) => (
            <IconSymbol size={28} name="tools" color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="menuItem3"
        options={{
          title: "Menu Item3",
          drawerIcon: ({ color }) => (
            <IconSymbol size={28} name="tools" color={color} />
          ),
        }}
      />
    </Drawer>
  );
}