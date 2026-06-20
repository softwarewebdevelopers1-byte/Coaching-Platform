import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Login from "./Login";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: "admin" | "coach";
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  if (user.role !== requiredRole) {
    if (user.role === "admin") {
      return <Navigate to="/admin" replace />;
    }
    if (user.role === "coach") {
      return <Navigate to="/coach" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
