import { Button, Text, View } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from "expo-router";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Hello World</Text>
    </View>
  );
}
