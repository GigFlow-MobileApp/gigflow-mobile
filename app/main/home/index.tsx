import { View, ScrollView, Dimensions, Pressable, RefreshControl, Text, TouchableOpacity } from "react-native";
import { useColorScheme } from "@/components/ColorSchemeProvider";
import { Colors } from "@/constants/Colors";
import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { PieChart } from "react-native-chart-kit";
import LineChart from "@/components/LineChart";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/ui/Card";
import { GradientButton } from "@/components/ui/GradientButton";
import { ModernDropdown } from "@/components/ui/ModernDropDown";
import { ModernCard } from "@/components/ui/ModernCard";
import { Header } from "@/components/ui/Header";
import { MotiView, AnimatePresence } from "moti";
import { LinearGradient } from "expo-linear-gradient";
import DropDownPicker from "react-native-dropdown-picker";
import { FlatList } from "react-native-gesture-handler";
import Animated, { FadeInUp, FadeInRight } from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image, StyleSheet } from "react-native";
import PlatformCard from "@/components/PlatformCard";
import { VictoryPie } from "victory-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from "@/constants/config";


type Account = {
  last_earning: any;
  id: string;
  type: string;
  balance: number;
  token: string;
  is_active: boolean;
  connection_status: boolean;
  description: string;
  user_id: string;
  last_updated: string;
};


const screenWidth = Dimensions.get("window").width;

// Mock data generator
const generateRandomData = (points: number) => {
  return Array(points)
    .fill(0)
    .map(() => Math.random() * 1000);
};

const generateTimeLabels = (duration: string) => {
  const now = new Date();
  const labels = [];
  switch (duration) {
    case "1Y":
      for (let i = 0; i < 12; i++) {
        labels.unshift(new Date(now.getFullYear(), now.getMonth() - i).toLocaleDateString("en-US", { month: "short" }));
      }
      break;
    case "6M":
      for (let i = 0; i < 6; i++) {
        labels.unshift(new Date(now.getFullYear(), now.getMonth() - i).toLocaleDateString("en-US", { month: "short" }));
      }
      break;
    case "1M":
      for (let i = 0; i < 30; i += 6) {
        labels.unshift(new Date(now.getTime() - i * 24 * 60 * 60 * 1000).getDate().toString());
      }
      break;
    case "1W":
      for (let i = 0; i < 7; i++) {
        labels.unshift(
          new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { weekday: "short" })
        );
      }
      break;
    case "1D":
      for (let i = 0; i < 24; i += 4) {
        labels.unshift(`${i}:00`);
      }
      break;
    default:
      labels.push(...["Jan", "Feb", "Mar", "Apr", "May", "Jun"]);
  }
  return labels;
};

const platforms = {
  uber: { name: "Uber", color: "#000000" },
  lyft: { name: "Lyft", color: "#FF00BF" },
  doordash: { name: "DoorDash", color: "#FF3008" },
  upwork: { name: "Upwork", color: "#14a800" },
  fiverr: { name: "Fiverr", color: "#1DBF73" },
};

const platformColors = {
  uber: ["#000000", "#333333"],
  lyft: ["#FF00BF", "#B4008C"],
  doordash: ["#FF3008", "#CC2606"],
  upwork: ["#14a800", "#108600"],
  fiverr: ["#1DBF73", "#17995C"],
  all: ["#6366f1", "#4f46e5"],
};

const paymentData = [
  { status: "Success", value: 85, color: "#10B981" },
  { status: "In Progress", value: 15, color: "#6366F1" },
];

// Add this helper function for data transformation
const transformDataForVictory = (data: number[], labels: string[]) => {
  const result = data
    .map((y, index) => ({
      x: labels[index],
      y: y,
    }))
    .filter(({ x, y }) => x !== undefined && y !== undefined);
  // console.log(result);
  return result;
};

