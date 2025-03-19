// app/(drawer)/setting.tsx
import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
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

const padTop = 6;

const AccountItem: React.FC<AccountItemProps> = ({ iconName, balance, linked, onPress }) => {
  const { colorScheme } = useColorScheme();
  return (
    <View
      className="flex flex-row justify-between align-center px-5 pt-4"
      style={{
        borderBottomWidth: 1,
        borderColor: Colors[colorScheme].tabIconDefault,
      }}
    >
      <View className="flex flex-row">
        <View className="pt-2 pl-1">
          <Image source={iconMap[iconName]} style={{ width: 52, height: 52, borderRadius: 25 }} resizeMode="cover" />
        </View>
        <View className="flex flex-col justify-between ml-6">
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
        </View>
      </View>
      <View className="flex flex-col justify-between">
        <TouchableOpacity
          className={`mt-2 px-3 py-1 rounded-lg flex-row align-center`}
          style={{ backgroundColor: linked ? Colors[colorScheme].btnBackground : Colors[colorScheme].tabIconDefault }}
        >
          <IconSymbol name="link" size={16} color="btnText" className="pr-2" />
          <ThemedText type="defautlSmall" colorValue="btnText">
            {linked ? "linked" : "unlinked"}
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity onPress={onPress} disabled={!linked} className="flex-row justify-end p-3">
          <IconSymbol name="gear" size={22} color="primaryText" />
        </TouchableOpacity>
      </View>
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

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await fetch("https://your-backend.com/api/accounts");

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`HTTP ${res.status}: ${errorText}`);
        }

        const text = await res.text(); // fetch as text first

        try {
          const data: Account[] = JSON.parse(text);
          setAccounts(data);
        } catch (jsonError) {
          console.log("❌ Failed to parse JSON. Raw response:\n", text);
          throw jsonError;
        }
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
      <ThemedText type="title" className={`self-center pt-${padTop.toString()}`}>
        Your Accounts
      </ThemedText>
      {/* account list */}
      <ScrollView showsVerticalScrollIndicator={false} className="pt-4 h-full">
        {accounts.map((account) => {
          return (
            <AccountItem
              key={account.id}
              iconName={account.iconName}
              balance={account.balance}
              linked={account.linked}
              onPress={() => router.push({
                pathname: "/main/account/[name]",
                params: { name: account.iconName }
              })}
            />
          );
        })}
      </ScrollView>
      <View className={`absolute bottom-${(10 + padTop).toString()} left-4 right-4 `}>
        <TouchableOpacity
          className="mx-3 py-3 rounded-lg items-center"
          style={{ backgroundColor: Colors[colorScheme].brandColor }}
        >
          <ThemedText type="btnText" colorValue="btnText" className="self-start pl-8">
            +   Add Account
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}
