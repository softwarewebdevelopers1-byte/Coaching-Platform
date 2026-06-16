// components/Navbar.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    document.body.style.overflow = !menuOpen ? "hidden" : "";
  };

  const closeMenu = () => {
    setMenuOpen(false);
    document.body.style.overflow = "";
  };

  return (
    <nav
      id="navbar"
      className={scrolled ? "scrolled" : ""}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        height: "var(--nav-h)",
        background: "rgba(250, 248, 244, 0.92)",
        backdropFilter: "blur(14px)",
        borderBottom: scrolled
          ? "1px solid var(--clr-border)"
          : "1px solid transparent",
        boxShadow: scrolled ? "var(--shadow-sm)" : "none",
        transition:
          "border-color var(--transition), box-shadow var(--transition)",
      }}
    >
      <div
        className="nav-inner"
        style={{
          maxWidth: "var(--container)",
          marginInline: "auto",
          paddingInline: "clamp(20px, 5vw, 64px)",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: "32px",
        }}
      >
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
            }}
          >
            Apex
            <em style={{ fontStyle: "italic", color: "var(--clr-gold)" }}>
              Coaching
            </em>
          </span>
        </a>
        <ul
          className={`nav-links ${menuOpen ? "open" : ""}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            marginLeft: "auto",
            ...(menuOpen && window.innerWidth <= 900
              ? {
                  display: "flex",
                  flexDirection: "column",
                  position: "fixed",
                  inset: "var(--nav-h) 0 0",
                  background: "var(--clr-bg)",
                  padding: "32px 24px",
                  gap: "8px",
                  zIndex: 999,
                  borderTop: "1px solid var(--clr-border)",
                  overflowY: "auto",
                }
              : {}),
          }}
        >
          <li>
            <a
              href="#home"
              className="nav-link"
              onClick={closeMenu}
              style={{
                padding: "6px 14px",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.9rem",
                fontWeight: 500,
                color: "var(--clr-ink-soft)",
                transition: "var(--transition)",
                display: "block",
              }}
            >
              Home
            </a>
          </li>
          <li>
            <a
              href="#programs"
              className="nav-link"
              onClick={closeMenu}
              style={{
                padding: "6px 14px",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.9rem",
                fontWeight: 500,
                color: "var(--clr-ink-soft)",
                transition: "var(--transition)",
                display: "block",
              }}
            >
              Programs
            </a>
          </li>
          <li>
            <a
              href="#coaches"
              className="nav-link"
              onClick={closeMenu}
              style={{
                padding: "6px 14px",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.9rem",
                fontWeight: 500,
                color: "var(--clr-ink-soft)",
                transition: "var(--transition)",
                display: "block",
              }}
            >
              Coaches
            </a>
          </li>
          <li>
            <a
              href="#testimonials"
              className="nav-link"
              onClick={closeMenu}
              style={{
                padding: "6px 14px",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.9rem",
                fontWeight: 500,
                color: "var(--clr-ink-soft)",
                transition: "var(--transition)",
                display: "block",
              }}
            >
              Testimonials
            </a>
          </li>
          <li>
            <a
              href="#contact"
              className="nav-link"
              onClick={closeMenu}
              style={{
                padding: "6px 14px",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.9rem",
                fontWeight: 500,
                color: "var(--clr-ink-soft)",
                transition: "var(--transition)",
                display: "block",
              }}
            >
              Contact
            </a>
          </li>
        </ul>
        <a
          href={user ? "#" : "#select-coach"}
          onClick={(e) => {
            if (user) {
              e.preventDefault();
              logout();
              navigate("/");
            }
          }}
          className="btn btn-nav"
          style={{
            background: user ? "var(--clr-gold)" : "var(--clr-accent)",
            color: "#fff",
            borderColor: user ? "var(--clr-gold)" : "var(--clr-accent)",
            padding: "10px 22px",
            fontSize: "0.875rem",
            display: window.innerWidth <= 900 ? "none" : "inline-flex",
            alignItems: "center",
            gap: "8px",
            borderRadius: "var(--radius-sm)",
            fontWeight: 600,
            letterSpacing: "0.02em",
            cursor: "pointer",
            border: "2px solid transparent",
            transition: "var(--transition)",
            whiteSpace: "nowrap",
          }}
        >
          {user ? `Logout (${user.fullName})` : "Get Started"}
        </a>
        <button
          className={`hamburger ${menuOpen ? "open" : ""}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
          style={{
            display: window.innerWidth <= 900 ? "flex" : "none",
            flexDirection: "column",
            gap: "5px",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            marginLeft: "auto",
          }}
        >
          <span
            style={{
              display: "block",
              width: "24px",
              height: "2px",
              background: "var(--clr-ink)",
              borderRadius: "2px",
              transition: "var(--transition)",
              ...(menuOpen
                ? { transform: "translateY(7px) rotate(45deg)" }
                : {}),
            }}
          ></span>
          <span
            style={{
              display: "block",
              width: "24px",
              height: "2px",
              background: "var(--clr-ink)",
              borderRadius: "2px",
              transition: "var(--transition)",
              ...(menuOpen ? { opacity: 0 } : {}),
            }}
          ></span>
          <span
            style={{
              display: "block",
              width: "24px",
              height: "2px",
              background: "var(--clr-ink)",
              borderRadius: "2px",
              transition: "var(--transition)",
              ...(menuOpen
                ? { transform: "translateY(-7px) rotate(-45deg)" }
                : {}),
            }}
          ></span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
