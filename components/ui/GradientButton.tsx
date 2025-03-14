import { Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/ColorSchemeProvider';

interface GradientButtonProps {
  label: string;
  onPress: () => void;
  isActive: boolean;
  style?: object;
}

export const GradientButton = ({ 
  label,
  onPress, 
  isActive, 
  style = {} 
}: GradientButtonProps) => {
  const { colorScheme } = useColorScheme();

  return (
    <Pressable onPress={onPress}>
      <LinearGradient
        colors={
          isActive 
            ? ['#6366f1', '#4f46e5'] 
            : [Colors[colorScheme].background, Colors[colorScheme].background]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.button,
          isActive ? styles.activeButton : styles.inactiveButton,
          style,
        ]}
      >
        <ThemedText
          style={[
            styles.label,
            isActive ? styles.activeLabel : styles.inactiveLabel
          ]}
        >
          {label}
        </ThemedText>
      </LinearGradient>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
  },
  activeButton: {
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  inactiveButton: {
    borderWidth: 1.5,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeLabel: {
    color: '#ffffff',
  },
  inactiveLabel: {
    opacity: 0.8,
  },
});