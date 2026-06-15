export function initApexApp() {
  "use strict";

  /* ============================================================
     DATA STORE
     ============================================================ */
  const PROGRAMS = [
    { id: "career", title: "Career Coaching", tag: "Professional", description: "Accelerate your career trajectory with expert guidance on job transitions, salary negotiation, personal branding, and skill development.", duration: "12 Sessions · 3 Months", image: "https://images.unsplash.com/photo-1542626991-cbc4e32524cc?w=600&q=75", color: "#2C4A6E" },
    { id: "business", title: "Business Coaching", tag: "Entrepreneur", description: "Scale your business with strategic planning, revenue optimization, team building, and leadership frameworks tailored to your industry.", duration: "16 Sessions · 4 Months", image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=600&q=75", color: "#C9933A" },
    { id: "life", title: "Life Coaching", tag: "Lifestyle", description: "Achieve balance, clarity, and purpose. Redesign your habits, mindset, and relationships to build the life you've always envisioned.", duration: "10 Sessions · 2.5 Months", image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=75", color: "#4CAF50" },
    { id: "leadership", title: "Leadership Coaching", tag: "Executive", description: "Develop your executive presence, communication power, emotional intelligence, and vision to lead with lasting impact.", duration: "14 Sessions · 3.5 Months", image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&q=75", color: "#7B2D8B" }
  ];

  const COACHES = [
    { id: 1, name: "Sarah Johnson", specialization: "career", experience: 8, rating: 4.9, bio: "Former HR Director at Fortune 500 firms. Sarah has helped over 400 professionals navigate career transitions, negotiate senior roles, and build compelling personal brands. She combines data-driven coaching with deep human insight.", tags: ["Career Transitions", "Salary Negotiation", "Personal Branding", "Interview Prep"] },
    { id: 2, name: "Marcus Williams", specialization: "business", experience: 12, rating: 4.8, bio: "Serial entrepreneur and startup advisor with 3 successful exits. Marcus brings first-hand experience in scaling businesses from zero to eight figures. His coaching blends operational rigor with entrepreneurial mindset.", tags: ["Revenue Growth", "Startup Strategy", "Team Building", "Fundraising"] },
    { id: 3, name: "Elena Rodriguez", specialization: "life", experience: 6, rating: 4.7, bio: "ICF-certified holistic life coach with backgrounds in positive psychology and mindfulness. Elena helps clients redesign their lives with intention, moving from burnout to balance with measurable, lasting change.", tags: ["Mindfulness", "Work-Life Balance", "Habit Design", "Clarity & Purpose"] },
    { id: 4, name: "David Kim", specialization: "leadership", experience: 15, rating: 4.9, bio: "Ex-C-suite executive coach and TEDx speaker. David has advised Fortune 100 boards and coached over 200 leaders across 18 countries. His approach integrates neuroscience, systems thinking, and executive presence.", tags: ["Executive Presence", "Board Communication", "Emotional Intelligence", "Strategic Vision"] },
    { id: 5, name: "Priya Sharma", specialization: "career", experience: 9, rating: 4.8, bio: "LinkedIn Top Career Coach with 500+ successful placements. Priya specializes in competitive job markets, tech sector transitions, and building powerful networks that open doors others don't even see.", tags: ["LinkedIn Optimization", "Tech Careers", "Networking", "Job Search Strategy"] },
    { id: 6, name: "James Thornton", specialization: "business", experience: 11, rating: 4.7, bio: "MBA coach and revenue growth strategist. James works with established business owners who want to scale without losing what makes them great — culture, quality, and founder identity.", tags: ["Scale Strategy", "Operational Excellence", "Culture Building", "Profitability"] },
    { id: 7, name: "Aisha Okafor", specialization: "life", experience: 7, rating: 4.9, bio: "Mindfulness and resilience specialist who blends ancient wisdom with modern behavioral science. Aisha helps high-achievers reconnect with their values and build extraordinary resilience for the long game.", tags: ["Resilience", "Stress Management", "Values Alignment", "Relationship Health"] },
    { id: 8, name: "Ryan Mitchell", specialization: "leadership", experience: 10, rating: 4.6, bio: "Agile leadership and team culture expert. Ryan partners with managers and directors who want to lead high-performance teams with authenticity, psychological safety, and results that speak for themselves.", tags: ["Agile Teams", "Psychological Safety", "Feedback Culture", "Change Management"] }
  ];

  const TESTIMONIALS = [
    { text: "Working with Sarah transformed my career. I went from feeling stuck in a mid-level role to landing my dream VP position in just three months. Her clarity and push were exactly what I needed.", name: "Thomas Chen", role: "VP of Product, TechScale", rating: 5 },
    { text: "Marcus gave me the strategic blueprint I desperately needed. Our revenue doubled within a year of coaching. I tell every founder I know about Apex Coaching.", name: "Olivia Patel", role: "Founder & CEO, Bloom Ventures", rating: 5 },
    { text: "Elena's life coaching sessions were genuinely life-changing. I finally stopped running on autopilot and started building a life with real intention. I'm more present and happier than ever.", name: "James Osei", role: "Senior Engineer, Horizon Inc.", rating: 5 },
    { text: "David's leadership coaching unlocked something in me I didn't know existed. My team's engagement scores are through the roof, and I feel calm and confident in every boardroom I enter.", name: "Sophie Laurent", role: "COO, Meridian Finance", rating: 5 },
    { text: "The coach-matching process was seamless and I felt truly understood from day one. I secured a 40% salary increase after just six sessions. Absolutely worth every penny.", name: "Carlos Mendez", role: "Marketing Director, Nova Group", rating: 5 },
    { text: "Priya's guidance on personal branding completely changed how I show up on LinkedIn and in interviews. I had three competing offers within two months. Incredible.", name: "Grace Antwi", role: "Product Manager, Finzara", rating: 5 }
  ];

  let savedBookings = JSON.parse(localStorage.getItem("apexBookings") || "[]");
  let selectedCoach = null;
  let currentStep = 1;
  let selectedSlot = null;
  let currentSlide = 0;
  let sliderInterval = null;

  /* ============================================================
     UTILITIES
     ============================================================ */
  function renderStars(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(empty);
  }

  function getInitials(name) {
    return name.split(" ").map((p) => p[0]).join("").toUpperCase();
  }

  function getProgramLabel(id) {
    const p = PROGRAMS.find((p) => p.id === id);
    return p ? p.title : id;
  }

  function getProgramDuration(id) {
    const p = PROGRAMS.find((p) => p.id === id);
    return p ? p.duration : "—";
  }

  function generateSlots() {
    const days = ["Mon Jun 9", "Tue Jun 10", "Wed Jun 11", "Thu Jun 12", "Fri Jun 13", "Mon Jun 16", "Tue Jun 17"];
    const times = ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"];
    const slots = [];
    days.forEach((d) => times.forEach((t) => slots.push({ day: d, time: t })));
    return slots.sort(() => Math.random() - 0.5).slice(0, 8);
  }

  function showToast(msg, type = "info", duration = 4000) {
    const container = document.getElementById("toastContainer");
    if (!container) return;
    const icons = { success: "✅", error: "❌", info: "ℹ️" };
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${icons[type]}</span> ${msg}`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add("removing");
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  /* ============================================================
     RENDER ENGINE
     ============================================================ */
  function renderPrograms() {
    const grid = document.getElementById("programsGrid");
    if (!grid) return;
    grid.innerHTML = PROGRAMS.map((prog, i) => `
      <article class="program-card reveal" style="transition-delay:${i * 80}ms" data-program="${prog.id}">
        <div class="program-img-wrap">
          <img src="${prog.image}" alt="${prog.title}" class="program-img" loading="lazy" />
        </div>
        <div class="program-body">
          <span class="program-tag">${prog.tag}</span>
          <h3 class="program-title">${prog.title}</h3>
          <p class="program-desc">${prog.description}</p>
          <div class="program-meta">
            <span class="program-duration-icon">🕐</span>
            <span>${prog.duration}</span>
          </div>
          <button class="btn-outline-sm" onclick="scrollToForm('${prog.id}')">Learn More →</button>
        </div>
      </article>
    `).join("");
  }

  function scrollToForm(programId) {
    const sel = document.getElementById("programSelect");
    if (sel) sel.value = programId;
    document.getElementById("select-coach")?.scrollIntoView({ behavior: "smooth" });
  }

  function renderCoaches(coaches = COACHES, container = "coachesGrid") {
    const grid = document.getElementById(container);
    if (!grid) return;
    grid.innerHTML = coaches.map((coach, i) => `
      <article class="coach-card reveal" style="transition-delay:${i * 60}ms" onclick="openCoachModal(${coach.id})">
        <div class="coach-avatar-placeholder">${getInitials(coach.name)}</div>
        <h3 class="coach-name">${coach.name}</h3>
        <span class="coach-spec">${getProgramLabel(coach.specialization)}</span>
        <div class="coach-meta">
          <span class="coach-exp">👤 ${coach.experience} yrs</span>
          <span class="coach-rating"><span class="stars">${renderStars(coach.rating)}</span> ${coach.rating}</span>
        </div>
        <button class="btn-outline-sm" onclick="event.stopPropagation(); openCoachModal(${coach.id})">View Profile</button>
      </article>
    `).join("");
  }

  /* ============================================================
     MODALS
     ============================================================ */
  function openCoachModal(coachId) {
    const coach = COACHES.find((c) => c.id === coachId);
    if (!coach) return;
    const overlay = document.getElementById("coachModal");
    if (!overlay) return;

    document.getElementById("modalAvatar").textContent = getInitials(coach.name);
    document.getElementById("modalCoachName").textContent = coach.name;
    document.getElementById("modalCoachSpec").textContent = getProgramLabel(coach.specialization);
    document.getElementById("modalBio").textContent = coach.bio;
    document.getElementById("modalStats").innerHTML = `
      <div class="modal-stat"><span class="modal-stat-val">${coach.experience}</span><span class="modal-stat-label">Years Exp.</span></div>
      <div class="modal-stat"><span class="modal-stat-val">${renderStars(coach.rating)}</span><span class="modal-stat-label">Rating</span></div>
      <div class="modal-stat"><span class="modal-stat-val">${coach.rating}</span><span class="modal-stat-label">Score</span></div>
    `;
    document.getElementById("modalTags").innerHTML = coach.tags.map((t) => `<span class="modal-tag">${t}</span>`).join("");

    document.getElementById("modalBookBtn").onclick = () => {
      closeModal();
      scrollToForm(coach.specialization);
      setTimeout(() => {
        const pSel = document.getElementById("programSelect");
        if (pSel) pSel.value = coach.specialization;
      }, 600);
    };
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    document.getElementById("coachModal")?.classList.remove("open");
    document.body.style.overflow = "";
  }

  /* ============================================================
     SLIDER (TESTIMONIALS)
     ============================================================ */
  function renderTestimonials() {
    const track = document.getElementById("testimonialsTrack");
    const dotsContainer = document.getElementById("sliderDots");
    if (!track || !dotsContainer) return;

    track.innerHTML = TESTIMONIALS.map((t) => `
      <article class="testimonial-card">
        <div class="testimonial-quote">"</div>
        <p class="testimonial-text">${t.text}</p>
        <div class="testimonial-author">
          <div class="testimonial-avatar">${getInitials(t.name)}</div>
          <div>
            <p class="testimonial-name">${t.name}</p>
            <p class="testimonial-role">${t.role}</p>
          </div>
          <div class="testimonial-stars">${"★".repeat(t.rating)}</div>
        </div>
      </article>
    `).join("");

    dotsContainer.innerHTML = TESTIMONIALS.map((_, i) => `
      <button class="slider-dot${i === 0 ? " active" : ""}" onclick="goToSlide(${i})" aria-label="Slide ${i + 1}"></button>
    `).join("");

    updateSlider();
    startSliderAuto();
  }

  function updateSlider() {
    const track = document.getElementById("testimonialsTrack");
    if (!track) return;
    const cards = track.querySelectorAll(".testimonial-card");
    const dots = document.querySelectorAll(".slider-dot");
    if (!cards.length) return;
    const containerW = track.parentElement.offsetWidth;
    const cardW = cards[0].offsetWidth + 28;
    const visible = Math.max(1, Math.min(3, Math.round(containerW / 340)));
    const maxSlide = Math.max(0, cards.length - visible);
    currentSlide = Math.min(currentSlide, maxSlide);
    track.style.transform = `translateX(-${currentSlide * cardW}px)`;
    dots.forEach((d, i) => d.classList.toggle("active", i === currentSlide));
  }

  function goToSlide(idx) { currentSlide = idx; updateSlider(); resetSliderAuto(); }
  function prevSlide() { currentSlide = Math.max(0, currentSlide - 1); updateSlider(); resetSliderAuto(); }
  function nextSlide() {
    const track = document.getElementById("testimonialsTrack");
    if (!track) return;
    const cards = track.querySelectorAll(".testimonial-card");
    const containerW = track.parentElement.offsetWidth;
    const visible = Math.max(1, Math.min(3, Math.round(containerW / 340)));
    const maxSlide = Math.max(0, cards.length - visible);
    currentSlide = currentSlide >= maxSlide ? 0 : currentSlide + 1;
    updateSlider();
    resetSliderAuto();
  }

  function startSliderAuto() { sliderInterval = setInterval(nextSlide, 4500); }
  function resetSliderAuto() { clearInterval(sliderInterval); startSliderAuto(); }

  function initSliderButtons() {
    document.getElementById("prevBtn")?.addEventListener("click", prevSlide);
    document.getElementById("nextBtn")?.addEventListener("click", nextSlide);
    const slider = document.getElementById("testimonialsSlider");
    slider?.addEventListener("mouseenter", () => clearInterval(sliderInterval));
    slider?.addEventListener("mouseleave", startSliderAuto);
    let touchStartX = 0;
    slider?.addEventListener("touchstart", (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
    slider?.addEventListener("touchend", (e) => {
      const diff = touchStartX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 50) diff > 0 ? nextSlide() : prevSlide();
    });
  }

  /* ============================================================
     BOOKING CONFIGURATION & STEPS
     ============================================================ */
  function populateProgramSelect() {
    const sel = document.getElementById("programSelect");
    if (!sel) return;
    sel.innerHTML = '<option value="">Select a Program...</option>';
    PROGRAMS.forEach((prog) => {
      const opt = document.createElement("option");
      opt.value = prog.id;
      opt.textContent = prog.title;
      sel.appendChild(opt);
    });
  }

  function initForm() {
    populateProgramSelect();
    document.querySelectorAll(".radio-card").forEach((card) => {
      card.addEventListener("click", () => {
        document.querySelectorAll(".radio-card").forEach((c) => c.classList.remove("selected"));
        card.classList.add("selected");
        const radio = card.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
      });
    });
    document.getElementById("nextStep")?.addEventListener("click", handleNextStep);
    document.getElementById("backStep")?.addEventListener("click", () => {
      goToStep(1); selectedCoach = null; selectedSlot = null;
    });
    document.getElementById("submitForm")?.addEventListener("click", handleSubmit);
    document.getElementById("resetForm")?.addEventListener("click", resetForm);
    document.getElementById("downloadSummaryBtn")?.addEventListener("click", downloadSummary);
  }

  function handleNextStep() {
    if (!validateStep1()) return;
    const option = document.querySelector('input[name="coachOption"]:checked')?.value;
    const programId = document.getElementById("programSelect").value;
    goToStep(2);
    if (option === "assign") showAutoAssign(programId);
    else showFilteredCoaches(programId);
    renderScheduleSlots();
  }

  function validateStep1() {
    const name = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const program = document.getElementById("programSelect").value;
    const option = document.querySelector('input[name="coachOption"]:checked');

    setError("nameError", !name ? "Full name is required." : "");
    setError("emailError", !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "Enter a valid email address." : "");
    setError("phoneError", !phone || !/^\+?[\d\s\-().]{7,20}$/.test(phone) ? "Enter a valid phone number." : "");
    setError("programError", !program ? "Please select a program." : "");
    setError("optionError", !option ? "Please choose an option." : "");

    return !["nameError", "emailError", "phoneError", "programError", "optionError"].some(
      (id) => document.getElementById(id)?.textContent !== ""
    );
  }

  function setError(id, msg) {
    const el = document.getElementById(id);
    if (el) el.textContent = msg;
  }

  function goToStep(stepNum) {
    currentStep = stepNum;
    document.querySelectorAll(".form-step").forEach((s, i) => s.classList.toggle("active", i + 1 === stepNum));
  }

  function showAutoAssign(programId) {
    document.getElementById("filteredCoachesGrid")?.classList.add("hidden");
    document.getElementById("autoAssignResult")?.classList.remove("hidden");
    const candidates = COACHES.filter((c) => c.specialization === programId);
    const best = candidates.reduce((a, b) => (a.rating >= b.rating ? a : b), candidates[0] || COACHES[0]);
    selectedCoach = best;
    document.getElementById("assignedCoachName").textContent = best.name;
    document.getElementById("assignedCoachSpec").textContent = `${getProgramLabel(best.specialization)} · ${best.experience} yrs exp · ★ ${best.rating}`;
  }

  function showFilteredCoaches(programId) {
    document.getElementById("autoAssignResult")?.classList.add("hidden");
    const grid = document.getElementById("filteredCoachesGrid");
    if (!grid) return;
    grid.classList.remove("hidden");
    const coaches = COACHES.filter((c) => c.specialization === programId);
    grid.innerHTML = coaches.map((coach) => `
      <div class="filtered-coach-card" data-coach-id="${coach.id}" onclick="selectFilteredCoach(${coach.id}, this)">
        <div class="coach-avatar-placeholder">${getInitials(coach.name)}</div>
        <p class="mini-name">${coach.name}</p>
        <p class="mini-meta">${coach.experience} yrs experience</p>
        <p class="mini-rating">★ ${coach.rating}</p>
      </div>
    `).join("");
  }

  function selectFilteredCoach(coachId, el) {
    selectedCoach = COACHES.find((c) => c.id === coachId);
    document.querySelectorAll(".filtered-coach-card").forEach((c) => c.classList.remove("selected"));
    el.classList.add("selected");
    setError("coachSelectError", "");
  }

  function renderScheduleSlots() {
    document.getElementById("scheduleStep")?.classList.remove("hidden");
    const grid = document.getElementById("scheduleGrid");
    if (!grid) return;
    const slots = generateSlots();
    grid.innerHTML = slots.map((slot, i) => `
      <div class="time-slot" data-idx="${i}" onclick="selectSlot(this, '${slot.day}', '${slot.time}')">
        <div class="slot-day">${slot.day}</div>
        <div class="slot-time">${slot.time}</div>
      </div>
    `).join("");
  }

  function selectSlot(el, day, time) {
    document.querySelectorAll(".time-slot").forEach((s) => s.classList.remove("selected"));
    el.classList.add("selected");
    selectedSlot = `${day} at ${time}`;
    setError("slotError", "");
  }

  function handleSubmit() {
    const option = document.querySelector('input[name="coachOption"]:checked')?.value;
    if (option !== "assign" && !selectedCoach) {
      setError("coachSelectError", "Please select a coach to continue.");
      return;
    }
    if (!selectedSlot) {
      setError("slotError", "Please choose a session time slot.");
      return;
    }
    const programId = document.getElementById("programSelect").value;
    const clientName = document.getElementById("fullName").value.trim();
    const coachName = selectedCoach?.name || "—";

    document.getElementById("summaryName").textContent = clientName;
    document.getElementById("summaryProgram").textContent = getProgramLabel(programId);
    document.getElementById("summaryCoach").textContent = coachName;
    document.getElementById("summarySlot").textContent = selectedSlot;
    document.getElementById("summaryDuration").textContent = getProgramDuration(programId);

    const booking = {
      id: Date.now(),
      name: clientName,
      email: document.getElementById("email").value.trim(),
      program: getProgramLabel(programId),
      coach: coachName,
      slot: selectedSlot,
      duration: getProgramDuration(programId),
      bookedAt: new Date().toLocaleString()
    };
    savedBookings.push(booking);
    try { localStorage.setItem("apexBookings", JSON.stringify(savedBookings)); } catch (e) { }

    document.getElementById("coachForm")?.classList.add("hidden");
    document.getElementById("bookingSummary")?.classList.remove("hidden");
    showToast(`🎉 Session booked with ${coachName}!`, "success", 5000);
  }

  function resetForm() {
    document.getElementById("coachForm")?.classList.remove("hidden");
    document.getElementById("bookingSummary")?.classList.add("hidden");
    document.getElementById("coachForm")?.reset();
    document.querySelectorAll(".radio-card").forEach((c) => c.classList.remove("selected"));
    document.querySelectorAll(".field-error").forEach((e) => (e.textContent = ""));
    document.getElementById("scheduleStep")?.classList.add("hidden");
    selectedCoach = null; selectedSlot = null;
    goToStep(1);
  }

  function downloadSummary() {
    const name = document.getElementById("summaryName").textContent;
    const program = document.getElementById("summaryProgram").textContent;
    const coach = document.getElementById("summaryCoach").textContent;
    const slot = document.getElementById("summarySlot").textContent;
    const dur = document.getElementById("summaryDuration").textContent;
    const content = [
      "APEX COACHING — SESSION BOOKING CONFIRMATION",
      "=".repeat(50), "",
      `Client Name:     ${name}`,
      `Program:         ${program}`,
      `Coach:           ${coach}`,
      `Session Slot:    ${slot}`,
      `Duration:        ${dur}`,
      `Format:          1-on-1 Video Call`, "",
      "A confirmation email will be sent to your inbox.",
      "Your coach will reach out within 24 hours.", "",
      `Booked on: ${new Date().toLocaleString()}`, "",
      "— ApexCoaching Team", "hello@apexcoaching.com | +1 800 555 0100"
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `ApexCoaching_Booking_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
    showToast("Summary downloaded!", "success");
  }

  /* ============================================================
     CONTACT MANAGEMENT
     ============================================================ */
  function initContactForm() {
    const form = document.getElementById("contactForm");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("cName").value.trim();
      const email = document.getElementById("cEmail").value.trim();
      const subject = document.getElementById("cSubject").value.trim();
      const message = document.getElementById("cMessage").value.trim();

      const cNameErr = document.getElementById("cNameError");
      const cEmailErr = document.getElementById("cEmailError");
      const cSubjectErr = document.getElementById("cSubjectError");
      const cMessageErr = document.getElementById("cMessageError");

      cNameErr.textContent = !name ? "Name is required." : "";
      cEmailErr.textContent = !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "Enter a valid email." : "";
      cSubjectErr.textContent = !subject ? "Subject is required." : "";
      cMessageErr.textContent = !message ? "Message is required." : "";

      const valid = [cNameErr, cEmailErr, cSubjectErr, cMessageErr].every((el) => el.textContent === "");
      if (!valid) return;

      form.reset();
      [cNameErr, cEmailErr, cSubjectErr, cMessageErr].forEach((el) => (el.textContent = ""));
      const successEl = document.getElementById("contactSuccess");
      if (successEl) {
        successEl.classList.remove("hidden");
        setTimeout(() => successEl.classList.add("hidden"), 5000);
      }
      showToast("Message sent! We'll be in touch soon.", "success");
    });
  }

  /* ============================================================
     NAVIGATION & INTERACTIVE FLOWS
     ============================================================ */
  function initNavigation() {
    const navbar = document.getElementById("navbar");
    const hamburger = document.getElementById("hamburger");
    const navLinks = document.getElementById("navLinks");

    window.addEventListener("scroll", () => {
      navbar?.classList.toggle("scrolled", window.scrollY > 20);
      highlightActiveNav();
    }, { passive: true });

    hamburger?.addEventListener("click", () => {
      hamburger.classList.toggle("open");
      navLinks?.classList.toggle("open");
      document.body.style.overflow = navLinks?.classList.contains("open") ? "hidden" : "";
    });

    navLinks?.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        hamburger?.classList.remove("open");
        navLinks.classList.remove("open");
        document.body.style.overflow = "";
      });
    });
  }

  function highlightActiveNav() {
    const sections = ["home", "programs", "coaches", "select-coach", "testimonials", "contact"];
    let current = "";
    sections.forEach((id) => {
      const section = document.getElementById(id);
      if (section && window.scrollY >= section.offsetTop - 100) {
        current = id === "select-coach" ? "" : id;
      }
    });
    document.querySelectorAll(".nav-link").forEach((link) => {
      const href = link.getAttribute("href")?.replace("#", "");
      link.classList.toggle("active", href === current);
    });
  }

  /* ============================================================
     SCROLL REVEAL ENGINE
     ============================================================ */
  function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
  }

  /* ============================================================
     EXPOSE LOCAL HANDLERS INTERNALLY TO LIFETIME DOM SCOPE
     ============================================================ */
  window.scrollToForm = scrollToForm;
  window.openCoachModal = openCoachModal;
  window.selectFilteredCoach = selectFilteredCoach;
  window.selectSlot = selectSlot;
  window.goToSlide = goToSlide;

  /* ============================================================
     INITIALIZATION ORCHESTRATION
     ============================================================ */
  renderPrograms();
  renderCoaches();
  renderTestimonials();
  initForm();
  initSliderButtons();
  initContactForm();
  initNavigation();
  initScrollReveal();

  document.getElementById("modalClose")?.addEventListener("click", closeModal);
  document.getElementById("modalClose2")?.addEventListener("click", closeModal);
  document.getElementById("coachModal")?.addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
  window.addEventListener("resize", updateSlider);
}