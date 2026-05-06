import { defineRecipe } from "@chakra-ui/react"

export const buttonRecipe = defineRecipe({
  base: {
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  variants: {
    variant: {
      solid: {
        bg: "ui.main",
        color: "white",
        _hover: {
          opacity: 0.8,
        },
        _active: {
          opacity: 0.9,
        },
      },
      ghost: {
        bg: "transparent",
        color: "ui.main",
        _hover: {
          bg: "gray.100",
        },
      },
      "sidebar-button": {
        bg: "transparent",
        color: "ui.mainText",
        justifyContent: "flex-start",
        _hover: {
          bg: "blackAlpha.200",
        },
      },
    },
  },
  defaultVariants: {
    variant: "solid",
  },
})
