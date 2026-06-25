import React from "react";

const Footer: React.FC = () => (
  <footer className="uw-footer">
    <div className="uw-container uw-footer-grid">
      <div>
        <a className="uw-logo uw-logo-footer" href="#home">
          <span>U</span>
          <strong>Unwantra Coaching</strong>
        </a>
        <p>
          Premium African-led and women-led executive coaching for leaders who
          want courage, clarity, connection, and values-based impact.
        </p>
      </div>
      <div>
        <h4>Pages</h4>
        <a href="#mission">Home</a>
        <a href="#story">Our Story</a>
        <a href="#services">Coaching Services</a>
        <a href="#coaches">Coaches</a>
      </div>
      <div>
        <h4>Services</h4>
        <a href="#services">Individual Executive Coaching</a>
        <a href="#services">Group Executive Coaching</a>
        <a href="#discovery-call">Discovery Call Booking</a>
      </div>
      <div>
        <h4>Contact</h4>
        <a href="mailto:hello@unwantra.co">hello@unwantra.co</a>
        <a href="#contact">Contact Us</a>
        <a href="/login">Coach and Admin Login</a>
      </div>
    </div>
    <div className="uw-container uw-footer-bottom">
      <span>© 2026 Unwantra Coaching. All rights reserved.</span>
      <span>Courage. Clarity. Connection.</span>
    </div>
  </footer>
);

export default Footer;
