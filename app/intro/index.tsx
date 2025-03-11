// app/intro/index.tsx
import { View, Text, Button, Image } from "react-native";
import { router } from "expo-router";

export default function IntroScreen() {
  return (
    <View className="flex-1 justify-center bg-white px-4">
      <View className="items-center justify-center px-2">
        <View className={"items-center justify-start rounded-b-3xl"}>
            <Image
                source={require("@/assets/images/logo.png")}
                className={"w-20 h-20 mb-2"}
                resizeMode="contain"
            />
            <Text className={"font-bold pt-3 text-black text-5xl mt-8" }>
                GIg-Flow
            </Text>
        </View>
        <Text className="text-center font-light text-gray-700 mb-6 pt-5 px-4" style={{fontSize: 18}}>
          Manage your finances effortlessly{'\n'} with our intuitive app.
        </Text>
      </View>
      <View className="absolute pb-10" style={{bottom: 0, alignSelf: "center", width: "100%"}}>
        <View className="rounded-lg bg-cyan-500 overflow-hidden">
          <Button
            title="Get Started"
            onPress={() => router.replace("/auth")}
            color="white"
          />
        </View>
      </View>
    </View>
  );
}
