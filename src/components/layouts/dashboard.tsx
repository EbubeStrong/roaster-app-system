"use client";

import { Box, Flex, IconButton, useBreakpointValue, useDisclosure } from "@chakra-ui/react";
import { ChevronLeftIcon, HamburgerIcon } from "@chakra-ui/icons";
import { useState } from "react";
import SidebarContent from "./sidebar";
import Header from "./header";

export default function DashboardLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { open, setOpen } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Flex w="100%" minH="100vh">
      {!isMobile && (
        <SidebarContent
          isCollapsed={isCollapsed}
          toggleCollapse={() => setIsCollapsed((prev) => !prev)}
          showCollapseToggle
        />
      )}

      {isMobile && (
        <>
          <IconButton
            aria-label="Open Menu"
            position="fixed"
            top="4"
            left="4"
            zIndex="1000"
            onClick={() => setOpen(true)}
          >
            <HamburgerIcon />
          </IconButton>

          <Box
            position="fixed"
            inset="0"
            bg="blackAlpha.600"
            opacity={open ? 1 : 0}
            transition="opacity 0.25s ease"
            pointerEvents={open ? "auto" : "none"}
            onClick={() => setOpen(false)}
            zIndex="999"
          />

          <Box
            position="fixed"
            top="0"
            left="0"
            h="100vh"
            w="260px"
            bg="gray.900"
            color="white"
            boxShadow="xl"
            transform={open ? "translateX(0)" : "translateX(-100%)"}
            transition="transform 0.25s ease"
            zIndex="1000"
            display="flex"
            flexDirection="column"
          >
            <Flex justify="flex-end" p="3">
              <IconButton aria-label="Close menu" size="sm" onClick={() => setOpen(false)}>
                <ChevronLeftIcon />
              </IconButton>
            </Flex>

            <SidebarContent
              isCollapsed={false}
              toggleCollapse={() => undefined}
              showCollapseToggle={false}
            />
          </Box>
        </>
      )}


      {/* Content */}
      <Flex direction="column" flex="1" minW="0">
        <Header />
        <Box flex="1" bg="gray.900" />
      </Flex>
    </Flex>
  );
}
