"use client";
import React from "react";
import { Box, Button, Text, Flex } from "@chakra-ui/react";
import { FiChevronLeft, FiChevronRight, FiSliders, FiFilter } from "react-icons/fi";
import DemoAuthProvider, { useDemoAuth } from "./DemoAuthProvider";
import PlannerCalendar from "./PlannerCalendar";
import RosterPanel from "./RosterList";
import NewRosterModal from "./NewRosterModal";
import { sampleEvents, sampleStaff } from "./mockEvents";
import EventDetails from "./EventDetails";
import { PlannerEvent } from "./types";

function PlannerInner() {
    const { users } = useDemoAuth();
    const [events, setEvents] = React.useState<PlannerEvent[]>(sampleEvents);
    const [selectedColumnEvents, setSelectedColumnEvents] = React.useState<PlannerEvent[]>([]);
    const [viewMode, setViewMode] = React.useState<"live" | "planner">("live");
    const [currentDate, setCurrentDate] = React.useState<Date>(new Date("2025-09-08"));
    const [isNewOpen, setIsNewOpen] = React.useState(false);
    const [showRoster, setShowRoster] = React.useState(false);
    const [thisDayOpen, setThisDayOpen] = React.useState(false);
    const [thisDayLabel, setThisDayLabel] = React.useState("This day");

    const handleEventClick = (ev: PlannerEvent) => {
        // Gather all events in the same column (location) as the clicked event
        const columnEvents = events.filter((e) => (e.location || "") === (ev.location || ""));
        setSelectedColumnEvents(columnEvents);
        setShowRoster(true);
    };

    const closePopup = () => setSelectedColumnEvents([]);

    const goToNextDay = () => setCurrentDate((d) => new Date(d.getTime() + 86400000));
    const goToPrevDay = () => setCurrentDate((d) => new Date(d.getTime() - 86400000));
    const goToToday = () => setCurrentDate(new Date());

    const handleCreate = (ev: PlannerEvent) => {
        setEvents((s) => [...s, ev]);
        setIsNewOpen(false);
        setShowRoster(true); // Open roster panel to see newly assigned staff
    };

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
    const dayNamesDutch = ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"];

    return (
        <Box>
            {/* Page header */}
            <Flex align="center" justify="space-between" mb={2}>
                <Text fontSize="2xl" fontWeight="bold" color="gray.800">Planner</Text>
                <Flex gap={2} align="center">
                    <Button variant="outline" size="sm" borderRadius="md" fontSize="xs" color="gray.600">
                        <Text mr={1}>&#9662;</Text> Open Days
                    </Button>
                    <Button size="sm" borderRadius="md" fontSize="xs" color="gray.600" variant="outline" onClick={() => setIsNewOpen(true)}>
                        + Nieuw <Text ml={1}>&#9662;</Text>
                    </Button>
                </Flex>
            </Flex>

            {/* Live / Planner toggle */}
            <Flex mb={4} borderWidth="1px" borderColor={viewMode === "planner" ? "#DDD6FE" : "red"} borderRadius="full" px={1} py={1} display="flex" alignItems="center" gap={1} bg={viewMode === "planner" ? "#F5F3FF" : "red.50"}>
                <Flex
                    as="button"
                    align="center"
                    gap={1.5}
                    borderRadius="full"
                    px={4}
                    py={1.5}
                    bg={viewMode === "live" ? "white" : "transparent"}
                    boxShadow={viewMode === "live" ? "sm" : "none"}
                    cursor="pointer"
                    onClick={() => { setViewMode("live"); setCurrentDate(new Date()); }}
                    transition="all 0.15s"
                    flexShrink={0}
                >
                    {viewMode === "live" && <Box w="8px" h="8px" borderRadius="full" bg="red.500" />}
                    <Text fontSize="sm" fontWeight={viewMode === "live" ? "600" : "400"} color={viewMode === "live" ? "gray.800" : "gray.500"}>Live</Text>
                </Flex>
                <Button
                    size="sm"
                    borderRadius="full"
                    bg={viewMode === "planner" ? "#4F46E5" : "transparent"}
                    color={viewMode === "planner" ? "white" : "gray.500"}
                    _hover={{ bg: viewMode === "planner" ? "#4338CA" : "gray.100" }}
                    onClick={() => setViewMode("planner")}
                    px={5}
                    fontWeight="600"
                    fontSize="sm"
                    transition="all 0.15s"
                    flexShrink={0}
                >
                    Planner
                </Button>
                <Text fontSize="sm" color="gray.400" ml={2} flex="1">
                    {viewMode === "planner" ? "Description of the planner view" : "Description of the live"}
                </Text>
            </Flex>

            {/* Toolbar row — exact match to screenshot */}
            <Flex align="center" mb={3} h="36px" >
                {/* Left: date */}
                <Flex align="baseline" gap={0} flexShrink={0} border="1px solid gray" borderRadius="full" px={2} py={0.5}>

                    <Text fontSize="xs" color="gray.400"  mr={1}>{dayNamesDutch[currentDate.getDay()]}</Text>
                    <Text fontSize="xs" color="gray.400" fontWeight="600" mr={2}>{currentDate.getDate()}</Text>
                </Flex>
                    <Text fontSize="lg" fontWeight="bold" ml="3" color="gray.800">{monthNames[currentDate.getMonth()]}, {currentDate.getFullYear()}</Text>

                {/* Spacer */}
                <Box flex="1" />

                {/* Right: controls */}
                <Flex align="center" gap={1.5}>
                    {/* Settings icon */}
                    <Box color="gray.400" cursor="pointer" _hover={{ color: "gray.600" }} p={1}>
                        <FiSliders size={15} />
                    </Box>
                    {/* Filter icon */}
                    <Box color="gray.400" cursor="pointer" _hover={{ color: "gray.600" }} p={1}>
                        <FiFilter size={15} />
                    </Box>

                    {/* Separator */}
                    <Box w="1px" h="16px" bg="gray.200" mx={0.5} />

                    {/* Prev / Next */}
                    <Flex
                        as="button"
                        align="center"
                        justify="center"
                        w="28px" h="28px"
                        borderRadius="md"
                        borderWidth="1px"
                        borderColor="gray.200"
                        color="gray.500"
                        _hover={{ bg: "gray.50" }}
                        onClick={goToPrevDay}
                    >
                        <FiChevronLeft size={14} />
                    </Flex>

                    {/* Current day */}
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
                        onClick={goToToday}
                    >
                        Current day
                    </Flex>

                    <Flex
                        as="button"
                        align="center"
                        justify="center"
                        w="28px" h="28px"
                        borderRadius="md"
                        borderWidth="1px"
                        borderColor="gray.200"
                        color="gray.500"
                        _hover={{ bg: "gray.50" }}
                        onClick={goToNextDay}
                    >
                        <FiChevronRight size={14} />
                    </Flex>



                    {/* Separator */}
                    <Box w="1px" h="16px" bg="gray.200" mx={0.5} />

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
                            onClick={() => setThisDayOpen((p) => !p)}
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

                    {/* Separator */}
                    <Box w="1px" h="16px" bg="gray.200" mx={0.5} />

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
            <Flex borderWidth="1px" borderColor="gray.100" borderRadius="lg" overflow="hidden" bg="white" h="calc(100vh - 260px)">
                {showRoster && (
                    <RosterPanel staff={sampleStaff} events={events} users={users} onClose={() => setShowRoster(false)} />
                )}
                <Box flex="1" overflow="auto">
                    <PlannerCalendar
                        events={events}
                        onEventClick={handleEventClick}
                        date={currentDate}
                        users={users}
                    />
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
