import {
  View,
  ScrollView,
  Dimensions,
  Pressable,
  RefreshControl,
} from "react-native";
import { useColorScheme } from "@/components/ColorSchemeProvider";
import { Colors } from "@/constants/Colors";
import { useState, useCallback } from "react";
import { LineChart, PieChart } from "react-native-chart-kit";
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
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "react-native";
import { StyleSheet } from "react-native";

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
        labels.unshift(
          new Date(now.getFullYear(), now.getMonth() - i).toLocaleDateString(
            "en-US",
            { month: "short" }
          )
        );
      }
      break;
    case "6M":
      for (let i = 0; i < 6; i++) {
        labels.unshift(
          new Date(now.getFullYear(), now.getMonth() - i).toLocaleDateString(
            "en-US",
            { month: "short" }
          )
        );
      }
      break;
    case "1M":
      for (let i = 0; i < 30; i += 6) {
        labels.unshift(
          new Date(now.getTime() - i * 24 * 60 * 60 * 1000).getDate().toString()
        );
      }
      break;
    case "1W":
      for (let i = 0; i < 7; i++) {
        labels.unshift(
          new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toLocaleDateString(
            "en-US",
            { weekday: "short" }
          )
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

export default function HomeScreen() {
  const { colorScheme } = useColorScheme();
  const [selectedDuration, setSelectedDuration] = useState("1M");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [open, setOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [items, setItems] = useState([
    { label: "All", value: "all" },
    { label: "Uber", value: "uber" },
    { label: "Lyft", value: "lyft" },
    { label: "DoorDash", value: "doordash" },
    { label: "Upwork", value: "upwork" },
    { label: "Fiverr", value: "fiverr" },
  ]);

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
              color: (opacity = 1) => platforms[selectedPlatform].color,
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

  const renderBalanceCard = (
    platform: string,
    amount: number,
    index: number
  ) => {
    const platformKey = platform
      .toLowerCase()
      .replace(" ", "") as keyof typeof platformColors;
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
          <LinearGradient
            colors={["rgba(255,255,255,0.2)", "transparent"]}
            style={styles.cardOverlay}
          />
          <View style={styles.balanceHeader}>
            <Image
              source={{
                uri: `https://logo.clearbit.com/${platform
                  .toLowerCase()
                  .replace(" ", "")}.com`,
              }}
              style={styles.platformLogo}
            />
            <ThemedText style={styles.platformName}>{platform}</ThemedText>
          </View>
          <ThemedText style={styles.balanceAmount}>
            ${amount.toLocaleString()}
          </ThemedText>
          <View style={styles.balanceFooter}>
            <MaterialCommunityIcons
              name="trending-up"
              size={20}
              color="#4ade80"
            />
            <ThemedText style={styles.balanceChange}>+12.5%</ThemedText>
            <ThemedText style={styles.balancePeriod}>this month</ThemedText>
          </View>
        </ModernCard>
      </MotiView>
    );
  };
  const renderActivityItem = (
    activity: { title: string; amount: number; date: string },
    index: number
  ) => (
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
          <ThemedText style={{ fontSize: 16, fontWeight: "600" }}>
            {activity.title}
          </ThemedText>
          <ThemedText style={{ fontSize: 14, opacity: 0.6 }}>
            {activity.date}
          </ThemedText>
        </View>
      </View>
      <ThemedText style={{ fontSize: 16, fontWeight: "600" }}>
        ${activity.amount}
      </ThemedText>
    </MotiView>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[colorScheme as keyof typeof Colors].background,
    },
    section: {
      marginBottom: 24,
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
    platformTitle: {
      fontSize: 18,
      color: "#ffffff",
      fontWeight: "600",
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

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: Colors[colorScheme].background,
      }}
      className="p-4"
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
          data={[
            { platform: "All Platforms", amount: 12500 },
            { platform: "Uber", amount: 3500 },
            { platform: "Lyft", amount: 2800 },
            { platform: "DoorDash", amount: 1900 },
            { platform: "Upwork", amount: 2500 },
            { platform: "Fiverr", amount: 1800 },
          ]}
          renderItem={({ item, index }) =>
            renderBalanceCard(item.platform, item.amount, index)
          }
          keyExtractor={(item) => item.platform}
        />
      </View>

      {/* Graph Section */}
      <Card delay={200}>
        <View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            {["1Y", "6M", "1M", "1W", "1D"].map((duration, index) => (
              <GradientButton
                key={index}
                label={duration}
                isActive={selectedDuration === duration}
                onPress={() => setSelectedDuration(duration)}
              />
            ))}
          </View>
          <View
            style={{
              alignItems: "center"
            }}
          >
            <ModernDropdown
              open={open}
              value={selectedPlatform}
              items={items}
              setOpen={setOpen}
              setValue={setSelectedPlatform}
              setItems={setItems}
            />
          </View>

          <View
            style={{
              alignItems: "center",
              marginLeft: 80
            }}
          >
            <LineChart
              data={lineData}
              width={screenWidth - 40}
              height={220}
              chartConfig={{
                ...chartConfig,
                propsForBackgroundLines: {
                  strokeDasharray: "",
                  stroke: Colors[colorScheme].border,
                  strokeOpacity: 0.1,
                },
                propsForLabels: {
                  fontSize: 12,
                  fontWeight: "600",
                },
                propsForDots: {
                  r: "4",
                  strokeWidth: "2",
                  stroke: "#fff",
                },
                fillShadowGradientFrom: Colors[colorScheme].backgroundCard,
                fillShadowGradientTo: "transparent",
                fillShadowGradientOpacity: 0.3,
                // Adjust label spacing
                decimalPlaces: 0,
                yAxisInterval: 1,
                yAxisSuffix: "",
                yAxisLabel: "$",
                // Improve padding for labels
              }}
              bezier
              style={{
                borderRadius: 16,
                paddingRight: 20, // Add right padding
                paddingLeft: 10, // Add left padding
                paddingTop: 10,
                marginRight: 10, // Add margin to ensure right labels are visible
              }}
              withInnerLines={true}
              withOuterLines={true}
              withVerticalLines={false}
              withHorizontalLabels={true}
              withVerticalLabels={true}
              withDots={true}
              segments={5}
              formatYLabel={(value) => `$${parseInt(value).toLocaleString()}`}
              // Add horizontal padding
              horizontalLabelRotation={0}
              verticalLabelRotation={0}
              xLabelsOffset={10} // Adjust x-axis labels position
              yLabelsOffset={10} // Adjust y-axis labels position
            />
          </View>
        </View>
      </Card>

      {/* Pie Charts */}
      <View style={{ flexDirection: "row", marginTop: 24 }}>
        <Card delay={300} style={{ flex: 1, marginRight: 8 }}>
          <ThemedText
            style={{ fontSize: 18, fontWeight: "600", marginBottom: 16 }}
          >
            Payment Status
          </ThemedText>
          <PieChart
            data={paymentStatusData}
            width={screenWidth / 2 - 48}
            height={160}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
          />
        </Card>
      </View>
      <View style={{ marginTop: 24 }}>
        <Card delay={400} style={{ flex: 1, marginLeft: 8 }}>
          <ThemedText
            style={{ fontSize: 18, fontWeight: "600", marginBottom: 16 }}
          >
            Platform Income
          </ThemedText>
          <PieChart
            data={platformIncomeData}
            width={screenWidth / 2 - 48}
            height={160}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
          />
        </Card>
      </View>

      {/* Account Status */}
      <Card delay={500} style={{ marginTop: 24 }}>
        <ThemedText
          style={{ fontSize: 18, fontWeight: "600", marginBottom: 16 }}
        >
          Account Status
        </ThemedText>
        {Object.entries(platforms).map(([key, platform], index) => (
          <MotiView
            key={index}
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: index * 100 }}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: platform.color,
                  marginRight: 8,
                }}
              />
              <ThemedText style={{ fontSize: 16 }}>{platform.name}</ThemedText>
            </View>
            <ThemedText style={{ fontSize: 16, fontWeight: "600" }}>
              ${(Math.random() * 1000).toFixed(2)}
            </ThemedText>
          </MotiView>
        ))}
      </Card>

      {/* Activity List */}
      <Card delay={600} style={{ marginTop: 24 }}>
        <ThemedText
          style={{ fontSize: 18, fontWeight: "600", marginBottom: 16 }}
        >
          Recent Activity
        </ThemedText>
        {[
          { title: "Uber Payout", amount: 350, date: "2024-01-20" },
          { title: "Lyft Earnings", amount: 280, date: "2024-01-19" },
          { title: "Upwork Payment", amount: 500, date: "2024-01-18" },
          { title: "Fiverr Order", amount: 150, date: "2024-01-17" },
        ].map((activity, index) => (
          <View key={index}>{renderActivityItem(activity, index)}</View>
        ))}
      </Card>
    </ScrollView>
  );
}
