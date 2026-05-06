import { Box, Container, Text } from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"

import useAuth from "@/hooks/useAuth"

export const Route = createFileRoute("/_layout/")({
  component: Dashboard,
})

function Dashboard() {
  const { user: currentUser } = useAuth()

  return (
    <Container maxW="full" p={0} display="flex" minH="100vh">
      <Box pt={12} m={4}>
        <Text fontSize="2xl" truncate maxW="sm">
          Hello, {currentUser?.name || currentUser?.username} 👋🏼
        </Text>
        <Text>Welcome back!</Text>
      </Box>
    </Container>
  )
}
