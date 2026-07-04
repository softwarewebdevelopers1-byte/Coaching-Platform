import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Account, BookingSession, CoachSlot, ContactSubmission, PlatformAnalytics } from "../types";
import "../styles/Dashboard.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "https://coaching-platform-38p5.onrender.com";

interface AdminDashboardProps {
  showToast: (message: string, type: string, duration?: number) => void;
}

type AdminTab = "overview" | "accounts" | "coaches" | "bookings" | "leads";

const DEFAULT_ACCOUNT_PASSWORD = "Coach@123";

const COACH_PROGRAMS = [
  { id: "individual-executive", title: "Individual Executive Coaching" },
  { id: "group-executive", title: "Group Executive Coaching" },
  { id: "individual-executive,group-executive", title: "Individual and Group Coaching" },
];

/* ── SVG Icons ───────────────────────────────────────────────── */
const Icons = {
  grid: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  users: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  coach: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
  ),
  calendar: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  logout: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  shield: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  mail: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  ),
  link: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  ),
  copy: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  ),
  refresh: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10"/>
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
    </svg>
  ),
  plus: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  trash: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  ),
  edit: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
};

/* ── Status pill helper ──────────────────────────────────────── */
const StatusPill = ({ status }: { status: string }) => (
  <span className={`status-pill status-${status}`}>
    {status === "open" ? "Available" : status === "active" ? "Active" : status === "booked" ? "Booked" : status}
  </span>
);

const RolePill = ({ role }: { role: string }) => (
  <span className={`role-pill role-${role}`}>{role}</span>
);

