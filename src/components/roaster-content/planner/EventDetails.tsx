"use client";
import React from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { FiX } from "react-icons/fi";
import { PlannerEvent } from "./types";

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
  const u = users.find((x) => x.id === userId);
  if (u?.initials) return u.initials;
  if (u) return u.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  return userId.slice(0, 2).toUpperCase();
}

function getUserName(users: Props["users"], userId: string) {
  return users.find((x) => x.id === userId)?.name || userId;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
}

/** Group events by their start hour, e.g. "11:00", "12:00" */
function groupByHour(events: PlannerEvent[]): { hour: string; items: PlannerEvent[] }[] {
  const map = new Map<string, PlannerEvent[]>();
  const sorted = [...events].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  for (const ev of sorted) {
    const d = new Date(ev.start);
    const hourKey = `${d.getHours().toString().padStart(2, "0")}:00`;
    if (!map.has(hourKey)) map.set(hourKey, []);
    map.get(hourKey)!.push(ev);
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
            <FiX size={18} />
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
                {group.items.map((ev) => {
                  const initials = getUserInitials(users, ev.userId);
                  const userName = getUserName(users, ev.userId);
                  const startTime = formatTime(ev.start);
                  const endTime = formatTime(ev.end);

                  return (
                    <Box
                      key={ev.id}
                      bg={ev.color || "#F7FAFC"}
                      borderLeftWidth="3px"
                      borderLeftColor={ev.borderColor || "#A0AEC0"}
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
                          bg={ev.borderColor || "gray.400"}
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
                              {ev.title}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {startTime} - {endTime}
                            </Text>
                          </Flex>
                          <Text fontSize="xs" color={ev.borderColor || "gray.500"} mt={0.5}>
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
