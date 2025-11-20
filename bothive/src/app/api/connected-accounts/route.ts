import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { sessionsStorage, usersStorage } from "@/lib/storage";

interface ConnectedAccountRow {
  provider: string;
  access_token: string;
  refresh_token: string | null;
  expires_at: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string | null;
  updated_at: string | null;
}

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return NextResponse.json({ error: "Supabase configuration missing" }, { status: 500 });
  }

  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  if (!sessionId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const sessions = (await sessionsStorage.read()) as Record<string, { userId?: string; expiresAt?: string }>;
  const session = sessions[sessionId];

  if (!session || !session.userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  if (!session.expiresAt || new Date(session.expiresAt) < new Date()) {
    delete sessions[sessionId];
    await sessionsStorage.write(sessions);
    return NextResponse.json({ error: "Authentication expired" }, { status: 401 });
  }

  const users = await usersStorage.read();
  const userExists = Object.values(users).some(
    (entry) => typeof entry === "object" && entry && (entry as { id?: string }).id === session.userId
  );

  if (!userExists) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, { auth: { persistSession: false } });

  const { data, error } = await supabase
    .from("connected_accounts")
    .select("provider, metadata, expires_at, created_at, updated_at")
    .eq("user_id", session.userId);

  if (error) {
    console.error("Failed to fetch connected accounts", error);
    return NextResponse.json({ error: "Failed to load connected accounts" }, { status: 500 });
  }

  const accounts = (data as ConnectedAccountRow[]).map((row) => ({
    provider: row.provider,
    metadata: row.metadata ?? null,
    expiresAt: row.expires_at,
    connectedAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  return NextResponse.json({ accounts });
}
