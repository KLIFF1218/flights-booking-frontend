export type AdminUserStatus = "active" | "inactive" | "blocked";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  registrationDate: string;
  totalBookings: number;
  totalSpent: number;
  status: AdminUserStatus;
}
