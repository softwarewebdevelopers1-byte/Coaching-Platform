import { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import "./App.css";
import "./styles/Dashboard.css";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import MainContent from "./components/MainContent";
import Footer from "./components/Footer";
import AboutPage from "./components/AboutPage";
import AdminDashboard from "./components/AdminDashboard";
import CoachDashboard from "./components/CoachDashboard";
import { ProtectedRoute } from "./components/ProtectedRoute";
import LoginPage from "./components/LoginPage";
import ForgotPasswordPage from "./components/ForgotPasswordPage";
import ResetPasswordPage from "./components/ResetPasswordPage";
import CoachSignupPage from "./components/CoachSignupPage";
import { AuthProvider } from "./context/AuthContext";
import type { Booking, Program, Testimonial } from "./types";

export const PROGRAMS: Program[] = [
  {
    id: "individual-executive",
    title: "Individual Executive Coaching",
    tag: "One-to-one",
    description:
      "Private coaching for senior leaders who want to lead with courage, clarity, stronger boundaries, and values-based influence.",
    duration: "",
    image:
      "/individual-coaching.jpg",
    color: "#D9A928",
    benefits: [
      "Build executive presence and confidence",
      "Strengthen decision-making and boundaries",
      "Clarify values, voice, and leadership identity",
    ],
    outcomes: [
      "A practical leadership growth plan",
      "Clearer communication in high-stakes moments",
      "Measurable progress against personal coaching goals",
    ],
  },
  {
    id: "group-executive",
    title: "Group Executive Coaching",
    tag: "Leadership cohorts",
    description:
      "Facilitated coaching cohorts for leadership teams and emerging executives who need trust, alignment, and shared leadership language.",
    duration: "",
    image:
      "/group-coaching.jpg",
    color: "#7F9A7A",
    benefits: [
      "Create shared clarity across leadership teams",
      "Practice courageous conversations",
      "Improve connection, trust, and accountability",
    ],
    outcomes: [
      "Aligned leadership commitments",
      "Healthier team communication rituals",
      "A values-led operating rhythm for the cohort",
    ],
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    text: "Unwantra helped me find my voice in rooms where I used to shrink. I now lead with more calm, clarity, and conviction.",
    name: "Amina K.",
    role: "Regional Director, Financial Services",
    rating: 5,
  },
  {
    text: "The coaching was practical and deeply human. Our leadership team left with language we still use every week.",
    name: "Lydia M.",
    role: "People Lead, Pan-African Nonprofit",
    rating: 5,
  },
  {
    text: "I came for executive presence and left with a stronger relationship to my values, boundaries, and influence.",
    name: "Njeri W.",
    role: "Founder and CEO",
    rating: 5,
  },
];

function AppContent() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(
    null,
  );
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("unwantraBookings");
    if (saved) setBookings(JSON.parse(saved));
  }, []);

  const showToast = useCallback(
    (message: string, type: string = "info", duration: number = 4000) => {
      setToast({ message, type });
      window.setTimeout(() => setToast(null), duration);
    },
    [],
  );

  const addBooking = useCallback(
    (booking: Booking) => {
      const newBookings = [...bookings, booking];
      setBookings(newBookings);
      localStorage.setItem("unwantraBookings", JSON.stringify(newBookings));
    },
    [bookings],
  );

  const handleBookDiscovery = useCallback(() => {
    navigate("/", { state: { scrollTo: "quick-book" } });
  }, [navigate]);

  const toastMarkup = toast && (
    <div className="toast-container">
      <div className={`toast ${toast.type}`}>
        <span>{toast.type === "success" ? "OK" : toast.type === "error" ? "!" : "i"}</span>
        {toast.message}
      </div>
    </div>
  );

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/coach-signup" element={<CoachSignupPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <>
              {toastMarkup}
              <AdminDashboard showToast={showToast} />
            </>
          </ProtectedRoute>
        }
      />
      <Route
        path="/coach"
        element={
          <ProtectedRoute requiredRole="coach">
            <>
              {toastMarkup}
              <CoachDashboard programs={PROGRAMS} showToast={showToast} />
            </>
          </ProtectedRoute>
        }
      />
      <Route
        path="/about"
        element={
          <div className="app">
            <Navbar />
            <AboutPage onBookCall={handleBookDiscovery} />
            <Footer />
          </div>
        }
      />
      <Route
        path="/"
        element={
          <div className="app">
            {toastMarkup}
            <Navbar />
            <Hero />
            <MainContent
              programs={PROGRAMS}
              testimonials={TESTIMONIALS}
              onAddBooking={addBooking}
              showToast={showToast}
            />
            <Footer />
          </div>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;


