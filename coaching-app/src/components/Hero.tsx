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
          To cultivate a world where leaders lead with courage, clarity, and
          compassion owning their voice, honoring their values, and creating
          meaningful impact in work and life.
        </p>
        <div className="uw-hero-pillars" aria-label="Core pillars">
          <span>Courage</span>
          <span>Clarity</span>
          <span>Connection</span>
        </div>
        <div className="uw-hero-actions">
          <a className="uw-btn uw-btn-primary" href="#engage">
            Engage With Us
          </a>
          <a className="uw-btn uw-btn-quiet" href="#why">
            Learn more
          </a>
        </div>
      </div>
    </div>
  </section>
);

export default Hero;
