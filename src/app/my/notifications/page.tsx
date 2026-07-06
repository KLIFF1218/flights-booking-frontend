import { ProfileSidebar } from "@/components/Orders/ProfileSidebar";
import { NotificationSettings } from "@/components/NotificationSettings";

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          <ProfileSidebar />
          <NotificationSettings />
        </div>
      </div>
    </div>
  );
}