import { useAuth } from "@/providers/auth-provider";

export function useLogout() {
  const { logout } = useAuth();
  return logout;
}
