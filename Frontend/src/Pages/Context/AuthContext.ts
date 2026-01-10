import { createContext } from "react";
import type { TUser } from "../Provider/AuthProvider";

type AuthContextType = {
  isAuthenticated: boolean;
  user: TUser | null;
  loading: boolean;
  login: (token: string, userData: TUser) => void;
  logout: () => void;
};
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
