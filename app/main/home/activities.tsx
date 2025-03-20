import { useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, TextInput, Dimensions } from "react-native";
import { Ionicons, Feather, MaterialIcons } from "@expo/vector-icons";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useThemeColors } from "@/components/ColorSchemeProvider";
import { platformColor } from "@/constants/Colors";
import { ThemedText } from "@/components/ThemedText";
import { useRouter } from "expo-router";
import { Activity } from "@/constants/customTypes";
import { textStyles } from "@/constants/TextStyles";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;
const blackWidth = screenWidth * (90 / 390);
const cardHeight = screenHeight * (272 / 897);
const bcrhc = screenHeight / (897 - 40); //blackCardRelativeHeightConst
const bcrwc = screenWidth / 390; //blackCardRelativeWidthConst

const sampleTitles = [
  "Uber Ride",
  "Grocery Shopping",
  "Salary",
  "Freelance Project",
  "Dining Out",
  "Gym Membership",
  "Refund",
  "Subscription",
];

const sampleSubtitles = [
  "Payment for ride to airport",
  "Bought weekly groceries",
  "Monthly salary received",
  "Freelance web design",
  "Dinner at Italian restaurant",
  "Monthly gym fee",
  "Refund from store",
  "Streaming service payment",
];

const getRandomAmount = () => {
  const value = (Math.random() * 200 + 5).toFixed(2); // $5 ~ $205
  return `$${value}`;
};

const getRandomItem = <T extends unknown>(arr: T[]): T => {
    return arr[Math.floor(Math.random() * arr.length)];
  };

const generateRandomActivities = (count: number): Activity[] => {
  return Array.from({ length: count }, () => ({
    title: getRandomItem(sampleTitles),
    subtitle: getRandomItem(sampleSubtitles),
    amount: getRandomAmount(),
    type: Math.random() > 0.5 ? "in" : "out",
  }));
};

const capitalizeFirst = (str: string): string => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

const ActivityItem: React.FC<{ activity: Activity; index: number }> = ({ activity, index }) => {
    const { colors } = useThemeColors();
  return (
    <View
      key={index}
      className="rounded-xl border border-gray-200 p-1 mb-3 shadow-xs"
      style={{ backgroundColor: colors.background }}
    >
      <View className="flex-row justify-between items-center my-2 pl-3">
        <View className="flex-row items-start">
          <IconSymbol
            name="arrow"
            size={24}
            color={colors.primaryText}
            style={{ transform: [{ rotate: activity.type === "in" ? "-135deg" : "45deg" }] }}
          />
          <View className="flex-col pt-1 pl-2">
            <ThemedText type="defautlSmall" style={{ fontWeight: 600 }} colorValue="cardText">
              {activity.title}
            </ThemedText>
            <ThemedText type="semiSmall" colorValue="textTertiary" className="pt-1">
              {activity.subtitle}
            </ThemedText>
          </View>
        </View>
        <View className="flex-col pt-1 justify-between">
          <Text className={`text-base font-semibold pr-2 ${activity.type === "in" ? "text-green-600" : "text-red-500"}`}>
            {activity.amount}
          </Text>
          <IconSymbol className="self-end" name="detail" size={22} color={colors.primaryText} />
        </View>
      </View>
    </View>
  );
};

export default function ActivitiesPage() {
  const { name } = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useThemeColors();
  const [activities, setActivities] = useState<Activity[]>([]);
  const displayName = typeof name === "string" ? capitalizeFirst(name) : name;

  useEffect(() => {
    fetchData().then(data => setActivities(data));
  }, []);

  const fetchData = async () => {
    // Simulate fetching data from an API
    let result;
    try{
        throw new Error("Error fetching data");
    } catch (error) {
        result = generateRandomActivities(20);
    }
    return result;
  }

  return (
    <View className="" style={{ backgroundColor: colors.background }}>
        <ThemedText type="title" className="self-center" style={{paddingTop: 20}}>
            {`${displayName} Activities`}
        </ThemedText>
        <ScrollView
            className="p-4"
            contentContainerStyle={{ paddingBottom: 80 }}
            showsVerticalScrollIndicator={false}
        >
            {activities.map((activity, index) => (
                <ActivityItem key={index} activity={activity} index={index} />
            ))}
        </ScrollView>
    </View>
  )
}
