import { useLocalSearchParams } from "expo-router";
import React, { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, TextInput, Dimensions, Animated, Easing, Platform } from "react-native";
import { Ionicons, Feather, MaterialIcons } from "@expo/vector-icons";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useThemeColors } from "@/components/ColorSchemeProvider";
import { platformColor } from "@/constants/Colors";
import { ThemedText } from "@/components/ThemedText";
import { useRouter } from "expo-router";
import { textStyles } from "@/constants/TextStyles";
import { Activity } from "@/constants/customTypes";
import { SlideInView } from "@/components/FadeInView";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from '@/constants/config';

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

const ActivityItem: React.FC<ActivityItemProps> = ({ a, i }) => {
  const { colors } = useThemeColors();

  return (
    <SlideInView i={i}>
      <View
        key={i}
        className="rounded-xl border border-gray-200 p-1 mb-3 shadow-xs"
        style={{ backgroundColor: colors.background }}
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
      </View>
    </SlideInView>
  );
};

interface UberEarning {
  payment_id: string;
  amount: number;
  type: string;
  time: string;
  breakdown: {
    base_fare?: number;
    surge?: number;
    tip?: number;
    other_fees?: number;
    quest_name?: string;
    bonus_amount?: number;
  };
}

interface LyftEarning {
  id: string;
  account_id: string;
  ride_id: string | null;
  bonus_id: string | null;
  timestamp: string;
  ride_type: string | null;
  distance: string | null;
  duration: string | null;
  status: string | null;
  bonus_type: string | null;
  description: string | null;
  ride_fare: number | null;
  tip: number | null;
  bonus: number | null;
  wait_time: number | null;
  cancellation_fee: number | null;
  total_amount: number;
}

interface UberSummary {
  account_id: string;
  total_earnings: number;
  total_trips: number;
  total_online_hours: number;
  total_quests_completed: number;
  currency: string;
}

interface LyftSummary {
  account_id: string;
  start_date: string;
  end_date: string;
  total_earnings: number;
  total_tips: number;
  total_bonuses: number;
  total_ride_fares: number;
  total_cancellation_fees: number;
  currency: string;
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
  const buttonsTranslateX = useState(new Animated.Value(100))[0];
  const animatedElevation = useRef(new Animated.Value(0)).current;

