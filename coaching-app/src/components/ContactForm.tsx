// components/ContactForm.tsx
import React, { useState } from "react";

interface ContactFormProps {
  showToast: (message: string, type: string, duration?: number) => void;
}

const ContactForm: React.FC<ContactFormProps> = ({ showToast }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.id.replace("c", "").toLowerCase()]: e.target.value,
    });
    if (errors[e.target.id]) setErrors({ ...errors, [e.target.id]: "" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.cNameError = "Name is required.";
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.cEmailError = "Enter a valid email.";
    if (!formData.subject) newErrors.cSubjectError = "Subject is required.";
    if (!formData.message) newErrors.cMessageError = "Message is required.";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setFormData({ name: "", email: "", subject: "", message: "" });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 5000);
    showToast("Message sent! We'll be in touch soon.", "success");
  };

  return (
    <section id="contact" className="section contact-section">
      <div className="container">
        <div className="section-header">
          <span className="section-label">Reach Out</span>
          <h2 className="section-title">
            Get in <em>Touch</em>
          </h2>
          <p className="section-sub">
            Have questions? We'd love to hear from you.
          </p>
        </div>
        <div className="contact-grid">
          <div className="contact-info">
            <div className="contact-card">
              <div className="contact-icon">✉️</div>
              <div>
                <p className="contact-label">Email Us</p>
                <a
                  href="mailto:hello@apexcoaching.com"
                  className="contact-value"
                >
                  hello@apexcoaching.com
                </a>
              </div>
            </div>
            <div className="contact-card">
              <div className="contact-icon">📞</div>
              <div>
                <p className="contact-label">Call Us</p>
                <a href="tel:+18005550100" className="contact-value">
                  +1 800 555 0100
                </a>
              </div>
            </div>
            <div className="contact-card">
              <div className="contact-icon">📍</div>
              <div>
                <p className="contact-label">Visit Us</p>
                <span className="contact-value">
                  350 Fifth Ave, New York, NY 10118
                </span>
              </div>
            </div>
            <div className="contact-card">
              <div className="contact-icon">🕐</div>
              <div>
                <p className="contact-label">Office Hours</p>
                <span className="contact-value">Mon–Fri, 9am – 6pm EST</span>
              </div>
            </div>
          </div>
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cName">Full Name</label>
                <input
                  type="text"
                  id="cName"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleChange}
                />
                <span className="field-error">{errors.cNameError}</span>
              </div>
              <div className="form-group">
                <label htmlFor="cEmail">Email</label>
                <input
                  type="email"
                  id="cEmail"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                />
                <span className="field-error">{errors.cEmailError}</span>
              </div>
            </div>
            <div className="form-group full">
              <label htmlFor="cSubject">Subject</label>
              <input
                type="text"
                id="cSubject"
                placeholder="How can we help?"
                value={formData.subject}
                onChange={handleChange}
              />
              <span className="field-error">{errors.cSubjectError}</span>
            </div>
            <div className="form-group full">
              <label htmlFor="cMessage">Message</label>
              <textarea
                id="cMessage"
                rows={5}
                placeholder="Tell us more..."
                value={formData.message}
                onChange={handleChange}
              ></textarea>
              <span className="field-error">{errors.cMessageError}</span>
            </div>
            <button type="submit" className="btn btn-primary">
              Send Message →
            </button>
            {success && (
              <p className="contact-success">
                ✅ Message sent! We'll be in touch soon.
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
