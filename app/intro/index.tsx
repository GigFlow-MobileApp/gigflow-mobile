// app/intro/index.tsx
import { View, Text, Button } from "react-native";
import Logo from "@/assets/images/logo.svg";
import { router } from "expo-router";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";

export default function IntroScreen() {
  const colorScheme = useColorScheme();
  return (
    <View className="flex-1 justify-center bg-white px-4" style={{backgroundColor: Colors[colorScheme ?? "light"].background}}>
      <View className="items-center justify-center px-2">
        <View className={"items-center justify-start rounded-b-3xl"}>
          <Logo  className={"w-20 h-20 mb-2"} />
          <ThemedText className={"pt-3 mt-8"} type="logo" colorValue="primaryText">
            GIg-Flow
          </ThemedText>
        </View>
        <ThemedText className="text-center mb-6 pt-5 px-4" type="description" colorValue="secondaryText">
          Manage your finances effortlessly{"\n"} with our intuitive app.
        </ThemedText>
      </View>
      <View
        className="absolute pb-10"
        style={{ bottom: 0, alignSelf: "center", width: "100%" }}
      >
        <View className="rounded-lg overflow-hidden" style={{ backgroundColor: Colors[colorScheme ?? "light"].buttonBackground}}>
          <Button
            title="Get Started"
            onPress={() => router.replace("/auth")}
            color={Colors[colorScheme ?? "light"].text}
          />
        </View>
      </View>
    </View>
  );
}
