import { useState, useEffect, useCallback } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import "./styles/Dashboard.css";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import MainContent from "./components/MainContent";
import Footer from "./components/Footer";
import AdminDashboard from "./components/AdminDashboard";
import CoachDashboard from "./components/CoachDashboard";
import { ProtectedRoute } from "./components/ProtectedRoute";
import LoginPage from "./components/LoginPage";
import { AuthProvider } from "./context/AuthContext";
import type {  Program, Testimonial, Booking } from "./types";

// Data
export const PROGRAMS: Program[] = [
  {
    id: "career",
    title: "Career Coaching",
    tag: "Professional",
    description:
      "Accelerate your career trajectory with expert guidance on job transitions, salary negotiation, personal branding, and skill development.",
    duration: "12 Sessions · 3 Months",
    image:
      "https://images.unsplash.com/photo-1542626991-cbc4e32524cc?w=600&q=75",
    color: "#2C4A6E",
  },
  {
    id: "business",
    title: "Business Coaching",
    tag: "Entrepreneur",
    description:
      "Scale your business with strategic planning, revenue optimization, team building, and leadership frameworks tailored to your industry.",
    duration: "16 Sessions · 4 Months",
    image:
      "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=600&q=75",
    color: "#C9933A",
  },
  {
    id: "life",
    title: "Life Coaching",
    tag: "Lifestyle",
    description:
      "Achieve balance, clarity, and purpose. Redesign your habits, mindset, and relationships to build the life you've always envisioned.",
    duration: "10 Sessions · 2.5 Months",
    image:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=75",
    color: "#4CAF50",
  },
  {
    id: "leadership",
    title: "Leadership Coaching",
    tag: "Executive",
    description:
      "Develop your executive presence, communication power, emotional intelligence, and vision to lead with lasting impact.",
    duration: "14 Sessions · 3.5 Months",
    image:
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&q=75",
    color: "#7B2D8B",
  },
];



export const TESTIMONIALS: Testimonial[] = [
  {
    text: "Working with Sarah transformed my career. I went from feeling stuck in a mid-level role to landing my dream VP position in just three months. Her clarity and push were exactly what I needed.",
    name: "Thomas Chen",
    role: "VP of Product, TechScale",
    rating: 5,
  },
  {
    text: "Marcus gave me the strategic blueprint I desperately needed. Our revenue doubled within a year of coaching. I tell every founder I know about Apex Coaching.",
    name: "Olivia Patel",
    role: "Founder & CEO, Bloom Ventures",
    rating: 5,
  },
  {
    text: "Elena's life coaching sessions were genuinely life-changing. I finally stopped running on autopilot and started building a life with real intention. I'm more present and happier than ever.",
    name: "James Osei",
    role: "Senior Engineer, Horizon Inc.",
    rating: 5,
  },
  {
    text: "David's leadership coaching unlocked something in me I didn't know existed. My team's engagement scores are through the roof, and I feel calm and confident in every boardroom I enter.",
    name: "Sophie Laurent",
    role: "COO, Meridian Finance",
    rating: 5,
  },
  {
    text: "The coach-matching process was seamless and I felt truly understood from day one. I secured a 40% salary increase after just six sessions. Absolutely worth every penny.",
    name: "Carlos Mendez",
    role: "Marketing Director, Nova Group",
    rating: 5,
  },
  {
    text: "Priya's guidance on personal branding completely changed how I show up on LinkedIn and in interviews. I had three competing offers within two months. Incredible.",
    name: "Grace Antwi",
    role: "Product Manager, Finzara",
    rating: 5,
  },
];

function AppContent() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(
    null,
  );

  useEffect(() => {
    const saved = localStorage.getItem("apexBookings");
    if (saved) {
      setBookings(JSON.parse(saved));
    }
  }, []);

  const showToast = useCallback(
    (message: string, type: string = "info", duration: number = 4000) => {
      setToast({ message, type });
      setTimeout(() => setToast(null), duration);
    },
    [],
  );

  const addBooking = useCallback(
    (booking: Booking) => {
      const newBookings = [...bookings, booking];
      setBookings(newBookings);
      localStorage.setItem("apexBookings", JSON.stringify(newBookings));
      showToast(`🎉 Session booked with ${booking.coach}!`, "success", 5000);
    },
    [bookings, showToast],
  );

  return (
    <Routes>
      {/* Staff Login */}
      <Route path="/login" element={<LoginPage />} />

      {/* Admin Dashboard */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <>
              {toast && (
                <div className={`toast-container`}>
                  <div className={`toast ${toast.type}`}>
                    <span>
                      {toast.type === "success"
                        ? "✅"
                        : toast.type === "error"
                          ? "❌"
                          : "ℹ️"}
                    </span>
                    {toast.message}
                  </div>
                </div>
              )}
              <AdminDashboard showToast={showToast} />
            </>
          </ProtectedRoute>
        }
      />

      {/* Coach Dashboard */}
      <Route
        path="/coach"
        element={
          <ProtectedRoute requiredRole="coach">
            <>
              {toast && (
                <div className={`toast-container`}>
                  <div className={`toast ${toast.type}`}>
                    <span>
                      {toast.type === "success"
                        ? "✅"
                        : toast.type === "error"
                          ? "❌"
                          : "ℹ️"}
                    </span>
                    {toast.message}
                  </div>
                </div>
              )}
              <CoachDashboard
                programs={PROGRAMS}
                showToast={showToast}
              />
            </>
          </ProtectedRoute>
        }
      />

      {/* Public Home Page */}
      <Route
        path="/"
        element={
          <div className="app">
            {toast && (
              <div className={`toast-container`}>
                <div className={`toast ${toast.type}`}>
                  <span>
                    {toast.type === "success"
                      ? "✅"
                      : toast.type === "error"
                        ? "❌"
                        : "ℹ️"}
                  </span>
                  {toast.message}
                </div>
              </div>
            )}
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

      {/* 404 - Redirect to home */}
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
