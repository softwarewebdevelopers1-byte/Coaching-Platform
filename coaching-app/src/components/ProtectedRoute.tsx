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
    return (
      <div
        style={{
          textAlign: "center",
          padding: "40px",
          maxWidth: "500px",
          margin: "40px auto",
        }}
      >
        <h2>Access Denied</h2>
        <p>You do not have permission to access this dashboard.</p>
        <p style={{ fontSize: "0.9rem", color: "var(--clr-ink-soft)" }}>
          Your role: <strong>{user.role}</strong>
        </p>
        <a href="/" style={{ color: "var(--clr-accent)", cursor: "pointer" }}>
          ← Go back to home
        </a>
      </div>
    );
  }

  return <>{children}</>;
};
