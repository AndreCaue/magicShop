import { createContext } from "react";

export type AuthContextType = {
  isLoggedIn: boolean;
  handleLogin: (token: string) => void;
  handleLogout: () => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
