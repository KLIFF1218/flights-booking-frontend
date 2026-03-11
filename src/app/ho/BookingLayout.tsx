"use client";

type BookingLayoutProps = {
  children: React.ReactNode;
  sidebar: React.ReactNode;
};

export function BookingLayout({ children, sidebar }: BookingLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <div className="flex-1 min-w-0 order-2 lg:order-1">
            {children}
          </div>

          <div className="w-full lg:w-80 xl:w-96 order-1 lg:order-2 shrink-0">
            {sidebar}
          </div>
        </div>
      </div>
    </div>
  );
}
