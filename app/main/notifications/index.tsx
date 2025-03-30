// app/(drawer)/setting.tsx
import { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, TextInput, Dimensions, Animated, Easing, Platform } from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useThemeColors } from "@/components/ColorSchemeProvider";
import { platformColor } from "@/constants/Colors";
import { ThemedText } from "@/components/ThemedText";
import FadeInView from "@/components/FadeInView";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from '@/constants/config';
import { usePlatformStore } from "@/store/platformStore";

const logoMap = {
  uber: require("@/assets/images/logos/uber.png"),
  lyft: require("@/assets/images/logos/lyft.png"),
  doordash: require("@/assets/images/logos/doordash.png"),
  upwork: require("@/assets/images/logos/upwork.png"),
  fiverr: require("@/assets/images/logos/fiverr.png"),
};

interface Notification {
  id: string;
  title: string;
  platform: string;
  icon: any; // Image source
  description: string;
  date: string; // Formatted date string
  timestamp: Date; // Actual date object for sorting
  read: boolean;
}

// Interface for grouped notifications
interface NotificationGroup {
  title: string;
  data: Notification[];
}

const NotificationItem = ({ notification, index }: { notification: Notification, index: number }) => {
  const { colors } = useThemeColors();

  return (
    <FadeInView index={index}>
      <View className="flex-row items-center justify-start px-4 pt-4 border-b border-gray-200">
        {/* Logo */}
        <View className="flex-col h-16 overflow-hidden justify-center items-center mr-4 mb-4">
          <Image
            source={notification.icon}
            style={{ width: 89, height: 89, borderRadius: 89/2}}
            resizeMode="contain"
          />
        </View>
        {/* detail */}
        <View className="flex-1 flex-col item-start">
          <ThemedText type="smallBold" colorValue="primaryText">{notification.title}</ThemedText>
          <ThemedText type="semiSmall" colorValue="cardText">
            {`Notification Description\n${notification.description}`}
          </ThemedText>
          <View className="flex-row self-end mt-1 ">
            <IconSymbol 
              name="clock" size={8} color={colors.btnText} 
              style={{backgroundColor: colors.primaryText, paddingLeft: 0.8, paddingTop: 0.75}} 
              className="rounded-full h-4 w-4 justify-center items-center"
            />
            <ThemedText 
              type="small" colorValue="menuItemText"
              className="ml-2"
              style={{fontWeight: 400}}
            >{notification.date}</ThemedText>
          </View>
        </View>
        {/* Read/Unread Indicator */}
        <View className="rounded-full w-2 h-2 ml-4" style={{
          backgroundColor: !notification.read ? colors.brandColor : undefined
        }}/>
      </View>
    </FadeInView>
  )
}

// Section header component for notification groups
const SectionHeader = ({ title }: { title: string }) => {
  const { colors } = useThemeColors();
  
  return (
    <View className="px-4 py-2" style={{ backgroundColor: colors.background }}>
      <ThemedText type="medium" colorValue="primaryText" className="font-semibold">
        {title}
      </ThemedText>
    </View>
  );
};

/**
 * Generates a list of random notifications within the last 7 days
 * @param count Number of notifications to generate
 * @returns Array of Notification objects
 */
