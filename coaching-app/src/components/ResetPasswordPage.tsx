import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "https://coaching-platform-38p5.onrender.com";

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get("token") || "");
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!password || password !== confirmPassword) {
      setError("Please confirm your new password.");
      return;
    }
    if (!token) {
      setError("Missing reset token.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/accounts/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        setError(result?.message || "We could not reset your password.");
      } else {
        setMessage(result?.message || "Your password has been reset successfully.");
        setTimeout(() => navigate("/login"), 1400);
      }
    } catch {
      setError("Unable to reach the server right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", padding: "80px 20px 40px", background: "var(--clr-bg)" }}>
      <div style={{ maxWidth: "520px", margin: "0 auto", padding: "32px", borderRadius: "24px", background: "white", boxShadow: "var(--shadow-sm)" }}>
        <p style={{ textTransform: "uppercase", letterSpacing: "0.16em", color: "var(--clr-accent)", fontWeight: 700, marginBottom: "8px" }}>Password reset</p>
        <h2 style={{ margin: 0 }}>Choose a new password</h2>
        <p style={{ color: "var(--clr-ink-soft)", marginTop: "8px" }}>Create a new password for your UnWantra account.</p>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "14px", marginTop: "20px" }}>
          {error ? <div style={{ padding: "12px", borderRadius: "12px", background: "#fff2f2", color: "#b42318" }}>{error}</div> : null}
          {message ? <div style={{ padding: "12px", borderRadius: "12px", background: "#f4fff5", color: "#198754" }}>{message}</div> : null}

          <label style={{ display: "grid", gap: "6px" }}>
            <span>New password</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required style={inputStyle} />
          </label>
          <label style={{ display: "grid", gap: "6px" }}>
            <span>Confirm password</span>
            <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required style={inputStyle} />
          </label>

          <button type="submit" disabled={isSubmitting} style={{ ...buttonStyle, opacity: isSubmitting ? 0.7 : 1 }}>
            {isSubmitting ? "Updating…" : "Reset password"}
          </button>
        </form>

        <p style={{ marginTop: "16px", color: "var(--clr-ink-soft)" }}>
          <Link to="/login">Return to login</Link>
        </p>
      </div>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "12px",
  border: "1px solid #dde2eb",
  fontSize: "1rem",
  boxSizing: "border-box",
};

const buttonStyle: React.CSSProperties = {
  border: 0,
  borderRadius: "999px",
  padding: "12px 18px",
  background: "var(--clr-accent)",
  color: "#1a1612",
  fontWeight: 700,
  cursor: "pointer",
};

export default ResetPasswordPage;
