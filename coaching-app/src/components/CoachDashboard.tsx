import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { BookingSession, CoachSlot, Program, SlotRequest } from "../types";
import "../styles/Dashboard.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "https://coaching-platform-38p5.onrender.com";

interface CoachDashboardProps {
  programs: Program[];
  showToast: (message: string, type: string, duration?: number) => void;
}

type CoachTab = "overview" | "availability" | "bookings" | "requests" | "rejected" | "settings";

const WEEK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/* ── SVG Icons ───────────────────────────────────────────────── */
const Icons = {
  grid: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  calendar: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  users: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  logout: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  award: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6"/>
      <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
    </svg>
  ),
  plus: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  refresh: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10"/>
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
    </svg>
  ),
  trash: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  ),
  xCircle: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="15" y1="9" x2="9" y2="15"/>
      <line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  ),
  check: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  clock: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  settings: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  x: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
};

/* ── Status pill ─────────────────────────────────────────────── */
const StatusPill = ({ status }: { status: string }) => (
  <span className={`status-pill status-${status}`}>
    {status === "open" ? "Available" : status === "booked" ? "Booked" : status}
  </span>
);

const CoachDashboard: React.FC<CoachDashboardProps> = ({ programs, showToast }) => {
  const { logout, user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<CoachTab>("overview");
  const [navOpen, setNavOpen] = useState(false);
  const [slots, setSlots] = useState<CoachSlot[]>([]);
  const [sessions, setSessions] = useState<BookingSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [slotForm, setSlotForm] = useState({
    meetingLink: "",
    programName: user?.programName || programs[0]?.id || "",
    bookingDate: "",
    bookingEndDate: "",
  });

  const [settingsForm, setSettingsForm] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    programName: user?.programName || programs[0]?.id || "",
    experience: user?.experience?.toString() || "",
    languages: user?.languages?.join(", ") || "",
    availabilityType: (user?.availabilityType as "whole_week" | "selected_days") || "whole_week",
    photo: user?.photo || "",
    password: "",
    confirmPassword: "",
  });
  const [selectedDays, setSelectedDays] = useState<string[]>(user?.availableDays || []);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Slot requests state
  const [slotRequests, setSlotRequests] = useState<SlotRequest[]>([]);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [approveForm, setApproveForm] = useState({
    scheduledTime: "",
    coachNotes: "",
    googleMeetingLink: "",
  });
  const [decliningId, setDecliningId] = useState<string | null>(null);

  // The coach's identity comes directly from the logged-in user account
  const coachId = user?._id || "";
  const coachName = user?.fullName || "";
  const coachEmail = user?.email || "";
  const coachPhone = user?.phone || "";

  const getProgramIds = (value?: string) =>
    (value || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  const getProgramLabel = (value: string) => {
    const program = programs.find((p) => p.id === value || p.title === value);
    return program?.title || value || "-";
  };

  const getProgramSummary = (value?: string) => {
    const labels = getProgramIds(value).map(getProgramLabel);
    return labels.length ? labels.join(", ") : "Not set";
  };

  const coachProgramIds = getProgramIds(user?.programName);
  const selectedProgramIds = getProgramIds(settingsForm.programName);
  const coachSlotPrograms = coachProgramIds.length
    ? programs.filter((p) => coachProgramIds.includes(p.id) || coachProgramIds.includes(p.title))
    : programs;

  const setProgramEnabled = (programId: string, enabled: boolean) => {
    const next = enabled
      ? Array.from(new Set([...selectedProgramIds, programId]))
      : selectedProgramIds.filter((id) => id !== programId);
    setSettingsForm({ ...settingsForm, programName: next.join(",") });
  };

  useEffect(() => {
    if (user) {
      setSettingsForm((prev) => ({
        ...prev,
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        programName: user.programName || programs[0]?.id || "",
        experience: user.experience?.toString() || "",
        languages: user.languages?.join(", ") || "",
        availabilityType: (user.availabilityType as "whole_week" | "selected_days") || "whole_week",
        photo: user.photo || "",
      }));
      setSelectedDays(user.availableDays || []);
      setSlotForm((prev) => ({
        ...prev,
        programName: getProgramIds(user.programName)[0] || programs[0]?.id || "",
      }));
    }
  }, [user, programs]);

  const initials = coachName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "CO";

  /* ── Load data ───────────────────────────────────────────── */
  const loadDashboardData = async () => {
    if (!coachEmail) return;
    setIsLoading(true);
    try {
      const [slotsRes, sessionsRes, requestsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/bookings/coach-slots?coachEmail=${encodeURIComponent(coachEmail)}`),
        fetch(`${API_BASE_URL}/api/bookings/sessions`),
        fetch(`${API_BASE_URL}/api/slot-requests?coachEmail=${encodeURIComponent(coachEmail)}`),
      ]);

      if (slotsRes.ok) {
        const data = await slotsRes.json();
        setSlots(data.slots || []);
      }

      if (sessionsRes.ok) {
        const data = await sessionsRes.json();
        // Filter sessions that belong to this coach
        const mySessions = (data.sessions || []).filter(
          (s: BookingSession) =>
            s.coachEmail === coachEmail || s.coachId === coachId,
        );
        setSessions(mySessions);
      }

      if (requestsRes.ok) {
        const data = await requestsRes.json();
        setSlotRequests(data.slotRequests || []);
      }
    } catch {
      showToast("Error loading dashboard data", "error", 5000);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [coachEmail, coachId]);

  /* ── Create slot ─────────────────────────────────────────── */
  const createCoachSlot = async () => {
    if (!slotForm.meetingLink.trim()) {
      showToast("Please add a Google Meet link", "error", 3000);
      return;
    }
    if (!slotForm.programName) {
      showToast("Please select a program", "error", 3000);
      return;
    }
    if (!coachSlotPrograms.some((program) => program.id === slotForm.programName)) {
      showToast("Slots must be created for one of your configured coaching programs", "error", 4000);
      return;
    }
    if (!slotForm.bookingDate) {
      showToast("Please set a start date and time", "error", 3000);
      return;
    }

    const startDate = new Date(slotForm.bookingDate);
    const endDate = slotForm.bookingEndDate ? new Date(slotForm.bookingEndDate) : null;

    if (endDate && endDate <= startDate) {
      showToast("End time must be after start time", "error", 3000);
      return;
    }

    if (startDate < new Date()) {
      showToast("Slot date must be in the future", "error", 3000);
      return;
    }

    const res = await fetch(`${API_BASE_URL}/api/bookings/coach-slots`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        coachId,
        coachName,
        coachEmail,
        coachPhone,
        programName: slotForm.programName,
        meetingLink: slotForm.meetingLink,
        title: "Google Meet Session",
        bookingDate: slotForm.bookingDate,
        bookingEndDate: slotForm.bookingEndDate || undefined,
      }),
    });

    if (res.ok) {
      setSlotForm({
        meetingLink: "",
        programName: coachSlotPrograms[0]?.id || programs[0]?.id || "",
        bookingDate: "",
        bookingEndDate: "",
      });
      await loadDashboardData();
      showToast("✓ Availability slot created successfully", "success", 4000);
      setActiveTab("availability");
    } else {
      const err = await res.json().catch(() => ({}));
      showToast(err.message || "Error creating slot", "error", 5000);
    }
  };

  /* ── Delete slot ─────────────────────────────────────────── */
  const deleteSlot = async (slotId: string, slotStatus: string) => {
    if (slotStatus === "booked") {
      showToast("Cannot delete a slot that has been booked", "error", 4000);
      return;
    }
    if (!confirm("Delete this availability slot? This cannot be undone.")) return;

    setDeletingId(slotId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings/coach-slots/${slotId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        showToast("Slot deleted", "success", 3000);
        setSlots((prev) => prev.filter((s) => s._id !== slotId));
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.message || "Error deleting slot", "error", 5000);
      }
    } catch {
      showToast("Network error, please try again", "error", 5000);
    } finally {
      setDeletingId(null);
    }
  };

  const openSlots = slots.filter((s) => s.status === "open").length;
  const bookedSlots = slots.filter((s) => s.status === "booked").length;
  const pendingRequests = slotRequests.filter((r) => r.status === "pending");
  const declinedRequests = slotRequests.filter((r) => r.status === "declined");
  const pendingCount = pendingRequests.length;
  const declinedCount = declinedRequests.length;

  /* ── Approve slot request ──────────────────────────────── */
  const approveRequest = async (requestId: string) => {
    if (!approveForm.scheduledTime) {
      showToast("Please set a session time before approving", "error", 3000);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/slot-requests/${requestId}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduledTime: approveForm.scheduledTime
            ? new Date(approveForm.scheduledTime).toLocaleString([], {
                weekday: "short", month: "short", day: "numeric",
                hour: "2-digit", minute: "2-digit",
              })
            : "",
          coachNotes: approveForm.coachNotes,
          coachPhone,
          googleMeetingLink: approveForm.googleMeetingLink.trim(),
        }),
      });

      if (res.ok) {
        showToast("✓ Request approved — client has been notified by email", "success", 5000);
        setApprovingId(null);
        setApproveForm({ scheduledTime: "", coachNotes: "", googleMeetingLink: "" });
        await loadDashboardData();
        setActiveTab("bookings");
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.message || "Error approving request", "error", 5000);
      }
    } catch {
      showToast("Network error, please try again", "error", 5000);
    }
  };

  /* ── Decline slot request ──────────────────────────────── */
  const declineRequest = async (requestId: string) => {
    if (!confirm("Decline this session request?")) return;
    setDecliningId(requestId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/slot-requests/${requestId}/decline`, {
        method: "PATCH",
      });

      if (res.ok) {
        showToast("Request declined — client has been notified by email", "success", 3000);
        await loadDashboardData();
        setActiveTab("rejected");
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.message || "Error declining request", "error", 5000);
      }
    } catch {
      showToast("Network error, please try again", "error", 5000);
    } finally {
      setDecliningId(null);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });

      const res = await fetch(`${API_BASE_URL}/api/accounts/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoData: base64, originalName: file.name }),
      });

      const result = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(result?.message || "Could not upload profile photo");
      }

      setSettingsForm((prev) => ({ ...prev, photo: result.photoUrl || "" }));
      showToast("Profile photo uploaded", "success", 3000);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not upload profile photo", "error", 5000);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const saveSettings = async () => {
    if (!coachId) return;

    if (!settingsForm.email.trim()) {
      showToast("Email is required", "error", 3000);
      return;
    }

    if ((settingsForm.password || settingsForm.confirmPassword) && settingsForm.password !== settingsForm.confirmPassword) {
      showToast("New passwords do not match", "error", 3000);
      return;
    }

    setIsSavingSettings(true);
    try {
      const payload: Record<string, unknown> = {
        fullName: settingsForm.fullName.trim(),
        email: settingsForm.email.trim(),
        phone: settingsForm.phone.trim(),
        programName: settingsForm.programName,
        experience: Number(settingsForm.experience || 0),
        languages: settingsForm.languages
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        photo: settingsForm.photo,
        availabilityType: settingsForm.availabilityType,
        availableDays: selectedDays,
        availabilitySummary: settingsForm.availabilityType === "whole_week"
          ? "Whole week"
          : selectedDays.length
            ? selectedDays.join(", ")
            : "By discovery call",
      };

      if (settingsForm.password) {
        payload.password = settingsForm.password;
      }

      const res = await fetch(`${API_BASE_URL}/api/accounts/${coachId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(result?.message || "Could not update settings");
      }

      updateUser({
        fullName: result.account.fullName,
        email: result.account.email,
        phone: result.account.phone,
        programName: result.account.programName,
        experience: result.account.experience,
        languages: result.account.languages || [],
        photo: result.account.photo,
        availabilitySummary: result.account.availabilitySummary,
        availabilityType: result.account.availabilityType,
        availableDays: result.account.availableDays || [],
      });

      setSettingsForm((prev) => ({ ...prev, password: "", confirmPassword: "" }));
      showToast("Settings updated successfully", "success", 4000);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not update settings", "error", 5000);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const navItems = [
    { id: "overview", label: "Overview", icon: Icons.grid },
    { id: "availability", label: "My Availability", icon: Icons.calendar },
    { id: "bookings", label: "Client Bookings", icon: Icons.users },
    { id: "requests", label: `Requests${pendingCount > 0 ? ` (${pendingCount})` : ""}`, icon: Icons.clock },
    { id: "rejected", label: `Rejected${declinedCount > 0 ? ` (${declinedCount})` : ""}`, icon: Icons.x },
    { id: "settings", label: "Settings", icon: Icons.settings },
  ];

  const tabTitles: Record<CoachTab, { title: string; subtitle: string }> = {
    overview: { title: "Coach Dashboard", subtitle: "Your coaching performance at a glance" },
    availability: { title: "Manage Availability", subtitle: "Create and manage your coaching slots" },
    bookings: { title: "Client Bookings", subtitle: "All clients who booked sessions with you" },
    requests: { title: "Session Requests", subtitle: "Review and approve pending session requests from clients" },
    rejected: { title: "Rejected Requests", subtitle: "Session requests you have declined" },
    settings: { title: "Account Settings", subtitle: "Update your contact details and coaching programs" },
  };

  /* ── Render ──────────────────────────────────────────────── */
  return (
    <div className={`dashboard-wrapper coach-dashboard-wrapper ${navOpen ? "dashboard-nav-open" : ""}`}>
      <button
        className="dashboard-mobile-menu-btn"
        type="button"
        aria-label="Open dashboard navigation"
        aria-expanded={navOpen}
        onClick={() => setNavOpen((value) => !value)}
      >
        <span />
        <span />
        <span />
      </button>
      <button
        className="dashboard-nav-backdrop"
        type="button"
        aria-label="Close dashboard navigation"
        onClick={() => setNavOpen(false)}
      />
      {/* ── Sidebar ─────────────────────────────── */}
      <aside className="dashboard-sidebar coach-sidebar">
        <div className="dashboard-sidebar-header">
          <div className="dashboard-sidebar-title">
            <div className="dashboard-sidebar-icon">{Icons.award}</div>
            Coach Portal
          </div>
        </div>

        <nav style={{ flex: 1, overflowY: "auto" }}>
          <p className="sidebar-section-label">Navigation</p>
          <ul className="dashboard-sidebar-nav">
            {navItems.map((item) => (
              <li key={item.id} className="dashboard-sidebar-item">
                <button
                  className={`dashboard-sidebar-link ${activeTab === item.id ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab(item.id as CoachTab);
                    setNavOpen(false);
                  }}
                >
                  <span className="sidebar-active-indicator" />
                  <span className="dashboard-sidebar-link-icon">{item.icon}</span>
                  <span className="sidebar-link-label">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="dashboard-sidebar-footer">
          <div className="dashboard-user-info">
            <div className="dashboard-user-avatar">{initials}</div>
            <div className="dashboard-user-text">
              <p className="dashboard-user-name">Logged in as</p>
              <p className="dashboard-user-email">{coachName}</p>
            </div>
          </div>
          <button
            className="dashboard-logout-btn"
            onClick={() => { logout(); navigate("/"); }}
          >
            {Icons.logout} Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────── */}
      <main className="dashboard-main">
        {/* Topbar */}
        <div className="dashboard-topbar">
          <div className="dashboard-topbar-left">
            <h1 className="dashboard-topbar-title">{tabTitles[activeTab].title}</h1>
            <p className="dashboard-topbar-subtitle">{tabTitles[activeTab].subtitle}</p>
          </div>
          <div className="dashboard-topbar-right">
            <button className="topbar-icon-btn" onClick={loadDashboardData} title="Refresh data">
              {Icons.refresh}
            </button>
            <span className="topbar-badge topbar-badge-coach">
              {Icons.award} Coach
            </span>
          </div>
        </div>

        <div className="dashboard-content">

          {/* Loading state */}
          {isLoading && (
            <div className="dashboard-loading">
              <div className="loading-spinner" />
              <p>Loading your data…</p>
            </div>
          )}

          {/* ── OVERVIEW ──────────────────────────── */}
          {!isLoading && activeTab === "overview" && (
            <>
              <div className="dashboard-stats">
                <div className="stat-card">
                  <div className="stat-card-icon">📅</div>
                  <p className="stat-card-label">Total Slots</p>
                  <p className="stat-card-value">{slots.length}</p>
                  <p className="stat-card-change positive">↑ {openSlots} available</p>
                </div>
                <div className="stat-card">
                  <div className="stat-card-icon">📋</div>
                  <p className="stat-card-label">Booked Sessions</p>
                  <p className="stat-card-value">{bookedSlots}</p>
                  <p className="stat-card-change">{sessions.length} clients total</p>
                </div>
                <div className="stat-card">
                  <div className="stat-card-icon">📧</div>
                  <p className="stat-card-label">Email</p>
                  <p className="stat-card-value custom-text-size">{coachEmail || "—"}</p>
                  <p className="stat-card-change">Your contact email</p>
                </div>
                <div className="stat-card">
                  <div className="stat-card-icon">📞</div>
                  <p className="stat-card-label">Phone</p>
                  <p className="stat-card-value custom-text-size">{coachPhone || "—"}</p>
                  <p className="stat-card-change">Your contact number</p>
                </div>
              </div>

              {/* Quick action card */}
              <div className="dashboard-card dashboard-card-highlight">
                <div className="dashboard-card-header">
                  <h2 className="dashboard-card-title">
                    <span className="card-title-icon">⚡</span>
                    Quick Actions
                  </h2>
                </div>
                <div className="dashboard-card-body">
                  <p className="dashboard-highlight-copy">
                    Manage your coaching practice from one place. Create availability slots so clients can book sessions with you in real time.
                  </p>
                  <div className="dashboard-badge-list">
                    <span className="dashboard-badge success">✓ {openSlots} open slots</span>
                    <span className="dashboard-badge booked">
                      📋 {bookedSlots} booked
                    </span>
                    <span className="dashboard-badge warning">👥 {sessions.length} clients</span>
                    {pendingCount > 0 && (
                      <span className="dashboard-badge" style={{ background: "rgba(245,158,11,0.10)", color: "#f59e0b", borderColor: "rgba(245,158,11,0.25)" }}>
                        📩 {pendingCount} pending requests
                      </span>
                    )}
                  </div>
                  <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
                    <button
                      className="dashboard-btn dashboard-btn-primary"
                      onClick={() => setActiveTab("availability")}
                    >
                      {Icons.plus} Create New Slot
                    </button>
                    <button
                      className="dashboard-btn dashboard-btn-secondary"
                      onClick={() => setActiveTab("bookings")}
                    >
                      {Icons.users} View Clients
                    </button>
                  </div>
                </div>
              </div>

              {/* Profile info card */}
              <div className="dashboard-card">
                <div className="dashboard-card-header">
                  <h2 className="dashboard-card-title">
                    <span className="card-title-icon">👤</span>
                    My Profile
                  </h2>
                  <span className="status-pill status-active">
                    {Icons.check} Active
                  </span>
                </div>
                <div className="dashboard-card-body">
                  <div className="dashboard-profile-grid">
                    <div>
                      <p className="dashboard-detail-label">Full Name</p>
                      <p className="dashboard-detail-value">{coachName || "—"}</p>
                    </div>
                    <div>
                      <p className="dashboard-detail-label">Email</p>
                      <p className="dashboard-detail-value">{coachEmail || "—"}</p>
                    </div>
                    <div>
                      <p className="dashboard-detail-label">Phone</p>
                      <p className="dashboard-detail-value">{coachPhone || "Not set"}</p>
                    </div>
                    <div>
                      <p className="dashboard-detail-label">Coaching Program</p>
                      <p className="dashboard-detail-value">{getProgramSummary(user?.programName)}</p>
                    </div>
                    <div>
                      <p className="dashboard-detail-label">Role</p>
                      <p className="dashboard-detail-value">
                        <span className="role-pill role-coach">Coach</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── AVAILABILITY ──────────────────────── */}
          {!isLoading && activeTab === "availability" && (
            <>
              {/* Create slot form */}
              <div className="dashboard-card">
                <div className="dashboard-card-header">
                  <h2 className="dashboard-card-title">
                    <span className="card-title-icon">➕</span>
                    Create Availability Slot
                  </h2>
                </div>
                <div className="dashboard-card-body">
                  <div className="dashboard-form">
                    <input
                      className="dashboard-form-full"
                      placeholder="Google Meet link (https://meet.google.com/...)"
                      value={slotForm.meetingLink}
                      onChange={(e) => setSlotForm({ ...slotForm, meetingLink: e.target.value })}
                    />
                    <select
                      value={slotForm.programName}
                      onChange={(e) => setSlotForm({ ...slotForm, programName: e.target.value })}
                    >
                      <option value="">Select Program</option>
                      {coachSlotPrograms.map((p) => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                    <div className="form-field">
                      <label className="form-label">Start Date & Time</label>
                      <input
                        type="datetime-local"
                        value={slotForm.bookingDate}
                        onChange={(e) => setSlotForm({ ...slotForm, bookingDate: e.target.value })}
                      />
                    </div>
                    <div className="form-field">
                      <label className="form-label">End Date & Time (optional)</label>
                      <input
                        type="datetime-local"
                        value={slotForm.bookingEndDate}
                        onChange={(e) => setSlotForm({ ...slotForm, bookingEndDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <button
                    className="dashboard-btn dashboard-btn-primary"
                    onClick={createCoachSlot}
                  >
                    {Icons.plus} Create Availability Slot
                  </button>
                </div>
              </div>

              {/* Slots list */}
              <div className="dashboard-card">
                <div className="dashboard-card-header">
                  <h2 className="dashboard-card-title">
                    <span className="card-title-icon">📅</span>
                    My Availability Slots
                  </h2>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span className="dashboard-badge success">{openSlots} open</span>
                    <span className="dashboard-badge booked">
                      {bookedSlots} booked
                    </span>
                  </div>
                </div>
                <div className="dashboard-card-body" style={{ padding: 0 }}>
                  {slots.length === 0 ? (
                    <div className="dashboard-empty">
                      <span className="dashboard-empty-icon">📅</span>
                      <p className="dashboard-empty-text">No availability slots yet</p>
                      <p className="dashboard-empty-sub">
                        Create your first slot above so clients can start booking sessions with you
                      </p>
                    </div>
                  ) : (
                    <div className="dashboard-table-wrapper" style={{ border: "none", borderRadius: 0 }}>
                      <table className="dashboard-table">
                        <thead>
                          <tr>
                            <th>Title</th>
                            <th>Program</th>
                            <th>Start</th>
                            <th>End</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {slots.map((slot) => (
                            <tr key={slot._id}>
                              <td className="td-name">{slot.title}</td>
                              <td style={{ color: "var(--text-secondary)" }}>{slot.programName}</td>
                              <td style={{ color: "var(--text-secondary)", fontSize: "12px" }}>
                                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                  {Icons.clock}
                                  {new Date(slot.bookingDate).toLocaleString([], {
                                    month: "short", day: "numeric",
                                    hour: "2-digit", minute: "2-digit"
                                  })}
                                </span>
                              </td>
                              <td style={{ color: "var(--text-secondary)", fontSize: "12px" }}>
                                {slot.bookingEndDate
                                  ? new Date(slot.bookingEndDate).toLocaleString([], {
                                      month: "short", day: "numeric",
                                      hour: "2-digit", minute: "2-digit"
                                    })
                                  : "—"}
                              </td>
                              <td><StatusPill status={slot.status} /></td>
                              <td>
                                <button
                                  className="dashboard-btn dashboard-btn-danger dashboard-btn-small"
                                  onClick={() => deleteSlot(slot._id, slot.status)}
                                  disabled={deletingId === slot._id || slot.status === "booked"}
                                  title={slot.status === "booked" ? "Cannot delete a booked slot" : "Delete slot"}
                                  style={{ opacity: slot.status === "booked" ? 0.4 : 1 }}
                                >
                                  {deletingId === slot._id ? "…" : <>{Icons.trash} Delete</>}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ── CLIENT BOOKINGS ───────────────────── */}
          {!isLoading && activeTab === "bookings" && (
            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <h2 className="dashboard-card-title">
                  <span className="card-title-icon">👥</span>
                  Client Bookings
                </h2>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
                  {sessions.length} clients
                </span>
              </div>
              <div className="dashboard-card-body" style={{ padding: 0 }}>
                {sessions.length === 0 ? (
                  <div className="dashboard-empty">
                    <span className="dashboard-empty-icon">👥</span>
                    <p className="dashboard-empty-text">No client bookings yet</p>
                    <p className="dashboard-empty-sub">
                      Create availability slots so clients can book sessions with you
                    </p>
                  </div>
                ) : (
                  <div className="dashboard-table-wrapper" style={{ border: "none", borderRadius: 0 }}>
                    <table className="dashboard-table">
                      <thead>
                        <tr>
                          <th>Client Name</th>
                          <th>Email</th>
                          <th>Program</th>
                          <th>Booking Date</th>
                          <th>Phone</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sessions.map((session) => (
                          <tr key={session._id}>
                            <td className="td-name">{session.fullName}</td>
                            <td className="td-email">{session.email}</td>
                            <td style={{ color: "var(--text-secondary)" }}>{session.programName}</td>
                            <td style={{ color: "var(--text-secondary)", fontSize: "12px" }}>{session.bookingTime}</td>
                            <td style={{ color: "var(--text-secondary)" }}>{session.phoneNumber || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── SESSION REQUESTS ────────────────────── */}
          {!isLoading && activeTab === "requests" && (
            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <h2 className="dashboard-card-title">
                  <span className="card-title-icon">📩</span>
                  Pending Session Requests
                </h2>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span className="dashboard-badge warning">{pendingCount} pending</span>
                </div>
              </div>
              <div className="dashboard-card-body" style={{ padding: 0 }}>
                {pendingRequests.length === 0 ? (
                  <div className="dashboard-empty">
                    <span className="dashboard-empty-icon">📩</span>
                    <p className="dashboard-empty-text">No pending session requests</p>
                    <p className="dashboard-empty-sub">
                      When clients request sessions with you, they'll appear here for your review
                    </p>
                  </div>
                ) : (
                  <div className="dashboard-table-wrapper" style={{ border: "none", borderRadius: 0 }}>
                    <table className="dashboard-table">
                      <thead>
                        <tr>
                          <th>Client</th>
                          <th>Email</th>
                          <th>Program</th>
                          <th>Message</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingRequests.map((request) => (
                          <tr key={request._id}>
                            <td className="td-name">
                              {request.fullName}
                              {request.createdAt && (
                                <span style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                                  {new Date(request.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                                </span>
                              )}
                            </td>
                            <td className="td-email">
                              {request.email}
                              <span style={{ display: "block", fontSize: 11, color: "var(--text-muted)" }}>
                                {request.phoneNumber}
                              </span>
                            </td>
                            <td style={{ color: "var(--text-secondary)" }}>{request.programName}</td>
                            <td style={{ color: "var(--text-secondary)", fontSize: "12px", maxWidth: 180 }}>
                              {request.message || <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>No message</span>}
                            </td>
                            <td>
                              <span className={`status-pill status-${request.status}`}>
                                {request.status === "pending" ? "⏳ Pending"
                                  : request.status === "approved" ? "✅ Approved"
                                  : "❌ Declined"}
                              </span>
                              {request.status === "approved" && request.scheduledTime && (
                                <span style={{ display: "block", fontSize: 11, color: "var(--accent)", marginTop: 4, fontWeight: 600 }}>
                                  📅 {request.scheduledTime}
                                </span>
                              )}
                            </td>
                            <td>
                              {request.status === "pending" && (
                                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                  {approvingId === request._id ? (
                                    <div className="approve-inline-form">
                                      <div className="form-field" style={{ marginBottom: 8 }}>
                                        <label className="form-label" style={{ fontSize: 11 }}>Session Time</label>
                                        <input
                                          type="datetime-local"
                                          value={approveForm.scheduledTime}
                                          onChange={(e) => setApproveForm({ ...approveForm, scheduledTime: e.target.value })}
                                          style={{ fontSize: 12, padding: "6px 8px" }}
                                        />
                                      </div>
                                      <div className="form-field" style={{ marginBottom: 8 }}>
                                        <label className="form-label" style={{ fontSize: 11 }}>Notes (optional)</label>
                                        <input
                                          type="text"
                                          placeholder="e.g. Meeting link, prep notes…"
                                          value={approveForm.coachNotes}
                                          onChange={(e) => setApproveForm({ ...approveForm, coachNotes: e.target.value })}
                                          style={{ fontSize: 12, padding: "6px 8px" }}
                                        />
                                      </div>
                                      <div style={{ display: "flex", gap: 6 }}>
                                        <div className="form-field" style={{ marginBottom: 8 }}>
                                          <label className="form-label" style={{ fontSize: 11 }}>Google Meet Link</label>
                                          <input
                                            type="url"
                                            placeholder="https://meet.google.com/..."
                                            value={approveForm.googleMeetingLink}
                                            onChange={(e) => setApproveForm({ ...approveForm, googleMeetingLink: e.target.value })}
                                            style={{ fontSize: 12, padding: "6px 8px" }}
                                          />
                                        </div>
                                        <div style={{ display: "flex", gap: 6 }}>
                                          <button
                                            className="dashboard-btn dashboard-btn-primary dashboard-btn-small"
                                            onClick={() => approveRequest(request._id)}
                                          >
                                            {Icons.check} Confirm
                                          </button>
                                          <button
                                            className="dashboard-btn dashboard-btn-secondary dashboard-btn-small"
                                            onClick={() => { setApprovingId(null); setApproveForm({ scheduledTime: "", coachNotes: "", googleMeetingLink: "" }); }}
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <button
                                        className="dashboard-btn dashboard-btn-primary dashboard-btn-small"
                                        onClick={() => { setApprovingId(request._id); setApproveForm({ scheduledTime: "", coachNotes: "", googleMeetingLink: "" }); }}
                                      >
                                        {Icons.check} Approve
                                      </button>
                                      <button
                                        className="dashboard-btn dashboard-btn-danger dashboard-btn-small"
                                        onClick={() => declineRequest(request._id)}
                                        disabled={decliningId === request._id}
                                      >
                                        {decliningId === request._id ? "…" : <>{Icons.trash} Decline</>}
                                      </button>
                                    </>
                                  )}
                                </div>
                              )}
                              {request.status !== "pending" && (
                                <span style={{ fontSize: 11, color: "var(--text-muted)", fontStyle: "italic" }}>—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── REJECTED REQUESTS ───────────────────── */}
          {!isLoading && activeTab === "rejected" && (
            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <h2 className="dashboard-card-title">
                  <span className="card-title-icon">❌</span>
                  Rejected Session Requests
                </h2>
                <span className="dashboard-badge error">
                  {declinedCount} rejected
                </span>
              </div>
              <div className="dashboard-card-body" style={{ padding: 0 }}>
                {declinedRequests.length === 0 ? (
                  <div className="dashboard-empty">
                    <span className="dashboard-empty-icon">❌</span>
                    <p className="dashboard-empty-text">No rejected requests</p>
                    <p className="dashboard-empty-sub">
                      Declined session requests will appear here
                    </p>
                  </div>
                ) : (
                  <div className="dashboard-table-wrapper" style={{ border: "none", borderRadius: 0 }}>
                    <table className="dashboard-table">
                      <thead>
                        <tr>
                          <th>Client</th>
                          <th>Email</th>
                          <th>Program</th>
                          <th>Message</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {declinedRequests.map((request) => (
                          <tr key={request._id}>
                            <td className="td-name">{request.fullName}</td>
                            <td className="td-email">{request.email}</td>
                            <td style={{ color: "var(--text-secondary)" }}>{request.programName}</td>
                            <td style={{ color: "var(--text-secondary)", fontSize: "12px", maxWidth: 180 }}>
                              {request.message || "—"}
                            </td>
                            <td>
                              <span className="status-pill status-declined">❌ Declined</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── SETTINGS ────────────────────────────── */}
          {!isLoading && activeTab === "settings" && (
            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <h2 className="dashboard-card-title">
                  <span className="card-title-icon">⚙️</span>
                  Account Settings
                </h2>
              </div>
              <div className="dashboard-card-body">
                <div className="dashboard-form">
                  <div className="form-field">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      value={settingsForm.fullName}
                      onChange={(e) => setSettingsForm({ ...settingsForm, fullName: e.target.value })}
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      value={settingsForm.email}
                      onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                      placeholder="your@email.com"
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      value={settingsForm.phone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                      placeholder="+1 555 000 0000"
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Languages</label>
                    <input
                      type="text"
                      value={settingsForm.languages}
                      onChange={(e) => setSettingsForm({ ...settingsForm, languages: e.target.value })}
                      placeholder="English, Kiswahili"
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Years of Experience</label>
                    <input
                      type="number"
                      min="0"
                      value={settingsForm.experience}
                      onChange={(e) => setSettingsForm({ ...settingsForm, experience: e.target.value })}
                      placeholder="8"
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Availability</label>
                    <select
                      value={settingsForm.availabilityType}
                      onChange={(e) => setSettingsForm({ ...settingsForm, availabilityType: e.target.value as "whole_week" | "selected_days" })}
                    >
                      <option value="whole_week">Whole week</option>
                      <option value="selected_days">Selected days</option>
                    </select>
                  </div>
                  {settingsForm.availabilityType === "selected_days" && (
                    <div className="form-field dashboard-form-full">
                      <label className="form-label">Available Days</label>
                      <div className="program-checkbox-group">
                        {WEEK_DAYS.map((day) => {
                          const checked = selectedDays.includes(day);
                          return (
                            <label className="program-checkbox" key={day}>
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => setSelectedDays((current) => current.includes(day) ? current.filter((item) => item !== day) : [...current, day])}
                              />
                              <span>{day}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  <div className="form-field">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      value={settingsForm.password}
                      onChange={(e) => setSettingsForm({ ...settingsForm, password: e.target.value })}
                      placeholder="Leave blank to keep current"
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      value={settingsForm.confirmPassword}
                      onChange={(e) => setSettingsForm({ ...settingsForm, confirmPassword: e.target.value })}
                      placeholder="Confirm new password"
                    />
                  </div>
                  <div className="form-field dashboard-form-full">
                    <label className="form-label">Profile Photo</label>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} />
                    {isUploadingPhoto ? <p style={{ marginTop: 8, color: "var(--text-secondary)" }}>Uploading photo…</p> : null}
                    {settingsForm.photo ? <p style={{ marginTop: 8, color: "#198754" }}>Photo ready to save.</p> : null}
                  </div>
                  <div className="form-field dashboard-form-full">
                    <label className="form-label">Coaching Programs Offered</label>
                    <div className="program-checkbox-group">
                      {programs.map((p) => (
                        <label className="program-checkbox" key={p.id}>
                          <input
                            type="checkbox"
                            checked={selectedProgramIds.includes(p.id)}
                            onChange={(e) => setProgramEnabled(p.id, e.target.checked)}
                          />
                          <span>{p.title}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  className="dashboard-btn dashboard-btn-primary"
                  onClick={saveSettings}
                  disabled={isSavingSettings || isUploadingPhoto}
                  style={{ marginTop: 8 }}
                >
                  {isSavingSettings ? "Saving…" : "Save Settings"}
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default CoachDashboard;





