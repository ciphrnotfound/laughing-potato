import { ToolDescriptor, ToolContext } from "@/lib/agentTypes";
import { google } from "googleapis";

/**
 * Google Calendar Integration Tools
 * Requires GOOGLE_CALENDAR_API_KEY and GOOGLE_CALENDAR_CLIENT_EMAIL in .env.local
 */

interface CalendarSlot {
    start: string;
    end: string;
    available: boolean;
}

interface FindSlotsInput {
    duration: number; // minutes
    attendees?: string[];
    timeframe?: "today" | "tomorrow" | "next_week" | "next_month";
    preferredTimes?: "morning" | "afternoon" | "evening";
}

interface CreateEventInput {
    title: string;
    slot: { start: string; end: string };
    attendees: string[];
    description?: string;
    location?: string;
}

/**
 * Find available calendar slots
 */
export const findCalendarSlots: ToolDescriptor = {
    name: "calendar.findSlots",
    capability: "calendar.schedule",
    description: "Find available time slots in Google Calendar",
    async run(input: Record<string, unknown>, context: ToolContext) {
        const duration = typeof input.duration === "number" ? input.duration : 30;
        const timeframe = typeof input.timeframe === "string" ? input.timeframe : "next_week";
        const preferredTimes = typeof input.preferredTimes === "string" ? input.preferredTimes : undefined;

        // Mock implementation for demo
        // In production, this would call Google Calendar API
        const mockSlots: CalendarSlot[] = [
            {
                start: "2025-11-27T10:00:00Z",
                end: "2025-11-27T10:30:00Z",
                available: true,
            },
            {
                start: "2025-11-27T14:00:00Z",
                end: "2025-11-27T14:30:00Z",
                available: true,
            },
            {
                start: "2025-11-28T09:00:00Z",
                end: "2025-11-28T09:30:00Z",
                available: true,
            },
        ];

        const filteredSlots = preferredTimes
            ? mockSlots.filter((slot) => {
                const hour = new Date(slot.start).getHours();
                if (preferredTimes === "morning") return hour >= 8 && hour < 12;
                if (preferredTimes === "afternoon") return hour >= 12 && hour < 17;
                if (preferredTimes === "evening") return hour >= 17 && hour < 21;
                return true;
            })
            : mockSlots;

        return {
            success: true,
            output: JSON.stringify({
                slots: filteredSlots,
                best: filteredSlots[0],
                count: filteredSlots.length,
            }),
        };
    },
};

/**
 * Create a calendar event
 */
export const createCalendarEvent: ToolDescriptor = {
    name: "calendar.createEvent",
    capability: "calendar.schedule",
    description: "Create a new event in Google Calendar",
    async run(input: Record<string, unknown>, context: ToolContext) {
        const title = typeof input.title === "string" ? input.title : "Untitled Event";
        const slot = input.slot as { start: string; end: string } | undefined;
        const attendees = Array.isArray(input.attendees) ? input.attendees.map(String) : [];
        const description = typeof input.description === "string" ? input.description : undefined;
        const location = typeof input.location === "string" ? input.location : undefined;

        if (!slot) {
            return { success: false, output: JSON.stringify({ error: "Missing slot data" }) };
        }

        const { start, end } = slot;

        // Mock implementation for demo
        // In production, this would call Google Calendar API
        const eventId = `evt_${Date.now()}`;
        const eventLink = `https://calendar.google.com/event?eid=${eventId}`;

        return {
            success: true,
            output: JSON.stringify({
                eventId,
                title,
                start: slot.start,
                end: slot.end,
                attendees,
                link: eventLink,
                message: `Event "${title}" created successfully`,
            }),
        };
    },
};

/**
 * Check calendar availability for specific attendees
 */
export const checkCalendarAvailability: ToolDescriptor = {
    name: "calendar.checkAvailability",
    capability: "calendar.schedule",
    description: "Check if attendees are available at a specific time",
    async run(input: Record<string, unknown>, context: ToolContext) {
        const attendees = Array.isArray(input.attendees) ? input.attendees.map(String) : [];
        const time = typeof input.time === "string" ? input.time : new Date().toISOString();

        // Mock implementation
        const availability = attendees.map((email) => ({
            email,
            available: Math.random() > 0.3, // 70% chance available
        }));

        return {
            success: true,
            output: JSON.stringify({
                time,
                attendees: availability,
                allAvailable: availability.every((a) => a.available),
            }),
        };
    },
};

export const calendarTools: ToolDescriptor[] = [
    findCalendarSlots,
    createCalendarEvent,
    checkCalendarAvailability,
];
