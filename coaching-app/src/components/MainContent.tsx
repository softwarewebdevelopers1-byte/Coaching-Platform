import React, { useEffect, useMemo, useState } from "react";
import type { Booking, Coach, CoachSlot, Program, Testimonial } from "../types";
import { coachMatchesProgram } from "../utils/programs";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "https://coaching-platform-38p5.onrender.com";

interface MainContentProps {
  programs: Program[];
  testimonials: Testimonial[];
  onAddBooking: (booking: Booking) => void;
  showToast: (message: string, type: string, duration?: number) => void;
}

const fallbackCoaches: Coach[] = [
  {
    _id: "wanja-fallback",
    name: "Wanja Gitau",
    email: "hello@unwantracoaching.co.ke",
    phone: "+254 712281552",
    specialization: "individual-executive",
    bio: "Executive coach and former people leader supporting women executives, founders, and senior managers to strengthen voice, boundaries, and influence.",
    expertise: [
      "Executive presence",
      "Courageous conversations",
      "Values-led leadership",
    ],
    experience: 14,
    languages: ["English", "Kiswahili"],
    availabilitySummary: "Tue and Thu mornings",
    photo: "/amina-wanjiru.jpg",
    rating: 5,
    currentWorkload: 5,
    maxWorkload: 10,
  },
  {
    _id: "zuri-fallback",
    name: "Zuri Okafor",
    email: "zuri@unwantra.co",
    phone: "+234 800 000 202",
    specialization: "group-executive",
    bio: "Leadership facilitator specializing in group coaching, team trust, cross-cultural leadership, and practical rituals for aligned executive teams.",
    expertise: ["Leadership cohorts", "Team alignment", "Connection and trust"],
    experience: 12,
    languages: ["English", "Igbo"],
    availabilitySummary: "Wed afternoons",
    photo: "/zuri-okafor.jpg",
    rating: 5,
    currentWorkload: 3,
    maxWorkload: 8,
  },
  {
    _id: "naledi-fallback",
    name: "Naledi Mokoena",
    email: "naledi@unwantra.co",
    phone: "+27 71 000 0303",
    specialization: "individual-executive",
    bio: "ICF-aligned coach helping senior leaders navigate transition, confidence, identity, and strategic communication with compassion and rigor.",
    expertise: [
      "Leadership transition",
      "Confidence",
      "Strategic communication",
    ],
    experience: 16,
    languages: ["English", "Sesotho"],
    availabilitySummary: "Mon and Fri afternoons",
    photo: "/naledi-mokoena.jpg",
    rating: 4.9,
    currentWorkload: 7,
    maxWorkload: 12,
  },
];

const fallbackSlots = [
  "2026-07-01T09:00",
  "2026-07-02T14:00",
  "2026-07-06T11:30",
];

