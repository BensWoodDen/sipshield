import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";
import { sessionOptions } from "@/lib/auth";
import type { SessionData } from "@/lib/auth";
import { verifyPassword } from "@/lib/passwords";

const failedAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

export async function POST(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 }
    );
  }

  const { email, password } = (await request.json()) as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password required" },
      { status: 400 }
    );
  }

  // Rate limiting
  const attempts = failedAttempts.get(email);
  if (
    attempts &&
    attempts.count >= MAX_ATTEMPTS &&
    Date.now() - attempts.lastAttempt < LOCKOUT_MS
  ) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429 }
    );
  }

  const { data: user, error } = await supabase
    .from("admin_users")
    .select("id, email, name, password_hash")
    .eq("email", email)
    .maybeSingle();

  if (error || !user) {
    trackFailedAttempt(email);
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 }
    );
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    trackFailedAttempt(email);
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 }
    );
  }

  // Clear failed attempts on success
  failedAttempts.delete(email);

  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions
  );
  session.userId = user.id;
  session.email = user.email;
  session.name = user.name;
  await session.save();

  return NextResponse.json({ ok: true });
}

function trackFailedAttempt(email: string) {
  const existing = failedAttempts.get(email);
  failedAttempts.set(email, {
    count: (existing?.count ?? 0) + 1,
    lastAttempt: Date.now(),
  });
}