export default function Home() {
  const { colorScheme } = useColorScheme();
  const [selectedDuration, setSelectedDuration] = useState("1M");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [open, setOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const chartInitTimeRef = useRef(performance.now());

  useMemo(() => {
    chartInitTimeRef.current = performance.now();
  }, [selectedPlatform, selectedDuration]);

  const now = performance.now();
  const elapsed = now - chartInitTimeRef.current;
  const shouldShowScatter = elapsed > 1000;

  const [items, setItems] = useState([
    { label: "All", value: "all" },
    { label: "Uber", value: "uber" },
    { label: "Lyft", value: "lyft" },
    { label: "DoorDash", value: "doordash" },
    { label: "Upwork", value: "upwork" },
    { label: "Fiverr", value: "fiverr" },
  ]);

  const [platformEarnings, setPlatformEarnings] = useState([
    { platform: "uber", balance: "$0.00", lastEarning: "+$0.00", isActive: false },
    { platform: "lyft", balance: "$0.00", lastEarning: "+$0.00", isActive: false },
    { platform: "doordash", balance: "$0.00", lastEarning: "+$0.00", isActive: false },
    { platform: "upwork", balance: "$0.00", lastEarning: "+$0.00", isActive: false },
    { platform: "fiverr", balance: "$0.00", lastEarning: "+$0.00", isActive: false },
  ]);

  const [totalBalance, setTotalBalance] = useState(0);

  useEffect(() => {
    const fetchPlatformEarnings = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const response = await fetch(
          `${Config.apiBaseUrl}/api/v1/accounts/?` +
          `skip=0&limit=100&` +
          `start_date=2018-01-01T00:00:00.000Z&` +
          `end_date=2025-04-10T23:59:59.999Z`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'accept': 'application/json',
              'content-Type': 'application/json',
            },
          }
        );

        if (response.status === 401) {
          const errorText = await response.text();
          console.log('Full error response:', errorText);
          throw new Error(`Authentication failed: ${errorText}`);
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const connectedAccounts: Account[] = await response.json();
        let total = 0;
        
        const updatedEarnings = platformEarnings.map(platform => {
          const account = connectedAccounts.find(acc => acc.type === platform.platform);
          const balance = account ? account.balance : 0;
          total += balance;
          
          return {
            ...platform,
            balance: `$${balance.toFixed(2)}`,
            isActive: account ? account.is_active : false,
            lastEarning: account?.last_earning ? `+$${account.last_earning.toFixed(2)}` : "+$0.00",
          };
        });

        setPlatformEarnings(updatedEarnings);
        setTotalBalance(total);
      } catch (error) {
        console.log("Error fetching platform earnings:", error);
      }
    };

    fetchPlatformEarnings();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  const chartConfig = {
    backgroundColor: Colors[colorScheme].backgroundCard,
    backgroundGradientFrom: Colors[colorScheme].backgroundCard,
    backgroundGradientTo: Colors[colorScheme].backgroundCard,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
  };

  const platformData = [
    { name: "Uber", color: "#000000", percent: 45 },
    { name: "Lyft", color: "#FF00BF", percent: 30 },
    { name: "DoorDash", color: "#FF1744", percent: 25 },
    { name: "Upwork", color: "#3AC430", percent: 30 },
    { name: "Fiverr", color: "#10B981", percent: 25 },
  ];

  const lineData = {
    labels: generateTimeLabels(selectedDuration),
    datasets:
      selectedPlatform === "all"
        ? [
            {
              data: generateRandomData(6),
              color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
              strokeWidth: 2,
            },
            {
              data: generateRandomData(6),
              color: (opacity = 1) => platforms.uber.color,
              strokeWidth: 2,
            },
            {
              data: generateRandomData(6),
              color: (opacity = 1) => platforms.lyft.color,
              strokeWidth: 2,
            },
            {
              data: generateRandomData(6),
              color: (opacity = 1) => platforms.upwork.color,
              strokeWidth: 2,
            },
          ]
        : [
            {
              data: generateRandomData(6),
              color: (opacity = 1) => platforms[selectedPlatform as keyof typeof platforms].color,
              strokeWidth: 2,
            },
          ],
  };

  const paymentStatusData = [
    {
      name: "Complete",
      population: 75,
      color: "#4CAF50",
      legendFontColor: Colors[colorScheme].text,
    },
    {
      name: "In Progress",
      population: 25,
      color: "#2196F3",
      legendFontColor: Colors[colorScheme].text,
    },
  ];

  const platformIncomeData = [
    {
      name: "Uber",
      population: 30,
      color: platforms.uber.color,
      legendFontColor: Colors[colorScheme].text,
    },
    {
      name: "Lyft",
      population: 20,
      color: platforms.lyft.color,
      legendFontColor: Colors[colorScheme].text,
    },
    {
      name: "DoorDash",
      population: 15,
      color: platforms.doordash.color,
      legendFontColor: Colors[colorScheme].text,
    },
    {
      name: "Upwork",
      population: 20,
      color: platforms.upwork.color,
      legendFontColor: Colors[colorScheme].text,
    },
    {
      name: "Fiverr",
      population: 15,
      color: platforms.fiverr.color,
      legendFontColor: Colors[colorScheme].text,
    },
  ];

  const recentActivity = [
    {
      id: "1",
      title: "Payment Received",
      amount: "+$2,500.00",
      date: "2024-02-20",
      platform: "Stripe",
      type: "income",
    },
    {
      id: "2",
      title: "Withdrawal",
      amount: "-$1,200.00",
      date: "2024-02-19",
      platform: "PayPal",
      type: "withdrawal",
    },
  ];

  const renderBalanceCard = (platform: string, amount: number, index: number) => {
    const platformKey = platform.toLowerCase().replace(" ", "") as keyof typeof platformColors;
    const colors = platformColors[platformKey] || platformColors.all;

    return (
      <MotiView
        from={{ opacity: 0, scale: 0.9, translateY: 20 }}
        animate={{ opacity: 1, scale: 1, translateY: 0 }}
        transition={{
          type: "spring",
          delay: index * 100,
          damping: 15,
        }}
        style={styles.balanceCardContainer}
      >
        <ModernCard gradient gradientColors={colors} style={styles.balanceCard}>
          <LinearGradient colors={["rgba(255,255,255,0.2)", "transparent"]} style={styles.cardOverlay} />
          <View style={styles.balanceHeader}>
            <Image
              source={{
                uri: `https://logo.clearbit.com/${platform.toLowerCase().replace(" ", "")}.com`,
              }}
              style={styles.platformLogo}
            />
            <ThemedText style={styles.platformName}>{platform}</ThemedText>
          </View>
          <ThemedText style={styles.balanceAmount}>${amount.toLocaleString()}</ThemedText>
          <View style={styles.balanceFooter}>
            <MaterialCommunityIcons name="trending-up" size={20} color="#4ade80" />
            <ThemedText style={styles.balanceChange}>+12.5%</ThemedText>
            <ThemedText style={styles.balancePeriod}>this month</ThemedText>
          </View>
        </ModernCard>
      </MotiView>
    );
  };

  const renderActivityItem = (activity: { title: string; amount: number; date: string }, index: number) => (
    <MotiView
      from={{ opacity: 0, translateX: 50 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ delay: index * 100 }}
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors[colorScheme].border,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <LinearGradient
          colors={["#6366f1", "#4f46e5"]}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            justifyContent: "center",
            alignItems: "center",
            marginRight: 12,
          }}
        >
          {/* <Activity size={20} color="#ffffff" /> */}
        </LinearGradient>
        <View>
          <ThemedText style={{ fontSize: 16, fontWeight: "600" }}>{activity.title}</ThemedText>
          <ThemedText style={{ fontSize: 14, opacity: 0.6 }}>{activity.date}</ThemedText>
        </View>
      </View>
      <ThemedText style={{ fontSize: 16, fontWeight: "600" }}>${activity.amount}</ThemedText>
    </MotiView>
  );

  const styles = StyleSheet.create({
    card: {
      padding: 24,
      borderRadius: 16,
      // marginTop: 20,
    },
    container: {
      flex: 1,
      backgroundColor: Colors[colorScheme as keyof typeof Colors].background,
      marginTop: 20,
      padding: 0,
    },
    section: {
      marginBottom: 24,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 24,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#fff",
      marginLeft: 12,
      letterSpacing: 0.5,
    },
    content: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    chartContainer: {
      width: 160,
      height: 160,
      justifyContent: "center",
      alignItems: "center",
    },
    centerStats: {
      position: "absolute",
      alignItems: "center",
    },
    centerValue: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#fff",
    },
    centerLabel: {
      fontSize: 14,
      color: "#94A3B8",
      marginTop: 4,
    },
    statsContainer: {
      flex: 1,
      marginLeft: 24,
    },
    illustration: {
      width: "100%",
      height: 120,
      borderRadius: 16,
      marginBottom: 20,
    },
    stats: {
      gap: 16,
    },
    statItem: {
      marginBottom: 12,
    },
    statHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 8,
    },
    statLabel: {
      fontSize: 14,
      color: "#94A3B8",
    },
    statValue: {
      fontSize: 20,
      fontWeight: "bold",
      color: "#fff",
      marginBottom: 8,
    },
    progressBar: {
      height: 6,
      backgroundColor: "rgba(148, 163, 184, 0.2)",
      borderRadius: 3,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      borderRadius: 3,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 24,
      fontWeight: "bold",
    },
    balanceCardContainer: {
      marginRight: 16,
    },
    balanceCard: {
      width: screenWidth * 0.7,
      height: 180,
      padding: 20,
    },
    cardOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 80,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
    },
    balanceHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    platformLogo: {
      width: 32,
      height: 32,
      borderRadius: 16,
      marginRight: 12,
    },
    platformName: {
      fontSize: 18,
      color: "#ffffff",
      fontWeight: "600",
    },
    balanceAmount: {
      fontSize: 32,
      fontWeight: "bold",
      color: "#ffffff",
      marginBottom: 12,
    },
    balanceFooter: {
      flexDirection: "row",
      alignItems: "center",
    },
    balanceChange: {
      fontSize: 14,
      color: "#4ade80",
      marginLeft: 4,
      marginRight: 8,
    },
    balancePeriod: {
      fontSize: 14,
      color: "#ffffff",
      opacity: 0.8,
    },
    graphCard: {
      marginBottom: 24,
      padding: 20,
    },
    graphHeader: {
      marginBottom: 20,
    },
    durationButtons: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    graphContainer: {
      alignItems: "center",
    },
    graph: {
      marginVertical: 8,
      borderRadius: 16,
    },
    statsSection: {
      marginBottom: 24,
    },
    platformCardContainer: {
      marginBottom: 16,
    },
    platformCard: {
      padding: 20,
    },
    platformHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    platformIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      marginRight: 12,
    },
    platformInfo: {
      flex: 1,
    },
    platformSection: {
      backgroundColor: Colors[colorScheme].backgroundCard,
      marginTop: 20,
      marginBottom: 16,
      padding: 16,
      borderRadius: 16,
      elevation: 2,
      color: "#FF000085",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    platformContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    pieChartContainer: {
      justifyContent: "center",
      alignItems: "center",
    },
    platformList: {
      alignSelf: "stretch",
    },
    platformItem: {
      padding: 8,
    },
    platformPercent: {
      fontSize: 12,
      color: "#6B7280",
    },
    fractionContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "baseline",
      marginTop: 20,
      marginBottom: 20,
    },
    fractionText: {
      fontSize: 24,
      fontWeight: "bold",
    },
    platformTitle: {
      fontSize: 18,
      color: "#ffffff",
      fontWeight: "600",
    },
    platformCardsSection: {
      margin: 2,
    },
    platformStats: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    platformAmount: {
      fontSize: 24,
      color: "#ffffff",
      fontWeight: "bold",
    },
    platformPercentage: {
      flexDirection: "row",
      alignItems: "center",
    },
    percentageText: {
      fontSize: 14,
      color: "#ffffff",
      marginLeft: 8,
    },
    activityCard: {
      marginBottom: 24,
    },
    activityItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: "rgba(255,255,255,0.1)",
    },
    activityLeft: {
      flexDirection: "row",
      alignItems: "center",
    },
    activityIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    activityTitle: {
      fontSize: 16,
      fontWeight: "600",
    },
    activityDate: {
      fontSize: 14,
      opacity: 0.6,
    },
    activityAmount: {
      fontSize: 16,
      fontWeight: "600",
    },
    activitySection: {
      backgroundColor: "white",
    },
    activityInfo: {
      flex: 1,
    },
    seeAllButton: {
      flexDirection: "row",
      alignItems: "center",
    },
    seeAllText: {
      fontSize: 14,
      fontWeight: "600",
      marginRight: 4,
    },
  });

  // Update the FlatList data to use the actual total and platform balances
  const balanceCardData = [
    { platform: "All Platforms", amount: totalBalance },
    ...platformEarnings.map(item => ({
      platform: item.platform.charAt(0).toUpperCase() + item.platform.slice(1),
      amount: parseFloat(item.balance.replace('$', '')),
    }))
  ];

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: Colors[colorScheme].background,
      }}
      className="p-4"
      showsVerticalScrollIndicator={false}
    >
      {/* Balance Cards */}
      <View style={{ marginBottom: 24 }}>
        <ThemedText
          style={{
            fontSize: 24,
            fontWeight: "bold",
            marginBottom: 16,
            textAlign: "right",
          }}
        >
          Your Balance
        </ThemedText>
        <FlatList
          horizontal
          scrollEnabled={true}
          showsHorizontalScrollIndicator={false}
          data={balanceCardData}
          renderItem={({ item, index }) => renderBalanceCard(item.platform, item.amount, index)}
          keyExtractor={(item) => item.platform}
        />
      </View>

      {/* Graph Section */}
      <LineChart
        selectedDuration={selectedDuration}
        setSelectedDuration={setSelectedDuration}
        selectedPlatform={selectedPlatform}
        open={open}
        setOpen={setOpen}
        setSelectedPlatform={setSelectedPlatform}
        items={items}
        setItems={setItems}
        lineData={lineData}
        chartInitTimeRef={chartInitTimeRef}
        platforms={platforms}
        Colors={Colors}
        colorScheme={colorScheme}
        transformDataForVictory={transformDataForVictory}
      />

      {/* Pie Charts */}
      <Animated.View entering={FadeInUp.delay(200)} style={styles.container}>
        <LinearGradient colors={["#1E293B", "#0F172A"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
          <View style={styles.header}>
            <MaterialCommunityIcons name="credit-card-check" size={28} color="#6366F1" />
            <Text style={styles.title}>Payment Status</Text>
          </View>

          <View style={styles.content}>
            <View style={{ flexDirection: "column" }}>
              <View style={styles.chartContainer}>
                <VictoryPie
                  data={paymentData}
                  x="status"
                  y="value"
                  colorScale={paymentData.map((d) => d.color)}
                  radius={80}
                  innerRadius={60}
                  labelRadius={({ innerRadius }) => ((innerRadius as number) + 80) / 2.5}
                  style={{
                    labels: { fill: "transparent" },
                  }}
                  animate={{
                    duration: 1000,
                    easing: "bounce",
                  }}
                />
                <View style={styles.centerStats}>
                  <Text style={styles.centerValue}>85%</Text>
                  <Text style={styles.centerLabel}>Success</Text>
                </View>
              </View>

              {/* Added fraction text below pie chart */}
              <View style={styles.fractionContainer}>
                <Text style={[styles.fractionText, { color: "#10B981" }]}>46</Text>
                <Text style={[styles.fractionText, { color: "#6366F1" }]}>/50</Text>
              </View>
            </View>

            <View style={styles.statsContainer}>
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?q=80&w=500",
                }}
                style={styles.illustration}
              />
              <View style={styles.stats}>
                {paymentData.map((item) => (
                  <View key={item.status} style={styles.statItem}>
                    <View style={styles.statHeader}>
                      <View style={[styles.dot, { backgroundColor: item.color }]} />
                      <Text style={styles.statLabel}>{item.status}</Text>
                    </View>
                    <Text style={styles.statValue}>{item.value}%</Text>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${item.value}%`,
                            backgroundColor: item.color,
                          },
                        ]}
                      />
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Platform Distribution */}
      <Animated.View entering={FadeInUp.delay(800)} style={[styles.platformSection, { paddingVertical: 24 }]}>
        <Text style={[styles.sectionTitle, { marginBottom: 20 }]}>Platform Distribution</Text>
        <View style={[styles.platformContainer, { alignItems: "flex-start" }]}>
          {/* Left side - Pie Chart */}
          <View style={[styles.pieChartContainer, { flex: 1.2 }]}>
            <VictoryPie
              data={platformData.map((p) => ({ x: p.name, y: p.percent }))}
              colorScale={platformData.map((p) => p.color)}
              radius={({ datum }) => 100}
              innerRadius={50}
              labelRadius={({ datum, innerRadius }) => {
                const radius = typeof innerRadius === "number" ? innerRadius : 40;
                return (radius + 90) / 2.3;
              }}
              labels={({ datum }) => `${datum.y}%`}
              style={{
                labels: {
                  fill: Colors[colorScheme].logoText,
                  fontSize: 12,
                  fontWeight: "bold",
                },
              }}
              width={220}
              height={220}
              padding={35}
              animate={{
                duration: 1000,
                easing: "bounce",
              }}
            />
          </View>

          {/* Right side - Platform List */}
          <View
            style={[
              styles.platformList,
              {
                flex: 1,
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                padding: 16,
                borderRadius: 12,
                justifyContent: "center",
              },
            ]}
          >
            {platformData.map((platform, index) => (
              <View
                key={platform.name}
                style={[
                  styles.platformItem,
                  {
                    marginBottom: index === platformData.length - 1 ? 0 : 6,
                    flexDirection: "row",
                    alignItems: "center",
                  },
                ]}
              >
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: platform.color,
                    marginRight: 12,
                  }}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: Colors[colorScheme].text,
                      marginBottom: 4,
                    }}
                  >
                    {platform.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: Colors[colorScheme].secondaryText,
                      opacity: 0.8,
                    }}
                  >
                    ${platform.percent.toLocaleString()}k
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    color: platform.color,
                  }}
                >
                  {platform.percent}%
                </Text>
              </View>
            ))}
          </View>
        </View>
      </Animated.View>

      {/* Account Status */}
      <Card delay={500} style={{ marginTop: 24 }}>
        <Animated.View entering={FadeInUp.delay(800)} style={styles.platformCardsSection}>
          <Text style={styles.sectionTitle}>Platform Earnings</Text>
          {platformEarnings.map((item, index) => (
            <PlatformCard
              key={item.platform}
              platform={item.platform as any}
              balance={item.balance}
              lastEarning={item.lastEarning}
              index={index}
            />
          ))}
        </Animated.View>
      </Card>

      {/* Activity List */}
      <Card delay={600} style={{ marginTop: 24 }}>
        <Animated.View entering={FadeInUp.delay(1000)} style={styles.activitySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>See All</Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#6366F1" />
            </TouchableOpacity>
          </View>
          {recentActivity.map((activity) => (
            <Animated.View key={activity.id} entering={FadeInRight.delay(200)} style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <MaterialCommunityIcons
                  name={activity.type === "income" ? "arrow-down-circle" : "arrow-up-circle"}
                  size={24}
                  color={activity.type === "income" ? "#10B981" : "#EF4444"}
                />
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activityDate}>{activity.date}</Text>
              </View>
              <Text style={[styles.activityAmount, { color: activity.type === "income" ? "#10B981" : "#EF4444" }]}>
                {activity.amount}
              </Text>
            </Animated.View>
          ))}
        </Animated.View>
      </Card>
      <View className="h-16"/>
    </ScrollView>
  );
}
