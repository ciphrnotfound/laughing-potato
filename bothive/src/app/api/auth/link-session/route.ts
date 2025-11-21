import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { sessionsStorage, usersStorage } from "@/lib/storage";

type StoredUser = {
  id?: string;
  email?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
  provider?: string | null;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
};

interface LinkSessionRequest {
  accessToken?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as LinkSessionRequest;
    const accessToken = body.accessToken?.trim();

    if (!accessToken) {
      return NextResponse.json({ error: "Missing access token" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: "Supabase credentials missing" }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const { data, error } = await supabaseAdmin.auth.getUser(accessToken);

    if (error || !data?.user) {
      return NextResponse.json({ error: "Invalid Supabase access token" }, { status: 401 });
    }

    const user = data.user;
    const userKey = user.email ?? user.id;
    const users = (await usersStorage.read()) as Record<string, StoredUser>;
    const existingEntry = users[userKey];
    const timestamp = new Date().toISOString();

    users[userKey] = {
      ...existingEntry,
      id: user.id,
      email: user.email ?? null,
      name: user.user_metadata?.full_name ?? existingEntry?.name ?? null,
      avatarUrl: user.user_metadata?.avatar_url ?? existingEntry?.avatarUrl ?? null,
      provider: "supabase",
      createdAt: existingEntry?.createdAt ?? timestamp,
      updatedAt: timestamp,
    };
    await usersStorage.write(users);

    const sessions = (await sessionsStorage.read()) as Record<
      string,
      { userId?: string; email?: string | null; expiresAt?: string; createdAt?: string }
    >;

    const sessionId = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    sessions[sessionId] = {
      userId: user.id,
      email: user.email ?? null,
      createdAt: new Date().toISOString(),
      expiresAt,
    };

    await sessionsStorage.write(sessions);

    const response = NextResponse.json({ linked: true });
    response.cookies.set("session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Link session error:", error);
    return NextResponse.json({ error: "Failed to link session" }, { status: 500 });
  }
}
