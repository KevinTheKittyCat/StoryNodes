





import { Button, Container, Flex, Heading, Image, Link } from "@chakra-ui/react";
import { useNavigate } from "@tanstack/react-router";
import { FiActivity, FiHome, FiLogOut, FiSettings, FiUser } from "react-icons/fi";



export default function Sidebar() {
    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem("access_token");
        navigate({ to: "/login" });
    }

    return (
        <Container // TODO: Remove this from component and add to theme
            display="flex" gap={4} flexDirection="column"
            justifyContent="space-between"
            minW="250px" w="250px" bg="ui.background" p={4} minH="100vh" m={0}
            borderRight="1px solid" borderColor="gray.200"
        >
            <Flex className="side-bar-top" flexDirection="column" gap={2} mt={10}>
                <Link href="/" display="flex" justifyContent="center" alignItems="center">
                    <Heading w="100%" justifyContent="center" color="ui.main" size="lg" mb={4} display="flex" alignItems="center" gap={2} flexDirection="column">
                        <Image src="/assets/BaldrJsColorSmall.png" alt="Baldr Logo" height={"6em"} />
                        Baldr-Stack
                    </Heading>
                </Link>

                <Flex flexDirection="column" bg="ui.main" borderRadius={8}>
                    <Button as={Link} href="/" variant="sidebar-button"><FiHome />Home</Button>
                    <Button as={Link} href="/" variant="sidebar-button"><FiActivity />Items</Button>
                    <Button as={Link} href="/" variant="sidebar-button"><FiUser />Users</Button>
                </Flex>
            </Flex>

            <Flex className="side-bar-bottom" flexDirection="column" bg="ui.main" borderRadius={8}>
                <Button as={Link} href="/settings" variant="sidebar-button"><FiSettings />Settings</Button>
                <Button onClick={logout} variant="sidebar-button"><FiLogOut /> Logout</Button>
            </Flex>
        </Container>
    )
}