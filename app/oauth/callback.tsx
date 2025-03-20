
import { useEffect } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from "@/constants/config";

export default function OAuthCallback() {
  const { code, error, state } = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Verify state to prevent CSRF attacks
        const savedState = await AsyncStorage.getItem('oauth_state');

        console.log("result 1:", savedState);

        console.log("result", code, "____", error, "____", state, )

        if (state !== savedState) {
          console.error('State mismatch');
          router.replace('/main/account');
          return;
        }

        if (error) {
          console.error('OAuth error:', error);
          router.replace('/main/account');
          return;
        }

        // if (code) {
        //   // Exchange the code for access token
        //   const response = await fetch(`${Config.apiBaseUrl}/api/v1/oauth/uber/callback`, {
        //     method: 'POST',
        //     headers: {
        //       'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({ 
        //       code,
        //       redirect_uri: 'exp://192.168.104.149:8081/--/oauth/callback' 
        //     }),
        //   });

        //   if (!response.ok) {
        //     throw new Error('Failed to exchange code for token');
        //   }

        //   // Clean up state
        //   await AsyncStorage.removeItem('oauth_state');
        // }

        // Always return to account page
        
        router.replace('/main/account');
      } catch (error) {
        console.error('Callback Error:', error);
        router.replace('/main/account');
      }
    };

    handleOAuthCallback();
  }, [code, error, state]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ThemedText>Processing authentication...</ThemedText>
    </View>
  );
}
