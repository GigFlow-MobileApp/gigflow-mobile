import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { usePlatformStore } from '@/store/platformStore';

const platformConfig = {
  uber: {
    name: 'Uber',
    colors: ['#000000', '#276EF1'] as const, // Add as const to make it a tuple
    icon: 'car' as const,
    image: require('../assets/images/logos/uber.png'),
  },
  lyft: {
    name: 'Lyft',
    colors: ['#FF00BF', '#A845DE'] as const,
    icon: 'taxi' as const,
    image: require('../assets/images/logos/lyft.png'),
  },
  doordash: {
    name: 'DoorDash',
    colors: ['#FF1744', '#FF4081'] as const,
    icon: 'food' as const,
    image: require('../assets/images/logos/doordash.png'),
  },
  upwork: {
    name: 'Upwork',
    colors: ['#14A800', '#3AC430'] as const,
    icon: 'laptop' as const,
    image: require('../assets/images/logos/upwork.png'),
  },
  fiverr: {
    name: 'Fiverr',
    colors: ['#1DBF73', '#19A463'] as const,
    icon: 'briefcase' as const,
    image: require('../assets/images/logos/fiverr.png'),
  },
} as const;

type PlatformCardProps = {
  platform: keyof typeof platformConfig;
  balance: string;
  lastEarning: string;
  index: number;
};

export default function PlatformCard({ platform, balance, lastEarning, index }: PlatformCardProps) {
  const config = platformConfig[platform];
  const router = useRouter();
  const setPlatform = usePlatformStore(state => state.setPlatform);
  
  const transparentColors = [
    `${config.colors[0]}30`,
    `${config.colors[1]}30`
  ] as const;

  const handlePress = () => {
    setPlatform(platform);
    router.push({
      pathname: '/main/account/balance',
      params: { 
        platform,
        name: config.name,
        balance: balance,
        lastEarning: lastEarning
      }
    });
  };

  return (
    <Animated.View 
      entering={FadeInRight.delay(index * 200)}
      style={styles.container}
      >
      <TouchableOpacity
        style={[styles.button, { top: -15, left: 15, zIndex: 2 }]}>
        <LinearGradient
          colors={config.colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.buttonGradient}>
          <MaterialCommunityIcons 
            name={config.icon as keyof typeof MaterialCommunityIcons.glyphMap} 
            size={24} 
            color="white" 
          />
          <Text style={styles.buttonText}>{config.name}</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity onPress={handlePress}>
        <View style={styles.card}>
          <LinearGradient
            colors={transparentColors as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGradient}
          >
            <View style={styles.cardContent}>
              <View style={styles.leftContent}>
                <Text style={styles.balanceLabel}>Current Balance</Text>
                <Text style={styles.balanceAmount}>{balance}</Text>
                <View style={styles.lastEarningContainer}>
                  <MaterialCommunityIcons name="trending-up" size={20} color="#10B981" />
                  <Text style={styles.lastEarningText}>Last: {lastEarning}</Text>
                </View>
              </View>

              <View style={styles.rightContent}>
                <Image
                  source={config.image}
                  style={styles.platformImage}
                />
                <MaterialCommunityIcons 
                  name="chevron-right" 
                  size={24} 
                  color="#6B7280"
                  style={styles.chevron}
                />
              </View>
            </View>
          </LinearGradient>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
  },
  button: {
    width: 140,
    height: 45,
    marginBottom: -40,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
    paddingHorizontal: 15,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  card: {
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    overflow: 'hidden', // Important for the gradient to respect borderRadius
  },
  cardGradient: {
    backgroundColor: 'white', // Fallback
    padding: 20,
    paddingTop: 35,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftContent: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  lastEarningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastEarningText: {
    fontSize: 14,
    color: '#10B981',
    marginLeft: 4,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageBackground: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  platformImage: {
    width: 80,
    height: 80,
    borderRadius: 25,
    marginRight: 10,
    resizeMode: 'contain'
  },
  chevron: {
    marginLeft: 5,
  },
}); 
