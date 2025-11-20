import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { randomBytes, createHash } from "crypto";
import { sessionsStorage, usersStorage } from "@/lib/storage";

const SCOPE = ["tweet.read", "tweet.write", "users.read", "offline.access"].join(" ");

function base64UrlEncode(buffer: Buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function generateCodeVerifier() {
  return base64UrlEncode(randomBytes(32));
}

function generateCodeChallenge(verifier: string) {
  const hash = createHash("sha256").update(verifier).digest();
  return base64UrlEncode(hash);
}

export async function GET(request: NextRequest) {
  const clientId = process.env.TWITTER_CLIENT_ID;
  const redirectUri = process.env.TWITTER_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json({ error: "Twitter OAuth is not configured" }, { status: 500 });
  }

  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  if (!sessionId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const sessions = (await sessionsStorage.read()) as Record<string, { userId?: string; expiresAt?: string }>;
  const session = sessions[sessionId];

  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  if (!session.expiresAt || new Date(session.expiresAt) < new Date()) {
    delete sessions[sessionId];
    await sessionsStorage.write(sessions);
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  if (!session.userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const users = await usersStorage.read();
  const hasUser = Object.values(users).some((entry) => typeof entry === "object" && entry && (entry as { id?: string }).id === session.userId);

  if (!hasUser) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const state = base64UrlEncode(randomBytes(16));

  const authorizationUrl = new URL("https://twitter.com/i/oauth2/authorize");
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("client_id", clientId);
  authorizationUrl.searchParams.set("redirect_uri", redirectUri);
  authorizationUrl.searchParams.set("scope", SCOPE);
  authorizationUrl.searchParams.set("state", state);
  authorizationUrl.searchParams.set("code_challenge", codeChallenge);
  authorizationUrl.searchParams.set("code_challenge_method", "S256");

  const response = NextResponse.redirect(authorizationUrl.toString(), {
    status: 302,
  });

  const maxAge = 60 * 10; // 10 minutes
  response.cookies.set("twitter_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge,
  });
  response.cookies.set("twitter_code_verifier", codeVerifier, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge,
  });

  return response;
}
