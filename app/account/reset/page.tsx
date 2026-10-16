import { Suspense } from "react";
import ResetPassword from "@/components/reset-password";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-slate-950" />}>
      <ResetPassword />
    </Suspense>
  );
}
