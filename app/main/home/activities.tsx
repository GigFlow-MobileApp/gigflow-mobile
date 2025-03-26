import { useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
import { View, ScrollView, Dimensions, ActivityIndicator } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from '@/constants/config';
import { ThemedText } from "@/components/ThemedText";
import { useRouter } from "expo-router";
import { useThemeColors } from "@/components/ColorSchemeProvider";

// Helper function to capitalize first letter
const capitalizeFirst = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });
};

const renderActivity = (activity: any, index: number, platform: string) => {
  // Default values in case fields are undefined
  const amount = activity.amount || activity.total || 0;
  const timestamp = activity.timestamp || activity.created_at || activity.time || new Date().toISOString();
  const type = activity.type || activity.ride_type || 'trip';
  
  return (
    <View key={index} className="mb-4 p-4 bg-gray-100 rounded-lg">
      {/* Header Section */}
      <View className="flex-row justify-between items-center border-b border-gray-200 pb-2">
        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-blue-500 rounded-full items-center justify-center mr-3">
            <ThemedText className="text-white font-bold">
              {platform.charAt(0).toUpperCase()}
            </ThemedText>
          </View>
          <View>
            <ThemedText type="default" className="font-semibold">
              {capitalizeFirst(type)}
            </ThemedText>
            <ThemedText type="small" className="text-gray-500">
              {formatDate(timestamp)}
            </ThemedText>
          </View>
        </View>
        <ThemedText type="default" className="font-bold text-green-600">
          {formatCurrency(amount)}
        </ThemedText>
      </View>

      {/* Details Section */}
      <View className="mt-3">
        {Object.entries(activity).map(([key, value]) => {
          // Skip certain keys that we don't want to display
          if (['timestamp', 'created_at', 'time', 'id', '__v', '_id'].includes(key)) {
            return null;
          }

          // Handle nested objects
          if (value && typeof value === 'object') {
            return (
              <View key={key} className="mb-3">
                <ThemedText type="small" className="font-semibold text-gray-700 mb-1">
                  {capitalizeFirst(key.replace(/_/g, ' '))}:
                </ThemedText>
                <View className="ml-4">
                  {Object.entries(value).map(([subKey, subValue]) => {
                    if (subValue && typeof subValue !== 'object') {
                      return (
                        <View key={subKey} className="flex-row justify-between py-1">
                          <ThemedText type="small" className="text-gray-600">
                            {capitalizeFirst(subKey.replace(/_/g, ' '))}
                          </ThemedText>
                          <ThemedText type="small" className="font-medium">
                            {typeof subValue === 'number' ? formatCurrency(subValue) : String(subValue)}
                          </ThemedText>
                        </View>
                      );
                    }
                    return null;
                  })}
                </View>
              </View>
            );
          }

          // Handle primitive values
          if (value && typeof value !== 'object') {
            return (
              <View key={key} className="flex-row justify-between py-2 border-b border-gray-100">
                <ThemedText type="small" className="text-gray-600">
                  {capitalizeFirst(key.replace(/_/g, ' '))}
                </ThemedText>
                <ThemedText type="small" className="font-medium">
                  {typeof value === 'number' && key.toLowerCase().includes('amount') 
                    ? formatCurrency(value)
                    : String(value)}
                </ThemedText>
              </View>
            );
          }
          return null;
        })}
      </View>

      {/* Status Indicator */}
      {activity.status && (
        <View className="mt-3 flex-row items-center">
          <View 
            className={`w-2 h-2 rounded-full mr-2 ${
              activity.status.toLowerCase() === 'completed' ? 'bg-green-500' : 'bg-yellow-500'
            }`} 
          />
          <ThemedText type="small" className="text-gray-600">
            Status: {capitalizeFirst(activity.status)}
          </ThemedText>
        </View>
      )}
    </View>
  );
};

export default function ActivitiesPage() {
  const { name } = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useThemeColors();
  
  const [platformData, setPlatformData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const displayName = typeof name === "string" ? capitalizeFirst(name) : "";
  const platform = typeof name === "string" ? name.toLowerCase() : "";

  useEffect(() => {
    fetchData();
  }, [platform]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        throw new Error('Authentication token not found');
      }

      const headers = {
        'Authorization': `Bearer ${userToken}`,
        'Accept': 'application/json',
      };

      let response;
      if (platform === 'uber') {
        response = await fetch(
          `${Config.apiBaseUrl}/api/v1/earnings/db/uber`,
          { headers }
        );
      } else if (platform === 'lyft') {
        response = await fetch(
          `${Config.apiBaseUrl}/api/v1/earnings/db/lyft`,
          { headers }
        );
      } else {
        throw new Error(`${platform} API not implemented yet`);
      }

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log(`${platform} activities data:`, data); // Debug log

      // Ensure we're setting an array of activities
      const activities = Array.isArray(data) ? data : data.earnings || [];
      setPlatformData(activities);

    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch data');
      setPlatformData([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.brandColor} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <ThemedText type="default" colorValue="badBanner">{error}</ThemedText>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 px-4 py-2">
      <View className="flex-row justify-between items-center mb-4">
        <ThemedText type="h2">{displayName} Activities</ThemedText>
      </View>

      {platformData.length === 0 ? (
        <View className="flex-1 justify-center items-center py-8">
          <ThemedText type="default">No activities found</ThemedText>
        </View>
      ) : (
        platformData.map((activity, index) => renderActivity(activity, index, platform))
      )}
    </ScrollView>
  );
}
