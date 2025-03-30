const tintColorLight = "#2f95dc";
const tintColorDark = "#fff";
const brandColorLight = "#29c3e5"; //'#00b8db';
const brandColorDark = "#007595";

export const Colors = {
  light: {
    brandColor: brandColorLight,

    // Text
    text: "#000000",
    logoText: "#ffffff",
    primaryText: "#171A1F",
    secondaryText: "#424955",
    textTertiary: "#9095A0",
    btnText: "#ffffff",
    menuItemText: "#565E6C",
    onPressText: "#007aff80",
    cardText: "#323842",
    selectedText: "#117389",

    // background
    background: "#ffffff",
    backgroundCard: "#ffffff",
    btnBackground: brandColorLight,
    onPressBg: "#007aff",
    transfer: "#F8FBE4",
    info: "#F3F1FE",
    paybills: "#FEF6F1",
    payout: "#FEF9EE",

    // others
    border: "#BCC1CA",
    tint: tintColorLight,
    tabIconDefault: "#ccc",
    tabIconSelected: tintColorLight,
    shadow: "#000000",
    goodBanner: "#00FF00",
    badBanner: "#FF0000",
    bullish: "#1DD75B",
    burish: "#ef4444",
    divider: "#DEE1E6",
  },
  dark: {
    brandColor: brandColorDark,

    // Text
    text: "#ffffff",
    logoText: "#000000",
    primaryText: "#EDEDED",
    secondaryText: "#B3B3B3",
    textTertiary: "#7D7D7D",
    btnText: "#000000",
    menuItemText: "#565E6C",
    onPressText: "#007affcc",
    cardText: "#323842",
    selectedText: "#117389",

    // background
    background: "#000000",
    backgroundCard: "#1C1C1C",
    btnBackground: brandColorDark,
    onPressBg: "#007aff",
    transfer: "#F8FBE4",
    info: "#F3F1FE",
    paybills: "#FEF6F1",
    payout: "#FEF9EE",

    // others
    border: "#333333",
    tint: tintColorDark,
    tabIconDefault: "#ccc",
    tabIconSelected: tintColorDark,
    shadow: "#000000",
    goodBanner: "#00FF00",
    badBanner: "#FF0000",
    bullish: "#1DD75B",
    burish: "#ef4444",
    divider: "#DEE1E6",
  },
} as const;

export const platformColor = {
  uber: "#000000",
  lyft: "#FF00BF",
  doordash: "#FF3008",
  upwork: "#14a800",
  fiverr: "#1DBF73",
};

/*
"account_id": "614514eb-a611-4e24-8ebe-e226d8005755", 
"amount": 21.7, 
"base_fare": 29.5, 
"bonus_amount": 1, 
"created_at": "2025-03-27T18:34:22.552694", 
"id": "20fe9172-e0a6-48ac-b43c-4774fb400ccc", 
"other_fees": 4.17, 
"payment_id": "ride_26651149", 
"payment_time": "2025-03-27T18:18:46.181000", 
"payment_type": "ride", 
"quest_name": "James", 
"surge": 6, 
"tip": 2}]
*/
