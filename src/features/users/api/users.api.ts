import { User } from "@/data/mockData";
import { apiFetch } from "@/shared/api/apiClient";

interface AdminUsersResponse {
  data: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export async function fetchUsers(
  search: string = "",
  page: number = 1,
  limit: number = 20,
): Promise<AdminUsersResponse> {
  const query = new URLSearchParams({
    search,
    page: String(page),
    limit: String(limit),
  });

  return apiFetch<AdminUsersResponse>(
    `/admin/users?${query.toString()}`,
    { method: "GET" }
  );
}


export async function blockUser(userId: string): Promise<void> {
  await apiFetch(`/admin/users/${userId}/block`, {
    method: "PATCH",
  });
}

export async function unblockUser(userId: string): Promise<void> {
  await apiFetch(`/admin/users/${userId}/unblock`, {
    method: "PATCH",
  });
}