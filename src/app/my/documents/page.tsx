import { ProfileSidebar } from "@/components/Orders/ProfileSidebar";
import { DocumentsPage } from "@/components/DocumentsPage";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          <ProfileSidebar />
          <DocumentsPage />
        </div>
      </div>
    </div>
  );
}