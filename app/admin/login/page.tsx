import { LoginForm } from "@/components/admin/login-form";
import { Shield } from "lucide-react";

export const metadata = {
  title: "Admin Login | SipShield",
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-forest-100">
            <Shield size={24} className="text-forest-600" />
          </div>
          <h1 className="font-display text-2xl text-charcoal">
            SipShield Admin
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Sign in to manage orders
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-md">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
