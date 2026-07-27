"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Calendar,
  DollarSign,
  Plane,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertTriangle,
  Clock,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import {
  fetchDashboardStats,
  rebuildEventAnalytics,
} from "@/features/dashboard/dashboard.api";
import type { DashboardStats } from "@/features/dashboard/dashboard.api";

const COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444"];

export default function HomePage() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rebuilding, setRebuilding] = useState(false);

  const loadDashboard = useCallback(async () => {
    const data = await fetchDashboardStats();
    setDashboardStats(data);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        await loadDashboard();
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [loadDashboard]);

  async function handleRebuildAnalytics() {
    setRebuilding(true);
    setError(null);

    try {
      await rebuildEventAnalytics();
      await loadDashboard();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to rebuild analytics");
    } finally {
      setRebuilding(false);
    }
  }

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (error || !dashboardStats) {
    return (
      <div className="p-6 text-red-500">
        {error || "Failed to load data"}
      </div>
    );
  }

  const maxBookings =
    dashboardStats.topRoutes.length > 0
      ? dashboardStats.topRoutes[0].bookings
      : 1;

  const getTrend = (value: number) => {
    const isPositive = value >= 0;

    return {
      icon: isPositive ? TrendingUp : TrendingDown,
      color: isPositive ? "text-green-600" : "text-red-600",
      formatted: `${isPositive ? "+" : ""}${value}%`,
    };
  };

  const usersTrend = getTrend(dashboardStats.usersGrowth);
  const bookingsTrend = getTrend(dashboardStats.bookingsGrowth);
  const revenueTrend = getTrend(dashboardStats.revenueGrowth);
  const UsersTrendIcon = usersTrend.icon;
  const BookingsTrendIcon = bookingsTrend.icon;
  const RevenueTrendIcon = revenueTrend.icon;
  const { eventAnalytics } = dashboardStats;
  const { counts } = eventAnalytics;
  const lostBookings = counts.bookingsCanceled + counts.bookingsExpired;

  const formatLastEventAt = (value: string | null) => {
    if (!value) {
      return "no events processed yet";
    }

    return new Date(value).toLocaleString();
  };

  return (
    <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Dashboard</h2>
          <p className="text-slate-500 mt-1">
            Overview of your booking service
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                Total users
              </CardTitle>
              <Users className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-slate-900">
                {dashboardStats.totalUsers.toLocaleString("en-US")}
              </div>
              <p
                className={`text-xs flex items-center gap-1 mt-1 ${usersTrend.color}`}
              >
                <UsersTrendIcon className="w-3 h-3" />
                {usersTrend.formatted} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                Total bookings
              </CardTitle>
              <Calendar className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-slate-900">
                {dashboardStats.totalBookings.toLocaleString("en-US")}
              </div>
              <p
                className={`text-xs flex items-center gap-1 mt-1 ${bookingsTrend.color}`}
              >
                <BookingsTrendIcon className="w-3 h-3" />
                {bookingsTrend.formatted} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                Total revenue
              </CardTitle>
              <DollarSign className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-slate-900">
                {dashboardStats.totalRevenue.toLocaleString('en-US')} ₽
              </div>
              <p
                className={`text-xs flex items-center gap-1 mt-1 ${revenueTrend.color}`}
              >
                <RevenueTrendIcon className="w-3 h-3" />
                {revenueTrend.formatted} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                Active flights
              </CardTitle>
              <Plane className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-slate-900">
                {dashboardStats.activeFlights}
              </div>
              {(() => {
                const delta = dashboardStats.activeFlightsDelta;
                const isPositive = delta >= 0;
                const Icon = isPositive ? TrendingUp : TrendingDown;

                return (
                  <p
                    className={`text-xs flex items-center gap-1 mt-1 ${
                      isPositive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {isPositive ? "+" : ""}
                    {delta} this week
                  </p>
                );
              })()}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Event stream analytics
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Event counts (last {eventAnalytics.periodDays} days) from Kafka
              domain events
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="gap-1.5 py-1">
              <Clock className="w-3 h-3" />
              Analytics consumer last event at{" "}
              {formatLastEventAt(eventAnalytics.health.lastEventAt)}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRebuildAnalytics}
              disabled={rebuilding}
            >
              <RefreshCw
                className={`w-4 h-4 ${rebuilding ? "animate-spin" : ""}`}
              />
              Rebuild analytics
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                Created → Paid
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-slate-900">
                {eventAnalytics.conversionRate}%
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {counts.paymentsSucceeded} / {counts.bookingsCreated} bookings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                Paid → Ticketed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-slate-900">
                {eventAnalytics.ticketRate}%
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {counts.ticketsIssued} / {counts.paymentsSucceeded} paid
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                Event revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-slate-900">
                {eventAnalytics.paymentVolume.toLocaleString("en-US")} ₽
              </div>
              <p className="text-xs text-slate-500 mt-1">from booking.paid events</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                Lost bookings (canceled + expired)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-slate-900">
                {lostBookings}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {counts.bookingsCanceled} canceled · {counts.bookingsExpired}{" "}
                expired
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                Payments failed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-slate-900">
                {counts.paymentsFailed}
              </div>
              <p className="text-xs text-slate-500 mt-1">payment.failed events</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                Ticketing failed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
                {counts.ticketingFailed}
                {counts.ticketingFailed > 0 && (
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                booking.ticketing.failed events
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                Flights delayed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-slate-900">
                {counts.flightsDelayed}
              </div>
              <p className="text-xs text-slate-500 mt-1">flight.delayed events</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                Flights cancelled
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-slate-900">
                {counts.flightsCancelled}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                flight.cancelled events
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              Daily event counts ({eventAnalytics.periodDays}d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {eventAnalytics.dailyActivity.length === 0 ? (
              <p className="text-sm text-slate-500 py-8 text-center">
                No domain events yet. Create a booking to populate analytics.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={eventAnalytics.dailyActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="bookingsCreated"
                    name="Created"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="paymentsSucceeded"
                    name="Paid"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="ticketsIssued"
                    name="Ticketed"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by month</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dashboardStats.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) =>
                      `${(Number(value ?? 0) / 1000000).toFixed(1)} M ₽`
                    }
                  />
                  <Bar dataKey="revenue" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Booking status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dashboardStats.bookingsByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dashboardStats.bookingsByStatus.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Popular routes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardStats.topRoutes.map((route, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-900">
                      {route.route}
                    </div>
                    <div className="text-sm text-slate-500">
                      {route.bookings} bookings
                    </div>
                  </div>
                  <div className="w-48 bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${(route.bookings / maxBookings) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
  );
}
