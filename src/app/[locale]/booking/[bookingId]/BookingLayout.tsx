"use client";

type BookingLayoutProps = {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  /** When true, sidebar scrolls independently and does not stick over page content. */
  scrollableSidebar?: boolean;
};

export default function BookingLayout({
  children,
  sidebar,
  scrollableSidebar = false,
}: BookingLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 mt-6 lg:mt-14">
          <div className="flex-1 min-w-0">{children}</div>

          <div className="w-full lg:w-80 xl:w-96 shrink-0">
            {scrollableSidebar ? (
              <div className="lg:max-h-[calc(100dvh-5.5rem)] lg:overflow-y-auto lg:overscroll-contain lg:pr-1 space-y-4">
                {sidebar}
              </div>
            ) : (
              <div className="lg:sticky lg:top-6 lg:self-start">{sidebar}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}