import { useState, useEffect, useCallback } from "react";

export const useAuthLogin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  // Atualiza manualmente o estado (pode usar após login/logout)
  const refreshAuth = useCallback(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    // Escuta alterações em outras abas (ex: logout em outra aba)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "token") refreshAuth();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [refreshAuth]);

  return { isLoggedIn, refreshAuth };
};
