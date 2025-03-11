import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from "@react-navigation/drawer";
import { useState } from 'react';
import { Pressable, View, Text } from "react-native";
import { Colors } from "@/constants/Colors";
import { textStyles } from "@/constants/TextStyles";
import { useColorScheme } from "@/components/ColorSchemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { AnimatedSyncIcon } from './AnimatedSyncIcon';

type FunctionalItem = {
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  rotate?: boolean;
};

type CustomDrawerContentProps = {
  topItems?: FunctionalItem[];
  bottomItems?: FunctionalItem[];
  logo?: any;
  topMargin?: number;
};

export default function CustomDrawerContent(
  props: any & CustomDrawerContentProps
) {
  const { colorScheme } = useColorScheme();
  const { topItems = [], bottomItems = [], logo, topMargin } = props;
  const [syncing, setSyncing] = useState(false);

  const handleSyncPress = () => {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 600); // reset after animation
    // alert('sync data');
  };

  const renderItems = (items: FunctionalItem[], position: "top" | "bottom") => {
    if (items.length === 0) return null;

    return (
      <View className="rounded-xl">
        {items.map((item, index) => (
          <Pressable
            key={`${position}-${index}`}
            onPress={item.iconName === 'sync' ? handleSyncPress : item.onPress}
          >
            {({ pressed }) => {
              const textColor = pressed
                ? Colors[colorScheme].menuItemText
                : Colors[colorScheme].menuItemText;
              const backgroundColor = pressed
                ? '#f3f4f6'
                : "transparent";

              return (
                <View
                  style={{
                    backgroundColor,
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 18,
                    paddingVertical: 16,
                    borderRadius: 9999,
                  }}
                >
                  {item.iconName === 'sync'?
                  <AnimatedSyncIcon rotating={syncing} /> : 
                  <Ionicons
                    name={item.iconName}
                    size={24}
                    color={textColor}
                    style={{
                      transform: [{ rotate: item.rotate ? "180deg" : "0deg" }],
                      marginRight: 13,
                    }}
                  />
                  }
                  <Text
                    className="text-base"
                    style={{
                      color: textColor,
                      ...textStyles.description,
                    }}
                  >
                    {item.label}
                  </Text>
                </View>
              );
            }}
          </Pressable>
        ))}
      </View>
    );
  };

  return (
    <DrawerContentScrollView {...props}>
      {logo && (
        <View
          className={"items-center justify-start pb-5"}
          style={{ marginTop: topMargin }}
        >
          {logo}
          <ThemedText colorValue="text" type="subtitle">
            Gig-Flow
          </ThemedText>
        </View>
      )}
      {renderItems(topItems, "top")}
      <DrawerItemList {...props} />
      {renderItems(bottomItems, "bottom")}
    </DrawerContentScrollView>
  );
}
