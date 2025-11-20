import { NextRequest } from "next/server";

// Minimal stub handlers to make this a valid Next.js route module
// Adjust implementation later when runtime API is defined
export async function GET() {
  return Response.json({ message: "Runtime endpoint not implemented" }, { status: 501 });
}

export async function POST(_req: NextRequest) {
  return Response.json({ error: "Runtime execution not implemented" }, { status: 501 });
}
