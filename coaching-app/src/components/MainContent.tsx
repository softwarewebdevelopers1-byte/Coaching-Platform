import React, { useEffect, useMemo, useState } from "react";
import type { Booking, Coach, CoachSlot, Program, Testimonial } from "../types";
import { coachMatchesProgram } from "../utils/programs";
import CoachProfileModal from "./CoachProfileModal";

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
    _id: "amina-fallback",
    name: "Amina Wanjiru",
    email: "amina@unwantra.co",
    phone: "+254 700 000 101",
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
  const [coaches, setCoaches] = useState<Coach[]>(fallbackCoaches);
  const [slots, setSlots] = useState<CoachSlot[]>([]);
  const [step, setStep] = useState(1);
  const [selectedProgram, setSelectedProgram] = useState(programs[0]?.id || "");
  const [selectedCoachId, setSelectedCoachId] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
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

  const [requestSent, setRequestSent] = useState(false);
  const [selectedProfileCoach, setSelectedProfileCoach] = useState<Coach | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  const getProgramLabel = (value: string) => {
    const program = programs.find((p) => p.id === value || p.title === value);
    return program?.title || value || "-";
  };

  const renderStars = (rating: number) => "★".repeat(Math.round(rating)) + "☆".repeat(5 - Math.round(rating));

  const openProfileModal = (coach: Coach) => {
    setSelectedProfileCoach(coach);
    setIsProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
    setSelectedProfileCoach(null);
  };

  const selectedProgramData = programs.find(
    (program) => program.id === selectedProgram,
  );
  const getCoachProgramIds = (specialization = "") =>
    specialization
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  const isCoachAvailableToday = (coach: Coach) => {
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
    const normalizedToday = today.toLowerCase();
    const normalizeDay = (day: string) => day.trim().toLowerCase();

    if (coach.availabilityType === "whole_week") return true;
    if (coach.availableDays?.length) {
      return coach.availableDays.some(
        (day) =>
          normalizeDay(day) === normalizedToday ||
          normalizeDay(day).startsWith(normalizedToday.slice(0, 3)),
      );
    }

    return false;
  };

  const eligibleCoaches = useMemo(
    () =>
      coaches.filter((coach) =>
        coachMatchesProgram(coach.specialization, selectedProgram),
      ),
    [coaches, selectedProgram],
  );
  const hasCoachForSelectedProgram = eligibleCoaches.length > 0;
  const selectedCoach =
    coaches.find((coach) => coach._id === selectedCoachId) || null;

  const suggestedAvailabilityDates = useMemo(() => {
    if (!selectedCoach) return [];

    const normalizedDays = (selectedCoach.availableDays || [])
      .map((day) => day.trim().toLowerCase())
      .filter(Boolean);

    if (!normalizedDays.length && selectedCoach.availabilityType !== "whole_week") {
      return Array.from({ length: 6 }, (_, index) => {
        const date = new Date();
        date.setDate(date.getDate() + index);
        return date.toISOString().split("T")[0];
      });
    }

    const dates: string[] = [];
    const today = new Date();

    for (let offset = 0; dates.length < 6; offset += 1) {
      const candidate = new Date(today);
      candidate.setDate(today.getDate() + offset);
      const dayName = candidate.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
      const shortName = dayName.slice(0, 3);
      const isAvailable =
        selectedCoach.availabilityType === "whole_week" ||
        normalizedDays.some(
          (day) =>
            day === dayName ||
            day.startsWith(shortName) ||
            day === shortName,
        );

      if (isAvailable) {
        dates.push(candidate.toISOString().split("T")[0]);
      }
    }

    return dates;
  }, [selectedCoach?._id, selectedCoach?.availabilityType, selectedCoach?.availableDays]);

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
          availabilityType: account.availabilityType,
          availableDays: account.availableDays,
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

  const next = async () => {
    if (step === 1) {
      if (!form.fullName.trim()) {
        return showToast("Please enter your full name", "error");
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!form.email.trim()) {
        return showToast("Please enter your email address", "error");
      }
      setStep(3);
      return;
    }

    if (step === 3) {
      if (!form.phoneNumber.trim()) {
        return showToast("Please enter your phone number", "error");
      }
      setStep(4);
      return;
    }

    if (step === 4) {
      if (!selectedProgram) {
        return showToast("Choose a coaching service", "error");
      }
      if (!hasCoachForSelectedProgram) {
        return showToast(
          "No coach is currently available for this coaching program",
          "error",
          5000,
        );
      }
      setStep(5);
      return;
    }

    setStep(6);
  };

  const submitBooking = async () => {
    if (!form.fullName.trim() || !form.email.trim() || !form.phoneNumber.trim()) {
      showToast("Complete your name, email, and phone number first", "error");
      return;
    }
    if (!selectedProgramData || !selectedCoach) {
      showToast("Please select a coach and a coaching service", "error");
      return;
    }
    if (!selectedSlot && !form.preferredDate) {
      showToast("Choose an available date or slot before submitting", "error");
      return;
    }

    const slotLabel =
      selectedSlot ||
      `${new Date(form.preferredDate).toLocaleDateString([], {
        month: "short",
        day: "numeric",
      })}${form.preferredTime ? ` at ${form.preferredTime}` : ""}`;

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
      setStep(6);
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

  const openBookingModal = (coachId: string) => {
    setSelectedCoachId(coachId);
    setSelectedProgram(
      getCoachProgramIds(
        coaches.find((coach) => coach._id === coachId)?.specialization || "",
      )[0] || selectedProgram,
    );
    setStep(1);
    setIsBookingModalOpen(true);
    setForm((current) => ({
      ...current,
      fullName: "",
      email: "",
      phoneNumber: "",
      preferredDate: "",
      preferredTime: "",
      goals: "",
    }));
  };

  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
    setStep(1);
    setRequestSent(false);
    setForm((current) => ({
      ...current,
      fullName: "",
      email: "",
      phoneNumber: "",
      preferredDate: "",
      preferredTime: "",
      goals: "",
    }));
  };

  return (
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
                      document
                        .getElementById("discovery-call")
                        ?.scrollIntoView({ behavior: "smooth" });
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
            {coaches.map((coach) => {
              const availableToday = isCoachAvailableToday(coach);
              return (
                <article
                  className="uw-coach-card"
                  key={coach._id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      position: "absolute",
                      top: "12px",
                      left: "12px",
                      zIndex: 1,
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 12px 6px 10px",
                        borderRadius: "999px",
                        background: availableToday
                          ? "rgba(5, 85, 18, 0.92)"
                          : "rgba(30, 32, 28, 0.82)",
                        backdropFilter: "blur(6px)",
                        WebkitBackdropFilter: "blur(6px)",
                        boxShadow: "0 4px 14px rgba(0, 0, 0, 0.18)",
                        color: "#fff",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        lineHeight: 1,
                      }}
                    >
                      <span
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: availableToday ? "#4ade80" : "#f87171",
                          boxShadow: availableToday
                            ? "0 0 0 3px rgba(74, 222, 128, 0.25)"
                            : "0 0 0 3px rgba(248, 113, 113, 0.25)",
                          flexShrink: 0,
                        }}
                      />
                      {availableToday ? "Available today" : "Unavailable today"}
                    </span>
                  </div>
                  <img
                    src={coach.photo || fallbackCoaches[0].photo}
                    alt={coach.name}
                    style={{
                      width: "100%",
                      height: "220px",
                      objectFit: "cover",
                      borderRadius: "16px",
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    <h3 style={{ margin: 0 }}>{coach.name}</h3>
                    {!isBookingModalOpen && (
                      <>
                        <p style={{ margin: 0, color: "var(--clr-ink-soft)" }}>
                          {coach.bio ||
                            "Executive coach focused on clarity, courage, and connection."}
                        </p>
                        <div
                          style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
                        >
                          {(coach.expertise || ["Executive leadership"])
                            .slice(0, 3)
                            .map((item) => (
                              <span
                                key={item}
                                style={{
                                  padding: "6px 10px",
                                  background: "rgba(29, 42, 56, 0.06)",
                                  borderRadius: "999px",
                                  fontSize: "0.8rem",
                                  color: "var(--clr-ink-soft)",
                                }}
                              >
                                {item}
                              </span>
                            ))}
                        </div>
                        <dl style={{ display: "grid", gap: "10px", margin: 0 }}>
                          <div>
                            <dt
                              style={{
                                fontSize: "0.75rem",
                                textTransform: "uppercase",
                                color: "var(--clr-ink-soft)",
                              }}
                            >
                              Languages
                            </dt>
                            <dd style={{ margin: "4px 0 0", fontWeight: 600 }}>
                              {(coach.languages || ["English"]).join(", ")}
                            </dd>
                          </div>
                          <div>
                            <dt
                              style={{
                                fontSize: "0.75rem",
                                textTransform: "uppercase",
                                color: "var(--clr-ink-soft)",
                              }}
                            >
                              Availability
                            </dt>
                            <dd style={{ margin: "4px 0 0", fontWeight: 600 }}>
                              {coach.availabilitySummary || "By discovery call"}
                            </dd>
                          </div>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              padding: "6px 10px",
                              borderRadius: "999px",
                              background: "rgba(29, 42, 56, 0.06)",
                              color: "var(--clr-ink-soft)",
                              fontSize: "0.78rem",
                              fontWeight: 700,
                            }}
                          >
                            {coach.experience || 10} years of experience
                          </span>
                        </dl>
                      </>
                    )}
                    <button
                       className="uw-btn uw-btn-quiet"
                       style={{ color: "var(--uw-sage-dark)" }}
                       onClick={() => openProfileModal(coach)}
                     >
                       Full View Profile
                     </button>
                    <button
                      className="uw-btn uw-btn-secondary"
                      onClick={() => openBookingModal(coach._id)}
                    >
                      Book Discovery Call
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {isBookingModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(7, 15, 23, 0.85)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            zIndex: 2000,
            overflowY: "auto",
            padding: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Discovery call booking"
        >
          <div
            style={{
              maxWidth: "720px",
              width: "100%",
              position: "relative",
            }}
          >
            <button
              type="button"
              onClick={closeBookingModal}
              style={{
                position: "absolute",
                top: "-44px",
                right: "0",
                zIndex: 1,
                border: "none",
                background: "rgba(255,255,255,0.95)",
                color: "#111827",
                width: "40px",
                height: "40px",
                borderRadius: "999px",
                cursor: "pointer",
                fontSize: "1.1rem",
              }}
              aria-label="Close booking form"
            >
              ×
            </button>
            <section id="discovery-call" className="uw-section uw-booking-section" style={{ padding: 0 }}>
              <div className="uw-container" style={{ width: "100%", padding: 0, margin: 0 }}>
                <div className="uw-booking-card" style={{ boxShadow: "var(--uw-shadow)" }}>
                  {step === 1 && (
                    <div className="uw-form-panel">
                      <h3>Step 1: Your full name</h3>
                      <p>Let us know how to address you.</p>
                      <label>
                        Full Name
                        <input
                          value={form.fullName}
                          onChange={(e) =>
                            setForm({ ...form, fullName: e.target.value })
                          }
                        />
                      </label>
                      <div className="uw-form-actions">
                        <button className="uw-btn uw-btn-primary" onClick={next}>
                          Continue
                        </button>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="uw-form-panel">
                      <h3>Step 2: Your email address</h3>
                      <p>We’ll use this to confirm your discovery call.</p>
                      <label>
                        Email
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />
                      </label>
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
                      <h3>Step 3: Your phone number</h3>
                      <p>So we can reach you about the booking.</p>
                      <label>
                        Phone Number
                        <input
                          value={form.phoneNumber}
                          onChange={(e) =>
                            setForm({ ...form, phoneNumber: e.target.value })
                          }
                        />
                      </label>
                      <div className="uw-form-actions">
                        <button
                          className="uw-btn uw-btn-quiet"
                          onClick={() => setStep(2)}
                        >
                          Back
                        </button>
                        <button className="uw-btn uw-btn-primary" onClick={next}>
                          Continue
                        </button>
                      </div>
                    </div>
                  )}

                  {step === 4 && (
                    <div className="uw-form-panel">
                      <h3>Step 4: Choose the coaching service</h3>
                      <p>Select whether you want an individual or group discovery call.</p>
                      <div className="uw-choice-list">
                        {programs.map((program) => (
                          <button
                            key={program.id}
                            className={selectedProgram === program.id ? "selected" : ""}
                            onClick={() => {
                              setSelectedProgram(program.id);
                              setForm({ ...form, coachingType: program.title });
                            }}
                          >
                            <strong>{program.title}</strong>
                            <span>{program.duration || "Discovery call"}</span>
                          </button>
                        ))}
                      </div>
                      <div className="uw-form-actions">
                        <button
                          className="uw-btn uw-btn-quiet"
                          onClick={() => setStep(3)}
                        >
                          Back
                        </button>
                        <button className="uw-btn uw-btn-primary" onClick={next}>
                          Continue
                        </button>
                      </div>
                    </div>
                  )}

                  {step === 5 && (
                    <div className="uw-form-panel">
                      <h3>Step 5: Pick your preferred time</h3>
                      <p>
                        {selectedCoach
                          ? `We’ll check ${selectedCoach.name}'s availability first.`
                          : "We’ll check the selected coach’s availability first."}
                      </p>
                      {selectedCoach && (
                        <p className="uw-assigned">Coach: {selectedCoach.name}</p>
                      )}

                      {slots.length > 0 ? (
                        <>
                          <div className="uw-slot-grid">
                            {slotOptions.map((slot) => (
                              <button
                                key={slot.value}
                                className={selectedSlot === slot.value ? "selected" : ""}
                                onClick={() => {
                                  setSelectedSlot(slot.value);
                                  setForm({
                                    ...form,
                                    preferredDate: slot.value.split("T")[0] || "",
                                    preferredTime: slot.value.includes("T")
                                      ? new Date(slot.value).toLocaleTimeString([], {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })
                                      : "",
                                  });
                                }}
                              >
                                {slot.label}
                              </button>
                            ))}
                          </div>
                        </>
                      ) : (
                        <>
                          <p>
                            There are no open slots right now. Choose one of the coach’s
                            suggested dates below.
                          </p>
                          <div className="uw-slot-grid">
                            {suggestedAvailabilityDates.map((date) => (
                              <button
                                key={date}
                                className={form.preferredDate === date ? "selected" : ""}
                                onClick={() =>
                                  setForm({ ...form, preferredDate: date })
                                }
                              >
                                {new Date(date).toLocaleDateString([], {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </button>
                            ))}
                          </div>
                        </>
                      )}

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
                          Optional Time
                          <input
                            type="time"
                            value={form.preferredTime}
                            onChange={(e) =>
                              setForm({ ...form, preferredTime: e.target.value })
                            }
                          />
                        </label>
                      </div>
                      <label className="wide">
                        What would you like to focus on in the session? (optional)
                        <textarea
                          rows={3}
                          placeholder="e.g. confidence, boundaries, leadership presence"
                          value={form.goals}
                          onChange={(e) => setForm({ ...form, goals: e.target.value })}
                        />
                      </label>
                      <div className="uw-form-actions">
                        <button
                          className="uw-btn uw-btn-quiet"
                          onClick={() => setStep(4)}
                        >
                          Back
                        </button>
                        <button
                          className="uw-btn uw-btn-primary"
                          onClick={submitBooking}
                          disabled={submitting}
                        >
                          {submitting ? "Submitting..." : "Submit discovery call"}
                        </button>
                      </div>
                    </div>
                  )}

                  {step === 6 && !requestSent && (
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
                        }}
                      >
                        Book another call
                      </button>
                    </div>
                  )}

                  {step === 6 && requestSent && (
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
                        }}
                      >
                        Done
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      )}

      {!isBookingModalOpen && (
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
      )}
      {!isBookingModalOpen && (
        <section id="mission" className="uw-section uw-band">
          <div className="uw-container uw-statement-grid">
            <article>
              <span className="uw-kicker">Mission</span>
              <h2>Empowering leaders to own their voice.</h2>
              <p>
                Unwantra Coaching strengthens confidence, boundaries, influence,
                and values-based leadership through transformational executive
                coaching.
              </p>
            </article>
            <article>
              <span className="uw-kicker">Why we exist</span>
              {/* <h2>Because leadership should feel both brave and whole.</h2>
              <p>
                We exist for leaders who are done performing confidence and ready
                to lead from clarity, compassion, and deeply held values.
              </p> */}
              <p>
                We help leaders own their voice, lead with integrity and live with
                intention through transformational coaching that strengthens
                confidence, boudaries, influence and values-based leadership.
              </p>
            </article>
            <article className="uw-kicker">
              <p>Vision</p>
              <p>Leaders leading with courage, clarity, and compassion.</p>
              <div className="uw-values">
                <span>Courage</span>
                <span>Clarity</span>
                <span>Connection</span>
              </div>
            </article>
          </div>
        </section>
      )}
      {!isBookingModalOpen && (
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
                          Our story began with a simple conviction: leadership
                          development should be <strong>deeply human</strong>,{" "}
                          <strong>transformative</strong>, and{" "}
                          <strong>grounded in values</strong>.
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
      )}
      {!isBookingModalOpen && (
        <section id="contact" className="uw-section uw-contact">
          <div className="uw-container uw-contact-grid">
            <div>
              <span className="uw-kicker">Contact us</span>
              <h2>Start the conversation.</h2>
              <p>
                Tell us what you are navigating and the kind of leadership support
                you need.
              </p>
              <div className="uw-data-note">
                <strong>How your data supports coaching</strong>
                <p>
                  We use your contact details to respond to your enquiry and your
                  coaching goals to understand demand, recommend the most relevant
                  coaching pathway, improve coach matching, and identify common
                  leadership themes across the platform. Your submission is used
                  for coaching operations and platform insight, not for selling
                  unrelated services.
                </p>
              </div>
            </div>
            <form
              className="uw-contact-form"
              onSubmit={async (event) => {
                event.preventDefault();
                const formEl = event.currentTarget;
                const formData = new FormData(formEl);
                try {
                  const response = await fetch(`${API_BASE_URL}/api/contact`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      name: String(formData.get("name") || ""),
                      email: String(formData.get("email") || ""),
                      phone: String(formData.get("phone") || ""),
                      interest: String(formData.get("interest") || ""),
                      goals: String(formData.get("goals") || ""),
                      source: "contact-us",
                    }),
                  });

                  if (!response.ok) {
                    const error = await response.json().catch(() => null);
                    throw new Error(
                      error?.message || "Could not submit contact form",
                    );
                  }

                  showToast(
                    "Thank you. The Unwantra team will follow up by email.",
                    "success",
                  );
                  formEl.reset();
                } catch (error) {
                  showToast(
                    error instanceof Error
                      ? error.message
                      : "Could not submit contact form",
                    "error",
                    5000,
                  );
                }
              }}
            >
              <input name="name" placeholder="Name" required />
              <input name="email" type="email" placeholder="Email" required />
              <input
                name="phone"
                placeholder="Phone number with country code"
                required
              />
              <select name="interest" required defaultValue="">
                <option value="" disabled>
                  Coaching Interest
                </option>
                <option value="Individual Executive Coaching">
                  Individual Executive Coaching
                </option>
                <option value="Group Executive Coaching">
                  Group Executive Coaching
                </option>
                {/* <option value="Both">Both</option> */}
              </select>
              <textarea name="goals" placeholder="Goals" rows={5} required />
              <button className="uw-btn uw-btn-primary" type="submit">
                Send message
              </button>
            </form>
          </div>
        </section>
      )}
      {isProfileModalOpen && selectedProfileCoach && (
        <CoachProfileModal
          coach={selectedProfileCoach}
          getInitials={getInitials}
          getProgramLabel={getProgramLabel}
          renderStars={renderStars}
          onClose={closeProfileModal}
          onBook={(coach) => openBookingModal(coach._id)}
        />
      )}
    </>
  );
};

export default MainContent;
