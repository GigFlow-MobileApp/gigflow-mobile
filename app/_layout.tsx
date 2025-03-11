import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import "../global.css";

export default function RootLayout() {
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const segments = useSegments(); // helps prevent re-routes on /auth

  useEffect(() => {
    const interval = setInterval(async () => {
      const token = await AsyncStorage.getItem('userToken');
      const isAuth = !!token;
      setIsLoggedIn(isAuth);

      const inAuthGroup = segments[0] === 'auth';

      if (!isAuth && !inAuthGroup) {
        router.replace('/auth');
      }
    }, 500); // check every 500ms

    return () => clearInterval(interval);
  }, [segments]);

  return <Slot />;
}