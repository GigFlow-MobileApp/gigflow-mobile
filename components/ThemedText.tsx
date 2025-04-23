import {
  Text,
  TextProps,
  StyleProp,
  TextStyle,
} from "react-native";
import { useMemo } from "react";
import { useColorScheme } from "@/components/ColorSchemeProvider";
import { Colors } from "@/constants/Colors";
import { textStyles } from "@/constants/TextStyles";

const TAILWIND_TEXT_COLOR_REGEX =
  /\btext-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|black|white)(?:-\d{3})?\b/;

type ThemedTextType = keyof typeof textStyles;
type ColorKey = keyof typeof Colors.light;

interface ThemedTextProps extends TextProps {
  type?: ThemedTextType;
  className?: string;
  colorValue?: ColorKey;
  children: React.ReactNode;
}

function classNameHasTextColor(className?: string): boolean {
  if (!className) return false;
  return TAILWIND_TEXT_COLOR_REGEX.test(className);
}

function styleHasColor(style: any): boolean {
  if (!style) return false;
  if (Array.isArray(style)) return style.some(styleHasColor);
  return !!style?.color;}

export function ThemedText({
  type = "default",
  className,
  style,
  colorValue,
  ...props
}: ThemedTextProps) {
  const {colorScheme} = useColorScheme();

  const themedStyle = useMemo<StyleProp<TextStyle>>(() => {
    const baseStyle: TextStyle[]  = [textStyles[type]];

    if (!classNameHasTextColor(className) && !styleHasColor(style)) {
      baseStyle.push({ color: type === "link"
            ? Colors[colorScheme].tint
            : Colors[colorScheme].text,
      });
    }

    if (colorValue) baseStyle.push({ color: Colors[colorScheme][colorValue]});

    return [baseStyle, style];
  }, [type, className, style, colorScheme]);

  return (
    <Text className={className} style={themedStyle} {...props} />
  );
}
