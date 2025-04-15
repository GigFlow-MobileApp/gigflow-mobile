import React, { useState, useEffect, useRef } from "react";
import { 
  View, 
  Alert, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Animated, 
  StyleSheet, 
  Dimensions,
  ActivityIndicator
} from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useColorScheme } from "@/components/ColorSchemeProvider";
import { Colors } from "@/constants/Colors";
import { ThemedText } from "@/components/ThemedText";
import { useRouter } from "expo-router";
import Config from "@/constants/config";
import { Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePlatformStore } from "@/store/platformStore";
import { BlurView } from 'expo-blur';
import { MotiView } from 'moti';
import { Easing } from 'react-native-reanimated';

interface AccountItemProps {
  iconName: string;
  balance: number;
  linked: boolean;
  onPress: () => void;
  accounts: Account[];
  setAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
  index: number; // For staggered animation
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
const UBER_CLIENT_SECRET = 'MFon_j8gT4QMz9z5AJDUPejfKiMFToOyeDmrgez8';
const UBER_REDIRECT_URI = 'exp://192.168.104.149:8081/--/oauth/callback'; 
const UBER_SCOPE = 'profile'; // Add required scopes  partner.payments partner.trips

const LYFT_CLIENT_ID = 'your_lyft_client_id';
const LYFT_REDIRECT_URI = 'exp://192.168.104.149:8081/--/oauth/callback';
const LYFT_SCOPE = 'profile';

// Modern loading dialog component
const LoadingDialog = ({ visible, message }: { visible: boolean; message: string }) => {
  if (!visible) return null;
  
  return (
    <View style={styles.loadingOverlay}>
      <BlurView intensity={80} style={styles.blurContainer}>
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 300 }}
          style={styles.loadingContainer}
        >
          <ActivityIndicator size="large" color="#ffffff" />
          <ThemedText type="defautlSmall" colorValue="btnText" style={styles.loadingText}>
            {message}
          </ThemedText>
        </MotiView>
      </BlurView>
    </View>
  );
};

