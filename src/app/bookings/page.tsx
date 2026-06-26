"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Search, Eye } from "lucide-react";
import {
  AdminBooking,
  fetchBookings,
} from "@/features/booking/api/booking.api";
import {
  cancelPayment,
  confirmPayment,
} from "@/features/payments/payments.api";

export default function BookingsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(
    null,
  );

  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);

      if (currentPage > 3) pages.push("ellipsis-start");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - 2) pages.push("ellipsis-end");

      pages.push(totalPages);
    }

    return pages;
  };

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchBookings(
        searchQuery,
        statusFilter,
        currentPage,
        itemsPerPage,
      );

      setBookings(response.data);
      setTotalPages(response.meta.totalPages);
      setTotalItems(response.meta.total);
    } catch {
      setError("Ошибка загрузки бронирований");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, currentPage, itemsPerPage]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
      PNR_CREATED: {
        label: "Создано",
        className: "bg-yellow-100 text-yellow-700",
      },
      PAYMENT_PENDING: {
        label: "Ожидает оплату",
        className: "bg-yellow-100 text-yellow-700",
      },
      PAID: { label: "Оплачено", className: "bg-green-100 text-green-700" },
      TICKETED: {
        label: "Билет выписан",
        className: "bg-green-100 text-green-700",
      },
      CANCELED: { label: "Отменено", className: "bg-red-100 text-red-700" },
      FAILED: { label: "Ошибка", className: "bg-red-100 text-red-700" },
      EXPIRED: { label: "Истекло", className: "bg-slate-100 text-slate-700" },
    };

    const variant = map[status] ?? {
      label: status,
      className: "bg-slate-100 text-slate-700",
    };

    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const handleConfirmPayment = async (transactionId: string) => {
    await confirmPayment(transactionId);
    await loadBookings();
    setSelectedBooking(null);
  };

  const handleCancelPayment = async (transactionId: string) => {
    await cancelPayment(transactionId);
    await loadBookings();
    setSelectedBooking(null);
  };

  const stats = {
    total: bookings.length,
    paid: bookings.filter((b) => b.status === "PAID").length,
    pending: bookings.filter((b) => b.status === "PAYMENT_PENDING").length,
    revenue: bookings
      .filter((b) => b.status === "PAID" || b.status === "TICKETED")
      .reduce((sum, b) => sum + Number(b.totalPrice), 0),
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Бронирования</h2>

        <Card>
          <CardHeader>
            <CardTitle>Список бронирований</CardTitle>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="text-center py-8">Загрузка...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">{error}</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Пользователь</TableHead>
                    <TableHead>Рейс</TableHead>
                    <TableHead>Маршрут</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead>Пассажиры</TableHead>
                    <TableHead>Сумма</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {bookings.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell>{b.id}</TableCell>

                      <TableCell>
                        {b.user.firstName} {b.user.lastName}
                      </TableCell>

                      <TableCell>{b.flight.number}</TableCell>

                      <TableCell>
                        {b.flight.from} → {b.flight.to}
                      </TableCell>

                      <TableCell>
                        {b.flight.departureDate
                          ? new Date(
                              b.flight.departureDate,
                            ).toLocaleDateString()
                          : "—"}
                      </TableCell>

                      <TableCell>{b.passengersCount}</TableCell>

                      <TableCell>
                        {Number(b.totalPrice).toLocaleString()} {b.currency}
                      </TableCell>

                      <TableCell>{getStatusBadge(b.status)}</TableCell>

                      <TableCell>
                        <Button onClick={() => setSelectedBooking(b)}>
                          <Eye size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog
          open={!!selectedBooking}
          onOpenChange={() => setSelectedBooking(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Детали бронирования</DialogTitle>
              <DialogDescription>ID: {selectedBooking?.id}</DialogDescription>
            </DialogHeader>

            {selectedBooking && (
              <div className="space-y-4">
                <div>
                  {selectedBooking.flight.from} → {selectedBooking.flight.to}
                </div>

                <div>{selectedBooking.flight.airline}</div>

                <div>{selectedBooking.passengersCount} пассажиров</div>

                {selectedBooking.status === "PAYMENT_PENDING" && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() =>
                        selectedBooking.transaction &&
                        handleConfirmPayment(selectedBooking.transaction.id)
                      }
                    >
                      Подтвердить
                    </Button>

                    <Button
                      variant="destructive"
                      onClick={() =>
                        selectedBooking.transaction &&
                        handleCancelPayment(selectedBooking.transaction.id)
                      }
                    >
                      Отменить
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
