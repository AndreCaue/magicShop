import { useUser } from "@/Services/userService";
import { Outlet, useNavigate } from "react-router-dom";

export default function MasterProtectedRouter() {
  const navigate = useNavigate();
  const { user } = useUser();

  if (!user?.isMaster) {
    navigate(-1);
    return null;
  }

  return <Outlet />;
}
