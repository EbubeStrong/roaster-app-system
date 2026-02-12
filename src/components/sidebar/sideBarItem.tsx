"use client";
import { Box, Flex, Text, TooltipContent, TooltipPositioner, TooltipRoot, TooltipTrigger } from "@chakra-ui/react";
import { SidebarItemProps } from "../layouts/sidebar";

export default function SidebarItem({ icon, label, isCollapsed }: SidebarItemProps) {
  const content = (
    <Flex
      align="center"
      p="3"
      borderRadius="md"
      cursor="pointer"
      _hover={{ bg: "gray.700" }}
    >
      <Box fontSize="20px">{icon}</Box>
      {!isCollapsed && (
        <Text ml="3" fontWeight="medium">
          {label}
        </Text>
      )}
    </Flex>
  );

  if (!isCollapsed) return content;

  return (
    <TooltipRoot openDelay={150} closeDelay={50} positioning={{ placement: "right" }}>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipPositioner>
        <TooltipContent>{label}</TooltipContent>
      </TooltipPositioner>
    </TooltipRoot>
  );
}