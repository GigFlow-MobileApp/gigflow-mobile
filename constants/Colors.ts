const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';
const brandColorLight = '#29c3e5'; //'#00b8db'; 
const brandColorDark = '#007595';

export const Colors = {
  light: { 
    brandColor: brandColorLight,

    // Text
    text: '#000',
    primaryText: '#111827',
    secondaryText: '#364153',
    textTertiary: '#9CA3AF',
    btnText: '#fff',

    // background
    background: '#fff',
    backgroundCard: '#fff',
    btnBackground: brandColorLight,

    // others
    border: "#E0E0E0",
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
  },
  dark: {
    brandColor: brandColorDark,

    // Text
    text: '#fff',
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