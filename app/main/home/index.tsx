import { View, ScrollView, Dimensions, Pressable } from "react-native";
import { useColorScheme } from "@/components/ColorSchemeProvider";
import { Colors } from "@/constants/Colors";
import { useState } from "react";
import { LineChart, PieChart } from "react-native-chart-kit";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/ui/Card";
import { GradientButton } from "@/components/ui/GradientButton";
import { MotiView } from "moti";
import { LinearGradient } from "expo-linear-gradient";
import DropDownPicker from "react-native-dropdown-picker";
import { FlatList } from "react-native-gesture-handler";

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

export default function HomeScreen() {
  const { colorScheme } = useColorScheme();
  const [selectedDuration, setSelectedDuration] = useState("1M");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [open, setOpen] = useState(false);

  const [items, setItems] = useState([
    { label: "All", value: "all" },
    { label: "Uber", value: "uber" },
    { label: "Lyft", value: "lyft" },
    { label: "DoorDash", value: "doordash" },
    { label: "Upwork", value: "upwork" },
    { label: "Fiverr", value: "fiverr" },
  ]);

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
  ) => (
    <Card
      delay={index * 100}
      style={{
        width: screenWidth * 0.7,
        marginRight: 16,
        marginVertical: 8,
      }}
    >
      <LinearGradient
        colors={["#6366f1", "#4f46e5"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 80,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        }}
      />
      <View style={{ marginTop: 40 }}>
        <ThemedText style={{ fontSize: 32, opacity: 0.8 }}>
          {platform}
        </ThemedText>
        <ThemedText style={{ fontSize: 32, fontWeight: "bold", marginTop: 8 }}>
          ${amount.toLocaleString()}
        </ThemedText>
      </View>
    </Card>
  );

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
            textAlign: 'right' 
          }}
        >
          Your Balance
        </ThemedText>
        <FlatList
          horizontal
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
        <View style={{ marginBottom: 24 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            {["1Y", "6M", "1M", "1W", "1D"].map((duration) => (
              <GradientButton
                key={duration}
                label={duration}
                isActive={selectedDuration === duration}
                onPress={() => setSelectedDuration(duration)}
              />
            ))}
          </View>

          <DropDownPicker
            open={open}
            value={selectedPlatform}
            items={items}
            setOpen={setOpen}
            setValue={setSelectedPlatform}
            setItems={setItems}
            style={{
              backgroundColor: Colors[colorScheme].background,
              borderColor: Colors[colorScheme].border,
              marginBottom: 16,
            }}
            textStyle={{
              color: Colors[colorScheme].text,
            }}
            dropDownContainerStyle={{
              backgroundColor: Colors[colorScheme].background,
              borderColor: Colors[colorScheme].border,
            }}
          />

          <LineChart
            data={lineData}
            width={screenWidth - 80}
            height={220}
            chartConfig={{
              ...chartConfig,
              propsForBackgroundLines: {
                strokeDasharray: "",
                stroke: Colors[colorScheme].border,
                strokeOpacity: 0.1,
              },
            }}
            bezier
            style={{
              borderRadius: 16,
            }}
          />
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
            key={key}
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
        ].map((activity, index) => renderActivityItem(activity, index))}
      </Card>
    </ScrollView>
  );
}
