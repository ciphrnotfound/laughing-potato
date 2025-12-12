import { randomUUID } from "crypto";
import type { ToolDescriptor } from "@/lib/agentTypes";
import { tasksStorage } from "@/lib/storage";

function todayAt(hours: number, minutes: number) {
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date.toISOString();
}

export const calendarTools: ToolDescriptor[] = [
    {
        name: "calendar.scheduleDailyStandup",
        capability: "general.respond",
        description: "Create a 15-minute calendar standup and mirror it in the automation task list.",
        async run(args, ctx) {
            const userId = ctx?.metadata?.userId;
            if (!userId) {
                return { success: false, output: "User ID required for calendar operations" };
            }

            const title = typeof args.title === "string" && args.title.trim() ? args.title.trim() : "Daily standup";
            const team = typeof args.team === "string" && args.team.trim() ? args.team.trim() : "core";
            const time = typeof args.time === "string" && args.time.trim() ? args.time.trim() : "09:30";

            const [hours, minutes] = time.split(":").map((part) => Number(part));
            const isoDue = Number.isFinite(hours) && Number.isFinite(minutes) ? todayAt(hours, minutes) : todayAt(9, 30);

            const { getSupabaseClient } = await import("@/lib/supabase");
            const supabase = getSupabaseClient();

            const { data, error } = await supabase.from("automation_tasks").insert({
                user_id: userId,
                title: `${title} (${team})`,
                status: "open",
                due_date: isoDue,
                metadata: {
                    requestedBy: args.requestedBy ?? "calendar-tool",
                    originalArgs: args,
                }
            }).select().single();

            if (error) {
                return { success: false, output: `Failed to schedule: ${error.message}` };
            }

            const friendlyTime = new Date(isoDue).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            return {
                success: true,
                output: `Scheduled ${title} for the ${team} team at ${friendlyTime}. Added it to the automation queue (#${data.id.slice(0, 6)}).`,
            };
        },
    },
];
