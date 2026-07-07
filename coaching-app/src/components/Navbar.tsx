import React, { useEffect, useState } from "react";
import {  NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  ["Home", "#home"],
  ["Services", "#services"],
  ["Coaches", "#coaches"],
  ["Mission", "#mission"],
  ["Our Story", "#story"],
  ["About", "/about"],
  ["Contact", "#contact"],
];

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("#home");
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const scrollTarget = (location.state as { scrollTo?: string } | undefined)?.scrollTo;

    if (location.pathname === "/" && scrollTarget) {
      setActiveHash(`#${scrollTarget}`);
      requestAnimationFrame(() => {
        document.getElementById(scrollTarget)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [location.pathname, location.state]);

  useEffect(() => {
    if (location.pathname !== "/") {
      setActiveHash("#home");
      return;
    }

    const hashFromLocation = location.hash || "#home";
    setActiveHash(hashFromLocation);

    const sectionIds = links
      .filter(([, href]) => href.startsWith("#"))
      .map(([, href]) => href.slice(1));

    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (elements.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) {
          setActiveHash(`#${visible.target.id}`);
        }
      },
      { threshold: [0.2, 0.4, 0.6], rootMargin: "-20% 0px -45% 0px" },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [location.pathname, location.hash]);

  const closeMenu = () => setMenuOpen(false);

  const isLinkActive = (href: string) => {
    if (href.startsWith("/")) {
      return location.pathname === href;
    }

    if (href.startsWith("#")) {
      return location.pathname === "/" && activeHash === href;
    }

    return false;
  };

  const handleAnchorClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (!href.startsWith("#")) {
      return;
    }

    event.preventDefault();
    closeMenu();

    const targetId = href.slice(1);

    if (location.pathname === "/") {
      setActiveHash(href);
      const target = document.getElementById(targetId);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState({ scrollTo: targetId }, "", `/#${targetId}`);
      return;
    }

    navigate("/", { state: { scrollTo: targetId } });
  };

  const handleDiscoveryCtaClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (user) {
      event.preventDefault();
      logout();
      navigate("/");
      closeMenu();
      return;
    }

    if (location.pathname !== "/") {
      event.preventDefault();
      closeMenu();
      navigate("/", { state: { scrollTo: "quick-book" } });
      return;
    }

    closeMenu();
  };

  return (
    <nav className={`uw-nav ${scrolled ? "is-scrolled" : ""}`}>
      <a className="uw-logo" href="#home" onClick={(event) => handleAnchorClick(event, "#home")}>
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
        {links.map(([label, href]) =>
          href.startsWith("/") ? (
            <NavLink key={href} to={href} onClick={closeMenu} className={({ isActive }) => (isActive ? "active" : "")}>
              {label}
            </NavLink>
          ) : (
            <a
              key={href}
              href={href}
              onClick={(event) => handleAnchorClick(event, href)}
              className={isLinkActive(href) ? "active" : ""}
            >
              {label}
            </a>
          ),
        )}
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
        <a
          className="uw-nav-cta"
          href="#quick-book"
          onClick={handleDiscoveryCtaClick}
        >
          {user ? `Logout ${user.fullName}` : "Book discovery call"}
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
