import { NextRequest, NextResponse } from "next/server";
import { sessionsStorage, usersStorage } from "@/lib/storage";

type StoredSession = {
  userId: string;
  email?: string;
  createdAt?: string;
  expiresAt?: string;
};

type StoredUser = {
  id: string;
  email?: string;
  password?: string;
  [key: string]: unknown;
};

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.cookies.get("session")?.value;

    if (!sessionId) {
      return Response.json({ authenticated: false }, { status: 401 });
    }

    const sessions = await sessionsStorage.read();
    const session = sessions[sessionId] as StoredSession | undefined;

    if (!session) {
      return Response.json({ authenticated: false }, { status: 401 });
    }

    // Check if session expired
    if (!session.expiresAt || new Date(session.expiresAt) < new Date()) {
      // Delete expired session
      delete sessions[sessionId];
      await sessionsStorage.write(sessions);
      return Response.json({ authenticated: false }, { status: 401 });
    }

    // Get user
    const users = await usersStorage.read();
    const user = Object.values(users).find((entry) => (entry as StoredUser).id === session.userId) as StoredUser | undefined;

    if (!user) {
      return Response.json({ authenticated: false }, { status: 401 });
    }

    const { password: _password, ...userWithoutPassword } = user;

    return Response.json({
      authenticated: true,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Session check error:", error);
    return Response.json({ authenticated: false }, { status: 401 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const sessionId = req.cookies.get("session")?.value;

    if (sessionId) {
      const sessions = await sessionsStorage.read();
      delete sessions[sessionId];
      await sessionsStorage.write(sessions);
    }

    const response = NextResponse.json({ message: "Signed out successfully" });
    response.cookies.delete("session");
    return response;
  } catch (error) {
    console.error("Signout error:", error);
    return Response.json(
      { error: "Failed to sign out" },
      { status: 500 }
    );
  }
}

