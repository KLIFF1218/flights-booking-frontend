"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  fetchAdminFlights,
  formatFlightPrice,
  updateAdminFlightStatus,
  type AdminFlightInstance,
  type AdminFlightStatus,
  type AdminFlightsStats,
} from "@/features/flights/api/admin-flights.api";
import {
  Plus,
  Eye,
  Plane,
  Clock,
  XCircle,
  CheckCircle,
  Search,
} from "lucide-react";

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
} from "@/components/ui/pagination";

type FlightStatus = AdminFlightStatus;

interface Flight {
  id: string;
  flightNumber: string;
  airline: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  departureTimezone: string;
  arrivalTimezone: string;
  departureLocalDate: string;
  duration: string;
  price: number;
  currency: string;
  totalSeats: number;
  availableSeats: number;
  bookingsCount: number;
  status: FlightStatus;
  delayMinutes: number;
}

const ITEMS_PER_PAGE = 20;
const EMPTY_STATS: AdminFlightsStats = {
  total: 0,
  onTime: 0,
  delayed: 0,
  completed: 0,
  cancelled: 0,
  occupancy: 0,
};

const mapStatusFromBackend = (status: string): FlightStatus => {
  switch (status) {
    case "SCHEDULED":
      return "on-time";
    case "DELAYED":
      return "delayed";
    case "CANCELLED":
      return "cancelled";
    case "COMPLETED":
      return "completed";
    default:
      return "on-time";
  }
};

const mapApiFlight = (f: AdminFlightInstance): Flight => ({
  id: f.id,
  flightNumber: f.flightNumber ?? "—",
  airline: f.airline ?? "—",
  from: f.from ?? "—",
  to: f.to ?? "—",
  departure: f.departureDate ? new Date(f.departureDate).toISOString() : "",
  arrival: f.arrivalDate ? new Date(f.arrivalDate).toISOString() : "",
  departureTimezone: f.departureTimezone ?? "UTC",
  arrivalTimezone: f.arrivalTimezone ?? "UTC",
  departureLocalDate: f.departureLocalDate ?? "",
  duration:
    f.durationMinutes && f.durationMinutes > 0
      ? `${f.durationMinutes} min`
      : "—",
  price: Number(f.price ?? 0),
  currency: f.currency ?? "RUB",
  totalSeats: f.totalSeats ?? 0,
  availableSeats: f.availableSeats ?? 0,
  bookingsCount: f.bookingsCount ?? 0,
  status: mapStatusFromBackend(f.status),
  delayMinutes: f.delayMinutes ?? 0,
});

