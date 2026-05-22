"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  name: string;
}

interface UserContextValue {
  user: User | null;
  loaded: boolean;
  initials: string;
  setUser: (user: User) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("flowtrack_user");
    if (stored) {
      try { setUserState(JSON.parse(stored)); } catch { /* ignore */ }
    }
    setLoaded(true);
  }, []);

  const setUser = (u: User) => {
    localStorage.setItem("flowtrack_user", JSON.stringify(u));
    setUserState(u);
  };

  const logout = () => {
    localStorage.removeItem("flowtrack_user");
    setUserState(null);
  };

  const initials = user?.name
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "";

  return (
    <UserContext.Provider value={{ user, loaded, initials, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
