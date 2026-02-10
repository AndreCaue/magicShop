import api, { setAccessToken } from "@/axiosInstance";
import { useState, useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AuthContext } from "../Context/AuthContext";

export type TUser = {
  email: string;
  scopes: string[];
  isMaster?: boolean;
  isBasic: boolean;
  isPremium?: boolean;
  isVerified: boolean;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<TUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadUser = async () => {
    try {
      const response = await api.get("/auth/me");

      const userData: TUser = {
        email: response.data.email,
        scopes: response.data.scopes || [],
        isMaster: response.data.scopes?.includes("master"),
        isBasic: response.data.scopes?.includes("basic") || false,
        isPremium: response.data.scopes?.includes("premium"),
        isVerified: !!response.data.is_verified,
      };

      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("erro:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (token: string, userData: TUser) => {
    setAccessToken(token);
    setUser(userData);
    setIsAuthenticated(true);
    await loadUser();
  };

  const logout = async () => {
    try {
      const res = await api.post("/auth/logout");
      if (!res) return;
      toast.success("Logout realizado com sucesso.");
    } catch (error) {
      console.error("Erro ao chamar logout backend:", error);
      toast.error("Erro ao sair. Tente novamente.");
    } finally {
      setAccessToken(null);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("is_verify");

      document.cookie =
        "access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure";
      document.cookie =
        "refresh_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure";

      navigate("/login");
    }
  };

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
      navigate("/login");
    };

    window.addEventListener("unauthorized", handleUnauthorized);
    return () => window.removeEventListener("unauthorized", handleUnauthorized);
  }, []);

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const response = await api.post("/auth/refresh");
        const accessToken = response.data.access_token;

        setAccessToken(accessToken);
        await loadUser();
      } catch {
        setAccessToken(null);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    bootstrapAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
