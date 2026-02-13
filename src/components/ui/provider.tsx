"use client"

import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { ColorModeProvider } from "./color-mode"

export function Provider(props: React.PropsWithChildren) {
  return (
    <ChakraProvider value={defaultSystem}>
      <ColorModeProvider defaultTheme="light" {...props} />
    </ChakraProvider>
  )
}

