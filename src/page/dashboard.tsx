"use client";

import { Box, Flex, IconButton, useBreakpointValue, useDisclosure } from "@chakra-ui/react";
import { ChevronLeftIcon} from "@chakra-ui/icons";
import React, { useState } from "react";
import SidebarContent from "../components/layouts/sidebar";
import Header from "../components/layouts/header";
import { HamburgerIcon } from "@/assets/icons/iconsItems";
import RoasterContent from "@/components/roaster-content";

export default function DashboardLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { open, onOpen, onClose } = useDisclosure();
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
            bg="white"
            onClick={() => onOpen()}
          >
            <HamburgerIcon />
          </IconButton>

          <Box
            position="fixed"
            inset="0"
            opacity={open ? 1 : 0}
            transition="opacity 0.25s ease"
            pointerEvents={open ? "auto" : "none"}
            onClick={() => onClose()}
            zIndex="999"
          />

            <Box
            position="fixed"
            top="0"
            left="0"
            h="100vh"
            w="260px"
            bg="white"
            color="white"
            boxShadow="xl"
              transform={open ? "translateX(0)" : "translateX(-100%)"}
            transition="transform 0.25s ease"
            zIndex="1000"
            display="flex"
            flexDirection="column"
          >
            <Flex justify="flex-end" p="3" width="100%">
              <IconButton aria-label="Close menu" bg="white" color="black" size="lg" onClick={() => onClose()}>
                <ChevronLeftIcon/>
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

        <Box p="4" flex="1" overflowY="auto">
          {/* Main content goes here */}
          {/* Mount the roaster content (planner) here */}
          <Box>
            {/* Loaded component */}
            {/* Import lazily to keep layout fast */}
            <RoasterContent />
          </Box>
        </Box>
      </Flex>
    </Flex>
  );
}
