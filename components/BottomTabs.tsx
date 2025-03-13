import { View, TouchableOpacity} from "react-native";
import { TabProps, TabItemsType } from "@/constants/customTypes";
import { useColorScheme } from "@/components/ColorSchemeProvider";
import { usePathname, useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { ThemedText } from "@/components/ThemedText";

export const BottomTabs = ({ items }: TabProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { colorScheme } = useColorScheme();

  return (
    <View
      className="h-[64px] flex-row justify-around items-center"
      style={{ backgroundColor: Colors[colorScheme].background, shadowColor: Colors[colorScheme].shadow,
        shadowOffset: { width: 0, height: -3 }, // shadow above
        shadowOpacity: 0.06,
        shadowRadius: 1,
        elevation: 0,}}
    >
      {items.map((tab, idx) => (
        <TouchableOpacity
          key={idx}
          onPress={() => router.push(tab.route as never)}
        >
          <View
            className="bg-blue-500"
            style={{
              backgroundColor: Colors[colorScheme].background,
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <IconSymbol
              name={pathname === tab.route ? tab.icon + ".fill" : tab.icon}
              size={24}
              color={
                pathname === tab.route
                  ? Colors[colorScheme].brandColor
                  : Colors[colorScheme].menuItemText
              }
            />
            <ThemedText
              type="small"
              style={{
                color:
                  pathname === tab.route
                    ? Colors[colorScheme].brandColor
                    : Colors[colorScheme].menuItemText,
              }}
            >
              {tab.label}
            </ThemedText>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};