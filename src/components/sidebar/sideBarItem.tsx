"use client";
import React from "react";
import { Box, Flex, Text, TooltipContent, TooltipPositioner, TooltipRoot, TooltipTrigger, Image } from "@chakra-ui/react";
import { SidebarItemProps } from "../layouts/sidebar";

const SidebarItem = React.forwardRef<HTMLDivElement, SidebarItemProps & { onClick?: () => void }>(
  ({ icon, label, isCollapsed, isActive, onClick }, ref) => {
    const content = (
      <Flex
        ref={ref}
        align="center"
        p="3"
        borderRadius="md"
        cursor="pointer"
        role="group"
        onClick={onClick}
        color={isActive ? "blue.500" : undefined}
        _hover={{ bg: "gray.50", color: "blue.500" }}
        css={{
          "& svg path": {
            transition: "fill 0.18s ease",
          },
        }}
      >
        <Box
          fontSize="20px"
          css={{
            "& svg path": {
              fill: "currentColor !important",
            },
          }}
        >
          {typeof icon === "string" ? (
            <Image
              src={icon}
              alt={label}
              boxSize="18px"
              objectFit="contain"
              transition="filter 0.18s ease"
              _groupHover={{ filter: "brightness(0) saturate(100%) invert(35%) sepia(89%) saturate(420%) hue-rotate(205deg) brightness(95%) contrast(95%)" }}
            />
          ) : (
            icon
          )}
        </Box>
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
);

SidebarItem.displayName = "SidebarItem";

export default SidebarItem;