
import { useEffect } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from "@/constants/config";
import axios from 'axios';
import { useState } from 'react';
import { ProgressDialog } from '@/components/ProgressDialog';
import { Alert } from 'react-native';

export default function OAuthCallback() {
  const [loading, setLoading] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');
  const router = useRouter();
  const { code, state, error } = useLocalSearchParams();

  useEffect(() => {
    console.log("call back called")
    const handleOAuthCallback = async () => {
      try {
        if (error) {
          throw new Error(error.toString());
        }

        const savedState = await AsyncStorage.getItem('oauth_state');
        const platform = await AsyncStorage.getItem('linking_platform');

        if (state !== savedState) {
          throw new Error('Invalid state parameter');
        }

        if (code) {
          setLoading(true);
          
          switch (platform) {
            case 'uber':
              setProgressMessage('Connecting your Uber account...');
              await axios.post(
                `${Config.apiBaseUrl}/api/v1/oauth/uber/connect`,
                { code, state }
              );
              break;
              
            case 'lyft':
              setProgressMessage('Connecting your Lyft account...');
              await axios.post(
                `${Config.apiBaseUrl}/api/v1/oauth/lyft/connect`,
                { code, state }
              );
              break;
          }

          // Clean up state
          await AsyncStorage.removeItem('oauth_state');
          await AsyncStorage.removeItem('linking_platform');
        }

        router.replace('/main/account');
      } catch (error) {
        console.error('Callback Error:', error);
        Alert.alert('Error', 'Failed to connect account');
        router.replace('/main/account');
      } finally {
        setLoading(false);
      }
    };

    handleOAuthCallback();
  }, [code, error, state]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ProgressDialog visible={loading} message={progressMessage} />
      <ThemedText>Processing OAuth callback...</ThemedText>
    </View>
  );
}