const MainContent: React.FC<MainContentProps> = ({
  programs,
  testimonials,
  onAddBooking,
  showToast,
}) => {
  const [activePanel, setActivePanel] = useState<string>(() =>
    window.location.hash.replace("#", ""),
  );
  const [coaches, setCoaches] = useState<Coach[]>(fallbackCoaches);
  const [slots, setSlots] = useState<CoachSlot[]>([]);
  const [step, setStep] = useState(1);
  const [selectedProgram, setSelectedProgram] = useState(programs[0]?.id || "");
  const [coachChoice, setCoachChoice] = useState<"choose" | "assign">("assign");
  const [selectedCoachId, setSelectedCoachId] = useState("");
  const [assignedCoach, setAssignedCoach] = useState<Coach | null>(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    country: "",
    goals: "",
    preferredDate: "",
    preferredTime: "",
    coachingType: "Discovery call",
  });

  // ── Slot-request state (used when coach has no open slots) ────────────────
  const [requestMode, setRequestMode] = useState(false);
  const [slotRequestForm, setSlotRequestForm] = useState({
    message: "",
    preferredDate: "",
    preferredTime: "",
  });
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const selectedProgramData = programs.find(
    (program) => program.id === selectedProgram,
  );
  const getCoachProgramIds = (specialization = "") =>
    specialization
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  const eligibleCoaches = useMemo(
    () =>
      coaches.filter((coach) =>
        coachMatchesProgram(coach.specialization, selectedProgram),
      ),
    [coaches, selectedProgram],
  );
  const hasCoachForSelectedProgram = eligibleCoaches.length > 0;
  const selectedCoach =
    assignedCoach ||
    coaches.find((coach) => coach._id === selectedCoachId) ||
    null;

  useEffect(() => {
    const syncHash = () => setActivePanel(window.location.hash.replace("#", ""));
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  useEffect(() => {
    const loadCoaches = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/accounts?role=coach&status=active`,
        );
        if (!res.ok) return;
        const data = await res.json();
        const mapped = (data.accounts || []).map((account: any) => ({
          _id: account._id,
          name: account.fullName,
          email: account.email,
          phone: account.phone || "",
          specialization: account.programName || "",
          bio: account.bio,
          experience: account.experience,
          languages: account.languages,
          expertise: account.expertise,
          photo: account.photo,
          currentWorkload: account.currentWorkload,
          maxWorkload: account.maxWorkload,
          availabilitySummary: account.availabilitySummary,
          rating: 5,
        }));
        if (mapped.length) setCoaches(mapped);
      } catch {
        setCoaches(fallbackCoaches);
      }
    };
    loadCoaches();
  }, []);

  useEffect(() => {
    const loadSlots = async () => {
      if (!selectedCoach?.email) return;
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/bookings/coach-slots?coachEmail=${encodeURIComponent(selectedCoach.email)}`,
        );
        if (!res.ok) return;
        const data = await res.json();
        setSlots(
          (data.slots || []).filter(
            (slot: CoachSlot) => slot.status === "open",
          ),
        );
      } catch {
        setSlots([]);
      }
    };
    setSlots([]);
    setSelectedSlot("");
    loadSlots();
  }, [selectedCoach?.email]);

  const assignBestCoach = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings/assign-coach`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          programName: selectedProgram,
          goals: form.goals
            .split(",")
            .map((goal) => goal.trim())
            .filter(Boolean),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAssignedCoach({
          _id: data.coach._id,
          name: data.coach.fullName,
          email: data.coach.email,
          phone: data.coach.phone || "",
          specialization: data.coach.programName,
          bio: data.coach.bio,
          experience: data.coach.experience,
          languages: data.coach.languages,
          expertise: data.coach.expertise,
          photo: data.coach.photo,
          currentWorkload: data.coach.currentWorkload,
          maxWorkload: data.coach.maxWorkload,
        });
        return true;
      }
    } catch {
      // Local fallback below keeps the booking path usable offline.
    }

    const best = [...eligibleCoaches].sort((a, b) => {
      const loadA = (a.currentWorkload || 0) / (a.maxWorkload || 10);
      const loadB = (b.currentWorkload || 0) / (b.maxWorkload || 10);
      return loadA - loadB || (b.experience || 0) - (a.experience || 0);
    })[0];
    setAssignedCoach(best || null);
    return !!best;
  };

  const next = async () => {
    if (step === 1 && !selectedProgram)
      return showToast("Choose a coaching service", "error");
    if (step === 1 && !hasCoachForSelectedProgram) {
      return showToast(
        "No coach is currently available for this coaching program",
        "error",
        5000,
      );
    }
    if (step === 2) {
      if (coachChoice === "assign" && !(await assignBestCoach())) {
        return showToast(
          "No coach is currently available for this coaching program",
          "error",
          5000,
        );
      }
      if (coachChoice === "choose" && !selectedCoachId) {
        return showToast(
          "Choose a coach or select best-match assignment",
          "error",
        );
      }
    }
    // In request mode (no open slots) we skip the slot-selection requirement
    if (
      step === 3 &&
      !requestMode &&
      !selectedSlot &&
      (!form.preferredDate || !form.preferredTime)
    ) {
      return showToast(
        "Choose a time slot or enter a preferred date and time",
        "error",
      );
    }
    setStep((value) => Math.min(value + 1, 5));
  };

  const submitBooking = async () => {
    if (
      !form.fullName ||
      !form.email ||
      !form.phoneNumber ||
      !form.country ||
      !form.goals
    ) {
      showToast("Complete all required details before submitting", "error");
      return;
    }
    if (!selectedCoach || !selectedProgramData) return;

    const slotLabel =
      selectedSlot ||
      `${new Date(form.preferredDate).toLocaleDateString()} at ${form.preferredTime}`;

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings/book-slot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          programName: selectedProgram,
          coachId: selectedCoach._id,
          coachName: selectedCoach.name,
          coachEmail: selectedCoach.email,
          coachPhone: selectedCoach.phone,
          bookingTime: slotLabel,
          slotId: slots.find((slot) => slot.bookingDate === selectedSlot)?._id,
          goals: form.goals
            .split(",")
            .map((goal) => goal.trim())
            .filter(Boolean)
            .slice(0, 3),
        }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message || "Could not submit booking");
      }
      onAddBooking({
        id: Date.now(),
        name: form.fullName,
        email: form.email,
        program: selectedProgramData.title,
        coach: selectedCoach.name,
        coachEmail: selectedCoach.email,
        coachPhone: selectedCoach.phone,
        slot: slotLabel,
        duration: selectedProgramData.duration,
        bookedAt: new Date().toLocaleString(),
      });
      showToast(
        "Discovery call request received. Confirmation sent by email.",
        "success",
        5000,
      );
      setStep(5);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Could not submit booking",
        "error",
        6000,
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ── Submit a slot request (no open slots path) ────────────────────────────
  const submitSlotRequest = async () => {
    if (!form.fullName || !form.email || !form.phoneNumber) {
      showToast("Please fill in your name, email, and phone number", "error");
      return;
    }
    if (!selectedCoach || !selectedProgramData) return;

    setSubmittingRequest(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/slot-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          phoneNumber: form.phoneNumber,
          programName: selectedProgram,
          coachId: selectedCoach._id,
          coachName: selectedCoach.name,
          coachEmail: selectedCoach.email,
          message: [
            slotRequestForm.message,
            slotRequestForm.preferredDate
              ? `Preferred date: ${new Date(slotRequestForm.preferredDate).toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}`
              : "",
            slotRequestForm.preferredTime
              ? `Preferred time: ${slotRequestForm.preferredTime}`
              : "",
          ]
            .filter(Boolean)
            .join(" | "),
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message || "Could not submit slot request");
      }

      setRequestSent(true);
      showToast(
        "Slot request sent! You'll be notified by email when the coach responds.",
        "success",
        6000,
      );
      setStep(5);
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Could not submit slot request",
        "error",
        6000,
      );
    } finally {
      setSubmittingRequest(false);
    }
  };

  const slotOptions = slots.length
    ? slots.map((slot) => ({
        value: slot.bookingDate,
        label: `${new Date(slot.bookingDate).toLocaleDateString([], {
          weekday: "short",
          month: "short",
          day: "numeric",
        })} at ${new Date(slot.bookingDate).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`,
      }))
    : fallbackSlots.map((slot) => ({
        value: slot,
        label: `${new Date(slot).toLocaleDateString([], {
          weekday: "short",
          month: "short",
          day: "numeric",
        })} at ${new Date(slot).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`,
      }));

  if (!["why", "services", "engage"].includes(activePanel)) {
    return null;
  }

  return (
    <>
      {activePanel === "services" && (
        <>
      <section id="services" className="uw-section">
        <div className="uw-container">
          <div className="uw-section-head">
            <span className="uw-kicker">Coaching services</span>
            <h2>Programs for executive growth.</h2>
            <p>
              Focused support for individual leaders and leadership cohorts.
            </p>
          </div>
          <div className="uw-card-grid">
            {programs.map((program) => (
              <article className="uw-service-card" key={program.id}>
                <img src={program.image} alt="" />
                <div>
                  <span>{program.tag}</span>
                  <h3>{program.title}</h3>
                  <p>{program.description}</p>
                  <h4>Benefits</h4>
                  <ul>
                    {program.benefits?.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <h4>Outcomes</h4>
                  <ul>
                    {program.outcomes?.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <button
                    className="uw-btn uw-btn-primary"
                    onClick={() => {
                      setSelectedProgram(program.id);
                      window.location.hash = "engage";
                    }}
                  >
                    Start with this service
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section id="coaches" className="uw-section">
        <div className="uw-container">
          <div className="uw-section-head">
            <span className="uw-kicker">Meet our coaches</span>
            <h2>Experienced guides for courageous leadership.</h2>
          </div>
          <div className="uw-coach-grid">
            {coaches.map((coach) => (
              <article className="uw-coach-card" key={coach._id}>
                <img
                  src={coach.photo || fallbackCoaches[0].photo}
                  alt={coach.name}
                />
                <div>
                  <h3>{coach.name}</h3>
                  <p>
                    {coach.bio ||
                      "Executive coach focused on clarity, courage, and connection."}
                  </p>
                  <dl>
                    <div>
                      <dt>Expertise</dt>
                      <dd>
                        {(coach.expertise || ["Executive leadership"]).join(
                          ", ",
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt>Experience</dt>
                      <dd>{coach.experience || 10}+ years</dd>
                    </div>
                    <div>
                      <dt>Languages</dt>
                      <dd>{(coach.languages || ["English"]).join(", ")}</dd>
                    </div>
                    <div>
                      <dt>Availability</dt>
                      <dd>
                        {coach.availabilitySummary || "By discovery call"}
                      </dd>
                    </div>
                  </dl>
                  <button
                    className="uw-btn uw-btn-secondary"
                    onClick={() => {
                      setCoachChoice("choose");
                      setSelectedCoachId(coach._id);
                      setSelectedProgram(
                        getCoachProgramIds(coach.specialization)[0] ||
                          selectedProgram,
                      );
                      window.location.hash = "engage";
                    }}
                  >
                    Book session
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section id="testimonials" className="uw-section">
        <div className="uw-container">
          <div className="uw-section-head">
            <span className="uw-kicker">Testimonials</span>
            <h2>Trusted by leaders doing meaningful work.</h2>
          </div>
          <div className="uw-testimonial-grid">
            {testimonials.map((testimonial) => (
              <article className="uw-testimonial" key={testimonial.name}>
                <p>"{testimonial.text}"</p>
                <strong>{testimonial.name}</strong>
                <span>{testimonial.role}</span>
              </article>
            ))}
          </div>
        </div>
      </section>
        </>
      )}

      {activePanel === "engage" && (
        <>
      <section id="engage" className="uw-section uw-booking-section">
        <div className="uw-container uw-booking-layout">
          <div>
            <span className="uw-kicker">Discovery call booking</span>
            <h2>A premium booking experience with no account required.</h2>
            <p>
              Choose a service, select a coach or let the assignment engine find
              the best fit, then submit your goals for confirmation.
            </p>
            <ol className="uw-steps">
              {[
                "Choose service",
                "Choose coach",
                "Choose time",
                "Submit details",
                "Confirmation",
              ].map((item, index) => (
                <li className={step === index + 1 ? "active" : ""} key={item}>
                  {item}
                </li>
              ))}
            </ol>
          </div>
          <div className="uw-booking-card">
            {step === 1 && (
              <div className="uw-form-panel">
                <h3>Step 1: Choose coaching service</h3>
                <div className="uw-choice-list">
                  {programs.map((program) => (
                    <button
                      key={program.id}
                      className={
                        selectedProgram === program.id ? "selected" : ""
                      }
                      onClick={() => setSelectedProgram(program.id)}
                    >
                      <strong>{program.title}</strong>
                      <span>{program.duration}</span>
                    </button>
                  ))}
                </div>
                <button className="uw-btn uw-btn-primary" onClick={next}>
                  Continue
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="uw-form-panel">
                <h3>Step 2: Choose your coach</h3>
                <div className="uw-coach-choice-group">
                  <label className="uw-radio">
                    <input
                      type="radio"
                      checked={coachChoice === "assign"}
                      onChange={() => {
                        setCoachChoice("assign");
                        setAssignedCoach(null);
                      }}
                    />
                    <span>Assign me the best coach</span>
                  </label>
                  <label className="uw-radio">
                    <input
                      type="radio"
                      checked={coachChoice === "choose"}
                      onChange={() => {
                        setCoachChoice("choose");
                        setAssignedCoach(null);
                      }}
                    />
                    <span>I want to choose</span>
                  </label>
                </div>
                {coachChoice === "choose" && (
                  <select
                    value={selectedCoachId}
                    onChange={(event) => {
                      setSelectedCoachId(event.target.value);
                    }}
                  >
                    <option value="">Select coach</option>
                    {eligibleCoaches.map((coach) => (
                      <option key={coach._id} value={coach._id}>
                        {coach.name}
                      </option>
                    ))}
                  </select>
                )}
                <div className="uw-form-actions">
                  <button
                    className="uw-btn uw-btn-quiet"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </button>
                  <button className="uw-btn uw-btn-primary" onClick={next}>
                    Continue
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="uw-form-panel">
                <h3>Step 3: Choose available time slot</h3>
                {selectedCoach && (
                  <p className="uw-assigned">Coach: {selectedCoach.name}</p>
                )}

                {/* ── Has open slots: normal booking ─────────────────── */}
                {slots.length > 0 && (
                  <>
                    <div className="uw-slot-grid">
                      {slotOptions.map((slot) => (
                        <button
                          key={slot.value}
                          className={
                            selectedSlot === slot.value ? "selected" : ""
                          }
                          onClick={() => {
                            setSelectedSlot(slot.value);
                            setRequestMode(false);
                          }}
                        >
                          {slot.label}
                        </button>
                      ))}
                    </div>
                    <div className="uw-form-grid">
                      <label>
                        Preferred Date
                        <input
                          type="date"
                          value={form.preferredDate}
                          onChange={(e) =>
                            setForm({ ...form, preferredDate: e.target.value })
                          }
                        />
                      </label>
                      <label>
                        Preferred Time
                        <input
                          type="time"
                          value={form.preferredTime}
                          onChange={(e) =>
                            setForm({ ...form, preferredTime: e.target.value })
                          }
                        />
                      </label>
                    </div>
                  </>
                )}

                {/* ── No open slots: request-a-slot flow ─────────────── */}
                {slots.length === 0 && (
                  <div className="uw-no-slots-panel">
                    <div className="uw-no-slots-notice">
                      <span className="uw-no-slots-icon">📭</span>
                      <div>
                        <strong>No available slots right now</strong>
                        <p>
                          This coach has no open slots at the moment. You can
                          send a slot request and{" "}
                          {selectedCoach?.name || "the coach"} will get back to
                          you with a confirmed time.
                        </p>
                      </div>
                    </div>

                    <div className="uw-request-slot-form">
                      <div className="uw-request-slot-header">
                        <span className="uw-request-slot-badge">
                          📩 Request a Slot
                        </span>
                        <p>
                          Fill in your details in the next step and we'll send
                          your request to the coach immediately.
                        </p>
                      </div>
                      <div className="uw-form-grid">
                        <label>
                          Preferred Date (optional)
                          <input
                            type="date"
                            value={slotRequestForm.preferredDate}
                            onChange={(e) =>
                              setSlotRequestForm({
                                ...slotRequestForm,
                                preferredDate: e.target.value,
                              })
                            }
                          />
                        </label>
                        <label>
                          Preferred Time (optional)
                          <input
                            type="time"
                            value={slotRequestForm.preferredTime}
                            onChange={(e) =>
                              setSlotRequestForm({
                                ...slotRequestForm,
                                preferredTime: e.target.value,
                              })
                            }
                          />
                        </label>
                      </div>
                      <label className="wide">
                        Message to coach (optional)
                        <textarea
                          rows={3}
                          placeholder="e.g. I'd prefer weekday mornings, or any context about your goals…"
                          value={slotRequestForm.message}
                          onChange={(e) =>
                            setSlotRequestForm({
                              ...slotRequestForm,
                              message: e.target.value,
                            })
                          }
                        />
                      </label>
                    </div>
                    {/* Activate request mode on mount */}
                    {!requestMode &&
                      (() => {
                        setRequestMode(true);
                        return null;
                      })()}
                  </div>
                )}

                <div className="uw-form-actions">
                  <button
                    className="uw-btn uw-btn-quiet"
                    onClick={() => setStep(2)}
                  >
                    Back
                  </button>
                  <button className="uw-btn uw-btn-primary" onClick={next}>
                    {requestMode ? "Continue to details" : "Continue"}
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="uw-form-panel">
                <h3>
                  {requestMode
                    ? "Step 4: Your contact details"
                    : "Step 4: Submit details"}
                </h3>
                {requestMode && (
                  <div className="uw-request-mode-notice">
                    <span>📩</span>
                    <span>
                      You're requesting a slot from{" "}
                      <strong>{selectedCoach?.name}</strong>. Fill in your
                      details and we'll send your request straight away.
                    </span>
                  </div>
                )}
                <div className="uw-form-grid">
                  <label>
                    Full Name
                    <input
                      value={form.fullName}
                      onChange={(e) =>
                        setForm({ ...form, fullName: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Email
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Phone Number
                    <input
                      value={form.phoneNumber}
                      onChange={(e) =>
                        setForm({ ...form, phoneNumber: e.target.value })
                      }
                    />
                  </label>
                  {!requestMode && (
                    <label>
                      Country
                      <input
                        value={form.country}
                        onChange={(e) =>
                          setForm({ ...form, country: e.target.value })
                        }
                      />
                    </label>
                  )}
                  {!requestMode && (
                    <label>
                      Coaching Type
                      <select
                        value={form.coachingType}
                        onChange={(e) =>
                          setForm({ ...form, coachingType: e.target.value })
                        }
                      >
                        <option>Discovery call</option>
                        <option>Individual Executive Coaching</option>
                        <option>Group Executive Coaching</option>
                      </select>
                    </label>
                  )}
                  <label className="wide">
                    {requestMode
                      ? "Anything else you'd like the coach to know? (optional)"
                      : "Top Three Coaching Goals"}
                    <textarea
                      rows={4}
                      placeholder={
                        requestMode
                          ? "e.g. goals, preferred format, availability…"
                          : "Confidence, boundaries, boardroom influence"
                      }
                      value={form.goals}
                      onChange={(e) =>
                        setForm({ ...form, goals: e.target.value })
                      }
                    />
                  </label>
                </div>
                <div className="uw-form-actions">
                  <button
                    className="uw-btn uw-btn-quiet"
                    onClick={() => setStep(3)}
                  >
                    Back
                  </button>
                  {requestMode ? (
                    <button
                      className="uw-btn uw-btn-primary"
                      onClick={submitSlotRequest}
                      disabled={submittingRequest}
                    >
                      {submittingRequest
                        ? "Sending request…"
                        : "📩 Send slot request"}
                    </button>
                  ) : (
                    <button
                      className="uw-btn uw-btn-primary"
                      onClick={submitBooking}
                      disabled={submitting}
                    >
                      {submitting ? "Submitting..." : "Submit booking"}
                    </button>
                  )}
                </div>
              </div>
            )}

            {step === 5 && !requestSent && (
              <div className="uw-confirmation">
                <span>Confirmed</span>
                <h3>Your discovery call request has been received.</h3>
                <p>
                  We will send booking confirmation, approval updates, and any
                  reschedule notices by email. WhatsApp notifications are
                  structured for future activation.
                </p>
                <button
                  className="uw-btn uw-btn-primary"
                  onClick={() => {
                    setStep(1);
                    setRequestSent(false);
                    setRequestMode(false);
                  }}
                >
                  Book another call
                </button>
              </div>
            )}

            {step === 5 && requestSent && (
              <div className="uw-confirmation uw-request-confirmation">
                <span className="uw-request-pending-badge">⏳ Pending</span>
                <h3>Slot request sent to {selectedCoach?.name}!</h3>
                <p>
                  Your request has been sent and{" "}
                  <strong>{selectedCoach?.name}</strong> has been notified. You
                  will receive an email confirmation as soon as your coach
                  approves and sets a session time.
                </p>
                <div className="uw-request-details-panel">
                  <div className="uw-request-detail-row">
                    <span>Program</span>
                    <strong>{selectedProgramData?.title}</strong>
                  </div>
                  <div className="uw-request-detail-row">
                    <span>Coach</span>
                    <strong>{selectedCoach?.name}</strong>
                  </div>
                  <div className="uw-request-detail-row">
                    <span>Status</span>
                    <strong style={{ color: "#f59e0b" }}>
                      Awaiting coach approval
                    </strong>
                  </div>
                </div>
                <p className="uw-request-next-steps">
                  💡 Keep an eye on your inbox. Once approved, you'll receive a
                  confirmation email with your session time and coach contact
                  details.
                </p>
                <button
                  className="uw-btn uw-btn-primary"
                  onClick={() => {
                    setStep(1);
                    setRequestSent(false);
                    setRequestMode(false);
                    setSlotRequestForm({
                      message: "",
                      preferredDate: "",
                      preferredTime: "",
                    });
                  }}
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
        </>
      )}

      {activePanel === "why" && (
        <>
      <section id="mission" className="uw-section uw-band">
        <div className="uw-container uw-statement-grid">
          <article>
            <span className="uw-kicker">Mission</span>
            <h2>Empowering leaders to own their voice, lead with confidence, clarity, and values.</h2>
            <p>
              Empowering leaders to own their voice, lead with confidence, clarity, and values.
            </p>
          </article>
          <article>
            <span className="uw-kicker">Why we exist</span>
            <p>
              To cultivate a world where leaders lead with courage, clarity, and compassion owning their voice, honoring their values, and creating meaningful impact in work and life.
            </p>
          </article>
          <article className="uw-kicker">
            <p>Vision</p>
            <p>To cultivate a world where leaders lead with courage, clarity, and compassion owning their voice, honoring their values, and creating meaningful impact in work and life.</p>
            <div className="uw-values">
              <span>Courage</span>
              <span>Clarity</span>
              <span>Connection</span>
            </div>
          </article>
        </div>
      </section>
      <section id="story">
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              maxWidth: "100%",
              flexDirection: "column",
              padding: "20px",
            }}
          >
            <section id="story" className="uw-section uw-story-section">
              <div className="uw-container">
                <div className="uw-story-grid">
                  <div className="uw-story-content">
                    <span className="uw-kicker uw-story-kicker">Our story</span>
                    <h2 className="uw-story-title">
                      A coaching firm built on <em>values</em> and{" "}
                      <em>transformation</em>.
                    </h2>
                    <div className="uw-story-text">
                      <p className="uw-story-paragraph uw-story-paragraph-lead">
                        Our story began with a simple conviction: leadership development should be deeply human, transformative, and grounded in values.
                      </p>
                      <p className="uw-story-paragraph">
                        As a premium executive coaching firm that is proudly
                        <span className="uw-story-highlight"> women-led</span>,
                        <span className="uw-story-highlight"> African-led</span>
                        , and
                        <span className="uw-story-highlight">
                          {" "}
                          values-based
                        </span>
                        , we partner with ambitious professionals and executives
                        who are ready to elevate their influence, strengthen
                        their executive presence, navigate career transitions
                        with confidence, and build meaningful workplace
                        relationships.
                      </p>
                    </div>
                    <div className="uw-story-values">
                      <span className="uw-story-value-tag">🌍 African-led</span>
                      <span className="uw-story-value-tag">👩‍💼 Women-led</span>
                      <span className="uw-story-value-tag">
                        💡 Values-based
                      </span>
                      <span className="uw-story-value-tag">
                        🚀 Transformational
                      </span>
                    </div>
                  </div>
                  <div className="uw-story-visual">
                    <div className="uw-story-quote-block">
                      <div className="uw-story-quote-icon">"</div>
                      <blockquote className="uw-story-quote">
                        Leadership development should be deeply human,
                        transformative, and grounded in values.
                      </blockquote>
                      <div className="uw-story-quote-attribute">
                        <span className="uw-story-quote-line"></span>
                        <span>Our founding conviction</span>
                      </div>
                    </div>
                    <div className="uw-story-stats"></div>
                  </div>
                </div>
              </div>
            </section>
          </div>
          {/* <div>
            <p>
              Unwantra Coaching was created to offer premium, African-led and
              women-led coaching for executives navigating visibility,
              responsibility, transition, and purpose.
            </p>
            <p>
              Our philosophy blends rigorous coaching practice with cultural
              intelligence, reflective inquiry, and practical leadership tools.
              We honor ambition without asking leaders to abandon humanity.
            </p>
          </div> */}
        </div>
      </section>
        </>
      )}

      {activePanel === "engage" && (
      <section id="contact" className="uw-section uw-contact">
        <div className="uw-container uw-contact-grid">
          <div>
            <span className="uw-kicker">Contact us</span>
            <h2>Start the conversation.</h2>
            <p>
              Tell us what you are navigating and the kind of leadership support
              you need.
            </p>
          </div>
          <form
            className="uw-contact-form"
            onSubmit={(event) => {
              event.preventDefault();
              showToast(
                "Thank you. The Unwantra team will follow up by email.",
                "success",
              );
              event.currentTarget.reset();
            }}
          >
            <input name="name" placeholder="Name" required />
            <input name="email" type="email" placeholder="Email" required />
            <input name="phone" placeholder="Phone number with country code" required />
            <select name="interest" required defaultValue="">
              <option value="" disabled>Coaching Interest</option>
              <option value="Individual Executive Coaching">Individual Executive Coaching</option>
              <option value="Group Executive Coaching">Group Executive Coaching</option>
            </select>
            <textarea name="goals" placeholder="Goals" rows={5} required />
            <button className="uw-btn uw-btn-primary" type="submit">
              Send message
            </button>
          </form>
        </div>
      </section>
      )}
    </>
  );
};

export default MainContent;
