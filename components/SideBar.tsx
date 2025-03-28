import { View, Animated, Pressable, ScrollView, Dimensions } from "react-native";
import { SidebarProps, DrawerItemsType } from "@/constants/customTypes";
import { useColorScheme } from "@/components/ColorSchemeProvider";
import { usePathname, useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import { AnimatedSyncIcon } from "@/components/AnimatedSyncIcon";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { ThemedText } from "@/components/ThemedText";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Logo from "@/assets/images/logo.svg";

const screenWdith = Dimensions.get("window").width;
const menuWidth = screenWdith * (216 / 390);

export const Sidebar = ({ items }: SidebarProps) => {
  const { colorScheme } = useColorScheme();
  const router = useRouter();
  const pathname = usePathname();

  const renderItems = (items: DrawerItemsType[]) => {
    return (
      <View
        style={{
          backgroundColor: Colors[colorScheme].background,
          paddingInline: 5,
        }}
      >
        {items!.map((item, idx) => (
          <Pressable
            key={idx}
            onPress={() =>
              item.onPress ? item.onPress() : pathname !== item.route ? router.push(item.route as never) : ""
            }
            style={{
              borderRadius: 9999,
              backgroundColor: pathname === item.route ? `${Colors[colorScheme].onPressBg}1a` : "",
            }}
          >
            {({ pressed }) => {
              const textColor =
                pathname === item.route || pressed ? Colors[colorScheme].brandColor : Colors[colorScheme].menuItemText;
              const backgroundColor =
                pathname === item.route || pressed ? `${Colors[colorScheme].onPressBg}1a` : Colors[colorScheme].background;
              return (
                <View
                  className="bg-blue-500"
                  style={{
                    backgroundColor,
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 18,
                    paddingVertical: 16,
                    borderRadius: 9999,
                  }}
                >
                  {item.icon === "sync" ? (
                    <AnimatedSyncIcon rotating={pressed} />
                  ) : (
                    <View
                      style={{
                        transform: [{ rotate: item.rotate ? "180deg" : "0deg" }],
                      }}
                    >
                      <IconSymbol
                        name={pathname === item.route ? item.icon + ".fill" : item.icon}
                        size={28}
                        color={textColor}
                      />
                    </View>
                  )}
                  <ThemedText className="text-base pl-5" type="description" style={{ color: textColor }}>
                    {item.label}
                  </ThemedText>
                </View>
              );
            }}
          </Pressable>
        ))}
      </View>
    );
  };

  return (
    <Animated.View
      style={[
        {
          flex: 1,
          width: menuWidth,
          backgroundColor: Colors[colorScheme].background,
        },
      ]}
    >
      <ScrollView style={{ padding: 0 }}>
        <View className="py-10 h-full" style={{ backgroundColor: Colors[colorScheme].background }}>
          <View className={"items-center justify-start pb-5"} style={{ marginTop: 0 }}>
            <Logo className={"w-25 h-25"} />
            <ThemedText colorValue="text" type="subtitle">
              Gig-Flow
            </ThemedText>
          </View>
          {renderItems(items)}
        </View>
      </ScrollView>
      <View>
        {renderItems([
          {
            icon: "leave",
            label: "Sign out",
            route: "/auth",
            rotate: true,
            onPress: async () => {
              await AsyncStorage.removeItem("userToken");
              router.replace("/auth");
            },
          },
        ])}
      </View>
    </Animated.View>
  );
};
