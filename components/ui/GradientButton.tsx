import { Pressable } from 'react-native';
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
          {
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: isActive ? 'transparent' : Colors[colorScheme].border,
          },
          style,
        ]}
      >
        <ThemedText
          style={{
            color: isActive ? '#ffffff' : Colors[colorScheme].text,
            fontWeight: '600',
          }}
        >
          {label}
        </ThemedText>
      </LinearGradient>
    </Pressable>
  );
};