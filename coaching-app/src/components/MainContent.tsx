// components/MainContent.tsx
import React, { useState, useEffect, useRef } from "react";
import type { Program, Coach, Testimonial, Booking } from "../types";
import CoachProfileModal from "./CoachProfileModal";
import ContactForm from "./ContactForm";

interface MainContentProps {
  programs: Program[];
  coaches: Coach[];
  testimonials: Testimonial[];
  onAddBooking: (booking: Booking) => void;
  showToast: (message: string, type: string, duration?: number) => void;
}

const MainContent: React.FC<MainContentProps> = ({
  programs,
  coaches,
  testimonials,
  onAddBooking,
  showToast,
}) => {
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    program: "",
    coachOption: "" as "choose" | "assign" | "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [autoAssignedCoach, setAutoAssignedCoach] = useState<Coach | null>(
    null,
  );
  const [filteredCoaches, setFilteredCoaches] = useState<Coach[]>([]);
  const [selectedFilteredCoach, setSelectedFilteredCoach] =
    useState<Coach | null>(null);
  const [slots, setSlots] = useState<{ day: string; time: string }[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [bookingData, setBookingData] = useState<any>(null);
  const [modalCoach, setModalCoach] = useState<Coach | null>(null);

  // Generate slots
  useEffect(() => {
    const days = [
      "Mon Jun 9",
      "Tue Jun 10",
      "Wed Jun 11",
      "Thu Jun 12",
      "Fri Jun 13",
      "Mon Jun 16",
      "Tue Jun 17",
    ];
    const times = ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"];
    const allSlots: { day: string; time: string }[] = [];
    days.forEach((d) =>
      times.forEach((t) => allSlots.push({ day: d, time: t })),
    );
    setSlots(allSlots.sort(() => Math.random() - 0.5).slice(0, 8));
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .toUpperCase();
  };

  const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(empty);
  };

  const getProgramLabel = (id: string) => {
    const p = programs.find((p) => p.id === id);
    return p ? p.title : id;
  };

  const getProgramDuration = (id: string) => {
    const p = programs.find((p) => p.id === id);
    return p ? p.duration : "—";
  };

  const scrollToForm = (programId: string) => {
    setFormData((prev) => ({ ...prev, program: programId }));
    document
      .getElementById("select-coach")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    if (errors[e.target.id]) {
      setErrors({ ...errors, [e.target.id]: "" });
    }
  };

  const handleRadioChange = (value: "choose" | "assign") => {
    setFormData({ ...formData, coachOption: value });
    if (errors.optionError) {
      setErrors({ ...errors, optionError: "" });
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim())
      newErrors.nameError = "Full name is required.";
    if (
      !formData.email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    )
      newErrors.emailError = "Enter a valid email address.";
    if (
      !formData.phone.trim() ||
      !/^\+?[\d\s\-().]{7,20}$/.test(formData.phone)
    )
      newErrors.phoneError = "Enter a valid phone number.";
    if (!formData.program) newErrors.programError = "Please select a program.";
    if (!formData.coachOption)
      newErrors.optionError = "Please choose an option.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (!validateStep1()) return;

    if (formData.coachOption === "assign") {
      const candidates = coaches.filter(
        (c) => c.specialization === formData.program,
      );
      const best = candidates.reduce(
        (a, b) => (a.rating >= b.rating ? a : b),
        candidates[0] || coaches[0],
      );
      setAutoAssignedCoach(best);
      setSelectedCoach(best);
      setFilteredCoaches([]);
      setSelectedFilteredCoach(null);
    } else {
      const filtered = coaches.filter(
        (c) => c.specialization === formData.program,
      );
      setFilteredCoaches(filtered);
      setAutoAssignedCoach(null);
      setSelectedCoach(null);
      setSelectedFilteredCoach(null);
    }
    setCurrentStep(2);
    setSelectedSlot(null);
    if (errors.coachSelectError) setErrors({ ...errors, coachSelectError: "" });
    if (errors.slotError) setErrors({ ...errors, slotError: "" });
  };

  const handleBackStep = () => {
    setCurrentStep(1);
  };

  const selectFilteredCoach = (coach: Coach) => {
    setSelectedFilteredCoach(coach);
    setSelectedCoach(coach);
    if (errors.coachSelectError) setErrors({ ...errors, coachSelectError: "" });
  };

  const selectSlot = (slot: { day: string; time: string }) => {
    setSelectedSlot(`${slot.day} at ${slot.time}`);
    if (errors.slotError) setErrors({ ...errors, slotError: "" });
  };

  const handleSubmit = () => {
    if (formData.coachOption !== "assign" && !selectedCoach) {
      setErrors({
        ...errors,
        coachSelectError: "Please select a coach to continue.",
      });
      return;
    }
    if (!selectedSlot) {
      setErrors({ ...errors, slotError: "Please choose a session time slot." });
      return;
    }

    const coachName = selectedCoach?.name || "—";
    const booking: Booking = {
      id: Date.now(),
      name: formData.fullName,
      email: formData.email,
      program: getProgramLabel(formData.program),
      coach: coachName,
      slot: selectedSlot,
      duration: getProgramDuration(formData.program),
      bookedAt: new Date().toLocaleString(),
    };

    setBookingData(booking);
    setShowSummary(true);
    onAddBooking(booking);
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      program: "",
      coachOption: "",
    });
    setSelectedCoach(null);
    setSelectedSlot(null);
    setCurrentStep(1);
    setShowSummary(false);
    setAutoAssignedCoach(null);
    setSelectedFilteredCoach(null);
    setErrors({});
    setBookingData(null);
  };

  const downloadSummary = () => {
    if (!bookingData) return;
    const content = [
      "APEX COACHING — SESSION BOOKING CONFIRMATION",
      "=".repeat(50),
      "",
      `Client Name:     ${bookingData.name}`,
      `Program:         ${bookingData.program}`,
      `Coach:           ${bookingData.coach}`,
      `Session Slot:    ${bookingData.slot}`,
      `Duration:        ${bookingData.duration}`,
      `Format:          1-on-1 Video Call`,
      "",
      "A confirmation email will be sent to your inbox.",
      "Your coach will reach out within 24 hours.",
      "",
      `Booked on: ${bookingData.bookedAt}`,
      "",
      "— ApexCoaching Team",
      "hello@apexcoaching.com | +1 800 555 0100",
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `ApexCoaching_Booking_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
    showToast("Summary downloaded!", "success");
  };

  // Testimonials Slider
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

  const goToSlide = (index: number) => {
    setCurrentSlide(Math.min(index, testimonials.length - visibleCards));
  };

  const prevSlide = () => {
    setCurrentSlide(Math.max(0, currentSlide - 1));
  };

  const nextSlide = () => {
    const maxSlide = Math.max(0, testimonials.length - visibleCards);
    setCurrentSlide(currentSlide >= maxSlide ? 0 : currentSlide + 1);
  };

  // Scroll reveal
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
  }, []);

  return (
    <>
      {/* Programs Section */}
      <section id="programs" className="section programs-section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">What We Offer</span>
            <h2 className="section-title">
              Coaching <em>Programs</em>
            </h2>
            <p className="section-sub">
              Structured pathways designed to unlock your potential at every
              stage of life.
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
                  <img
                    src={prog.image}
                    alt={prog.title}
                    className="program-img"
                    loading="lazy"
                  />
                </div>
                <div className="program-body">
                  <span className="program-tag">{prog.tag}</span>
                  <h3 className="program-title">{prog.title}</h3>
                  <p className="program-desc">{prog.description}</p>
                  <div className="program-meta">
                    <span>🕐</span>
                    <span>{prog.duration}</span>
                  </div>
                  <button
                    className="btn-outline-sm"
                    onClick={() => scrollToForm(prog.id)}
                  >
                    Learn More →
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Coaches Section */}
      <section id="coaches" className="section coaches-section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Meet the Team</span>
            <h2 className="section-title">
              Our <em>Expert Coaches</em>
            </h2>
            <p className="section-sub">
              Certified professionals with proven track records and deep
              specialization.
            </p>
          </div>
          <div className="coaches-grid">
            {coaches.map((coach, i) => (
              <article
                key={coach.id}
                className="coach-card reveal"
                style={{ transitionDelay: `${i * 60}ms` }}
                onClick={() => setModalCoach(coach)}
              >
                <div className="coach-avatar-placeholder">
                  {getInitials(coach.name)}
                </div>
                <h3 className="coach-name">{coach.name}</h3>
                <span className="coach-spec">
                  {getProgramLabel(coach.specialization)}
                </span>
                <div className="coach-meta">
                  <span>👤 {coach.experience} yrs</span>
                  <span>
                    <span className="stars">{renderStars(coach.rating)}</span>{" "}
                    {coach.rating}
                  </span>
                </div>
                <button
                  className="btn-outline-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setModalCoach(coach);
                  }}
                >
                  View Profile
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Coach Selection Form */}
      <section id="select-coach" className="section form-section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Start Your Journey</span>
            <h2 className="section-title">
              Choose Your <em>Coach</em>
            </h2>
            <p className="section-sub">
              Fill in your details and we'll pair you with the perfect coaching
              match.
            </p>
          </div>
          <div className="form-wrapper">
            {!showSummary ? (
              <>
                {/* Step 1 */}
                <div
                  className={`form-step ${currentStep === 1 ? "active" : ""}`}
                >
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
                      <select
                        id="program"
                        value={formData.program}
                        onChange={handleInputChange}
                      >
                        <option value="">— Select a program —</option>
                        {programs.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.title}
                          </option>
                        ))}
                      </select>
                      <span className="field-error">{errors.programError}</span>
                    </div>
                  </div>
                  <div className="form-group full">
                    <label className="radio-label">
                      How would you like to choose your coach?
                    </label>
                    <div className="radio-group">
                      <label
                        className={`radio-card ${formData.coachOption === "choose" ? "selected" : ""}`}
                      >
                        <input
                          type="radio"
                          name="coachOption"
                          value="choose"
                          checked={formData.coachOption === "choose"}
                          onChange={() => handleRadioChange("choose")}
                        />
                        <span className="radio-icon">🎯</span>
                        <span className="radio-title">
                          I'll choose my coach
                        </span>
                        <span className="radio-desc">
                          Browse coaches filtered by your program
                        </span>
                      </label>
                      <label
                        className={`radio-card ${formData.coachOption === "assign" ? "selected" : ""}`}
                      >
                        <input
                          type="radio"
                          name="coachOption"
                          value="assign"
                          checked={formData.coachOption === "assign"}
                          onChange={() => handleRadioChange("assign")}
                        />
                        <span className="radio-icon">✨</span>
                        <span className="radio-title">
                          Assign me the best coach
                        </span>
                        <span className="radio-desc">
                          We'll recommend the top-rated match
                        </span>
                      </label>
                    </div>
                    <span className="field-error">{errors.optionError}</span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleNextStep}
                  >
                    Continue →
                  </button>
                </div>

                {/* Step 2 */}
                <div
                  className={`form-step ${currentStep === 2 ? "active" : ""}`}
                >
                  <h3 className="step-title">
                    <span className="step-num">02</span> Select Your Coach
                  </h3>
                  {autoAssignedCoach && (
                    <div className="auto-assign-card">
                      <div className="assign-icon">🏆</div>
                      <div className="assign-content">
                        <p className="assign-label">Recommended Coach</p>
                        <p className="assign-name">{autoAssignedCoach.name}</p>
                        <p className="assign-spec">
                          {getProgramLabel(autoAssignedCoach.specialization)} ·{" "}
                          {autoAssignedCoach.experience} yrs exp · ★{" "}
                          {autoAssignedCoach.rating}
                        </p>
                      </div>
                      <div className="assign-badge">Best Match</div>
                    </div>
                  )}
                  {filteredCoaches.length > 0 && (
                    <div className="filtered-coaches-grid">
                      {filteredCoaches.map((coach) => (
                        <div
                          key={coach.id}
                          className={`filtered-coach-card ${selectedFilteredCoach?.id === coach.id ? "selected" : ""}`}
                          onClick={() => selectFilteredCoach(coach)}
                        >
                          <div className="coach-avatar-placeholder">
                            {getInitials(coach.name)}
                          </div>
                          <p className="mini-name">{coach.name}</p>
                          <p className="mini-meta">
                            {coach.experience} yrs experience
                          </p>
                          <p className="mini-rating">★ {coach.rating}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <span className="field-error">{errors.coachSelectError}</span>

                  <div>
                    <h4
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 700,
                        marginBottom: "14px",
                      }}
                    >
                      Pick a Session Slot
                    </h4>
                    <div className="schedule-grid">
                      {slots.map((slot, idx) => (
                        <div
                          key={idx}
                          className={`time-slot ${selectedSlot === `${slot.day} at ${slot.time}` ? "selected" : ""}`}
                          onClick={() => selectSlot(slot)}
                        >
                          <div className="slot-day">{slot.day}</div>
                          <div className="slot-time">{slot.time}</div>
                        </div>
                      ))}
                    </div>
                    <span className="field-error">{errors.slotError}</span>
                  </div>

                  <div className="form-nav">
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={handleBackStep}
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleSubmit}
                    >
                      Confirm & Book →
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="booking-summary">
                <div className="summary-icon">🎉</div>
                <h3>You're All Set!</h3>
                <p className="summary-subtitle">
                  Here's a recap of your coaching booking:
                </p>
                <div className="summary-details">
                  <div className="summary-row">
                    <span className="summary-key">Name</span>
                    <span className="summary-val">{bookingData?.name}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-key">Program</span>
                    <span className="summary-val">{bookingData?.program}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-key">Coach</span>
                    <span className="summary-val">{bookingData?.coach}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-key">Session Slot</span>
                    <span className="summary-val">{bookingData?.slot}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-key">Duration</span>
                    <span className="summary-val">{bookingData?.duration}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-key">Format</span>
                    <span className="summary-val">1-on-1 Video Call</span>
                  </div>
                </div>
                <p className="summary-note">
                  A confirmation email will be sent to your inbox. Your coach
                  will reach out within 24 hours to confirm the session details.
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    justifyContent: "center",
                    flexWrap: "wrap",
                  }}
                >
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

      {/* Testimonials Section */}
      <section id="testimonials" className="section testimonials-section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Client Stories</span>
            <h2 className="section-title">
              What Our <em>Clients Say</em>
            </h2>
          </div>
          <div className="testimonials-slider" ref={containerRef}>
            <div className="testimonials-track" ref={trackRef}>
              {testimonials.map((t, idx) => (
                <article key={idx} className="testimonial-card">
                  <div className="testimonial-quote">"</div>
                  <p className="testimonial-text">{t.text}</p>
                  <div className="testimonial-author">
                    <div className="testimonial-avatar">
                      {getInitials(t.name)}
                    </div>
                    <div>
                      <p className="testimonial-name">{t.name}</p>
                      <p className="testimonial-role">{t.role}</p>
                    </div>
                    <div className="testimonial-stars">
                      {"★".repeat(t.rating)}
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <div className="slider-controls">
              <button className="slider-btn" onClick={prevSlide}>
                ←
              </button>
              <div className="slider-dots">
                {Array.from({
                  length: Math.max(1, testimonials.length - visibleCards + 1),
                }).map((_, idx) => (
                  <button
                    key={idx}
                    className={`slider-dot ${currentSlide === idx ? "active" : ""}`}
                    onClick={() => goToSlide(idx)}
                  ></button>
                ))}
              </div>
              <button className="slider-btn" onClick={nextSlide}>
                →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <ContactForm showToast={showToast} />

      {/* Coach Profile Modal */}
      <CoachProfileModal
        coach={modalCoach}
        coaches={coaches}
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
