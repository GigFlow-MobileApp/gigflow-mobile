import { useLocalSearchParams } from "expo-router";
import React, { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, TextInput, Dimensions, Animated, Easing } from "react-native";
import { Ionicons, Feather, MaterialIcons } from "@expo/vector-icons";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useThemeColors } from "@/components/ColorSchemeProvider";
import { platformColor } from "@/constants/Colors";
import { ThemedText } from "@/components/ThemedText";
import { useRouter } from "expo-router";
import { textStyles } from "@/constants/TextStyles";
import { Activity } from "@/constants/customTypes";
// import ActionButton from 'react-native-action-button';

type PlatformName = keyof typeof logoMap;


const logoMap = {
  uber: require("@/assets/images/logos/uber.png"),
  lyft: require("@/assets/images/logos/lyft.png"),
  doordash: require("@/assets/images/logos/doordash.png"),
  upwork: require("@/assets/images/logos/upwork.png"),
  fiverr: require("@/assets/images/logos/fiverr.png"),
};

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;
const blackWidth = screenWidth * (90 / 390);
const cardHeight = screenHeight * (272 / 897);
const bcrhc = screenHeight / (897 - 40); //blackCardRelativeHeightConst
const bcrwc = screenWidth / 390; //blackCardRelativeWidthConst

type ActivityItem = {
  title: string;
  subtitle: string;
  amount: string;
  type: "in" | "out";
};

interface ActivityItemProps {
  a: ActivityItem;
  i: number;
}

