// components/Hero.tsx
import React from "react";

const Hero: React.FC = () => {
  return (
    <section
      id="home"
      className="hero"
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        paddingTop: "var(--nav-h)",
        overflow: "hidden",
      }}
    >
      <div
        className="hero-bg"
        style={{
          position: "absolute",
          inset: 0,
          background:
            'url("https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1800&q=80") center/cover no-repeat',
        }}
      >
        <div
          className="hero-overlay"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(120deg, rgba(26, 22, 18, 0.82) 0%, rgba(44, 74, 110, 0.55) 60%, rgba(201, 147, 58, 0.2) 100%)",
          }}
        ></div>
        <div
          className="hero-noise"
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.04,
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            backgroundSize: "200px",
          }}
        ></div>
      </div>
      <div
        className="hero-content"
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: "var(--container)",
          width: "100%",
          marginInline: "auto",
          paddingInline: "clamp(20px, 5vw, 64px)",
          paddingBlock: "80px",
        }}
      >
        <span
          className="hero-eyebrow"
          style={{
            display: "inline-block",
            fontSize: "0.8rem",
            fontWeight: 600,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--clr-gold-light)",
            marginBottom: "20px",
            animation: "fadeUp 0.7s 0.2s forwards",
            opacity: 0,
          }}
        >
          Coaching for the ambitious
        </span>
        <h1
          className="hero-headline"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.6rem, 6.5vw, 5.5rem)",
            fontWeight: 700,
            lineHeight: 1.08,
            color: "#fff",
            marginBottom: "24px",
            maxWidth: "720px",
            animation: "fadeUp 0.7s 0.35s forwards",
            opacity: 0,
          }}
        >
          Find the Right Coach
          <br />
          <em style={{ fontStyle: "italic", color: "var(--clr-gold-light)" }}>
            for Your Growth
          </em>
        </h1>
        <p
          className="hero-sub"
          style={{
            fontSize: "clamp(1rem, 1.5vw, 1.2rem)",
            color: "rgba(255, 255, 255, 0.78)",
            maxWidth: "540px",
            marginBottom: "36px",
            lineHeight: 1.75,
            animation: "fadeUp 0.7s 0.5s forwards",
            opacity: 0,
          }}
        >
          We connect high-achievers with world-class coaches across career,
          business, life, and leadership. Your transformation starts with one
          conversation.
        </p>
        <div
          className="hero-actions"
          style={{
            display: "flex",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "56px",
            animation: "fadeUp 0.7s 0.65s forwards",
            opacity: 0,
          }}
        >
          <a
            href="#select-coach"
            className="btn btn-primary"
            style={{
              background: "var(--clr-gold)",
              color: "#fff",
              borderColor: "var(--clr-gold)",
            }}
          >
            Get Started
          </a>
          <a
            href="#programs"
            className="btn btn-ghost"
            style={{
              borderColor: "rgba(255, 255, 255, 0.35)",
              color: "#fff",
            }}
          >
            Explore Programs
          </a>
        </div>
        <div
          className="hero-stats"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "32px",
            flexWrap: "wrap",
            animation: "fadeUp 0.7s 0.8s forwards",
            opacity: 0,
          }}
        >
          <div
            className="stat"
            style={{ display: "flex", flexDirection: "column", gap: "2px" }}
          >
            <strong
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.8rem",
                fontWeight: 700,
                color: "#fff",
                lineHeight: 1,
              }}
            >
              2,400+
            </strong>
            <span
              style={{
                fontSize: "0.8rem",
                color: "rgba(255, 255, 255, 0.6)",
                letterSpacing: "0.05em",
              }}
            >
              Clients Coached
            </span>
          </div>
          <div
            className="stat-divider"
            style={{
              width: "1px",
              height: "40px",
              background: "rgba(255, 255, 255, 0.2)",
            }}
          ></div>
          <div
            className="stat"
            style={{ display: "flex", flexDirection: "column", gap: "2px" }}
          >
            <strong
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.8rem",
                fontWeight: 700,
                color: "#fff",
                lineHeight: 1,
              }}
            >
              98%
            </strong>
            <span
              style={{
                fontSize: "0.8rem",
                color: "rgba(255, 255, 255, 0.6)",
                letterSpacing: "0.05em",
              }}
            >
              Satisfaction Rate
            </span>
          </div>
          <div
            className="stat-divider"
            style={{
              width: "1px",
              height: "40px",
              background: "rgba(255, 255, 255, 0.2)",
            }}
          ></div>
          <div
            className="stat"
            style={{ display: "flex", flexDirection: "column", gap: "2px" }}
          >
            <strong
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.8rem",
                fontWeight: 700,
                color: "#fff",
                lineHeight: 1,
              }}
            >
              50+
            </strong>
            <span
              style={{
                fontSize: "0.8rem",
                color: "rgba(255, 255, 255, 0.6)",
                letterSpacing: "0.05em",
              }}
            >
              Expert Coaches
            </span>
          </div>
        </div>
      </div>
      <div
        className="hero-scroll-hint"
        style={{
          position: "absolute",
          bottom: "36px",
          right: "clamp(20px, 5vw, 64px)",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px",
          color: "rgba(255, 255, 255, 0.45)",
          fontSize: "0.72rem",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          animation: "fadeUp 0.7s 1.1s forwards",
          opacity: 0,
        }}
      >
        <span>Scroll</span>
        <div
          className="scroll-line"
          style={{
            width: "1px",
            height: "48px",
            background:
              "linear-gradient(to bottom, rgba(255, 255, 255, 0.45), transparent)",
            animation: "scrollPulse 1.8s ease-in-out infinite",
          }}
        ></div>
      </div>
    </section>
  );
};

export default Hero;
