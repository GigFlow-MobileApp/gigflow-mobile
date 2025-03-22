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

// Platform-specific interfaces
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
  ride_id?: string;
  bonus_id?: string;
  timestamp: string;
  amount: {
    ride_fare?: number;
    tip?: number;
    bonus?: number;
    wait_time?: number;
    cancellation_fee?: number;
  };
  ride_type?: string;
  distance?: string;
  duration?: string;
  bonus_type?: string;
  description?: string;
  status?: string;
}

// Platform earnings data structure
interface PlatformEarnings {
  account_id: string;
  earnings: (UberEarning | LyftEarning)[];
  total_earnings: number;
  start_date: string;
  end_date: string;
  currency: string;
  // Lyft-specific fields
  ride_earnings?: number;
  bonus_earnings?: number;
  tips?: number;
}

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

// Generate Uber data with full structure
const generateUberData = (count: number): PlatformEarnings => {
  const earnings: UberEarning[] = [];
  let totalEarnings = 0;
  
  // Generate earnings items
  for (let i = 0; i < count; i++) {
    const isTrip = Math.random() > 0.3; // 70% chance of being a trip
    const type = isTrip ? "trip" : "quest_bonus";
    const amount = isTrip 
      ? Math.floor(Math.random() * 30) + 10 
      : Math.floor(Math.random() * 50) + 20;
    
    const baseFare = isTrip ? Math.floor(amount * 0.7) : undefined;
    const surge = isTrip && Math.random() > 0.5 ? Math.floor(Math.random() * 10) : undefined;
    const tip = isTrip ? Math.floor(Math.random() * 5) + 1 : undefined;
    
    const questName = !isTrip ? `Complete ${Math.floor(Math.random() * 20) + 5} trips` : undefined;
    const bonusAmount = !isTrip ? amount : undefined;
    
    const now = new Date();
    now.setMinutes(now.getMinutes() - i * 30); // Spread out times
    
    const earning: UberEarning = {
      payment_id: `${type}_${Math.floor(Math.random() * 1000000)}`,
      amount: amount,
      type: type,
      time: now.toISOString(),
      breakdown: {
        base_fare: baseFare,
        surge: surge,
        tip: tip,
        other_fees: 0,
        quest_name: questName,
        bonus_amount: bonusAmount
      }
    };
    
    earnings.push(earning);
    totalEarnings += amount;
  }
  
  // Create the full data structure
  const today = new Date();
  const startDate = new Date(today);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(today);
  endDate.setHours(23, 59, 59, 999);
  
  return {
    account_id: "550e8400-e29b-41d4-a716-446655440000",
    earnings: earnings,
    total_earnings: totalEarnings,
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
    currency: "USD"
  };
};

