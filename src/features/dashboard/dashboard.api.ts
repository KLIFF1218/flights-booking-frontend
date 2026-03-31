import { apiFetch } from "@/shared/api/apiClient";

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
};

export async function fetchDashboardStats(): Promise<DashboardStats> {
  return apiFetch<DashboardStats>("/admin/dashboard", {
    method: "GET",
  });
}