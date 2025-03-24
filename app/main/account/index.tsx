// app/(drawer)/setting.tsx
import React, { useState, useEffect } from "react";
import { View, Alert, ScrollView, TouchableOpacity, Image } from "react-native";
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
}

type Account = {
  id: string; // unique identifier from backend
  iconName: string;
  balance: number;
  linked: boolean;
};

type AccountResponse = {
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

const AccountItem: React.FC<AccountItemProps> = ({ iconName, balance, linked: initialLinked, onPress }) => {
  const { colorScheme } = useColorScheme();
  const [linked, setLinked] = useState(initialLinked);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');
  const [email, setEmail] = useState("imkiddchina@gmail.com")
  const [password, setPassword] = useState("imkidd1993621")

  const handleSubmit = () => {
    const payload = {
      email,
      password,
    };
    console.log("payload",payload);
    fetch(`https://uber-u41r.onrender.com/drivers/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        console.log("",res)
        if (res.ok) {
          return res.json();
        } else {
          throw new Error("Failed to log in");
        }
      })
      .then((res) => {
        console.log(res);
        localStorage.setItem("token", res.token);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleUberOAuth = async () => {
    try {
      setLoading(true);
      setProgressMessage('Connecting to Uber...');
      
      // const state = Math.random().toString(36).substring(7); // Generate random state
      // const authUrl = `https://sandbox-login.uber.com/oauth/v2/authorize?` +
      //   `client_id=${UBER_CLIENT_ID}` +
      //   `&response_type=code` +
      //   `&redirect_uri=${encodeURIComponent(UBER_REDIRECT_URI)}` +
      //   `&scope=${encodeURIComponent(UBER_SCOPE)}` +
      //   `&state=${state}`;

      // // Store state for verification
      // await AsyncStorage.setItem('oauth_state', state);
      // await AsyncStorage.setItem('linking_platform', iconName);
      
      // console.log("OAuth URL: ", authUrl);
      
      // const supported = await Linking.canOpenURL(authUrl);
      
      // if (supported) {
      //   await Linking.openURL(authUrl);
      // } else {
      //   throw new Error("Can't open OAuth URL");
      // }

      
    } catch (error) {
      console.error('OAuth Error:', error);
      Alert.alert('Connection Failed', 'Failed to connect with Uber');
      setLinked(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLyftOAuth = async () => {
    try {
      setLoading(true);
      setProgressMessage('Connecting to Lyft...');
      
      const state = Math.random().toString(36).substring(7);
      const authUrl = `https://api.lyft.com/oauth/authorize?` +
        `client_id=${LYFT_CLIENT_ID}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent(LYFT_SCOPE)}` +
        `&state=${state}` +
        `&redirect_uri=${encodeURIComponent(LYFT_REDIRECT_URI)}`;

      await AsyncStorage.setItem('oauth_state', state);
      await AsyncStorage.setItem('linking_platform', 'lyft');
      
      console.log("Lyft OAuth URL: ", authUrl);
      
      const supported = await Linking.canOpenURL(authUrl);
      
      if (supported) {
        await Linking.openURL(authUrl);
      } else {
        throw new Error("Can't open OAuth URL");
      }
    } catch (error) {
      console.error('Lyft OAuth Error:', error);
      Alert.alert('Connection Failed', 'Failed to connect with Lyft');
      setLinked(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
                setLinked(false);
              } else {
                switch (iconName) {
                  case 'uber':
                    await handleSubmit();
                    break;
                  case 'lyft':
                    await handleLyftOAuth();
                    break;
                  // Add other platforms here
                }
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
                <View className="py-3" />
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
              try {
                setLoading(true);
                setProgressMessage('Connecting to Uber...');
                handleSubmit();
              } catch (error) {
                console.error('OAuth Error:', error);
                Alert.alert('Connection Failed', 'Failed to connect with Uber');
                setLinked(false);
              } finally {
                setLoading(false);
              }
            }}
          >
            <IconSymbol name="link" size={16} color={Colors[colorScheme].btnText} className="pr-2" />
            <ThemedText type="defautlSmall" colorValue="btnText">
              {linked ? "linked" : "unlinked"}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity onPress={onPress} disabled={!linked} className="flex-row justify-end p-3">
            <IconSymbol name="gear" size={22} color="primaryText" />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

const accountData: Account[] = [
  { id: "1", iconName: "uber", balance: 0, linked: false },
  { id: "2", iconName: "lyft", balance: 0, linked: false },
  { id: "3", iconName: "doordash", balance: 0, linked: false },
  { id: "4", iconName: "upwork", balance: 0, linked: false },
  { id: "5", iconName: "fiverr", balance: 0, linked: false },
];

export default function AccountScreen() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const { colorScheme } = useColorScheme();
  const router = useRouter();

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        // const res = await fetch("https://your-backend.com/api/accounts");

        // if (!res.ok) {
        //   const errorText = await res.text();
        //   throw new Error(`HTTP ${res.status}: ${errorText}`);
        // }

        // const text = await res.text(); // fetch as text first

        // try {
        //   const data: Account[] = JSON.parse(text);
        //   setAccounts(data);
        // } catch (jsonError) {
        //   console.log("❌ Failed to parse JSON. Raw response:\n", text);
        //   throw jsonError;
        // }
        throw Error("");
      } catch (error) {
        console.log("Error fetching accounts:", error);
        console.log("Using Mockdata...");
        // Fall back to using accountData when API request fails
        setAccounts(accountData);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  return (
    <View className="rounded-3xl" style={{ backgroundColor: Colors[colorScheme].background }}>
      <ThemedText type="title" className="self-center" style={{paddingTop: 20}}>
        Your Accounts
      </ThemedText>
      {/* account list */}
      <ScrollView showsVerticalScrollIndicator={false} className="pt-4 h-full">
        {accounts.map((account) => {
          return (
            <AccountItem
              key={account.id}
              iconName={account.iconName}
              balance={account.balance}
              linked={account.linked}
              onPress={() =>
                router.push({
                  pathname: "/main/home/balance",
                  params: { name: account.iconName },
                })
              }
            />
          );
        })}
      </ScrollView>
    </View>
  );
}
