// app/(drawer)/setting.tsx
import { View, Text } from 'react-native';
import { usePathname, useRouter } from "expo-router";

export default function PaymentScreen() {
  const pathname = usePathname();
  return (
    <View style={{
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    }}>
      <Text>Payments</Text>
    </View>
  );
}
