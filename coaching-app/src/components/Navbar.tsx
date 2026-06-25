import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  ["Mission", "#mission"],
  ["Services", "#services"],
  ["Our Story", "#story"],
  ["Coaches", "#coaches"],
  ["Contact", "#contact"],
];

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className={`uw-nav ${scrolled ? "is-scrolled" : ""}`}>
      <a className="uw-logo" href="#home" onClick={closeMenu}>
        <span>U</span>
        <strong>Unwantra Coaching</strong>
      </a>
      <button
        className="uw-menu-btn"
        type="button"
        aria-label="Toggle menu"
        onClick={() => setMenuOpen((value) => !value)}
      >
        <span />
        <span />
        <span />
      </button>
      <div className={`uw-nav-links ${menuOpen ? "open" : ""}`}>
        {links.map(([label, href]) => (
          <a key={href} href={href} onClick={closeMenu}>{label}</a>
        ))}
        {!user && (
          <button
            type="button"
            onClick={() => {
              closeMenu();
              navigate("/login");
            }}
          >
            Staff Login
          </button>
        )}
        <a className="uw-nav-cta" href="#discovery-call" onClick={(event) => {
          if (user) {
            event.preventDefault();
            logout();
            navigate("/");
          }
          closeMenu();
        }}>
          {user ? `Logout ${user.fullName}` : "Book discovery call"}
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
