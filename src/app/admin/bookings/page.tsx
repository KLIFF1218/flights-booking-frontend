"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Eye, Search } from "lucide-react";
import {
  AdminBooking,
  BookingDomainEvent,
  fetchBookingEvents,
  fetchBookings,
} from "@/features/booking/api/booking.api";
import {
  cancelPayment,
  confirmPayment,
} from "@/features/payments/api/payments.api";

const BOOKING_STATUSES = [
  { value: "all", label: "All statuses" },
  { value: "PNR_CREATED", label: "Created" },
  { value: "PAYMENT_PENDING", label: "Awaiting payment" },
  { value: "PAID", label: "Paid" },
  { value: "TICKETED", label: "Ticketed" },
  { value: "CANCELED", label: "Canceled" },
  { value: "FAILED", label: "Error" },
  { value: "EXPIRED", label: "Expired" },
] as const;

const EVENT_LABELS: Record<string, string> = {
  "booking.created": "Booking created",
  "booking.paid": "Payment received",
  "booking.canceled": "Booking canceled",
  "ticket.issued": "Ticket issued",
  "payment.failed": "Payment failed",
  "flight.delayed": "Flight delayed",
  "flight.cancelled": "Flight cancelled",
};

function formatEventSummary(event: BookingDomainEvent): string {
  const { payload } = event;

  if (event.eventType === "ticket.issued" && typeof payload.ticketNumber === "string") {
    return `Ticket ${payload.ticketNumber}`;
  }

  if (event.eventType === "payment.failed" && typeof payload.reason === "string") {
    return payload.reason.replaceAll("_", " ");
  }

  if (typeof payload.pnr === "string") {
    return `PNR ${payload.pnr}`;
  }

  return event.aggregateType;
}

