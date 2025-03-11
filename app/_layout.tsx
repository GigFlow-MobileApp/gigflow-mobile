import { Slot } from "expo-router";
import { ColorSchemeProvider } from "@/components/ColorSchemeProvider";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ColorSchemeProvider>
        <Slot />
      </ColorSchemeProvider>
    </SafeAreaProvider>
  );
}
