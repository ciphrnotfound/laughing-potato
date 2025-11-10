// Minimal Hive compiler shim
// This is a lightweight parser used by the dev builder UI.
// It recognizes very small scripts like:
// bot Greeter on input say "Hi {input}" end
// and returns a simple JSON representation.

export type CompiledHive = {
  name?: string;
  raw: string;
  steps: Array<{ type: string; payload: string }>;
};

export function compileHive(source: string): CompiledHive {
  const raw = source || "";
  const lines = raw
    .replace(/\r/g, "")
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

  const steps: Array<{ type: string; payload: string }> = [];
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
    // fallback: record raw
    steps.push({ type: "raw", payload: line });
  }

  return { name, raw, steps };
}
