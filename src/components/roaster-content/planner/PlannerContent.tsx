"use client";
import React, { useState, useEffect } from "react";
import { Box, Button, Text, Flex, Spinner } from "@chakra-ui/react";
import { ArrowLeft2, ArrowRight2, Candle2, Filter } from "iconsax-reactjs";
import DemoAuthProvider, { useDemoAuth } from "./DemoAuthProvider";
import PlannerCalendar from "./PlannerCalendar";
import MonthView from "./MonthView";
import RosterPanel from "./RosterList";
import NewRosterModal from "./NewRosterModal";
import { plannerEvents, liveEvents, sampleStaff } from "../../../types/mockEvents";
import EventDetails from "./EventDetails";
import { PlannerEvent } from "../../../types/types";

/** Color map for auto-assigning colors when dropping a user on a column */
const COLUMN_COLORS: Record<string, { color: string; borderColor: string }> = {
  Behandelingkamer1: { color: "#E8F5E9", borderColor: "#38A169" },
  Management: { color: "#FFF8E1", borderColor: "#D69E2E" },
  "Bijzonderheden-Verlof-Cursus-BZV": { color: "#EBF8FF", borderColor: "#2B6CB0" },
  Financien: { color: "#FFF8E1", borderColor: "#D69E2E" },
};

