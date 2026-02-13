"use client";
import React from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { PlannerEvent } from "../../../types/types";

type Props = {
  events: PlannerEvent[];
  onEventClick: (event: PlannerEvent) => void;
  onDropUser?: (userId: string, column: string, hour: number, minute: number) => void;
  date: Date;
  users: { id: string; name: string; initials?: string }[];
};

const COLUMNS = [
  { key: "Days", label: "Days", color: "#EDE9FE", headerBg: "#EDE9FE", headerColor: "#5B21B6" },
  { key: "Behandelingkamer1", label: "Behandelingkamer1", color: "#E8F5E9", headerBg: "#E2E4E9", headerColor: "#5D636F" },
  { key: "Management", label: "Management", color: "#FFF8E1", headerBg: "#E2E4E9", headerColor: "#5D636F" },
  { key: "Bijzonderheden-Verlof-Cursus-BZV", label: "Bijzonderheden-Verlof-Cursus-...", color: "#EBF8FF", headerBg: "#E2E4E9", headerColor: "#5D636F" },
  { key: "Financien", label: "Financien", color: "#FFF8E1", headerBg: "#E2E4E9", headerColor: "#5D636F" },
];

export { COLUMNS };

const START_HOUR = 0;
const END_HOUR = 24;
const HALF_HOUR_HEIGHT = 48;
const HEADER_HEIGHT = 40;

function timeLabel(hour: number, minute: number) {
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
}

function getUserInitials(users: Props["users"], userId: string) {
  const matchedUser = users.find((user) => user.id === userId);
  if (matchedUser?.initials) return matchedUser.initials;
  if (matchedUser) return matchedUser.name.split(" ").map((word) => word[0]).join("").toUpperCase().slice(0, 2);
  return userId.slice(0, 2).toUpperCase();
}

function getUserName(users: Props["users"], userId: string) {
  return users.find((user) => user.id === userId)?.name || userId;
}