export default function BookingsPage() {
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(
    null,
  );
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [bookingEvents, setBookingEvents] = useState<BookingDomainEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchQuery(searchInput);
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchInput]);

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
      setError("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, currentPage, itemsPerPage]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  useEffect(() => {
    if (!selectedBooking) {
      setBookingEvents([]);
      setEventsError(null);
      return;
    }

    let cancelled = false;

    const loadEvents = async () => {
      try {
        setEventsLoading(true);
        setEventsError(null);
        const response = await fetchBookingEvents(selectedBooking.id);
        if (!cancelled) {
          setBookingEvents(response.data);
        }
      } catch {
        if (!cancelled) {
          setEventsError("Failed to load event timeline");
          setBookingEvents([]);
        }
      } finally {
        if (!cancelled) {
          setEventsLoading(false);
        }
      }
    };

    void loadEvents();

    return () => {
      cancelled = true;
    };
  }, [selectedBooking]);

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
      PNR_CREATED: {
        label: "Created",
        className: "bg-yellow-100 text-yellow-700",
      },
      PAYMENT_PENDING: {
        label: "Awaiting payment",
        className: "bg-yellow-100 text-yellow-700",
      },
      PAID: { label: "Paid", className: "bg-green-100 text-green-700" },
      TICKETED: {
        label: "Ticketed",
        className: "bg-green-100 text-green-700",
      },
      CANCELED: { label: "Canceled", className: "bg-red-100 text-red-700" },
      FAILED: { label: "Error", className: "bg-red-100 text-red-700" },
      EXPIRED: { label: "Expired", className: "bg-slate-100 text-slate-700" },
    };

    const variant = map[status] ?? {
      label: status,
      className: "bg-slate-100 text-slate-700",
    };

    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const handleConfirmPayment = async (transactionId: string) => {
    try {
      setActionError(null);
      await confirmPayment(transactionId);
      await loadBookings();
      setSelectedBooking(null);
    } catch {
      setActionError("Failed to confirm payment");
    }
  };

  const handleCancelPayment = async (transactionId: string) => {
    try {
      setActionError(null);
      await cancelPayment(transactionId);
      await loadBookings();
      setSelectedBooking(null);
    } catch {
      setActionError("Failed to cancel payment");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Bookings</h2>
        <p className="text-slate-500 mt-1">Manage bookings and payments</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by ID, PNR, or user name..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-full lg:w-56">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {BOOKING_STATUSES.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={String(itemsPerPage)}
          onValueChange={(value) => {
            setItemsPerPage(Number(value));
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-full lg:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 per page</SelectItem>
            <SelectItem value="20">20 per page</SelectItem>
            <SelectItem value="50">50 per page</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bookings list ({totalItems})</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">{error}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Flight</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Passengers</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>

              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-mono text-xs">
                      {booking.id.slice(0, 8)}...
                    </TableCell>

                    <TableCell>
                      {booking.user.firstName} {booking.user.lastName}
                    </TableCell>

                    <TableCell>{booking.flight.number}</TableCell>

                    <TableCell>
                      {booking.flight.from} → {booking.flight.to}
                    </TableCell>

                    <TableCell>
                      {booking.flight.departureDate
                        ? new Date(booking.flight.departureDate).toLocaleDateString(
                            "en-US",
                          )
                        : "—"}
                    </TableCell>

                    <TableCell>{booking.passengersCount}</TableCell>

                    <TableCell>
                      {Number(booking.totalPrice).toLocaleString("en-US")}{" "}
                      {booking.currency}
                    </TableCell>

                    <TableCell>{getStatusBadge(booking.status)}</TableCell>

                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedBooking(booking)}
                      >
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

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationPrevious
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
            />
            {Array.from({ length: totalPages }, (_, index) => index + 1)
              .slice(Math.max(0, currentPage - 3), currentPage + 2)
              .map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => setCurrentPage(page)}
                    active={currentPage === page}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
            <PaginationNext
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              disabled={currentPage === totalPages}
            />
          </PaginationContent>
        </Pagination>
      )}

      <Dialog
        open={!!selectedBooking}
        onOpenChange={() => {
          setSelectedBooking(null);
          setActionError(null);
          setEventsError(null);
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Booking details</DialogTitle>
            <DialogDescription>ID: {selectedBooking?.id}</DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500">Route</p>
                <p>
                  {selectedBooking.flight.from} → {selectedBooking.flight.to}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Flight</p>
                <p>
                  {selectedBooking.flight.number} · {selectedBooking.flight.airline}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Passengers</p>
                <p>{selectedBooking.passengersCount}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Amount</p>
                <p>
                  {Number(selectedBooking.totalPrice).toLocaleString("en-US")}{" "}
                  {selectedBooking.currency}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700">Event timeline</p>
                {eventsLoading ? (
                  <p className="text-sm text-slate-500 mt-2">Loading events...</p>
                ) : eventsError ? (
                  <p className="text-sm text-red-600 mt-2">{eventsError}</p>
                ) : bookingEvents.length === 0 ? (
                  <p className="text-sm text-slate-500 mt-2">No events yet</p>
                ) : (
                  <ol className="mt-3 space-y-3 border-l border-slate-200 pl-4">
                    {bookingEvents.map((event) => (
                      <li key={event.id} className="relative">
                        <span className="absolute -left-[1.3rem] top-1.5 h-2 w-2 rounded-full bg-slate-400" />
                        <p className="text-sm font-medium">
                          {EVENT_LABELS[event.eventType] ?? event.eventType}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(event.occurredAt).toLocaleString("en-US")}
                        </p>
                        <p className="text-xs text-slate-600">{formatEventSummary(event)}</p>
                      </li>
                    ))}
                  </ol>
                )}
              </div>

              {actionError && (
                <p className="text-sm text-red-600">{actionError}</p>
              )}

              {selectedBooking.status === "PAYMENT_PENDING" &&
                selectedBooking.transaction && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() =>
                        handleConfirmPayment(selectedBooking.transaction!.id)
                      }
                    >
                      Confirm payment
                    </Button>

                    <Button
                      variant="destructive"
                      onClick={() =>
                        handleCancelPayment(selectedBooking.transaction!.id)
                      }
                    >
                      Cancel
                    </Button>
                  </div>
                )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
