import { createTamagui } from "tamagui";
import { tokens } from "@tamagui/themes";
import { Poppins_400Regular } from '@expo-google-fonts/poppins'

const config = createTamagui({
  themes: {
    light: {
      background: "#E8EBf7",
      color: "#000000",
    },
    dark: {
      background: "#000000",
      color: "#FFFFFF",
    },
  },
  tokens,
  shorthands: {
    p: "padding",
    m: "margin",
    bg: "backgroundColor",
  },
  fonts: {
    body: {
      family: "Poppins_400Regular", 
      size: {
        4: 18,
        5: 20,
        6: 24,
      },
    },
  },
});

export type AppConfig = typeof config;
export default config;
