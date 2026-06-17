import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Account, BookingSession, CoachSlot } from "../types";
import "../styles/Dashboard.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8000";

interface AdminDashboardProps {
  showToast: (message: string, type: string, duration?: number) => void;
}

type AdminTab = "overview" | "accounts" | "coaches" | "bookings";

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  showToast,
}) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [slots, setSlots] = useState<CoachSlot[]>([]);
  const [sessions, setSessions] = useState<BookingSession[]>([]);
  const [accountForm, setAccountForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "coach" as Account["role"],
    status: "active" as Account["status"],
  });

  const totalCoaches = accounts.filter((account) => account.role === "coach").length;
  const activeAccounts = accounts.filter((account) => account.status === "active").length;
  const availableSlots = slots.filter((slot) => slot.status === "open").length;
  const disabledAccounts = accounts.filter((account) => account.status === "disabled").length;
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLink, setInviteLink] = useState("");

  const loadDashboardData = async () => {
    try {
      const [accountsResponse, slotsResponse, sessionsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/accounts`),
        fetch(`${API_BASE_URL}/api/bookings/coach-slots`),
        fetch(`${API_BASE_URL}/api/bookings/sessions`),
      ]);

      if (accountsResponse.ok) {
        const data = await accountsResponse.json();
        setAccounts(data.accounts || []);
      }
      if (slotsResponse.ok) {
        const data = await slotsResponse.json();
        setSlots(data.slots || []);
      }
      if (sessionsResponse.ok) {
        const data = await sessionsResponse.json();
        setSessions(data.sessions || []);
      }
    } catch {
      showToast("Error loading dashboard data", "error", 5000);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const saveAccount = async () => {
    const response = await fetch(`${API_BASE_URL}/api/accounts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(accountForm),
    });

    if (response.ok) {
      showToast("Account saved successfully", "success", 3500);
      setAccountForm({
        fullName: "",
        email: "",
        phone: "",
        role: "coach",
        status: "active",
      });
      loadDashboardData();
    } else {
      showToast("Error saving account", "error", 5000);
    }
  };

  const deleteAccount = async (accountId: string) => {
    if (confirm("Are you sure you want to delete this account?")) {
      const response = await fetch(`${API_BASE_URL}/api/accounts/${accountId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        showToast("Account deleted", "success", 3500);
        loadDashboardData();
      }
    }
  };

  const createInvite = async () => {
    const response = await fetch(`${API_BASE_URL}/api/accounts/coach-invites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: inviteEmail,
        createdBy: user?.fullName || "admin",
        baseUrl: window.location.origin,
      }),
    });

    const result = await response.json();
    if (response.ok) {
      setInviteLink(result.link);
      showToast("Invite link created", "success", 4000);
    }
  };

  return (
    <div className="dashboard-wrapper admin-dashboard-wrapper">
      {/* Sidebar */}
      <aside className="dashboard-sidebar admin-sidebar">
        <div className="dashboard-sidebar-header">
          <div className="dashboard-sidebar-title">
            <div className="dashboard-sidebar-icon">⚙️</div>
            Admin Panel
          </div>
        </div>

        <nav className="dashboard-sidebar-nav">
          {[
            { id: "overview", label: "Overview", icon: "📊" },
            { id: "accounts", label: "Accounts", icon: "👥" },
            { id: "coaches", label: "Coaches", icon: "🎓" },
            { id: "bookings", label: "Bookings", icon: "📅" },
          ].map((item) => (
            <li key={item.id} className="dashboard-sidebar-item">
              <button
                className={`dashboard-sidebar-link ${activeTab === item.id ? "active" : ""}`}
                onClick={() => setActiveTab(item.id as AdminTab)}
              >
                <span className="dashboard-sidebar-link-icon">{item.icon}</span>
                {item.label}
              </button>
            </li>
          ))}
        </nav>

        <div className="dashboard-sidebar-footer">
          <div className="dashboard-user-info">
            <p className="dashboard-user-name">Logged in as</p>
            <p className="dashboard-user-email">{user?.fullName}</p>
          </div>
          <button
            className="dashboard-logout-btn"
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Admin Dashboard</h1>
            <p className="dashboard-subtitle">Manage platform accounts, coaches, and bookings</p>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="dashboard-overview-grid">
            <div className="dashboard-stats">
              <div className="stat-card">
                <p className="stat-card-label">Total Accounts</p>
                <p className="stat-card-value">{accounts.length}</p>
                <p className="stat-card-change">{totalCoaches} coaches</p>
              </div>
              <div className="stat-card">
                <p className="stat-card-label">Booking Slots</p>
                <p className="stat-card-value">{slots.length}</p>
                <p className="stat-card-change">{availableSlots} available</p>
              </div>
              <div className="stat-card">
                <p className="stat-card-label">Total Sessions</p>
                <p className="stat-card-value">{sessions.length}</p>
                <p className="stat-card-change">Active bookings</p>
              </div>
              <div className="stat-card">
                <p className="stat-card-label">Active Accounts</p>
                <p className="stat-card-value">{activeAccounts}</p>
                <p className="stat-card-change">{disabledAccounts} disabled</p>
              </div>
            </div>

            <div className="dashboard-card dashboard-card-highlight">
              <div className="dashboard-card-header">
                <h2 className="dashboard-card-title">Platform health</h2>
              </div>
              <div className="dashboard-card-body">
                <p className="dashboard-highlight-copy">
                  The admin workspace gives you full platform visibility: team capacity, open slots,
                  and session activity in one place.
                </p>
                <div className="dashboard-badge-list">
                  <span className="dashboard-badge success">{activeAccounts} active accounts</span>
                  <span className="dashboard-badge warning">{availableSlots} open slots</span>
                  <span className="dashboard-badge error">{disabledAccounts} accounts review</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Accounts Tab */}
        {activeTab === "accounts" && (
          <div>
            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <h2 className="dashboard-card-title">Create New Account</h2>
              </div>
              <div className="dashboard-card-body">
                <div className="dashboard-form">
                  <input
                    placeholder="Full Name"
                    value={accountForm.fullName}
                    onChange={(e) =>
                      setAccountForm({ ...accountForm, fullName: e.target.value })
                    }
                  />
                  <input
                    placeholder="Email"
                    type="email"
                    value={accountForm.email}
                    onChange={(e) =>
                      setAccountForm({ ...accountForm, email: e.target.value })
                    }
                  />
                  <input
                    placeholder="Phone"
                    value={accountForm.phone}
                    onChange={(e) =>
                      setAccountForm({ ...accountForm, phone: e.target.value })
                    }
                  />
                  <select
                    value={accountForm.role}
                    onChange={(e) =>
                      setAccountForm({
                        ...accountForm,
                        role: e.target.value as Account["role"],
                      })
                    }
                  >
                    <option value="user">User</option>
                    <option value="coach">Coach</option>
                    <option value="admin">Admin</option>
                  </select>
                  <select
                    value={accountForm.status}
                    onChange={(e) =>
                      setAccountForm({
                        ...accountForm,
                        status: e.target.value as Account["status"],
                      })
                    }
                  >
                    <option value="active">Active</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
                <button className="dashboard-btn dashboard-btn-primary" onClick={saveAccount}>
                  Create Account
                </button>
              </div>
            </div>

            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <h2 className="dashboard-card-title">All Accounts</h2>
              </div>
              <div className="dashboard-card-body">
                {accounts.length === 0 ? (
                  <div className="dashboard-empty">
                    <p className="dashboard-empty-text">No accounts yet</p>
                  </div>
                ) : (
                  <div className="dashboard-table-wrapper">
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
                            <td>{account.fullName}</td>
                            <td>{account.email}</td>
                            <td>{account.role}</td>
                            <td>{account.status}</td>
                            <td>
                              <button
                                className="dashboard-btn dashboard-btn-secondary dashboard-btn-small"
                                onClick={() =>
                                  setAccountForm({
                                    fullName: account.fullName,
                                    email: account.email,
                                    phone: account.phone || "",
                                    role: account.role,
                                    status: account.status,
                                  })
                                }
                              >
                                Edit
                              </button>
                              <button
                                className="dashboard-btn dashboard-btn-danger dashboard-btn-small"
                                onClick={() => deleteAccount(account._id)}
                              >
                                Delete
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
          </div>
        )}

        {/* Coaches Tab */}
        {activeTab === "coaches" && (
          <div>
            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <h2 className="dashboard-card-title">Send Coach Invite</h2>
              </div>
              <div className="dashboard-card-body">
                <div className="dashboard-form">
                  <input
                    placeholder="Coach Email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <button className="dashboard-btn dashboard-btn-primary" onClick={createInvite}>
                  Generate Invite Link
                </button>
                {inviteLink && (
                  <div className="dashboard-alert dashboard-alert-success" style={{ marginTop: "16px" }}>
                    <strong>Invite Link:</strong>
                    <div style={{ wordBreak: "break-all", marginTop: "8px", fontFamily: "monospace" }}>
                      {inviteLink}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <h2 className="dashboard-card-title">Coach Availability Slots</h2>
              </div>
              <div className="dashboard-card-body">
                {slots.length === 0 ? (
                  <div className="dashboard-empty">
                    <p className="dashboard-empty-text">No slots created yet</p>
                  </div>
                ) : (
                  <div className="dashboard-table-wrapper">
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
                            <td>{slot.title}</td>
                            <td>{slot.coachName}</td>
                            <td>{slot.programName}</td>
                            <td>{new Date(slot.bookingDate).toLocaleString()}</td>
                            <td>{slot.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h2 className="dashboard-card-title">User Booking Sessions</h2>
            </div>
            <div className="dashboard-card-body">
              {sessions.length === 0 ? (
                <div className="dashboard-empty">
                  <p className="dashboard-empty-text">No bookings yet</p>
                </div>
              ) : (
                <div className="dashboard-table-wrapper">
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
                          <td>{session.fullName}</td>
                          <td>{session.email}</td>
                          <td>{session.coachName || "N/A"}</td>
                          <td>{session.programName}</td>
                          <td>{session.bookingTime}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
