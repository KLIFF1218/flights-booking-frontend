import { Suspense } from "react";
import { ResetPasswordClient } from "./ResetPassword.client";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading…</div>}>
      <ResetPasswordClient />
    </Suspense>
  );
}
