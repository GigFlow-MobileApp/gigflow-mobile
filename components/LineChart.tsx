import {
  VictoryChart,
  VictoryLine,
  VictoryAxis,
  VictoryTooltip,
  VictoryVoronoiContainer,
  VictoryLegend,
  VictoryScatter,
  VictoryLabel,
  VictoryArea
} from "victory-native";
import React, { useState, useEffect } from "react";
import { View, StyleProp, ViewStyle, Dimensions, Platform } from "react-native";
import { platformColor } from "@/constants/Colors";
import { MotiView } from 'moti';
import { GradientButton } from "@/components/ui/GradientButton";
import { ModernDropdown } from "@/components/ui/ModernDropDown";

type PlatformType = {
  name: string;
  color: string;
};

type Platforms = {
  [key: string]: PlatformType;
};

type Dataset = {
  data: number[];
  color: (opacity: number) => string;
  strokeWidth: number;
};

type LineData = {
  labels: string[];
  datasets: Dataset[];
};

type Props = {
  selectedDuration: string;
  setSelectedDuration: (duration: string) => void;
  selectedPlatform: string;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedPlatform: (callback: (value: string | null) => string) => void;
  items: Array<{ label: string; value: string }>;
  setItems: (
    callback: (items: Array<{ label: string; value: string }>) => Array<{ label: string; value: string }>
  ) => void;
  lineData: LineData;
  chartInitTimeRef: React.RefObject<number>;
  platforms: Platforms;
  Colors: any;
  colorScheme: string;
  transformDataForVictory: (data: number[], labels: string[]) => Array<{ x: string; y: number }>;
};

const screenWidth = Dimensions.get("window").width;

