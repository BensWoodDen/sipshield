import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

/* ── Rate limiting ── */
const rateMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 3;
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  );
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();

  // Clean up expired entries
  for (const [key, entry] of rateMap) {
    if (entry.resetAt <= now) rateMap.delete(key);
  }

  const entry = rateMap.get(ip);
  if (!entry || entry.resetAt <= now) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return false;
  }

  if (entry.count >= RATE_LIMIT) return true;

  entry.count++;
  return false;
}

/* ── Validation ── */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ContactBody {
  name?: string;
  email?: string;
  message?: string;
  website?: string;
}

export async function POST(request: NextRequest) {
  let body: ContactBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }

  const { name, email, message, website } = body;

  // Honeypot: bots fill the hidden "website" field — silently succeed
  if (website) {
    return NextResponse.json({ success: true });
  }

  // Validate required fields
  if (
    !name?.trim() ||
    !email?.trim() ||
    !message?.trim() ||
    !EMAIL_RE.test(email.trim())
  ) {
    return NextResponse.json(
      { error: "Please fill in all fields with a valid email address." },
      { status: 400 }
    );
  }

  // Rate limit
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many messages. Please try again later." },
      { status: 429 }
    );
  }

  // Send email
  if (!resend) {
    console.error("RESEND_API_KEY is not configured");
    return NextResponse.json(
      {
        error:
          "Something went wrong. Please try emailing ben@sipshield.co.uk directly.",
      },
      { status: 500 }
    );
  }

  try {
    await resend.emails.send({
      from: "SipShield <noreply@sipshield.co.uk>",
      to: "ben@sipshield.co.uk",
      replyTo: email.trim(),
      subject: `New enquiry from ${name.trim()}`,
      text: `Name: ${name.trim()}\nEmail: ${email.trim()}\n\n${message.trim()}`,
    });
  } catch (err) {
    console.error("Resend error:", err);
    return NextResponse.json(
      {
        error:
          "Something went wrong. Please try emailing ben@sipshield.co.uk directly.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