/* ── Component ───────────────────────────────────────────────── */
const PasswordVisibilityIcon = ({ hidden }: { hidden: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {hidden ? (
      <>
        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.89 1 12a18.45 18.45 0 0 1 5.06-6.94" />
        <path d="M9.9 4.24A10.7 10.7 0 0 1 12 4c5 0 9.27 3.11 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <path d="M14.12 14.12A3 3 0 0 1 9.88 9.88" />
        <path d="M1 1l22 22" />
      </>
    ) : (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
        <circle cx="12" cy="12" r="3" />
      </>
    )}
  </svg>
);

const AdminDashboard: React.FC<AdminDashboardProps> = ({ showToast }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [navOpen, setNavOpen] = useState(false);
  const [showAccountPassword, setShowAccountPassword] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [slots, setSlots] = useState<CoachSlot[]>([]);
  const [sessions, setSessions] = useState<BookingSession[]>([]);
  const [contactLeads, setContactLeads] = useState<ContactSubmission[]>([]);
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [leadStatusFilter, setLeadStatusFilter] = useState<string>("");
  const [schedulingLeadId, setSchedulingLeadId] = useState<string | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    programName: "individual-executive",
    coachId: "",
    slotId: "",
    bookingTime: "",
    action: "book" as "book" | "slot_request",
  });
  const [accountForm, setAccountForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: DEFAULT_ACCOUNT_PASSWORD,
    programName: "individual-executive",
    role: "coach" as Account["role"],
    status: "active" as Account["status"],
  });
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);

  const totalCoaches = accounts.filter((a) => a.role === "coach").length;
  const activeAccounts = accounts.filter((a) => a.status === "active").length;
  const availableSlots = slots.filter((s) => s.status === "open").length;
  const disabledAccounts = accounts.filter((a) => a.status === "disabled").length;
  const newLeads = contactLeads.filter((lead) => lead.status === "new").length;
  const coachAccounts = accounts.filter((a) => a.role === "coach" && a.status === "active");

  const loadDashboardData = async () => {
    try {
      const leadQuery = leadStatusFilter ? `?status=${encodeURIComponent(leadStatusFilter)}` : "";
      const [accountsRes, slotsRes, sessionsRes, leadsRes, analyticsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/accounts`),
        fetch(`${API_BASE_URL}/api/bookings/coach-slots`),
        fetch(`${API_BASE_URL}/api/bookings/sessions`),
        fetch(`${API_BASE_URL}/api/contact${leadQuery}`),
        fetch(`${API_BASE_URL}/api/platform/analytics`),
      ]);
      if (accountsRes.ok) setAccounts((await accountsRes.json()).accounts || []);
      if (slotsRes.ok) setSlots((await slotsRes.json()).slots || []);
      if (sessionsRes.ok) setSessions((await sessionsRes.json()).sessions || []);
      if (leadsRes.ok) setContactLeads((await leadsRes.json()).submissions || []);
      if (analyticsRes.ok) setAnalytics((await analyticsRes.json()).analytics || null);
    } catch {
      showToast("Error loading dashboard data", "error", 5000);
    }
  };

  useEffect(() => { loadDashboardData(); }, [leadStatusFilter]);

  const updateLeadStatus = async (id: string, status: ContactSubmission["status"]) => {
    const res = await fetch(`${API_BASE_URL}/api/contact/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      showToast(`Lead marked as ${status}`, "success", 3500);
      loadDashboardData();
    } else {
      const error = await res.json().catch(() => null);
      showToast(error?.message || "Could not update lead", "error", 5000);
    }
  };

  const openSchedulePanel = async (lead: ContactSubmission) => {
    const defaultProgram =
      lead.programSlug ||
      (lead.interest === "Both"
        ? "both"
        : lead.interest === "Group Executive Coaching"
          ? "group-executive"
          : "individual-executive");

    setSchedulingLeadId(lead._id);
    setScheduleForm({
      programName: defaultProgram,
      coachId: lead.assignedCoachId || "",
      slotId: "",
      bookingTime: "",
      action: "book",
    });

    if (!lead.assignedCoachId) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/bookings/assign-coach`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            programName: defaultProgram,
            goals: lead.goals.split(/[,;\n]/).map((g) => g.trim()).filter(Boolean),
          }),
        });
        if (res.ok) {
          const result = await res.json();
          setScheduleForm((prev) => ({
            ...prev,
            coachId: result.coach?._id || "",
          }));
        }
      } catch {
        // Admin can still pick a coach manually.
      }
    }
  };

  const scheduleLead = async (lead: ContactSubmission) => {
    const coach = coachAccounts.find((account) => account._id === scheduleForm.coachId);
    if (!coach) {
      showToast("Select a coach before scheduling", "error", 4000);
      return;
    }

    const selectedSlot = slots.find((slot) => slot._id === scheduleForm.slotId);
    const bookingTime =
      scheduleForm.bookingTime ||
      (selectedSlot ? new Date(selectedSlot.bookingDate).toLocaleString() : "");

    const res = await fetch(`${API_BASE_URL}/api/contact/${lead._id}/schedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: scheduleForm.action,
        programName: scheduleForm.programName,
        coachId: coach._id,
        coachName: coach.fullName,
        coachEmail: coach.email,
        coachPhone: coach.phone || "",
        slotId: scheduleForm.slotId || undefined,
        bookingTime: scheduleForm.action === "book" ? bookingTime : undefined,
        message: lead.goals,
      }),
    });

    if (res.ok) {
      showToast(
        scheduleForm.action === "book"
          ? "Discovery call scheduled for lead"
          : "Slot request sent to coach",
        "success",
        4000,
      );
      setSchedulingLeadId(null);
      loadDashboardData();
    } else {
      const error = await res.json().catch(() => null);
      showToast(error?.message || "Could not schedule lead", "error", 5000);
    }
  };

  const copyBookingLink = (lead: ContactSubmission) => {
    const program =
      lead.programSlug ||
      (lead.interest === "Group Executive Coaching"
        ? "group-executive"
        : "individual-executive");
    const link = `${window.location.origin}/#discovery-call?email=${encodeURIComponent(lead.email)}&interest=${encodeURIComponent(program)}`;
    navigator.clipboard.writeText(link).then(() => {
      showToast("Booking link copied to clipboard", "success", 3500);
    });
  };

  const coachSlotsForSchedule = slots.filter(
    (slot) =>
      slot.status === "open" &&
      slot.coachId === scheduleForm.coachId &&
      slot.programName === scheduleForm.programName,
  );

  const resetAccountForm = () => {
    setAccountForm({
      fullName: "",
      email: "",
      phone: "",
      password: DEFAULT_ACCOUNT_PASSWORD,
      programName: "individual-executive",
      role: "coach",
      status: "active",
    });
    setEditingAccountId(null);
  };

  const saveAccount = async () => {
    const endpoint = editingAccountId
      ? `${API_BASE_URL}/api/accounts/${editingAccountId}`
      : `${API_BASE_URL}/api/accounts`;

    const payload: Record<string, unknown> = {
      fullName: accountForm.fullName,
      email: accountForm.email,
      phone: accountForm.phone,
      role: accountForm.role,
      status: accountForm.status,
      programName: accountForm.programName,
    };

    if (!editingAccountId || accountForm.password) {
      payload.password = accountForm.password;
    }

    const res = await fetch(endpoint, {
      method: editingAccountId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      showToast(
        editingAccountId ? "Account updated successfully" : "Account created successfully",
        "success",
        3500,
      );
      resetAccountForm();
      loadDashboardData();
    } else {
      const error = await res.json().catch(() => null);
      showToast(error?.message || "Error saving account", "error", 5000);
    }
  };

  const deleteAccount = async (id: string) => {
    if (!confirm("Delete this account? This cannot be undone.")) return;
    const res = await fetch(`${API_BASE_URL}/api/accounts/${id}`, { method: "DELETE" });
    if (res.ok) { showToast("Account deleted", "success", 3500); loadDashboardData(); }
  };

  const createInvite = async () => {
    const res = await fetch(`${API_BASE_URL}/api/accounts/coach-invites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail, createdBy: user?.fullName || "admin", baseUrl: window.location.origin }),
    });
    const result = await res.json();
    if (res.ok) { setInviteLink(result.link); showToast("Invite link created", "success", 4000); }
  };

  const copyInvite = () => {
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const initials = user?.fullName?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() || "AD";

  const navItems = [
    { id: "overview", label: "Overview", icon: Icons.grid },
    { id: "leads", label: "Contact Leads", icon: Icons.mail },
    { id: "accounts", label: "Accounts", icon: Icons.users },
    { id: "coaches", label: "Coaches", icon: Icons.coach },
    { id: "bookings", label: "Bookings", icon: Icons.calendar },
  ];

  const tabTitles: Record<AdminTab, { title: string; subtitle: string }> = {
    overview: { title: "Dashboard Overview", subtitle: "Platform health at a glance" },
    leads: { title: "Contact Leads", subtitle: "Review enquiries and schedule discovery calls" },
    accounts: { title: "Account Management", subtitle: "Create and manage platform accounts" },
    coaches: { title: "Coach Management", subtitle: "Invite coaches and view availability slots" },
    bookings: { title: "Booking Sessions", subtitle: "All user booking sessions across the platform" },
  };

  return (
    <div className={`dashboard-wrapper admin-dashboard-wrapper ${navOpen ? "dashboard-nav-open" : ""}`}>
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
      <aside className="dashboard-sidebar admin-sidebar">
        {/* Header */}
        <div className="dashboard-sidebar-header">
          <div className="dashboard-sidebar-title">
            <div className="dashboard-sidebar-icon">{Icons.shield}</div>
            Admin Panel
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
                  onClick={() => {
                    setActiveTab(item.id as AdminTab);
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
            <span className="topbar-badge topbar-badge-admin">
              {Icons.shield} Administrator
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
                  <div className="stat-card-icon">👥</div>
                  <p className="stat-card-label">Total Accounts</p>
                  <p className="stat-card-value">{accounts.length}</p>
                  <p className="stat-card-change">{totalCoaches} coaches registered</p>
                </div>
                <div className="stat-card">
                  <div className="stat-card-icon">📅</div>
                  <p className="stat-card-label">Booking Slots</p>
                  <p className="stat-card-value">{slots.length}</p>
                  <p className="stat-card-change positive">↑ {availableSlots} available</p>
                </div>
                <div className="stat-card">
                  <div className="stat-card-icon">📋</div>
                  <p className="stat-card-label">Total Sessions</p>
                  <p className="stat-card-value">{sessions.length}</p>
                  <p className="stat-card-change">Active bookings</p>
                </div>
                <div className="stat-card">
                  <div className="stat-card-icon">✅</div>
                  <p className="stat-card-label">Active Accounts</p>
                  <p className="stat-card-value">{activeAccounts}</p>
                  <p className="stat-card-change negative">↓ {disabledAccounts} disabled</p>
                </div>
                <div className="stat-card">
                  <div className="stat-card-icon">📨</div>
                  <p className="stat-card-label">Contact Leads</p>
                  <p className="stat-card-value">{analytics?.contactLeads ?? contactLeads.length}</p>
                  <p className="stat-card-change">{newLeads} awaiting follow-up</p>
                </div>
                <div className="stat-card">
                  <div className="stat-card-icon">📈</div>
                  <p className="stat-card-label">Lead Conversion</p>
                  <p className="stat-card-value">
                    {analytics
                      ? `${Math.round(analytics.leadToBookingConversionRate * 100)}%`
                      : "—"}
                  </p>
                  <p className="stat-card-change positive">
                    {analytics?.leadsByStatus.scheduled ?? 0} scheduled from contact
                  </p>
                </div>
              </div>

              {analytics && (
                <div className="dashboard-card">
                  <div className="dashboard-card-header">
                    <h2 className="dashboard-card-title">
                      <span className="card-title-icon">📊</span>
                      Lead Intelligence
                    </h2>
                  </div>
                  <div className="dashboard-card-body">
                    <div className="dashboard-badge-list">
                      <span className="dashboard-badge success">
                        Individual: {analytics.leadsByInterest.individual}
                      </span>
                      <span className="dashboard-badge warning">
                        Group: {analytics.leadsByInterest.group}
                      </span>
                      <span className="dashboard-badge">
                        Both: {analytics.leadsByInterest.both}
                      </span>
                      <span className="dashboard-badge success">
                        Scheduled: {analytics.leadsByStatus.scheduled}
                      </span>
                      <span className="dashboard-badge error">
                        Closed: {analytics.leadsByStatus.closed}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="dashboard-card dashboard-card-highlight">
                <div className="dashboard-card-header">
                  <h2 className="dashboard-card-title">
                    <span className="card-title-icon">🔍</span>
                    Platform Health
                  </h2>
                </div>
                <div className="dashboard-card-body">
                  <p className="dashboard-highlight-copy">
                    Full platform visibility: monitor team capacity, open slots, and session activity — all in one place. Stay on top of your coaching operations with real-time metrics.
                  </p>
                  <div className="dashboard-badge-list">
                    <span className="dashboard-badge success">✓ {activeAccounts} active accounts</span>
                    <span className="dashboard-badge warning">⏳ {availableSlots} open slots</span>
                    <span className="dashboard-badge error">⚠ {disabledAccounts} under review</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── ACCOUNTS TAB ──────────────────────── */}
          {activeTab === "accounts" && (
            <>
              <div className="dashboard-card">
                <div className="dashboard-card-header">
                  <h2 className="dashboard-card-title">
                    <span className="card-title-icon">➕</span>
                    {editingAccountId ? "Edit Account" : "Create New Account"}
                  </h2>
                  {editingAccountId && (
                    <button
                      className="dashboard-btn dashboard-btn-secondary dashboard-btn-small"
                      onClick={resetAccountForm}
                    >
                      Cancel edit
                    </button>
                  )}
                </div>
                <div className="dashboard-card-body">
                  <div className="dashboard-form">
                    <input
                      placeholder="Full name"
                      value={accountForm.fullName}
                      onChange={(e) => setAccountForm({ ...accountForm, fullName: e.target.value })}
                    />
                    <input
                      placeholder="Email address"
                      type="email"
                      value={accountForm.email}
                      onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                    />
                    <input
                      placeholder="Phone number"
                      value={accountForm.phone}
                      onChange={(e) => setAccountForm({ ...accountForm, phone: e.target.value })}
                    />
                    <div className="password-input-wrapper">
                      <input
                        placeholder={editingAccountId ? "New password (leave blank to keep current)" : "Password"
                        }
                        type={showAccountPassword ? "text" : "password"}
                        value={accountForm.password}
                        onChange={(e) => setAccountForm({ ...accountForm, password: e.target.value })}
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        aria-label={showAccountPassword ? "Hide password" : "Show password"}
                        title={showAccountPassword ? "Hide password" : "Show password"}
                        onClick={() => setShowAccountPassword((value) => !value)}
                      >
                        <PasswordVisibilityIcon hidden={showAccountPassword} />
                      </button>
                    </div>
                    {editingAccountId ? (
                      <p className="dashboard-field-note">
                        Leave this blank to retain the existing password.
                      </p>
                    ) : null}
                    {accountForm.role === "coach" && (
                      <select
                        value={accountForm.programName}
                        onChange={(e) => setAccountForm({ ...accountForm, programName: e.target.value })}
                      >
                        {COACH_PROGRAMS.map((program) => (
                          <option key={program.id} value={program.id}>
                            {program.title}
                          </option>
                        ))}
                      </select>
                    )}
                    <select
                      value={accountForm.role}
                      onChange={(e) => {
                        const newRole = e.target.value as Account["role"];
                        setAccountForm({
                          ...accountForm,
                          role: newRole,
                          password: editingAccountId
                            ? accountForm.password
                            : accountForm.password || DEFAULT_ACCOUNT_PASSWORD,
                        });
                      }}
                    >
                      <option value="user">User</option>
                      <option value="coach">Coach</option>
                      <option value="admin">Admin</option>
                    </select>
                    <select
                      value={accountForm.status}
                      onChange={(e) => setAccountForm({ ...accountForm, status: e.target.value as Account["status"] })}
                    >
                      <option value="active">Active</option>
                      <option value="disabled">Disabled</option>
                    </select>
                  </div>
                  <button className="dashboard-btn dashboard-btn-primary" onClick={saveAccount}>
                    {editingAccountId ? Icons.edit : Icons.plus} {editingAccountId ? "Update Account" : "Create Account"}
                  </button>
                </div>
              </div>

              <div className="dashboard-card">
                <div className="dashboard-card-header">
                  <h2 className="dashboard-card-title">
                    <span className="card-title-icon">👥</span>
                    All Accounts
                  </h2>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
                    {accounts.length} total
                  </span>
                </div>
                <div className="dashboard-card-body" style={{ padding: 0 }}>
                  {accounts.length === 0 ? (
                    <div className="dashboard-empty">
                      <span className="dashboard-empty-icon">👤</span>
                      <p className="dashboard-empty-text">No accounts yet</p>
                      <p className="dashboard-empty-sub">Create the first account above</p>
                    </div>
                  ) : (
                    <div className="dashboard-table-wrapper" style={{ border: "none", borderRadius: 0 }}>
                      <table className="dashboard-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {accounts.map((account) => (
                            <tr key={account._id}>
                              <td className="td-name">{account.fullName}</td>
                              <td className="td-email">{account.email}</td>
                              <td><RolePill role={account.role} /></td>
                              <td><StatusPill status={account.status} /></td>
                              <td>
                                <div className="td-actions">
                                  <button
                                    className="dashboard-btn dashboard-btn-secondary dashboard-btn-small"
                                    onClick={() => {
                                      setEditingAccountId(account._id);
                                      setAccountForm({
                                        fullName: account.fullName,
                                        email: account.email,
                                        phone: account.phone || "",
                                        password: "",
                                        programName: account.programName || "individual-executive",
                                        role: account.role,
                                        status: account.status,
                                      });
                                      window.scrollTo({ top: 0, behavior: "smooth" });
                                    }}
                                  >
                                    {Icons.edit} Edit
                                  </button>
                                  <button
                                    className="dashboard-btn dashboard-btn-danger dashboard-btn-small"
                                    onClick={() => deleteAccount(account._id)}
                                  >
                                    {Icons.trash} Delete
                                  </button>
                                </div>
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

          {/* ── COACHES TAB ───────────────────────── */}
          {activeTab === "coaches" && (
            <>
              <div className="dashboard-card">
                <div className="dashboard-card-header">
                  <h2 className="dashboard-card-title">
                    <span className="card-title-icon">✉️</span>
                    Send Coach Invite
                  </h2>
                </div>
                <div className="dashboard-card-body">
                  <div className="dashboard-form">
                    <input
                      placeholder="Coach email address"
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="dashboard-form-full"
                    />
                  </div>
                  <button className="dashboard-btn dashboard-btn-primary" onClick={createInvite}>
                    {Icons.link} Generate Invite Link
                  </button>

                  {inviteLink && (
                    <div className="dashboard-alert dashboard-alert-success" style={{ marginTop: "20px", flexDirection: "column", gap: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <strong style={{ fontSize: "13px" }}>✓ Invite link generated</strong>
                        <button
                          className="dashboard-btn dashboard-btn-secondary dashboard-btn-small"
                          onClick={copyInvite}
                          style={{ padding: "5px 10px" }}
                        >
                          {Icons.copy} {copied ? "Copied!" : "Copy"}
                        </button>
                      </div>
                      <div className="invite-link-box">{inviteLink}</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="dashboard-card">
                <div className="dashboard-card-header">
                  <h2 className="dashboard-card-title">
                    <span className="card-title-icon">📅</span>
                    Coach Availability Slots
                  </h2>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
                    {slots.length} slots
                  </span>
                </div>
                <div className="dashboard-card-body" style={{ padding: 0 }}>
                  {slots.length === 0 ? (
                    <div className="dashboard-empty">
                      <span className="dashboard-empty-icon">📅</span>
                      <p className="dashboard-empty-text">No availability slots yet</p>
                      <p className="dashboard-empty-sub">Slots appear when coaches create availability</p>
                    </div>
                  ) : (
                    <div className="dashboard-table-wrapper" style={{ border: "none", borderRadius: 0 }}>
                      <table className="dashboard-table">
                        <thead>
                          <tr>
                            <th>Title</th>
                            <th>Coach</th>
                            <th>Program</th>
                            <th>Date & Time</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {slots.map((slot) => (
                            <tr key={slot._id}>
                              <td className="td-name">{slot.title}</td>
                              <td>{slot.coachName}</td>
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

          {/* ── CONTACT LEADS TAB ──────────────────────── */}
          {activeTab === "leads" && (
            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <h2 className="dashboard-card-title">
                  <span className="card-title-icon">📨</span>
                  Contact Form Leads
                </h2>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <select
                    value={leadStatusFilter}
                    onChange={(e) => setLeadStatusFilter(e.target.value)}
                    style={{ padding: "6px 10px", fontSize: "12px", borderRadius: "8px" }}
                  >
                    <option value="">All statuses</option>
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="converted">Converted</option>
                    <option value="closed">Closed</option>
                  </select>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
                    {contactLeads.length} leads
                  </span>
                </div>
              </div>
              <div className="dashboard-card-body" style={{ padding: 0 }}>
                {contactLeads.length === 0 ? (
                  <div className="dashboard-empty">
                    <span className="dashboard-empty-icon">📨</span>
                    <p className="dashboard-empty-text">No contact leads yet</p>
                    <p className="dashboard-empty-sub">
                      Submissions from the contact form will appear here
                    </p>
                  </div>
                ) : (
                  <div className="dashboard-table-wrapper" style={{ border: "none", borderRadius: 0 }}>
                    <table className="dashboard-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Contact</th>
                          <th>Interest</th>
                          <th>Goals</th>
                          <th>Status</th>
                          <th>Submitted</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contactLeads.map((lead) => (
                          <React.Fragment key={lead._id}>
                            <tr>
                              <td className="td-name">{lead.name}</td>
                              <td>
                                <div className="td-email">{lead.email}</div>
                                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                                  {lead.phone}
                                </div>
                              </td>
                              <td style={{ color: "var(--text-secondary)", fontSize: "12px" }}>
                                {lead.interest}
                              </td>
                              <td
                                style={{
                                  color: "var(--text-secondary)",
                                  fontSize: "12px",
                                  maxWidth: "220px",
                                }}
                                title={lead.goals}
                              >
                                {lead.goals.length > 80
                                  ? `${lead.goals.slice(0, 80)}…`
                                  : lead.goals}
                              </td>
                              <td><StatusPill status={lead.status} /></td>
                              <td style={{ color: "var(--text-secondary)", fontSize: "12px" }}>
                                {lead.createdAt
                                  ? new Date(lead.createdAt).toLocaleString()
                                  : "—"}
                              </td>
                              <td>
                                <div className="lead-actions">
                                  {lead.status === "new" && (
                                    <button
                                      className="dashboard-btn dashboard-btn-secondary dashboard-btn-small"
                                      onClick={() => updateLeadStatus(lead._id, "contacted")}
                                    >
                                      Mark contacted
                                    </button>
                                  )}
                                  {lead.status !== "scheduled" && lead.status !== "closed" && (
                                    <button
                                      className="dashboard-btn dashboard-btn-primary dashboard-btn-small"
                                      onClick={() => openSchedulePanel(lead)}
                                    >
                                      Schedule
                                    </button>
                                  )}
                                  <button
                                    className="dashboard-btn dashboard-btn-secondary dashboard-btn-small"
                                    onClick={() => copyBookingLink(lead)}
                                  >
                                    Copy link
                                  </button>
                                  {lead.status !== "closed" && lead.status !== "converted" && (
                                    <button
                                      className="dashboard-btn dashboard-btn-secondary dashboard-btn-small"
                                      onClick={() => updateLeadStatus(lead._id, "closed")}
                                    >
                                      Close
                                    </button>
                                  )}
                                  {lead.status === "scheduled" && (
                                    <button
                                      className="dashboard-btn dashboard-btn-secondary dashboard-btn-small"
                                      onClick={() => updateLeadStatus(lead._id, "converted")}
                                    >
                                      Mark converted
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                            {schedulingLeadId === lead._id && (
                              <tr>
                                <td colSpan={7}>
                                  <div className="lead-schedule-panel">
                                    <strong>Schedule discovery call for {lead.name}</strong>
                                    <select
                                      value={scheduleForm.programName}
                                      onChange={(e) =>
                                        setScheduleForm({
                                          ...scheduleForm,
                                          programName: e.target.value,
                                          slotId: "",
                                        })
                                      }
                                    >
                                      <option value="individual-executive">
                                        Individual Executive Coaching
                                      </option>
                                      <option value="group-executive">
                                        Group Executive Coaching
                                      </option>
                                      <option value="both">Both</option>
                                    </select>
                                    <select
                                      value={scheduleForm.coachId}
                                      onChange={(e) =>
                                        setScheduleForm({
                                          ...scheduleForm,
                                          coachId: e.target.value,
                                          slotId: "",
                                        })
                                      }
                                    >
                                      <option value="">Select coach</option>
                                      {coachAccounts.map((coach) => (
                                        <option key={coach._id} value={coach._id}>
                                          {coach.fullName}
                                        </option>
                                      ))}
                                    </select>
                                    <select
                                      value={scheduleForm.action}
                                      onChange={(e) =>
                                        setScheduleForm({
                                          ...scheduleForm,
                                          action: e.target.value as "book" | "slot_request",
                                        })
                                      }
                                    >
                                      <option value="book">Book open slot</option>
                                      <option value="slot_request">
                                        Request slot from coach
                                      </option>
                                    </select>
                                    {scheduleForm.action === "book" && (
                                      <>
                                        <select
                                          value={scheduleForm.slotId}
                                          onChange={(e) => {
                                            const slot = coachSlotsForSchedule.find(
                                              (item) => item._id === e.target.value,
                                            );
                                            setScheduleForm({
                                              ...scheduleForm,
                                              slotId: e.target.value,
                                              bookingTime: slot
                                                ? new Date(slot.bookingDate).toLocaleString()
                                                : scheduleForm.bookingTime,
                                            });
                                          }}
                                        >
                                          <option value="">Select open slot</option>
                                          {coachSlotsForSchedule.map((slot) => (
                                            <option key={slot._id} value={slot._id}>
                                              {slot.title} —{" "}
                                              {new Date(slot.bookingDate).toLocaleString()}
                                            </option>
                                          ))}
                                        </select>
                                        <input
                                          type="text"
                                          placeholder="Or enter booking time manually"
                                          value={scheduleForm.bookingTime}
                                          onChange={(e) =>
                                            setScheduleForm({
                                              ...scheduleForm,
                                              bookingTime: e.target.value,
                                            })
                                          }
                                        />
                                      </>
                                    )}
                                    <div className="lead-actions">
                                      <button
                                        className="dashboard-btn dashboard-btn-primary dashboard-btn-small"
                                        onClick={() => scheduleLead(lead)}
                                      >
                                        Confirm scheduling
                                      </button>
                                      <button
                                        className="dashboard-btn dashboard-btn-secondary dashboard-btn-small"
                                        onClick={() => setSchedulingLeadId(null)}
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── BOOKINGS TAB ──────────────────────── */}
          {activeTab === "bookings" && (
            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <h2 className="dashboard-card-title">
                  <span className="card-title-icon">📋</span>
                  User Booking Sessions
                </h2>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
                  {sessions.length} sessions
                </span>
              </div>
              <div className="dashboard-card-body" style={{ padding: 0 }}>
                {sessions.length === 0 ? (
                  <div className="dashboard-empty">
                    <span className="dashboard-empty-icon">📋</span>
                    <p className="dashboard-empty-text">No bookings yet</p>
                    <p className="dashboard-empty-sub">Booking sessions will appear here</p>
                  </div>
                ) : (
                  <div className="dashboard-table-wrapper" style={{ border: "none", borderRadius: 0 }}>
                    <table className="dashboard-table">
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>Email</th>
                          <th>Coach</th>
                          <th>Program</th>
                          <th>Booking Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sessions.map((session) => (
                          <tr key={session._id}>
                            <td className="td-name">{session.fullName}</td>
                            <td className="td-email">{session.email}</td>
                            <td>{session.coachName || "—"}</td>
                            <td style={{ color: "var(--text-secondary)" }}>{session.programName}</td>
                            <td style={{ color: "var(--text-secondary)", fontSize: "12px" }}>{session.bookingTime}</td>
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

export default AdminDashboard;

