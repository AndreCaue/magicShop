import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/Hooks/useAuth";
import { SymbolLoading } from "../components/new/CustomLoading/SymbolLoading";

export const PrivateRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return <SymbolLoading />;
  }

  console.log(isAuthenticated, "Autenticado?");
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
