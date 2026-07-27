import { apiFetch } from "@/shared/api/apiClient";

export type EventAnalyticsDailyRow = {
  date: string;
  bookingsCreated: number;
  paymentsSucceeded: number;
  paymentsFailed: number;
  bookingsCanceled: number;
  bookingsExpired: number;
  ticketsIssued: number;
  ticketingFailed: number;
  flightsDelayed: number;
  flightsCancelled: number;
  paymentVolume: number;
};

export type DashboardStats = {
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;

  usersGrowth: number;
  bookingsGrowth: number;
  revenueGrowth: number;

  activeFlights: number;
  activeFlightsDelta: number;

  monthlyRevenue: {
    month: string;
    revenue: number;
  }[];

  bookingsByStatus: {
    name: string;
    value: number;
  }[];

  topRoutes: {
    route: string;
    bookings: number;
  }[];

  eventAnalytics: {
    periodDays: number;
    health: {
      lastEventAt: string | null;
      processedEventCount: number;
    };
    counts: {
      bookingsCreated: number;
      paymentsSucceeded: number;
      paymentsFailed: number;
      bookingsCanceled: number;
      bookingsExpired: number;
      ticketsIssued: number;
      ticketingFailed: number;
      flightsDelayed: number;
      flightsCancelled: number;
    };
    conversionRate: number;
    ticketRate: number;
    paymentVolume: number;
    dailyActivity: EventAnalyticsDailyRow[];
  };
};

export async function fetchDashboardStats(): Promise<DashboardStats> {
  return apiFetch<DashboardStats>("/admin/dashboard", {
    method: "GET",
  });
}

export async function rebuildEventAnalytics(): Promise<{
  processed: number;
  applied: number;
}> {
  return apiFetch<{ processed: number; applied: number }>(
    "/admin/dashboard/analytics/rebuild",
    {
      method: "POST",
    },
  );
}
