import { useEffect } from "react";
import ToastContainer from "./components/ToastContainer";
import CoachModal from "./components/CoachModal";
import Navigation from "./components/Navigation";
import Hero from "./components/Hero";
import Programs from "./components/Programs";
import Coaches from "./components/Coaches";
import CoachSelection from "./components/CoachSelection";
import Testimonials from "./components/Testimonials";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import { initApexApp } from "./appLogic";

export default function App() {
  useEffect(() => {
    const cleanup = initApexApp();
    return cleanup;
  }, []);

  return (
    <>
      <ToastContainer />
      <CoachModal />
      <Navigation />
      <Hero />
      <Programs />
      <Coaches />
      <CoachSelection />
      <Testimonials />
      <Contact />
      <Footer />
    </>
  );
}
