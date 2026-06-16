import React, { useEffect, useMemo, useState } from "react";
import type { Account, BookingSession, Coach, CoachSlot, Program } from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8000";

interface DashboardHubProps {
  coaches: Coach[];
  programs: Program[];
  showToast: (message: string, type: string, duration?: number) => void;
}

const emptyAccount = {
  _id: "",
  fullName: "",
  email: "",
  phone: "",
  role: "user" as Account["role"],
  status: "active" as Account["status"],
  programName: "",
};

const toAccountForm = (account: Account) => ({
  _id: account._id,
  fullName: account.fullName,
  email: account.email,
  phone: account.phone || "",
  role: account.role,
  status: account.status,
  programName: account.programName || "",
});

const DashboardHub: React.FC<DashboardHubProps> = ({
  coaches,
  programs,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<"admin" | "coach" | "user">(
    "admin",
  );
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [slots, setSlots] = useState<CoachSlot[]>([]);
  const [sessions, setSessions] = useState<BookingSession[]>([]);
  const [accountForm, setAccountForm] = useState(emptyAccount);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [selectedCoachId, setSelectedCoachId] = useState(String(coaches[0]?.id || ""));
  const [slotForm, setSlotForm] = useState({
    title: "",
    programName: programs[0]?.title || "",
    bookingDate: "",
    bookingEndDate: "",
  });
  const [userEmail, setUserEmail] = useState("");
  const [inviteToken, setInviteToken] = useState("");
  const [inviteRegister, setInviteRegister] = useState({
    fullName: "",
    phone: "",
    programName: programs[0]?.title || "",
  });

  const selectedCoach = useMemo(
    () => coaches.find((coach) => String(coach.id) === selectedCoachId) || coaches[0],
    [coaches, selectedCoachId],
  );

  const loadDashboardData = async () => {
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
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("coachInvite");
    if (token) {
      setInviteToken(token);
      setActiveTab("coach");
    }
    loadDashboardData().catch(() => {
      showToast("Could not load dashboard data.", "error", 5000);
    });
  }, [showToast]);

  const saveAccount = async () => {
    const isEditing = Boolean(accountForm._id);
    const response = await fetch(
      `${API_BASE_URL}/api/accounts${isEditing ? `/${accountForm._id}` : ""}`,
      {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(accountForm),
      },
    );

    const result = await response.json().catch(() => null);
    if (!response.ok) {
      showToast(result?.message || "Could not save account.", "error", 5000);
      return;
    }

    setAccountForm(emptyAccount);
    await loadDashboardData();
    showToast("Account saved.", "success", 3500);
  };

  const deleteAccount = async (accountId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/accounts/${accountId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      showToast("Could not delete account.", "error", 5000);
      return;
    }

    await loadDashboardData();
    showToast("Account deleted.", "success", 3500);
  };

  const createInvite = async () => {
    const response = await fetch(`${API_BASE_URL}/api/accounts/coach-invites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: inviteEmail,
        createdBy: "admin",
        baseUrl: window.location.origin,
      }),
    });

    const result = await response.json().catch(() => null);
    if (!response.ok) {
      showToast(result?.message || "Could not create invite.", "error", 5000);
      return;
    }

    setInviteLink(result.link);
    showToast("One-time coach link created.", "success", 4000);
  };

  const registerCoachFromInvite = async () => {
    const response = await fetch(
      `${API_BASE_URL}/api/accounts/coach-invites/${inviteToken}/register`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inviteRegister),
      },
    );

    const result = await response.json().catch(() => null);
    if (!response.ok) {
      showToast(result?.message || "Could not create coach account.", "error", 5000);
      return;
    }

    setInviteToken("");
    await loadDashboardData();
    showToast("Coach account created.", "success", 4000);
  };

  const createCoachSlot = async () => {
    if (!selectedCoach) {
      showToast("Select a coach first.", "error", 4000);
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
      showToast(result?.message || "Could not create coach booking.", "error", 5000);
      return;
    }

    setSlotForm({
      title: "",
      programName: programs[0]?.title || "",
      bookingDate: "",
      bookingEndDate: "",
    });
    await loadDashboardData();
    showToast("Coach booking slot created.", "success", 4000);
  };

  const visibleSessions = userEmail
    ? sessions.filter((session) =>
        session.email.toLowerCase().includes(userEmail.toLowerCase()),
      )
    : sessions;

  return (
    <section id="dashboards" className="section dashboard-section">
      <div className="container">
        <div className="section-header">
          <span className="section-label">Operations</span>
          <h2 className="section-title">
            Coaching <em>Dashboards</em>
          </h2>
          <p className="section-sub">
            Manage accounts, coach availability, and client booking activity.
          </p>
        </div>

        <div className="dashboard-tabs">
          <button
            className={activeTab === "admin" ? "active" : ""}
            onClick={() => setActiveTab("admin")}
          >
            Admin
          </button>
          <button
            className={activeTab === "coach" ? "active" : ""}
            onClick={() => setActiveTab("coach")}
          >
            Coaches
          </button>
          <button
            className={activeTab === "user" ? "active" : ""}
            onClick={() => setActiveTab("user")}
          >
            Users
          </button>
        </div>

        {activeTab === "admin" && (
          <div className="dashboard-grid">
            <div className="dashboard-panel">
              <h3>Manage Accounts</h3>
              <div className="dashboard-form">
                <input
                  placeholder="Full name"
                  value={accountForm.fullName}
                  onChange={(event) =>
                    setAccountForm({ ...accountForm, fullName: event.target.value })
                  }
                />
                <input
                  placeholder="Email"
                  value={accountForm.email}
                  onChange={(event) =>
                    setAccountForm({ ...accountForm, email: event.target.value })
                  }
                />
                <input
                  placeholder="Phone"
                  value={accountForm.phone}
                  onChange={(event) =>
                    setAccountForm({ ...accountForm, phone: event.target.value })
                  }
                />
                <select
                  value={accountForm.role}
                  onChange={(event) =>
                    setAccountForm({
                      ...accountForm,
                      role: event.target.value as Account["role"],
                    })
                  }
                >
                  <option value="user">User</option>
                  <option value="coach">Coach</option>
                  <option value="admin">Admin</option>
                </select>
                <select
                  value={accountForm.status}
                  onChange={(event) =>
                    setAccountForm({
                      ...accountForm,
                      status: event.target.value as Account["status"],
                    })
                  }
                >
                  <option value="active">Active</option>
                  <option value="disabled">Disabled</option>
                </select>
                <button className="btn btn-primary" onClick={saveAccount}>
                  Save Account
                </button>
              </div>
            </div>

            <div className="dashboard-panel">
              <h3>Coach Invite Link</h3>
              <div className="dashboard-form">
                <input
                  placeholder="coach@email.com"
                  value={inviteEmail}
                  onChange={(event) => setInviteEmail(event.target.value)}
                />
                <button className="btn btn-primary" onClick={createInvite}>
                  Create One-Time Link
                </button>
                {inviteLink && <p className="link-box">{inviteLink}</p>}
              </div>
            </div>

            <div className="dashboard-panel dashboard-wide">
              <h3>Accounts</h3>
              <div className="dashboard-table">
                {accounts.map((account) => (
                  <div className="dashboard-row" key={account._id}>
                    <div>
                      <strong>{account.fullName}</strong>
                      <span>{account.email}</span>
                    </div>
                    <span>{account.role}</span>
                    <span>{account.status}</span>
                    <div className="row-actions">
                      <button
                        className="btn-outline-sm"
                        onClick={() => setAccountForm(toAccountForm(account))}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-outline-sm danger"
                        onClick={() => deleteAccount(account._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "coach" && (
          <div className="dashboard-grid">
            {inviteToken && (
              <div className="dashboard-panel dashboard-wide invite-panel">
                <h3>Create Coach Account</h3>
                <div className="dashboard-form">
                  <input
                    placeholder="Full name"
                    value={inviteRegister.fullName}
                    onChange={(event) =>
                      setInviteRegister({
                        ...inviteRegister,
                        fullName: event.target.value,
                      })
                    }
                  />
                  <input
                    placeholder="Phone"
                    value={inviteRegister.phone}
                    onChange={(event) =>
                      setInviteRegister({
                        ...inviteRegister,
                        phone: event.target.value,
                      })
                    }
                  />
                  <select
                    value={inviteRegister.programName}
                    onChange={(event) =>
                      setInviteRegister({
                        ...inviteRegister,
                        programName: event.target.value,
                      })
                    }
                  >
                    {programs.map((program) => (
                      <option key={program.id} value={program.title}>
                        {program.title}
                      </option>
                    ))}
                  </select>
                  <button
                    className="btn btn-primary"
                    onClick={registerCoachFromInvite}
                  >
                    Create Coach Account
                  </button>
                </div>
              </div>
            )}

            <div className="dashboard-panel">
              <h3>Create Booking Slot</h3>
              <div className="dashboard-form">
                <select
                  value={selectedCoachId}
                  onChange={(event) => setSelectedCoachId(event.target.value)}
                >
                  {coaches.map((coach) => (
                    <option key={coach.id} value={coach.id}>
                      {coach.name}
                    </option>
                  ))}
                </select>
                <input
                  placeholder="Slot title"
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
                  Publish Slot
                </button>
              </div>
            </div>

            <div className="dashboard-panel">
              <h3>Published Slots</h3>
              <div className="slot-list">
                {slots.map((slot) => (
                  <div className="slot-item" key={slot._id}>
                    <strong>{slot.title}</strong>
                    <span>{slot.coachName}</span>
                    <span>{new Date(slot.bookingDate).toLocaleString()}</span>
                    <small>{slot.status}</small>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "user" && (
          <div className="dashboard-grid">
            <div className="dashboard-panel">
              <h3>Available Coach Bookings</h3>
              <div className="slot-list">
                {slots.map((slot) => (
                  <div className="slot-item" key={slot._id}>
                    <strong>{slot.title}</strong>
                    <span>{slot.programName}</span>
                    <span>{slot.coachName}</span>
                    <span>{new Date(slot.bookingDate).toLocaleString()}</span>
                    <small>{slot.status}</small>
                  </div>
                ))}
              </div>
            </div>

            <div className="dashboard-panel">
              <h3>User Booking Sessions</h3>
              <div className="dashboard-form">
                <input
                  placeholder="Filter by user email"
                  value={userEmail}
                  onChange={(event) => setUserEmail(event.target.value)}
                />
              </div>
              <div className="slot-list">
                {visibleSessions.map((session) => (
                  <div className="slot-item" key={session._id}>
                    <strong>{session.fullName}</strong>
                    <span>{session.programName}</span>
                    <span>{session.coachName || session.coachId}</span>
                    <span>{session.bookingTime}</span>
                    <small>{session.email}</small>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default DashboardHub;
