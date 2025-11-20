import { NextRequest, NextResponse } from "next/server";
import { usersStorage, sessionsStorage } from "@/lib/storage";
import { randomBytes } from "crypto";

// Dynamic import for bcryptjs (Next.js compatibility)
const bcrypt = require("bcryptjs");

// Local type to describe stored user records
type StoredUser = {
  id: string;
  email: string;
  password: string; // hashed
  [key: string]: unknown;
};

type UsersByEmail = Record<string, StoredUser>;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body as { email?: string; password?: string };

    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const users = (await usersStorage.read()) as UsersByEmail;
    const user = users[email];

    if (!user || typeof user.password !== "string") {
      return Response.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return Response.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Create session
    const sessionId = randomBytes(32).toString("hex");
    const sessions = (await sessionsStorage.read()) as Record<string, any>;
    sessions[sessionId] = {
      userId: user.id,
      email: user.email,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    };
    await sessionsStorage.write(sessions);

    // Don't send password back
    const { password: _pw, ...userWithoutPassword } = user;

    // Set cookie
    const response = NextResponse.json({
      user: userWithoutPassword,
      sessionId,
      message: "Signed in successfully",
    });

    response.cookies.set("session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Signin error:", error);
    return Response.json(
      { error: "Failed to sign in" },
      { status: 500 }
    );
  }
}

