"use client";
import React from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { PlannerEvent } from "./types";

type Props = {
  events: PlannerEvent[];
  date: Date;
  onDayClick: (date: Date) => void;
  users: { id: string; name: string; initials?: string }[];
};

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  // Monday = 0 .. Sunday = 6
  let startDayOfWeek = firstDay.getDay() - 1;
  if (startDayOfWeek < 0) startDayOfWeek = 6;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const cells: { day: number; month: number; year: number; isCurrentMonth: boolean }[] = [];

  // Previous month padding
  for (let paddingIndex = startDayOfWeek - 1; paddingIndex >= 0; paddingIndex--) {
    const dayNumber = prevMonthDays - paddingIndex;
    const previousMonth = month === 0 ? 11 : month - 1;
    const previousYear = month === 0 ? year - 1 : year;
    cells.push({ day: dayNumber, month: previousMonth, year: previousYear, isCurrentMonth: false });
  }

  // Current month
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ day, month, year, isCurrentMonth: true });
  }

  // Next month padding (fill to 42 = 6 rows)
  const remaining = 42 - cells.length;
  for (let day = 1; day <= remaining; day++) {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    cells.push({ day, month: nextMonth, year: nextYear, isCurrentMonth: false });
  }

  return cells;
}

function getUserInitials(users: Props["users"], userId: string) {
  const matchedUser = users.find((user) => user.id === userId);
  if (matchedUser?.initials) return matchedUser.initials;
  if (matchedUser) return matchedUser.name.split(" ").map((word) => word[0]).join("").toUpperCase().slice(0, 2);
  return userId.slice(0, 2).toUpperCase();
}

export default function MonthView({ events, date, onDayClick, users }: Props) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const cells = getMonthGrid(year, month);
  const today = new Date();

  // Group events by date key "YYYY-MM-DD"
  const eventsByDate = new Map<string, PlannerEvent[]>();
  for (const event of events) {
    const eventDate = new Date(event.start);
    const key = `${eventDate.getFullYear()}-${String(eventDate.getMonth()).padStart(2, "0")}-${String(eventDate.getDate()).padStart(2, "0")}`;
    if (!eventsByDate.has(key)) eventsByDate.set(key, []);
    eventsByDate.get(key)!.push(event);
  }

  return (
    <Box p={2}>
      {/* Day name headers */}
      <Flex>
        {DAY_NAMES.map((dayName) => (
          <Box key={dayName} flex="1" textAlign="center" py={2}>
            <Text fontSize="xs" fontWeight="600" color="gray.500">{dayName}</Text>
          </Box>
        ))}
      </Flex>

      {/* Grid of weeks */}
      {Array.from({ length: 6 }).map((_, weekIndex) => (
        <Flex key={weekIndex}>
          {cells.slice(weekIndex * 7, weekIndex * 7 + 7).map((cell, dayIndex) => {
            const dateKey = `${cell.year}-${String(cell.month).padStart(2, "0")}-${String(cell.day).padStart(2, "0")}`;
            const dayEvents = eventsByDate.get(dateKey) || [];
            const isToday =
              cell.day === today.getDate() &&
              cell.month === today.getMonth() &&
              cell.year === today.getFullYear();
            const cellDate = new Date(cell.year, cell.month, cell.day);

            return (
              <Box
                key={dayIndex}
                flex="1"
                minH="100px"
                borderWidth="1px"
                borderColor="gray.50"
                p={1}
                cursor="pointer"
                bg={isToday ? "blue.50" : "white"}
                _hover={{ bg: isToday ? "blue.100" : "gray.50" }}
                onClick={() => onDayClick(cellDate)}
                transition="background 0.15s"
              >
                <Text
                  fontSize="sm"
                  fontWeight={isToday ? "bold" : "normal"}
                  color={cell.isCurrentMonth ? (isToday ? "blue.600" : "gray.800") : "gray.300"}
                  mb={1}
                >
                  {cell.day}
                </Text>

                {/* Show up to 3 event pills */}
                {dayEvents.slice(0, 3).map((event) => (
                  <Flex
                    key={event.id}
                    align="center"
                    gap={1}
                    mb={0.5}
                    bg={event.color || "gray.100"}
                    borderLeftWidth="2px"
                    borderLeftColor={event.borderColor || "gray.300"}
                    borderRadius="sm"
                    px={1}
                    py={0.5}
                  >
                    <Flex
                      w="14px" h="14px" borderRadius="full"
                      bg={event.borderColor || "gray.300"} color="white"
                      align="center" justify="center" fontSize="7px" fontWeight="bold" flexShrink={0}
                    >
                      {getUserInitials(users, event.userId)}
                    </Flex>
                    <Text fontSize="9px" fontWeight="500" lineClamp={1} color="gray.700">
                      {event.title}
                    </Text>
                  </Flex>
                ))}
                {dayEvents.length > 3 && (
                  <Text fontSize="9px" color="gray.400" mt={0.5}>+{dayEvents.length - 3} more</Text>
                )}
              </Box>
            );
          })}
        </Flex>
      ))}
    </Box>
  );
}
