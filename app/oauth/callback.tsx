import { useEffect } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';

export default function OAuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    // Handle the OAuth callback
    if (params.code) {
      // Successfully got the code, navigate back to account screen
      router.replace('/main/account');
    } else if (params.error) {
      // Handle error case
      console.error('OAuth Error:', params.error);
      router.replace('/main/account');
    }
  }, [params]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ThemedText>Processing authentication...</ThemedText>
    </View>
  );
}