const formatAirportDateTime = (
  value: string,
  timeZone: string,
  airportCode: string,
) => {
  if (!value) return "—";

  const formatted = new Intl.DateTimeFormat("en-US", {
    timeZone,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

  return `${formatted} (${airportCode})`;
};

const formatLocalDate = (value: string) => {
  if (!value) return "—";
  const [year, month, day] = value.split("-");
  return `${day}.${month}.${year}`;
};

export default function FlightsPage() {
  const router = useRouter();

  const [delayMinutes, setDelayMinutes] = useState<number>(15);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [stats, setStats] = useState<AdminFlightsStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FlightStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchQuery(searchInput.trim());
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  const loadFlights = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchAdminFlights({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        status: statusFilter,
        search: searchQuery,
      });

      setFlights(response.data.map(mapApiFlight));
      setStats(response.stats);
      setTotalPages(response.meta.totalPages);
      setTotalCount(response.meta.total);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, searchQuery]);

  useEffect(() => {
    loadFlights();
  }, [loadFlights]);

  const getStatusBadge = (status: FlightStatus, delayMinutes = 0) => {
    const variants = {
      "on-time": {
        label: "On time",
        className: "bg-green-100 text-green-700",
        icon: CheckCircle,
      },
      delayed: {
        label: delayMinutes > 0 ? `Delayed +${delayMinutes} min` : "Delayed",
        className: "bg-yellow-100 text-yellow-700",
        icon: Clock,
      },
      cancelled: {
        label: "Canceled",
        className: "bg-red-100 text-red-700",
        icon: XCircle,
      },
      completed: {
        label: "Completed",
        className: "bg-blue-100 text-blue-700",
        icon: Plane,
      },
    };

    const variant = variants[status] ?? variants["on-time"];
    const Icon = variant.icon;

    return (
      <Badge className={`${variant.className} flex items-center gap-1 w-fit`}>
        <Icon className="w-3 h-3" />
        {variant.label}
      </Badge>
    );
  };

  const updateFlightStatus = async (
    flightId: string,
    newStatus: FlightStatus,
    delay?: number,
  ) => {
    try {
      setActionError(null);

      const updated = await updateAdminFlightStatus(flightId, {
        status: newStatus,
        ...(newStatus === "delayed" ? { delayMinutes: delay } : {}),
      });

      const mapped = mapApiFlight(updated);

      setFlights((prev) =>
        prev.map((flight) => (flight.id === flightId ? mapped : flight)),
      );
      setSelectedFlight(mapped);
      await loadFlights();
    } catch (e) {
      console.error(e);
      setActionError("Failed to update flight status");
    }
  };

  const canManageStatus = (status: FlightStatus) =>
    status === "on-time" || status === "delayed";

  if (loading && flights.length === 0) {
    return <div className="p-6">Loading flights...</div>;
  }

  if (error && flights.length === 0) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Flights</h2>
          <p className="text-slate-500">
            Next 7 days and completed in the last 30 days
          </p>
        </div>

        <Button onClick={() => router.push("/admin/flights/create")}>
          <Plus className="w-4 h-4 mr-2" />
          Create flight
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-semibold">{stats.total}</div>
            <p className="text-sm text-slate-500">In view window</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-semibold text-green-600">
              {stats.onTime}
            </div>
            <p className="text-sm text-slate-500">On time</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-semibold text-yellow-600">
              {stats.delayed}
            </div>
            <p className="text-sm text-slate-500">Delayed</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-semibold">{stats.occupancy}%</div>
            <p className="text-sm text-slate-500">Average occupancy</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by number, route, airline..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value as FlightStatus | "all");
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="on-time">On time</SelectItem>
            <SelectItem value="delayed">Delayed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Canceled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Flights list
            {totalCount > 0 && (
              <span className="ml-2 text-sm font-normal text-slate-500">
                ({totalCount})
              </span>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-slate-500">Refreshing...</div>
          ) : flights.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              No flights found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Number</TableHead>
                  <TableHead>Airline</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Date (local)</TableHead>
                  <TableHead>Departure</TableHead>
                  <TableHead>Arrival</TableHead>
                  <TableHead>Bookings</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Seats</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>

              <TableBody>
                {flights.map((flight) => (
                  <TableRow key={flight.id}>
                    <TableCell className="font-medium">
                      {flight.flightNumber}
                    </TableCell>

                    <TableCell>{flight.airline}</TableCell>

                    <TableCell>
                      {flight.from} → {flight.to}
                    </TableCell>

                    <TableCell>
                      {formatLocalDate(flight.departureLocalDate)}
                    </TableCell>

                    <TableCell>
                      <div>
                        {formatAirportDateTime(
                          flight.departure,
                          flight.departureTimezone,
                          flight.from,
                        )}
                      </div>
                      {flight.delayMinutes > 0 && (
                        <div className="text-xs text-yellow-600">
                          +{flight.delayMinutes} min
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      {formatAirportDateTime(
                        flight.arrival,
                        flight.arrivalTimezone,
                        flight.to,
                      )}
                    </TableCell>

                    <TableCell>
                      {flight.bookingsCount > 0 ? (
                        <Badge className="bg-blue-100 text-blue-700">
                          {flight.bookingsCount}
                        </Badge>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </TableCell>

                    <TableCell>{flight.duration}</TableCell>

                    <TableCell className="text-right">
                      {formatFlightPrice(flight.price, flight.currency)}
                    </TableCell>

                    <TableCell className="text-right">
                      {flight.availableSeats} / {flight.totalSeats}
                    </TableCell>

                    <TableCell>
                      {getStatusBadge(flight.status, flight.delayMinutes)}
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedFlight(flight)}
                      >
                        <Eye className="w-4 h-4" />
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
            <PaginationItem>
              <PaginationLink active>
                {currentPage} / {totalPages}
              </PaginationLink>
            </PaginationItem>
            <PaginationNext
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              disabled={currentPage >= totalPages}
            />
          </PaginationContent>
        </Pagination>
      )}

      <Dialog
        open={!!selectedFlight}
        onOpenChange={() => {
          setSelectedFlight(null);
          setActionError(null);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Flight details</DialogTitle>
            <DialogDescription>
              Flight {selectedFlight?.flightNumber} • {selectedFlight?.airline}
            </DialogDescription>
          </DialogHeader>

          {selectedFlight && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-500">
                    Flight number
                  </label>
                  <p className="mt-1">{selectedFlight.flightNumber}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-500">
                    Airline
                  </label>
                  <p className="mt-1">{selectedFlight.airline}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-500">
                    From
                  </label>
                  <p className="mt-1">{selectedFlight.from}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-500">
                    To
                  </label>
                  <p className="mt-1">{selectedFlight.to}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-500">
                    Departure date (local)
                  </label>
                  <p className="mt-1">
                    {formatLocalDate(selectedFlight.departureLocalDate)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-500">
                    Bookings
                  </label>
                  <p className="mt-1">{selectedFlight.bookingsCount}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-500">
                    Departure time
                  </label>
                  <p className="mt-1">
                    {formatAirportDateTime(
                      selectedFlight.departure,
                      selectedFlight.departureTimezone,
                      selectedFlight.from,
                    )}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-500">
                    Arrival time
                  </label>
                  <p className="mt-1">
                    {formatAirportDateTime(
                      selectedFlight.arrival,
                      selectedFlight.arrivalTimezone,
                      selectedFlight.to,
                    )}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-500">
                    Flight duration
                  </label>
                  <p className="mt-1">{selectedFlight.duration}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-500">
                    Ticket price
                  </label>
                  <p className="mt-1">
                    {formatFlightPrice(
                      selectedFlight.price,
                      selectedFlight.currency,
                    )}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-500">
                    Available seats
                  </label>
                  <p className="mt-1">
                    {selectedFlight.availableSeats} of{" "}
                    {selectedFlight.totalSeats}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-500">
                    Occupancy
                  </label>
                  <p className="mt-1">
                    {selectedFlight.totalSeats
                      ? Math.round(
                          ((selectedFlight.totalSeats -
                            selectedFlight.availableSeats) /
                            selectedFlight.totalSeats) *
                            100,
                        )
                      : 0}
                    %
                  </p>
                </div>

                {selectedFlight.delayMinutes > 0 && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-slate-500">
                      Total delay
                    </label>
                    <p className="mt-1 text-yellow-600 font-medium">
                      {selectedFlight.delayMinutes} min
                    </p>
                  </div>
                )}

                <div className="col-span-2">
                  <label className="text-sm font-medium text-slate-500">
                    Current status
                  </label>
                  <div className="mt-1">
                    {getStatusBadge(
                      selectedFlight.status,
                      selectedFlight.delayMinutes,
                    )}
                  </div>
                </div>
              </div>

              {canManageStatus(selectedFlight.status) && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-500">
                    {selectedFlight.status === "delayed"
                      ? "Add delay (minutes)"
                      : "Delay (minutes)"}
                  </label>
                  <Input
                    type="number"
                    value={delayMinutes}
                    min={1}
                    onChange={(e) => setDelayMinutes(Number(e.target.value))}
                  />
                </div>
              )}

              {actionError && (
                <p className="text-sm text-red-600">{actionError}</p>
              )}

              <div className="flex flex-wrap gap-3 pt-4 border-t">
                {canManageStatus(selectedFlight.status) && (
                  <>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() =>
                        updateFlightStatus(
                          selectedFlight.id,
                          "delayed",
                          delayMinutes,
                        )
                      }
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      {selectedFlight.status === "delayed"
                        ? "Add delay"
                        : "Delay"}
                    </Button>

                    <Button
                      className="flex-1"
                      onClick={() =>
                        updateFlightStatus(selectedFlight.id, "completed")
                      }
                    >
                      <Plane className="w-4 h-4 mr-2" />
                      Complete
                    </Button>
                  </>
                )}

                {selectedFlight.status === "delayed" && (
                  <>
                    <Button
                      className="flex-1"
                      onClick={() =>
                        updateFlightStatus(selectedFlight.id, "on-time")
                      }
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      On time
                    </Button>

                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() =>
                        updateFlightStatus(selectedFlight.id, "cancelled")
                      }
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                )}

                <Button
                  variant="outline"
                  onClick={() => setSelectedFlight(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
