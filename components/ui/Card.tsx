import { View } from 'react-native';
import { MotiView } from 'moti';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/ColorSchemeProvider';

interface CardProps {
  children: React.ReactNode;
  delay?: number;
  style?: object;
}

export const Card = ({ 
  children, 
  delay = 0, 
  style = {} 
}: CardProps) => {
  const { colorScheme } = useColorScheme();

  return (
    <MotiView
      from={{
        opacity: 0,
        scale: 0.9,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      transition={{
        type: 'timing',
        duration: 800,
        delay,
      }}
      style={[
        {
          backgroundColor: Colors[colorScheme].backgroundCard,
          borderRadius: 24,
          padding: 20,
          shadowColor: Colors[colorScheme].shadow,
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.15,
          shadowRadius: 20,
          elevation: 5,
        },
        style,
      ]}
    >
      {children}
    </MotiView>
  );
};