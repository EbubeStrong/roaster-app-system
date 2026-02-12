"use client";
import {
  Box,
  Flex,
  IconButton,
  Text,
  VStack,

} from "@chakra-ui/react";

import {
  FiChevronDown,
} from "react-icons/fi";
import SidebarItem from "../sidebar/sideBarItem";
import { useEffect, useRef, useState } from "react";
import { DepartmentNewsIcon, DocumentManagementIcon, DoProtocolsIcon, GeneralNewsIcon, HamburgerIcon, InstellingenIcon, KnowledgeBaseIcon, LogoIcon, MijnRoasterIcon, PlannerIcon, RoasterIcon, Startpagina } from "@/assets/icons/iconsItems";


export type SidebarItemProps = {
  icon: React.ReactNode;
  label: string;
  isCollapsed: boolean;
  isActive?: boolean;
};

type SidebarContentProps = {
  isCollapsed: boolean;
  toggleCollapse: () => void;
  showCollapseToggle?: boolean;
};

export default function SidebarContent({ isCollapsed, toggleCollapse, showCollapseToggle }: SidebarContentProps) {
  const [openRooster, setOpenRooster] = useState(true);
  const [active, setActive] = useState<string | null>("planner");
  const roosterRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const roosterContainerRef = useRef<HTMLDivElement | null>(null);
  const [indicator, setIndicator] = useState({ top: 0, height: 0, visible: false });

  useEffect(() => {
    // Position active indicator based on state
    const updateIndicatorPosition = () => {
      // Hide indicator when group or sidebar is closed
      if (!openRooster || isCollapsed) {
        setIndicator((prev) => ({ ...prev, visible: false }));
        return;
      }

      const activeKey = active;
      const activeItemEl = activeKey ? roosterRefs.current[activeKey] : null;
      const containerEl = roosterContainerRef.current;

      if (activeItemEl && containerEl) {
        const offsetTopRelative = activeItemEl.offsetTop - containerEl.offsetTop;
        const itemHeight = activeItemEl.offsetHeight;
        setIndicator({ top: offsetTopRelative, height: itemHeight, visible: true });
      } else {
        setIndicator({ top: 0, height: 0, visible: false });
      }
    };

    updateIndicatorPosition();
    window.addEventListener("resize", updateIndicatorPosition);
    // Cleanup listener on unmount for the indicator positioning
    return () => window.removeEventListener("resize", updateIndicatorPosition);
  }, [active, openRooster, isCollapsed]);

  return (
    <Box
      bg="white"
      color="gray.800"
      h="100vh"
      w={isCollapsed ? "70px" : "260px"}
      transition="width 0.2s ease"
      p="4"
      borderRightWidth="1px"
      borderColor="gray.100"
    >
      {/* Logo area */}
      <Flex align="center" mb="4" justify={isCollapsed ? "center" : "space-between"}>
        <Box display="flex" alignItems="center">
          {!isCollapsed && (
            <LogoIcon />

          )}
        </Box>

        {showCollapseToggle && (
          <IconButton
            size="sm"
            aria-label="Toggle Sidebar"
            onClick={toggleCollapse}
            ml={2}
            bg="white"
          >
            <HamburgerIcon />
          </IconButton>
        )}
      </Flex>

      <VStack align="stretch" gap="2">
        <SidebarItem icon={<Startpagina />} label="Startpagina" isCollapsed={isCollapsed} />

        <Box>
          <Flex
            align="center"
            p="3"
            borderRadius="md"
            cursor="pointer"
            onClick={() => setOpenRooster((v) => !v)}
            _hover={{ bg: "gray.50" }}
          >
            <Box fontSize="18px" color={openRooster ? "blue.500" : "gray.600"}>
              <RoasterIcon />
            </Box>

            {!isCollapsed && (
              <>
                <Text ml="3" flex="1">
                  Rooster
                </Text>
                <Box color="gray.500">
                  <FiChevronDown />
                </Box>
              </>
            )}
          </Flex>

          {!isCollapsed && openRooster && (
            <Box position="relative">
              <VStack ref={roosterContainerRef} align="stretch" pl="7" mt="1" gap="4">
                <SidebarItem
                  ref={(el) => { roosterRefs.current["mijnRooster"] = el; }}
                  icon={<MijnRoasterIcon />}
                  label="Mijn Rooster"
                  isCollapsed={isCollapsed}
                  onClick={() => setActive("mijnRooster")}
                />

                <SidebarItem
                  ref={(el) => { roosterRefs.current["planner"] = el; }}
                  icon={<PlannerIcon />}
                  label="Planner"
                  isCollapsed={isCollapsed}
                  isActive={active === "planner"}
                  onClick={() => setActive("planner")}
                />

                <SidebarItem
                  ref={(el) => { roosterRefs.current["instellingen"] = el; }}
                  icon={<InstellingenIcon />}
                  label="Instellingen"
                  isCollapsed={isCollapsed}
                  onClick={() => setActive("instellingen")}
                />
              </VStack>

              <Box
                position="absolute"
                left="23px"
                width="3px"
                bg="blue.500"
                borderRadius="full"
                transition="top 180ms ease, height 180ms ease, opacity 180ms ease"
                style={{
                  top: indicator.visible ? indicator.top : -9999,
                  height: indicator.height,
                  opacity: indicator.visible ? 1 : 0,
                }}
              />
            </Box>
          )}
        </Box>

        <SidebarItem icon={<DoProtocolsIcon />} label="My to do Protocols" isCollapsed={isCollapsed} />
        <SidebarItem icon={<DocumentManagementIcon />} label="Document Management" isCollapsed={isCollapsed} />
        <SidebarItem icon={<DepartmentNewsIcon />} label="Department News" isCollapsed={isCollapsed} />
        <SidebarItem icon={<KnowledgeBaseIcon />} label="Knowledge Base" isCollapsed={isCollapsed} />
        <SidebarItem icon={<GeneralNewsIcon />} label="General News" isCollapsed={isCollapsed} />
      </VStack>
    </Box>
  );
}