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

const CoachDashboard: React.FC<CoachDashboardProps> = ({
  coaches,
  programs,
  showToast,
}) => {
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
    () => coaches.find((coach) => coach.email === user?.email) || coaches[0],
    [coaches, user?.email],
  );

  const loadDashboardData = async () => {
    try {
      const [slotsResponse, sessionsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/bookings/coach-slots`),
        fetch(`${API_BASE_URL}/api/bookings/sessions`),
      ]);

      if (slotsResponse.ok) {
        const data = await slotsResponse.json();
        const mySlots = (data.slots || []).filter(
          (slot: CoachSlot) =>
            slot.coachEmail === user?.email ||
            slot.coachId === String(selectedCoach?.id),
        );
        setSlots(mySlots);
      }

      if (sessionsResponse.ok) {
        const data = await sessionsResponse.json();
        const mySessions = (data.sessions || []).filter(
          (session: BookingSession) =>
            session.coachEmail === user?.email ||
            session.coachId === String(selectedCoach?.id),
        );
        setSessions(mySessions);
      }
    } catch {
      showToast("Error loading dashboard data", "error", 5000);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user?.email, selectedCoach?.id]);

  const createCoachSlot = async () => {
    if (!selectedCoach) {
      showToast("Coach information not found", "error", 4000);
      return;
    }

    const response = await fetch(`${API_BASE_URL}/api/bookings/coach-slots`, {
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

    if (response.ok) {
      setSlotForm({
        title: "",
        programName: programs[0]?.title || "",
        bookingDate: "",
        bookingEndDate: "",
      });
      loadDashboardData();
      showToast("Availability slot created", "success", 4000);
    } else {
      showToast("Error creating slot", "error", 5000);
    }
  };

  const openSlots = slots.filter((s) => s.status === "open").length;
  const bookedSlots = slots.filter((s) => s.status === "booked").length;

  return (
    <div className="dashboard-wrapper coach-dashboard-wrapper">
      {/* Sidebar */}
      <aside className="dashboard-sidebar coach-sidebar">
        <div className="dashboard-sidebar-header">
          <div className="dashboard-sidebar-title">
            <div className="dashboard-sidebar-icon">🎓</div>
            Coach Portal
          </div>
        </div>

        <nav className="dashboard-sidebar-nav">
          {[
            { id: "overview", label: "Overview", icon: "📊" },
            { id: "availability", label: "My Availability", icon: "📅" },
            { id: "bookings", label: "Client Bookings", icon: "👥" },
          ].map((item) => (
            <li key={item.id} className="dashboard-sidebar-item">
              <button
                className={`dashboard-sidebar-link ${activeTab === item.id ? "active" : ""}`}
                onClick={() => setActiveTab(item.id as CoachTab)}
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
            <h1 className="dashboard-title">Coach Dashboard</h1>
            <p className="dashboard-subtitle">Manage your coaching sessions and availability</p>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="dashboard-overview-grid">
            <div className="dashboard-stats">
              <div className="stat-card">
                <p className="stat-card-label">Total Slots</p>
                <p className="stat-card-value">{slots.length}</p>
                <p className="stat-card-change">{openSlots} available</p>
              </div>
              <div className="stat-card">
                <p className="stat-card-label">Booked Sessions</p>
                <p className="stat-card-value">{bookedSlots}</p>
                <p className="stat-card-change">{sessions.length} clients</p>
              </div>
              <div className="stat-card">
                <p className="stat-card-label">Specialization</p>
                <p className="stat-card-value custom-text-size">
                  {selectedCoach?.specialization || "N/A"}
                </p>
                <p className="stat-card-change">Experience: {selectedCoach?.experience}+ years</p>
              </div>
              <div className="stat-card">
                <p className="stat-card-label">Rating</p>
                <p className="stat-card-value">⭐ {selectedCoach?.rating}</p>
                <p className="stat-card-change">From clients</p>
              </div>
            </div>

            <div className="dashboard-card dashboard-profile-card">
              <div className="dashboard-card-header">
                <h2 className="dashboard-card-title">Coach profile</h2>
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
                    <p className="dashboard-detail-value">{selectedCoach?.phone}</p>
                  </div>
                  <div>
                    <p className="dashboard-detail-label">Status</p>
                    <p className="dashboard-detail-value status-active">Active ✓</p>
                  </div>
                </div>
                <div className="dashboard-detail-block">
                  <p className="dashboard-detail-label">Bio</p>
                  <p className="dashboard-detail-value dashboard-detail-copy">
                    {selectedCoach?.bio}
                  </p>
                </div>
                <div className="dashboard-detail-block">
                  <p className="dashboard-detail-label">Specialties</p>
                  <div className="dashboard-chip-list">
                    {selectedCoach?.tags.map((tag) => (
                      <span key={tag} className="dashboard-chip">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Availability Tab */}
        {activeTab === "availability" && (
          <div>
            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <h2 className="dashboard-card-title">Create Availability Slot</h2>
              </div>
              <div className="dashboard-card-body">
                <div className="dashboard-form">
                  <input
                    className="dashboard-form-full"
                    placeholder="Slot Title (e.g., 'One-on-one coaching session')"
                    value={slotForm.title}
                    onChange={(e) =>
                      setSlotForm({ ...slotForm, title: e.target.value })
                    }
                  />
                  <select
                    value={slotForm.programName}
                    onChange={(e) =>
                      setSlotForm({ ...slotForm, programName: e.target.value })
                    }
                  >
                    <option value="">Select Program</option>
                    {programs.map((program) => (
                      <option key={program.id} value={program.title}>
                        {program.title}
                      </option>
                    ))}
                  </select>
                  <div>
                    <label style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px", display: "block" }}>
                      Start Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={slotForm.bookingDate}
                      onChange={(e) =>
                        setSlotForm({ ...slotForm, bookingDate: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px", display: "block" }}>
                      End Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={slotForm.bookingEndDate}
                      onChange={(e) =>
                        setSlotForm({ ...slotForm, bookingEndDate: e.target.value })
                      }
                    />
                  </div>
                </div>
                <button className="dashboard-btn dashboard-btn-primary" onClick={createCoachSlot}>
                  Create Availability
                </button>
              </div>
            </div>

            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <h2 className="dashboard-card-title">My Availability Slots</h2>
              </div>
              <div className="dashboard-card-body">
                {slots.length === 0 ? (
                  <div className="dashboard-empty">
                    <p className="dashboard-empty-icon">📅</p>
                    <p className="dashboard-empty-text">No availability slots created yet</p>
                  </div>
                ) : (
                  <div className="dashboard-table-wrapper">
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
                            <td>{slot.title}</td>
                            <td>{slot.programName}</td>
                            <td>{new Date(slot.bookingDate).toLocaleString()}</td>
                            <td>
                              <span
                                style={{
                                  display: "inline-block",
                                  padding: "4px 8px",
                                  background:
                                    slot.status === "open" ? "#d1fae5" : "#fecaca",
                                  color: slot.status === "open" ? "#065f46" : "#991b1b",
                                  borderRadius: "4px",
                                  fontSize: "12px",
                                  fontWeight: "500",
                                }}
                              >
                                {slot.status === "open" ? "Available" : "Booked"}
                              </span>
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

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h2 className="dashboard-card-title">Client Bookings</h2>
            </div>
            <div className="dashboard-card-body">
              {sessions.length === 0 ? (
                <div className="dashboard-empty">
                  <p className="dashboard-empty-icon">👥</p>
                  <p className="dashboard-empty-text">No client bookings yet</p>
                </div>
              ) : (
                <div className="dashboard-table-wrapper">
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
                          <td>{session.fullName}</td>
                          <td>{session.email}</td>
                          <td>{session.programName}</td>
                          <td>{session.bookingTime}</td>
                          <td>{session.phoneNumber}</td>
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

export default CoachDashboard;
