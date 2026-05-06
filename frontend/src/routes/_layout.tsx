import { Flex } from "@chakra-ui/react"
import { Outlet, createFileRoute } from "@tanstack/react-router"


export const Route = createFileRoute("/_layout")({
  component: Layout,
  /*beforeLoad: async () => {
    if (!isLoggedIn()) {
      throw redirect({
        to: "/login",
      })
    }
  },*/
})

function Layout() {
  return (
    <Flex direction="column" h="100vh" w="100%">
      {/*<Navbar />*/}
      <Flex flex="1" overflow="hidden">
        {/*<Sidebar />*/}
        <Flex flex="1" direction="column" overflowY="auto">
          <Outlet />
        </Flex>
      </Flex>
    </Flex>
  )
}

export default Layout
