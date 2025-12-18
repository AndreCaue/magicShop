import { useAuthLogin } from "@/Hooks/Auth";
import { Outlet, Navigate } from "react-router-dom";

export default function ProtectedRoute() {
  const { isLoggedIn } = useAuthLogin();

  if (isLoggedIn === null) {
    return <div>Carregando...</div>;
  }

  return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />;
}