// Generate Lyft data with full structure
const generateLyftData = (count: number): PlatformEarnings => {
  const earnings: LyftEarning[] = [];
  let totalEarnings = 0;
  let rideEarnings = 0;
  let bonusEarnings = 0;
  let tipsTotal = 0;
  
  const rideTypes = ["standard", "lux", "xl"];
  const bonusTypes = ["streak_bonus", "power_zone"];
  
  // Generate earnings items
  for (let i = 0; i < count; i++) {
    const isRide = Math.random() > 0.3; // 70% chance of being a ride
    const isCancelled = isRide && Math.random() > 0.9; // 10% chance of cancelled ride
    
    const now = new Date();
    now.setMinutes(now.getMinutes() - i * 25); // Spread out times
    
    if (isRide) {
      const rideType = rideTypes[Math.floor(Math.random() * rideTypes.length)];
      const rideFare = isCancelled ? 0 : Math.floor(Math.random() * 30) + 10;
      const tip = isCancelled ? 0 : Math.floor(Math.random() * 5) + 1;
      const bonus = !isCancelled && Math.random() > 0.7 ? Math.floor(Math.random() * 5) + 1 : 0;
      const waitTime = !isCancelled ? (Math.random() * 2).toFixed(2) : 0;
      const cancellationFee = isCancelled ? 5 : 0;
      
      const distance = !isCancelled ? `${(Math.random() * 15 + 1).toFixed(1)} miles` : undefined;
      const duration = !isCancelled ? `${Math.floor(Math.random() * 40) + 5} minutes` : undefined;
      
      const earning: LyftEarning = {
        ride_id: `lyft_ride_${Math.floor(Math.random() * 1000000)}`,
        timestamp: now.toISOString(),
        amount: {
          ride_fare: rideFare,
          tip: tip,
          bonus: bonus,
          wait_time: parseFloat(waitTime as string),
          cancellation_fee: cancellationFee
        },
        ride_type: rideType,
        distance: distance,
        duration: duration,
        status: isCancelled ? "cancelled" : undefined
      };
      
      earnings.push(earning);
      
      // Update totals
      const itemTotal = rideFare + tip + bonus + parseFloat(waitTime as string) + cancellationFee;
      totalEarnings += itemTotal;
      rideEarnings += rideFare + parseFloat(waitTime as string) + cancellationFee;
      tipsTotal += tip;
      bonusEarnings += bonus;
      
    } else {
      // Bonus
      const bonusType = bonusTypes[Math.floor(Math.random() * bonusTypes.length)];
      const bonusAmount = Math.floor(Math.random() * 20) + 10;
      const description = bonusType === "streak_bonus" 
        ? `Complete ${Math.floor(Math.random() * 5) + 2} rides between ${Math.floor(Math.random() * 12)}AM-${Math.floor(Math.random() * 12) + 12}PM`
        : `Power Zone bonus ${Math.floor(Math.random() * 12)}:30${Math.random() > 0.5 ? 'AM' : 'PM'}-${Math.floor(Math.random() * 12) + 1}:30${Math.random() > 0.5 ? 'AM' : 'PM'}`;
      
      const earning: LyftEarning = {
        bonus_id: `${bonusType}_${Math.floor(Math.random() * 1000000)}`,
        timestamp: now.toISOString(),
        amount: {
          bonus: bonusAmount
        },
        bonus_type: bonusType,
        description: description
      };
      
      earnings.push(earning);
      
      // Update totals
      totalEarnings += bonusAmount;
      bonusEarnings += bonusAmount;
    }
  }
  
  // Create the full data structure
  const today = new Date();
  const startDate = new Date(today);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(today);
  endDate.setHours(23, 59, 59, 999);
  
  return {
    account_id: "550e8400-e29b-41d4-a716-446655440001",
    earnings: earnings,
    total_earnings: totalEarnings,
    ride_earnings: rideEarnings,
    bonus_earnings: bonusEarnings,
    tips: tipsTotal,
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
    currency: "USD"
  };
};

// Generic activity generator for other platforms
const generateRandomActivities = (count: number): Activity[] => {
  const sampleTitles = [
    "Ride",
    "Grocery Delivery",
    "Food Delivery",
    "Freelance Project",
    "Task Completion",
    "Subscription",
  ];

  const sampleSubtitles = [
    "Payment for service",
    "Delivery completed",
    "Project milestone",
    "Task completed",
    "Bonus earned",
    "Service fee",
  ];

  const getRandomItem = <T extends unknown>(arr: T[]): T => {
    return arr[Math.floor(Math.random() * arr.length)];
  };

  const getRandomAmount = () => {
    const value = (Math.random() * 200 + 5).toFixed(2); // $5 ~ $205
    return `$${value}`;
  };

  return Array.from({ length: count }, () => ({
    title: getRandomItem(sampleTitles),
    subtitle: getRandomItem(sampleSubtitles),
    amount: getRandomAmount(),
    type: Math.random() > 0.5 ? "in" : "out",
  }));
};

// Platform-specific data generator
const getPlatformData = (platform: string, count: number = 15): any => {
  switch (platform.toLowerCase()) {
    case 'uber':
      return generateUberData(count);
    case 'lyft':
      return generateLyftData(count);
    default:
      return { 
        activities: generateRandomActivities(count),
        platform: platform
      };
  }
};

const capitalizeFirst = (str: string): string => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Format currency with currency code
const formatCurrency = (amount: number, currency: string = "USD"): string => {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: currency 
  }).format(amount);
};

// Format date for display
const formatDate = (dateString: string, format: 'time' | 'date' = 'time'): string => {
  const date = new Date(dateString);
  
  if (format === 'time') {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  }
};

// Format date range
const formatDateRange = (startDate: string, endDate: string): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // If same day
  if (start.toDateString() === end.toDateString()) {
    return formatDate(startDate, 'date');
  }
  
  return `${formatDate(startDate, 'date')} - ${formatDate(endDate, 'date')}`;
};

