import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { BookingSession, Coach, CoachSlot, Program } from "../types";
import "../styles/Dashboard.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8000";

interface CoachDashboardProps {
  coaches: Coach[];
  programs: Program[];
  showToast: (message: string, type: string, duration?: number) => void;
}

type CoachTab = "overview" | "availability" | "bookings";

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
  star: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  check: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
};

/* ── Status pill helper ──────────────────────────────────────── */
const StatusPill = ({ status }: { status: string }) => (
  <span className={`status-pill status-${status}`}>
    {status === "open" ? "Available" : status === "booked" ? "Booked" : status}
  </span>
);

/* ── Component ───────────────────────────────────────────────── */
const CoachDashboard: React.FC<CoachDashboardProps> = ({ coaches, programs, showToast }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<CoachTab>("overview");
  const [slots, setSlots] = useState<CoachSlot[]>([]);
  const [sessions, setSessions] = useState<BookingSession[]>([]);
  const [slotForm, setSlotForm] = useState({
    title: "",
    programName: programs[0]?.title || "",
    bookingDate: "",
    bookingEndDate: "",
  });

  const selectedCoach = useMemo(
    () => coaches.find((c) => c.email === user?.email) || coaches[0],
    [coaches, user?.email],
  );

  const loadDashboardData = async () => {
    try {
      const [slotsRes, sessionsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/bookings/coach-slots`),
        fetch(`${API_BASE_URL}/api/bookings/sessions`),
      ]);

      if (slotsRes.ok) {
        const data = await slotsRes.json();
        setSlots(
          (data.slots || []).filter(
            (s: CoachSlot) => s.coachEmail === user?.email || s.coachId === String(selectedCoach?.id),
          ),
        );
      }
      if (sessionsRes.ok) {
        const data = await sessionsRes.json();
        setSessions(
          (data.sessions || []).filter(
            (s: BookingSession) => s.coachEmail === user?.email || s.coachId === String(selectedCoach?.id),
          ),
        );
      }
    } catch {
      showToast("Error loading dashboard data", "error", 5000);
    }
  };

  useEffect(() => { loadDashboardData(); }, [user?.email, selectedCoach?.id]);

  const createCoachSlot = async () => {
    if (!selectedCoach) { showToast("Coach information not found", "error", 4000); return; }
    const res = await fetch(`${API_BASE_URL}/api/bookings/coach-slots`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        coachId: String(selectedCoach.id),
        coachName: selectedCoach.name,
        coachEmail: selectedCoach.email,
        programName: slotForm.programName,
        title: slotForm.title,
        bookingDate: slotForm.bookingDate,
        bookingEndDate: slotForm.bookingEndDate,
      }),
    });

    if (res.ok) {
      setSlotForm({ title: "", programName: programs[0]?.title || "", bookingDate: "", bookingEndDate: "" });
      loadDashboardData();
      showToast("Availability slot created", "success", 4000);
    } else {
      showToast("Error creating slot", "error", 5000);
    }
  };

  const openSlots = slots.filter((s) => s.status === "open").length;
  const bookedSlots = slots.filter((s) => s.status === "booked").length;

  const initials = user?.fullName?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() || "CO";

  const navItems = [
    { id: "overview", label: "Overview", icon: Icons.grid },
    { id: "availability", label: "My Availability", icon: Icons.calendar },
    { id: "bookings", label: "Client Bookings", icon: Icons.users },
  ];

  const tabTitles: Record<CoachTab, { title: string; subtitle: string }> = {
    overview: { title: "Coach Dashboard", subtitle: "Your coaching performance at a glance" },
    availability: { title: "Manage Availability", subtitle: "Create and manage your coaching slots" },
    bookings: { title: "Client Bookings", subtitle: "All clients who booked sessions with you" },
  };

  return (
    <div className="dashboard-wrapper coach-dashboard-wrapper">
      {/* ── Sidebar ─────────────────────────────── */}
      <aside className="dashboard-sidebar coach-sidebar">
        {/* Header */}
        <div className="dashboard-sidebar-header">
          <div className="dashboard-sidebar-title">
            <div className="dashboard-sidebar-icon">{Icons.award}</div>
            Coach Portal
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: "auto" }}>
          <p className="sidebar-section-label">Navigation</p>
          <ul className="dashboard-sidebar-nav">
            {navItems.map((item) => (
              <li key={item.id} className="dashboard-sidebar-item">
                <button
                  className={`dashboard-sidebar-link ${activeTab === item.id ? "active" : ""}`}
                  onClick={() => setActiveTab(item.id as CoachTab)}
                >
                  <span className="sidebar-active-indicator" />
                  <span className="dashboard-sidebar-link-icon">{item.icon}</span>
                  <span className="sidebar-link-label">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="dashboard-sidebar-footer">
          <div className="dashboard-user-info">
            <div className="dashboard-user-avatar">{initials}</div>
            <div className="dashboard-user-text">
              <p className="dashboard-user-name">Logged in as</p>
              <p className="dashboard-user-email">{user?.fullName}</p>
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

        {/* Content */}
        <div className="dashboard-content">

          {/* ── OVERVIEW TAB ──────────────────────── */}
          {activeTab === "overview" && (
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
                  <p className="stat-card-change">{sessions.length} clients</p>
                </div>
                <div className="stat-card">
                  <div className="stat-card-icon">🎯</div>
                  <p className="stat-card-label">Specialization</p>
                  <p className="stat-card-value custom-text-size">
                    {selectedCoach?.specialization || "N/A"}
                  </p>
                  <p className="stat-card-change">{selectedCoach?.experience}+ years exp.</p>
                </div>
                <div className="stat-card">
                  <div className="stat-card-icon" style={{ color: "#f59e0b" }}>{Icons.star}</div>
                  <p className="stat-card-label">Rating</p>
                  <p className="stat-card-value">{selectedCoach?.rating || "—"}</p>
                  <p className="stat-card-change">From client reviews</p>
                </div>
              </div>

              <div className="dashboard-card dashboard-profile-card">
                <div className="dashboard-card-header">
                  <h2 className="dashboard-card-title">
                    <span className="card-title-icon">👤</span>
                    Coach Profile
                  </h2>
                  <span className="status-pill status-active">
                    {Icons.check} Active
                  </span>
                </div>
                <div className="dashboard-card-body">
                  <div className="dashboard-profile-grid">
                    <div>
                      <p className="dashboard-detail-label">Full Name</p>
                      <p className="dashboard-detail-value">{selectedCoach?.name}</p>
                    </div>
                    <div>
                      <p className="dashboard-detail-label">Email</p>
                      <p className="dashboard-detail-value">{selectedCoach?.email}</p>
                    </div>
                    <div>
                      <p className="dashboard-detail-label">Phone</p>
                      <p className="dashboard-detail-value">{selectedCoach?.phone || "—"}</p>
                    </div>
                    <div>
                      <p className="dashboard-detail-label">Experience</p>
                      <p className="dashboard-detail-value">{selectedCoach?.experience}+ years</p>
                    </div>
                  </div>

                  {selectedCoach?.bio && (
                    <div className="dashboard-detail-block">
                      <p className="dashboard-detail-label">Bio</p>
                      <p className="dashboard-detail-copy">{selectedCoach.bio}</p>
                    </div>
                  )}

                  {selectedCoach?.tags && selectedCoach.tags.length > 0 && (
                    <div className="dashboard-detail-block">
                      <p className="dashboard-detail-label">Specialties</p>
                      <div className="dashboard-chip-list">
                        {selectedCoach.tags.map((tag) => (
                          <span key={tag} className="dashboard-chip">{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ── AVAILABILITY TAB ──────────────────── */}
          {activeTab === "availability" && (
            <>
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
                      placeholder="Session title (e.g. 'One-on-one coaching session')"
                      value={slotForm.title}
                      onChange={(e) => setSlotForm({ ...slotForm, title: e.target.value })}
                    />
                    <select
                      value={slotForm.programName}
                      onChange={(e) => setSlotForm({ ...slotForm, programName: e.target.value })}
                    >
                      <option value="">Select Program</option>
                      {programs.map((p) => (
                        <option key={p.id} value={p.title}>{p.title}</option>
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
                      <label className="form-label">End Date & Time</label>
                      <input
                        type="datetime-local"
                        value={slotForm.bookingEndDate}
                        onChange={(e) => setSlotForm({ ...slotForm, bookingEndDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <button className="dashboard-btn dashboard-btn-primary" onClick={createCoachSlot}>
                    {Icons.plus} Create Availability
                  </button>
                </div>
              </div>

              <div className="dashboard-card">
                <div className="dashboard-card-header">
                  <h2 className="dashboard-card-title">
                    <span className="card-title-icon">📅</span>
                    My Availability Slots
                  </h2>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span className="dashboard-badge success">{openSlots} open</span>
                    <span className="dashboard-badge" style={{ background: "rgba(99,102,241,0.10)", color: "#6366f1", borderColor: "rgba(99,102,241,0.25)" }}>{bookedSlots} booked</span>
                  </div>
                </div>
                <div className="dashboard-card-body" style={{ padding: 0 }}>
                  {slots.length === 0 ? (
                    <div className="dashboard-empty">
                      <span className="dashboard-empty-icon">📅</span>
                      <p className="dashboard-empty-text">No availability slots yet</p>
                      <p className="dashboard-empty-sub">Create your first slot above to start accepting bookings</p>
                    </div>
                  ) : (
                    <div className="dashboard-table-wrapper" style={{ border: "none", borderRadius: 0 }}>
                      <table className="dashboard-table">
                        <thead>
                          <tr>
                            <th>Title</th>
                            <th>Program</th>
                            <th>Date & Time</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {slots.map((slot) => (
                            <tr key={slot._id}>
                              <td className="td-name">{slot.title}</td>
                              <td style={{ color: "var(--text-secondary)" }}>{slot.programName}</td>
                              <td style={{ color: "var(--text-secondary)", fontSize: "12px" }}>
                                {new Date(slot.bookingDate).toLocaleString()}
                              </td>
                              <td><StatusPill status={slot.status} /></td>
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

          {/* ── BOOKINGS TAB ──────────────────────── */}
          {activeTab === "bookings" && (
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
                    <p className="dashboard-empty-sub">Create availability slots so clients can book sessions with you</p>
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

        </div>
      </main>
    </div>
  );
};

export default CoachDashboard;
