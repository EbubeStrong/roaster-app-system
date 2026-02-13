"use client";
import React from "react";
import { Box, Text, Flex, Input } from "@chakra-ui/react";
import { FiSearch, FiFilter } from "react-icons/fi";
import { PlannerEvent, StaffMember } from "./types";

type User = { id: string; name: string; initials?: string };

type Props = {
  staff: StaffMember[];
  events: PlannerEvent[];
  users: User[];
  onClose: () => void;
};

/** Day labels in Dutch */
const DAYS = ["m", "di", "w", "do", "vr"] as const;

function getInitials(name: string) {
  return name.split(" ").map((word) => word[0]).join("").toUpperCase().slice(0, 2);
}

function formatShortDate(iso: string) {
  const eventDate = new Date(iso);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[eventDate.getMonth()]} ${eventDate.getDate()}`;
}

/** Derive per-user roster info from actual events */
function deriveStaffFromEvents(events: PlannerEvent[], users: User[], existingStaff: StaffMember[]) {
  const userEventMap = new Map<string, PlannerEvent[]>();
  for (const event of events) {
    if (!userEventMap.has(event.userId)) userEventMap.set(event.userId, []);
    userEventMap.get(event.userId)!.push(event);
  }

  const allUserIds = new Set<string>();
  users.forEach((user) => allUserIds.add(user.id));
  existingStaff.forEach((staffMember) => allUserIds.add(staffMember.id));
  userEventMap.forEach((_, userId) => allUserIds.add(userId));

  const result: (StaffMember & { assignedEvents: PlannerEvent[] })[] = [];

  for (const currentUserId of allUserIds) {
    const existing = existingStaff.find((staffMember) => staffMember.id === currentUserId);
    const user = users.find((currentUser) => currentUser.id === currentUserId);
    const userEvents = userEventMap.get(currentUserId) || [];

    let dateRange = existing?.dateRange || "";
    if (userEvents.length > 0) {
      const sorted = [...userEvents].sort((eventA, eventB) => new Date(eventA.start).getTime() - new Date(eventB.start).getTime());
      const earliest = formatShortDate(sorted[0].start);
      const latest = formatShortDate(sorted[sorted.length - 1].start);
      dateRange = earliest === latest ? earliest : `${earliest} - ${latest}`;
    }

    const name = user?.name || existing?.name || currentUserId;

    // Users with events are always "available", others use existing status or default to "on-leave"
    const finalStatus = userEvents.length > 0 ? "available" : (existing?.status ?? "on-leave");

    result.push({
      id: currentUserId,
      name,
      initials: user?.initials || existing?.initials || getInitials(name),
      totalHours: 1158.0,
      weeklyHours: existing?.weeklyHours ?? 38.0,
      dateRange,
      status: finalStatus,
      days: existing?.days ?? ["m", "di", "w", "do", "vr"],
      assignedEvents: userEvents,
    });
  }

  result.sort((staffA, staffB) => {
    if (staffA.assignedEvents.length && !staffB.assignedEvents.length) return -1;
    if (!staffA.assignedEvents.length && staffB.assignedEvents.length) return 1;
    return staffA.name.localeCompare(staffB.name);
  });

  return result;
}

/** Get day color based on index pattern for demo */
function getDayColor(dayIndex: number, staffIndex: number): { bg: string; color: string } {
  const pattern = (dayIndex + staffIndex) % 3;
  if (pattern === 0) return { bg: "#FEEBC8", color: "#C05621" }; // orange/yellow
  if (pattern === 1) return { bg: "#C6F6D5", color: "#276749" }; // green
  return { bg: "#FED7D7", color: "#C53030" }; // red
}

export default function RosterPanel({ staff, events, users, onClose }: Props) {
  const [tab, setTab] = React.useState<"all" | "available" | "on-leave">("all");
  const [search, setSearch] = React.useState("");

  const derivedStaff = React.useMemo(
    () => deriveStaffFromEvents(events, users, staff),
    [events, users, staff]
  );

  const filtered = derivedStaff.filter((staffMember) => {
    if (tab === "available" && staffMember.status === "on-leave") return false;
    if (tab === "on-leave" && staffMember.status !== "on-leave") return false;
    if (search && !staffMember.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const allCount = derivedStaff.length;
  const availableCount = derivedStaff.filter((staffMember) => staffMember.status === "available").length;
  const onLeaveCount = derivedStaff.filter((staffMember) => staffMember.status === "on-leave").length;

  return (
    <Box w="340px" bg="white" h="100%" overflow="auto" flexShrink={0}>
      {/* Header */}
      <Flex align="center" gap={2} px={4} pt={4} pb={3}>
        <Box cursor="pointer" onClick={onClose} color="gray.500" _hover={{ color: "gray.700" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 2L8 8M8 8L14 14M8 8L14 2M8 8L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </Box>
        <Text fontWeight="semibold" fontSize="md" color="gray.700">Roster</Text>
      </Flex>

      {/* Search */}
      <Flex px={4} pb={4} gap={2}>
        <Flex
          flex="1"
          align="center"
          gap={2}
          bg="white"
          borderWidth="1px"
          borderColor="gray.200"
          borderRadius="lg"
          px={3}
          py={2}
        >
          <Box color="gray.400"><FiSearch size={16} /></Box>
          <Input
            placeholder="Search"
            size="sm"
            value={search}
            onChange={(changeEvent) => setSearch(changeEvent.target.value)}
            _placeholder={{ color: "gray.400" }}
          />
        </Flex>
        <Flex
          align="center"
          justify="center"
          w="40px"
          h="40px"
          borderWidth="1px"
          borderColor="gray.200"
          borderRadius="lg"
          cursor="pointer"
          _hover={{ bg: "gray.50" }}
        >
          <Box color="gray.400"><FiFilter size={16} /></Box>
        </Flex>
      </Flex>

      {/* Tabs */}
      <Flex px={4} gap={6} mb={4} borderBottomWidth="1px" borderColor="gray.100">
        <TabButton label="All" count={allCount} active={tab === "all"} onClick={() => setTab("all")} />
        <TabButton label="Available" count={availableCount} active={tab === "available"} onClick={() => setTab("available")} />
        <TabButton label="On Leave" count={onLeaveCount} active={tab === "on-leave"} onClick={() => setTab("on-leave")} />
      </Flex>

      {/* Staff list */}
      <Box px={4} pt={2}>
        {filtered.length === 0 && (
          <Text fontSize="sm" color="gray.400" textAlign="center" py={6}>No staff found</Text>
        )}
        {filtered.map((staffMember, staffIndex) => (
          <Box
            key={staffMember.id}
            bg="white"
            borderWidth="1px"
            borderColor="gray.100"
            borderRadius="xl"
            p={4}
            mb={3}
            boxShadow="sm"
            draggable
            cursor="grab"
            _active={{ cursor: "grabbing" }}
            onDragStart={(dragEvent) => {
              dragEvent.dataTransfer.setData("text/plain", staffMember.id);
              dragEvent.dataTransfer.effectAllowed = "copy";
            }}
          >
            <Flex gap={3}>
              {/* Initials circle */}
              <Flex
                w="40px"
                h="40px"
                borderRadius="full"
                borderWidth="2px"
                borderColor="gray.300"
                bg="white"
                color="gray.600"
                align="center"
                justify="center"
                fontSize="sm"
                fontWeight="bold"
                flexShrink={0}
              >
                {staffMember.initials}
              </Flex>

              {/* Content */}
              <Box flex="1" minW={0}>
                {/* Name row with status */}
                <Flex align="center" justify="space-between" mb={1}>
                  <Text fontWeight="semibold" fontSize="sm" color="gray.800">{staffMember.name}</Text>
                  <Flex align="center" gap={1}>
                    <Box
                      w="6px"
                      h="6px"
                      borderRadius="full"
                      bg={staffMember.status === "on-leave" ? "red.400" : "green.400"}
                    />
                    <Text fontSize="xs" color={staffMember.status === "on-leave" ? "red.500" : "green.500"}>
                      {staffMember.status === "on-leave" ? "On leave" : "Active"}
                    </Text>
                  </Flex>
                </Flex>

                {/* Hours row */}
                <Flex align="center" gap={3} mb={1}>
                  <Flex align="center" gap={1} bg="gray.100" borderRadius="md" px={2} py={0.5}>
                    <Text fontSize="xs" color="gray.600" fontWeight="medium">{staffMember.totalHours.toFixed(1)}hrs</Text>
                  </Flex>
                  <Flex align="center" gap={1} bg="gray.100" borderRadius="md" px={2} py={0.5}>
                    <Text fontSize="xs" color="gray.600" fontWeight="medium">{staffMember.weeklyHours.toFixed(1)}hrs</Text>
                  </Flex>
                </Flex>

                {/* Date range row with day indicators */}
                <Flex align="center" justify="space-between">
                  <Text fontSize="xs" color="blue.500" fontWeight="medium">
                    {staffMember.dateRange || `Jan ${2 + staffIndex * 4} - Jan ${9 + staffIndex * 6}`}
                  </Text>
                  
                  {/* Day indicators */}
                  <Flex gap={1}>
                    {DAYS.map((day, dayIndex) => {
                      const colors = getDayColor(dayIndex, staffIndex);
                      return (
                        <Box
                          key={day}
                          bg={colors.bg}
                          color={colors.color}
                          borderRadius="md"
                          px={1.5}
                          py={0.5}
                          minW="20px"
                          textAlign="center"
                        >
                          <Text fontSize="9px" fontWeight="bold">{day}</Text>
                        </Box>
                      );
                    })}
                  </Flex>
                </Flex>
              </Box>
            </Flex>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function TabButton({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <Box
      cursor="pointer"
      onClick={onClick}
      pb={2}
      borderBottomWidth="2px"
      borderColor={active ? "blue.500" : "transparent"}
      mb="-1px"
    >
      <Flex gap={1.5} align="center">
        <Text fontSize="sm" color={active ? "gray.800" : "gray.500"} fontWeight={active ? "semibold" : "medium"}>
          {label}
        </Text>
        <Text fontSize="sm" color={active ? "gray.800" : "gray.400"} fontWeight={active ? "semibold" : "medium"}>
          {count}
        </Text>
      </Flex>
    </Box>
  );
}
