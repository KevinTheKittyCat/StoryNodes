import { createSystem, defaultConfig } from "@chakra-ui/react"
import { buttonRecipe } from "./theme/button.recipe"

export const system = createSystem(defaultConfig, {
  globalCss: {
    html: {
      fontSize: "16px",
    },
    body: {
      fontSize: "0.875rem",
      margin: 0,
      padding: 0,
    },
    ".main-link": {
      color: "ui.main",
      fontWeight: "bold",
    },
  },
  theme: {
    tokens: {
      colors: {
        ui: {
          main: { value: "#ff3269ff" },
          secondary: { value: "#7E52A0" },
          accent: { value: "#F0F600" },
          background: { value: "#ffffff" },
          text: { value: "#050404" },
          mainText: { value: "#ffffff" },
        },
      },
    },
    recipes: {
      button: buttonRecipe,
    },
  },
})
