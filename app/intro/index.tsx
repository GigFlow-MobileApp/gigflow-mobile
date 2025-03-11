import { View, Dimensions, Pressable } from "react-native";
import Logo from "@/assets/images/logo.svg";
import { router } from "expo-router";
import { useColorScheme } from "@/components/ColorSchemeProvider";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";

const screenHeight = Dimensions.get('window').height;
const bottomMargin = screenHeight * 48/844;
const title_description_margin = screenHeight * 12/844;
const image_title__margin = screenHeight * 32/844;


export default function IntroScreen() { 
  const { colorScheme} = useColorScheme();

  return (
    <View
      className="flex-1 justify-center bg-white px-5"
      style={{ backgroundColor: Colors[colorScheme].background }}
    >
      <View className="items-center justify-center px-6">
        <View className={"items-center justify-start rounded-b-3xl"}>
          <Logo style={{height: 100, width: 100}}/>
          <ThemedText
            className="py-2"
            style={{marginTop: image_title__margin}}
            type="logo"
            colorValue="primaryText"
          >
            GIg-Flow
          </ThemedText>
        </View>
        <ThemedText
          className="text-center px-4"
          style={{marginTop: title_description_margin}}
          type="description"
          colorValue="secondaryText"
        >
          Manage your finances effortlessly{"\n"} with our intuitive app.
        </ThemedText>
      </View>
      <View
        className="absolute pb-10"
        style={{ bottom: 0, alignSelf: "center", width: "100%" }}
      >
        <Pressable
          onPress={() => router.replace("/auth")}
          style={{
            backgroundColor: Colors[colorScheme].btnBackground,
            paddingVertical: 12,
            marginBottom: bottomMargin,
            borderRadius: 6,
            alignItems: "center",
          }}
        >
          <ThemedText type="btnText" colorValue="btnText">
            Get Started
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}
