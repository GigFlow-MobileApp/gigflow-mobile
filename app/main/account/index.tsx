// app/(drawer)/setting.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Platform, TouchableOpacity, Text } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import Config from '@/constants/config';

WebBrowser.maybeCompleteAuthSession();

const UBER_CLIENT_ID = 'zWjTtPk-NXJTmybcPRvDkqE-QmHt7gT1';
const UBER_CLIENT_SECRET = 'aiWITz0K2wneae_LzoF8GEhK8I4EqMxk_qyTGrOP';

const REDIRECT_URI = AuthSession.makeRedirectUri(); // Ensure this matches Uber dashboard
const AUTH_URL = `https://auth.uber.com/oauth/v2/authorize?client_id=${UBER_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=history%20history_lite%20profile`;

const LYFT_CLIENT_ID = 'YOUR_LYFT_CLIENT_ID';
const LYFT_CLIENT_SECRET = 'YOUR_LYFT_CLIENT_SECRET';

interface ServiceState {
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Get the redirect URL dynamically based on environment
const getRedirectUri = () => {
  if (__DEV__) {
    // In development, use the local development URL
    const redirect = AuthSession.makeRedirectUri({
      scheme: 'myapp',
      path: 'oauth/callback'
    });
    console.log('Redirect URI:', redirect); // For debugging
    return redirect;
  } else {
    // In production, use your app scheme
    return 'myapp://oauth/callback';
  }
};

const uberAuthConfig = {
  clientId: UBER_CLIENT_ID,
  clientSecret: UBER_CLIENT_SECRET,
  scopes: ['profile partner.accounts'],
  redirectUri: "exp://192.168.104.149:8081/--/oauth/callback",
  serviceConfiguration: {
    authorizationEndpoint: 'https://login.uber.com/oauth/v2/authorize',
    tokenEndpoint: 'https://login.uber.com/oauth/v2/token',
  }
};

const lyftAuthConfig = {
  clientId: LYFT_CLIENT_ID,
  clientSecret: LYFT_CLIENT_SECRET,
  scopes: ['public', 'profile', 'rides.read', 'offline'],
  redirectUri: "exp://192.168.104.149:8081/--/oauth/callback",
  serviceConfiguration: {
    authorizationEndpoint: 'https://api.lyft.com/oauth/authorize',
    tokenEndpoint: 'https://api.lyft.com/oauth/token',
  }
};

export default function AccountScreen() {

  const [uberState, setUberState] = useState<ServiceState>({
    isAuthenticated: false,
    isLoading: false,
  });

  const [lyftState, setLyftState] = useState<ServiceState>({
    isAuthenticated: false,
    isLoading: false,
  });

  useEffect(() => {
    const checkAuthStatus = async () => {
      const [uberToken, lyftToken] = await Promise.all([
        SecureStore.getItemAsync('uber_access_token'),
        SecureStore.getItemAsync('lyft_access_token')
      ]);
      
      setUberState({
        isAuthenticated: !!uberToken,
        isLoading: false,
      });
      
      setLyftState({
        isAuthenticated: !!lyftToken,
        isLoading: false,
      });
    };
    checkAuthStatus();
  }, []);

  const handleUberAuth = async () => {
    try {
      setUberState(prev => ({ ...prev, isLoading: true }));
      
      const authRequest = new AuthSession.AuthRequest({
        clientId: uberAuthConfig.clientId,
        clientSecret: uberAuthConfig.clientSecret,
        scopes: uberAuthConfig.scopes,
        redirectUri: uberAuthConfig.redirectUri,
        usePKCE: true,
      });

      const authResult = await authRequest.promptAsync(uberAuthConfig.serviceConfiguration);
      
      console.log("### auth request:", authRequest)

      console.log("auth result:", authResult)
      
      // if (authResult.type === 'success') {
      //   // Token exchange should happen on your backend
      //   const tokenResponse = await fetch(`${Config.apiBaseUrl}/api/v1/uber/token-exchange`, {
      //     method: 'POST',
      //     headers: {
      //       'Content-Type': 'application/json',
      //     },
      //     body: JSON.stringify({
      //       code: authResult.params.code,
      //       code_verifier: authRequest.codeVerifier,
      //       redirect_uri: uberAuthConfig.redirectUri
      //     }),
      //   });

      //   if (!tokenResponse.ok) {
      //     throw new Error('Token exchange failed');
      //   }

      //   const tokenData = await tokenResponse.json();
        
      //   await SecureStore.setItemAsync('uber_access_token', tokenData.access_token);
      //   await SecureStore.setItemAsync('uber_refresh_token', tokenData.refresh_token);

      //   setUberState({
      //     isAuthenticated: true,
      //     isLoading: false,
      //   });
      // } else {
      //   throw new Error(authResult.type || 'Authentication failed');
      // }
    } catch (error) {
      console.error('Uber auth error:', error);
      setUberState({
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  const handleUberDisconnect = async () => {
    await SecureStore.deleteItemAsync('uber_access_token');
    await SecureStore.deleteItemAsync('uber_refresh_token');
    setUberState({ isAuthenticated: false, isLoading: false });
  };

  const handleLyftAuth = async () => {
    try {
      setLyftState(prev => ({ ...prev, isLoading: true }));
      
      const authRequest = new AuthSession.AuthRequest({
        clientId: lyftAuthConfig.clientId,
        clientSecret: lyftAuthConfig.clientSecret,
        scopes: lyftAuthConfig.scopes,
        redirectUri: lyftAuthConfig.redirectUri,
        usePKCE: true,
      });

      const authResult = await authRequest.promptAsync(lyftAuthConfig.serviceConfiguration);
      
      console.log("### Lyft auth request:", authRequest);
      console.log("Lyft auth result:", authResult);
      
      if (authResult.type === 'success') {
        // Token exchange should happen on your backend
        const tokenResponse = await fetch(`${Config.apiBaseUrl}/api/v1/lyft/token-exchange`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code: authResult.params.code,
            code_verifier: authRequest.codeVerifier,
            redirect_uri: lyftAuthConfig.redirectUri
          }),
        });

        if (!tokenResponse.ok) {
          throw new Error('Token exchange failed');
        }

        const tokenData = await tokenResponse.json();
        
        await SecureStore.setItemAsync('lyft_access_token', tokenData.access_token);
        await SecureStore.setItemAsync('lyft_refresh_token', tokenData.refresh_token);

        setLyftState({
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        throw new Error(authResult.type || 'Authentication failed');
      }
    } catch (error) {
      console.error('Lyft auth error:', error);
      setLyftState({
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  const handleLyftDisconnect = async () => {
    await SecureStore.deleteItemAsync('lyft_access_token');
    await SecureStore.deleteItemAsync('lyft_refresh_token');
    setLyftState({ isAuthenticated: false, isLoading: false });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          uberState.isAuthenticated && styles.buttonConnected,
          uberState.isLoading && styles.buttonLoading,
        ]}
        onPress={uberState.isAuthenticated ? handleUberDisconnect : handleUberAuth}
        disabled={uberState.isLoading}
      >
        <Text style={styles.buttonText}>
          {uberState.isAuthenticated 
            ? '✓ Uber Connected (Tap to Disconnect)'
            : uberState.isLoading 
            ? 'Connecting to Uber...'
            : 'Connect Uber Account'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: '#FF00BF' }, // Lyft's brand color
          lyftState.isAuthenticated && styles.buttonConnected,
          lyftState.isLoading && styles.buttonLoading,
        ]}
        onPress={lyftState.isAuthenticated ? handleLyftDisconnect : handleLyftAuth}
        disabled={lyftState.isLoading}
      >
        <Text style={styles.buttonText}>
          {lyftState.isAuthenticated 
            ? '✓ Lyft Connected (Tap to Disconnect)'
            : lyftState.isLoading 
            ? 'Connecting to Lyft...'
            : 'Connect Lyft Account'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  button: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonConnected: {
    backgroundColor: '#34C759',
  },
  buttonLoading: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextConnected: {
    color: '#FFFFFF',
  },
});
