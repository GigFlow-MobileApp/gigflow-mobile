import { View} from "react-native";
import { useRouter, useRootNavigationState } from 'expo-router';
import { useEffect } from 'react';
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { ThemedText } from "@/components/ThemedText";

export default function SplashPage() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const navReady = useRootNavigationState();

  useEffect(() => {
    if (!navReady?.key) return;

    const timer = setTimeout(() => {
      router.replace('/intro');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navReady]);

  return (
    <View
      className="flex-1 items-center justify-center"
      style={{ backgroundColor: Colors[colorScheme ?? "light"].brandColor }}
    >
      <ThemedText className="font-bold mb-4" type="logo" colorValue="primaryText">
        GIG-Flow
      </ThemedText>
    </View>
  );
}
