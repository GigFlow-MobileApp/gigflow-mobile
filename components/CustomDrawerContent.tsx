import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from "@react-navigation/drawer";
import { Pressable, View, Text } from "react-native";
import { Colors } from "@/constants/Colors";
import { textStyles } from "@/constants/TextStyles";
import { useColorScheme } from "@/components/ColorSchemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";

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

  const renderItems = (items: FunctionalItem[], position: "top" | "bottom") => {
    if (items.length === 0) return null;
  
    return (
      <View className="rounded-xl">
        {items.map((item, index) => (
          <Pressable
            key={`${position}-${index}`}
            onPress={item.onPress}
            className="flex-row items-center px-4 py-3 mx-2 rounded-xl"
            android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
            style={({ pressed }) => [
              pressed && { backgroundColor: 'rgba(0,0,0,0.05)' }
            ]}
          >
            <Ionicons
              name={item.iconName}
              size={24}
              color={Colors[colorScheme].menuItemText}
              style={{
                transform: [{ rotate: item.rotate ? "180deg" : "0deg" }],
                marginRight: 12,
              }}
            />
            <Text
              className="text-base"
              style={{
                color: Colors[colorScheme].menuItemText,
                ...textStyles.description,
              }}
            >
              {item.label}
            </Text>
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
