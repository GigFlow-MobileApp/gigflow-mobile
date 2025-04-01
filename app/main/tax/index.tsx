import { View, Text, Animated } from "react-native"
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { useThemeColors } from "@/components/ColorSchemeProvider";
import { useRouter } from "expo-router";


export default function TaxScreen() {
  const { colors } = useThemeColors();
  const router = useRouter();

  
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <FloatingActionButton 
        iconName="wheel"
        backgroundColor={colors.onPressBg}
        onPress={() => router.push("/main/chatbot" as never)}
        customAnimation={(animatedValue) => {
          Animated.spring(animatedValue, {
            toValue: 0,
            friction: 5,
            tension: 40,
            useNativeDriver: false
          }).start();
        }}
      />
    </View>
  );
}
