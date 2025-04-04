import { View, ScrollView, Dimensions, ActivityIndicator, TouchableOpacity, Animated, Platform, Image } from "react-native";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { useThemeColors } from "@/components/ColorSchemeProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { useState, useEffect, useRef } from "react";
import { SlideInView } from "@/components/FadeInView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import Config from "@/constants/config";
import { platformColor } from "@/constants/Colors";
import { memo } from "react";
const { height: screenHeight } = Dimensions.get('window');

interface PlaidTransaction {
  id: string;
  amount: number;
  name: string;
  merchant_name?: string;
  authorized_date: string;
  category?: string[];
  payment_channel: string;
  payment_meta?: {
    payment_method?: string;
    payment_processor?: string;
  };
  logo_url?: string;
  location?: {
    address?: string;
    city?: string;
    region?: string;
    postal_code?: string;
  };
  original_description: string;
}

interface CategoryButton {
  label: string;
  selected: boolean;
}

// Helper function to format date
function formatDateToLabel(date: Date): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const year = date.getFullYear();
  const month = months[date.getMonth()];
  const day = date.getDate();
  return `${year} ${month} ${day}`;
}

const PaymentItem = memo(({ transaction, index }: { transaction: PlaidTransaction; index: number }) => {
  const { colors } = useThemeColors();
  const date = new Date(transaction?.authorized_date || new Date());

  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours === 0 ? 12 : hours;
  const formattedTime = `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;

  // Take first 3 categories if available
  const displayCategories = transaction.category?.slice(0, 3) || [];

  return (
    <SlideInView i={index} direction="left" key={index}>
      <View 
        className="mb-2 px-4 py-2 rounded-lg"
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
          <View className="flex-col p-2 self-start">
            {transaction.logo_url ? (
              <Image 
                source={{ uri: transaction.logo_url }} 
                style={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: 20, 
                  marginRight: 12,
                  backgroundColor: colors.backgroundCard 
                }}
              />
            ) : (
              <View 
                className="w-10 h-10 rounded-full items-center justify-center mr-3" 
                style={{ backgroundColor: colors.backgroundCard }}
              >
                <ThemedText type="btnText" colorValue="btnText">
                  {transaction.merchant_name?.[0] || transaction.name[0]}
                </ThemedText>
              </View>
            )}
          </View>
          
          <View className="flex-col justify-start flex-1">
            <View className="flex-row justify-between mb-1 mr-2">
              <ThemedText type="defautlSmall" colorValue="primaryText" style={{ fontWeight: '700' }}>
                {transaction.merchant_name || transaction.name}
              </ThemedText>
              <ThemedText type="defautlSmall" colorValue="textTertiary">
                {formattedTime}
              </ThemedText>
            </View>
            
            <View className="flex-row justify-between mb-1 mr-1">
              <View className="flex-col">
                {displayCategories.map((category, idx) => (
                  <ThemedText 
                    key={idx}
                    type="semiSmall" 
                    colorValue="cardText"
                    className="mb-1"
                  >
                    • {category}
                  </ThemedText>
                ))}
              </View>
              <ThemedText type="defautlSmall" colorValue="primaryText" style={{ fontWeight: '700' }}>
                ${Math.abs(transaction.amount).toFixed(2)}
              </ThemedText>
            </View>

            <View className="flex-row justify-between my-1">
              {transaction.payment_meta?.payment_method && (
                <ThemedText 
                  type="defautlSmall" 
                  className="rounded-2xl px-3 py-1 mr-2"
                  style={{ backgroundColor: "#FEF6F1", color: "#EC7735", fontWeight: '700' }}
                >
                  {transaction.payment_meta.payment_method}
                </ThemedText>
              )}
              {transaction.payment_channel && (
                <ThemedText 
                  type="defautlSmall" 
                  className="rounded-2xl px-3 py-1"
                  style={{ backgroundColor: "#DEE1E6", color: "#379AE6", fontWeight: '700' }}
                >
                  {transaction.payment_channel}
                </ThemedText>
              )}
            </View>
          </View>
        </View>
        
        <View className="flex-row justify-between items-center">
          <ThemedText type="semiSmall" colorValue="cardText" style={{ fontSize: 11 }}>
            {transaction.original_description || 'No description available'}
          </ThemedText>
          {transaction.location?.city && (
            <ThemedText 
              type="defautlSmall" 
              className="rounded-2xl px-3 py-1"
              style={{ backgroundColor: "#DEE1E6", color: "#379AE6" }}
            >
              {`${transaction.location.city}, ${transaction.location.region}`}
            </ThemedText>
          )}
        </View>
      </View>
    </SlideInView>
  );
});

export default function TaxScreen() {
  const { colors } = useThemeColors();
  const router = useRouter();
  const [transactions, setTransactions] = useState<PlaidTransaction[]>([]);
  const [categories, setCategories] = useState<CategoryButton[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false); // Add this state
  const [isAIMode, setIsAIMode] = useState(false); // Add AI mode state
  const [error, setError] = useState<string | null>(null);
  const groupedTransactions = {} as Record<string, PlaidTransaction[]>;

  // Fetch transactions based on mode (AI or normal)
  const fetchTransactions = async (useAI: boolean = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const userToken = await AsyncStorage.getItem("userToken");
      if (!userToken) {
        throw new Error("Authentication token not found");
      }

      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 3);
      const endDate = new Date();

      const endpoint = useAI ? 
        `${Config.apiBaseUrl}/api/v1/plaid/ai/classify-transactions` : 
        `${Config.apiBaseUrl}/api/v1/plaid/db/transactions`;

      const response = await fetch(
        `${endpoint}?` +
        `skip=0&limit=100&` +
        `start_date=${startDate.toISOString()}&` +
        `end_date=${endDate.toISOString()}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      const responseData = await response.json();
      const transactionsData = responseData.data || [];
      setTransactions(transactionsData);
      
      // Extract and set unique categories
      const uniqueCategories = extractUniqueCategories(transactionsData);
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError(error instanceof Error ? error.message : "Failed to fetch data");
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchTransactions();
  }, []);

  // Handle AI Filter toggle
  const handleAIFilterToggle = async () => {
    setIsFiltering(true);
    try {
      const newMode = !isAIMode;
      setIsAIMode(newMode);
      await fetchTransactions(newMode);
    } finally {
      setIsFiltering(false);
    }
  };

  const extractUniqueCategories = (transactions: PlaidTransaction[]) => {
    const uniqueCategories = new Set<string>();
    
    transactions.forEach(transaction => {
      transaction.category?.forEach(category => {
        uniqueCategories.add(category);
      });
    });

    return Array.from(uniqueCategories).map(category => ({
      label: category,
      selected: true
    }));
  };

  const toggleCategory = async (categoryLabel: string) => {
    setIsFiltering(true); // Show filtering state
    try {
      // Wrap in setTimeout to ensure UI updates
      await new Promise(resolve => setTimeout(resolve, 300));
      setCategories(categories.map(cat => 
        cat.label === categoryLabel ? { ...cat, selected: !cat.selected } : cat
      ));
    } finally {
      setIsFiltering(false); // Hide filtering state
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

  // Filter transactions based on selected categories
  const filteredTransactions = transactions.filter(transaction => 
    transaction.category?.some(cat => 
      categories.find(c => c.label === cat)?.selected
    )
  );

  // Group filtered transactions by date
  filteredTransactions.forEach((transaction) => {
    const date = formatDateToLabel(new Date(transaction.authorized_date));
    
    if (!groupedTransactions[date]) {
      groupedTransactions[date] = [];
    }
    groupedTransactions[date].push(transaction);
  });

  return (
    <View style={{ flex: 1 }}>
      {/* Header with AI Filter Button */}
      
      <View 
        className="flex-row justify-between items-center p-4 py-2" 
        style={{backgroundColor: colors.background}}
      >
        
          <ThemedText type="title" className="ml-12 pt-0.5">Transactions</ThemedText>
        
        <TouchableOpacity 
          onPress={handleAIFilterToggle}
          disabled={isFiltering}
          className="flex-row items-center"
          style={{
            backgroundColor: isAIMode ? colors.brandColor : colors.background,
            padding: 8,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: isAIMode ? colors.brandColor : colors.border,
            opacity: isFiltering ? 0.7 : 1,
          }}
        >
          <IconSymbol 
            name="funnel" 
            size={16} 
            color={isAIMode ? colors.background : colors.primaryText} 
            className="mr-2"
          />
          <ThemedText 
            type="defautlSmall" 
            colorValue={isAIMode ? "background" : "primaryText"}
          >
            {isFiltering ? "Processing..." : "AI Filters"}
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Show loading overlay when filtering */}
      {isFiltering && (
        <View 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <ActivityIndicator size="large" color={colors.brandColor} />
          <ThemedText type="default" className="mt-2">
            {isAIMode ? "Analyzing transactions..." : "Resetting filters..."}
          </ThemedText>
        </View>
      )}

      {/* Categories Section */}
      <View style={{ 
        height: screenHeight * 0.12, // Reduced height to approximately 1/8 of screen
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.border
      }}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="px-4"
          contentContainerStyle={{
            paddingVertical: 8,
            gap: 8,
            flexDirection: 'row',
            flexWrap: 'nowrap',
            alignItems: 'center'
          }}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.label}
              onPress={() => toggleCategory(category.label)}
              disabled={isFiltering} // Disable while filtering
              className={`px-3 py-1.5 rounded-full flex-row items-center ${
                category.selected ? 'bg-[#f1fbfd]' : 'bg-[#f3f4f6]'
              }`}
              style={{
                borderWidth: 1,
                borderColor: category.selected ? colors.selectedText : colors.border,
                opacity: isFiltering ? 0.7 : 1, // Dim while filtering
              }}
            >
              <ThemedText
                type="defautlSmall"
                colorValue={category.selected ? "selectedText" : "cardText"}
                style={{ fontSize: 13 }}
              >
                {category.label}
              </ThemedText>
              {category.selected ? (
                <IconSymbol
                  name="checkSingle"
                  size={16}
                  color={colors.selectedText}
                  className="ml-1.5"
                />
              ) : (
                <IconSymbol
                  name="plus"
                  size={16}
                  color={colors.cardText}
                  className="ml-1.5"
                />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView className="flex-1">
        {isFiltering ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 20 }}>
            <ActivityIndicator size="small" color={colors.brandColor} />
            <ThemedText type="default" className="mt-2">Filtering transactions...</ThemedText>
          </View>
        ) : filteredTransactions.length === 0 ? (
          <View className="flex-1 justify-center items-center py-8">
            <ThemedText type="default">No transactions found</ThemedText>
          </View>
        ) : (
          Object.entries(groupedTransactions).map(([date, dateTransactions]) => (
            <View key={date} className="mb-4">
              <ThemedText
                type="defautlSmall"
                colorValue="menuItemText"
                className="my-2 ml-4"
                style={{ fontSize: 16 }}
              >
                {date}
              </ThemedText>

              {dateTransactions.map((transaction, index) => (
                <PaymentItem 
                  key={`${date}-${index}`}
                  transaction={transaction}
                  index={index}
                />
              ))}
            </View>
          ))
        )}
      </ScrollView>

      <FloatingActionButton 
        iconName="wheel"
        backgroundColor={colors.onPressBg}
        onPress={() => router.push("/main/chatbot")}
      />
    </View>
  );
}
