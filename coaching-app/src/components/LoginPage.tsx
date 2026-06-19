import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Login from "./Login";

const getDashboardPath = (role: string) => {
  if (role === "admin") return "/admin";
  if (role === "coach") return "/coach";
  return "/";
};

const LoginPage: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (user) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return (
    <div style={{ minHeight: "100vh", paddingTop: "80px", background: "var(--clr-bg)" }}>
      <Login />
    </div>
  );
};

export default LoginPage;
