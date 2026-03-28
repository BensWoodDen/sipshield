import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions } from "@/lib/auth";
import type { SessionData } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/admin-header";

export const metadata = {
  title: "Admin | SipShield",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      {session.userId && <AdminHeader name={session.name} />}
      {children}
    </div>
  );
}
