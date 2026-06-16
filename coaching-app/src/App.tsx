// App.tsx
import { useState, useEffect, useCallback } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import MainContent from "./components/MainContent";
import Footer from "./components/Footer";
import type { Coach, Program, Testimonial, Booking } from "./types";

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

export const COACHES: Coach[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.johnson@apexcoaching.com",
    phone: "+1 800 555 0101",
    specialization: "career",
    experience: 8,
    rating: 4.9,
    bio: "Former HR Director at Fortune 500 firms. Sarah has helped over 400 professionals navigate career transitions, negotiate senior roles, and build compelling personal brands. She combines data-driven coaching with deep human insight.",
    tags: [
      "Career Transitions",
      "Salary Negotiation",
      "Personal Branding",
      "Interview Prep",
    ],
  },
  {
    id: 2,
    name: "Marcus Williams",
    email: "marcus.williams@apexcoaching.com",
    phone: "+1 800 555 0102",
    specialization: "business",
    experience: 12,
    rating: 4.8,
    bio: "Serial entrepreneur and startup advisor with 3 successful exits. Marcus brings first-hand experience in scaling businesses from zero to eight figures. His coaching blends operational rigor with entrepreneurial mindset.",
    tags: [
      "Revenue Growth",
      "Startup Strategy",
      "Team Building",
      "Fundraising",
    ],
  },
  {
    id: 3,
    name: "Elena Rodriguez",
    email: "elena.rodriguez@apexcoaching.com",
    phone: "+1 800 555 0103",
    specialization: "life",
    experience: 6,
    rating: 4.7,
    bio: "ICF-certified holistic life coach with backgrounds in positive psychology and mindfulness. Elena helps clients redesign their lives with intention, moving from burnout to balance with measurable, lasting change.",
    tags: [
      "Mindfulness",
      "Work-Life Balance",
      "Habit Design",
      "Clarity & Purpose",
    ],
  },
  {
    id: 4,
    name: "David Kim",
    email: "david.kim@apexcoaching.com",
    phone: "+1 800 555 0104",
    specialization: "leadership",
    experience: 15,
    rating: 4.9,
    bio: "Ex-C-suite executive coach and TEDx speaker. David has advised Fortune 100 boards and coached over 200 leaders across 18 countries. His approach integrates neuroscience, systems thinking, and executive presence.",
    tags: [
      "Executive Presence",
      "Board Communication",
      "Emotional Intelligence",
      "Strategic Vision",
    ],
  },
  {
    id: 5,
    name: "Priya Sharma",
    email: "priya.sharma@apexcoaching.com",
    phone: "+1 800 555 0105",
    specialization: "career",
    experience: 9,
    rating: 4.8,
    bio: "LinkedIn Top Career Coach with 500+ successful placements. Priya specializes in competitive job markets, tech sector transitions, and building powerful networks that open doors others don't even see.",
    tags: [
      "LinkedIn Optimization",
      "Tech Careers",
      "Networking",
      "Job Search Strategy",
    ],
  },
  {
    id: 6,
    name: "James Thornton",
    email: "james.thornton@apexcoaching.com",
    phone: "+1 800 555 0106",
    specialization: "business",
    experience: 11,
    rating: 4.7,
    bio: "MBA coach and revenue growth strategist. James works with established business owners who want to scale without losing what makes them great — culture, quality, and founder identity.",
    tags: [
      "Scale Strategy",
      "Operational Excellence",
      "Culture Building",
      "Profitability",
    ],
  },
  {
    id: 7,
    name: "Aisha Okafor",
    email: "aisha.okafor@apexcoaching.com",
    phone: "+1 800 555 0107",
    specialization: "life",
    experience: 7,
    rating: 4.9,
    bio: "Mindfulness and resilience specialist who blends ancient wisdom with modern behavioral science. Aisha helps high-achievers reconnect with their values and build extraordinary resilience for the long game.",
    tags: [
      "Resilience",
      "Stress Management",
      "Values Alignment",
      "Relationship Health",
    ],
  },
  {
    id: 8,
    name: "Ryan Mitchell",
    email: "ryan.mitchell@apexcoaching.com",
    phone: "+1 800 555 0108",
    specialization: "leadership",
    experience: 10,
    rating: 4.6,
    bio: "Agile leadership and team culture expert. Ryan partners with managers and directors who want to lead high-performance teams with authenticity, psychological safety, and results that speak for themselves.",
    tags: [
      "Agile Teams",
      "Psychological Safety",
      "Feedback Culture",
      "Change Management",
    ],
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

function App() {
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
        coaches={COACHES}
        testimonials={TESTIMONIALS}
        onAddBooking={addBooking}
        showToast={showToast}
      />
      <Footer />
    </div>
  );
}

export default App;
