import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "https://coaching-platform-38p5.onrender.com";

const WEEK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const CoachSignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    password: "",
    confirmPassword: "",
    programName: "individual-executive",
    bio: "",
    experience: "",
    languages: "",
    availabilityType: "whole_week" as "whole_week" | "selected_days",
    availabilitySummary: "",
    photo: "",
  });
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const inviteToken = params.get("token") || "";
    setToken(inviteToken);
    if (!inviteToken) {
      setError("This signup link is missing a valid token.");
      setIsLoading(false);
      return;
    }

    const validateInvite = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/accounts/coach-invites/${inviteToken}`);
        const result = await response.json().catch(() => null);
        if (!response.ok) {
          setError(result?.message || "This invitation is invalid or expired.");
          setIsLoading(false);
          return;
        }
        setInviteEmail(result.invite?.email || "");
      } catch {
        setError("Unable to validate this invitation at the moment.");
      } finally {
        setIsLoading(false);
      }
    };

    void validateInvite();
  }, []);

  const availabilitySummaryPreview = useMemo(() => {
    if (form.availabilityType === "whole_week") return "Whole week";
    if (selectedDays.length) return selectedDays.join(", ");
    return "Selected days";
  }, [form.availabilityType, selectedDays]);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    setError("");
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const response = await fetch(`${API_BASE_URL}/api/accounts/upload`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ photoData: base64, originalName: file.name, accountId: undefined }),
        });
        const result = await response.json().catch(() => null);
        if (!response.ok) {
          setError(result?.message || "Could not upload your profile photo.");
          setUploadingPhoto(false);
          return;
        }
        setForm((prev) => ({ ...prev, photo: result.photoUrl || "" }));
        setUploadingPhoto(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setUploadingPhoto(false);
      setError("Photo upload failed.");
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.fullName || !form.password || !form.confirmPassword) {
      setError("Please complete your full name and password.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Password confirmation does not match.");
      return;
    }
    if (!token) {
      setError("Invalid invitation token.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/accounts/coach-invites/${token}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          phone: form.phone,
          password: form.password,
          programName: form.programName,
          bio: form.bio,
          experience: Number(form.experience || 0),
          languages: form.languages
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          expertise: [],
          photo: form.photo,
          availabilitySummary: form.availabilitySummary || availabilitySummaryPreview,
          maxWorkload: 10,
          availabilityType: form.availabilityType,
          availableDays: selectedDays,
        }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        setError(result?.message || "Could not create your coach account.");
      } else {
        setSuccess("Your coach profile is ready. You can now sign in with your email and password.");
        setTimeout(() => navigate("/login"), 1400);
      }
    } catch {
      setError("Something went wrong while creating your profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-kicker">Coach Onboarding</span>
          <h1>Complete your UnWantra coaching profile</h1>
          <p>
            Your invite is ready for {inviteEmail || "your email"}. Add your details below and become part of the UnWantra coaching network.
          </p>
        </div>

        {isLoading ? (
          <p style={{ textAlign: "center", color: "var(--uw-muted)" }}>Checking your invitation…</p>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            {error ? <div className="auth-alert auth-alert-error" role="alert">{error}</div> : null}
            {success ? <div className="auth-alert auth-alert-success" role="status">{success}</div> : null}

            <div className="auth-grid">
              <label className="auth-field">
                <span>Full name</span>
                <input value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} required />
              </label>
              <label className="auth-field">
                <span>Phone number</span>
                <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
              </label>
              <label className="auth-field">
                <span>Email</span>
                <input value={inviteEmail} disabled className="auth-field-input-disabled" />
              </label>
              <label className="auth-field">
                <span>Choose a password</span>
                <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
              </label>
              <label className="auth-field">
                <span>Confirm password</span>
                <input type="password" value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} required />
              </label>
              <label className="auth-field">
                <span>Primary program</span>
                <select value={form.programName} onChange={(event) => setForm({ ...form, programName: event.target.value })}>
                  <option value="individual-executive">Individual Executive Coaching</option>
                  <option value="group-executive">Group Executive Coaching</option>
                </select>
              </label>
            </div>

            <label className="auth-field">
              <span>Short bio</span>
              <textarea value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} rows={4} />
            </label>

            <div className="auth-grid">
              <label className="auth-field">
                <span>Years of experience</span>
                <input type="number" min="0" value={form.experience} onChange={(event) => setForm({ ...form, experience: event.target.value })} />
              </label>
              <label className="auth-field">
                <span>Languages</span>
                <input value={form.languages} onChange={(event) => setForm({ ...form, languages: event.target.value })} placeholder="English, Kiswahili" />
              </label>
            </div>

            <div className="auth-grid">
              <label className="auth-field">
                <span>Availability</span>
                <select value={form.availabilityType} onChange={(event) => setForm({ ...form, availabilityType: event.target.value as "whole_week" | "selected_days" })}>
                  <option value="whole_week">Whole week</option>
                  <option value="selected_days">Selected days</option>
                </select>
              </label>
              <label className="auth-field">
                <span>Availability summary</span>
                <input value={form.availabilitySummary} onChange={(event) => setForm({ ...form, availabilitySummary: event.target.value })} placeholder="e.g. Tue and Thu mornings" />
              </label>
            </div>

            {form.availabilityType === "selected_days" ? (
              <div>
                <div style={{ marginBottom: "8px", fontWeight: 700, fontSize: "0.82rem", color: "var(--uw-sage-dark)", letterSpacing: "0.04em" }}>Select available days</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {WEEK_DAYS.map((day) => {
                    const checked = selectedDays.includes(day);
                    return (
                      <label key={day} className="auth-checkbox-label">
                        <input type="checkbox" checked={checked} onChange={() => setSelectedDays((current) => current.includes(day) ? current.filter((item) => item !== day) : [...current, day])} />
                        <span>{day}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <label className="auth-field auth-upload">
              <span>Profile photo</span>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} />
              {uploadingPhoto ? <span style={{ color: "var(--uw-muted)", fontSize: "0.85rem" }}>Uploading photo…</span> : null}
              {form.photo ? <span style={{ color: "#198754", fontSize: "0.9rem" }}>Photo ready to save.</span> : null}
            </label>

            <button type="submit" disabled={isSubmitting || uploadingPhoto} className="auth-submit">
              {isSubmitting ? "Creating profile…" : "Create coach profile"}
            </button>
          </form>
        )}

        <div className="auth-footer">
          Already have an account? <Link to="/login">Go to login</Link>
        </div>
      </div>
    </div>
  );
};

export default CoachSignupPage;
