import { NextResponse } from "next/server";
import { compileHive } from "@/lib/compileHive";
import { agentRegistry } from "@/lib/registry";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, code } = body;
    if (!name || !code) {
      return NextResponse.json({ error: "Missing name or code" }, { status: 400 });
    }

    const compiled = compileHive(code);

    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    // Build a human-readable description from steps regardless of step variant
    const description = compiled.steps
      .map((s) => {
        if (s.type === "call") return s.tool;
        // These variants carry a payload field
        // Using type guard to satisfy TS without changing runtime behavior
        if ("payload" in s && typeof (s as any).payload === "string") return (s as any).payload;
        if (s.type === "remember") return `remember ${s.key}`;
        return s.type;
      })
      .join(" ")
      .trim();

    const def = {
      id,
      name,
      description,
      skills: compiled.steps.map((s) => s.type),
      memoryKeys: [],
    };

    await agentRegistry.upsert(def);

    return NextResponse.json({ ok: true, id, compiled }, { status: 201 });
  } catch (err) {
    console.error("/api/bots POST error", err);
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}