  // Start animations when component mounts
  useEffect(() => {
    // Run all animations simultaneously
    Animated.timing(cardFlipAnimation, {
      toValue: 1,
      duration: 800,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start(() => {
      // Gradually restore elevation (fake animation)
      Animated.timing(animatedElevation, {
        toValue: 8,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false, // must be false for style props like elevation
      }).start();
  
      Animated.spring(buttonsTranslateX, {
        toValue: 0,
        friction: 5,
        tension: 40,
        useNativeDriver: false,
      }).start();
    });
  }, []);

  // Calculate flip animation interpolations
  const frontFlipRotation = cardFlipAnimation.interpolate({
    inputRange: [0, 0.5, 0.501, 1],
    outputRange: ["0deg", "90deg", "-90deg", "0deg"],
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
  const buttonPos = buttonsTranslateX.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  // useEffect to fetch account data and set default values if API fails
  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        const endDate = new Date(2025, 12, 31);
        const startDate = new Date(1990, 0, 1);
        startDate.setDate(startDate.getDate() - 7);

        const userToken = await AsyncStorage.getItem('userToken');
        const headers = {
          'Authorization': `Bearer ${userToken}`,
          'Accept': 'application/json',
        };

        if (name === 'uber') {
          // Fetch Uber summary data
          const summaryResponse = await fetch(
            `${Config.apiBaseUrl}/api/v1/earnings/db/uber/summary?` + 
            `start_date=${startDate.toISOString()}&` +
            `end_date=${endDate.toISOString()}`,
            { headers }
          );

          if (!summaryResponse.ok) {
            throw new Error(`Failed to fetch Uber summary: ${summaryResponse.statusText}`);
          }

          const summaryData: UberSummary = await summaryResponse.json();
          
          // Fetch Uber earnings data
          const earningsResponse = await fetch(
            `${Config.apiBaseUrl}/api/v1/earnings/db/uber?` + 
            `start_date=${startDate.toISOString()}&` +
            `end_date=${endDate.toISOString()}&` +
            `limit=3`, // Make sure this is set to 3
            { headers }
          );

          if (!earningsResponse.ok) {
            throw new Error(`Failed to fetch Uber earnings: ${earningsResponse.statusText}`);
          }

          const earningsData: UberEarning[] = await earningsResponse.json();

          // Add console.log to debug the response
          console.log('Uber earnings data:', earningsData);

          // Set account data
          setAvailable(summaryData.total_earnings);
          
          // Calculate pending from last 24h
          const pendingAmount = earningsData
            .filter(earning => 
              new Date(earning.time).getTime() > Date.now() - 24 * 60 * 60 * 1000
            )
            .reduce((sum, earning) => sum + earning.amount, 0);
          setPending(pendingAmount);

          setAccountId(summaryData.account_id);
          setDate(new Date().toLocaleDateString());

          // Transform Uber activities with proper null checks
          const transformedActivities = earningsData.map(earning => {
            // Add console.log to debug each earning
            console.log('Processing earning:', earning);

            if (earning.type === 'trip') {
              const breakdown = [
                `Base: $${earning.breakdown?.base_fare?.toFixed(2) || '0.00'}`,
                earning.breakdown?.surge ? `Surge: $${earning.breakdown.surge.toFixed(2)}` : null,
                earning.breakdown?.tip ? `Tip: $${earning.breakdown.tip.toFixed(2)}` : null,
                earning.breakdown?.other_fees ? `Other: $${earning.breakdown.other_fees.toFixed(2)}` : null,
              ].filter(Boolean).join(' + ');

              return {
                title: 'Uber Trip',
                subtitle: breakdown || 'Trip payment',
                amount: `$${earning.amount.toFixed(2)}`,
                type: 'in' as const
              };
            } else {
              return {
                title: (earning.breakdown?.quest_name) || 'Uber Payment',
                subtitle: `Bonus payment: $${earning.breakdown?.bonus_amount?.toFixed(2) || earning.amount.toFixed(2)}`,
                amount: `$${earning.amount.toFixed(2)}`,
                type: 'in' as const
              };
            }
          });

          // Add console.log to debug transformed activities
          console.log('Transformed activities:', transformedActivities);

          // Make sure we're setting all activities
          setActivities(transformedActivities);

        } else if (name === 'lyft') {
          // Fetch Lyft summary data
          const summaryResponse = await fetch(
            `${Config.apiBaseUrl}/api/v1/earnings/db/lyft/summary?` + 
            `start_date=${startDate.toISOString()}&` +
            `end_date=${endDate.toISOString()}`,
            { headers }
          );

          if (!summaryResponse.ok) {
            throw new Error(`Failed to fetch Lyft summary: ${summaryResponse.statusText}`);
          }

          const summaryData: LyftSummary = await summaryResponse.json();
          
          // Fetch Lyft earnings data
          const earningsResponse = await fetch(
            `${Config.apiBaseUrl}/api/v1/earnings/db/lyft?` + 
            `start_date=${startDate.toISOString()}&` +
            `end_date=${endDate.toISOString()}&` +
            `limit=3`,
            { headers }
          );

          if (!earningsResponse.ok) {
            throw new Error(`Failed to fetch Lyft earnings: ${earningsResponse.statusText}`);
          }

          const earningsData: LyftEarning[] = await earningsResponse.json();

          // Set account data
          setAvailable(summaryData.total_earnings);
          
          // Calculate pending from last 24h
          const pendingAmount = earningsData
            .filter(earning => 
              new Date(earning.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000
            )
            .reduce((sum, earning) => sum + earning.total_amount, 0);
          setPending(pendingAmount);

          setAccountId(summaryData.account_id);
          setDate(new Date().toLocaleDateString());

          // Transform Lyft activities
          const transformedActivities = earningsData.map(earning => {
            if (earning.ride_id) {
              const fareBreakdown = [
                `Fare: $${earning.ride_fare?.toFixed(2) || '0.00'}`,
                earning.tip ? `Tip: $${earning.tip.toFixed(2)}` : null,
                earning.wait_time ? `Wait: $${earning.wait_time.toFixed(2)}` : null,
                earning.cancellation_fee ? `Cancel: $${earning.cancellation_fee.toFixed(2)}` : null
              ].filter(Boolean).join(' + ');

              return {
                title: `Lyft ${earning.ride_type?.charAt(0).toUpperCase()}${earning.ride_type?.slice(1) || 'Ride'}`,
                subtitle: `${earning.distance || ''} ${earning.duration ? `• ${earning.duration}` : ''}\n${fareBreakdown}`,
                amount: `$${earning.total_amount.toFixed(2)}`,
                type: 'in' as const
              };
            } else {
              return {
                title: `Lyft ${earning.bonus_type?.split('_').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 'Bonus'}`,
                subtitle: earning.description || 'Bonus payment',
                amount: `$${earning.total_amount.toFixed(2)}`,
                type: 'in' as const
              };
            }
          });

          setActivities(transformedActivities);
        } else {
          throw new Error(`${name} API not implemented yet`);
        }
      } catch (error) {
        console.error("Error fetching account data:", error);

        // Fallback values
        setAvailable(850);
        setPending(350);
        setAccountId("2412 7512 3412 3456");
        setDate(new Date().toLocaleDateString());

        setActivities([
          {
            title: "Recent Activity",
            subtitle: "No recent activities",
            amount: "$0.00",
            type: "in",
          }
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
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <View className="flex-row justify-between items-center p-4" style={{backgroundColor: colors.background}}>
        <View className="flex-row justify-start">
          <TouchableOpacity onPress={() => router.back()} className="self-start">
            <IconSymbol name="back" size={22} color={colors.textTertiary} className="p-2" />
          </TouchableOpacity>
          <ThemedText type="title" className="ml-3 pt-0.5">Your Balance</ThemedText>
        </View>
        <TouchableOpacity onPress={() => ""} className="self-end">
          <IconSymbol name="notifications" size={24} color={colors.primaryText} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="h-auto px-4 mt-2">
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
                elevation: 0,
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
              <View
                className="absolute rounded-lg w-16 h-4 opacity-40"
                style={{ backgroundColor: "white", top: 15, left: 20 }}
              />
              <View
                className="absolute rounded-lg w-24 h-4 opacity-40"
                style={{ backgroundColor: "white", top: 15, right: 20 }}
              />
              <View
                className="absolute rounded-lg w-20 h-4 opacity-30"
                style={{ backgroundColor: "white", top: 35, left: 30 }}
              />
              <View
                className="absolute rounded-lg w-32 h-4 opacity-30"
                style={{ backgroundColor: "white", top: 55, left: 20 }}
              />
              <View
                className="absolute rounded-lg w-16 h-4 opacity-20"
                style={{ backgroundColor: "white", top: 55, right: 30 }}
              />
              <View
                className="absolute rounded-lg w-24 h-4 opacity-20"
                style={{ backgroundColor: "white", bottom: 15, left: 40 }}
              />
            </Animated.View>

            {/* Front side of the card (visible after flip) */}
            <Animated.View
              className="absolute w-full h-full rounded-xl flex-row justify-between items-center"
              style={{
                backgroundColor: colors.background,
                elevation: Platform.OS === 'android' ? animatedElevation : undefined,
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
                pathname: "/main/account/activities",
                params: { name, available},
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
          <ActivityItem a={a} i={i} key={i} />
        ))}
      </ScrollView>

      <Animated.View
        className="absolute bottom-7 right-5 mb-16 p-2.5 rounded-full"
        style={{ backgroundColor: platformBgColor, transform: [{ translateX: buttonsTranslateX }] }}
      >
        <TouchableOpacity
          onPress={() => {
            router.push({
              pathname: "/main/account/profile",
              params: { name },
            });
          }}
        >
          <IconSymbol name="wheel" size={34} color={colors.background} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
