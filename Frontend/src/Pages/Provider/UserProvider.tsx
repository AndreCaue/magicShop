import React, { useState, useEffect } from "react";
import { UserContext } from "../Context/UserContext";
import { useNavigate } from "react-router-dom";
import api from "../../axiosInstance";
import { toast } from "sonner";

export type User = {
  email: string;
  scopes: string[];
  isMaster?: boolean;
  isBasic: boolean;
  isPremium?: boolean;
  isVerified: boolean;
};

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  const fetchUser = async () => {
    try {
      const response = await api.get(`/auth/me`);

      setUser({
        email: response.data.email,
        scopes: response.data.scopes || [],
        isMaster: response.data.is_master || false,
        isBasic: (response.data.scopes || []).includes("basic"),
        isPremium: (response.data.scopes || []).includes("premium"),
        isVerified: response.data.is_verified || false,
      });
    } catch (error) {
      console.log(error, "err");
      setUser(null);
      navigate("/");
    }
  };

  useEffect(() => {
    fetchUser();
    const handleUnauthorized = () => {
      toast.warning("Sessão expirada.");
      setUser(null);
    };

    window.addEventListener("unauthorized", handleUnauthorized);
    return () => window.removeEventListener("unauthorized", handleUnauthorized);
  }, []);

  const logout = () => {
    document.cookie =
      "access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=None; Secure";
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};
