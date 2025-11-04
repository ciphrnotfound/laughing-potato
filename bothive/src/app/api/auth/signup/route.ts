import { NextRequest } from "next/server";
import { usersStorage } from "@/lib/storage";

// Dynamic import for bcryptjs (Next.js compatibility)
const bcrypt = require("bcryptjs");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return Response.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return Response.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const users = await usersStorage.read();

    // Check if user already exists
    if (users[email]) {
      return Response.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = {
      id: `user-${Date.now()}`,
      name,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    users[email] = user;
    await usersStorage.write(users);

    // Don't send password back
    const { password: _, ...userWithoutPassword } = user;

    return Response.json(
      { user: userWithoutPassword, message: "Account created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return Response.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}

