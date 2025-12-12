export const HIVE_MACRO_LIBRARY: Record<string, string> = {
    triageinbox: `-- Macro: triageInbox
  tools(messaging.fetchFeed, messaging.filterImportant, messaging.routeSummary)
  call messaging.fetchFeed with provider: "slack", channel: "#general", timeWindow: "last 6 hours"
  call messaging.filterImportant with criteria: "escalations, blockers, executives"
  call messaging.routeSummary with audience: "team leads", format: "markdown"
  say "Here are the urgent highlights: {summary}"
`,
    dailyplanner: `-- Macro: dailyPlanner
  tools(calendar.scheduleDailyStandup, general.recordTask)
  call calendar.scheduleDailyStandup with title: "Daily sync", team: "core", time: "09:30"
  call general.recordTask with title: "Plan today's top 3 priorities"
  say "You're set for today. Let me know when to adjust."
`,
};

export type HiveMacroName = keyof typeof HIVE_MACRO_LIBRARY;
