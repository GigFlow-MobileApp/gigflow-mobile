import { View} from "react-native";
import { useRouter, useRootNavigationState } from 'expo-router';
import { useEffect } from 'react';
import { useColorScheme } from "@/components/ColorSchemeProvider";
import { Colors } from "@/constants/Colors";
import { ThemedText } from "@/components/ThemedText";
import Config from "@/constants/config";

export default function SplashPage() {
  const {colorScheme} = useColorScheme();
  const router = useRouter();
  const navReady = useRootNavigationState();

  useEffect(() => {
    if (!navReady?.key) return;

    const timer = setTimeout(() => {
      router.replace('/intro');
    }, Config.debug ? 500 : 3000);

    return () => clearTimeout(timer);
  }, [navReady]);

  return (
    <View
      className="flex-1 items-center justify-center"
      style={{ backgroundColor: Colors[colorScheme].brandColor }}
    >
      <ThemedText type="logo" colorValue="logoText">
        Gig-Flow
      </ThemedText>
    </View>
  );
}
