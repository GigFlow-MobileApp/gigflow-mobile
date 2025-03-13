import { StyleProp, ViewStyle, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import AntDesign from '@expo/vector-icons/AntDesign';

interface IconSymbolProps {
  name: string;
  size: number;
  color: string;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

const AntDesign5Pairs: { [key: string]: string } = {
  edit: "edit",
};

const FontAwesome5Pairs: { [key: string]: string } = {
  coins: "coins",
};

const iconPairs: { [key: string]: string } = {
  house: "home",
  creditcard: "card",
  clock: "time",
  "info.circle": "information-circle",
  person: "person",
  "person.circle": "person-circle",
  gear: "settings",
  tools: "construct",
  help: "help",
  notifications: "notifications",
  gift: "gift",
  leave: "log-out",
  file: "document",
  grid: "grid",
  "right-arrow": "chevron-forward",
  "left-arrow": "chevron-back",
  "qrcode": "qr-code",
}

function createIconMap(pairs: Record<string, string>): Record<string, string> {
  const map: Record<string, string> = {};

  for (const prefix in pairs) {
    const base = pairs[prefix];
    map[`${prefix}.fill`] = base;
    map[prefix] = `${base}-outline`;
  }
  // console.log(map);
  return map;
}

export const iconMap: Record<string, string> = {
  ...createIconMap(iconPairs),
  ...FontAwesome5Pairs,
  ...AntDesign5Pairs
};

export function IconSymbol({ name, size, color, style, className }: IconSymbolProps) {
  // Map SF Symbol names to Ionicons names
  const getIoniconName = (sfSymbolName: string) => {
    return iconMap[sfSymbolName] || sfSymbolName;
  };

  return (
    <View style={style} className={className}>
      {name in FontAwesome5Pairs ? (
        <FontAwesome5 name={FontAwesome5Pairs[name] as any} size={size} color={color} />
      ) : name in AntDesign5Pairs ? (
        <AntDesign name={AntDesign5Pairs[name] as any} size={size} color={color} />
      ) : (
        <Ionicons name={getIoniconName(name) as any} size={size} color={color} />
      )}
    </View>
  );
}
