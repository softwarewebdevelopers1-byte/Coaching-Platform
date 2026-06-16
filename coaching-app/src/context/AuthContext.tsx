import React, { createContext, useState, useCallback, useEffect } from "react";
import type { Account } from "../types";

interface AuthContextType {
  user: Account | null;
  isLoading: boolean;
  login: (email: string, password: string, role: "admin" | "coach") => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
    "http://localhost:8000";

  useEffect(() => {
    const savedUser = localStorage.getItem("authUser");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("authUser");
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (email: string, password: string, role: "admin" | "coach") => {
      const response = await fetch(`${API_BASE_URL}/api/accounts/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.message || "Login failed");
      }

      const userData = result.account;
      setUser(userData);
      localStorage.setItem("authUser", JSON.stringify(userData));
    },
    [API_BASE_URL],
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("authUser");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
