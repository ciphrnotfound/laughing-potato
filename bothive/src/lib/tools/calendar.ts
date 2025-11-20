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
    async run(args) {
      const title = typeof args.title === "string" && args.title.trim() ? args.title.trim() : "Daily standup";
      const team = typeof args.team === "string" && args.team.trim() ? args.team.trim() : "core";
      const time = typeof args.time === "string" && args.time.trim() ? args.time.trim() : "09:30";

      const [hours, minutes] = time.split(":" ).map((part) => Number(part));
      const isoDue = Number.isFinite(hours) && Number.isFinite(minutes) ? todayAt(hours, minutes) : todayAt(9, 30);

      const task = {
        id: randomUUID(),
        title: `${title} (${team})`,
        status: "open" as const,
        createdAt: new Date().toISOString(),
        dueDate: isoDue,
        metadata: {
          requestedBy: args.requestedBy ?? "calendar-tool",
          originalArgs: args,
        },
      };

      const tasks = await tasksStorage.read();
      tasks.push(task);
      await tasksStorage.write(tasks);

      const friendlyTime = new Date(isoDue).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      return {
        success: true,
        output: `Scheduled ${title} for the ${team} team at ${friendlyTime}. Added it to the automation queue (#${task.id.slice(0, 6)}).`,
      };
    },
  },
];