const generateNotifications = (name?: string, count = 15): Notification[] => {
  // Define platforms with their names, icons, and related verbs for message generation
  const platforms = [
    { name: "Uber", key: "uber", verbs: ["ride", "trip", "payment"] },
    { name: "DoorDash", key: "doordash", verbs: ["delivery", "order", "payment"] },
    { name: "Upwork", key: "upwork", verbs: ["contract", "proposal", "payment"] },
    { name: "Fiverr", key: "fiverr", verbs: ["gig", "order", "review"] },
    { name: "Lyft", key: "lyft", verbs: ["ride", "trip", "payment"] }
  ];
  
  // Message templates for variety
  const messageTemplates = [
    (platform: string, verb: string) => `Your ${verb} with ${platform} was completed successfully.`,
    (platform: string, verb: string) => `New ${verb} opportunity from ${platform} available now.`,
    (platform: string, verb: string) => `${platform} ${verb} status has been updated.`,
    (platform: string, verb: string) => `${platform} sent you a ${verb} confirmation.`,
    (platform: string, verb: string) => `Your ${platform} ${verb} requires attention.`
  ];
  
  // Generate random notifications
  return Array.from({ length: count}).map((_, i) => {
    // Select random platform
    const platform = name ? platforms.find(p => p.key === name)! : platforms[Math.floor(Math.random() * platforms.length)];
    
    // Generate random time within last 7 days (in milliseconds)
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const randomTime = new Date(
      sevenDaysAgo.getTime() + Math.random() * (now.getTime() - sevenDaysAgo.getTime())
    );
    
    // Format date string in YYYY.MM.DD HH:MM AM/PM format
    const year = randomTime.getFullYear();
    const month = String(randomTime.getMonth() + 1).padStart(2, '0');
    const day = String(randomTime.getDate()).padStart(2, '0');
    
    let hours = randomTime.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12
    const minutes = String(randomTime.getMinutes()).padStart(2, '0');
    
    const dateStr = `${year}.${month}.${day} ${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
    
    // Select random verb and message template
    const verb = platform.verbs[Math.floor(Math.random() * platform.verbs.length)];
    const messageTemplate = messageTemplates[Math.floor(Math.random() * messageTemplates.length)];
    
    // Create notification object
    return {
      id: `notif_${Date.now()}_${i}`,
      title: `${platform.name} Notification`,
      platform: platform.name,
      icon: logoMap[platform.key as keyof typeof logoMap],
      description: messageTemplate(platform.name, verb),
      date: dateStr,
      timestamp: randomTime,
      read: Math.random() > 0.7 // 70% chance of being unread
    };
  });
};

/**
 * Groups notifications by date (Today, Yesterday, or specific date)
 * @param notifications Array of notifications to group
 * @returns Array of notification groups
 */
const groupNotificationsByDate = (notifications: Notification[]): NotificationGroup[] => {
  // Sort notifications by timestamp (newest first)
  const sortedNotifications = [...notifications].sort((a, b) => 
    b.timestamp.getTime() - a.timestamp.getTime()
  );
  
  const groups: Record<string, Notification[]> = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Group notifications by date
  sortedNotifications.forEach(notification => {
    const notifDate = new Date(notification.timestamp);
    notifDate.setHours(0, 0, 0, 0);
    
    let groupKey: string;
    
    if (notifDate.getTime() === today.getTime()) {
      groupKey = 'Today';
    } else if (notifDate.getTime() === yesterday.getTime()) {
      groupKey = 'Yesterday';
    } else {
      // Format as YYYY.MM.DD for older dates
      const year = notifDate.getFullYear();
      const month = String(notifDate.getMonth() + 1).padStart(2, '0');
      const day = String(notifDate.getDate()).padStart(2, '0');
      groupKey = `${year}.${month}.${day}`;
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    
    groups[groupKey].push(notification);
  });
  
  // Convert groups object to array
  const groupsArray: NotificationGroup[] = Object.keys(groups).map(key => ({
    title: key,
    data: groups[key]
  }));
  
  // Sort groups to ensure Today and Yesterday come first
  return groupsArray.sort((a, b) => {
    if (a.title === 'Today') return -1;
    if (b.title === 'Today') return 1;
    if (a.title === 'Yesterday') return -1;
    if (b.title === 'Yesterday') return 1;
    return 0;
  });
};

export default function NotificationScreen() {
  // const router = useRouter();
  // const { name } = useLocalSearchParams();
  const name = usePlatformStore(state => state.platform);
  const {colors} = useThemeColors();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationGroups, setNotificationGroups] = useState<NotificationGroup[]>([]);
  
  // Generate notifications on component mount
  useEffect(() => {
    // console.log(name);
    let generatedNotifications;
    if (name) {
      generatedNotifications = generateNotifications(name as string);
    } else {
      generatedNotifications = generateNotifications();
    }
    setNotifications(generatedNotifications);
    setNotificationGroups(groupNotificationsByDate(generatedNotifications));
  }, []);
  
  // Handle marking all notifications as read
  const markAllAsRead = () => {
    console.log("Marking all notifications as read");
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      read: true
    }));
    
    setNotifications(updatedNotifications);
    setNotificationGroups(groupNotificationsByDate(updatedNotifications));
  };

  return (
    <View className="flex-1">
      {/* Header */}
      <View className="flex-row justify-between items-center p-4" style={{backgroundColor: colors.background}}>
        <View className="flex-row justify-start">
          {/* <TouchableOpacity onPress={() => router.back()} className="self-start">
            <IconSymbol name="back" size={22} color={colors.textTertiary} className="p-2" />
          </TouchableOpacity> */}
          <View className="w-14 h-10 p-2"/>
          <ThemedText type="title" className="ml-3 pt-0.5">Notifications</ThemedText>
        </View>
        <TouchableOpacity 
          onPress={() => markAllAsRead()} 
          className="self-end flex-row py-2"
          activeOpacity={0.7}
        >
          <IconSymbol name="check" size={12} color={colors.brandColor} className="py-1 mr-2"/>
          <ThemedText type="semiSmall" colorValue="brandColor" className="">Mark as read</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Notification List */}
      <ScrollView className="flex-1">
      {notificationGroups.length > 0 ? (
    (() => {
      let globalIndex = 0;

      return notificationGroups.map((group, groupIndex) => (
        <View key={`group-${groupIndex}`}>
          <SectionHeader title={group.title} />
          {group.data.map((notification) => {
            const item = (
              <NotificationItem key={notification.id} notification={notification} index={globalIndex}/>
            );
            globalIndex++;
            return item;
          })}
        </View>
      ));
    })()
        ) : (
          <View className="flex-1 items-center justify-center p-8">
            <ThemedText type="medium" className="text-center text-gray-500">
              No notifications yet
            </ThemedText>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
