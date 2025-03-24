// app/(drawer)/setting.tsx
import React, { useState, useEffect, useRef } from "react";
import { View, Alert, ScrollView, TouchableOpacity, Image, Animated } from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useColorScheme } from "@/components/ColorSchemeProvider";
import { Colors } from "@/constants/Colors";
import { ThemedText } from "@/components/ThemedText";
import { useRouter } from "expo-router";
import Config from "@/constants/config";

interface AccountItemProps {
  iconName: string;
  balance: number;
  linked: boolean;
  onPress: () => void;
  index?: number; // For staggered animation
}

type Account = {
  id: string; // unique identifier from backend
  iconName: string;
  balance: number;
  linked: boolean;
};

const iconMap: Record<string, any> = {
  uber: require("@/assets/images/logos/uber.png"),
  lyft: require("@/assets/images/logos/lyft.png"),
  doordash: require("@/assets/images/logos/doordash.png"),
  upwork: require("@/assets/images/logos/upwork.png"),
  fiverr: require("@/assets/images/logos/fiverr.png"),
};

const AccountItem: React.FC<AccountItemProps> = ({ iconName, balance, linked: initialLinked, onPress, index = 0 }) => {
  const { colorScheme } = useColorScheme();
  const [linked, setLinked] = useState(initialLinked);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // Animation values
  const imageTranslateX = useRef(new Animated.Value(-200)).current;
  const contentTranslateX = useRef(new Animated.Value(200)).current;

  useEffect(() => {
    // Entrance animation with staggered delay based on index
    const animationDelay = index * 100; // 100ms delay between items
    
    Animated.parallel([
      Animated.timing(imageTranslateX, {
        toValue: 0,
        duration: 300,
        delay: animationDelay,
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslateX, {
        toValue: 0,
        duration: 300,
        delay: animationDelay,
        useNativeDriver: true,
      }),
    ]).start();
    
    if (showConfirmDialog) {

      Alert.alert(
        "Confirm Link",
        `Do you want to ${linked ? "un" : ""}link this account?`,
        [
          {
            text: "Cancel",
            onPress: () => setShowConfirmDialog(false),
            style: "cancel",
          },
          {
            text: "Yes",
            onPress: () => {
              setLinked(!linked);
              setShowConfirmDialog(false);
            },
          },
        ],
        { cancelable: true }
      );
    }
  }, [showConfirmDialog]);

  return (
    <View
      className="flex flex-row justify-between align-center px-5 pt-4"
      style={{
        borderBottomWidth: 1,
        borderColor: Colors[colorScheme].tabIconDefault,
      }}
    >
      <View className="flex flex-row">
        <Animated.View className="pt-2 pl-1" style={{ transform: [{ translateX: imageTranslateX }] }}>
          <Image source={iconMap[iconName]} style={{ width: 52, height: 52, borderRadius: 25 }} resizeMode="cover" />
        </Animated.View>
        <Animated.View className="flex flex-col justify-between ml-6" style={{ transform: [{ translateX: imageTranslateX }] }}>
          {linked ? (
            <>
              <ThemedText type="semiSmall" colorValue="menuItemText" className="py-3">
                Balance
              </ThemedText>
              <ThemedText type="title" colorValue="text" className="pt-2 pb-1">
                {"$"}
                {Number(balance).toFixed(2)}
              </ThemedText>
            </>
          ) : (
            <>
              <View className="py-3" />
              <View className="pt-3" />
            </>
          )}
        </Animated.View>
      </View>
      <Animated.View className="flex flex-col justify-between" style={{ transform: [{ translateX: contentTranslateX }] }}>
        <TouchableOpacity
          className="mt-2 px-3 py-1 rounded-lg flex-row items-center"
          style={{ backgroundColor: linked ? Colors[colorScheme].btnBackground : Colors[colorScheme].tabIconDefault }}
          onPress={() => { setShowConfirmDialog(true)}}
        >
          <IconSymbol name="link" size={16} color={Colors[colorScheme].btnText} className="pr-2" />
          <ThemedText type="defautlSmall" colorValue="btnText">
            {linked ? "linked" : "unlinked"}
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity onPress={onPress} disabled={!linked} className="flex-row justify-end p-3">
          <IconSymbol name="gear" size={22} color="primaryText" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const accountData: Account[] = [
  { id: "1", iconName: "uber", balance: 850, linked: true },
  { id: "2", iconName: "lyft", balance: 850, linked: true },
  { id: "3", iconName: "doordash", balance: 0, linked: false },
  { id: "4", iconName: "upwork", balance: 0, linked: false },
  { id: "5", iconName: "fiverr", balance: 850, linked: true },
];

export default function AccountScreen() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const { colorScheme } = useColorScheme();
  const router = useRouter();
  
  // Animation value for title fade-in
  const titleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Title fade-in animation
    Animated.timing(titleOpacity, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
    
    const fetchAccounts = async () => {
      try {
        // const res = await fetch("https://your-backend.com/api/accounts");

        // if (!res.ok) {
        //   const errorText = await res.text();
        //   throw new Error(`HTTP ${res.status}: ${errorText}`);
        // }

        // const text = await res.text(); // fetch as text first

        // try {
        //   const data: Account[] = JSON.parse(text);
        //   setAccounts(data);
        // } catch (jsonError) {
        //   console.log("❌ Failed to parse JSON. Raw response:\n", text);
        //   throw jsonError;
        // }
        throw Error("");
      } catch (error) {
        console.log("Error fetching accounts:", error);
        console.log("Using Mockdata...");
        // Fall back to using accountData when API request fails
        setAccounts(accountData);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  return (
    <View className="rounded-3xl" style={{ backgroundColor: Colors[colorScheme].background }}>
      <Animated.View style={{ opacity: titleOpacity }}>
        <ThemedText type="title" className="self-center" style={{paddingTop: 20}}>
          Your Accounts
        </ThemedText>
      </Animated.View>
      {/* account list */}
      <ScrollView showsVerticalScrollIndicator={false} className="pt-4 h-full">
        {accounts.map((account, index) => {
          return (
            <AccountItem
              key={account.id}
              iconName={account.iconName}
              balance={account.balance}
              linked={account.linked}
              index={index}
              onPress={() =>
                router.push({
                  pathname: "/main/home/balance",
                  params: { name: account.iconName },
                })
              }
            />
          );
        })}
      </ScrollView>
    </View>
  );
}
