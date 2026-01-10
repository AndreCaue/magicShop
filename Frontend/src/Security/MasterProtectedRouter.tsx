import { useAuth } from "@/Hooks/useAuth";
import { Outlet, useNavigate } from "react-router-dom";

export default function MasterProtectedRouter() {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user?.isMaster) {
    navigate(-1);
    return null;
  }

  return <Outlet />;
}
