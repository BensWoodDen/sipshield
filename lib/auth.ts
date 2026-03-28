import type { SessionOptions } from "iron-session";

export interface SessionData {
  userId: string;
  email: string;
  name: string;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET ?? "fallback-secret-do-not-use-in-prod",
  cookieName: "sipshield-admin",
  ttl: 60 * 60 * 24 * 7, // 7 days
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  },
};
