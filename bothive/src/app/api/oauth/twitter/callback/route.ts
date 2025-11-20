import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { sessionsStorage, usersStorage } from "@/lib/storage";

interface TwitterTokenResponse {
  token_type: string;
  expires_in: number;
  access_token: string;
  scope?: string;
  refresh_token?: string;
}

interface TwitterUserResponse {
  data?: {
    id: string;
    name: string;
    username: string;
    profile_image_url?: string;
  };
}

const TWITTER_USER_FIELDS = "profile_image_url";

function buildRedirect(request: NextRequest, search: string) {
  const targetPath = search ? `/dashboard/social${search}` : "/dashboard/social";
  const base = process.env.NEXT_PUBLIC_APP_BASE_URL
    ? new URL(process.env.NEXT_PUBLIC_APP_BASE_URL)
    : new URL(request.url);
  base.pathname = targetPath;
  base.search = "";
  return NextResponse.redirect(base, { status: 302 });
}

export async function GET(request: NextRequest) {
  const clientId = process.env.TWITTER_CLIENT_ID;
  const clientSecret = process.env.TWITTER_CLIENT_SECRET;
  const redirectUri = process.env.TWITTER_REDIRECT_URI;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!clientId || !redirectUri) {
    return NextResponse.json({ error: "Twitter OAuth is not configured" }, { status: 500 });
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: "Supabase service role credentials missing" }, { status: 500 });
  }

  const url = new URL(request.url);
  const errorParam = url.searchParams.get("error") ?? undefined;
  const code = url.searchParams.get("code") ?? undefined;
  const state = url.searchParams.get("state") ?? undefined;

  const cookieStore = await cookies();
  const storedState = cookieStore.get("twitter_oauth_state")?.value;
  const codeVerifier = cookieStore.get("twitter_code_verifier")?.value;

  const response = buildRedirect(request, errorParam ? "?twitter=denied" : "");

  // Clear transient cookies
  response.cookies.set("twitter_oauth_state", "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  response.cookies.set("twitter_code_verifier", "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  if (errorParam) {
    return response;
  }

  if (!code || !state || !storedState || !codeVerifier) {
    response.headers.set("Location", buildRedirect(request, "?twitter=invalid_state").headers.get("Location") ?? "");
    return response;
  }

  if (state !== storedState) {
    response.headers.set("Location", buildRedirect(request, "?twitter=state_mismatch").headers.get("Location") ?? "");
    return response;
  }

  const sessionId = cookieStore.get("session")?.value;

  if (!sessionId) {
    response.headers.set(
      "Location",
      buildRedirect(request, "").headers.get("Location")?.replace("/dashboard/social", "/signin?redirect=/dashboard/social&twitter=auth") ??
        ""
    );
    return response;
  }

  const sessions = (await sessionsStorage.read()) as Record<string, { userId?: string; expiresAt?: string }>;
  const session = sessions[sessionId];

  if (!session || !session.userId || !session.expiresAt || new Date(session.expiresAt) < new Date()) {
    if (session) {
      delete sessions[sessionId];
      await sessionsStorage.write(sessions);
    }
    response.headers.set(
      "Location",
      buildRedirect(request, "").headers.get("Location")?.replace("/dashboard/social", "/signin?redirect=/dashboard/social&twitter=auth") ??
        ""
    );
    return response;
  }

  const users = await usersStorage.read();
  const hasUser = Object.values(users).some((entry) => typeof entry === "object" && entry && (entry as { id?: string }).id === session.userId);

  if (!hasUser) {
    response.headers.set(
      "Location",
      buildRedirect(request, "").headers.get("Location")?.replace("/dashboard/social", "/signin?redirect=/dashboard/social&twitter=auth") ??
        ""
    );
    return response;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  try {
    const tokenBody = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
      client_id: clientId,
    });

    const tokenHeaders: Record<string, string> = {
      "Content-Type": "application/x-www-form-urlencoded",
    };

    if (clientSecret) {
      const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
      tokenHeaders.Authorization = `Basic ${basicAuth}`;
    }

    const tokenResult = await fetch("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers: tokenHeaders,
      body: tokenBody.toString(),
    });

    if (!tokenResult.ok) {
      response.headers.set("Location", buildRedirect(request, "?twitter=token_error").headers.get("Location") ?? "");
      return response;
    }

    const tokenData = (await tokenResult.json()) as TwitterTokenResponse;
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token ?? null;
    const expiresAt = tokenData.expires_in
      ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
      : null;

    if (!accessToken) {
      response.headers.set("Location", buildRedirect(request, "?twitter=token_missing").headers.get("Location") ?? "");
      return response;
    }

    const profileResult = await fetch(
      `https://api.twitter.com/2/users/me?user.fields=${TWITTER_USER_FIELDS}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!profileResult.ok) {
      response.headers.set("Location", buildRedirect(request, "?twitter=profile_error").headers.get("Location") ?? "");
      return response;
    }

    const profileData = (await profileResult.json()) as TwitterUserResponse;
    const profile = profileData.data;

    const metadata = profile
      ? {
          accountId: profile.id,
          handle: profile.username,
          displayName: profile.name,
          avatarUrl: profile.profile_image_url ?? null,
          scope: tokenData.scope ?? null,
        }
      : { scope: tokenData.scope ?? null };

    const { error } = await supabase.from("connected_accounts").upsert(
      {
        user_id: session.userId,
        provider: "twitter",
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: expiresAt,
        metadata,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,provider",
      }
    );

    if (error) {
      console.error("Failed to persist Twitter account", error);
      response.headers.set("Location", buildRedirect(request, "?twitter=store_error").headers.get("Location") ?? "");
      return response;
    }

    response.headers.set("Location", buildRedirect(request, "?twitter=connected").headers.get("Location") ?? "");
    return response;
  } catch (error) {
    console.error("Twitter OAuth callback error", error);
    response.headers.set("Location", buildRedirect(request, "?twitter=unexpected").headers.get("Location") ?? "");
    return response;
  }
}
