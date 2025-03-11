import { TextStyle } from "react-native";
import { Platform } from "react-native";

const ios = Platform.OS === 'ios';

export const textStyles: Record<string, TextStyle> = {
  logo: {
    fontSize: 40,
    fontWeight: ios ? "600" : "800",
    fontFamily: "Poppins",
  },
  title: {
    fontSize: 24,
    fontWeight: ios ? "600" : "800",
    fontFamily: "Poppins",
  },
  subtitle: {
    fontSize: 24,
    fontWeight: ios ? "600" : "800",
    fontFamily: "System",
  },
  section: {
    fontSize: 18,
    fontWeight: ios ? "700" : "900",
    fontFamily: "Montserrat",
  },
  btnText: {
    fontSize: 18,
    fontWeight: ios ? "400" : "600",
    fontFamily: "Montserrat",
  },
  description: {
    fontSize: 16,
    fontWeight: ios ? "400" : "600",
    fontFamily: "Montserrat",
  },
  link: {
    fontSize: 16,
    fontFamily: "System",
    textDecorationLine: "underline",
  },
  default: {
    fontSize: 16,
    fontWeight: ios ? "400" : "600",
    fontFamily: "Montserrat",
  },
  defaultSemiBold: {
    fontSize: 16,
    fontFamily: "Montserrat",
    fontWeight: ios ? "700" : "900",
  },
};
