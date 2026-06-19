// components/MainContent.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import type { Program, Coach, Testimonial, Booking, CoachSlot } from "../types";
import CoachProfileModal from "./CoachProfileModal";
import ContactForm from "./ContactForm";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8000";

interface MainContentProps {
  programs: Program[];
  testimonials: Testimonial[];
  onAddBooking: (booking: Booking) => void;
  showToast: (message: string, type: string, duration?: number) => void;
}

const MainContent: React.FC<MainContentProps> = ({
  programs,
  testimonials,
  onAddBooking,
  showToast,
}) => {
  // ── State ──────────────────────────────────────────────────────────────────
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [coachesLoading, setCoachesLoading] = useState(true);

  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  // Real DB slots for the selected coach
  const [coachSlots, setCoachSlots] = useState<CoachSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<CoachSlot | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    program: "",
    coachOption: "" as "choose" | "assign" | "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [autoAssignedCoach, setAutoAssignedCoach] = useState<Coach | null>(null);
  const [filteredCoaches, setFilteredCoaches] = useState<Coach[]>([]);
  const [selectedFilteredCoach, setSelectedFilteredCoach] = useState<Coach | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [bookingData, setBookingData] = useState<any>(null);
  const [modalCoach, setModalCoach] = useState<Coach | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Slot request state (when no slots available)
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [requestSubmitting, setRequestSubmitting] = useState(false);

  // User session tracker
  const [trackerEmail, setTrackerEmail] = useState("");
  const [trackerTab, setTrackerTab] = useState<"bookings" | "requests" | "rejected">("bookings");
  const [userBookings, setUserBookings] = useState<any[]>([]);
  const [userRequests, setUserRequests] = useState<any[]>([]);
  const [trackerLoading, setTrackerLoading] = useState(false);
  const [trackerLoaded, setTrackerLoaded] = useState(false);

  // ── Fetch coaches from DB ──────────────────────────────────────────────────
  const loadCoaches = useCallback(async (programId?: string): Promise<Coach[]> => {
    setCoachesLoading(true);
    try {
      const params = new URLSearchParams({ role: "coach", status: "active" });
      if (programId) {
        params.set("programName", programId);
      }
      const res = await fetch(`${API_BASE_URL}/api/accounts?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const dbCoaches: Coach[] = (data.accounts || []).map((a: any) => ({
          _id: a._id,
          name: a.fullName,
          email: a.email,
          phone: a.phone || "",
          specialization: a.programName || "",
          status: a.status,
        }));
        setCoaches(dbCoaches);
        return dbCoaches;
      }
    } catch {
      // Silently fail — coaches section will be empty
    } finally {
      setCoachesLoading(false);
    }
    return [];
  }, []);

  useEffect(() => {
    loadCoaches();
  }, [loadCoaches]);

  // ── Fetch real slots for a coach ───────────────────────────────────────────
  const loadCoachSlots = useCallback(async (coachEmail: string) => {
    if (!coachEmail) return;
    setSlotsLoading(true);
    setCoachSlots([]);
    setSelectedSlot(null);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/bookings/coach-slots?coachEmail=${encodeURIComponent(coachEmail)}`
      );
      if (res.ok) {
        const data = await res.json();
        // Only show open slots
        const openSlots = (data.slots || []).filter(
          (s: CoachSlot) => s.status === "open"
        );
        setCoachSlots(openSlots);
      }
    } catch {
      showToast("Could not load available slots", "error", 4000);
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  // Reload slots whenever selectedCoach changes in step 2
  useEffect(() => {
    if (currentStep === 2 && selectedCoach?.email) {
      loadCoachSlots(selectedCoach.email);
    }
  }, [selectedCoach, currentStep, loadCoachSlots]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const getInitials = (name: string) =>
    name.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2);

  const renderStars = (rating: number = 0) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(empty);
  };

  const getProgramLabel = (id: string) => {
    const p = programs.find((p) => p.id === id || p.title === id);
    return p ? p.title : id || "—";
  };

  const coachMatchesProgram = (coach: Coach, programId: string): boolean => {
    const program = programs.find((p) => p.id === programId);
    if (!program) return false;
    const spec = (coach.specialization || "").trim().toLowerCase();
    return (
      spec === program.id.toLowerCase() ||
      spec === program.title.toLowerCase()
    );
  };

  const getProgramDuration = (id: string) => {
    const p = programs.find((p) => p.id === id);
    return p ? p.duration : "—";
  };

  const scrollToForm = (programId: string) => {
    setFormData((prev) => ({ ...prev, program: programId }));
    document.getElementById("select-coach")?.scrollIntoView({ behavior: "smooth" });
  };

  const formatSlotTime = (slot: CoachSlot) => {
    const start = new Date(slot.bookingDate);
    const end = slot.bookingEndDate ? new Date(slot.bookingEndDate) : null;
    const dateStr = start.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
    const startTime = start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const endTime = end ? " – " + end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
    return { dateStr, timeStr: startTime + endTime, full: `${dateStr} at ${startTime}` };
  };

  // ── Form handlers ──────────────────────────────────────────────────────────
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    if (errors[e.target.id]) setErrors({ ...errors, [e.target.id]: "" });
  };

  const handleRadioChange = (value: "choose" | "assign") => {
    setFormData({ ...formData, coachOption: value });
    if (errors.optionError) setErrors({ ...errors, optionError: "" });
  };

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.nameError = "Full name is required.";
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.emailError = "Enter a valid email address.";
    if (!formData.phone.trim() || !/^\+?[\d\s\-().]{7,20}$/.test(formData.phone))
      newErrors.phoneError = "Enter a valid phone number.";
    if (!formData.program) newErrors.programError = "Please select a program.";
    if (!formData.coachOption) newErrors.optionError = "Please choose an option.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = async () => {
    if (!validateStep1()) return;

    const programCoaches = await loadCoaches(formData.program);
    const pool = programCoaches.filter((c) => coachMatchesProgram(c, formData.program));

    if (pool.length === 0) {
      showToast("No coaches available for this program yet. Please try another program.", "error", 5000);
      return;
    }

    if (formData.coachOption === "assign") {
      const best = pool[0];
      setAutoAssignedCoach(best);
      setSelectedCoach(best);
      setFilteredCoaches([]);
      setSelectedFilteredCoach(null);
    } else {
      setFilteredCoaches(pool);
      setAutoAssignedCoach(null);
      setSelectedCoach(null);
      setSelectedFilteredCoach(null);
    }
    setCurrentStep(2);
    setSelectedSlot(null);
    if (errors.coachSelectError) setErrors({ ...errors, coachSelectError: "" });
    if (errors.slotError) setErrors({ ...errors, slotError: "" });
  };

  const handleBackStep = () => setCurrentStep(1);

  const selectFilteredCoach = (coach: Coach) => {
    setSelectedFilteredCoach(coach);
    setSelectedCoach(coach);
    if (errors.coachSelectError) setErrors({ ...errors, coachSelectError: "" });
  };

  const selectSlot = (slot: CoachSlot) => {
    setSelectedSlot(slot);
    if (errors.slotError) setErrors({ ...errors, slotError: "" });
  };

  const loadUserSessions = async (email: string) => {
    if (!email.trim()) {
      showToast("Please enter your email address", "error", 3000);
      return;
    }

    setTrackerLoading(true);
    try {
      const [bookingsRes, requestsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/bookings/sessions?email=${encodeURIComponent(email.trim())}`),
        fetch(`${API_BASE_URL}/api/slot-requests?email=${encodeURIComponent(email.trim())}`),
      ]);

      if (bookingsRes.ok) {
        const data = await bookingsRes.json();
        setUserBookings(data.sessions || []);
      }

      if (requestsRes.ok) {
        const data = await requestsRes.json();
        setUserRequests(data.slotRequests || []);
      }

      setTrackerLoaded(true);
    } catch {
      showToast("Could not load your sessions", "error", 4000);
    } finally {
      setTrackerLoading(false);
    }
  };

  const pendingUserRequests = userRequests.filter((r) => r.status === "pending");
  const rejectedUserRequests = userRequests.filter((r) => r.status === "declined");

  const openTracker = (email: string, tab: "bookings" | "requests" | "rejected" = "bookings") => {
    setTrackerEmail(email);
    setTrackerTab(tab);
    loadUserSessions(email);
    document.getElementById("my-sessions")?.scrollIntoView({ behavior: "smooth" });
  };
  const handleSubmit = async () => {
    if (formData.coachOption !== "assign" && !selectedCoach) {
      setErrors({ ...errors, coachSelectError: "Please select a coach to continue." });
      return;
    }
    if (!selectedSlot) {
      setErrors({ ...errors, slotError: "Please choose a session time slot." });
      return;
    }
    if (!selectedCoach) {
      setErrors({ ...errors, coachSelectError: "Please select a coach to continue." });
      return;
    }

    const slotLabel = formatSlotTime(selectedSlot).full;

    const booking: Booking = {
      id: Date.now(),
      name: formData.fullName,
      email: formData.email,
      program: getProgramLabel(formData.program),
      coach: selectedCoach.name,
      coachEmail: selectedCoach.email,
      coachPhone: selectedCoach.phone,
      slot: slotLabel,
      duration: getProgramDuration(formData.program),
      bookedAt: new Date().toLocaleString(),
    };

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings/book-slot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phoneNumber: formData.phone,
          programName: booking.program,
          coachId: selectedCoach._id || String(selectedCoach.id),
          coachName: selectedCoach.name,
          coachEmail: selectedCoach.email,
          coachPhone: selectedCoach.phone,
          bookingTime: slotLabel,
          slotId: selectedSlot._id,  // marks the slot as booked in DB
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.message || "Could not complete booking.");
      }

      setBookingData(booking);
      setShowSummary(true);
      onAddBooking(booking);
      openTracker(formData.email, "bookings");
      showToast("🎉 Session booked! Confirmation email sent.", "success", 5000);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not complete booking. Please try again.";
      showToast(message, "error", 6000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Reset form ─────────────────────────────────────────────────────────────
  // ── Submit slot request (no available slots) ───────────────────────────────
  const handleSlotRequest = async () => {
    if (!selectedCoach) return;
    setRequestSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/slot-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phoneNumber: formData.phone,
          programName: getProgramLabel(formData.program),
          coachId: selectedCoach._id || String(selectedCoach.id),
          coachName: selectedCoach.name,
          coachEmail: selectedCoach.email,
          message: requestMessage,
        }),
      });

      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(result?.message || "Could not submit request.");
      }

      setRequestSubmitted(true);
      setShowRequestForm(false);
      openTracker(formData.email, "requests");
      showToast("📩 Session request sent! Check your email for confirmation.", "success", 5000);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not submit request. Please try again.";
      showToast(message, "error", 6000);
    } finally {
      setRequestSubmitting(false);
    }
  };

  // ── Reset form ─────────────────────────────────────────────────────────────
  const resetForm = () => {
    setFormData({ fullName: "", email: "", phone: "", program: "", coachOption: "" });
    setSelectedCoach(null);
    setSelectedSlot(null);
    setCurrentStep(1);
    setShowSummary(false);
    setAutoAssignedCoach(null);
    setSelectedFilteredCoach(null);
    setCoachSlots([]);
    setErrors({});
    setBookingData(null);
    setIsSubmitting(false);
    setShowRequestForm(false);
    setRequestMessage("");
    setRequestSubmitted(false);
    setRequestSubmitting(false);
  };

  // ── Download summary ───────────────────────────────────────────────────────
  const downloadSummary = () => {
    if (!bookingData) return;
    const content = [
      "APEX COACHING — SESSION BOOKING CONFIRMATION",
      "=".repeat(50),
      "",
      `Client Name:     ${bookingData.name}`,
      `Program:         ${bookingData.program}`,
      `Coach:           ${bookingData.coach}`,
      `Coach Email:     ${bookingData.coachEmail}`,
      `Coach Phone:     ${bookingData.coachPhone}`,
      `Session Slot:    ${bookingData.slot}`,
      "",
      "A confirmation email will be sent to your inbox.",
      "Your coach will reach out within 24 hours.",
      "",
      `Booked on: ${bookingData.bookedAt}`,
      "",
      "— ApexCoaching Team",
      "wanjita.home@gmail.com | 0712281552 | Nairobi",
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `ApexCoaching_Booking_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
    showToast("Summary downloaded!", "success");
  };

  // ── Testimonials Slider ────────────────────────────────────────────────────
  const [currentSlide, setCurrentSlide] = useState(0);
  const [visibleCards, setVisibleCards] = useState(3);
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateVisible = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setVisibleCards(Math.max(1, Math.min(3, Math.round(width / 340))));
      }
    };
    updateVisible();
    window.addEventListener("resize", updateVisible);
    return () => window.removeEventListener("resize", updateVisible);
  }, []);

  useEffect(() => {
    const maxSlide = Math.max(0, testimonials.length - visibleCards);
    if (currentSlide > maxSlide) setCurrentSlide(maxSlide);
  }, [visibleCards, testimonials.length, currentSlide]);

  useEffect(() => {
    if (trackRef.current) {
      const cardWidth =
        trackRef.current.children[0]?.getBoundingClientRect().width || 300;
      trackRef.current.style.transform = `translateX(-${currentSlide * (cardWidth + 28)}px)`;
    }
  }, [currentSlide, visibleCards]);

  const goToSlide = (index: number) =>
    setCurrentSlide(Math.min(index, testimonials.length - visibleCards));
  const prevSlide = () => setCurrentSlide(Math.max(0, currentSlide - 1));
  const nextSlide = () => {
    const maxSlide = Math.max(0, testimonials.length - visibleCards);
    setCurrentSlide(currentSlide >= maxSlide ? 0 : currentSlide + 1);
  };

  // ── Scroll reveal ──────────────────────────────────────────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [coaches]); // re-run when coaches load so new cards animate in

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Programs Section ──────────────────────── */}
      <section id="programs" className="section programs-section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">What We Offer</span>
            <h2 className="section-title">Coaching <em>Programs</em></h2>
            <p className="section-sub">
              Structured pathways designed to unlock your potential at every stage of life.
            </p>
          </div>
          <div className="programs-grid">
            {programs.map((prog, i) => (
              <article
                key={prog.id}
                className="program-card reveal"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="program-img-wrap">
                  <img src={prog.image} alt={prog.title} className="program-img" loading="lazy" />
                </div>
                <div className="program-body">
                  <span className="program-tag">{prog.tag}</span>
                  <h3 className="program-title">{prog.title}</h3>
                  <p className="program-desc">{prog.description}</p>
                  <div className="program-meta">
                    <span>🕐</span>
                    <span>{prog.duration}</span>
                  </div>
                  <button className="btn-outline-sm" onClick={() => scrollToForm(prog.id)}>
                    Learn More →
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Coaches Section ───────────────────────── */}
      <section id="coaches" className="section coaches-section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Meet the Team</span>
            <h2 className="section-title">Our <em>Expert Coaches</em></h2>
            <p className="section-sub">
              Certified professionals with proven track records and deep specialization.
            </p>
          </div>

          {coachesLoading ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#64748b" }}>
              <div style={{
                width: 36, height: 36, border: "3px solid #e2e8f0",
                borderTopColor: "#6366f1", borderRadius: "50%",
                animation: "spin 0.8s linear infinite", margin: "0 auto 16px"
              }} />
              <p style={{ fontSize: 14 }}>Loading coaches…</p>
            </div>
          ) : coaches.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#64748b" }}>
              <p style={{ fontSize: 16, fontWeight: 600 }}>No coaches available yet</p>
              <p style={{ fontSize: 14, marginTop: 6 }}>Check back soon — our team is growing!</p>
            </div>
          ) : (
            <div className="coaches-grid">
              {coaches.map((coach, i) => (
                <article
                  key={coach._id}
                  className="coach-card reveal"
                  style={{ transitionDelay: `${i * 60}ms` }}
                  onClick={() => setModalCoach(coach)}
                >
                  <div className="coach-avatar-placeholder">{getInitials(coach.name)}</div>
                  <h3 className="coach-name">{coach.name}</h3>
                  <span className="coach-spec">{getProgramLabel(coach.specialization)}</span>
                  <div className="coach-meta">
                    <span>✉️ {coach.email}</span>
                  </div>
                  <button
                    className="btn-outline-sm"
                    onClick={(e) => { e.stopPropagation(); setModalCoach(coach); }}
                  >
                    View Profile
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Booking Form ──────────────────────────── */}
      <section id="select-coach" className="section form-section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Start Your Journey</span>
            <h2 className="section-title">Choose Your <em>Coach</em></h2>
            <p className="section-sub">
              Fill in your details and we'll pair you with the perfect coaching match.
            </p>
          </div>
          <div className="form-wrapper">
            {!showSummary ? (
              <>
                {/* Step 1 — Personal Details */}
                <div className={`form-step ${currentStep === 1 ? "active" : ""}`}>
                  <h3 className="step-title">
                    <span className="step-num">01</span> Personal Details
                  </h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="fullName">Full Name</label>
                      <input
                        type="text"
                        id="fullName"
                        placeholder="e.g. Alex Morgan"
                        value={formData.fullName}
                        onChange={handleInputChange}
                      />
                      <span className="field-error">{errors.nameError}</span>
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                      <span className="field-error">{errors.emailError}</span>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="phone">Phone Number</label>
                      <input
                        type="tel"
                        id="phone"
                        placeholder="+1 555 000 0000"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                      <span className="field-error">{errors.phoneError}</span>
                    </div>
                    <div className="form-group">
                      <label htmlFor="program">Coaching Program</label>
                      <select id="program" value={formData.program} onChange={handleInputChange}>
                        <option value="">— Select a program —</option>
                        {programs.map((p) => (
                          <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                      </select>
                      <span className="field-error">{errors.programError}</span>
                    </div>
                  </div>
                  <div className="form-group full">
                    <label className="radio-label">How would you like to choose your coach?</label>
                    <div className="radio-group">
                      <label className={`radio-card ${formData.coachOption === "choose" ? "selected" : ""}`}>
                        <input
                          type="radio"
                          name="coachOption"
                          value="choose"
                          checked={formData.coachOption === "choose"}
                          onChange={() => handleRadioChange("choose")}
                        />
                        <span className="radio-icon">🎯</span>
                        <span className="radio-title">I'll choose my coach</span>
                        <span className="radio-desc">Browse coaches filtered by your program</span>
                      </label>
                      <label className={`radio-card ${formData.coachOption === "assign" ? "selected" : ""}`}>
                        <input
                          type="radio"
                          name="coachOption"
                          value="assign"
                          checked={formData.coachOption === "assign"}
                          onChange={() => handleRadioChange("assign")}
                        />
                        <span className="radio-icon">✨</span>
                        <span className="radio-title">Assign me the best coach</span>
                        <span className="radio-desc">We'll recommend the top-rated match</span>
                      </label>
                    </div>
                    <span className="field-error">{errors.optionError}</span>
                  </div>
                  <button type="button" className="btn btn-primary" onClick={handleNextStep}>
                    Continue →
                  </button>
                </div>

                {/* Step 2 — Select Coach & Slot */}
                <div className={`form-step ${currentStep === 2 ? "active" : ""}`}>
                  <h3 className="step-title">
                    <span className="step-num">02</span> Select Your Coach &amp; Slot
                  </h3>

                  {/* Auto-assigned */}
                  {autoAssignedCoach && (
                    <div className="auto-assign-card">
                      <div className="assign-icon">🏆</div>
                      <div className="assign-content">
                        <p className="assign-label">Recommended Coach</p>
                        <p className="assign-name">{autoAssignedCoach.name}</p>
                        <p className="assign-spec">
                          {getProgramLabel(autoAssignedCoach.specialization)} · {autoAssignedCoach.email}
                        </p>
                      </div>
                      <div className="assign-badge">Best Match</div>
                    </div>
                  )}

                  {/* Manual coach picker */}
                  {filteredCoaches.length > 0 && (
                    <div className="filtered-coaches-grid">
                      {filteredCoaches.map((coach) => (
                          <div
                            key={coach._id}
                            className={`filtered-coach-card ${selectedFilteredCoach?._id === coach._id ? "selected" : ""}`}
                            onClick={() => selectFilteredCoach(coach)}
                          >
                            <div className="coach-avatar-placeholder">{getInitials(coach.name)}</div>
                            <p className="mini-name">{coach.name}</p>
                            <p className="mini-meta">{getProgramLabel(coach.specialization)}</p>
                            <p className="mini-meta" style={{ fontSize: 11, color: "#94a3b8" }}>
                              {coach.email}
                            </p>
                          </div>
                        ))}
                    </div>
                  )}
                  <span className="field-error">{errors.coachSelectError}</span>

                  {/* Real slots from DB */}
                  <div style={{ marginTop: 24 }}>
                    <h4 style={{ fontWeight: 700, marginBottom: 14 }}>
                      Pick a Session Slot
                      {selectedCoach && (
                        <span style={{ fontWeight: 400, fontSize: 13, color: "#64748b", marginLeft: 8 }}>
                          — {selectedCoach.name}'s available times
                        </span>
                      )}
                    </h4>

                    {!selectedCoach && (
                      <p style={{ color: "#94a3b8", fontSize: 14 }}>
                        Select a coach above to see their available slots.
                      </p>
                    )}

                    {selectedCoach && slotsLoading && (
                      <div style={{ textAlign: "center", padding: "24px 0", color: "#64748b" }}>
                        <div style={{
                          width: 28, height: 28, border: "3px solid #e2e8f0",
                          borderTopColor: "#6366f1", borderRadius: "50%",
                          animation: "spin 0.8s linear infinite", margin: "0 auto 10px"
                        }} />
                        <p style={{ fontSize: 13 }}>Loading available slots…</p>
                      </div>
                    )}

                    {selectedCoach && !slotsLoading && coachSlots.length === 0 && (
                      <div className="slot-request-section">
                        {!requestSubmitted ? (
                          <>
                            <div className="slot-request-empty">
                              <div className="slot-request-empty-icon">📭</div>
                              <p className="slot-request-empty-title">No available slots</p>
                              <p className="slot-request-empty-desc">
                                {selectedCoach.name} hasn't created any open slots yet.
                              </p>
                            </div>

                            {!showRequestForm ? (
                              <div className="slot-request-cta">
                                <p className="slot-request-cta-text">
                                  Want to work with {selectedCoach.name}? Request a session and they'll get back to you with available times.
                                </p>
                                <button
                                  type="button"
                                  className="btn btn-request-session"
                                  onClick={() => setShowRequestForm(true)}
                                >
                                  📩 Request a Session
                                </button>
                              </div>
                            ) : (
                              <div className="slot-request-form">
                                <h4 className="slot-request-form-title">
                                  <span>📩</span> Request a Session with {selectedCoach.name}
                                </h4>
                                <div className="slot-request-form-prefilled">
                                  <div className="slot-request-prefilled-row">
                                    <span className="slot-request-prefilled-label">Name</span>
                                    <span className="slot-request-prefilled-value">{formData.fullName}</span>
                                  </div>
                                  <div className="slot-request-prefilled-row">
                                    <span className="slot-request-prefilled-label">Email</span>
                                    <span className="slot-request-prefilled-value">{formData.email}</span>
                                  </div>
                                  <div className="slot-request-prefilled-row">
                                    <span className="slot-request-prefilled-label">Program</span>
                                    <span className="slot-request-prefilled-value">{getProgramLabel(formData.program)}</span>
                                  </div>
                                </div>
                                <div className="slot-request-form-field">
                                  <label htmlFor="requestMessage" className="slot-request-form-label">
                                    Message for your coach <span style={{ color: "#94a3b8", fontWeight: 400 }}>(optional)</span>
                                  </label>
                                  <textarea
                                    id="requestMessage"
                                    className="slot-request-message-input"
                                    placeholder="e.g. I prefer morning sessions, or any day after 3pm works for me…"
                                    value={requestMessage}
                                    onChange={(e) => setRequestMessage(e.target.value)}
                                    rows={3}
                                  />
                                </div>
                                <div className="slot-request-form-actions">
                                  <button
                                    type="button"
                                    className="btn btn-ghost"
                                    onClick={() => setShowRequestForm(false)}
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-request-session"
                                    onClick={handleSlotRequest}
                                    disabled={requestSubmitting}
                                  >
                                    {requestSubmitting ? "Sending…" : "Send Request →"}
                                  </button>
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="slot-request-success">
                            <div className="slot-request-success-icon">✅</div>
                            <h4 className="slot-request-success-title">Request Sent!</h4>
                            <p className="slot-request-success-desc">
                              Your session request has been sent to <strong>{selectedCoach.name}</strong>.
                              You'll receive a confirmation email shortly, and your coach will reach out with available times.
                            </p>
                            <div className="slot-request-success-status">
                              <span className="slot-request-status-pill pending">⏳ Pending</span>
                              <span className="slot-request-success-note">Your coach will review this request</span>
                            </div>
                            <button
                              type="button"
                              className="btn btn-ghost"
                              style={{ marginTop: 16 }}
                              onClick={resetForm}
                            >
                              ← Start Over
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {selectedCoach && !slotsLoading && coachSlots.length > 0 && (
                      <div className="schedule-grid">
                        {coachSlots.map((slot) => {
                          const { dateStr, timeStr } = formatSlotTime(slot);
                          return (
                            <div
                              key={slot._id}
                              className={`time-slot ${selectedSlot?._id === slot._id ? "selected" : ""}`}
                              onClick={() => selectSlot(slot)}
                            >
                              <div className="slot-day">{dateStr}</div>
                              <div className="slot-time">{timeStr}</div>
                              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                                {slot.title}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <span className="field-error">{errors.slotError}</span>
                  </div>

                  <div className="form-nav">
                    <button type="button" className="btn btn-ghost" onClick={handleBackStep}>
                      ← Back
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleSubmit}
                      disabled={isSubmitting || !selectedCoach || !selectedSlot}
                    >
                      {isSubmitting ? "Booking…" : "Confirm & Book →"}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* ── Booking Summary ── */
              <div className="booking-summary">
                <div className="summary-icon">🎉</div>
                <h3>You're All Set!</h3>
                <p className="summary-subtitle">Here's a recap of your coaching booking:</p>
                <div className="summary-details">
                  {[
                    { key: "Name", val: bookingData?.name },
                    { key: "Program", val: bookingData?.program },
                    { key: "Coach", val: bookingData?.coach },
                    { key: "Session Slot", val: bookingData?.slot },
                    { key: "Coach Email", val: bookingData?.coachEmail },
                    { key: "Coach Phone", val: bookingData?.coachPhone || "—" },
                    { key: "Format", val: "1-on-1 Video Call" },
                  ].map(({ key, val }) => (
                    <div key={key} className="summary-row">
                      <span className="summary-key">{key}</span>
                      <span className="summary-val">{val}</span>
                    </div>
                  ))}
                </div>
                <p className="summary-note">
                  A confirmation email will be sent to your inbox. Your coach will reach out
                  within 24 hours to confirm the session details.
                </p>
                <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                  <button className="btn btn-primary" onClick={resetForm}>
                    Book Another Session
                  </button>
                  <button className="btn btn-ghost" onClick={downloadSummary}>
                    ⬇ Download Summary
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── My Sessions Tracker ───────────────────── */}
      <section id="my-sessions" className="section form-section" style={{ background: "var(--clr-bg-alt, #f8f6f2)" }}>
        <div className="container">
          <div className="section-header">
            <span className="section-label">Your Sessions</span>
            <h2 className="section-title">Track Your <em>Bookings & Requests</em></h2>
            <p className="section-sub">
              Enter your email to view confirmed bookings, pending requests, and declined requests.
            </p>
          </div>
          <div className="form-wrapper" style={{ maxWidth: 900 }}>
            <div className="form-row" style={{ marginBottom: 20 }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="trackerEmail">Email Address</label>
                <input
                  type="email"
                  id="trackerEmail"
                  placeholder="you@example.com"
                  value={trackerEmail}
                  onChange={(e) => setTrackerEmail(e.target.value)}
                />
              </div>
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => loadUserSessions(trackerEmail)}
                  disabled={trackerLoading}
                >
                  {trackerLoading ? "Loading…" : "View My Sessions"}
                </button>
              </div>
            </div>

            {trackerLoaded && (
              <>
                <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                  {[
                    { id: "bookings" as const, label: `Bookings (${userBookings.length})` },
                    { id: "requests" as const, label: `Pending Requests (${pendingUserRequests.length})` },
                    { id: "rejected" as const, label: `Rejected (${rejectedUserRequests.length})` },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      className={`btn ${trackerTab === tab.id ? "btn-primary" : "btn-ghost"}`}
                      onClick={() => setTrackerTab(tab.id)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {trackerTab === "bookings" && (
                  userBookings.length === 0 ? (
                    <p style={{ color: "#64748b", textAlign: "center", padding: "24px 0" }}>
                      No confirmed bookings yet. Book a session or wait for your coach to approve a request.
                    </p>
                  ) : (
                    <div style={{ display: "grid", gap: 12 }}>
                      {userBookings.map((booking) => (
                        <div key={booking._id} style={{ padding: 16, border: "1px solid var(--clr-border)", borderRadius: 12, background: "#fff" }}>
                          <strong>{booking.programName}</strong> with {booking.coachName || "your coach"}
                          <p style={{ margin: "6px 0 0", fontSize: 14, color: "#64748b" }}>
                            📅 {booking.bookingTime}
                          </p>
                        </div>
                      ))}
                    </div>
                  )
                )}

                {trackerTab === "requests" && (
                  pendingUserRequests.length === 0 ? (
                    <p style={{ color: "#64748b", textAlign: "center", padding: "24px 0" }}>
                      No pending session requests.
                    </p>
                  ) : (
                    <div style={{ display: "grid", gap: 12 }}>
                      {pendingUserRequests.map((request) => (
                        <div key={request._id} style={{ padding: 16, border: "1px solid var(--clr-border)", borderRadius: 12, background: "#fff" }}>
                          <strong>{request.programName}</strong> with {request.coachName}
                          <p style={{ margin: "6px 0 0", fontSize: 14, color: "#64748b" }}>
                            ⏳ Awaiting coach approval
                          </p>
                        </div>
                      ))}
                    </div>
                  )
                )}

                {trackerTab === "rejected" && (
                  rejectedUserRequests.length === 0 ? (
                    <p style={{ color: "#64748b", textAlign: "center", padding: "24px 0" }}>
                      No rejected requests.
                    </p>
                  ) : (
                    <div style={{ display: "grid", gap: 12 }}>
                      {rejectedUserRequests.map((request) => (
                        <div key={request._id} style={{ padding: 16, border: "1px solid #fecaca", borderRadius: 12, background: "#fff5f5" }}>
                          <strong>{request.programName}</strong> with {request.coachName}
                          <p style={{ margin: "6px 0 0", fontSize: 14, color: "#b91c1c" }}>
                            ❌ Request declined — check your email for details
                          </p>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────── */}
      <section id="testimonials" className="section testimonials-section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Client Stories</span>
            <h2 className="section-title">What Our <em>Clients Say</em></h2>
          </div>
          <div className="testimonials-slider" ref={containerRef}>
            <div className="testimonials-track" ref={trackRef}>
              {testimonials.map((t, idx) => (
                <article key={idx} className="testimonial-card">
                  <div className="testimonial-quote">"</div>
                  <p className="testimonial-text">{t.text}</p>
                  <div className="testimonial-author">
                    <div className="testimonial-avatar">{getInitials(t.name)}</div>
                    <div>
                      <p className="testimonial-name">{t.name}</p>
                      <p className="testimonial-role">{t.role}</p>
                    </div>
                    <div className="testimonial-stars">{"★".repeat(t.rating)}</div>
                  </div>
                </article>
              ))}
            </div>
            <div className="slider-controls">
              <button className="slider-btn" onClick={prevSlide}>←</button>
              <div className="slider-dots">
                {Array.from({ length: Math.max(1, testimonials.length - visibleCards + 1) }).map(
                  (_, idx) => (
                    <button
                      key={idx}
                      className={`slider-dot ${currentSlide === idx ? "active" : ""}`}
                      onClick={() => goToSlide(idx)}
                    />
                  )
                )}
              </div>
              <button className="slider-btn" onClick={nextSlide}>→</button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact ───────────────────────────────── */}
      <ContactForm showToast={showToast} />

      {/* ── Coach Profile Modal ───────────────────── */}
      <CoachProfileModal
        coach={modalCoach}
        getInitials={getInitials}
        getProgramLabel={getProgramLabel}
        renderStars={renderStars}
        onClose={() => setModalCoach(null)}
        onBook={(coach) => {
          setModalCoach(null);
          scrollToForm(coach.specialization);
        }}
      />
    </>
  );
};

export default MainContent;
