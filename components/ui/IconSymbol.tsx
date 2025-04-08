import { StyleProp, ViewStyle, View } from "react-native";
import { Ionicons, Feather, MaterialIcons } from "@expo/vector-icons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import AntDesign from '@expo/vector-icons/AntDesign';
import Svg, { Path } from "react-native-svg";
import * as SimpleIcons from "simple-icons";
import WheelIcon from "../../assets/icons/Wheel.svg";

interface IconSymbolProps {
  name: string;
  size: number;
  color: string;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

const FeatherPairs: { [key: string]: string } = {
  income: "arrow-down-right",
  expense: "arrow-up-left",
  happy: "smile",
  sad: "frown",
  neutral: "meh",
};

const AntDesign5Pairs: { [key: string]: string } = {
  edit: "edit",
  star: "staro",
  calendar: "calendar",
  app: "appstore-o",
};

const MaterialIconsPairs: { [key: string]: string } = {
  email: "alternate-email",
};

const FontAwesome5Pairs: { [key: string]: string } = {
  coins: "coins",
};

const SimpleIconNames: Set<string> = new Set([
  "uber",
  "lyft",
  "doordash",
  "upwork",
  "fiverr",
]);


const iconPairs: { [key: string]: string } = {
  house: "home",
  card: "card",
  clock: "time",
  "info.circle": "information-circle",
  person: "person",
  "person.circle": "person-circle",
  gear: "settings",
  tools: "construct",
  help: "help",
  detail: "help-circle",
  notifications: "notifications",
  gift: "gift",
  leave: "log-out",
  file: "document",
  grid: "grid",
  "right-arrow": "chevron-forward",
  "left-arrow": "chevron-back",
  "qrcode": "qr-code",
  link: "link",
  arrow: "arrow-back-circle",
  location: "location",
  people: "people",
  briefcase: "briefcase",
  halfHeart: "heart-half",
  heart: "heart",
  back: "arrow-back",
  funnel: "funnel",
  check: "checkmark-done",
  voice: "mic",
  voiceStop: "mic-off",
  checkSingle: "checkmark",
  alert: "alert-circle",
  plus: "add",
  sharpStar: "star",
  coins: "coins"
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
  ...AntDesign5Pairs,
  ...FeatherPairs,
  ...MaterialIconsPairs
};

function getSimpleIconPath(name: string): string | null {
  const key = name.toLowerCase();
  const iconKey = "si" + key.charAt(0).toUpperCase() + key.slice(1);
  const icon = (SimpleIcons as any)[iconKey];
  return icon?.path || null;
}

export function IconSymbol({ name, size, color, style, className }: IconSymbolProps) {
  // Map SF Symbol names to Ionicons names
  const getIoniconName = (sfSymbolName: string) => {
    return iconMap[sfSymbolName] || sfSymbolName;
  };

  // Check if the name is "wheel" and render the wheel SVG
  if (name.toLowerCase() === "wheel") {
    return (
      <View style={style} className={className}>
        <WheelIcon width={size} height={size} stroke={color} />
      </View>
    );
  }

  if (SimpleIconNames.has(name.toLowerCase())) {
    const path = getSimpleIconPath(name);
    if (path) {
      return (
        <View style={style} className={className}>
          <Svg width={size} height={size} viewBox="0 0 24 24">
            <Path d={path} fill={color} />
          </Svg>
        </View>
      );
    }
  }

  return (
    <View style={style} className={className}>
      {name in FontAwesome5Pairs ? (
        <FontAwesome5 name={FontAwesome5Pairs[name] as any} size={size} color={color} />
      ) : name in AntDesign5Pairs ? (
        <AntDesign name={AntDesign5Pairs[name] as any} size={size} color={color} />
      ) : name in FeatherPairs ? (
        <Feather name={FeatherPairs[name] as any} size={size} color={color} />
      ) : name in MaterialIconsPairs ? (
        <MaterialIcons name={MaterialIconsPairs[name] as any} size={size} color={color} />
      ) : (
        <Ionicons name={getIoniconName(name) as any} size={size} color={color} />
      )}
    </View>
  );
}
