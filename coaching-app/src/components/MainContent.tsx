import React, { useEffect, useMemo, useState } from "react";
import type { Booking, Coach, CoachSlot, Program, Testimonial } from "../types";
import { coachMatchesProgram } from "../utils/programs";
import CoachProfileModal from "./CoachProfileModal";
import PhoneInput from "./PhoneInput";
import AIChatWidget from "./AIChatWidget";

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
    countryCode: "+254",
    goals: "",
    preferredDate: "",
    preferredTime: "",
    coachingType: "Discovery call",
  });

  const [requestSent, setRequestSent] = useState(false);
  const [selectedProfileCoach, setSelectedProfileCoach] =
    useState<Coach | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const [quickStep, setQuickStep] = useState(1);
  const [quickForm, setQuickForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    countryCode: "+254",
    goals: "",
    preferredDate: "",
    preferredTime: "",
    coachingType: "individual-executive",
  });
  const [quickSelectedCoachId, setQuickSelectedCoachId] = useState("");
  const [quickSelectedSlotId, setQuickSelectedSlotId] = useState("");
  const [quickSubmitting, setQuickSubmitting] = useState(false);
  const [quickRequestSent, setQuickRequestSent] = useState(false);
  const [quickCoachMode, setQuickCoachMode] = useState<"auto" | "manual" | "">(
    "",
  );
  const [assignedCoach, setAssignedCoach] = useState<Coach | null>(null);
  const [quickSlots, setQuickSlots] = useState<CoachSlot[]>([]);

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

  const renderStars = (rating: number) =>
    "★".repeat(Math.round(rating)) + "☆".repeat(5 - Math.round(rating));

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

    if (
      !normalizedDays.length &&
      selectedCoach.availabilityType !== "whole_week"
    ) {
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
      const dayName = candidate
        .toLocaleDateString("en-US", { weekday: "long" })
        .toLowerCase();
      const shortName = dayName.slice(0, 3);
      const isAvailable =
        selectedCoach.availabilityType === "whole_week" ||
        normalizedDays.some(
          (day) =>
            day === dayName || day.startsWith(shortName) || day === shortName,
        );

      if (isAvailable) {
        dates.push(candidate.toISOString().split("T")[0]);
      }
    }

    return dates;
  }, [
    selectedCoach?._id,
    selectedCoach?.availabilityType,
    selectedCoach?.availableDays,
  ]);

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
      const cleaned = form.phoneNumber.replace(/[^\d]/g, "");
      if (!form.phoneNumber.trim() || cleaned.length < 5) {
        return showToast("Please enter a valid phone number", "error");
      }
      if (!form.countryCode) {
        return showToast("Please select a country code", "error");
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
    if (
      !form.fullName.trim() ||
      !form.email.trim() ||
      !form.phoneNumber.trim() ||
      !form.countryCode
    ) {
      showToast("Complete your name, email, and phone number first", "error");
      return;
    }
    const cleanedPhone = form.phoneNumber.replace(/[^\d]/g, "");
    if (cleanedPhone.length < 5) {
      showToast("Please enter a valid phone number", "error");
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
      const shouldRequestSlot = !selectedSlot;

      if (shouldRequestSlot) {
        const response = await fetch(`${API_BASE_URL}/api/slot-requests`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: form.fullName,
            email: form.email,
            phoneNumber: `${form.countryCode}${cleanedPhone}`,
            programName: selectedProgram,
            coachId: selectedCoach._id,
            coachName: selectedCoach.name,
            coachEmail: selectedCoach.email,
            message: form.goals,
            requestedDate: form.preferredDate,
            requestedTime: form.preferredTime,
          }),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => null);
          throw new Error(error?.message || "Could not submit slot request");
        }

        setRequestSent(true);
        showToast(
          "Your slot request has been sent to the coach. A confirmation email is on the way.",
          "success",
          5000,
        );
        setStep(6);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/bookings/book-slot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          phoneNumber: `${form.countryCode}${cleanedPhone}`,
          programName: selectedProgram,
          coachId: selectedCoach._id,
          coachName: selectedCoach.name,
          coachEmail: selectedCoach.email,
          coachPhone: selectedCoach.phone,
          bookingTime: slotLabel,
          slotId: slots.find((slot) => slot.bookingDate === selectedSlot)?._id,
          meetingLink: slots.find((slot) => slot.bookingDate === selectedSlot)
            ?.meetingLink,
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
      countryCode: "+254",
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
      countryCode: "+254",
      preferredDate: "",
      preferredTime: "",
      goals: "",
    }));
  };

  const resetQuickBooking = () => {
    setQuickStep(1);
    setQuickForm({
      fullName: "",
      email: "",
      phoneNumber: "",
      countryCode: "+254",
      goals: "",
      preferredDate: "",
      preferredTime: "",
      coachingType: "individual-executive",
    });
    setQuickSelectedCoachId("");
    setQuickSelectedSlotId("");
    setQuickRequestSent(false);
    setQuickCoachMode("");
    setAssignedCoach(null);
    setQuickSlots([]);
  };

  useEffect(() => {
    const loadQuickSlots = async () => {
      const coach = coaches.find((c) => c._id === quickSelectedCoachId);
      if (!coach?.email) {
        setQuickSlots([]);
        return;
      }
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/bookings/coach-slots?coachEmail=${encodeURIComponent(coach.email)}`,
        );
        if (!res.ok) return;
        const data = await res.json();
        setQuickSlots(
          (data.slots || []).filter(
            (slot: CoachSlot) => slot.status === "open",
          ),
        );
      } catch {
        setQuickSlots([]);
      }
    };
    loadQuickSlots();
  }, [quickSelectedCoachId, coaches, API_BASE_URL]);

  const nextQuickStep = async () => {
    if (quickStep === 3) {
      const cleaned = quickForm.phoneNumber.replace(/[^\d]/g, "");
      if (!quickForm.phoneNumber.trim() || cleaned.length < 5) {
        showToast("Please enter a valid phone number", "error");
        return;
      }
    }

    if (quickStep === 6) {
      if (!quickForm.preferredDate) {
        showToast("Please select a date for your session", "error");
        return;
      }
    }

    if (quickStep === 7) {
      if (quickCoachMode === "auto") {
        setQuickSubmitting(true);
        try {
          const res = await fetch(`${API_BASE_URL}/api/bookings/assign-coach`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              programName: quickForm.coachingType,
              goals: quickForm.goals
                .split(",")
                .map((g) => g.trim())
                .filter(Boolean),
            }),
          });
          if (res.ok) {
            const result = await res.json();
            const coach = result.coach as Coach;
            setAssignedCoach(coach);
            setQuickSelectedCoachId(coach._id);
            await submitQuickBooking(coach);
          } else {
            showToast(
              "Could not assign a coach right now. Please try again or choose manually.",
              "error",
              5000,
            );
          }
        } catch {
          showToast(
            "Network error assigning coach. Please try again.",
            "error",
            5000,
          );
        } finally {
          setQuickSubmitting(false);
        }
        return;
      }
      if (quickCoachMode === "manual" && !quickSelectedCoachId) {
        showToast("Please select a coach before continuing", "error");
        return;
      }
      const selectedCoach = coaches.find((c) => c._id === quickSelectedCoachId);
      if (selectedCoach) {
        await submitQuickBooking(selectedCoach);
      }
      return;
    }

    setQuickStep((s) => s + 1);
  };

  const prevQuickStep = () => {
    setQuickStep((s) => Math.max(1, s - 1));
  };

  const submitQuickBooking = async (coach: Coach) => {
    const cleanedPhone = quickForm.phoneNumber.replace(/[^\d]/g, "");
    const slotLabel = quickForm.preferredDate
      ? `${new Date(quickForm.preferredDate).toLocaleDateString([], { month: "short", day: "numeric" })}${quickForm.preferredTime ? ` at ${quickForm.preferredTime}` : ""}`
      : "Flexible timing";

    setQuickSubmitting(true);
    try {
      const selectedSlot = quickSlots.find(
        (slot) => slot._id === quickSelectedSlotId,
      );
      const shouldRequestSlot = !selectedSlot;

      if (shouldRequestSlot) {
        const response = await fetch(`${API_BASE_URL}/api/slot-requests`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: quickForm.fullName,
            email: quickForm.email,
            phoneNumber: `${quickForm.countryCode}${cleanedPhone}`,
            programName: quickForm.coachingType,
            coachId: coach._id,
            coachName: coach.name,
            coachEmail: coach.email,
            message: quickForm.goals,
            requestedDate: quickForm.preferredDate,
            requestedTime: quickForm.preferredTime,
          }),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => null);
          throw new Error(error?.message || "Could not submit slot request");
        }

        setAssignedCoach(coach);
        setQuickRequestSent(true);
        showToast(
          "Your slot request has been sent. The coach will review and confirm by email.",
          "success",
          5000,
        );
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/bookings/book-slot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: quickForm.fullName,
          email: quickForm.email,
          phoneNumber: `${quickForm.countryCode}${cleanedPhone}`,
          programName: quickForm.coachingType,
          coachId: coach._id,
          coachName: coach.name,
          coachEmail: coach.email,
          coachPhone: coach.phone,
          bookingTime: slotLabel,
          slotId: selectedSlot._id,
          meetingLink: selectedSlot.meetingLink,
          goals: quickForm.goals
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

      setAssignedCoach(coach);
      setQuickRequestSent(true);
      showToast(
        "Discovery call booked. Confirmation sent by email.",
        "success",
        5000,
      );
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Could not complete booking",
        "error",
        6000,
      );
    } finally {
      setQuickSubmitting(false);
    }
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
                <article className="uw-coach-card" key={coach._id}>
                  <div className="uw-coach-badge">
                    <span
                      className="uw-coach-status-pill"
                      style={{
                        background: availableToday
                          ? "rgba(5, 85, 18, 0.92)"
                          : "rgba(30, 32, 28, 0.82)",
                        boxShadow: "0 4px 14px rgba(0, 0, 0, 0.18)",
                      }}
                    >
                      <span
                        className="uw-coach-status-dot"
                        style={{
                          background: availableToday ? "#4ade80" : "#f87171",
                          boxShadow: availableToday
                            ? "0 0 0 3px rgba(74, 222, 128, 0.25)"
                            : "0 0 0 3px rgba(248, 113, 113, 0.25)",
                        }}
                      />
                      {availableToday ? "Available today" : "Unavailable today"}
                    </span>
                  </div>
                  <img
                    src={coach.photo || fallbackCoaches[0].photo}
                    alt={coach.name}
                    className="uw-coach-media"
                  />
                  <div className="uw-coach-body">
                    <h3>{coach.name}</h3>
                    {!isBookingModalOpen && (
                      <>
                        <p>
                          {coach.bio ||
                            "Executive coach focused on clarity, courage, and connection."}
                        </p>
                        <div className="uw-coach-tags">
                          {(coach.expertise || ["Executive leadership"])
                            .slice(0, 3)
                            .map((item) => (
                              <span key={item} className="uw-coach-tag">
                                {item}
                              </span>
                            ))}
                        </div>
                        <dl className="uw-coach-meta">
                          <div>
                            <dt>Languages</dt>
                            <dd>
                              {(coach.languages || ["English"]).join(", ")}
                            </dd>
                          </div>
                          <div>
                            <dt>Availability</dt>
                            <dd>
                              {coach.availabilitySummary || "By discovery call"}
                            </dd>
                          </div>
                          <div>
                            <dt>Experience</dt>
                            <dd>{coach.experience || 10} years</dd>
                          </div>
                        </dl>
                      </>
                    )}
                  </div>
                  <div className="uw-coach-actions">
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

      <section id="quick-book" className="uw-section uw-band">
        <div className="uw-container">
          <div className="uw-section-head">
            <span className="uw-kicker">Book a discovery call</span>
            <h2>Ready to get started?</h2>
            <p>
              Tell us a little about yourself and we will match you with the
              right coach or let you choose your own.
            </p>
          </div>

          {!quickRequestSent ? (
            <div className="uw-booking-card">
              {quickStep === 1 && (
                <div className="uw-form-panel">
                  <h3>Step 1: Your full name</h3>
                  <p>What name should we use for the booking?</p>
                  <label>
                    Full Name
                    <input
                      value={quickForm.fullName}
                      onChange={(e) =>
                        setQuickForm({ ...quickForm, fullName: e.target.value })
                      }
                      placeholder="Enter your full name"
                    />
                  </label>
                  <div className="uw-form-actions">
                    <button
                      className="uw-btn uw-btn-primary"
                      onClick={nextQuickStep}
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {quickStep === 2 && (
                <div className="uw-form-panel">
                  <h3>Step 2: Your email address</h3>
                  <p>We will send confirmations and session details here.</p>
                  <label>
                    Email Address
                    <input
                      type="email"
                      value={quickForm.email}
                      onChange={(e) =>
                        setQuickForm({ ...quickForm, email: e.target.value })
                      }
                      placeholder="you@example.com"
                    />
                  </label>
                  <div className="uw-form-actions">
                    <button
                      className="uw-btn uw-btn-quiet"
                      onClick={prevQuickStep}
                    >
                      Back
                    </button>
                    <button
                      className="uw-btn uw-btn-primary"
                      onClick={nextQuickStep}
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {quickStep === 3 && (
                <div className="uw-form-panel">
                  <h3>Step 3: Your phone number</h3>
                  <p>So we can reach you about the booking.</p>
                  <label>
                    Phone Number
                    <PhoneInput
                      value={quickForm.phoneNumber}
                      countryCode={quickForm.countryCode}
                      onChange={(phoneNumber, countryCode) =>
                        setQuickForm({ ...quickForm, phoneNumber, countryCode })
                      }
                    />
                  </label>
                  <div className="uw-form-actions">
                    <button
                      className="uw-btn uw-btn-quiet"
                      onClick={prevQuickStep}
                    >
                      Back
                    </button>
                    <button
                      className="uw-btn uw-btn-primary"
                      onClick={nextQuickStep}
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {quickStep === 4 && (
                <div className="uw-form-panel">
                  <h3>Step 4: Choose the coaching service</h3>
                  <p>
                    Select whether you want an individual or group coaching
                    session.
                  </p>
                  <div className="uw-choice-list">
                    {programs.map((program) => (
                      <button
                        key={program.id}
                        className={
                          quickForm.coachingType === program.id
                            ? "selected"
                            : ""
                        }
                        onClick={() =>
                          setQuickForm({
                            ...quickForm,
                            coachingType: program.id,
                          })
                        }
                      >
                        <strong>{program.title}</strong>
                        <span>{program.duration || "Discovery call"}</span>
                      </button>
                    ))}
                  </div>
                  <div className="uw-form-actions">
                    <button
                      className="uw-btn uw-btn-quiet"
                      onClick={prevQuickStep}
                    >
                      Back
                    </button>
                    <button
                      className="uw-btn uw-btn-primary"
                      onClick={nextQuickStep}
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {quickStep === 5 && (
                <div className="uw-form-panel">
                  <h3>Step 5: Choose your coach</h3>
                  <p>
                    Would you like to choose a coach yourself, or should we
                    assign the best available coach for you?
                  </p>
                  <div className="uw-choice-list">
                    <button
                      className={quickCoachMode === "auto" ? "selected" : ""}
                      onClick={() => {
                        setQuickCoachMode("auto");
                        setQuickSelectedCoachId("");
                      }}
                    >
                      <strong>Assign for me</strong>
                      <span>
                        We will pick the best coach based on availability
                      </span>
                    </button>
                    <button
                      className={quickCoachMode === "manual" ? "selected" : ""}
                      onClick={() => setQuickCoachMode("manual")}
                    >
                      <strong>Choose my coach</strong>
                      <span>Browse coaches and select one yourself</span>
                    </button>
                  </div>

                  {quickCoachMode === "manual" && (
                    <div style={{ marginTop: 18 }}>
                      {(() => {
                        const eligible = coaches.filter((coach) =>
                          coachMatchesProgram(
                            coach.specialization,
                            quickForm.coachingType,
                          ),
                        );
                        const selectedCoach = coaches.find(
                          (c) => c._id === quickSelectedCoachId,
                        );
                        if (!eligible.length) {
                          return (
                            <p style={{ color: "var(--uw-muted)" }}>
                              No coaches are currently available for this
                              program. Please try auto-assign or another
                              service.
                            </p>
                          );
                        }
                        return (
                          <div style={{ display: "grid", gap: 12 }}>
                            <label className="uw-field">
                              <span>Choose a coach</span>
                              <select
                                value={quickSelectedCoachId}
                                onChange={(e) =>
                                  setQuickSelectedCoachId(e.target.value)
                                }
                              >
                                <option value="">Select a coach...</option>
                                {eligible.map((coach) => (
                                  <option key={coach._id} value={coach._id}>
                                    {coach.name} — {coach.experience || 10}{" "}
                                    years
                                  </option>
                                ))}
                              </select>
                            </label>
                            {selectedCoach && (
                              <div
                                className="uw-booking-card"
                                style={{ padding: 16, display: "grid", gap: 8 }}
                              >
                                <strong style={{ fontSize: "1rem" }}>
                                  {selectedCoach.name}
                                </strong>
                                <span
                                  style={{
                                    color: "var(--uw-muted)",
                                    fontSize: "0.9rem",
                                  }}
                                >
                                  {selectedCoach.bio?.slice(0, 160) ||
                                    "Executive coach"}
                                </span>
                                <div
                                  style={{
                                    display: "flex",
                                    gap: 8,
                                    flexWrap: "wrap",
                                  }}
                                >
                                  {(
                                    selectedCoach.expertise || [
                                      "Executive leadership",
                                    ]
                                  )
                                    .slice(0, 3)
                                    .map((item) => (
                                      <span key={item} className="uw-coach-tag">
                                        {item}
                                      </span>
                                    ))}
                                </div>
                                <span
                                  style={{
                                    fontSize: "0.85rem",
                                    color: "var(--uw-sage-dark)",
                                    fontWeight: 700,
                                  }}
                                >
                                  Languages:{" "}
                                  {(
                                    selectedCoach.languages || ["English"]
                                  ).join(", ")}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  <div className="uw-form-actions">
                    <button
                      className="uw-btn uw-btn-quiet"
                      onClick={prevQuickStep}
                    >
                      Back
                    </button>
                    <button
                      className="uw-btn uw-btn-primary"
                      onClick={nextQuickStep}
                      disabled={quickSubmitting || !quickCoachMode}
                    >
                      {quickSubmitting ? "Assigning coach..." : "Continue"}
                    </button>
                  </div>
                </div>
              )}

              {quickStep === 6 && (
                <div className="uw-form-panel">
                  <h3>Step 6: Pick your preferred date</h3>
                  <p>Date is required. Time is optional.</p>

                  {quickSlots.length > 0 ? (
                    <div>
                      <strong
                        style={{
                          fontSize: "0.85rem",
                          color: "var(--uw-sage-dark)",
                        }}
                      >
                        Available slots:
                      </strong>
                      <div className="uw-slot-grid" style={{ marginTop: 8 }}>
                        {quickSlots.map((slot) => (
                          <button
                            key={slot._id}
                            type="button"
                            onClick={() => {
                              const dateStr = new Date(slot.bookingDate)
                                .toISOString()
                                .split("T")[0];
                              const timeStr = new Date(
                                slot.bookingDate,
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              });
                              setQuickForm({
                                ...quickForm,
                                preferredDate: dateStr,
                                preferredTime: timeStr,
                              });
                              setQuickSelectedSlotId(slot._id);
                            }}
                            className={
                              quickSelectedSlotId === slot._id ? "selected" : ""
                            }
                          >
                            <strong>
                              {new Date(slot.bookingDate).toLocaleDateString(
                                [],
                                {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </strong>
                            <span>
                              at{" "}
                              {new Date(slot.bookingDate).toLocaleTimeString(
                                [],
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p style={{ color: "var(--uw-muted)", marginBottom: 8 }}>
                        No open slots right now. Choose a preferred date based
                        on the coach’s availability and we’ll send a request for
                        approval.
                      </p>
                      {(() => {
                        const selectedCoach = coaches.find(
                          (c) => c._id === quickSelectedCoachId,
                        );
                        if (!selectedCoach) return null;
                        const normalizedDays = (
                          selectedCoach.availableDays || []
                        )
                          .map((day) => day.trim().toLowerCase())
                          .filter(Boolean);
                        const dates: string[] = [];
                        const today = new Date();
                        for (let offset = 0; dates.length < 6; offset += 1) {
                          const candidate = new Date(today);
                          candidate.setDate(today.getDate() + offset);
                          const dayName = candidate
                            .toLocaleDateString("en-US", { weekday: "long" })
                            .toLowerCase();
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
                        if (!dates.length)
                          return (
                            <p style={{ color: "var(--uw-muted)" }}>
                              This coach has not set specific availability days
                              yet.
                            </p>
                          );
                        return (
                          <div className="uw-slot-grid">
                            {dates.map((date) => (
                              <button
                                key={date}
                                type="button"
                                className={
                                  quickForm.preferredDate === date
                                    ? "selected"
                                    : ""
                                }
                                onClick={() => {
                                  setQuickForm({
                                    ...quickForm,
                                    preferredDate: date,
                                  });
                                  setQuickSelectedSlotId("");
                                }}
                              >
                                <strong>
                                  {new Date(date).toLocaleDateString([], {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </strong>
                              </button>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  <label>
                    Preferred Date
                    <input
                      type="date"
                      value={quickForm.preferredDate}
                      onChange={(e) =>
                        setQuickForm({
                          ...quickForm,
                          preferredDate: e.target.value,
                        })
                      }
                    />
                  </label>
                  <label>
                    Optional Time
                    <input
                      type="time"
                      value={quickForm.preferredTime}
                      onChange={(e) =>
                        setQuickForm({
                          ...quickForm,
                          preferredTime: e.target.value,
                        })
                      }
                    />
                  </label>

                  <div className="uw-form-actions">
                    <button
                      className="uw-btn uw-btn-quiet"
                      onClick={prevQuickStep}
                    >
                      Back
                    </button>
                    <button
                      className="uw-btn uw-btn-primary"
                      onClick={nextQuickStep}
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {quickStep === 7 && (
                <div className="uw-form-panel">
                  <h3>Step 7: Session goals</h3>
                  <p>What would you like to focus on? (optional)</p>
                  <label>
                    Goals
                    <textarea
                      rows={3}
                      value={quickForm.goals}
                      onChange={(e) =>
                        setQuickForm({ ...quickForm, goals: e.target.value })
                      }
                      placeholder="e.g. confidence, boundaries, leadership presence"
                    />
                  </label>
                  <div className="uw-form-actions">
                    <button
                      className="uw-btn uw-btn-quiet"
                      onClick={prevQuickStep}
                    >
                      Back
                    </button>
                    <button
                      className="uw-btn uw-btn-primary"
                      onClick={nextQuickStep}
                    >
                      Submit request
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="uw-confirmation">
              <span>Confirmed</span>
              <h3>Your discovery call request has been received.</h3>
              <p>
                We will send booking confirmation, approval updates, and any
                reschedule notices by email.
              </p>
              {assignedCoach && (
                <div className="uw-request-details-panel">
                  <div className="uw-request-detail-row">
                    <span>Assigned Coach</span>
                    <strong>{assignedCoach.name}</strong>
                  </div>
                  <div className="uw-request-detail-row">
                    <span>Coach Email</span>
                    <strong>{assignedCoach.email}</strong>
                  </div>
                </div>
              )}
              <button
                className="uw-btn uw-btn-primary"
                onClick={resetQuickBooking}
              >
                Book another call
              </button>
            </div>
          )}
        </div>
      </section>

      {isBookingModalOpen && (
        <div className="uw-booking-overlay" onClick={closeBookingModal}>
          <div
            className="uw-booking-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeBookingModal}
              className="uw-booking-close-btn"
              aria-label="Close booking form"
            >
              ×
            </button>
            <div className="booking-float-container">
              <section className="uw-booking-section">
                <div className="uw-booking-modal-body">
                  <div className="uw-booking-card">
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
                          <button
                            className="uw-btn uw-btn-primary"
                            onClick={next}
                          >
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
                            onChange={(e) =>
                              setForm({ ...form, email: e.target.value })
                            }
                          />
                        </label>
                        <div className="uw-form-actions">
                          <button
                            className="uw-btn uw-btn-quiet"
                            onClick={() => setStep(1)}
                          >
                            Back
                          </button>
                          <button
                            className="uw-btn uw-btn-primary"
                            onClick={next}
                          >
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
                          <PhoneInput
                            value={form.phoneNumber}
                            countryCode={form.countryCode}
                            onChange={(phoneNumber, countryCode) =>
                              setForm({ ...form, phoneNumber, countryCode })
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
                          <button
                            className="uw-btn uw-btn-primary"
                            onClick={next}
                          >
                            Continue
                          </button>
                        </div>
                      </div>
                    )}

                    {step === 4 && (
                      <div className="uw-form-panel">
                        <h3>Step 4: Choose the coaching service</h3>
                        <p>
                          Select whether you want an individual or group
                          discovery call.
                        </p>
                        <div className="uw-choice-list">
                          {(() => {
                            const coachProgramIds = selectedCoach
                              ? getCoachProgramIds(selectedCoach.specialization)
                              : [];
                            const availablePrograms = coachProgramIds.length
                              ? programs.filter((program) =>
                                  coachProgramIds.includes(program.id),
                                )
                              : programs;
                            if (!availablePrograms.length) {
                              return (
                                <p>
                                  This coach does not have any available
                                  programs at the moment.
                                </p>
                              );
                            }
                            return availablePrograms.map((program) => (
                              <button
                                key={program.id}
                                className={
                                  selectedProgram === program.id
                                    ? "selected"
                                    : ""
                                }
                                onClick={() => {
                                  setSelectedProgram(program.id);
                                  setForm({
                                    ...form,
                                    coachingType: program.title,
                                  });
                                }}
                              >
                                <strong>{program.title}</strong>
                                <span>
                                  {program.duration || "Discovery call"}
                                </span>
                              </button>
                            ));
                          })()}
                        </div>
                        <div className="uw-form-actions">
                          <button
                            className="uw-btn uw-btn-quiet"
                            onClick={() => setStep(3)}
                          >
                            Back
                          </button>
                          <button
                            className="uw-btn uw-btn-primary"
                            onClick={next}
                          >
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
                          <p className="uw-assigned">
                            Coach: {selectedCoach.name}
                          </p>
                        )}

                        <div style={{ display: "grid", gap: 18 }}>
                          {slots.length > 0 && (
                            <div>
                              <strong
                                style={{
                                  fontSize: "0.85rem",
                                  color: "var(--uw-sage-dark)",
                                }}
                              >
                                Book an existing slot:
                              </strong>
                              <div
                                className="uw-slot-grid"
                                style={{ marginTop: 8 }}
                              >
                                {slotOptions.map((slot) => (
                                  <button
                                    key={slot.value}
                                    className={
                                      selectedSlot === slot.value
                                        ? "selected"
                                        : ""
                                    }
                                    onClick={() => {
                                      setSelectedSlot(slot.value);
                                      setForm({
                                        ...form,
                                        preferredDate:
                                          slot.value.split("T")[0] || "",
                                        preferredTime: slot.value.includes("T")
                                          ? new Date(
                                              slot.value,
                                            ).toLocaleTimeString([], {
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
                            </div>
                          )}

                          <div>
                            <strong
                              style={{
                                fontSize: "0.85rem",
                                color: "var(--uw-sage-dark)",
                              }}
                            >
                              Or choose another available date:
                            </strong>
                            <div
                              className="uw-slot-grid"
                              style={{ marginTop: 8 }}
                            >
                              {suggestedAvailabilityDates
                                .filter(
                                  (date) =>
                                    !slots.some((slot) =>
                                      slot.bookingDate?.startsWith?.(date),
                                    ),
                                )
                                .map((date) => (
                                  <button
                                    key={date}
                                    className={
                                      form.preferredDate === date
                                        ? "selected"
                                        : ""
                                    }
                                    onClick={() => {
                                      setForm({ ...form, preferredDate: date });
                                      setSelectedSlot("");
                                    }}
                                  >
                                    <strong>
                                      {new Date(date).toLocaleDateString([], {
                                        weekday: "short",
                                        month: "short",
                                        day: "numeric",
                                      })}
                                    </strong>
                                  </button>
                                ))}
                            </div>
                          </div>
                        </div>

                        <div className="uw-form-grid">
                          <label>
                            Preferred Date
                            <input
                              type="date"
                              disabled
                              value={form.preferredDate}
                              onChange={(e) => {
                                setForm({
                                  ...form,
                                  preferredDate: e.target.value,
                                });
                                setSelectedSlot("");
                              }}
                            />
                          </label>
                          <label>
                            Optional Time
                            <input
                              type="time"
                              value={form.preferredTime}
                              onChange={(e) =>
                                setForm({
                                  ...form,
                                  preferredTime: e.target.value,
                                })
                              }
                            />
                          </label>
                        </div>
                        <label className="wide">
                          What would you like to focus on in the session?
                          (optional)
                          <textarea
                            rows={3}
                            placeholder="e.g. confidence, boundaries, leadership presence"
                            value={form.goals}
                            onChange={(e) =>
                              setForm({ ...form, goals: e.target.value })
                            }
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
                            {submitting
                              ? "Submitting..."
                              : "Submit discovery call"}
                          </button>
                        </div>
                      </div>
                    )}

                    {step === 6 && !requestSent && (
                      <div className="uw-confirmation">
                        <span>Confirmed</span>
                        <h3>Your discovery call request has been received.</h3>
                        <p>
                          We will send booking confirmation, approval updates,
                          and any reschedule notices by email. WhatsApp
                          notifications are structured for future activation.
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
                        <span className="uw-request-pending-badge">
                          ⏳ Pending
                        </span>
                        <h3>Slot request sent to {selectedCoach?.name}!</h3>
                        <p>
                          Your request has been sent and{" "}
                          <strong>{selectedCoach?.name}</strong> has been
                          notified. You will receive an email confirmation as
                          soon as your coach approves and sets a session time.
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
                          💡 Keep an eye on your inbox. Once approved, you'll
                          receive a confirmation email with your session time
                          and the Google Meet link from your coach.
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
                We help leaders own their voice, lead with integrity and live
                with intention through transformational coaching that
                strengthens confidence, boudaries, influence and values-based
                leadership.
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
                      <span className="uw-kicker uw-story-kicker">
                        Our story
                      </span>
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
                          <span className="uw-story-highlight"> women-led</span>
                          ,
                          <span className="uw-story-highlight">
                            {" "}
                            African-led
                          </span>
                          , and
                          <span className="uw-story-highlight">
                            {" "}
                            values-based
                          </span>
                          , we partner with ambitious professionals and
                          executives who are ready to elevate their influence,
                          strengthen their executive presence, navigate career
                          transitions with confidence, and build meaningful
                          workplace relationships.
                        </p>
                      </div>
                      <div className="uw-story-values">
                        <span className="uw-story-value-tag">
                          🌍 African-led
                        </span>
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
                Tell us what you are navigating and the kind of leadership
                support you need.
              </p>
              <div className="uw-data-note">
                <strong>How your data supports coaching</strong>
                <p>
                  We use your contact details to respond to your enquiry and
                  your coaching goals to understand demand, recommend the most
                  relevant coaching pathway, improve coach matching, and
                  identify common leadership themes across the platform. Your
                  submission is used for coaching operations and platform
                  insight, not for selling unrelated services.
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
      <AIChatWidget apiBaseUrl={API_BASE_URL} />
    </>
  );
};

export default MainContent;
