import api, { setAccessToken } from "@/axiosInstance";
import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AuthContext } from "../Context/AuthContext";

export type TUser = {
  uuid?: string;
  email: string;
  scopes: string[];
  isMaster: boolean;
  isBasic: boolean;
  isPremium: boolean;
  isVerified: boolean;
};

function mapUserResponse(data: Record<string, unknown>): TUser {
  const scopes: string[] = Array.isArray(data.scopes) ? data.scopes : [];

  return {
    uuid: data.uuid ? String(data.uuid) : undefined,
    email: String(data.email ?? ""),
    scopes,
    isMaster: Boolean(data.is_master),
    isBasic: scopes.includes("basic"),
    isPremium: scopes.includes("premium"),
    isVerified: Boolean(data.is_verified),
  };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<TUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadUser = useCallback(async (): Promise<TUser | null> => {
    try {
      const response = await api.get("/auth/me");
      const userData = mapUserResponse(response.data);
      setUser(userData);
      setIsAuthenticated(true);
      return userData;
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
      setUser(null);
      setIsAuthenticated(false);
      return null;
    }
  }, []);

  const logoutRef = useRef<() => Promise<void>>(async () => {});

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
      toast.success("Logout realizado com sucesso.");
    } catch (error) {
      console.error("Erro ao chamar logout backend:", error);
      toast.error("Erro ao sair. Tente novamente.");
    } finally {
      setAccessToken(null);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("is_verify");
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    logoutRef.current = logout;
  }, [logout]);

  useEffect(() => {
    const handleUnauthorized = () => {
      logoutRef.current();
    };

    window.addEventListener("unauthorized", handleUnauthorized);
    return () => window.removeEventListener("unauthorized", handleUnauthorized);
  }, []);

  const login = useCallback(
    async (token: string) => {
      setAccessToken(token);
      await loadUser();
    },
    [loadUser],
  );

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
  }, [loadUser]);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
