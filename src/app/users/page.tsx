"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Search, Eye, Ban, Check } from "lucide-react";
import { User } from "@/data/mockData";
import {
  fetchUsers,
  blockUser,
  unblockUser,
} from "@/features/users/api/users.api";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchUsers(searchQuery, currentPage, itemsPerPage);

      setUsers(response.data);
      setTotalPages(response.meta.totalPages);
      setTotalItems(response.meta.total);
    } catch (e) {
      setError("Ошибка загрузки пользователей");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, currentPage, itemsPerPage]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const getStatusBadge = (status: User["status"]) => {
    const variants = {
      active: { label: "Активен", className: "bg-green-100 text-green-700" },
      inactive: {
        label: "Неактивен",
        className: "bg-slate-100 text-slate-700",
      },
      blocked: { label: "Заблокирован", className: "bg-red-100 text-red-700" },
    };
    const variant = variants[status];
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const toggleUserStatus = async (userId: string) => {
    try {
      const user = users.find((u) => u.id === userId);
      if (!user) return;

      if (user.status === "blocked") {
        await unblockUser(userId);
      } else {
        await blockUser(userId);
      }

      await loadUsers();
      setSelectedUser(null);
    } catch (error) {
      console.error(error);
      alert("Ошибка изменения статуса");
    }
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            Пользователи
          </h2>
          <p className="text-slate-500 mt-1">
            Управление пользователями системы
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Поиск по имени, email или телефону..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-semibold text-slate-900">
                {totalItems}
              </div>
              <p className="text-sm text-slate-500">Всего пользователей</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Список пользователей</CardTitle>
            <Select
              value={String(itemsPerPage)}
              onValueChange={(value) => {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 на странице</SelectItem>
                <SelectItem value="20">20 на странице</SelectItem>
                <SelectItem value="50">50 на странице</SelectItem>
                <SelectItem value="100">100 на странице</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>

          <CardContent>
            {loading && <p>Загрузка...</p>}
            {error && <p className="text-red-500">{error}</p>}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Пользователь</TableHead>
                  <TableHead>Контакты</TableHead>
                  <TableHead>Дата регистрации</TableHead>
                  <TableHead className="text-right">Бронирований</TableHead>
                  <TableHead className="text-right">Потрачено</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{user.email}</div>
                        <div className="text-slate-500">{user.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(user.registrationDate).toLocaleDateString(
                        "ru-RU",
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {user.totalBookings}
                    </TableCell>
                    <TableCell className="text-right">
                      {user.totalSpent.toLocaleString("ru-RU")} ₽
                    </TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedUser(user)}
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
          open={!!selectedUser}
          onOpenChange={() => setSelectedUser(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Детали пользователя</DialogTitle>
              <DialogDescription>
                Подробная информация о пользователе и возможность управления
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-500">
                      Имя
                    </label>
                    <p className="text-slate-900 mt-1">{selectedUser.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500">
                      Email
                    </label>
                    <p className="text-slate-900 mt-1">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500">
                      Телефон
                    </label>
                    <p className="text-slate-900 mt-1">{selectedUser.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500">
                      Дата регистрации
                    </label>
                    <p className="text-slate-900 mt-1">
                      {new Date(
                        selectedUser.registrationDate,
                      ).toLocaleDateString("ru-RU")}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500">
                      Всего бронирований
                    </label>
                    <p className="text-slate-900 mt-1">
                      {selectedUser.totalBookings}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500">
                      Общая сумма
                    </label>
                    <p className="text-slate-900 mt-1">
                      {selectedUser.totalSpent.toLocaleString("ru-RU")} ₽
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500">
                      Статус
                    </label>
                    <div className="mt-1">
                      {getStatusBadge(selectedUser.status)}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  {selectedUser.status === "blocked" ? (
                    <Button
                      className="flex-1"
                      onClick={() => toggleUserStatus(selectedUser.id)}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Разблокировать
                    </Button>
                  ) : (
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => toggleUserStatus(selectedUser.id)}
                    >
                      <Ban className="w-4 h-4 mr-2" />
                      Заблокировать
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => setSelectedUser(null)}
                  >
                    Закрыть
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-500">
              Показано {(currentPage - 1) * itemsPerPage + 1}-
              {(currentPage - 1) * itemsPerPage + users.length}
              из {totalItems} пользователей
            </div>

            <Pagination>
              <PaginationContent>
                <PaginationPrevious
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                />

                {getPageNumbers().map((page, index) => (
                  <PaginationItem key={`${page}-${index}`}>
                    {page === "ellipsis-start" || page === "ellipsis-end" ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        onClick={() => setCurrentPage(page as number)}
                        active={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                <PaginationNext
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                />
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
