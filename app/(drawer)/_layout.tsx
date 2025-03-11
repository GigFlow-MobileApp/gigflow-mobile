import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Drawer } from "expo-router/drawer";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { Image, View, StyleSheet } from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";
import "../../global.css";

export default function DrawerLayout() {
  const colorScheme = useColorScheme();

  // const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) router.replace('/auth');
      // setLoading(false);
    };
    checkAuth();
  }, []);

  return (
      <Drawer
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
            headerShown: false,
            drawerLabel: "Home",
            drawerIcon: ({ color }) => (
              <IconSymbol size={24} name="house.fill" color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="profile"
          options={{
            title: "Profile",
            drawerIcon: ({ color }) => (
              <IconSymbol size={24} name="person.circle.fill" color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="settings"
          options={{
            title: "Settings",
            drawerIcon: ({ color }) => (
              <IconSymbol size={24} name="gear" color={color} />
            ),
          }}
        />
      </Drawer>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 100,
    height: 100,
    resizeMode: "contain",
  },
});
