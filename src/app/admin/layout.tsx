import { AdminRoleGate } from "@/components/AdminRoleGate";
import { AuthCookieBootstrap } from "@/components/AuthCookieBootstrap";
import { DashboardLayout } from "@/components/DashboardLayout";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AuthCookieBootstrap />
      <AdminRoleGate>
        <DashboardLayout>{children}</DashboardLayout>
      </AdminRoleGate>
    </>
  );
}
