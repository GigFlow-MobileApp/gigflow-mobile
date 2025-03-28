// app/(drawer)/setting.tsx
import React, { useState, useEffect, useRef } from "react";
import { View, Alert, ScrollView, TouchableOpacity, Image, Animated } from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useColorScheme } from "@/components/ColorSchemeProvider";
import { Colors } from "@/constants/Colors";
import { ThemedText } from "@/components/ThemedText";
import { useRouter } from "expo-router";
import Config from "@/constants/config";
import { Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProgressDialog } from '@/components/ProgressDialog';

interface AccountItemProps {
  iconName: string;
  balance: number;
  linked: boolean;
  onPress: () => void;
  accounts: Account[];
  setAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
  index?: number; // For staggered animation
}

type Account = {
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

const iconMap: Record<string, any> = {
  uber: require("@/assets/images/logos/uber.png"),
  lyft: require("@/assets/images/logos/lyft.png"),
  doordash: require("@/assets/images/logos/doordash.png"),
  upwork: require("@/assets/images/logos/upwork.png"),
  fiverr: require("@/assets/images/logos/fiverr.png"),
};

const UBER_CLIENT_ID = 'vT7OiMCjk6_L_q7RW2R9Juo6NYVP1pz0';
const UBER_REDIRECT_URI = 'exp://localhost:8081/--/oauth/callback'; 
const UBER_SCOPE = 'profile'; // Add required scopes  partner.payments partner.trips

const LYFT_CLIENT_ID = 'your_lyft_client_id';
const LYFT_REDIRECT_URI = 'exp://192.168.104.149:8081/--/oauth/callback';
const LYFT_SCOPE = 'profile';

const AccountItem: React.FC<AccountItemProps> = ({ 
  iconName, 
  balance, 
  linked, 
  onPress, 
  accounts,  // Add these props to the component parameters
  setAccounts 
}) => {
  const { colorScheme } = useColorScheme();
  const [loading, setLoading] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // Animation values
  const imageTranslateX = useRef(new Animated.Value(-200)).current;
  const contentTranslateX = useRef(new Animated.Value(200)).current;

  const handlePlatformOAuth = async (platform: string) => {
    try {
      setLoading(true);
      setProgressMessage(`Connecting to ${platform}...`);
      
      const state = Math.random().toString(36).substring(7);
      let authUrl = '';

      switch (platform.toLowerCase()) {
        case 'uber':
          authUrl = `https://sandbox-login.uber.com/oauth/v2/authorize?` +
            `client_id=${UBER_CLIENT_ID}` +
            `&response_type=code` +
            `&redirect_uri=${encodeURIComponent(UBER_REDIRECT_URI)}` +
            `&scope=${encodeURIComponent(UBER_SCOPE)}` +
            `&state=${state}`;
          break;
        case 'lyft':
          authUrl = `https://api.lyft.com/oauth/authorize?` +
            `client_id=${LYFT_CLIENT_ID}` +
            `&response_type=code` +
            `&scope=${encodeURIComponent(LYFT_SCOPE)}` +
            `&state=${state}` +
            `&redirect_uri=${encodeURIComponent(LYFT_REDIRECT_URI)}`;
          break;
        // Add other platforms here
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }

      await AsyncStorage.setItem('oauth_state', state);
      await AsyncStorage.setItem('linking_platform', platform.toLowerCase());
      
      const supported = await Linking.canOpenURL(authUrl);
      
      if (supported) {
        await Linking.openURL(authUrl);
      } else {
        throw new Error("Can't open OAuth URL");
      }
    } catch (error) {
      console.error(`${platform} OAuth Error:`, error);
      Alert.alert('Connection Failed', `Failed to connect with ${platform}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Entrance animation with staggered delay based on index
    const animationDelay = 100; // 100ms delay between items
    
    Animated.parallel([
      Animated.timing(imageTranslateX, {
        toValue: 0,
        duration: 300,
        delay: animationDelay,
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslateX, {
        toValue: 0,
        duration: 300,
        delay: animationDelay,
        useNativeDriver: true,
      }),
    ]).start();
    
    if (showConfirmDialog) {
      Alert.alert(
        "Connection",
        `Do you want to ${linked ? "un" : ""}link this account?`,
        [
          {
            text: "Cancel",
            onPress: () => setShowConfirmDialog(false),
            style: "cancel",
          },
          {
            text: "Yes",
            onPress: async () => {
              if (linked) {
                try {
                  // Call API to unlink the account
                  await fetch(`${Config.apiBaseUrl}/api/v1/accounts/${iconName}/disconnect`, {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${await AsyncStorage.getItem('userToken')}`,
                      'Accept': 'application/json',
                      'Content-Type': 'application/json',
                    },
                  });
                  
                  // Update the accounts state in the parent component
                  const updatedAccounts = accounts.map(account => 
                    account.type === iconName 
                      ? { ...account, connection_status: false }
                      : account
                  );
                  setAccounts(updatedAccounts);
                } catch (error) {
                  console.error('Failed to unlink account:', error);
                  Alert.alert('Error', 'Failed to unlink account');
                }
              } else {
                handlePlatformOAuth(iconName);
              }
              setShowConfirmDialog(false);
            },
          },
        ],
        { cancelable: true }
      );
    }
  }, [showConfirmDialog]);

  return (
    <>
      <ProgressDialog visible={loading} message={progressMessage} />
      <View
        className="flex flex-row justify-between align-center px-5 pt-4"
        style={{
          borderBottomWidth: 1,
          borderColor: Colors[colorScheme].tabIconDefault,
        }}
      >
        <View className="flex flex-row">
          <View className="pt-2 pl-1">
            <Image source={iconMap[iconName]} style={{ width: 52, height: 52, borderRadius: 25 }} resizeMode="cover" />
          </View>
          <View className="flex flex-col justify-between ml-6">
            {linked ? (
              <>
                <ThemedText type="semiSmall" colorValue="menuItemText" className="py-3">
                  Balance
                </ThemedText>
                <ThemedText type="title" colorValue="text" className="pt-2 pb-1">
                  {"$"}
                  {Number(balance).toFixed(2)}
                </ThemedText>
              </>
            ) : (
              <>
                <View className="py-3">
                  <ThemedText type="semiSmall" colorValue="menuItemText">
                    Not Connected
                  </ThemedText>
                </View>
                <View className="pt-3" />
              </>
            )}
          </View>
        </View>
        <View className="flex flex-col justify-between">
          <TouchableOpacity
            className="mt-2 px-3 py-1 rounded-lg flex-row items-center"
            style={{ backgroundColor: linked ? Colors[colorScheme].btnBackground : Colors[colorScheme].tabIconDefault }}
            onPress={() => {
              setShowConfirmDialog(true);
            }}
          >
            <IconSymbol name="link" size={16} color={Colors[colorScheme].btnText} className="pr-2" />
            <ThemedText type="defautlSmall" colorValue="btnText">
              {linked ? "linked" : "unlinked"}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={onPress} 
            // disabled={!linked} 
            className="flex-row justify-end p-3">
            <IconSymbol 
              name="gear" 
              size={22} 
              color={linked ? "primaryText" : "tabIconDefault"} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default function AccountScreen() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [progressMessage, setProgressMessage] = useState(''); // Add this state
  const { colorScheme } = useColorScheme();
  const router = useRouter();
  
  // Animation value for title fade-in
  const titleOpacity = useRef(new Animated.Value(0)).current;

  // Define all supported platforms
  const supportedPlatforms = ['uber', 'lyft', 'doordash', 'upwork', 'fiverr'];

  useEffect(() => {
    // Title fade-in animation
    Animated.timing(titleOpacity, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
    
    const fetchAccounts = async () => {
      setProgressMessage('Fetching your accounts...'); // Set message before fetching
      try {
        // First, create default accounts for all platforms
        const defaultAccounts = supportedPlatforms.map(platform => ({
          id: `default-${platform}`,
          type: platform,
          balance: 0,
          token: "",
          is_active: false,
          connection_status: false,
          description: `${platform.charAt(0).toUpperCase() + platform.slice(1)} account`,
          user_id: "",
          last_updated: new Date().toISOString()
        }));

        // Fetch connected accounts from API
        const response = await fetch(`${Config.apiBaseUrl}/api/v1/accounts`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${await AsyncStorage.getItem('userToken')}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const connectedAccounts: Account[] = await response.json();
        
        // Update default accounts with connected account data
        const finalAccounts = defaultAccounts.map(defaultAccount => {
          const connectedAccount = connectedAccounts.find(
            account => account.type === defaultAccount.type
          );
          return connectedAccount || defaultAccount;
        });

        setAccounts(finalAccounts);
      } catch (error) {
        console.log("Error fetching accounts:", error);
        // Fallback to default accounts if API fails
        const defaultAccounts = supportedPlatforms.map(platform => ({
          id: `default-${platform}`,
          type: platform,
          balance: 0,
          token: "",
          is_active: false,
          connection_status: false,
          description: `${platform.charAt(0).toUpperCase() + platform.slice(1)} account`,
          user_id: "",
          last_updated: new Date().toISOString()
        }));
        setAccounts(defaultAccounts);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  return (
    <View className="rounded-3xl" style={{ backgroundColor: Colors[colorScheme].background }}>
      <ProgressDialog visible={loading} message={progressMessage} />
      <ThemedText type="title" className="self-center" style={{paddingTop: 20}}>
        Your Accounts
      </ThemedText>
      <ScrollView showsVerticalScrollIndicator={false} className="pt-4 h-full">
        {accounts.map((account) => (
          <AccountItem
            key={account.id}
            iconName={account.type}
            balance={account.balance}
            linked={account.connection_status}
            accounts={accounts}
            setAccounts={setAccounts}
            onPress={() =>
              router.push({
                pathname: "/main/home/balance",
                params: { name: account.type },
              })
            }
          />
        ))}
      </ScrollView>
    </View>
  );
}