export default function PlannerCalendar({ events, onEventClick, onDropUser, users }: Props) {
  const [dragOverCell, setDragOverCell] = React.useState<string | null>(null);
  const totalSlots = (END_HOUR - START_HOUR) * 2;
  const gridHeight = totalSlots * HALF_HOUR_HEIGHT;

  const halfHours: { hour: number; minute: number }[] = [];
  for (let currentHour = START_HOUR; currentHour < END_HOUR; currentHour++) {
    halfHours.push({ hour: currentHour, minute: 0 });
    halfHours.push({ hour: currentHour, minute: 30 });
  }

  const eventsForColumn = (columnKey: string) => events.filter((event) => (event.location || "") === columnKey);

  const topForTime = (iso: string) => {
    const eventDate = new Date(iso);
    const totalMinutes = (eventDate.getHours() - START_HOUR) * 60 + eventDate.getMinutes();
    return Math.max(0, (totalMinutes / 30) * HALF_HOUR_HEIGHT);
  };

  const heightForEvent = (startIso: string, endIso: string) => {
    const startDate = new Date(startIso);
    const endDate = new Date(endIso);
    const durationInMinutes = (endDate.getTime() - startDate.getTime()) / 60000;
    return Math.max(24, (durationInMinutes / 30) * HALF_HOUR_HEIGHT);
  };

  const hasOverlap = (columnEvents: PlannerEvent[]) => {
    for (let outerIndex = 0; outerIndex < columnEvents.length; outerIndex++) {
      for (let innerIndex = outerIndex + 1; innerIndex < columnEvents.length; innerIndex++) {
        const eventA = columnEvents[outerIndex], eventB = columnEvents[innerIndex];
        if (new Date(eventA.start) < new Date(eventB.end) && new Date(eventB.start) < new Date(eventA.end)) return true;
      }
    }
    return false;
  };

  const handleDragOver = (dragEvent: React.DragEvent, columnKey: string, hour: number, minute: number) => {
    dragEvent.preventDefault();
    dragEvent.dataTransfer.dropEffect = "copy";
    setDragOverCell(`${columnKey}-${hour}-${minute}`);
  };

  const handleDragLeave = () => setDragOverCell(null);

  const handleDrop = (dragEvent: React.DragEvent, columnKey: string, hour: number, minute: number) => {
    dragEvent.preventDefault();
    setDragOverCell(null);
    const userId = dragEvent.dataTransfer.getData("text/plain");
    if (userId && onDropUser) {
      onDropUser(userId, columnKey, hour, minute);
    }
  };

  return (
    <Box position="relative" h="100%" display="flex" flexDirection="column">
      {/* Sticky header row */}
      <Flex flexShrink={0} position="sticky" top={0} zIndex={5} bg="white">
        {/* Days header */}
        <Box w="80px" flexShrink={0} borderRightWidth="1px" borderColor="gray.100">
          <Box
            h={`${HEADER_HEIGHT}px`}
            bg={COLUMNS[0].headerBg}
            display="flex"
            alignItems="center"
            justifyContent="center"
            px={3}
            borderBottomWidth="2px"
            borderColor={COLUMNS[0].headerColor}
          >
            <Text fontSize="xs" fontWeight="600" color={COLUMNS[0].headerColor}>{COLUMNS[0].label}</Text>
          </Box>
        </Box>
        {/* Column headers */}
        {COLUMNS.slice(1).map((column) => (
          <Box key={column.key} flex="1" minW="160px" borderRightWidth="1px" borderColor="gray.100">
            <Box
              h={`${HEADER_HEIGHT}px`}
              bg={column.headerBg}
              display="flex"
              alignItems="center"
              justifyContent="center"
              px={3}
              borderBottomWidth="2px"
              borderColor={column.headerColor}
            >
              <Text fontSize="xs" fontWeight="600" color={column.headerColor} lineClamp={1}>{column.label}</Text>
            </Box>
          </Box>
        ))}
      </Flex>

      {/* Scrollable body */}
      <Box flex="1" overflow="auto">
        <Flex position="relative">
          {/* Days column (time labels only) */}
          <Box w="80px" flexShrink={0} position="relative" borderRightWidth="1px" borderColor="gray.100">
            <Box position="relative" h={`${gridHeight}px`}>
              {halfHours.map(({ hour, minute }, slotIndex) => (
                <Box
                  key={slotIndex}
                  position="absolute"
                  left={0}
                  right={0}
                  top={`${slotIndex * HALF_HOUR_HEIGHT}px`}
                  h={`${HALF_HOUR_HEIGHT}px`}
                  borderBottomWidth="1px"
                  borderColor={slotIndex % 2 === 1 ? "gray.100" : "gray.50"}
                >
                  <Text
                    position="absolute"
                    left="8px"
                    top="4px"
                    fontSize="xs"
                    color="gray.400"
                    lineHeight="1"
                    userSelect="none"
                  >
                    {timeLabel(hour, minute)}
                  </Text>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Schedulable columns with drop zones */}
          {COLUMNS.slice(1).map((column) => {
            const columnEvents = eventsForColumn(column.key);
            const showSeeAll = hasOverlap(columnEvents);

            return (
              <Box key={column.key} flex="1" minW="160px" borderRightWidth="1px" borderColor="gray.100" position="relative">
                <Box position="relative" h={`${gridHeight}px`}>
                  {halfHours.map(({ hour, minute }, slotIndex) => {
                    const cellId = `${column.key}-${hour}-${minute}`;
                    const isOver = dragOverCell === cellId;
                    return (
                      <Box
                        key={slotIndex}
                        position="absolute"
                        left={0}
                        right={0}
                        top={`${slotIndex * HALF_HOUR_HEIGHT}px`}
                        h={`${HALF_HOUR_HEIGHT}px`}
                        borderBottomWidth="1px"
                        borderColor={slotIndex % 2 === 1 ? "gray.100" : "gray.50"}
                        bg={isOver ? "blue.50" : "transparent"}
                        transition="background 0.1s"
                        onDragOver={(dragEvent) => handleDragOver(dragEvent, column.key, hour, minute)}
                        onDragLeave={handleDragLeave}
                        onDrop={(dragEvent) => handleDrop(dragEvent, column.key, hour, minute)}
                      />
                    );
                  })}

                  {columnEvents.map((event) => {
                    const top = topForTime(event.start);
                    const height = heightForEvent(event.start, event.end);
                    const initials = getUserInitials(users, event.userId);
                    const userName = getUserName(users, event.userId);
                    const startTime = new Date(event.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
                    const endTime = new Date(event.end).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });

                    return (
                      <Box
                        key={event.id}
                        position="absolute"
                        left="4px"
                        right="4px"
                        top={`${top}px`}
                        height={`${height}px`}
                        bg={event.color || "#F7FAFC"}
                        borderLeftWidth="3px"
                        borderLeftColor={event.borderColor || "#A0AEC0"}
                        borderRadius="6px"
                        p={2}
                        cursor="pointer"
                        onClick={() => onEventClick(event)}
                        overflow="hidden"
                        _hover={{ boxShadow: "sm" }}
                        transition="box-shadow 0.15s"
                        zIndex={2}
                        pointerEvents="auto"
                      >
                        <Flex align="center" gap={1} mb={0.5}>
                          <Flex
                            w="20px" h="20px" borderRadius="full"
                            bg={event.borderColor || "gray.300"} color="white"
                            align="center" justify="center" fontSize="8px" fontWeight="bold" flexShrink={0}
                          >
                            {initials}
                          </Flex>
                        </Flex>
                        <Text fontWeight="bold" fontSize="xs" lineClamp={1}>{event.title}</Text>
                        <Text fontSize="xs" color={event.borderColor || "gray.500"}>{startTime} - {endTime}</Text>
                        <Text fontSize="xs" color={event.borderColor || "gray.500"} mt={0.5}>{userName}</Text>
                      </Box>
                    );
                  })}

                  {showSeeAll && (
                    <Box
                      position="absolute"
                      left="50%"
                      transform="translateX(-50%)"
                      top={`${(3 * HALF_HOUR_HEIGHT) - 10}px`}
                      bg="white"
                      borderWidth="1px"
                      borderColor="gray.200"
                      borderRadius="md"
                      px={3}
                      py={1}
                      cursor="pointer"
                      boxShadow="sm"
                      _hover={{ boxShadow: "md" }}
                      zIndex={10}
                      onClick={() => { if (columnEvents.length > 0) onEventClick(columnEvents[0]); }}
                    >
                      <Text fontSize="xs" color="gray.600" fontWeight="500">See all</Text>
                    </Box>
                  )}
                </Box>
              </Box>
            );
          })}
        </Flex>
      </Box>
    </Box>
  );
}