const ActivityItem:React.FC<ActivityItemProps> = ({a, i}) => {
  const { colors } = useThemeColors();

  const contentTranslateX = useRef(new Animated.Value(screenWidth)).current;
  
  useEffect(() => {
    // Entrance animation with staggered delay based on index
    const animationDelay = i * 100; // 100ms delay between items
    
    Animated.timing(contentTranslateX, {
      toValue: 0,
      duration: 500,
      delay: animationDelay,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      key={i}
      className="rounded-xl border border-gray-200 p-1 mb-3 shadow-xs"
      style={{ 
        backgroundColor: colors.background,
        transform: [{ translateX: contentTranslateX }]
      }}
    >
      <View className="flex-row justify-between items-center my-2 pl-3">
        <View className="flex-row items-start">
          <IconSymbol
            name="arrow"
            size={24}
            color={colors.primaryText}
            style={{ transform: [{ rotate: a.type === "in" ? "-135deg" : "45deg" }] }}
          />
          <View className="flex-col pt-1 pl-2">
            <ThemedText type="defautlSmall" style={{ fontWeight: 600 }} colorValue="cardText">
              {a.title}
            </ThemedText>
            <ThemedText type="semiSmall" colorValue="textTertiary" className="pt-1">
              {a.subtitle}
            </ThemedText>
          </View>
        </View>
        <View className="flex-col pt-1 justify-between">
          <Text className={`text-base font-semibold pr-2 ${a.type === "in" ? "text-green-600" : "text-red-500"}`}>
            {a.amount}
          </Text>
          <IconSymbol className="self-end" name="detail" size={22} color={colors.primaryText} />
        </View>
      </View>
    </Animated.View>
  )
}

export default function AccountBalancePage() {
  const { name } = useLocalSearchParams();
  const { colors } = useThemeColors();
  const [secureId, setSecureId] = useState(true);
  const [available, setAvailable] = useState(0);
  const [pending, setPending] = useState(0);
  const [accountId, setAccountId] = useState("");
  const [date, setDate] = useState("");
  const [activities, setActivities] = useState<Activity[]>([]);
  const router = useRouter();
  
  // Animation values
  const cardFlipAnimation = useState(new Animated.Value(0))[0];
  const buttonsTranslateX  = useState(new Animated.Value(100))[0];

  // Start animations when component mounts
  useEffect(() => {
    // Run all animations simultaneously
    Animated.sequence([
      // Card flip animation
      Animated.timing(cardFlipAnimation, {
        toValue: 1,
        duration: 800,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      // Buttons scale animation
      Animated.spring(buttonsTranslateX, {
        toValue: 0,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Calculate flip animation interpolations
  const frontFlipRotation = cardFlipAnimation.interpolate({
    inputRange: [0, 0.5, 0.501, 1],
    outputRange: ['0deg', '90deg', '-90deg', '0deg'],
  });
  
  // Simplified approach - just use the animation value directly
  const frontSideVisibility = cardFlipAnimation.interpolate({
    inputRange: [0, 0.5, 0.501, 1],
    outputRange: [0, 0, 1, 1],
  });
  
  const backSideVisibility = cardFlipAnimation.interpolate({
    inputRange: [0, 0.499, 0.5, 1],
    outputRange: [1, 1, 0, 0],
  });

  // Calculate scale animation interpolations
  const buttonPos = buttonsTranslateX .interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  // useEffect to fetch account data and set default values if API fails
  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        // Attempt to call the API function
        // Replace this with your actual API call
        // const response = await fetchAccountAPI(name);

        // If API call is successful, set the values from the response
        // setAvailable(response.available);
        // setPending(response.pending);
        // setAccountId(response.accountId);
        // setDate(response.date);
        // setActivities(response.activities);

        // For demonstration, we'll simulate an API failure
        throw new Error(`${name} API not working, Use Mock Data`);
      } catch (error) {
        console.log("Error fetching account data:", error);

        // Set default values if API fails
        setAvailable(850);
        setPending(350);
        setAccountId("2412 7512 3412 3456");
        setDate("Monday 21/08/23");

        // Set default activities
        setActivities([
          {
            title: "AI chatbot Development",
            subtitle: "Project bonus",
            amount: "+$300.00",
            type: "in",
          },
          {
            title: "AI chatbot Development",
            subtitle: "Movie tickets",
            amount: "-$13.00",
            type: "out",
          },
          {
            title: "Uber fee",
            subtitle: "Payments",
            amount: "-$25.00",
            type: "out",
          },
        ]);
      }
    };

    fetchAccountData();
  }, [name]); // Re-run when name changes

  // Ensure name is a valid platform name for indexing
  const platformName = typeof name === "string" && name in logoMap ? (name as PlatformName) : "uber"; // Default to uber if name is not valid

  // Get the logo source
  const logoSource = logoMap[platformName];

  // Get the platform color
  const platformBgColor =
    platformName in platformColor ? platformColor[platformName as keyof typeof platformColor] : platformColor.uber;

  return (
    <View className="flex-1 px-4 pt-4" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <View className="flex-row justify-between items-center mb-6">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.push("/main/account")} className="mr-3">
            <IconSymbol name="back" size={24} color={colors.primaryText} />
          </TouchableOpacity>
          <ThemedText type="title" className="self-center" style={{ fontWeight: 700 }}>
            Your Balance
          </ThemedText>
        </View>
        <TouchableOpacity onPress={() => ""}>
          <IconSymbol name="notifications" size={24} color={colors.primaryText} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="h-auto">
        {/* Balance Card */}
        <View className="flex-col mb-6" style={{ height: cardHeight }}>
          <Image
            source={logoSource}
            style={{ width: 60, height: 60, borderRadius: 30, marginBottom: 12 }}
            resizeMode="cover"
          />
          <View className="flex-1 h-[90px] relative">
            {/* Back side of the card (visible first) */}
            <Animated.View
              className="absolute w-full h-full rounded-xl"
              style={{
                backgroundColor: platformBgColor,
                elevation: 8,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 6,
                opacity: backSideVisibility,
                transform: [{ rotateY: frontFlipRotation }],
                zIndex: 1,
              }}
            >
              {/* Simple white rectangle decorations */}
              <View className="absolute rounded-lg w-16 h-4 opacity-40" 
                style={{ backgroundColor: 'white', top: 15, left: 20 }} />
              <View className="absolute rounded-lg w-24 h-4 opacity-40" 
                style={{ backgroundColor: 'white', top: 15, right: 20 }} />
              <View className="absolute rounded-lg w-20 h-4 opacity-30" 
                style={{ backgroundColor: 'white', top: 35, left: 30 }} />
              <View className="absolute rounded-lg w-32 h-4 opacity-30" 
                style={{ backgroundColor: 'white', top: 55, left: 20 }} />
              <View className="absolute rounded-lg w-16 h-4 opacity-20" 
                style={{ backgroundColor: 'white', top: 55, right: 30 }} />
              <View className="absolute rounded-lg w-24 h-4 opacity-20" 
                style={{ backgroundColor: 'white', bottom: 15, left: 40 }} />
            </Animated.View>
            
            {/* Front side of the card (visible after flip) */}
            <Animated.View
              className="absolute w-full h-full rounded-xl flex-row justify-between items-center"
              style={{
                backgroundColor: colors.background,
                elevation: 8,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 6,
                transform: [{ rotateY: frontFlipRotation }],
                opacity: frontSideVisibility,
                zIndex: 2,
              }}
            >
              <View className="flex-1 h-full flex-col p-4 justify-between">
                <View className="flex-row items-center">
                  <ThemedText type="defautlSmall" colorValue="cardText">
                    Available
                  </ThemedText>
                  <ThemedText type="title" colorValue="primaryText" className="ml-6">
                    ${available.toFixed(2)}
                  </ThemedText>
                </View>
                <View className="flex-row items-center">
                  <ThemedText type="defautlSmall" colorValue="cardText">
                    Pending
                  </ThemedText>
                  <ThemedText type="btnText" colorValue="textTertiary" className="ml-6" style={{ fontWeight: 600 }}>
                    ${pending.toFixed(2)}
                  </ThemedText>
                </View>
                <View className="flex-col">
                  <ThemedText type="semiSmall" colorValue="textTertiary">
                    Account ID
                  </ThemedText>
                  <View className="flex-row justify-between items-center pt-1">
                    <TextInput
                      value={accountId}
                      style={{ color: colors.textTertiary, fontFamily: "Poppins", ...textStyles.default }}
                      secureTextEntry={secureId}
                      autoCapitalize="none"
                      editable={false}
                    />
                    <TouchableOpacity onPress={() => setSecureId(!secureId)}>
                      <Feather name={secureId ? "eye-off" : "eye"} size={16} color={colors.textTertiary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View
                style={{
                  width: 1,
                  height: "80%",
                  backgroundColor: "rgba(0,0,0,0.1)",
                  marginVertical: "10%",
                  borderRadius: 1,
                }}
              />
              <View
                className="h-full rounded-r-xl relative overflow-hidden"
                style={{ width: blackWidth, backgroundColor: platformBgColor }}
              >
                <View
                  className="absolute rounded-full w-6 h-6 opacity-70"
                  style={{ backgroundColor: colors.background, top: 24 * bcrhc, left: 25 * bcrwc }}
                />
                <View
                  className="absolute rounded-full w-6 h-6 opacity-70"
                  style={{ backgroundColor: colors.background, top: 24 * bcrhc, left: 40 * bcrwc }}
                />
                <View
                  className="absolute rounded-lg w-[69px] h-6 opacity-40"
                  style={{ backgroundColor: colors.background, top: 104 * bcrhc, left: -29 * bcrwc }}
                />
                <View
                  className="absolute rounded-lg w-14 h-6 opacity-40"
                  style={{ backgroundColor: colors.background, top: 131 * bcrhc, left: 50 * bcrwc }}
                />
                <View
                  className="absolute rounded-lg w-[69px] h-8 opacity-20"
                  style={{ backgroundColor: colors.background, top: 162 * bcrhc, left: -29 * bcrwc }}
                />
                <View
                  className="absolute rounded-lg w-[69px] h-8 opacity-20"
                  style={{ backgroundColor: colors.background, top: 171 * bcrhc, left: 30 * bcrwc }}
                />
              </View>
            </Animated.View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row justify-between mb-6 mx-2">
          {[
            { label: "Transfer", icon: "swap-horizontal" },
            { label: "Info", icon: "qr-code" },
            { label: "Pay bills", icon: "receipt-outline" },
            { label: "payout", icon: "calendar-outline" },
          ].map(({ label, icon }) => {
            // Safely convert label to a valid key for colors object
            const colorKey = label.replace(/\s+/g, "").toLowerCase();
            const buttonColor = colors[colorKey as keyof typeof colors] || colors.background;

            return (
              <View key={label} className="items-center">
                <View
                  className="w-16 h-14 rounded-full justify-center items-center mb-1"
                  style={{ backgroundColor: buttonColor }}
                >
                  <TouchableOpacity onPress={() => ""}>
                    <Ionicons name={icon as any} size={20} color="#333" />
                  </TouchableOpacity>
                </View>
                <ThemedText type="defautlSmall" colorValue="cardText">
                  {label}
                </ThemedText>
              </View>
            );
          })}
        </View>

        {/* Recent Activities */}
        <View className="flex-row justify-between items-center mb-3">
          <ThemedText type="mainSection" colorValue="primaryText">
            Recent Activities
          </ThemedText>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/main/home/activities",
                params: { name },
              })
            }
          >
            <ThemedText type="semiSmall" colorValue="textTertiary">
              See all {">"}
            </ThemedText>
          </TouchableOpacity>
        </View>
        <ThemedText type="semiSmall" colorValue="textTertiary">
          {date}
        </ThemedText>

        {activities.map((a, i) => (
          <ActivityItem a={a} i={i} key={i}/>
        ))}
      </ScrollView>

      <Animated.View 
        className="absolute bottom-7 right-5 mb-16 p-2.5 rounded-full" 
        style={{ backgroundColor: platformBgColor, transform: [{ translateX: buttonsTranslateX }] }}
      >
        <TouchableOpacity onPress={() => {
          router.push({
          pathname: "/main/account/profile",
          params: { name },
        })}}>
          <IconSymbol name="wheel" size={34} color={colors.background} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
