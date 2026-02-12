"use client";

import type { ReactElement } from "react";

import {
  Box,
  Flex,
  IconButton,
  Text,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@chakra-ui/icons";
import { FiHome, FiSettings, FiChevronDown } from "react-icons/fi";
import SidebarItem from "../sidebar/sideBarItem";


export type SidebarItemProps = {
  icon: ReactElement;
  label: string;
  isCollapsed: boolean;
};

type SidebarContentProps = {
  isCollapsed: boolean;
  toggleCollapse: () => void;
  showCollapseToggle?: boolean;
};

export default function SidebarContent({ isCollapsed, toggleCollapse, showCollapseToggle }: SidebarContentProps) {
  return (
    <Box
      bg="gray.900"
      color="white"
      h="100vh"
      w={isCollapsed ? "70px" : "250px"}
      transition="width 0.3s ease"
      p="4"
    >
      {showCollapseToggle && (
        <Flex justify="flex-end" mb="6">
          <IconButton size="sm" aria-label="Toggle Sidebar" onClick={toggleCollapse}>
            {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Flex>
      )}

      <VStack align="stretch" gap="4">
        <SidebarItem icon={<FiHome />} label="Dashboard" isCollapsed={isCollapsed} />
        <NestedMenu isCollapsed={isCollapsed} />
      </VStack>
    </Box>
  );
}

type NestedMenuProps = {
  isCollapsed: boolean;
};

function NestedMenu({ isCollapsed }: NestedMenuProps) {
  const { open, onToggle } = useDisclosure();

  return (
    <>
      <Flex
        align="center"
        p="3"
        borderRadius="md"
        cursor="pointer"
        onClick={onToggle}
        _hover={{ bg: "gray.700" }}
      >
        <Box fontSize="20px">
          <FiSettings />
        </Box>

        {!isCollapsed && (
          <>
            <Text ml="3" flex="1">
              Settings
            </Text>
            <FiChevronDown />
          </>
        )}
      </Flex>

      {!isCollapsed && open && (
        <VStack align="stretch" pl="10" mt="2" gap="2">
          <Text cursor="pointer" _hover={{ color: "gray.300" }}>
            Profile
          </Text>
          <Text cursor="pointer" _hover={{ color: "gray.300" }}>
            Security
          </Text>
        </VStack>
      )}
    </>
  );
}
