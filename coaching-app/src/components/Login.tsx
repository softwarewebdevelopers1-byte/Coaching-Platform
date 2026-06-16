import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface LoginProps {
  onLoginSuccess?: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "coach">("coach");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password, role);
      onLoginSuccess?.();
      // Redirect to appropriate dashboard
      setTimeout(() => {
        navigate(role === "admin" ? "/admin" : "/coach");
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "40px auto",
        padding: "32px",
        border: "1px solid var(--clr-border)",
        borderRadius: "var(--radius-md)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <h2 style={{ marginBottom: "24px", textAlign: "center" }}>
        Admin & Coach Login
      </h2>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>
            Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "admin" | "coach")}
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid var(--clr-border)",
              borderRadius: "var(--radius-sm)",
              fontSize: "1rem",
            }}
          >
            <option value="admin">Admin</option>
            <option value="coach">Coach</option>
          </select>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid var(--clr-border)",
              borderRadius: "var(--radius-sm)",
              fontSize: "1rem",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid var(--clr-border)",
              borderRadius: "var(--radius-sm)",
              fontSize: "1rem",
              boxSizing: "border-box",
            }}
          />
        </div>

        {error && (
          <div
            style={{
              padding: "12px",
              background: "#fee",
              border: "1px solid #fcc",
              borderRadius: "var(--radius-sm)",
              color: "#c33",
              fontSize: "0.9rem",
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary"
          style={{
            background: isLoading ? "var(--clr-border)" : "var(--clr-accent)",
            cursor: isLoading ? "not-allowed" : "pointer",
          }}
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p style={{ marginTop: "16px", fontSize: "0.85rem", color: "var(--clr-ink-soft)", textAlign: "center" }}>
        💡 Users cannot login. Admins and coaches can access their dashboards here.
      </p>
    </div>
  );
};

export default Login;
