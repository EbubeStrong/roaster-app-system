"use client";
import React from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { CloseCircle } from "iconsax-reactjs";
import { PlannerEvent } from "../../../types/types";

type Props = {
  /** All events in the clicked column */
  events: PlannerEvent[];
  /** The date for the header */
  date: Date;
  /** User lookup list */
  users: { id: string; name: string; initials?: string }[];
  onClose: () => void;
};

function getUserInitials(users: Props["users"], userId: string) {
  const matchedUser = users.find((user) => user.id === userId);
  if (matchedUser?.initials) return matchedUser.initials;
  if (matchedUser) return matchedUser.name.split(" ").map((word) => word[0]).join("").toUpperCase().slice(0, 2);
  return userId.slice(0, 2).toUpperCase();
}

function getUserName(users: Props["users"], userId: string) {
  return users.find((user) => user.id === userId)?.name || userId;
}

function formatTime(iso: string) {
  const eventDate = new Date(iso);
  return eventDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
}

/** Group events by their start hour, e.g. "11:00", "12:00" */
function groupByHour(events: PlannerEvent[]): { hour: string; items: PlannerEvent[] }[] {
  const map = new Map<string, PlannerEvent[]>();
  const sorted = [...events].sort((eventA, eventB) => new Date(eventA.start).getTime() - new Date(eventB.start).getTime());

  for (const event of sorted) {
    const eventDate = new Date(event.start);
    const hourKey = `${eventDate.getHours().toString().padStart(2, "0")}:00`;
    if (!map.has(hourKey)) map.set(hourKey, []);
    map.get(hourKey)!.push(event);
  }

  return Array.from(map.entries()).map(([hour, items]) => ({ hour, items }));
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function EventDetails({ events, date, users, onClose }: Props) {
  if (events.length === 0) return null;

  const dayName = DAY_NAMES[date.getDay()];
  const dayNumber = date.getDate();
  const groups = groupByHour(events);

  return (
    <Box
      position="fixed"
      inset="0"
      zIndex={9999}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      {/* Backdrop */}
      <Box position="absolute" inset="0" bg="blackAlpha.400" onClick={onClose} />

      {/* Popup card */}
      <Box
        bg="white"
        width={["92%", "420px"]}
        maxH="80vh"
        borderRadius="xl"
        boxShadow="xl"
        zIndex={10000}
        overflow="hidden"
        display="flex"
        flexDirection="column"
      >
        {/* Header */}
        <Flex align="center" justify="space-between" px={5} py={4} borderBottomWidth="1px" borderColor="gray.100">
          <Flex align="center" gap={2}>
            <Text fontSize="lg" fontWeight="bold" color="gray.800">
              {dayName} {dayNumber}
            </Text>
          </Flex>
          <Box
            as="button"
            onClick={onClose}
            color="gray.400"
            _hover={{ color: "gray.600" }}
            cursor="pointer"
            p={1}
          >
            <CloseCircle size={18} />
          </Box>
        </Flex>

        {/* Scrollable body */}
        <Box overflowY="auto" px={5} py={3} flex="1">
          {groups.map((group) => (
            <Box key={group.hour} mb={4}>
              {/* Time group header */}
              <Text fontSize="md" fontWeight="bold" color="gray.800" mb={2}>
                {group.hour}
              </Text>

              {/* Event cards */}
              <Flex direction="column" gap={2}>
                {group.items.map((event) => {
                  const initials = getUserInitials(users, event.userId);
                  const userName = getUserName(users, event.userId);
                  const startTime = formatTime(event.start);
                  const endTime = formatTime(event.end);

                  return (
                    <Box
                      key={event.id}
                      bg={event.color || "#F7FAFC"}
                      borderLeftWidth="3px"
                      borderLeftColor={event.borderColor || "#A0AEC0"}
                      borderRadius="lg"
                      px={3}
                      py={2.5}
                    >
                      <Flex align="center" gap={2}>
                        {/* Initials badge */}
                        <Flex
                          w="28px"
                          h="28px"
                          borderRadius="full"
                          bg={event.borderColor || "gray.400"}
                          color="white"
                          align="center"
                          justify="center"
                          fontSize="10px"
                          fontWeight="bold"
                          flexShrink={0}
                        >
                          {initials}
                        </Flex>

                        {/* Event info */}
                        <Box flex="1" minW={0}>
                          <Flex align="center" gap={1.5}>
                            <Text fontWeight="bold" fontSize="sm" lineClamp={1}>
                              {event.title}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {startTime} - {endTime}
                            </Text>
                          </Flex>
                          <Text fontSize="xs" color={event.borderColor || "gray.500"} mt={0.5}>
                            {userName}
                          </Text>
                        </Box>
                      </Flex>
                    </Box>
                  );
                })}
              </Flex>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