export default function LineChart({
  selectedDuration,
  setSelectedDuration,
  selectedPlatform,
  open,
  setOpen,
  setSelectedPlatform,
  items,
  setItems,
  lineData,
  chartInitTimeRef,
  platforms,
  Colors,
  colorScheme,
  transformDataForVictory,
}: Props) {
  const [showScatter, setShowScatter] = useState(false);
  const allYValues = lineData.datasets.flatMap(ds => ds.data);
  const maxY = Math.max(...allYValues) * 1.1;
  const [readyToRenderChart, setReadyToRenderChart] = useState(false);
  
  // Calculate proper dimensions with platform-specific adjustments
  const chartWidth = Platform.OS === 'ios' ? screenWidth - 48 : screenWidth - 32;
  const chartHeight = Platform.OS === 'ios' ? chartWidth * 0.6 : chartWidth * 0.618;
  
  useEffect(() => {
    setShowScatter(false);
    const timer = setTimeout(() => {
      setShowScatter(true);
    }, 1800);
    
    return () => clearTimeout(timer);
  }, [selectedDuration, selectedPlatform, chartInitTimeRef.current]);

  const generateTicks = (maxY: number, numberOfTicks = 5) => {
    // Round up maxY to nearest 100
    const roundedMaxY = Math.ceil(maxY / 100) * 100;
  
    // Step between ticks: must divide roundedMaxY evenly by (numberOfTicks - 1)
    const step = Math.ceil(roundedMaxY / (numberOfTicks - 1) / 100) * 100;
    const finalMax = step * (numberOfTicks - 1);
  
    // Generate evenly spaced tick values from 0 to finalMax
    return Array.from({ length: numberOfTicks }, (_, i) => i * step);
  };

  return (
    <MotiView
      from={{
        opacity: 0,
        scale: 0.9,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      transition={{
        type: 'timing',
        duration: 800,
        delay: 200,
      }}
      style={[
        {
          backgroundColor: Colors[colorScheme].backgroundCard,
          borderRadius: 24,
          margin: Platform.OS === 'ios' ? 16 : 16,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: Colors[colorScheme].border + '20',
          shadowColor: Colors[colorScheme].shadow,
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.15,
          shadowRadius: 20,
          elevation: 5,
          alignSelf: 'center', // Add this to center the card
          width: Platform.OS === 'ios' ? screenWidth - 32 : screenWidth - 32, // Consistent width
        },
      ]}
    >
      <View style={{ 
        padding: Platform.OS === 'ios' ? 16 : 16,
        width: '100%', // Ensure full width
      }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 16,
            paddingHorizontal: 8,
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
        <View
          style={{
            alignItems: "center",
            marginBottom: 16,
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
            height: chartHeight,
            width: '100%', // Ensure full width
            backgroundColor: Colors[colorScheme].backgroundCard,
            borderRadius: 12,
            overflow: 'hidden',
            alignItems: 'center', // Center the chart
          }}
        >
          <VictoryChart
            key={`chart-${selectedDuration}-${selectedPlatform}-${chartInitTimeRef.current}`}
            width={chartWidth}
            height={chartHeight}
            domainPadding={{ x: Platform.OS === 'ios' ? 25 : 20, y: 20 }}
            domain={{ y: [0, maxY * 1.05] }}
            padding={{
              top: 40,
              bottom: 40,
              left: Platform.OS === 'ios' ? 60 : 50,
              right: Platform.OS === 'ios' ? 30 : 20
            }}
            animate={{
              duration: 800,
              onLoad: { duration: 800 },
              easing: "cubic",
            }}
            containerComponent={
              <VictoryVoronoiContainer
                responsive={true} // Add this
                labels={({ datum }) => `$${datum.y.toLocaleString()}`}
                labelComponent={
                  <VictoryTooltip
                    flyoutStyle={{
                      fill: Colors[colorScheme].backgroundCard,
                      stroke: Colors[colorScheme].border,
                      strokeWidth: 1.5,
                    }}
                    style={{ 
                      fill: Colors[colorScheme].primaryText,
                      fontWeight: 'bold',
                      fontSize: 14
                    }}
                    flyoutPadding={{ top: 8, bottom: 8, left: 12, right: 12 }}
                    cornerRadius={8}
                  />
                }
              />
            }
          >
            <VictoryLabel
              text="Earnings Overview"
              x={chartWidth / 2}
              y={20}
              textAnchor="middle"
              style={{
                fontSize: 18,
                fontWeight: "bold",
                fill: Colors[colorScheme].primaryText,
              }}
            />
            <VictoryAxis
              tickFormat={(t) => t}
              style={{
                axis: { stroke: Colors[colorScheme].border },
                ticks: { stroke: Colors[colorScheme].border, size: 5 },
                tickLabels: {
                  fill: Colors[colorScheme].textTertiary,
                  fontSize: Platform.OS === 'ios' ? 10 : 12,
                  angle: selectedDuration === "1Y" ? -45 : 0,
                  textAnchor: selectedDuration === "1Y" ? "end" : "middle",
                  fontWeight: '500',
                  padding: Platform.OS === 'ios' ? 10 : 8,
                },
                grid: {
                  stroke: Colors[colorScheme].border,
                  strokeDasharray: "4",
                  opacity: 0.25,
                },
              }}
            />
            <VictoryAxis 
              dependentAxis 
              tickValues={[0, ...generateTicks(maxY * 1.05)]}
              tickFormat={(t) => {
                if (t < 1000) {
                  return `$${Math.round(t)}`;
                } else if (t < 1000000) {
                  return `$${(t / 1000).toFixed(1)}k`;
                } else {
                  return `$${(t / 1000000).toFixed(1)}m`;
                }
              }} 
              style={{
                axis: { stroke: Colors[colorScheme].background },
                ticks: { stroke: Colors[colorScheme].border },
                tickLabels: {
                  fill: Colors[colorScheme].textTertiary,
                  fontSize: Platform.OS === 'ios' ? 10 : 12,
                  padding: Platform.OS === 'ios' ? 8 : 4,
                  fontWeight: '500'
                },
                grid: {
                  stroke: Colors[colorScheme].border,
                  strokeDasharray: "4",
                  opacity: 0.25,
                },
              }}/>
            {/* Render areas with gradients for better visual appeal - only if not showing ALL platforms */}
            {selectedPlatform !== "all" && lineData.datasets.map((dataset, index) => {
              const keySuffix = `${selectedPlatform}-${selectedDuration}-${index}`;
              const transformedData = transformDataForVictory(dataset.data, lineData.labels);
              return (
                <VictoryArea
                  key={`area-${keySuffix}`}
                  data={transformedData}
                  interpolation="monotoneX"
                  style={{ 
                    data: { 
                      fill: dataset.color(1),
                      fillOpacity: 0.2,
                    }
                  }}
                  animate={{ 
                    onLoad: { duration: 800 }
                  }}
                />
              );
            })}
            
            {/* Render all lines */}
            {lineData.datasets.map((dataset, index) => {
              const keySuffix = `${selectedPlatform}-${selectedDuration}-${index}`;
              const transformedData = transformDataForVictory(dataset.data, lineData.labels);
              return (
                <VictoryLine
                  key={`line-${keySuffix}`}
                  data={transformedData}
                  interpolation="monotoneX"
                  style={{ 
                    data: { 
                      stroke: dataset.color(1), 
                      strokeWidth: 2,
                      strokeLinecap: "round"
                    } 
                  }}
                />
              );
            })}
            
            {/* Only render scatter points after lines have finished animating */}
            {showScatter && lineData.datasets.map((dataset, index) => {
              const keySuffix = `${selectedPlatform}-${selectedDuration}-${index}`;
              const transformedData = transformDataForVictory(dataset.data, lineData.labels);
              return (
                <VictoryScatter
                  key={`scatter-${keySuffix}`}
                  data={transformedData} size={2}
                  style={{
                    data: {
                      fill: dataset.color(0.5),
                      stroke: dataset.color(0.5),
                      strokeWidth: 1,
                      strokeOpacity: 1,
                    },
                  }}
                />
              );
            })}
          </VictoryChart>
          {selectedPlatform === "all" && (
            <VictoryLegend
              x={20}
              y={0}
              orientation="horizontal"
              gutter={20}
              style={{ 
                labels: { 
                  fill: Colors[colorScheme].secondaryText,
                  fontSize: 12,
                  fontWeight: '500'
                }
              }}
              data={[
                { name: "All", symbol: { fill: Colors[colorScheme].brandColor, size: 6 } },
                { name: "Uber", symbol: { fill: platformColor.uber, size: 6 } },
                { name: "Lyft", symbol: { fill: platformColor.lyft, size: 6 } },
                { name: "Upwork", symbol: { fill: platformColor.upwork, size: 6 } },
              ]}
            />
          )}
        </View>
      </View>
    </MotiView>
  );
}