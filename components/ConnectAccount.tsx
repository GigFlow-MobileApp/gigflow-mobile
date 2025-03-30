import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert } from "react-native";
import { useThemeColors } from "@/components/ColorSchemeProvider";
import { useState, useCallback } from "react";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { platformColor } from "@/constants/Colors";

const truncateText = (text: string, maxLength: number = 60): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
};

interface ConnectAccountProps {
  onSubmit: () => void;
  onClose: () => void;
}

interface AccountItemProps {
  iconName: string;
  title: string;
  description: string;
  onPress?: () => void;
}

const accountItemList: AccountItemProps[] = [
    {
        iconName: "uber",
        title: "Uber",
        description: "Uber is a transportation and ride-sharing technology company that...",
    },
    {
        iconName: "lyft",
        title: "Lyft",
        description: "No matter your destination, we'll get you where you need to go. Get a reliable ...",
    },
    {
        iconName: "doordash",
        title: "Doordash",
        description: "DoorDash is a technology company that connects consumers with their favorite...",
    },
    {
        iconName: "upwork",
        title: "Upwork",
        description: "Upwork is the world's work marketplace connecting businesses and talent to ...",
    },
    {
        iconName: "fiverr",
        title: "Fiverr",
        description: "Fiverr is an Israeli multinational online marketplace for freelance services. ...",
    }
];

const AccountItem = ({ iconName, title, description, onPress }: AccountItemProps) => {
    const iconColor = platformColor[iconName as keyof typeof platformColor] || "#000000";
    const { colors } = useThemeColors();

    return (
        <TouchableOpacity 
            onPress={onPress}
            className="flex-row justify-between items-center rounded-xl mb-4"
            style={{ overflow: "visible" }}
        >
            <View className="flex-row items-center flex-1 gap-3 p-4 mr-4 rounded-xl" 
                style={{ backgroundColor: `${iconColor}1F`}}
            >
                <View className="w-12 h-12 rounded-lg bg-white items-center justify-center">
                    <IconSymbol name={iconName} size={36} color={iconColor} />
                </View>
                <View className="flex-1 ml-6 mr-4">
                    <ThemedText type="defaultSemiBold" colorValue="primaryText" className="mb-1">
                        {title}
                    </ThemedText>
                    <ThemedText type="defautlSmall" colorValue="secondaryText" numberOfLines={2}>
                        {truncateText(description)}
                    </ThemedText>
                </View>
            </View>
            <View 
                style={{ 
                    backgroundColor: iconColor, padding: 12,
                    borderRadius: 8,
                    position: "absolute",
                    right: 0,
                }}
            >
                <IconSymbol 
                    name="arrow-forward" 
                    size={12} 
                    color={colors.btnText}
                    style={{ opacity: 0.9 }} 
                />
            </View>
            
        </TouchableOpacity>
    );
};

export default function ConnectAccount({ onSubmit, onClose }: ConnectAccountProps) {
  const { colors } = useThemeColors();
  
  return (
    <View className="flex-1">
        <TouchableOpacity
          onPress={onClose}
          className="absolute right-4 h-10 w-10 justify-center items-center"
          style={{ top: 30 }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <IconSymbol name="close" size={24} color={colors.primaryText} />
        </TouchableOpacity>
        <View className="flex-1" />
        <View className="px-4 pb-8">
            <ThemedText colorValue="primaryText" type="title" className="text-center mb-8">
                Connect your Account
            </ThemedText>

            <ScrollView 
                showsVerticalScrollIndicator={false}
                className="max-h-[500px]"
            >
                {accountItemList.map((item, index) => (
                    <AccountItem 
                        key={item.title}
                        {...item}
                        onPress={() => {}}
                    />
                ))}
            </ScrollView>
        </View>
    </View>
  );
}