import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { BookingSession, Coach, CoachSlot, Program } from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8000";

interface CoachDashboardProps {
  coaches: Coach[];
  programs: Program[];
  showToast: (message: string, type: string, duration?: number) => void;
}

const CoachDashboard: React.FC<CoachDashboardProps> = ({
  coaches,
  programs,
  showToast,
}) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
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
    const [slotsResponse, sessionsResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/api/bookings/coach-slots`),
      fetch(`${API_BASE_URL}/api/bookings/sessions`),
    ]);

    if (slotsResponse.ok) {
      const data = await slotsResponse.json();
      const mySlots = (data.slots || []).filter(
        (slot: CoachSlot) => slot.coachEmail === user?.email || slot.coachId === String(selectedCoach?.id),
      );
      setSlots(mySlots);
    }
    if (sessionsResponse.ok) {
      const data = await sessionsResponse.json();
      const mySessions = (data.sessions || []).filter(
        (session: BookingSession) =>
          session.coachEmail === user?.email || session.coachId === String(selectedCoach?.id),
      );
      setSessions(mySessions);
    }
  };

  useEffect(() => {
    loadDashboardData().catch(() => {
      showToast("Could not load dashboard data.", "error", 5000);
    });
  }, [showToast, user?.email, selectedCoach?.id]);

  const createCoachSlot = async () => {
    if (!selectedCoach) {
      showToast("Coach information not found.", "error", 4000);
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

    const result = await response.json().catch(() => null);
    if (!response.ok) {
      showToast(result?.message || "Could not create booking slot.", "error", 5000);
      return;
    }

    setSlotForm({
      title: "",
      programName: programs[0]?.title || "",
      bookingDate: "",
      bookingEndDate: "",
    });
    await loadDashboardData();
    showToast("Booking slot created successfully.", "success", 4000);
  };

  return (
    <section id="coach-dashboard" className="section dashboard-section">
      <div className="container">
        <div className="section-header">
          <span className="section-label">Coach Only</span>
          <h2 className="section-title">
            Coach <em>Dashboard</em>
          </h2>
          <p className="section-sub">
            Manage your availability and view client bookings.
          </p>
          <button
            className="btn btn-outline"
            onClick={() => {
              logout();
              navigate("/");
            }}
            style={{ marginTop: "16px", marginLeft: "auto" }}
          >
            Logout ({user?.fullName})
          </button>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-panel">
            <h3>My Information</h3>
            <div
              style={{
                padding: "16px",
                background: "var(--clr-bg-light)",
                borderRadius: "var(--radius-sm)",
              }}
            >
              <p>
                <strong>Name:</strong> {selectedCoach?.name || "N/A"}
              </p>
              <p>
                <strong>Email:</strong> {selectedCoach?.email || "N/A"}
              </p>
              <p>
                <strong>Phone:</strong> {selectedCoach?.phone || "N/A"}
              </p>
              <p>
                <strong>Specialization:</strong> {selectedCoach?.specialization || "N/A"}
              </p>
            </div>
          </div>

          <div className="dashboard-panel">
            <h3>Create Availability Slot</h3>
            <div className="dashboard-form">
              <input
                placeholder="Slot title (e.g., 'One-on-one coaching')"
                value={slotForm.title}
                onChange={(event) =>
                  setSlotForm({ ...slotForm, title: event.target.value })
                }
              />
              <select
                value={slotForm.programName}
                onChange={(event) =>
                  setSlotForm({ ...slotForm, programName: event.target.value })
                }
              >
                {programs.map((program) => (
                  <option key={program.id} value={program.title}>
                    {program.title}
                  </option>
                ))}
              </select>
              <input
                type="datetime-local"
                value={slotForm.bookingDate}
                onChange={(event) =>
                  setSlotForm({ ...slotForm, bookingDate: event.target.value })
                }
              />
              <input
                type="datetime-local"
                value={slotForm.bookingEndDate}
                onChange={(event) =>
                  setSlotForm({
                    ...slotForm,
                    bookingEndDate: event.target.value,
                  })
                }
              />
              <button className="btn btn-primary" onClick={createCoachSlot}>
                Create Slot
              </button>
            </div>
          </div>

          <div className="dashboard-panel dashboard-wide">
            <h3>My Available Slots</h3>
            <div className="slot-list">
              {slots.length === 0 ? (
                <p style={{ color: "var(--clr-ink-soft)", padding: "16px" }}>
                  No slots created yet.
                </p>
              ) : (
                slots.map((slot) => (
                  <div className="slot-item" key={slot._id}>
                    <strong>{slot.title}</strong>
                    <span>{slot.programName}</span>
                    <span>{new Date(slot.bookingDate).toLocaleString()}</span>
                    <small>{slot.status}</small>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="dashboard-panel dashboard-wide">
            <h3>Client Bookings</h3>
            <div className="slot-list">
              {sessions.length === 0 ? (
                <p style={{ color: "var(--clr-ink-soft)", padding: "16px" }}>
                  No client bookings yet.
                </p>
              ) : (
                sessions.map((session) => (
                  <div className="slot-item" key={session._id}>
                    <strong>{session.fullName}</strong>
                    <span>{session.programName}</span>
                    <span>{session.bookingTime}</span>
                    <small>{session.email}</small>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CoachDashboard;
