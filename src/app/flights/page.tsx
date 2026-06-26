"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { apiFetch } from "@/shared/api/apiClient";
import { useRouter } from "next/navigation";
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


type FlightStatus = "on-time" | "delayed" | "cancelled" | "completed";

interface Flight {
  id: string;
  flightNumber: string;
  airline: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  duration: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  status: FlightStatus;
  delayMinutes?: number;
}


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


export default function FlightsPage() {
  const router = useRouter();

  const [delayMinutes, setDelayMinutes] = useState<number>(15);

  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);


  useEffect(() => {
    async function loadFlights() {
      try {
        const data = await apiFetch<any[]>("/admin-flights?page=1");

        const mapped: Flight[] = data.map((f) => ({
          id: f.id,
          flightNumber: f.flightNumber ?? "—",
          airline: f.airline ?? "—",
          from: f.from ?? "—",
          to: f.to ?? "—",

          departure: f.departureDate
            ? new Date(f.departureDate).toISOString()
            : "",

          arrival: f.arrivalDate ? new Date(f.arrivalDate).toISOString() : "",

          duration:
            f.durationMinutes && f.durationMinutes > 0
              ? `${f.durationMinutes} мин`
              : "—",

          price: Number(f.price ?? 0),
          totalSeats: f.totalSeats ?? 0,
          availableSeats: f.availableSeats ?? 0,

          status: mapStatusFromBackend(f.status),
          delayMinutes: f.delayMinutes ?? 0,
        }));

        setFlights(mapped);
      } catch (e: any) {
        setError(e.message || "Ошибка загрузки");
      } finally {
        setLoading(false);
      }
    }

    loadFlights();
  }, []);


  const filteredFlights = flights.filter((flight) => {
    const q = searchQuery.toLowerCase();

    const matchesSearch =
      flight.flightNumber.toLowerCase().includes(q) ||
      flight.from.toLowerCase().includes(q) ||
      flight.to.toLowerCase().includes(q) ||
      flight.airline.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === "all" || flight.status === statusFilter;

    return matchesSearch && matchesStatus;
  });


  const getStatusBadge = (status: FlightStatus) => {
    const variants = {
      "on-time": {
        label: "Вовремя",
        className: "bg-green-100 text-green-700",
        icon: CheckCircle,
      },
      delayed: {
        label: "Задержан",
        className: "bg-yellow-100 text-yellow-700",
        icon: Clock,
      },
      cancelled: {
        label: "Отменён",
        className: "bg-red-100 text-red-700",
        icon: XCircle,
      },
      completed: {
        label: "Завершён",
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
    delayMinutes?: number,
  ) => {
    try {
      const body: any = { status: newStatus };

      if (newStatus === "delayed") {
        body.delayMinutes = delayMinutes;
      }

      const updated = await apiFetch<any>(`/flights/${flightId}/status`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });

      setFlights((prev) =>
        prev.map((f) =>
          f.id === flightId
            ? {
                ...f,
                status: mapStatusFromBackend(updated.status),
                delayMinutes: updated.delayMinutes ?? 0,
                departure: updated.departureDate,
              }
            : f,
        ),
      );

      setSelectedFlight(null);
    } catch (e) {
      console.error(e);
    }
  };


  const stats = {
    total: flights.length,
    onTime: flights.filter((f) => f.status === "on-time").length,
    delayed: flights.filter((f) => f.status === "delayed").length,
    occupancy: flights.length
      ? Math.round(
          (flights.reduce(
            (sum, f) => sum + (f.totalSeats - f.availableSeats),
            0,
          ) /
            flights.reduce((sum, f) => sum + f.totalSeats, 0)) *
            100,
        )
      : 0,
  };


  if (loading)
    return (
      <DashboardLayout>
        <div className="p-6">Загрузка рейсов...</div>
      </DashboardLayout>
    );

  if (error)
    return (
      <DashboardLayout>
        <div className="p-6 text-red-500">{error}</div>
      </DashboardLayout>
    );


  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Рейсы</h2>
            <p className="text-slate-500">Управление авиарейсами</p>
          </div>

          <Button onClick={() => router.push("/flights/create")}>
            <Plus className="w-4 h-4 mr-2" />
            Создать рейс
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-semibold">{stats.total}</div>
              <p className="text-sm text-slate-500">Всего рейсов</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-semibold text-green-600">
                {stats.onTime}
              </div>
              <p className="text-sm text-slate-500">Вовремя</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-semibold text-yellow-600">
                {stats.delayed}
              </div>
              <p className="text-sm text-slate-500">Задержано</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-semibold">{stats.occupancy}%</div>
              <p className="text-sm text-slate-500">Заполняемость</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Поиск по номеру, маршруту, авиакомпании..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все</SelectItem>
              <SelectItem value="on-time">Вовремя</SelectItem>
              <SelectItem value="delayed">Задержан</SelectItem>
              <SelectItem value="completed">Завершён</SelectItem>
              <SelectItem value="cancelled">Отменён</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Список рейсов</CardTitle>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Номер</TableHead>
                  <TableHead>Авиакомпания</TableHead>
                  <TableHead>Маршрут</TableHead>
                  <TableHead>Вылет</TableHead>
                  <TableHead>Прилёт</TableHead>
                  <TableHead>Длительность</TableHead>
                  <TableHead className="text-right">Цена</TableHead>
                  <TableHead className="text-right">Места</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredFlights.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium">
                      {f.flightNumber}
                    </TableCell>

                    <TableCell>{f.airline}</TableCell>

                    <TableCell>
                      {f.from} → {f.to}
                    </TableCell>

                    <TableCell>
                      {f.departure
                        ? new Date(f.departure).toLocaleString()
                        : "—"}
                    </TableCell>

                    <TableCell>
                      {f.arrival && f.arrival.length > 0
                        ? new Date(f.arrival).toLocaleString()
                        : "—"}
                    </TableCell>

                    <TableCell>{f.duration}</TableCell>

                    <TableCell className="text-right">{f.price} ₽</TableCell>

                    <TableCell className="text-right">
                      {f.availableSeats} / {f.totalSeats}
                    </TableCell>

                    <TableCell>{getStatusBadge(f.status)}</TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedFlight(f)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog
          open={!!selectedFlight}
          onOpenChange={() => setSelectedFlight(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Детали рейса</DialogTitle>
              <DialogDescription>
                Рейс {selectedFlight?.flightNumber} • {selectedFlight?.airline}
              </DialogDescription>
            </DialogHeader>

            {selectedFlight && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-500">
                      Номер рейса
                    </label>
                    <p className="mt-1">{selectedFlight.flightNumber}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-500">
                      Авиакомпания
                    </label>
                    <p className="mt-1">{selectedFlight.airline}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-500">
                      Откуда
                    </label>
                    <p className="mt-1">{selectedFlight.from}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-500">
                      Куда
                    </label>
                    <p className="mt-1">{selectedFlight.to}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-500">
                      Время вылета
                    </label>
                    <p className="mt-1">
                      {selectedFlight.departure
                        ? new Date(selectedFlight.departure).toLocaleString(
                            "ru-RU",
                          )
                        : "—"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-500">
                      Время прилёта
                    </label>
                    <p className="mt-1">
                      {selectedFlight.arrival &&
                      selectedFlight.arrival.length > 0
                        ? new Date(selectedFlight.arrival).toLocaleString(
                            "ru-RU",
                          )
                        : "—"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-500">
                      Длительность полёта
                    </label>
                    <p className="mt-1">{selectedFlight.duration}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-500">
                      Цена билета
                    </label>
                    <p className="mt-1">
                      {selectedFlight.price.toLocaleString("ru-RU")} ₽
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-500">
                      Доступно мест
                    </label>
                    <p className="mt-1">
                      {selectedFlight.availableSeats} из{" "}
                      {selectedFlight.totalSeats}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-500">
                      Заполняемость
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
                        Задержка
                      </label>
                      <p className="mt-1 text-yellow-600 font-medium">
                        {selectedFlight.delayMinutes} мин
                      </p>
                    </div>
                  )}

                  <div className="col-span-2">
                    <label className="text-sm font-medium text-slate-500">
                      Текущий статус
                    </label>
                    <div className="mt-1">
                      {getStatusBadge(selectedFlight.status)}
                    </div>
                  </div>
                </div>

                {selectedFlight.status === "on-time" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-500">
                      Задержка (минуты)
                    </label>
                    <Input
                      type="number"
                      value={delayMinutes}
                      min={1}
                      onChange={(e) => setDelayMinutes(Number(e.target.value))}
                    />
                  </div>
                )}

                <div className="flex flex-wrap gap-3 pt-4 border-t">
                  {selectedFlight.status === "on-time" && (
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
                        Задержать
                      </Button>

                      <Button
                        className="flex-1"
                        onClick={() =>
                          updateFlightStatus(selectedFlight.id, "completed")
                        }
                      >
                        <Plane className="w-4 h-4 mr-2" />
                        Завершить
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
                        Вовремя
                      </Button>

                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() =>
                          updateFlightStatus(selectedFlight.id, "cancelled")
                        }
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Отменить
                      </Button>
                    </>
                  )}

                  <Button
                    variant="outline"
                    onClick={() => setSelectedFlight(null)}
                  >
                    Закрыть
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
