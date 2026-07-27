import { Suspense } from "react";
import { VerifyEmailClient } from "./VerifyEmail.client";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading…</div>}>
      <VerifyEmailClient />
    </Suspense>
  );
}