// Generic Activity Item
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

// Platform Header Component
const PlatformHeader: React.FC<{ data: PlatformEarnings, platform: string }> = ({ data, platform }) => {
  const { colors } = useThemeColors();
  
  return (
    <View className="mb-4 p-4 rounded-xl border border-gray-200" style={{ backgroundColor: colors.background }}>
      <View className="flex-row justify-between items-center mb-3">
        <ThemedText type="defautlSmall" style={{ fontWeight: 600 }} colorValue="cardText">
          {capitalizeFirst(platform)} Earnings
        </ThemedText>
        <ThemedText type="semiSmall" colorValue="textTertiary">
          {formatDateRange(data.start_date, data.end_date)}
        </ThemedText>
      </View>
      
      <View className="flex-row justify-between items-center mb-2">
        <ThemedText type="title" colorValue="primaryText">
          {formatCurrency(data.total_earnings, data.currency)}
        </ThemedText>
        <View className="bg-gray-100 px-2 py-1 rounded">
          <ThemedText type="semiSmall" colorValue="textTertiary">
            ID: {data.account_id.substring(data.account_id.length - 4)}
          </ThemedText>
        </View>
      </View>
      
      {/* Lyft-specific breakdown */}
      {platform === 'lyft' && data.ride_earnings !== undefined && (
        <View className="flex-row flex-wrap mt-2">
          <View className="mr-4 mb-1">
            <ThemedText type="semiSmall" colorValue="textTertiary">Rides</ThemedText>
            <ThemedText type="defautlSmall" colorValue="cardText">
              {formatCurrency(data.ride_earnings, data.currency)}
            </ThemedText>
          </View>
          <View className="mr-4 mb-1">
            <ThemedText type="semiSmall" colorValue="textTertiary">Bonuses</ThemedText>
            <ThemedText type="defautlSmall" colorValue="cardText">
              {formatCurrency(data.bonus_earnings || 0, data.currency)}
            </ThemedText>
          </View>
          <View className="mb-1">
            <ThemedText type="semiSmall" colorValue="textTertiary">Tips</ThemedText>
            <ThemedText type="defautlSmall" colorValue="cardText">
              {formatCurrency(data.tips || 0, data.currency)}
            </ThemedText>
          </View>
        </View>
      )}
    </View>
  );
};

// Uber Activity Item
const UberActivityItem: React.FC<{ activity: UberEarning; index: number; currency?: string }> = ({ 
  activity, 
  index,
  currency = "USD" 
}) => {
  const { colors } = useThemeColors();
  const isTrip = activity.type === 'trip';
  
  // Determine title and subtitle based on activity type
  const title = isTrip ? 'Uber Trip' : 'Uber Quest Bonus';
  const subtitle = isTrip 
    ? `Trip ID: ${activity.payment_id.substring(activity.payment_id.lastIndexOf('_') + 1)}`
    : activity.breakdown.quest_name || 'Bonus payment';
  
  // Calculate total from breakdown for verification
  const breakdownTotal = Object.values(activity.breakdown)
    .filter(value => typeof value === 'number')
    .reduce((sum, value) => sum + (value as number), 0);
  
  return (
    <View
      key={index}
      className="rounded-xl border border-gray-200 p-3 mb-3 shadow-xs"
      style={{ backgroundColor: colors.background }}
    >
      <View className="flex-row justify-between items-center mb-2">
        <View className="flex-row items-start">
          <IconSymbol
            name="arrow"
            size={24}
            color={colors.primaryText}
            style={{ transform: [{ rotate: "-135deg" }] }}
          />
          <View className="flex-col pl-2">
            <ThemedText type="defautlSmall" style={{ fontWeight: 600 }} colorValue="cardText">
              {title}
            </ThemedText>
            <ThemedText type="semiSmall" colorValue="textTertiary">
              {subtitle}
            </ThemedText>
          </View>
        </View>
        <View className="flex-col items-end">
          <Text className="text-base font-semibold text-green-600">
            {formatCurrency(activity.amount, currency)}
          </Text>
          <ThemedText type="semiSmall" colorValue="textTertiary">
            {formatDate(activity.time)}
          </ThemedText>
        </View>
      </View>
      
      {/* Breakdown section */}
      <View className="mt-2 pt-2 border-t border-gray-200">
        <ThemedText type="semiSmall" style={{ fontWeight: 600 }} colorValue="cardText">
          Payment Breakdown
        </ThemedText>
        
        {isTrip ? (
          <View className="mt-1">
            {activity.breakdown.base_fare !== undefined && (
              <View className="flex-row justify-between">
                <ThemedText type="semiSmall" colorValue="textTertiary">Base Fare</ThemedText>
                <ThemedText type="semiSmall" colorValue="textTertiary">{formatCurrency(activity.breakdown.base_fare, currency)}</ThemedText>
              </View>
            )}
            {activity.breakdown.surge !== undefined && activity.breakdown.surge > 0 && (
              <View className="flex-row justify-between">
                <ThemedText type="semiSmall" colorValue="textTertiary">Surge</ThemedText>
                <ThemedText type="semiSmall" colorValue="textTertiary">{formatCurrency(activity.breakdown.surge, currency)}</ThemedText>
              </View>
            )}
            {activity.breakdown.tip !== undefined && activity.breakdown.tip > 0 && (
              <View className="flex-row justify-between">
                <ThemedText type="semiSmall" colorValue="textTertiary">Tip</ThemedText>
                <ThemedText type="semiSmall" colorValue="textTertiary">{formatCurrency(activity.breakdown.tip, currency)}</ThemedText>
              </View>
            )}
          </View>
        ) : (
          <View className="mt-1">
            <View className="flex-row justify-between">
              <ThemedText type="semiSmall" colorValue="textTertiary">Bonus Amount</ThemedText>
              <ThemedText type="semiSmall" colorValue="textTertiary">{formatCurrency(activity.breakdown.bonus_amount || 0, currency)}</ThemedText>
            </View>
          </View>
        )}
      </View>
      
      <View className="flex-row justify-end mt-2">
        <IconSymbol name="detail" size={22} color={colors.primaryText} />
      </View>
    </View>
  );
};