function PlannerInner() {
    const { users } = useDemoAuth();
    const [planEvents, setPlanEvents] = useState<PlannerEvent[]>(plannerEvents);
    const [liveEventsList, setLiveEventsList] = useState<PlannerEvent[]>(liveEvents);
    const [selectedColumnEvents, setSelectedColumnEvents] = useState<PlannerEvent[]>([]);
    const [viewMode, setViewMode] = useState<"live" | "planner">("planner");
    const [calendarView, setCalendarView] = useState<"day" | "month">("day");
    const [currentDate, setCurrentDate] = useState<Date>(new Date("2025-09-08"));
    const [isNewOpen, setIsNewOpen] = useState(false);
    const [showRoster, setShowRoster] = useState(false);
    const [thisDayOpen, setThisDayOpen] = useState(false);
    const [thisDayLabel, setThisDayLabel] = useState("This day");
    const [isLoading, setIsLoading] = useState(false);

    // Current events depend on viewMode
    const events = viewMode === "planner" ? planEvents : liveEventsList;
    const setEvents = viewMode === "planner" ? setPlanEvents : setLiveEventsList;

    const handleEventClick = (event: PlannerEvent) => {
        const columnEvents = events.filter((plannerEvent) => (plannerEvent.location || "") === (event.location || ""));
        setSelectedColumnEvents(columnEvents);
        setShowRoster(true);
    };

    const closePopup = () => setSelectedColumnEvents([]);

    // Navigation — in month view, go prev/next month
    const goToNextDay = () => {
        setIsLoading(true);
        if (calendarView === "month") {
            setCurrentDate((previousDate) => new Date(previousDate.getFullYear(), previousDate.getMonth() + 1, 1));
        } else {
            setCurrentDate((previousDate) => new Date(previousDate.getTime() + 86400000));
        }
    };
    const goToPrevDay = () => {
        setIsLoading(true);
        if (calendarView === "month") {
            setCurrentDate((previousDate) => new Date(previousDate.getFullYear(), previousDate.getMonth() - 1, 1));
        } else {
            setCurrentDate((previousDate) => new Date(previousDate.getTime() - 86400000));
        }
    };
    const goToToday = () => setCurrentDate(new Date());

    const handleCreate = (event: PlannerEvent) => {
        setEvents((previousEvents) => [...previousEvents, event]);
        setIsNewOpen(false);
        setShowRoster(true);
    };

    /** Handle drag-drop of a user onto a calendar time slot */
    const handleDropUser = (userId: string, column: string, hour: number, minute: number) => {
        const user = users.find((currentUser) => currentUser.id === userId);
        if (!user) return;

        const baseDate = currentDate;
        const startDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), hour, minute);
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour default

        const colors = COLUMN_COLORS[column] || { color: "#fff", borderColor: "#A0AEC0" };

        const newEvent: PlannerEvent = {
            id: `drop-${Date.now()}`,
            title: `${user.name}`,
            start: startDate.toISOString(),
            end: endDate.toISOString(),
            userId: user.id,
            location: column,
            color: colors.color,
            borderColor: colors.borderColor,
        };

        setEvents((previousEvents) => [...previousEvents, newEvent]);
        setShowRoster(true);
    };

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
    const dayNamesDutch = ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"];

    // When switching modes, change the date context
    const switchToLive = () => {
        setIsLoading(true);
        setViewMode("live");
        setCurrentDate(new Date()); // Live = today
    };
    const switchToPlanner = () => {
        setIsLoading(true);
        setViewMode("planner");
        setCurrentDate(new Date("2025-09-08")); // Planner = future schedule date
    };

    // Clear loading state after mode/date transitions
    useEffect(() => {
        if (isLoading) {
            const loadTimer = setTimeout(() => setIsLoading(false), 400);
            return () => clearTimeout(loadTimer);
        }
    }, [isLoading, viewMode, currentDate, calendarView]);

    return (
        <Box>
            {/* Page header */}
            <Flex align="center" justify="space-between" mb={2} flexWrap="wrap" gap={2}>
                <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="gray.800">Planner</Text>
                <Flex gap={2} align="center" flexWrap="wrap">
                    <Button variant="outline" size="sm" borderRadius="md" fontSize="xs" color="gray.600">
                        <Text mr={1}>&#9662;</Text> Open Days
                    </Button>
                    <Button size="sm" borderRadius="md" fontSize="xs" color="gray.600" variant="outline" onClick={() => setIsNewOpen(true)}>
                        + Nieuw <Text ml={1}>&#9662;</Text>
                    </Button>
                </Flex>
            </Flex>

            {/* Live / Planner toggle */}
            <Flex mb={4} borderWidth="1px" borderColor={viewMode === "planner" ? "#DDD6FE" : "#FECACA"} borderRadius="full" px={1} py={0.5} display="flex" alignItems="center" gap={0} bg={viewMode === "planner" ? "#F5F3FF" : "#FEF2F2"}>
                <Flex
                    as="button"
                    align="center"
                    justify="center"
                    gap={1.5}
                    borderRadius="full"
                    px={4}
                    py={1}
                    bg={viewMode === "live" ? "white" : "transparent"}
                    boxShadow={viewMode === "live" ? "0 1px 3px rgba(0,0,0,0.08)" : "none"}
                    borderWidth="1px"
                    borderColor={viewMode === "live" ? "#EF4444" : "transparent"}
                    cursor="pointer"
                    onClick={switchToLive}
                    transition="all 0.15s"
                    flexShrink={0}
                >
                    {viewMode === "live" && <Box w="7px" h="7px" borderRadius="full" bg="#EF4444" flexShrink={0} />}
                    <Text fontSize="sm" fontWeight={viewMode === "live" ? "600" : "400"} color={viewMode === "live" ? "gray.800" : "gray.500"}>Live</Text>
                </Flex>
                <Flex
                    as="button"
                    align="center"
                    justify="center"
                    borderRadius="full"
                    px={4}
                    py={1}
                    bg={viewMode === "planner" ? "#4F46E5" : "transparent"}
                    color={viewMode === "planner" ? "white" : "gray.500"}
                    boxShadow={viewMode === "planner" ? "0 1px 3px rgba(0,0,0,0.1)" : "none"}
                    cursor="pointer"
                    onClick={switchToPlanner}
                    fontWeight={viewMode === "planner" ? "600" : "400"}
                    fontSize="sm"
                    transition="all 0.15s"
                    flexShrink={0}
                >
                    Planner
                </Flex>
                <Text fontSize="sm" color="gray.400" ml={3} flex="1" display={{ base: "none", md: "block" }}>
                    {viewMode === "planner" ? "Description of the planner view" : "Description of the live"}
                </Text>
            </Flex>

            {/* Toolbar row */}
            <Flex align="center" mb={3} minH="36px" flexWrap="wrap" gap={2}>
                {/* Left: date */}
                <Flex align="center" gap={2} flexShrink={0}>
                    <Flex align="baseline" gap={0} flexShrink={0} border="1px solid gray" borderRadius="full" px={2} py={0.5}>
                        <Text fontSize="xs" color="gray.400" mr={1}>{dayNamesDutch[currentDate.getDay()]}</Text>
                        <Text fontSize="xs" color="gray.400" fontWeight="600" mr={2}>{currentDate.getDate()}</Text>
                    </Flex>
                    <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold" color="gray.800" whiteSpace="nowrap">{monthNames[currentDate.getMonth()]}, {currentDate.getFullYear()}</Text>
                </Flex>

                {/* Spacer */}
                <Box flex="1" display={{ base: "none", lg: "block" }} />

                {/* Right: controls */}
                <Flex align="center" gap={1.5} flexWrap="wrap">
                    {/* Settings icon */}
                    <Box color="gray.400" cursor="pointer" _hover={{ color: "gray.600" }} p={1}>
                        <Candle2 size={15} />
                    </Box>
                    {/* Filter icon */}
                    <Box color="gray.400" cursor="pointer" _hover={{ color: "gray.600" }} p={1}>
                        <Filter size={15} />
                    </Box>

                    {/* Separator */}
                    <Box w="1px" h="16px" bg="gray.200" mx={0.5} display={{ base: "none", md: "block" }} />

                    {/* Prev / Current day / Next - connected group */}
                    <Flex align="center" gap={0}>
                        <Flex
                            as="button"
                            align="center"
                            justify="center"
                            w="28px" h="28px"
                            borderWidth="1px"
                            borderColor="gray.200"
                            borderRightWidth="0"
                            borderLeftRadius="md"
                            borderRightRadius="0"
                            color="gray.500"
                            _hover={{ bg: "gray.50" }}
                            onClick={goToPrevDay}
                        >
                            <ArrowLeft2 size={14} />
                        </Flex>

                        <Flex
                            as="button"
                            align="center"
                            h="28px"
                            px={3}
                            borderWidth="1px"
                            borderColor="gray.200"
                            borderRadius="0"
                            color="gray.600"
                            fontSize="xs"
                            fontWeight="500"
                            _hover={{ bg: "gray.50" }}
                            onClick={goToToday}
                        >
                            Current day
                        </Flex>

                        <Flex
                            as="button"
                            align="center"
                            justify="center"
                            w="28px" h="28px"
                            borderWidth="1px"
                            borderColor="gray.200"
                            borderLeftWidth="0"
                            borderRightRadius="md"
                            borderLeftRadius="0"
                            color="gray.500"
                            _hover={{ bg: "gray.50" }}
                            onClick={goToNextDay}
                        >
                            <ArrowRight2 size={14} />
                        </Flex>
                    </Flex>

                    {/* Separator */}
                    <Box w="1px" h="16px" bg="gray.200" mx={0.5} display={{ base: "none", md: "block" }} />

                    {/* This day dropdown */}
                    <Box position="relative">
                        <Flex
                            as="button"
                            align="center"
                            gap={1.5}
                            h="28px"
                            px={3}
                            borderRadius="full"
                            cursor="pointer"
                            onClick={() => setThisDayOpen((previousState) => !previousState)}
                            _hover={{ bg: "gray.50" }}
                        >
                            <Box w="7px" h="7px" borderRadius="full" bg="green.500" flexShrink={0} />
                            <Text fontSize="xs" fontWeight="500" color="green.600">{thisDayLabel}</Text>
                            <Text fontSize="10px" color="green.500" ml={-0.5}>&#9662;</Text>
                        </Flex>

                        {thisDayOpen && (
                            <Box
                                position="absolute"
                                top="100%"
                                right={0}
                                mt={1}
                                bg="white"
                                borderWidth="1px"
                                borderColor="gray.200"
                                borderRadius="lg"
                                boxShadow="lg"
                                py={1.5}
                                minW="140px"
                                zIndex={100}
                            >
                                {[
                                    { label: "Deze daag" },
                                    { label: "Deze week" },
                                    { label: "Maand" },
                                    { label: "Custom +" },
                                ].map((opt) => (
                                    <Box
                                        key={opt.label}
                                        px={4}
                                        py={1.5}
                                        fontSize="sm"
                                        color="gray.700"
                                        cursor="pointer"
                                        _hover={{ bg: "gray.50" }}
                                        onClick={() => { setThisDayLabel(opt.label); setThisDayOpen(false); }}
                                    >
                                        {opt.label}
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Box>

                    {/* Separator - hidden on small screens when wrapped */}
                    <Box w="1px" h="16px" bg="gray.200" mx={0.5} display={{ base: "none", md: "block" }} />

                    {/* Publish All */}
                    <Flex
                        as="button"
                        align="center"
                        h="28px"
                        px={3}
                        borderRadius="full"
                        borderWidth="1px"
                        borderColor="gray.200"
                        color="gray.600"
                        fontSize="xs"
                        fontWeight="500"
                        _hover={{ bg: "gray.50" }}
                        flexShrink={0}
                    >
                        Publish All
                    </Flex>

                    {/* Lock Shift */}
                    <Flex
                        as="button"
                        align="center"
                        gap={1.5}
                        h="28px"
                        px={3}
                        borderRadius="full"
                        borderWidth="1px"
                        borderColor="gray.200"
                        color="gray.600"
                        fontSize="xs"
                        fontWeight="500"
                        _hover={{ bg: "gray.50" }}
                        flexShrink={0}
                    >
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                            <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3" fill="none" />
                            <path d="M5.5 7V5a2.5 2.5 0 015 0v2" stroke="currentColor" strokeWidth="1.3" fill="none" />
                        </svg>
                        Lock Shift
                    </Flex>
                </Flex>
            </Flex>

            {/* Main body: optional roster panel + calendar */}
            <Flex borderWidth="1px" borderColor="gray.100" borderRadius="lg" overflow="hidden" bg="white" h={{ base: "calc(100vh - 320px)", md: "calc(100vh - 260px)" }} direction={{ base: "column", md: "row" }}>
                {showRoster && (
                    <RosterPanel staff={sampleStaff} events={events} users={users} onClose={() => setShowRoster(false)} />
                )}
                <Box flex="1" overflow="auto" position="relative">
                    {isLoading && (
                        <Flex position="absolute" inset="0" zIndex={10} bg="whiteAlpha.800" align="center" justify="center">
                            <Spinner size="lg" color="blue.500" borderWidth="3px" />
                        </Flex>
                    )}
                    {calendarView === "day" ? (
                        events.filter((event) => {
                            const eventDate = new Date(event.start);
                            return eventDate.toDateString() === currentDate.toDateString();
                        }).length === 0 && !isLoading ? (
                            <Flex align="center" justify="center" h="100%" direction="column" gap={3}>
                                <Text fontSize="4xl">📅</Text>
                                <Text fontSize="lg" fontWeight="600" color="gray.500">No events scheduled</Text>
                                <Text fontSize="sm" color="gray.400">There are no events for this day. Click &quot;+ Nieuw&quot; to create one.</Text>
                            </Flex>
                        ) : (
                            <PlannerCalendar
                            events={events}
                            onEventClick={handleEventClick}
                            onDropUser={handleDropUser}
                            date={currentDate}
                            users={users}
                        />
                        )
                    ) : (
                        <MonthView
                            events={events}
                            date={currentDate}
                            onDayClick={(selectedDate) => { setCurrentDate(selectedDate); setCalendarView("day"); }}
                            users={users}
                        />
                    )}
                </Box>
            </Flex>

            {/* Event details popup (See All) */}
            <EventDetails events={selectedColumnEvents} date={currentDate} users={users} onClose={closePopup} />

            {/* New roster modal */}
            <NewRosterModal isOpen={isNewOpen} onClose={() => setIsNewOpen(false)} onCreate={handleCreate} currentDate={currentDate} />
        </Box>
    );
}

export default function PlannerContent() {
    return (
        <DemoAuthProvider>
            <PlannerInner />
        </DemoAuthProvider>
    );
}
