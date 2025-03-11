import SplashPage from '@/components/splash';
import { useEffect } from "react";
import { useColorScheme } from "@/components/ColorSchemeProvider";

export default function Index() {
  const { setColorScheme } = useColorScheme();
    useEffect(() => {
      setColorScheme("light"); // Forces light mode
    }, []);
  return <SplashPage />;
}