import { useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
import { View, Image, TouchableOpacity, Dimensions, ScrollView } from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useThemeColors } from "@/components/ColorSchemeProvider";
import { ThemedText } from "@/components/ThemedText";
import { useRouter } from "expo-router";
import { Activity } from "@/constants/customTypes";
import { platformColor } from "@/constants/Colors";
import { VictoryLine } from "victory-native";
import { Icon } from "react-native-vector-icons/Icon";
import { NumberProp } from "react-native-svg";
import FadeInView, { SlideInView } from "@/components/FadeInView";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from '@/constants/config';

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;
const cardWidth = screenWidth - 60 - 24 - 12;
const cardHeight = screenHeight * (195 / (897 - 40 - 64));

type PlatformName = keyof typeof logoMap;
const logoMap = {
  uber: require("@/assets/images/logos/uber.png"),
  lyft: require("@/assets/images/logos/lyft.png"),
  doordash: require("@/assets/images/logos/doordash.png"),
  upwork: require("@/assets/images/logos/upwork.png"),
  fiverr: require("@/assets/images/logos/fiverr.png"),
};

const capitalizeFirst = (str: string): string => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const InfoItem = ({ icon, text, value, index }: { icon: string; text: string; value: string; index: number }) => (
  <FadeInView index={index}>
    <View className="flex-row items-center my-2">
      {/* <View> */}
      <IconSymbol name={icon} size={24} color="#000" className="flex-col self-start pt-1" />
      {/* </View> */}
      <View className="flex-col items-start ml-1">
        <ThemedText colorValue="primaryText" type="defautlSmall" className="p-1">
          {text}
        </ThemedText>
        <ThemedText colorValue="textTertiary" type="defautlSmall" className="p-1">
          {value}
        </ThemedText>
      </View>
    </View>
  </FadeInView>
);

interface UberProfile {
  account_id: string;
  driver_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  rating: number;
  total_trips: number;
  activation_status: string;
  partner_type: string;
  driver_status: string;
  onboarding_status: string;
  last_updated: string;
  documents: Array<{
    document_id: string;
    type: string;
    status: string;
    expiration_date: string;
  }>;
  vehicles: Array<{
    vehicle_id: string;
    make: string;
    model: string;
    year: number;
    license_plate: string;
    status: string;
  }>;
}

interface LyftProfile {
  account_id: string;
  driver_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  rating: number;
  total_rides: number;
  driver_status: string;
  approval_status: string;
  vehicles: Array<{
    vehicle_id: string;
    make: string;
    model: string;
    year: number;
    license_plate: string;
    status: string;
    color: string;
  }>;
  region: string;
  driver_mode: string;
  account_status: string;
  last_updated: string;
}

