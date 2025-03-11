import { View } from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { ThemedText } from "@/components/ThemedText";

export default function SplashPage() {
  const colorScheme = useColorScheme();

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