const AccountItem: React.FC<AccountItemProps> = ({ 
  iconName, 
  balance, 
  linked, 
  onPress, 
  accounts,
  setAccounts,
  index
}) => {
  const { colorScheme } = useColorScheme();
  const [loading, setLoading] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
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
            `&client_secret=${UBER_CLIENT_SECRET}` +
            `&response_type=code` +
            `&state=${state}` +  // Add state parameter to URL query string
            `&redirect_uri=${encodeURIComponent(UBER_REDIRECT_URI)}`;
          break;
        case 'lyft':
          authUrl = `https://api.lyft.com/oauth/authorize?` +
            `client_id=${LYFT_CLIENT_ID}` +
            `&response_type=code` +
            `&scope=${encodeURIComponent(LYFT_SCOPE)}` +
            `&state=${state}` +
            `&redirect_uri=${encodeURIComponent(LYFT_REDIRECT_URI)}`;
          break;
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }

      await AsyncStorage.setItem('oauth_state', state);  // Store state
      await AsyncStorage.setItem('linking_platform', platform.toLowerCase());
      
      const supported = await Linking.canOpenURL(authUrl);
      
      if (supported) {
        const subscription = Linking.addEventListener('url', async ({ url }) => {
          if (url.includes('/oauth/callback')) {
            try {
              // Extract both code and state from callback URL
              const code = url.match(/code=([^&|#]+)/)?.[1];
              const returnedState = url.match(/state=([^&|#]+)/)?.[1];
              
              // Verify state parameter
              const savedState = await AsyncStorage.getItem('oauth_state');
              if (!returnedState || returnedState !== savedState) {
                throw new Error('Invalid state parameter');
              }

              console.log("Code: ",code)

              if (code) {
                setProgressMessage('Getting access token...');
                
                const tokenResponse = await fetch('https://sandbox-login.uber.com/oauth/v2/token', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                  },
                  body: new URLSearchParams({
                    client_id: UBER_CLIENT_ID,
                    client_secret: UBER_CLIENT_SECRET,
                    grant_type: 'authorization_code',
                    redirect_uri: UBER_REDIRECT_URI,
                    code: code,
                  }).toString(),
                });

                if (tokenResponse.ok) {
                  const tokenData = await tokenResponse.json();
                  console.log("TokenData: ",tokenData)
                  await AsyncStorage.setItem('uber_access_token', tokenData.access_token);
                  await AsyncStorage.setItem('uber_refresh_token', tokenData.refresh_token);
                  Alert.alert('Success', 'Successfully connected to Uber');
                } else {
                  throw new Error('Failed to get access token');
                  const errorData = await tokenResponse.json();
                  console.error('Token exchange error:', errorData);
                }
              }
            } catch (error) {
              console.error('Token exchange error:', error);
              Alert.alert('Error', 'Failed to complete Uber connection');
            } finally {
              // Clean up stored state
              await AsyncStorage.removeItem('oauth_state');
              subscription.remove();
            }
          }
        });

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

  const confirmLinkToggle = () => {
    Alert.alert(
      "Connection",
      `Do you want to ${linked ? "un" : ""}link this account?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: async () => {
            if (linked) {
              try {
                setLoading(true);
                setProgressMessage(`Disconnecting ${iconName}...`);
                
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
              } finally {
                setLoading(false);
              }
            } else {
              handlePlatformOAuth(iconName);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <>
      <LoadingDialog visible={loading} message={progressMessage} />
      <MotiView
        from={{ 
          opacity: 0,
          translateY: 20
        }}
        animate={{ 
          opacity: 1,
          translateY: 0
        }}
        transition={{
          type: 'timing',
          duration: 400,
          delay: index * 100,
          easing: Easing.out(Easing.ease)
        }}
        style={[
          styles.accountCard,
          { backgroundColor: Colors[colorScheme].background || '#ffffff10' }
        ]}
      >
        <View style={styles.accountContent}>
          <View style={styles.leftContent}>
            <MotiView
              from={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: 'spring',
                delay: (index * 100) + 200,
                damping: 15
              }}
              style={styles.iconContainer}
            >
              <Image 
                source={iconMap[iconName]} 
                style={styles.platformIcon} 
                resizeMode="cover" 
              />
            </MotiView>
            
            <View style={styles.accountInfo}>
              <ThemedText 
                type="semiSmall" 
                colorValue={linked ? "menuItemText" : "tabIconDefault"}
                style={styles.accountLabel}
              >
                {linked ? "Balance" : "Not Connected"}
              </ThemedText>
              
              {linked && (
                <MotiView
                  from={{ translateX: -10, opacity: 0 }}
                  animate={{ translateX: 0, opacity: 1 }}
                  transition={{ delay: (index * 100) + 300 }}
                >
                  <ThemedText 
                    type="title" 
                    colorValue="text" 
                    style={styles.balanceText}
                  >
                    {"$"}{Number(balance).toFixed(2)}
                  </ThemedText>
                </MotiView>
              )}
            </View>
          </View>
          
          <View style={styles.rightContent}>
            <TouchableOpacity
              style={[
                styles.linkButton,
                { 
                  backgroundColor: linked 
                    ? Colors[colorScheme].btnBackground 
                    : Colors[colorScheme].tabIconDefault 
                }
              ]}
              onPress={confirmLinkToggle}
            >
              <IconSymbol 
                name="link" 
                size={16} 
                color={Colors[colorScheme].btnText} 
                style={styles.linkIcon} 
              />
              <ThemedText 
                type="defautlSmall" 
                colorValue="btnText"
              >
                {linked ? "linked" : "unlinked"}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={onPress} 
              style={styles.settingsButton}
            >
              <MotiView
                from={{ rotate: '0deg' }}
                animate={{ rotate: '0deg' }}
                transition={{ type: 'timing', duration: 300 }}
                // whileHover={{ rotate: '30deg' }}
              >
                <IconSymbol 
                  name="gear" 
                  size={22} 
                  color={linked ? "primaryText" : "tabIconDefault"} 
                />
              </MotiView>
            </TouchableOpacity>
          </View>
        </View>
      </MotiView>
    </>
  );
};

export default function AccountScreen() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [progressMessage, setProgressMessage] = useState('Loading your accounts...');
  const { colorScheme } = useColorScheme();
  const setPlatform = usePlatformStore((state) => state.setPlatform);
  const router = useRouter();
  
  // Define all supported platforms
  const supportedPlatforms = ['uber', 'lyft', 'doordash', 'upwork', 'fiverr'];

  useEffect(() => {
    const fetchAccounts = async () => {
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
    <View style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      <LoadingDialog visible={loading} message={progressMessage} />
      
      <MotiView
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 600 }}
        style={styles.headerContainer}
      >
        <ThemedText type="title" style={styles.headerTitle}>
          Your Accounts
        </ThemedText>
      </MotiView>
      
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {accounts.map((account, index) => (
          <AccountItem
            key={account.id}
            iconName={account.type}
            balance={account.balance}
            linked={account.connection_status}
            accounts={accounts}
            setAccounts={setAccounts}
            index={index}
            onPress={() => {
              setPlatform(account.type as string);
              router.push("/main/account/balance");
            }}
          />
        ))}
        
        {/* Extra space at bottom for better scrolling */}
        <View style={styles.scrollFooter} />
      </ScrollView>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingTop: 30,
    paddingBottom: 10,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  scrollFooter: {
    height: 40,
  },
  accountCard: {
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  accountContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rightContent: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 80,
  },
  iconContainer: {
    padding: 2,
    borderRadius: 30,
    overflow: 'hidden',
  },
  platformIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  accountInfo: {
    marginLeft: 16,
    justifyContent: 'center',
  },
  accountLabel: {
    marginBottom: 4,
  },
  balanceText: {
    fontSize: 24,
    fontWeight: '700',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  linkIcon: {
    marginRight: 6,
  },
  settingsButton: {
    padding: 10,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  blurContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    width: width * 0.8,
    maxWidth: 300,
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
    color: '#ffffff',
  },
});
