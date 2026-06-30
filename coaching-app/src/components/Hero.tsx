import React from "react";

const Hero: React.FC = () => (
  <section id="home" className="uw-hero">
    <div className="uw-hero-media" aria-hidden="true" />
    <div className="uw-hero-overlay" aria-hidden="true" />
    <div className="uw-hero-inner">
      <div className="uw-hero-copy">
        <span className="uw-kicker">African-led executive coaching</span>
        <h1>Unwantra Coaching</h1>
        <p>
          We help leaders own their voice, lead with integrity, and live with
          intention through transformational coaching that strengthens
          confidence, boundaries, influence and values-based leadersip.{" "}
        </p>
        <div className="uw-hero-actions">
          <a className="uw-btn uw-btn-primary" href="#discovery-call">
            Book a discovery call
          </a>
          <a className="uw-btn uw-btn-quiet" href="#services">
            Explore services
          </a>
        </div>
      </div>
    </div>
  </section>
);

export default Hero;
