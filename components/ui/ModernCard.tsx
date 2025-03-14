import { View, StyleSheet, ViewStyle } from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/ColorSchemeProvider';

interface ModernCardProps {
  children: React.ReactNode;
  delay?: number;
  style?: ViewStyle;
  gradient?: boolean;
  gradientColors?: string[];
}

export const ModernCard = ({
  children,
  delay = 0,
  style = {},
  gradient = false,
  gradientColors = ['#6366f1', '#4f46e5'],
}: ModernCardProps) => {
  const { colorScheme } = useColorScheme();

  const CardContent = () => (
    <View style={[styles.content, style]}>
      {children}
    </View>
  );

  return (
    <MotiView
      from={{
        opacity: 0,
        scale: 0.95,
        translateY: 10,
      }}
      animate={{
        opacity: 1,
        scale: 1,
        translateY: 0,
      }}
      transition={{
        type: 'spring',
        delay,
        damping: 15,
        mass: 1,
      }}
      style={[
        styles.container,
        {
          backgroundColor: gradient ? 'transparent' : Colors[colorScheme].backgroundCard,
        },
      ]}
    >
      {gradient ? (
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, style]}
        >
          <CardContent />
        </LinearGradient>
      ) : (
        <CardContent />
      )}
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 5,
  },
  gradient: {
    borderRadius: 24,
  },
  content: {
    padding: 20,
  },
});