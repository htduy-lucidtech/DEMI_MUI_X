"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

export type Role = "Admin" | "Manager" | "Employee";

interface UserInfo {
  id: number;
  username: string;
  fullName: string;
  role: Role;
  email: string;
  phone?: string;
  securityScore?: number;
  employeeId?: number;
}

interface AuthContextType {
  user: UserInfo | null;
  token: string | null;
  activeRole: Role | null;
  setActiveRole: (role: Role) => void;
  login: (token: string, user: UserInfo) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [activeRole, setActiveRoleState] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load from storage on mount
  useEffect(() => {
    const savedToken = Cookies.get("token") || localStorage.getItem("token");
    const savedUser = Cookies.get("user") || localStorage.getItem("user");
    const savedActiveRole = localStorage.getItem("activeRole") as Role;

    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser) as UserInfo;
        setToken(savedToken);
        setUser(parsedUser);
        
        if (parsedUser.role === "Admin" && savedActiveRole) {
          setActiveRoleState(savedActiveRole);
        } else {
          setActiveRoleState(parsedUser.role);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        logout();
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = (newToken: string, newUser: UserInfo) => {
    setToken(newToken);
    setUser(newUser);
    setActiveRoleState(newUser.role);

    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    Cookies.set("token", newToken, { expires: 7 });
    Cookies.set("user", JSON.stringify(newUser), { expires: 7 });
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setActiveRoleState(null);

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("activeRole");
    Cookies.remove("token");
    Cookies.remove("user");
  };

  const setActiveRole = (role: Role) => {
    if (user?.role === "Admin") {
      setActiveRoleState(role);
      localStorage.setItem("activeRole", role);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        activeRole,
        setActiveRole,
        login,
        logout,
        isAuthenticated: !!token,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
