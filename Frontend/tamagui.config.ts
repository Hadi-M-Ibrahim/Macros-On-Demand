import { createTamagui } from "tamagui";
import { tokens } from "@tamagui/themes";

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
});

export type AppConfig = typeof config;
export default config;
