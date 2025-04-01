import { useThemeColors } from "../ColorSchemeProvider";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";

interface PressableCardProps {
  children: React.ReactNode;
  onPress?: () => void;
}

const PressableCard: React.FC<PressableCardProps> = ({ children, onPress }) => {
  const { colors } = useThemeColors();
  const [isPressed, setIsPressed] = useState(false);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      onPress={onPress}
      style={{
        position: "relative",
        shadowColor: colors.shadow,
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: isPressed ? 0 : 0.3,
        shadowRadius: 4,
        elevation: isPressed ? 0 : 5,
        backgroundColor: colors.backgroundCard,
        borderRadius: 8,
        padding: 12,
        overflow: "hidden",
      }}
    >
      {isPressed && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 8,
            pointerEvents: "none",
          }}
        />
      )}
      {children}
    </TouchableOpacity>
  );
};


export default PressableCard;
