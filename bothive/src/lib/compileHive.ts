// Minimal Hive compiler shim
// This is a lightweight parser used by the dev builder UI.
// It recognizes very small scripts like:
// bot Greeter on input say "Hi {input}" end
// and returns a simple JSON representation.

type ParsedStep =
  | { type: "say"; payload: string }
  | { type: "event"; payload: string }
  | { type: "call"; tool: string; args: Record<string, string> }
  | { type: "remember"; key: string; value: string }
  | { type: "raw"; payload: string };

export type CompiledHive = {
  name?: string;
  raw: string;
  steps: ParsedStep[];
  tools: string[];
  memory: string[];
};

export function compileHive(source: string): CompiledHive {
  const raw = source || "";
  const lines = raw
    .replace(/\r/g, "")
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

  const steps: ParsedStep[] = [];
  const tools = new Set<string>();
  const memoryKeys = new Set<string>();
  let name: string | undefined = undefined;

  // Very small heuristic parser for demo purposes
  // Look for a leading `bot <Name>` token
  const first = lines[0] || "";
  const botMatch = first.match(/^bot\s+(\S+)/i);
  if (botMatch) name = botMatch[1];

  for (const line of lines) {
    if (/^bot\b/i.test(line) || /^end\b/i.test(line)) continue;
    if (/^on\b/i.test(line)) {
      steps.push({ type: "event", payload: line });
      continue;
    }
    if (/^say\b/i.test(line)) {
      steps.push({ type: "say", payload: line.replace(/^say\s+/i, "") });
      continue;
    }
    if (/^call\b/i.test(line)) {
      const callMatch = line.match(/^call\s+([A-Za-z0-9._-]+)(?:\s+with\s+(.+))?/i);
      if (callMatch) {
        const [, tool, argsRaw] = callMatch;
        if (tool) tools.add(tool.trim());
        const args: Record<string, string> = {};
        if (argsRaw) {
          argsRaw
            .split(/,(?![^\"]*\")/)
            .map((segment) => segment.trim())
            .filter(Boolean)
            .forEach((segment) => {
              const [key, value] = segment.split(":").map((token) => token.trim());
              if (key) {
                const cleaned = value?.replace(/^"|"$/g, "") ?? "";
                args[key] = cleaned;
              }
            });
        }
        steps.push({ type: "call", tool: tool.trim(), args });
        continue;
      }
    }
    if (/^remember\b/i.test(line)) {
      const rememberMatch = line.match(/^remember\s+([A-Za-z0-9._-]+)\s+"([^"]*)"/i);
      if (rememberMatch) {
        const [, key, value] = rememberMatch;
        if (key) memoryKeys.add(key.trim());
        steps.push({ type: "remember", key: key.trim(), value: value ?? "" });
        continue;
      }
    }
    if (/^memory\[/i.test(line)) {
      const matches = line.replace(/^memory\[/i, "").replace(/\]$/i, "");
      matches
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean)
        .forEach((entry) => memoryKeys.add(entry));
    }
    if (/^tools\(/i.test(line)) {
      const list = line.replace(/^tools\(/i, "").replace(/\)$/i, "");
      list
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean)
        .forEach((entry) => tools.add(entry));
    }
    // fallback: record raw
    steps.push({ type: "raw", payload: line });
  }

  return { name, raw, steps, tools: Array.from(tools), memory: Array.from(memoryKeys) };
}
