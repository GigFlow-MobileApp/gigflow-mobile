import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

export default function AuthScreen() {
  return (
    <View style={styles.container}>
      <ThemedText type="title">Sign In / Sign Up</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
