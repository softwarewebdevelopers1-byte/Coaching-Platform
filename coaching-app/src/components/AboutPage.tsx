// AboutPage.tsx
import React from "react";
import "../styles/About.css";

interface AboutPageProps {
  onBookCall?: () => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ onBookCall }) => {
  return (
    <div className="about-page">
      {/* ── Hero Section ──────────────────────────────────────── */}
      <section className="about-hero">
        <div className="about-hero-overlay" />
        <div className="about-container">
          <div className="about-hero-content">
            <span className="about-kicker">About Unwantra Coaching</span>
            <h1 className="about-hero-title">
              Empowering leaders to own their <em>voice</em>.
            </h1>
            <p className="about-hero-subtitle">
              We help leaders lead with integrity and live with intention —
              through transformational coaching that strengthens confidence,
              boundaries, influence, and values-based leadership.
            </p>
          </div>
        </div>
      </section>

      {/* ── Vision & Mission ──────────────────────────────────── */}
      <section className="about-vision-mission">
        <div className="about-container">
          <div className="about-vm-grid">
            <div className="about-vision">
              <span className="about-vm-icon">👁️</span>
              <h2>Our Vision</h2>
              <p>
                To cultivate a world where leaders lead with courage, clarity,
                and compassion — owning their voice, honoring their values, and
                creating meaningful impact in work and life.
              </p>
            </div>
            <div className="about-mission">
              <span className="about-vm-icon">🎯</span>
              <h2>Our Mission</h2>
              <p>
                Empowering leaders to own their voice, lead with confidence,
                clarity, and values — through coaching that is deeply human,
                transformative, and grounded in purpose.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ────────────────────────────────────────────── */}
      <section className="about-values">
        <div className="about-container">
          <div className="about-section-head">
            <span className="about-kicker">What We Stand For</span>
            <h2>Our Core Values</h2>
            <p>
              These principles guide everything we do — from how we coach to how
              we show up for our clients.
            </p>
          </div>
          <div className="about-values-grid">
            <div className="about-value-card">
              <div className="about-value-icon">🦁</div>
              <h3>Courage</h3>
              <p>
                We speak up — even when our voice shakes. We believe growth
                begins with brave, imperfect action.
              </p>
            </div>
            <div className="about-value-card">
              <div className="about-value-icon">🔍</div>
              <h3>Clarity</h3>
              <p>
                We seek clarity of voice, thought, and direction — and help
                others do the same.
              </p>
            </div>
            <div className="about-value-card">
              <div className="about-value-icon">🤝</div>
              <h3>Connection</h3>
              <p>
                We prioritize deep, authentic relationships — with self, others,
                and community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Our Story ──────────────────────────────────────────── */}
      <section className="about-story">
        <div className="about-container">
          <div className="about-story-grid">
            <div className="about-story-content">
              <span className="about-kicker">Our Story</span>
              <h2>
                A coaching firm built on <em>values</em> and{" "}
                <em>transformation</em>.
              </h2>
              <p>
                Our story began with a simple conviction: leadership development
                should be <strong>deeply human</strong>,
                <strong>transformative</strong>, and
                <strong>grounded in values</strong>.
              </p>
              <p>
                As a premium executive coaching firm that is proudly
                <span className="about-highlight"> women-led</span>,
                <span className="about-highlight"> African-led</span>, and
                <span className="about-highlight"> values-based</span>, we
                partner with ambitious professionals and executives who are
                ready to elevate their influence, strengthen their executive
                presence, navigate career transitions with confidence, and build
                meaningful workplace relationships.
              </p>
              <div className="about-story-tags">
                <span className="about-story-tag">🌍 African-led</span>
                <span className="about-story-tag">👩‍💼 Women-led</span>
                <span className="about-story-tag">💡 Values-based</span>
                <span className="about-story-tag">🚀 Transformational</span>
              </div>
            </div>
            <div className="about-story-visual">
              <blockquote className="about-quote">
                <span className="about-quote-icon">"</span>
                <p>
                  Leadership development should be deeply human, transformative,
                  and grounded in values.
                </p>
                <footer>
                  <span className="about-quote-line" />
                  <span>Our founding conviction</span>
                </footer>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* ── Our Commitment ─────────────────────────────────────── */}
      <section className="about-commitment">
        <div className="about-container">
          <div className="about-section-head">
            <span className="about-kicker">Our Commitment to You</span>
            <h2>How We Show Up for You</h2>
          </div>
          <div className="about-commitment-grid">
            <div className="about-commitment-card">
              <span className="about-commitment-number">01</span>
              <h3>Hold the Vision</h3>
              <p>
                We hold the vision you have for yourself and your life — and
                identify what comes in the way.
              </p>
            </div>
            <div className="about-commitment-card">
              <span className="about-commitment-number">02</span>
              <h3>Create Actionable Steps</h3>
              <p>
                We work with you to address what's holding you back and create
                actionable steps to reclaim your power.
              </p>
            </div>
            <div className="about-commitment-card">
              <span className="about-commitment-number">03</span>
              <h3>Ask the Right Questions</h3>
              <p>
                We ask the right questions to help you identify what matters
                most and focus your energy there.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Coaching Packages ──────────────────────────────────── */}
      <section className="about-packages">
        <div className="about-container">
          <div className="about-section-head">
            <span className="about-kicker">Coaching Packages</span>
            <h2>Designed for Your Growth Journey</h2>
            <p>
              Choose the path that aligns with your leadership goals and the
              kind of support you need.
            </p>
          </div>
          <div className="about-packages-grid">
            <div className="about-package-card about-package-individual">
              <div className="about-package-icon">🌟</div>
              <h3>Individual Executive Coaching</h3>
              <p>
                Our one-on-one coaching empowers leaders to gain clarity and
                confidence, enabling them to elevate their influence and deliver
                results with purpose and authenticity.
              </p>
              <ul className="about-package-features">
                <li>✓ Private, confidential coaching</li>
                <li>✓ Personalized growth plan</li>
                <li>✓ Focus on executive presence and influence</li>
                <li>✓ Deep exploration of values and voice</li>
              </ul>
              <button
                className="about-btn about-btn-primary"
                onClick={onBookCall}
              >
                Book Discovery Call
              </button>
            </div>
            <div className="about-package-card about-package-group">
              <div className="about-package-icon">👥</div>
              <h3>Group Executive Coaching</h3>
              <p>
                Our group coaching sessions are designed to cultivate cohesive,
                high-performing executive teams that lead with clarity, courage,
                and collaboration. Together, we unlock collective strengths.
              </p>
              <ul className="about-package-features">
                <li>✓ Facilitated leadership cohorts</li>
                <li>✓ Team alignment and trust building</li>
                <li>✓ Shared leadership language</li>
                <li>✓ Collective problem-solving</li>
              </ul>
              <button
                className="about-btn about-btn-secondary"
                onClick={onBookCall}
              >
                Book Discovery Call
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Discovery Call CTA ────────────────────────────────── */}
      <section className="about-cta">
        <div className="about-container">
          <div className="about-cta-content">
            <div>
              <span className="about-kicker about-cta-kicker">
                Start Your Journey
              </span>
              <h2>Ready to Own Your Voice?</h2>
              <p>
                Book a discovery call and find out how Unwantra Coaching can
                support your leadership growth.
              </p>
            </div>
            <div className="about-cta-actions">
              <button
                className="about-btn about-btn-primary about-btn-large"
                onClick={onBookCall}
              >
                Book Discovery Call →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact & Footer Info ──────────────────────────────── */}
      <section className="about-contact">
        <div className="about-container">
          <div className="about-contact-grid">
            <div>
              <h3>Get In Touch</h3>
              <p>
                Have questions about our coaching programs? We're here to help.
              </p>
            </div>
            <div className="about-contact-details">
              <div className="about-contact-item">
                <span className="about-contact-icon">✉️</span>
                <div>
                  <span className="about-contact-label">Email</span>
                  <a href="mailto:hello@unwantracoaching.co.ke">
                    hello@unwantracoaching.co.ke
                  </a>
                </div>
              </div>
              <div className="about-contact-item">
                <span className="about-contact-icon">📞</span>
                <div>
                  <span className="about-contact-label">Phone</span>
                  <a href="tel:+254712281552">+254 712 281 552</a>
                </div>
              </div>
            </div>
          </div>
          <div className="about-footer-note">
            <p>
              <strong>How your data supports coaching:</strong> We use your
              contact details to respond to your enquiry and your coaching goals
              to understand demand, recommend the most relevant coaching
              pathway, improve coach matching, and identify common leadership
              themes across the platform. Your submission is used for coaching
              operations and platform insight, not for selling unrelated
              services.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
