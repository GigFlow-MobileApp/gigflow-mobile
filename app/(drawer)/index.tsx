import { Button, Text, View } from "react-native";
import { useColorScheme } from "@/components/ColorSchemeProvider";
import { Colors } from "@/constants/Colors";

export default function Index() {
  const { colorScheme } = useColorScheme();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors[colorScheme].background,
      }}
    >
      <Text>Hello World</Text>
    </View>
  );
}
