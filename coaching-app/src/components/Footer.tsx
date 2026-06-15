// components/Footer.tsx
import React from "react";

const Footer: React.FC = () => {
  return (
    <footer
      className="footer"
      style={{
        background: "var(--clr-ink)",
        color: "rgba(255, 255, 255, 0.65)",
        paddingBlock: "clamp(56px, 7vw, 80px)",
      }}
    >
      <div className="container">
        <div
          className="footer-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1.8fr repeat(3, 1fr)",
            gap: "48px",
            marginBottom: "48px",
          }}
        >
          <div className="footer-brand">
            <a
              href="#home"
              className="logo"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                flexShrink: 0,
              }}
            >
              <span
                className="logo-mark"
                style={{
                  width: "36px",
                  height: "36px",
                  background: "var(--clr-gold)",
                  color: "#fff",
                  borderRadius: "var(--radius-sm)",
                  display: "grid",
                  placeItems: "center",
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                }}
              >
                A
              </span>
              <span
                className="logo-text"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  letterSpacing: "-0.01em",
                  color: "#fff",
                }}
              >
                Apex
                <em
                  style={{
                    fontStyle: "italic",
                    color: "var(--clr-gold-light)",
                  }}
                >
                  Coaching
                </em>
              </span>
            </a>
            <p
              className="footer-tagline"
              style={{
                fontSize: "0.88rem",
                lineHeight: 1.75,
                marginTop: "14px",
                maxWidth: "300px",
              }}
            >
              Empowering individuals to reach their highest potential through
              expert, personalized coaching.
            </p>
            <div
              className="social-icons"
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "20px",
              }}
            >
              <a
                href="#"
                className="social-icon"
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  display: "grid",
                  placeItems: "center",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  color: "rgba(255, 255, 255, 0.65)",
                  transition: "var(--transition)",
                }}
              >
                𝕏
              </a>
              <a href="#" className="social-icon">
                in
              </a>
              <a href="#" className="social-icon">
                ◎
              </a>
              <a href="#" className="social-icon">
                ▶
              </a>
            </div>
          </div>
          <div className="footer-col">
            <h4
              style={{
                color: "#fff",
                fontSize: "0.85rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "18px",
              }}
            >
              Quick Links
            </h4>
            <ul
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <li>
                <a
                  href="#home"
                  style={{
                    fontSize: "0.88rem",
                    color: "rgba(255, 255, 255, 0.55)",
                    transition: "var(--transition)",
                  }}
                >
                  Home
                </a>
              </li>
              <li>
                <a href="#programs">Programs</a>
              </li>
              <li>
                <a href="#coaches">Coaches</a>
              </li>
              <li>
                <a href="#testimonials">Testimonials</a>
              </li>
              <li>
                <a href="#contact">Contact</a>
              </li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Programs</h4>
            <ul>
              <li>
                <a href="#programs">Career Coaching</a>
              </li>
              <li>
                <a href="#programs">Business Coaching</a>
              </li>
              <li>
                <a href="#programs">Life Coaching</a>
              </li>
              <li>
                <a href="#programs">Leadership Coaching</a>
              </li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li>
                <a href="#">About Us</a>
              </li>
              <li>
                <a href="#">Blog</a>
              </li>
              <li>
                <a href="#">Careers</a>
              </li>
              <li>
                <a href="#">Privacy Policy</a>
              </li>
              <li>
                <a href="#">Terms of Service</a>
              </li>
            </ul>
          </div>
        </div>
        <div
          className="footer-bottom"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            paddingTop: "28px",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            fontSize: "0.82rem",
          }}
        >
          <p>&copy; 2025 ApexCoaching. All rights reserved.</p>
          <p>Designed with ♥ for growth-minded individuals</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
