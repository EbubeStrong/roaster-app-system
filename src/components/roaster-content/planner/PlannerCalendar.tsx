"use client";
import React from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { PlannerEvent } from "./types";

type Props = {
  events: PlannerEvent[];
  onEventClick: (e: PlannerEvent) => void;
  date: Date;
  users: { id: string; name: string; initials?: string }[];
};

const COLUMNS = [
  { key: "Days", label: "Days", color: "#FFF0EE", headerBg: "#FFF0EE", headerColor: "#C53030" },
  { key: "Behandelingkamer1", label: "Behandelingkamer1", color: "#E8F5E9", headerBg: "#E8F5E9", headerColor: "#276749" },
  { key: "Management", label: "Management", color: "#FFF8E1", headerBg: "#FFF8E1", headerColor: "#975A16" },
  { key: "Bijzonderheden-Verlof-Cursus-BZV", label: "Bijzonderheden-Verlof-Cursus-...", color: "#EBF8FF", headerBg: "#EBF8FF", headerColor: "#2B6CB0" },
  { key: "Financien", label: "Financien", color: "#FFF8E1", headerBg: "#FFF8E1", headerColor: "#975A16" },
];

const START_HOUR = 0;
const END_HOUR = 24;
const HALF_HOUR_HEIGHT = 48; // px per 30 min
const HEADER_HEIGHT = 40;

