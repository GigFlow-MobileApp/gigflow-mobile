import { View, TouchableOpacity, Keyboard, Platform} from "react-native";
import { TabProps, TabItemsType } from "@/constants/customTypes";
import { useColorScheme } from "@/components/ColorSchemeProvider";
import { usePathname, useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { ThemedText } from "@/components/ThemedText";
import { useEffect, useState } from "react";

export const BottomTabs = ({ items }: TabProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { colorScheme } = useColorScheme();

  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () => setIsKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setIsKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  if (isKeyboardVisible) return null;

  return (
    <View
      className="h-16 flex-row justify-around items-center"
      style={{ 
        backgroundColor: Colors[colorScheme].background, shadowColor: Colors[colorScheme].shadow,
        shadowOffset: { width: 0, height: -3 }, // shadow above
        shadowOpacity: 0.06,
        shadowRadius: 1,
        elevation: 0,
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 64,
      }}
    >
      {items.map((tab, idx) => (
        <TouchableOpacity
          key={idx}
          onPress={() => pathname !== tab.route ? router.replace(tab.route as never) : ""}
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
              name={pathname.startsWith(tab.route) ? tab.icon + ".fill" : tab.icon}
              size={24}
              color={
                pathname.startsWith(tab.route)
                  ? Colors[colorScheme].brandColor
                  : Colors[colorScheme].menuItemText
              }
            />
            <ThemedText
              type="small"
              style={{
                color:
                  pathname.startsWith(tab.route)
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