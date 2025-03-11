import { TextStyle } from "react-native";

export const textStyles: Record<string, TextStyle> = {
  logo: {
    fontSize: 40,
    fontWeight: "600",
    fontFamily: "Poppins",
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
  btnText: {
    fontSize: 18,
    fontWeight: "400",
    fontFamily: "Montserrat",
  },
  description: {
    fontSize: 16,
    fontWeight: "400",
    fontFamily: "Montserrat",
  },
  link: {
    fontSize: 16,
    fontFamily: "System",
    textDecorationLine: "underline",
  },
  default: {
    fontSize: 16,
    fontFamily: "System",
  },
  defaultSemiBold: {
    fontSize: 16,
    fontFamily: "System",
    fontWeight: "600",
  },
};
