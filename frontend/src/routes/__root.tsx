import { Outlet, createRootRoute, useLocation } from "@tanstack/react-router"
import React, { Suspense } from "react"

import NotFound from "@/components/Common/NotFound"
import Sidebar from "@/components/Common/Sidebar/Sidebar"
import { Container } from "@chakra-ui/react"

const loadDevtools = () =>
  Promise.all([
    import("@tanstack/router-devtools"),
    import("@tanstack/react-query-devtools"),
  ]).then(([routerDevtools, reactQueryDevtools]) => {
    return {
      default: () => (
        <>
          <routerDevtools.TanStackRouterDevtools />
          <reactQueryDevtools.ReactQueryDevtools />
        </>
      ),
    }
  })

const TanStackDevtools =
  process.env.NODE_ENV === "production" ? () => null : React.lazy(loadDevtools)

export const Route = createRootRoute({
  component: () => {
    const location = useLocation()
    
    // Define routes where sidebar should be hidden
    const routesWithoutSidebar = ['/login', '/signup'];
    const showSidebar = !routesWithoutSidebar.includes(location.pathname)
    
    return (
      <>
        <Container className="layout-container" display="flex" minH="100vh" p={0} maxW="full" w="100%">
          {showSidebar && <Sidebar />}
          <Outlet />
        </Container>
        <Suspense>
          {/*<TanStackDevtools />*/}
        </Suspense>
      </>
    )
  },
  notFoundComponent: () => <NotFound />,
})