export default function ProfilePage() {
  const { name } = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useThemeColors();

  // State for profile data
  const [profileData, setProfileData] = useState<UberProfile | LyftProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        if (!userToken) {
          throw new Error('Authentication token not found');
        }

        const headers = {
          'Authorization': `Bearer ${userToken}`,
          'Accept': 'application/json',
        };

        const platform = name as string;
        const response = await fetch(
          `${Config.apiBaseUrl}/api/v1/profiles/${platform}/me`,
          { headers }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch ${platform} profile`);
        }

        const data = await response.json();
        setProfileData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch profile');
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [name]);

  // Function to convert rating to hearts/stars
  const ratingToHearts = (ratingValue: string): JSX.Element[] => {
    const numRating = parseFloat(ratingValue);
    const fullHearts = Math.floor(numRating);
    const hasHalfHeart = numRating % 1 >= 0.5;
    const emptyHearts = 5 - fullHearts - (hasHalfHeart ? 1 : 0);
    const size = 24;

    const hearts: JSX.Element[] = [];

    // Add full hearts
    for (let i = 0; i < fullHearts; i++) {
      hearts.push(<IconSymbol key={`full-${i}`} name="heart.fill" size={size} color="#DE3B40" />);
    }

    // Add half heart if needed
    if (hasHalfHeart) {
      hearts.push(<IconSymbol key="half" name="halfHeart" size={size} color="#DE3B40" />);
    }

    // Add empty hearts
    for (let i = 0; i < emptyHearts; i++) {
      hearts.push(<IconSymbol key={`empty-${i}`} name="heart" size={size} color="#DE3B40" />);
    }

    return hearts;
  };

  const platformName = typeof name === "string" && name in logoMap ? (name as PlatformName) : "uber";
  const platformBgColor =
    platformName in platformColor ? platformColor[platformName as keyof typeof platformColor] : platformColor.uber;
  const logoSource = logoMap[platformName];

  // State for each InfoItem's value
  const [email, setEmail] = useState<string>("user@example.com");
  const [phoneNumber, setPhoneNumber] = useState<string>("+1 (555) 123-4567");
  const [rating, setRating] = useState<string>("4.8");
  const [partnerType, setPartnerType] = useState<string>("Driver");
  const [availableTime, setAvailableTime] = useState<string>("Mon-Fri, 9AM-5PM");
  const [joined, setJoined] = useState<string>("January 2023");
  const [pastData, setPastData] = useState<Array<{ x: number; y: number }>>([
    { x: 1, y: 20 },
    { x: 2, y: 45 },
    { x: 3, y: 28 },
    { x: 4, y: 80 },
    { x: 5, y: 99 },
    { x: 6, y: 43 },
  ]);
  const [change, setChange] = useState<number>(5.39);

  const generateRandomData = () => {
    // Generate 6 random points with x from 1–6 and y from 10–100
    const newPastData = Array.from({ length: 6 }, (_, i) => ({
      x: i + 1,
      y: Math.floor(Math.random() * 91) + 10, // Random y between 10–100
    }));

    // Random change value between -10 and +10 with 2 decimals
    const newChange = parseFloat((Math.random() * 20 - 10).toFixed(2));

    // Update state
    setPastData(newPastData);
    setChange(newChange);
  };

  const fetchData = async () => {
    // Simulate fetching data from an API
    let result;
    try {
      throw new Error("Error fetching data");
    } catch (error) {
      result = "";
    }
    return result;
  };

  useEffect(() => {
    // fetchData().then(data => setActivities(data));
    generateRandomData();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Page Title */}
      <View className="flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="self-start">
          <IconSymbol name="back" size={24} color={colors.primaryText} className="p-4" />
        </TouchableOpacity>
        <ThemedText
          colorValue="primaryText"
          type="title"
          className="absolute left-1/2 -translate-x-1/2 text-center my-4"
        >
          {`My ${capitalizeFirst(name as string)} Profile`}
        </ThemedText>
      </View>
      {/* Top card section with fixed height */}

      <ScrollView className="h-auto" showsVerticalScrollIndicator={false}>
        <View style={{ height: cardHeight }}>
          <Image
            source={require("@/assets/images/profile_bg.png")}
            style={{ width: screenWidth }}
            className="h-1/2"
            resizeMode="cover"
          />
          <SlideInView direction='left'>
            <View className="flex-row p-4">
              <Image
                source={logoSource}
                style={{ width: 60, height: 60, borderRadius: 30, marginBottom: 12 }}
                resizeMode="cover"
              />
              {/* Info Header */}
              <View className="flex-col justify-between items-start pl-3">
                <ThemedText colorValue="primaryText" style={{ fontWeight: 700 }}>
                  {profileData ? `${profileData.first_name} ${profileData.last_name}` : 'Loading...'}
                </ThemedText>
                <ThemedText colorValue="textTertiary">
                  {profileData && 'partner_type' in profileData ? profileData.partner_type : 'driver'}
                </ThemedText>
                <View className="flex-row items-center justify-between" style={{ width: cardWidth }}>
                  <View className="flex-row">
                    <IconSymbol name="location" size={24} color={colors.brandColor} />
                    <ThemedText colorValue="textTertiary">
                      {profileData ? (
                        'onboarding_status' in profileData 
                          ? profileData.onboarding_status 
                          : 'approval_status' in profileData 
                            ? profileData.approval_status 
                            : 'Loading...'
                      ) : 'Loading...'}
                    </ThemedText>
                  </View>
                  <TouchableOpacity
                    onPress={() => ""}
                    className="mr-4 px-3 py-1 rounded-2xl"
                    style={{ backgroundColor: colors.btnBackground }}
                  >
                    <ThemedText colorValue="btnText">
                      {profileData?.driver_status || 'offline'}
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </SlideInView>
        </View>
        {/* General Information Space */}
        <View style={{ flex: 1, backgroundColor: `${platformBgColor}36` }}>
          <View className="p-4">
            <ThemedText type="defaultSemiBold" colorValue="menuItemText" className="mb-2">
              General Information
            </ThemedText>
            <InfoItem 
              icon="email" 
              text="Email" 
              value={profileData?.email || 'Loading...'} 
              index={1} 
            />
            <InfoItem 
              icon="app" 
              text="Phone Number" 
              value={profileData?.phone || 'Loading...'} 
              index={2} 
            />
            <FadeInView index={3}>
              <View className="flex-row items-center my-2">
                <IconSymbol name="star" size={24} color="#000" className="flex-col self-start pt-1" />
                <View className="flex-col items-start ml-1">
                  <ThemedText colorValue="primaryText" type="defautlSmall" className="p-1">
                    Rating
                  </ThemedText>
                  <View className="flex-row p-1">
                    {ratingToHearts(profileData?.rating?.toString() || "0")}
                    <ThemedText colorValue="textTertiary" type="defautlSmall" className="ml-2">
                      ({profileData?.rating || '0'})
                    </ThemedText>
                  </View>
                </View>
              </View>
            </FadeInView>
            <InfoItem 
              icon="people" 
              text="Partner Type" 
              value={profileData && 'partner_type' in profileData ? profileData.partner_type : 'driver'} 
              index={4} 
            />
            <InfoItem 
              icon="briefcase" 
              text="Vehicle Info" 
              value={profileData?.vehicles?.[0] ? 
                `${profileData.vehicles[0].year} ${profileData.vehicles[0].make} ${profileData.vehicles[0].model}` : 
                'No vehicle information'} 
              index={5} 
            />
            <InfoItem 
              icon="calendar" 
              text="Last Updated" 
              value={new Date(profileData?.last_updated || '').toLocaleDateString()} 
              index={6} 
            />
          </View>
          {/* Graph Section */}
          <FadeInView index={7}>
            <View
              style={{ backgroundColor: colors.backgroundCard }}
              className="flex-row mx-4 mb-4 p-4 rounded-lg justify-between"
            >
              <View className="flex-col justify-between">
                <ThemedText colorValue="primaryText" type="defautlSmall">
                  Total {name === 'uber' ? 'Trips' : 'Rides'}
                </ThemedText>
                <ThemedText colorValue="brandColor" type="defautlSmall">
                  {profileData 
                    ? (name === 'uber' 
                        ? ('total_trips' in profileData ? profileData.total_trips : 0)
                        : ('total_rides' in profileData ? profileData.total_rides : 0)
                      )
                    : 0}
                </ThemedText>
              </View>
              <View className="self-end">
                <ThemedText
                  colorValue={change > 0 ? "bullish" : "burish"}
                  type="defautlSmall"
                  style={{ fontWeight: 700 }}
                >
                  {change > 0 ? "+" : ""}
                  {change}%
                </ThemedText>
              </View>
              <View style={{ width: 80, height: 40 }}>
                <VictoryLine
                  padding={0}
                  height={40}
                  width={80}
                  style={{
                    data: { stroke: change > 0 ? colors.bullish : colors.burish, strokeWidth: 2 },
                    parent: { border: "none" },
                  }}
                  data={pastData}
                  domain={{
                    y: [Math.min(...pastData.map((point) => point.y)), Math.max(...pastData.map((point) => point.y))],
                  }}
                  standalone={true}
                  animate={false}
                />
              </View>
            </View>
          </FadeInView>
        </View>
      </ScrollView>
    </View>
  );
}
