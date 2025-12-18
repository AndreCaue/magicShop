import { createContext } from "react";
import type { User } from "../Provider/UserProvider";

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
};

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);
