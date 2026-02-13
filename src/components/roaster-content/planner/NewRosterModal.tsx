"use client";
import React, { useEffect, useState } from "react";
import { Box, Button, Input, Text, Flex } from "@chakra-ui/react";
import { PlannerEvent } from "../../../types/types";
import { useDemoAuth } from "./DemoAuthProvider";

/** Each column has a specific bg + border color */
const COLUMN_COLORS: Record<string, { color: string; borderColor: string }> = {
  Behandelingkamer1: { color: "#E8F5E9", borderColor: "#38A169" },
  Management: { color: "#FFF8E1", borderColor: "#D69E2E" },
  "Bijzonderheden-Verlof-Cursus-BZV": { color: "#EBF8FF", borderColor: "#2B6CB0" },
  Financien: { color: "#FFF8E1", borderColor: "#D69E2E" },
};

const LOCATIONS = ["Behandelingkamer1", "Management", "Bijzonderheden-Verlof-Cursus-BZV", "Financien"];

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (event: PlannerEvent) => void;
  currentDate?: Date;
};

export default function NewRosterModal({ isOpen, onClose, onCreate, currentDate }: Props) {
  const authContext = useDemoAuth();
  const resolvedUsers = authContext?.users ?? [];
  const fallbackDate = currentDate ?? new Date();

  const formatDateISO = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [title, setTitle] = useState("");
  const [userId, setUserId] = useState("");
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [dateStr, setDateStr] = useState("");
  const [startTime, setStartTime] = useState("11:00");
  const [durationHours, setDurationHours] = useState(1);

  // Reset fields when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setUserId(resolvedUsers[0]?.id || "");
      setLocation(LOCATIONS[0]);
      setDateStr(formatDateISO(fallbackDate));
      setStartTime("11:00");
      setDurationHours(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreate = () => {
    const start = `${dateStr}T${startTime}:00`;
    const endDate = new Date(start);
    endDate.setHours(endDate.getHours() + Number(durationHours));
    const colors = COLUMN_COLORS[location] || { color: "#E8F0FF", borderColor: "#A0AEC0" };

    const newEvent: PlannerEvent = {
      id: `new-${Date.now()}`,
      title: title || "New Roster",
      start,
      end: endDate.toISOString(),
      userId,
      location,
      color: colors.color,
      borderColor: colors.borderColor,
    };
    onCreate(newEvent);
  };

  const selectedUserName = resolvedUsers.find((user) => user.id === userId)?.name || "";

  return (
    <Box position="fixed" inset="0" zIndex={9999} display="flex" alignItems="center" justifyContent="center">
      <Box position="absolute" inset="0" bg="blackAlpha.500" onClick={onClose} />
      <Box bg="white" width={["92%", "500px"]} borderRadius="xl" boxShadow="xl" zIndex={10000} overflow="hidden">
        {/* Header */}
        <Flex align="center" justify="space-between" px={5} py={4} borderBottomWidth="1px" borderColor="gray.100">
          <Text fontWeight="bold" fontSize="lg">Create New Roster</Text>
          <Box as="button" onClick={onClose} color="gray.400" _hover={{ color: "gray.600" }} cursor="pointer" fontSize="lg">&times;</Box>
        </Flex>

        {/* Body */}
        <Box px={5} py={4}>
          {/* Title */}
          <Box mb={4}>
            <Text fontSize="xs" fontWeight="600" color="gray.600" mb={1}>Title / Task</Text>
            <Input
              value={title}
              onChange={(changeEvent) => setTitle(changeEvent.target.value)}
              placeholder="e.g. Surgery, Pijnspecialist, Consultation"
              size="sm"
              borderRadius="md"
            />
          </Box>

          {/* Assign to user */}
          <Box mb={4}>
            <Text fontSize="xs" fontWeight="600" color="gray.600" mb={1}>Assign to</Text>
            <select
              value={userId}
              onChange={(changeEvent) => setUserId(changeEvent.target.value)}
              style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #E2E8F0", fontSize: "14px" }}
            >
              {resolvedUsers.map((user) => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
            {selectedUserName && (
              <Flex align="center" gap={2} mt={2} px={2} py={1.5} bg="gray.50" borderRadius="md">
                <Flex
                  w="24px" h="24px" borderRadius="full" bg="purple.100" color="purple.600"
                  align="center" justify="center" fontSize="9px" fontWeight="bold" flexShrink={0}
                >
                  {selectedUserName.split(" ").map((word) => word[0]).join("").toUpperCase().slice(0, 2)}
                </Flex>
                <Text fontSize="sm" color="gray.700">{selectedUserName}</Text>
              </Flex>
            )}
          </Box>

          {/* Location / Column */}
          <Box mb={4}>
            <Text fontSize="xs" fontWeight="600" color="gray.600" mb={1}>Column / Location</Text>
            <select
              value={location}
              onChange={(changeEvent) => setLocation(changeEvent.target.value)}
              style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #E2E8F0", fontSize: "14px" }}
            >
              {LOCATIONS.map((locationName) => (
                <option key={locationName} value={locationName}>{locationName}</option>
              ))}
            </select>
            {/* Color preview */}
            <Flex align="center" gap={2} mt={1.5}>
              <Box
                w="12px" h="12px" borderRadius="sm"
                bg={COLUMN_COLORS[location]?.color || "#E8F0FF"}
                borderWidth="1px"
                borderColor={COLUMN_COLORS[location]?.borderColor || "#A0AEC0"}
              />
              <Text fontSize="xs" color="gray.400">Column color preview</Text>
            </Flex>
          </Box>

          {/* Date */}
          <Box mb={4}>
            <Text fontSize="xs" fontWeight="600" color="gray.600" mb={1}>Date</Text>
            <Input
              type="date"
              value={dateStr}
              onChange={(changeEvent) => setDateStr(changeEvent.target.value)}
              size="sm"
              borderRadius="md"
            />
          </Box>

          {/* Start time + Duration */}
          <Flex gap={3} mb={4}>
            <Box flex="1">
              <Text fontSize="xs" fontWeight="600" color="gray.600" mb={1}>Start time</Text>
              <Input
                type="time"
                value={startTime}
                onChange={(changeEvent) => setStartTime(changeEvent.target.value)}
                size="sm"
                borderRadius="md"
              />
            </Box>
            <Box w="140px">
              <Text fontSize="xs" fontWeight="600" color="gray.600" mb={1}>Duration (hrs)</Text>
              <select
                value={String(durationHours)}
                onChange={(changeEvent) => setDurationHours(Number(changeEvent.target.value))}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #E2E8F0", fontSize: "14px" }}
              >
                {[0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8].map((durationOption) => (
                  <option key={durationOption} value={durationOption}>{durationOption}h</option>
                ))}
              </select>
            </Box>
          </Flex>

          {/* Summary preview */}
          <Box bg="gray.50" borderRadius="md" p={3} mb={4}>
            <Text fontSize="xs" color="gray.500" mb={1}>Preview</Text>
            <Flex align="center" gap={2}>
              <Box
                w="4px" h="32px" borderRadius="full"
                bg={COLUMN_COLORS[location]?.borderColor || "#A0AEC0"}
              />
              <Box>
                <Text fontSize="sm" fontWeight="600">{title || "New Roster"}</Text>
                <Text fontSize="xs" color="gray.500">
                  {dateStr} &middot; {startTime} &ndash; {durationHours}h &middot; {selectedUserName} &middot; {location}
                </Text>
              </Box>
            </Flex>
          </Box>
        </Box>

        {/* Footer */}
        <Flex justify="flex-end" gap={2} px={5} py={3} borderTopWidth="1px" borderColor="gray.100" bg="gray.50">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button
            size="sm"
            bg="#4F46E5"
            color="white"
            _hover={{ bg: "#4338CA" }}
            borderRadius="md"
            onClick={handleCreate}
            px={6}
          >
            Create Roster
          </Button>
        </Flex>
      </Box>
    </Box>
  );
}
