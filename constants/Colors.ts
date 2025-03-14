const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';
const brandColorLight = '#29c3e5'; //'#00b8db'; 
const brandColorDark = '#007595';

export const Colors = {
  light: { 
    brandColor: brandColorLight,

    // Text
    text: '#000',
    logoText: "#fff",
    primaryText: '#171A1F',
    secondaryText: '#424955',
    textTertiary: '#9095A0',
    btnText: '#fff',
    menuItemText: '#565E6C',
    onPressText: "#007aff80",

    // background
    background: '#fff',
    backgroundCard: '#fff',
    btnBackground: brandColorLight,
    onPressBg: "#007aff1a",

    // others
    border: "#BCC1CA",
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
    shadow: "#000",
    goodBanner: "#00FF00",
    badBanner: "#FF0000",
  },
  dark: {
    brandColor: brandColorDark,

    // Text
    text: '#fff',
    logoText: "#000",
    primaryText: '#EDEDED',
    secondaryText: '#B3B3B3',
    textTertiary: '#7D7D7D',
    btnText: '#000',
    menuItemText: '#565E6C',
    onPressText: "#007affcc",

    // background
    background: '#000',
    backgroundCard: '#1C1C1C',
    btnBackground: brandColorDark,
    onPressBg: "#007aff1a",

    // others
    border: "#333333",
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
    shadow: "#000",
    goodBanner: "#00FF00",
    badBanner: "#FF0000",
  },
} as const;