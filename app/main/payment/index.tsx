import React, { useState } from 'react';
import { View, StyleSheet, Alert, Linking, TouchableOpacity, Dimensions } from 'react-native';
import { createLinkToken } from '@/apis/plaidAPI';
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useThemeColors } from "@/components/ColorSchemeProvider";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Config from '@/constants/config';

const { width } = Dimensions.get('window');
const CARD_PADDING = 20;
const CARD_WIDTH = width - (CARD_PADDING * 2);

const CARD_NUMBER = "4242 4242 4242 4242";
const VALID_THRU = "12/26";
const CVV = "123";

export default function PaymentScreen() {
  const { colors } = useThemeColors();
  const [isLoading, setIsLoading] = useState(false);

  const initializePlaid = async () => {
    try {
      setIsLoading(true);
      const token = await createLinkToken();
      const plaidUrl = `https://cdn.plaid.com/link/v2/stable/link.html?token=${token}&redirect_uri=${encodeURIComponent(Config.plaidRedirectUri)}`;
      await AsyncStorage.setItem('plaid_link_token', token);
      
      const supported = await Linking.canOpenURL(plaidUrl);
      if (supported) {
        await Linking.openURL(plaidUrl);
      } else {
        throw new Error("Can't open Plaid URL");
      }
    } catch (error) {
      console.error('Error initializing Plaid:', error);
      Alert.alert('Error', 'Failed to initialize bank connection');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.cardContainer}>
        <LinearGradient
          colors={['#6366f1', '#4f46e5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="credit-card-chip-outline" size={32} color="white" />
            <View style={styles.bankInfo}>
              <ThemedText style={styles.bankName} colorValue="btnText">
                Virtual Bank
              </ThemedText>
              <MaterialCommunityIcons name="contactless-payment" size={24} color="white" />
            </View>
          </View>

          <View style={styles.cardMiddle}>
            <View style={styles.chip} />
            <View style={styles.nfc} />
          </View>

          <View style={styles.cardNumberContainer}>
            <ThemedText style={styles.cardNumber} colorValue="btnText">
              {CARD_NUMBER}
            </ThemedText>
          </View>

          <View style={styles.cardBottom}>
            <View style={styles.cardInfo}>
              <View>
                <ThemedText style={styles.cardLabel} colorValue="btnText">
                  VALID THRU
                </ThemedText>
                <ThemedText style={styles.cardValue} colorValue="btnText">
                  {VALID_THRU}
                </ThemedText>
              </View>
              <View>
                <ThemedText style={styles.cardLabel} colorValue="btnText">
                  CVV
                </ThemedText>
                <ThemedText style={styles.cardValue} colorValue="btnText">
                  {CVV}
                </ThemedText>
              </View>
            </View>
          </View>

          <View style={styles.cardDecoration}>
            <View style={styles.circle1} />
            <View style={styles.circle2} />
          </View>
        </LinearGradient>

        <TouchableOpacity 
          onPress={initializePlaid}
          disabled={isLoading}
          style={styles.linkButton}
        >
          <LinearGradient
            colors={['#10B981', '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.linkButtonGradient}
          >
            <MaterialCommunityIcons name="link-variant" size={20} color="white" />
            <ThemedText style={styles.linkButtonText} colorValue="btnText">
              {isLoading ? "Connecting..." : "Link Bank Account"}
            </ThemedText>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: CARD_PADDING,
    justifyContent: 'center',
  },
  cardContainer: {
    width: CARD_WIDTH,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    height: CARD_WIDTH * 0.63,
    borderRadius: 16,
    padding: 24,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  bankInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bankName: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginRight: 8,
  },
  cardMiddle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  chip: {
    width: 45,
    height: 34,
    backgroundColor: '#FFD700',
    borderRadius: 6,
    opacity: 0.9,
  },
  nfc: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    marginLeft: 10,
    transform: [{ rotate: '45deg' }],
  },
  cardNumberContainer: {
    marginBottom: 20,
  },
  cardNumber: {
    fontSize: 24,
    letterSpacing: 2,
    color: 'white',
    fontFamily: 'monospace',
  },
  cardBottom: {
    marginTop: 'auto',
  },
  cardInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 16,
    color: 'white',
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  cardDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    borderRadius: 16,
  },
  circle1: {
    position: 'absolute',
    top: -CARD_WIDTH * 0.5,
    right: -CARD_WIDTH * 0.3,
    width: CARD_WIDTH,
    height: CARD_WIDTH,
    borderRadius: CARD_WIDTH * 0.5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  circle2: {
    position: 'absolute',
    bottom: -CARD_WIDTH * 0.6,
    left: -CARD_WIDTH * 0.3,
    width: CARD_WIDTH,
    height: CARD_WIDTH,
    borderRadius: CARD_WIDTH * 0.5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  linkButton: {
    width: '80%',
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  linkButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  linkButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
