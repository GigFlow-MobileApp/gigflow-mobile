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
import { View, StyleProp, ViewStyle, Dimensions } from "react-native";
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
  // State to control when scatter points should be rendered
  const [showScatter, setShowScatter] = useState(false);
  const allYValues = lineData.datasets.flatMap(ds => ds.data);
  const maxY = Math.max(...allYValues) * 1.1;
  
  useEffect(() => {
    setShowScatter(false);
    const timer = setTimeout(() => {
      setShowScatter(true);
    }, 1800); // Slightly longer than line animation to ensure lines complete first
    
    return () => clearTimeout(timer); // Cleanup on unmount or data change
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
          height: screenWidth * 1.3,
          width: "100%",
          borderWidth: 1,
          borderColor: Colors[colorScheme].border + '20', // 20% opacity
          shadowColor: Colors[colorScheme].shadow,
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.15,
          shadowRadius: 20,
          elevation: 5,
        },
      ]}
    >
      <View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 16,
            paddingHorizontal: 15,
            paddingVertical: 10,
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
            paddingHorizontal: 20,
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
            height: 300, 
            marginTop: -15,
            backgroundColor: Colors[colorScheme].backgroundCard,
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          <VictoryChart
            key={`chart-${selectedDuration}-${selectedPlatform}-${chartInitTimeRef.current}`}
            width={screenWidth - 40}
            height={(screenWidth - 40) * 0.618 + (30 + 40)}
            domainPadding={{ x: 10, y: 10 }}
            domain={{ y: [-20, maxY * 1.05] }}
            padding={{ top: 40, bottom: 30, left: 40, right: 10 }}
            animate={{
              duration: 800,
              onLoad: { duration: 800 },
              easing: "cubic",
              animationWhitelist: ["style", "data", "size"],
            }}
            containerComponent={
              <VictoryVoronoiContainer
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
              x={screenWidth / 2 - 20}
              y={10}
              textAnchor="middle"
              style={{
                fontSize: 20,
                fontWeight: "bold",
                fill: Colors[colorScheme].primaryText,
                fontFamily: 'System'
              }}
            />
            <VictoryAxis
                tickFormat={(t) => t}
                style={{
                  axis: { stroke: Colors[colorScheme].background },
                  ticks: { stroke: Colors[colorScheme].border },
                  tickLabels: {
                    fill: Colors[colorScheme].textTertiary,
                    fontSize: 12,
                    angle: selectedDuration === "1Y" ? -45 : 0,
                    textAnchor: selectedDuration === "1Y" ? "end" : "middle",
                    fontWeight: '500'
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
                  fontSize: 12,
                  padding: 4,
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
              x={35}
              y={0}
              gutter={20}
              orientation="horizontal"
              style={{ 
                labels: { 
                  fill: Colors[colorScheme].secondaryText,
                  fontSize: 12,
                  fontWeight: '500'
                },
                border: {
                  stroke: Colors[colorScheme].border,
                  strokeWidth: 0,
                  strokeOpacity: 0.5
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