function timeLabel(hour: number, min: number) {
  return `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
}

function getUserInitials(users: Props["users"], userId: string) {
  const u = users.find((x) => x.id === userId);
  if (u?.initials) return u.initials;
  if (u) return u.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  return userId.slice(0, 2).toUpperCase();
}

function getUserName(users: Props["users"], userId: string) {
  return users.find((x) => x.id === userId)?.name || userId;
}

export default function PlannerCalendar({ events, onEventClick, users }: Props) {
  const totalSlots = (END_HOUR - START_HOUR) * 2;
  const gridHeight = totalSlots * HALF_HOUR_HEIGHT;

  const halfHours: { hour: number; min: number }[] = [];
  for (let h = START_HOUR; h < END_HOUR; h++) {
    halfHours.push({ hour: h, min: 0 });
    halfHours.push({ hour: h, min: 30 });
  }

  const eventsForColumn = (colKey: string) => events.filter((ev) => (ev.location || "") === colKey);

  const topForTime = (iso: string) => {
    const d = new Date(iso);
    const mins = (d.getHours() - START_HOUR) * 60 + d.getMinutes();
    return Math.max(0, (mins / 30) * HALF_HOUR_HEIGHT);
  };

  const heightForEvent = (startIso: string, endIso: string) => {
    const s = new Date(startIso);
    const e = new Date(endIso);
    const diffMins = (e.getTime() - s.getTime()) / 60000;
    return Math.max(24, (diffMins / 30) * HALF_HOUR_HEIGHT);
  };

  /** Check if events overlap within a column */
  const hasOverlap = (colEvents: PlannerEvent[]) => {
    for (let i = 0; i < colEvents.length; i++) {
      for (let j = i + 1; j < colEvents.length; j++) {
        const a = colEvents[i], b = colEvents[j];
        if (new Date(a.start) < new Date(b.end) && new Date(b.start) < new Date(a.end)) {
          return true;
        }
      }
    }
    return false;
  };

  return (
    <Flex overflow="auto" position="relative">
      {/* Days column (time labels only) */}
      {(() => {
        const daysCol = COLUMNS[0];
        return (
          <Box w="80px" flexShrink={0} position="relative" borderRightWidth="1px" borderColor="gray.100">
            {/* Column header */}
            <Box
              h={`${HEADER_HEIGHT}px`}
              bg={daysCol.headerBg}
              display="flex"
              alignItems="center"
              px={3}
              borderBottomWidth="2px"
              borderColor={daysCol.headerColor}
            >
              <Text fontSize="xs" fontWeight="600" color={daysCol.headerColor}>{daysCol.label}</Text>
            </Box>

            {/* Grid area with time labels only */}
            <Box position="relative" h={`${gridHeight}px`}>
              {halfHours.map(({ hour, min }, idx) => (
                <Box
                  key={idx}
                  position="absolute"
                  left={0}
                  right={0}
                  top={`${idx * HALF_HOUR_HEIGHT}px`}
                  h={`${HALF_HOUR_HEIGHT}px`}
                  borderBottomWidth="1px"
                  borderColor={idx % 2 === 1 ? "gray.100" : "gray.50"}
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
                    {timeLabel(hour, min)}
                  </Text>
                </Box>
              ))}
            </Box>
          </Box>
        );
      })()}

      {/* Other columns */}
      {COLUMNS.slice(1).map((col) => {
        const colEvents = eventsForColumn(col.key);
        const showSeeAll = hasOverlap(colEvents);

        return (
          <Box key={col.key} flex="1" minW="160px" borderRightWidth="1px" borderColor="gray.100" position="relative">
            {/* Column header */}
            <Box
              h={`${HEADER_HEIGHT}px`}
              bg={col.headerBg}
              display="flex"
              alignItems="center"
              px={3}
              borderBottomWidth="2px"
              borderColor={col.headerColor}
            >
              <Text fontSize="xs" fontWeight="600" color={col.headerColor} lineClamp={1}>{col.label}</Text>
            </Box>

            {/* Grid area */}
            <Box position="relative" h={`${gridHeight}px`}>
              {/* Grid lines */}
              {halfHours.map((_, idx) => (
                <Box
                  key={idx}
                  position="absolute"
                  left={0}
                  right={0}
                  top={`${idx * HALF_HOUR_HEIGHT}px`}
                  borderBottomWidth="1px"
                  borderColor={idx % 2 === 1 ? "gray.100" : "gray.50"}
                  h={`${HALF_HOUR_HEIGHT}px`}
                />
              ))}

              {/* Events */}
              {colEvents.map((ev) => {
                const top = topForTime(ev.start);
                const height = heightForEvent(ev.start, ev.end);
                const initials = getUserInitials(users, ev.userId);
                const userName = getUserName(users, ev.userId);
                const startTime = new Date(ev.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
                const endTime = new Date(ev.end).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });

                return (
                  <Box
                    key={ev.id}
                    position="absolute"
                    left="4px"
                    right="4px"
                    top={`${top}px`}
                    height={`${height}px`}
                    bg={ev.color || "#F7FAFC"}
                    borderLeftWidth="3px"
                    borderLeftColor={ev.borderColor || "#A0AEC0"}
                    borderRadius="6px"
                    p={2}
                    cursor="pointer"
                    onClick={() => onEventClick(ev)}
                    overflow="hidden"
                    _hover={{ boxShadow: "sm" }}
                    transition="box-shadow 0.15s"
                  >
                    <Flex align="center" gap={1} mb={0.5}>
                      <Flex
                        w="20px" h="20px" borderRadius="full"
                        bg={ev.borderColor || "gray.300"} color="white"
                        align="center" justify="center" fontSize="8px" fontWeight="bold" flexShrink={0}
                      >
                        {initials}
                      </Flex>
                    </Flex>
                    <Text fontWeight="bold" fontSize="xs" lineClamp={1}>{ev.title}</Text>
                    <Text fontSize="xs" color={ev.borderColor || "gray.500"}>{startTime} - {endTime}</Text>
                    <Text fontSize="xs" color={ev.borderColor || "gray.500"} mt={0.5}>{userName}</Text>
                  </Box>
                );
              })}

              {/* See all button when events overlap */}
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
                  onClick={() => {
                    if (colEvents.length > 0) onEventClick(colEvents[0]);
                  }}
                >
                  <Text fontSize="xs" color="gray.600" fontWeight="500">See all</Text>
                </Box>
              )}
            </Box>
          </Box>
        );
      })}
    </Flex>
  );
}
