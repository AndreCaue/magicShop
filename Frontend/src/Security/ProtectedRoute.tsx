import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/Hooks/useAuth";
import { SimbolLoading } from "./CustomLoading/SimbolLoading";

export const PrivateRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  console.log(loading, "looping inifito");
  if (loading) {
    return <SimbolLoading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
