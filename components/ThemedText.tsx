import {
  Text,
  TextProps,
  StyleSheet,
} from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

export type ThemedTextType =
  | "default"
  | "defaultSemiBold"
  | "title"
  | "subtitle"
  | "section"
  | "link";
const TAILWIND_TEXT_COLOR_REGEX =
  /\btext-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|black|white)(?:-\d{3})?\b/;

interface ThemedTextProps extends TextProps {
  type?: ThemedTextType;
  className?: string;
  children: React.ReactNode;
}

function classNameHasTextColor(className?: string): boolean {
  if (!className) return false;
  return TAILWIND_TEXT_COLOR_REGEX.test(className);
}

function styleHasColor(style: any): boolean {
  if (!style) return false;
  if (Array.isArray(style)) return style.some(styleHasColor);
  return !!style?.color;
}

export function ThemedText({
  type = "default",
  className,
  style,
  ...props
}: ThemedTextProps) {
  const colorScheme = useColorScheme();

  return (
    <Text
      className={className}
      style={[
        styles.default,
        type === "defaultSemiBold" ? styles.defaultSemiBold : undefined,
        type === "title" ? styles.title : undefined,
        type === "subtitle" ? styles.subtitle : undefined,
        type === "section" ? styles.section : undefined,
        type === "link" ? styles.link : undefined,
        // ✅ Only apply fallback color if no text color is set
        !classNameHasTextColor(className) &&
          !styleHasColor(style) && {
            color:
              type === "link"
                ? Colors[colorScheme ?? "light"].tint
                : Colors[colorScheme ?? "light"].text,
          },
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    fontFamily: "System",
  },
  defaultSemiBold: {
    fontSize: 16,
    fontFamily: "System",
    fontWeight: "600",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    fontFamily: "System",
  },
  subtitle: {
    fontSize: 24,
    fontWeight: "600",
    fontFamily: "System",
  },
  section: {
    fontSize: 20,
    fontWeight: "500",
    fontFamily: "System",
  },
  link: {
    fontSize: 16,
    fontFamily: "System",
    textDecorationLine: "underline",
  },
});