// Lyft Activity Item
const LyftActivityItem: React.FC<{ activity: LyftEarning; index: number; currency?: string }> = ({ 
  activity, 
  index,
  currency = "USD"
}) => {
  const { colors } = useThemeColors();
  const isRide = activity.ride_id !== undefined;
  const isBonus = activity.bonus_id !== undefined;
  const isCancelled = activity.status === 'cancelled';
  
  // Calculate total amount
  const totalAmount = Object.values(activity.amount)
    .filter(value => typeof value === 'number')
    .reduce((sum, value) => sum + (value as number), 0);
  
  // Determine title and subtitle
  let title = '';
  let subtitle = '';
  
  if (isRide) {
    title = isCancelled ? 'Cancelled Ride' : `Lyft ${capitalizeFirst(activity.ride_type || '')} Ride`;
    subtitle = isCancelled 
      ? 'Rider cancelled' 
      : `${activity.distance || ''} ${activity.duration ? `• ${activity.duration}` : ''}`;
  } else if (isBonus) {
    title = `Lyft ${activity.bonus_type?.split('_').map(capitalizeFirst).join(' ') || 'Bonus'}`;
    subtitle = activity.description || '';
  }
  
  return (
    <View
      key={index}
      className="rounded-xl border border-gray-200 p-3 mb-3 shadow-xs"
      style={{ backgroundColor: colors.background }}
    >
      <View className="flex-row justify-between items-center mb-2">
        <View className="flex-row items-start">
          <IconSymbol
            name="arrow"
            size={24}
            color={colors.primaryText}
            style={{ transform: [{ rotate: "-135deg" }] }}
          />
          <View className="flex-col pl-2">
            <ThemedText type="defautlSmall" style={{ fontWeight: 600 }} colorValue="cardText">
              {title}
            </ThemedText>
            <ThemedText type="semiSmall" colorValue="textTertiary">
              {subtitle}
            </ThemedText>
          </View>
        </View>
        <View className="flex-col items-end">
          <Text className="text-base font-semibold text-green-600">
            {formatCurrency(totalAmount, currency)}
          </Text>
          <ThemedText type="semiSmall" colorValue="textTertiary">
            {formatDate(activity.timestamp)}
          </ThemedText>
        </View>
      </View>
      
      {/* Payment breakdown */}
      <View className="mt-2 pt-2 border-t border-gray-200">
        <ThemedText type="semiSmall" style={{ fontWeight: 600 }} colorValue="cardText">
          Payment Breakdown
        </ThemedText>
        
        {isRide ? (
          <View className="mt-1">
            {activity.amount.ride_fare !== undefined && activity.amount.ride_fare > 0 && (
              <View className="flex-row justify-between">
                <ThemedText type="semiSmall" colorValue="textTertiary">Ride Fare</ThemedText>
                <ThemedText type="semiSmall" colorValue="textTertiary">{formatCurrency(activity.amount.ride_fare, currency)}</ThemedText>
              </View>
            )}
            {activity.amount.tip !== undefined && activity.amount.tip > 0 && (
              <View className="flex-row justify-between">
                <ThemedText type="semiSmall" colorValue="textTertiary">Tip</ThemedText>
                <ThemedText type="semiSmall" colorValue="textTertiary">{formatCurrency(activity.amount.tip, currency)}</ThemedText>
              </View>
            )}
            {activity.amount.bonus !== undefined && activity.amount.bonus > 0 && (
              <View className="flex-row justify-between">
                <ThemedText type="semiSmall" colorValue="textTertiary">Bonus</ThemedText>
                <ThemedText type="semiSmall" colorValue="textTertiary">{formatCurrency(activity.amount.bonus, currency)}</ThemedText>
              </View>
            )}
            {activity.amount.wait_time !== undefined && activity.amount.wait_time > 0 && (
              <View className="flex-row justify-between">
                <ThemedText type="semiSmall" colorValue="textTertiary">Wait Time</ThemedText>
                <ThemedText type="semiSmall" colorValue="textTertiary">{formatCurrency(activity.amount.wait_time, currency)}</ThemedText>
              </View>
            )}
            {activity.amount.cancellation_fee !== undefined && activity.amount.cancellation_fee > 0 && (
              <View className="flex-row justify-between">
                <ThemedText type="semiSmall" colorValue="textTertiary">Cancellation Fee</ThemedText>
                <ThemedText type="semiSmall" colorValue="textTertiary">{formatCurrency(activity.amount.cancellation_fee, currency)}</ThemedText>
              </View>
            )}
          </View>
        ) : (
          <View className="mt-1">
            <View className="flex-row justify-between">
              <ThemedText type="semiSmall" colorValue="textTertiary">Bonus</ThemedText>
              <ThemedText type="semiSmall" colorValue="textTertiary">{formatCurrency(activity.amount.bonus || 0, currency)}</ThemedText>
            </View>
          </View>
        )}
      </View>
      
      <View className="flex-row justify-end mt-2">
        <IconSymbol name="detail" size={22} color={colors.primaryText} />
      </View>
    </View>
  );
};

