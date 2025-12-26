import { LoginBranding } from "@/components/features/auth/LoginBranding";
import { LoginForm } from "@/components/features/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      {/* BAGIAN KIRI: Branding (Desktop Only) */}
      <LoginBranding />

      {/* BAGIAN KANAN / MOBILE: Form Login Container */}
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-slate-950 p-6 sm:p-12">
        <LoginForm />
      </div>
    </div>
  );
}