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

    // background
    background: '#fff',
    backgroundCard: '#fff',
    btnBackground: brandColorLight,

    // others
    border: "#BCC1CA",
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
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

    // background
    background: '#000',
    backgroundCard: '#1C1C1C',
    btnBackground: brandColorDark,

    // others
    border: "#333333",
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
  },
} as const;