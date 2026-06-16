import React from "react";
import { useAuth } from "../context/AuthContext";
import Login from "./Login";

interface PrivateRouteProps {
  children: React.ReactNode;
  allowedRoles: ("admin" | "coach" | "user")[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, allowedRoles }) => {
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

  if (!allowedRoles.includes(user.role)) {
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
      </div>
    );
  }

  return <>{children}</>;
};

export default PrivateRoute;