export default function ActivitiesPage() {
  const { name } = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useThemeColors();
  
  const [platformData, setPlatformData] = useState<PlatformEarnings | null>(null);
  const displayName = typeof name === "string" ? capitalizeFirst(name) : name;
  const platform = typeof name === "string" ? name.toLowerCase() : "";

  useEffect(() => {
    fetchData().then(data => setPlatformData(data));
  }, []);

  const fetchData = async () => {
    // Simulate fetching data from an API
    let result;
    try {
      throw new Error("Error fetching data");
    } catch (error) {
      // Use platform-specific data generator
      result = getPlatformData(platform, 10);
    }
    return result;
  }

  // Render appropriate activity item based on platform
  const renderActivity = (activity: UberEarning | LyftEarning, index: number) => {
    if (platform === 'uber') {
      return <UberActivityItem 
        key={index} 
        activity={activity as UberEarning} 
        index={index} 
        currency={platformData?.currency} 
      />;
    } else if (platform === 'lyft') {
      return <LyftActivityItem 
        key={index} 
        activity={activity as LyftEarning} 
        index={index} 
        currency={platformData?.currency} 
      />;
    }
    
    // Fallback (should never reach here with proper platform detection)
    return null;
  };

  // If data is still loading
  if (!platformData) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: colors.background }}>
        <ThemedText type="defautlSmall" colorValue="cardText">Loading...</ThemedText>
      </View>
    );
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
        {/* Platform header with metadata */}
        <PlatformHeader data={platformData} platform={platform} />
        
        {/* Activity list */}
        {platformData.earnings.map((activity, index) => renderActivity(activity, index))}
      </ScrollView>
    </View>
  );
}
