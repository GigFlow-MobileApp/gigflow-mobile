import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { useNavigation } from 'expo-router';

export default function HomeScreen() {
  const navigation = useNavigation();
  
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => <DrawerToggleButton />,
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ThemedText type="title">Home Screen</ThemedText>
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