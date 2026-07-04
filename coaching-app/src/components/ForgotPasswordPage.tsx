import React, { useState } from "react";
import { Link } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "https://coaching-platform-38p5.onrender.com";

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/accounts/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        setError(result?.message || "We could not process that email request.");
      } else {
        setMessage(result?.message || "If an account exists, a reset link has been sent.");
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
        <h2 style={{ margin: 0 }}>Forgot your password?</h2>
        <p style={{ color: "var(--clr-ink-soft)", marginTop: "8px" }}>Enter the email used for your UnWantra account and we will send a secure reset link.</p>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "14px", marginTop: "20px" }}>
          {error ? <div style={{ padding: "12px", borderRadius: "12px", background: "#fff2f2", color: "#b42318" }}>{error}</div> : null}
          {message ? <div style={{ padding: "12px", borderRadius: "12px", background: "#f4fff5", color: "#198754" }}>{message}</div> : null}

          <label style={{ display: "grid", gap: "6px" }}>
            <span>Email address</span>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required style={inputStyle} />
          </label>

          <button type="submit" disabled={isSubmitting} style={{ ...buttonStyle, opacity: isSubmitting ? 0.7 : 1 }}>
            {isSubmitting ? "Sending…" : "Send reset link"}
          </button>
        </form>

        <p style={{ marginTop: "16px", color: "var(--clr-ink-soft)" }}>
          Remembered it? <Link to="/login">Back to login</Link>
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

export default ForgotPasswordPage;
