// app/(drawer)/setting.tsx
import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useColorScheme } from "@/components/ColorSchemeProvider";
import { Colors } from "@/constants/Colors";
import { ThemedText } from "@/components/ThemedText";

interface AccountItemProps {
  iconName: string;
  balance: number;
  linked: boolean;
  onPress: () => void;
}

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
        <IconSymbol name={iconName} size={52} color={Colors[colorScheme].menuItemText} />
        <View className="flex flex-col justify-between ml-6">
          {linked ? (
            <>
              <ThemedText type="semiSmall" colorValue="menuItemText" className="py-3">
                Balance
              </ThemedText>
              <ThemedText type="title" colorValue="text" className="py-3">
                {"$"}
                {Number(balance).toFixed(2)}
              </ThemedText>
            </>
          ) : (
            <>
              <View className="py-3" />
              <View className="py-3" />
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

        <TouchableOpacity onPress={onPress} className="flex-row justify-end p-3">
          <IconSymbol name="gear" size={22} color="primaryText" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const accountData = [
  { iconName: "uber", balance: 850, linked: true, onPress: () => "" },
  { iconName: "lyft", balance: 850, linked: true, onPress: () => "" },
  { iconName: "doordash", balance: 0, linked: false, onPress: () => "" },
  { iconName: "upwork", balance: 0, linked: false, onPress: () => "" },
  { iconName: "fiverr", balance: 850, linked: true, onPress: () => "" },
];

export default function AccountScreen() {
  const [uberBalance, setUberBalance] = useState<number>(-1);
  const { colorScheme } = useColorScheme();

  return (
    <View className="rounded-3xl" style={{backgroundColor: Colors[colorScheme].background}}>
      <ThemedText type="title" className={`self-end pt-${padTop.toString()}`}>Your Accounts</ThemedText>
      {/* account list */}
      <ScrollView showsVerticalScrollIndicator={false} className="pt-4 h-full">
        {accountData.map((account) => {
          return (
            <AccountItem
              key={account.iconName}
              iconName={account.iconName}
              balance={account.balance}
              linked={account.linked}
              onPress={account.onPress}
            />
          );
        })}
      </ScrollView>
      <View className={`absolute bottom-${(10 + padTop).toString()} left-4 right-4 `}>
        <TouchableOpacity 
          className="mx-3 py-3 rounded-lg items-center" 
          style={{backgroundColor: Colors[colorScheme].brandColor}}
        >
          <ThemedText type="btnText" colorValue="btnText">+ Add Account</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}
