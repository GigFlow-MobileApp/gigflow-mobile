import { useLocalSearchParams } from "expo-router";
import React, { useState, useEffect, useRef} from "react";
import { View, ScrollView, Dimensions, ActivityIndicator, TouchableOpacity, Animated, Easing, Platform, TextInput } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Config from "@/constants/config";
import { ThemedText } from "@/components/ThemedText";
import { useRouter } from "expo-router";
import { useThemeColors } from "@/components/ColorSchemeProvider";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { platformColor } from "@/constants/Colors";
import {SlideInView} from "@/components/FadeInView";


type PlatformName = keyof typeof platformColor;

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;
const blackWidth = screenWidth * (90 / 390);
const bcrhc = screenHeight / (897 - 40); //blackCardRelativeHeightConst
const bcrwc = screenWidth / 390; //blackCardRelativeWidthConst

// Helper function to capitalize first letter
const capitalizeFirst = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

// Helper function to format date
function formatDateToLabel(date: Date): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const year = date.getFullYear();
  const month = months[date.getMonth()];
  const day = date.getDate();
  return `${year} ${month} ${day}`;
}

const renderActivity = (activity: any, index: number, platform: string, platformColor: string) => {
  // Default values in case fields are undefined
  const { colors } = useThemeColors();
  const amount = activity.amount || activity.total || 0;
  const timestamp = activity.timestamp || activity.created_at || activity.time || new Date().toISOString();
  const type = activity.type || activity.ride_type || "trip";

  const date = new Date(timestamp.split('.')[0]); // Remove microseconds

  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours === 0 ? 12 : hours;

  const formattedTime = `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  // console.log(formattedTime);

  return (
    <SlideInView i={index} direction="left" key={index}>
      <View 
        key={index} className="mb-2 px-4 py-2 rounded-lg " 
        style={{ 
          backgroundColor: colors.backgroundCard,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        }}
      >
        <View className="flex-row items-center mb-2">
          {/* Name Icon*/}
          <View className="flex-col p-2 self-start">
            <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: platformColor}}>
              <ThemedText type="btnText" colorValue="btnText">{activity.quest_name.charAt(0).toUpperCase()}</ThemedText>
            </View>
          </View>
          
          {/* Payment Description */}
          <View className="flex-col justify-start flex-1">
            <View className="flex-row justify-between mb-1 mr-2">
              <ThemedText type="defautlSmall" colorValue="primaryText" style={{ fontWeight: 700 }}>
                Trip
              </ThemedText>
              <ThemedText type="defautlSmall" colorValue="textTertiary">
                {formattedTime}
              </ThemedText>
            </View>
            <View className="flex-row justify-between mb-1 mr-1">
              <ThemedText type="semiSmall" colorValue="cardText">
                {`${capitalizeFirst(platform)} Payment`}
              </ThemedText>
              <ThemedText type="defautlSmall" colorValue="primaryText" style={{ fontWeight: 700 }}>
                ${amount}
              </ThemedText>
            </View>
            <View className="flex-row justify-between my-1">
              <View className="flex-row">
                <ThemedText 
                  type="defautlSmall" className="rounded-2xl px-3 py-1 mr-3" 
                  style={{ backgroundColor: "#FEF6F1", color: "#EC7735", fontWeight: 700 }}
                >
                  {capitalizeFirst(activity.payment_type)}
                </ThemedText>
                <ThemedText 
                  type="defautlSmall" className="rounded-2xl px-3 py-1" 
                  style={{ backgroundColor: "#FEF6F1", color: "#EC7735"}}
                >
                  Bonus: ${activity.bonus_amount}
                </ThemedText>
              </View>
              <ThemedText 
                type="defautlSmall" className="rounded-2xl px-3 py-1" 
                style={{ backgroundColor: "#DEE1E6", color: "#379AE6", fontWeight: 700 }}
              >
                Tips: ${activity.tip}
              </ThemedText>
            </View>
          </View>
        </View>
        {/* id */}
        <View className="flex-row justify-between items-center">
          <ThemedText type="semiSmall" colorValue="cardText" style={{ fontSize: 11 }}>
            Payment id: {activity.payment_id}
          </ThemedText>
          <ThemedText 
            type="defautlSmall" className="rounded-2xl px-3 py-1" 
            style={{ backgroundColor: "#DEE1E6", color: "#379AE6", fontWeight: 700 }}
          >
            Surge: ${activity.surge}
          </ThemedText>
        </View>
      </View>
    </SlideInView>
  );
};

function formatDateToDots(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 0-indexed
  const day = date.getDate();
  return `${year}.${month}.${day}`;
}

export default function ActivitiesPage() {
  const { name, available } = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useThemeColors();

  const [platformData, setPlatformData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<Array<string>>([]);
  const groupedActivities: Record<string, any[]> = {};

  

  const displayName = typeof name === "string" ? capitalizeFirst(name) : "";
  const platform = typeof name === "string" ? name.toLowerCase() : "";

  useEffect(() => {
    fetchData();
  }, [platform]);

  const animatedElevation = useRef(new Animated.Value(0)).current;

  const platformName = typeof name === "string" && name in platformColor ? (name as PlatformName) : "uber";
  // Get the platform color
  const platformBgColor =
    platformName in platformColor ? platformColor[platformName as keyof typeof platformColor] : platformColor.uber;

  // Start animations when component mounts
  useEffect(() => {
    Animated.timing(animatedElevation, {
      toValue: 8,
      delay: 500,
      duration: 1200,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    const userToken = await AsyncStorage.getItem("userToken");
      if (!userToken) {
        throw new Error("Authentication token not found");
      }

    try {
      const headers = {
        Authorization: `Bearer ${userToken}`,
        Accept: "application/json",
      };

      let response;
      if (platform === "uber") {
        response = await fetch(`${Config.apiBaseUrl}/api/v1/earnings/db/uber`, { headers });
      } else if (platform === "lyft") {
        response = await fetch(`${Config.apiBaseUrl}/api/v1/earnings/db/lyft`, { headers });
      } else {
        throw new Error(`${platform} API not implemented yet`);
      }

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      // console.log(`${platform} activities data:`, data); // Debug log

      const timestamps = data.map((activity: any) => activity.created_at);
      const formattedDates = timestamps.map((ts: string) => {
        const date = new Date(ts.split('.')[0]);
        return formatDateToDots(date);
      });
      const uniqueDates: string[] = Array.from(new Set(formattedDates));

      uniqueDates.sort((a, b) => {
        const d1 = new Date(a.replace(/\./g, '-'));
        const d2 = new Date(b.replace(/\./g, '-'));
        return d1.getTime() - d2.getTime();
      });

      // Set it to state
      setDateRange(uniqueDates);

      // Ensure we're setting an array of activities
      const activities = Array.isArray(data) ? data : data.earnings || [];
      setPlatformData(activities);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch data");
      
      setPlatformData([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.brandColor} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <ThemedText type="default" colorValue="badBanner">
          {error}
        </ThemedText>
      </View>
    );
  }

  platformData.forEach((activity) => {
    const rawDate = activity.created_at.split('.')[0];
    const date = formatDateToLabel(new Date(rawDate));
    
    if (!groupedActivities[date]) {
      groupedActivities[date] = [];
    }
    groupedActivities[date].push(activity);
  });

  return (
    <ScrollView className="flex-1">
      {/* Header */}
      <View className="flex-row justify-between items-center p-4" style={{backgroundColor: colors.background}}>
        <View className="flex-row justify-start">
          <TouchableOpacity onPress={() => router.back()} className="self-start">
            <IconSymbol name="back" size={22} color={colors.textTertiary} className="p-2" />
          </TouchableOpacity>
          <ThemedText type="title" className="ml-3 pt-0.5">{displayName} Activities</ThemedText>
        </View>
        <TouchableOpacity onPress={fetchData} className="self-end">
          <IconSymbol name="funnel" size={28} color={colors.primaryText} className="" style={{
            transform: [{ rotateY: "180deg"}],
          }}/>  
        </TouchableOpacity>
      </View>
      
      {/* Card */}
      {/* Front side of the card (visible after flip) */}
      <Animated.View
        className="relative flex-1 h-[141px] rounded-xl flex-row justify-between items-center mx-2 mt-2"
        style={{
          backgroundColor: colors.background,
          elevation: Platform.OS === 'android' ? animatedElevation : undefined,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 6,
          zIndex: 2,
        }}
      >
        <View className="flex-1 h-full flex-col p-4 pt-6 justify-between">
          <View className="flex-row items-center w-full justify-between pl-2">
            <ThemedText 
              type="defautlSmall" colorValue="cardText" className="text-center" 
              style={{ fontWeight: 700 }}
            >
              {"Total\nEarning"}
            </ThemedText>
            <ThemedText type="title" colorValue="primaryText">
              ${Number(available).toFixed(2)}
            </ThemedText>
          </View>
          <View className="flex-row items-center px-4">
            <IconSymbol name="clock" size={18} color={colors.textTertiary} className="" />
            <ThemedText type="defautlSmall" colorValue="primaryText" className="ml-2" style={{ fontWeight: 600 }}>
              {dateRange.length === 1 ? dateRange[0] : `${dateRange[0]} ~ ${dateRange[dateRange.length - 1]}`}
            </ThemedText>
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
            style={{ backgroundColor: colors.background, top: 55 * bcrhc, left: -29 * bcrwc }}
          />
          <View
            className="absolute rounded-lg w-14 h-6 opacity-40"
            style={{ backgroundColor: colors.background, top: 82 * bcrhc, left: 50 * bcrwc }}
          />
          <View
            className="absolute rounded-lg w-[69px] h-8 opacity-20"
            style={{ backgroundColor: colors.background, top: 115 * bcrhc, left: -29 * bcrwc }}
          />
          <View
            className="absolute rounded-lg w-[69px] h-8 opacity-20"
            style={{ backgroundColor: colors.background, top: 124 * bcrhc, left: 30 * bcrwc }}
          />
        </View>
      </Animated.View>
      
      {/* Activities Lists */}
      <View className="mx-2">
        {platformData.length === 0 ? (
          <View className="flex-1 justify-center items-center py-8">
            <ThemedText type="default">No activities found</ThemedText>
          </View>
        ) : (
          Object.entries(groupedActivities).map(([date, activities]) => {
            // console.log("Activities for date:", date, activities); // Debug log
            return (
            <View key={date} className="mb-4">
              {/* Section Header */}
              <ThemedText
                type="defautlSmall"
                colorValue="menuItemText"
                className="my-2 ml-4"
                style={{ fontSize: 16 }}
              >
                {date}
              </ThemedText>

              {/* Activities under this date */}
              {activities.map((activity, index) =>
                renderActivity(activity, index, platform, platformBgColor)
              )}
            </View>
          )})
        )}
      </View>
    </ScrollView>
  );
}
