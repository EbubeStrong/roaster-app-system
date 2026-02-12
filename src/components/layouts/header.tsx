"use client";

import {
	AvatarFallback,
	AvatarRoot,
	Box,
	Flex,
	HStack,
	Icon,
	IconButton,
	Text,
	VStack,
	MenuContent,
	MenuItem,
	MenuPositioner,
	MenuRoot,
	MenuSeparator,
	MenuTrigger,
} from "@chakra-ui/react";
import { FiGrid, FiSettings, FiBell, FiChevronDown } from "react-icons/fi";

export default function Header() {
	const cardBg = "#f3f6fb";
	const iconColor = "#2b8bff";

	return (
		<Flex
			as="header"
			align="center"
			justify="flex-end"
			gap={{ base: 2, md: 3 }}
			px={{ base: 3, md: 6 }}
			py={{ base: 2, md: 3 }}
			w="100%"
			maxW="100%"
			minW="0"
			borderBottomWidth="1px"
			borderColor="gray.200"
			bg="white"
			position="sticky"
			top="0"
			zIndex="docked"
		>
			<HStack gap={{ base: 1.5, md: 2 }}>
				<IconButton
					aria-label="Apps"
					size="sm"
					variant="ghost"
					bg={cardBg}
				>
					<Icon as={FiGrid} boxSize={5} color={iconColor} />
				</IconButton>
				<IconButton
					aria-label="Settings"
					size="sm"
					variant="ghost"
					bg={cardBg}
				>
					<Icon as={FiSettings} boxSize={5} />
				</IconButton>
				<Box position="relative">
					<IconButton
						aria-label="Notifications"
						size="sm"
						variant="ghost"
						bg={cardBg}
					>
						<Icon as={FiBell} boxSize={5} />
					</IconButton>
					<Box
						position="absolute"
						top="2"
						right="2"
						w="2.5"
						h="2.5"
						bg="red.500"
						borderRadius="full"
					/>
				</Box>
			</HStack>

			<MenuRoot positioning={{ placement: "bottom-end" }} closeOnSelect>
				<MenuTrigger asChild>
					<HStack
						gap={3}
						pl={{ base: 2, md: 4 }}
						cursor="pointer"
						_hover={{ opacity: 0.9 }}
						borderRadius="md"
						px={2}
						py={1}
					>
						<AvatarRoot boxSize="32px" bg="gray.900" color="white">
							<AvatarFallback fontSize="sm">P</AvatarFallback>
						</AvatarRoot>
						<VStack gap={0} align="flex-start" display={{ base: "none", sm: "flex" }}>
							<Text fontSize="sm" fontWeight="semibold">
								Paul Cornelius
							</Text>
							<Text fontSize="xs" color="gray.500">
								Paul@dstrct.com
							</Text>
						</VStack>
						<Icon as={FiChevronDown} boxSize={4} color="gray.500" />
					</HStack>
				</MenuTrigger>

				<MenuPositioner>
					<MenuContent minW="200px" py={2} shadow="md" borderRadius="md">
						<MenuItem value="profile">Profile</MenuItem>
						<MenuItem value="account">Account settings</MenuItem>
						<MenuSeparator />
						<MenuItem value="signout" color="red.500">
							Sign out
						</MenuItem>
					</MenuContent>
				</MenuPositioner>
			</MenuRoot>
		</Flex>
	);
}
