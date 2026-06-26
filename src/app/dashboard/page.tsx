"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Calendar,
  DollarSign,
  Plane,
  TrendingUp,
  TrendingDown,
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
} from "recharts";
import { fetchDashboardStats } from "@/features/dashboard/dashboard.api";
import type { DashboardStats } from "@/features/dashboard/dashboard.api";

const COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444"];

export default function HomePage() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchDashboardStats();
        setDashboardStats(data);
      } catch (e: any) {
        setError(e.message || "Ошибка загрузки");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">Загрузка...</div>
      </DashboardLayout>
    );
  }

  if (error || !dashboardStats) {
    return (
      <DashboardLayout>
        <div className="p-6 text-red-500">
          {error || "Не удалось загрузить данные"}
        </div>
      </DashboardLayout>
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Dashboard</h2>
          <p className="text-slate-500 mt-1">
            Общая статистика вашего сервиса бронирования
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                Всего пользователей
              </CardTitle>
              <Users className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-slate-900">
                {dashboardStats.totalUsers.toLocaleString("ru-RU")}
              </div>
              {(() => {
                const trend = getTrend(dashboardStats.usersGrowth);
                const Icon = trend.icon;

                return (
                  <p
                    className={`text-xs flex items-center gap-1 mt-1 ${trend.color}`}
                  >
                    <Icon className="w-3 h-3" />
                    {trend.formatted} за месяц
                  </p>
                );
              })()}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                Всего бронирований
              </CardTitle>
              <Calendar className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-slate-900">
                {dashboardStats.totalBookings.toLocaleString("ru-RU")}
              </div>
              {(() => {
                const trend = getTrend(dashboardStats.bookingsGrowth);
                const Icon = trend.icon;

                return (
                  <p
                    className={`text-xs flex items-center gap-1 mt-1 ${trend.color}`}
                  >
                    <Icon className="w-3 h-3" />
                    {trend.formatted} за месяц
                  </p>
                );
              })()}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                Общая выручка
              </CardTitle>
              <DollarSign className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-slate-900">
                {dashboardStats.totalRevenue.toLocaleString('ru-RU')} ₽
              </div>
              {(() => {
                const trend = getTrend(dashboardStats.revenueGrowth);
                const Icon = trend.icon;

                return (
                  <p
                    className={`text-xs flex items-center gap-1 mt-1 ${trend.color}`}
                  >
                    <Icon className="w-3 h-3" />
                    {trend.formatted} за месяц
                  </p>
                );
              })()}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                Активные рейсы
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
                    {delta} за неделю
                  </p>
                );
              })()}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Выручка по месяцам</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dashboardStats.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) =>
                      `${(value / 1000000).toFixed(1)} млн ₽`
                    }
                  />
                  <Bar dataKey="revenue" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Статус бронирований</CardTitle>
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
                      `${name}: ${(percent * 100).toFixed(0)}%`
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
            <CardTitle>Популярные маршруты</CardTitle>
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
                      {route.bookings} бронирований
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
    </DashboardLayout>
  );
}
