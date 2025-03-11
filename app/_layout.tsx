import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import SplashPage from "@/components/splash";
import "../global.css";

export default function RootLayout() {
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  // const [isAuthChecked, setIsAuthChecked] = useState(false);
  // const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  // const segments = useSegments(); // helps prevent re-routes on /auth

  // Show splash for 3 seconds once
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashVisible(false);
      requestAnimationFrame(() => {
        router.replace('/intro');
      });
    }, 3000); // 3 seconds

    return () => clearTimeout(timer);
  }, []);

  // Splash screen UI
  if (isSplashVisible) {
    return <SplashPage />;
  }

  return <Slot />;
}