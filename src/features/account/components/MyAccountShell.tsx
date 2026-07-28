"use client";

import { ProfileSidebar } from "@/components/Orders/ProfileSidebar";
import { useRequireAuth } from "@/features/auth/hooks/useRequireAuth";
import { EmailVerificationBanner } from "@/features/account/components/EmailVerificationBanner";

export function MyAccountShell({ children }: { children: React.ReactNode }) {
  const { isChecking, isReady } = useRequireAuth();

  if (isChecking || !isReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-600 text-sm">Loading account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          <ProfileSidebar />
          <div className="flex-1 min-w-0">
            <EmailVerificationBanner />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
