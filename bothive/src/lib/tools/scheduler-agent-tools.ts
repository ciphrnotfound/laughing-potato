import { ToolDescriptor, ToolContext } from "@/lib/agentTypes";
import { aiClient, AI_MODEL } from "@/lib/ai-client";

/**
 * Scheduler Agent Tools
 * Specialist agent for calendar management and meeting coordination
 */

export const schedulerAgentTools: ToolDescriptor[] = [
    {
        name: "scheduler.findSlots",
        capability: "scheduler.agent",
        description: "Find available meeting slots based on preferences",
        async run(args, ctx) {
            const duration = typeof args.duration === "number" ? args.duration : 30;
            const timezone = typeof args.timezone === "string" ? args.timezone : "UTC";
            const daysAhead = typeof args.daysAhead === "number" ? args.daysAhead : 7;

            // Simulate finding available slots (in production, this would call Google Calendar API)
            const now = new Date();
            const slots = [];

            for (let day = 1; day <= daysAhead; day++) {
                const date = new Date(now);
                date.setDate(date.getDate() + day);

                // Skip weekends
                if (date.getDay() === 0 || date.getDay() === 6) continue;

                // Add morning and afternoon slots
                const morningSlot = new Date(date);
                morningSlot.setHours(10, 0, 0, 0);

                const afternoonSlot = new Date(date);
                afternoonSlot.setHours(14, 0, 0, 0);

                slots.push({
                    start: morningSlot.toISOString(),
                    end: new Date(morningSlot.getTime() + duration * 60000).toISOString(),
                    duration,
                });

                slots.push({
                    start: afternoonSlot.toISOString(),
                    end: new Date(afternoonSlot.getTime() + duration * 60000).toISOString(),
                    duration,
                });
            }

            return {
                success: true,
                output: `Found ${slots.length} available slots`,
                data: { slots: slots.slice(0, 10) }, // Return first 10 slots
            };
        },
    },

    {
        name: "scheduler.bookMeeting",
        capability: "scheduler.agent",
        description: "Book a meeting with specified attendees",
        async run(args, ctx) {
            const title = typeof args.title === "string" ? args.title : "Meeting";
            const attendees = Array.isArray(args.attendees) ? args.attendees : [];
            const startTime = typeof args.startTime === "string" ? args.startTime : new Date().toISOString();
            const duration = typeof args.duration === "number" ? args.duration : 30;

            // Simulate meeting booking (in production, this would call Google Calendar API)
            const meetingId = `mtg_${Date.now()}`;
            const endTime = new Date(new Date(startTime).getTime() + duration * 60000).toISOString();

            const meeting = {
                id: meetingId,
                title,
                attendees,
                startTime,
                endTime,
                duration,
                meetLink: `https://meet.bothive.com/${meetingId}`,
                status: "confirmed",
            };

            return {
                success: true,
                output: `Meeting "${title}" booked for ${new Date(startTime).toLocaleString()}`,
                data: meeting,
            };
        },
    },

    {
        name: "scheduler.generateInvite",
        capability: "scheduler.agent",
        description: "Generate professional meeting invite text",
        async run(args, ctx) {
            const meetingData = args.meeting as any;
            const tone = typeof args.tone === "string" ? args.tone : "professional";

            if (!meetingData) {
                return { success: false, output: "Meeting data required" };
            }

            try {
                const completion = await aiClient.chat.completions.create({
                    model: AI_MODEL,
                    messages: [
                        {
                            role: "system",
                            content: `Generate ${tone} meeting invitation emails. Keep under 100 words. Include meeting link and time.`
                        },
                        {
                            role: "user",
                            content: `Create invite for:\nTitle: ${meetingData.title}\nTime: ${new Date(meetingData.startTime).toLocaleString()}\nDuration: ${meetingData.duration} minutes\nLink: ${meetingData.meetLink}`
                        }
                    ],
                    temperature: 0.7,
                });

                const invite = completion.choices[0]?.message?.content || "";

                return {
                    success: true,
                    output: invite,
                };
            } catch (error) {
                return {
                    success: false,
                    output: `Invite generation failed: ${error instanceof Error ? error.message : String(error)}`,
                };
            }
        },
    },
];
