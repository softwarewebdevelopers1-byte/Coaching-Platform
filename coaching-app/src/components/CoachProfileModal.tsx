// components/CoachProfileModal.tsx
import React from "react";
import type { Coach } from "../types";

interface CoachProfileModalProps {
  coach: Coach | null;
  getInitials: (name: string) => string;
  getProgramLabel: (id: string) => string;
  renderStars: (rating: number) => string;
  onClose: () => void;
  onBook: (coach: Coach) => void;
}

const CoachProfileModal: React.FC<CoachProfileModalProps> = ({
  coach,
  getInitials,
  getProgramLabel,
  renderStars,
  onClose,
  onBook,
}) => {
  if (!coach) return null;

  return (
    <div className={`modal-overlay ${coach ? "open" : ""}`} onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>
        <div className="modal-header">
          <div className="modal-avatar">{getInitials(coach.name)}</div>
          <div>
            <p className="modal-coach-name">{coach.name}</p>
            <p className="modal-coach-spec">
              {getProgramLabel(coach.specialization)}
            </p>
          </div>
        </div>
        <div className="modal-stats">
          <div className="modal-stat">
            <span className="modal-stat-val">{coach.experience ?? "—"}</span>
            <span className="modal-stat-label">Years Exp.</span>
          </div>
          <div className="modal-stat">
            <span className="modal-stat-val">{coach.rating ? renderStars(coach.rating) : "—"}</span>
            <span className="modal-stat-label">Rating</span>
          </div>
          <div className="modal-stat">
            <span className="modal-stat-val">{coach.email}</span>
            <span className="modal-stat-label">Email</span>
          </div>
        </div>
        {coach.bio && <p className="modal-bio">{coach.bio}</p>}
        {coach.phone && (
          <p className="modal-bio" style={{ fontSize: 13, color: "#94a3b8" }}>
            📞 {coach.phone}
          </p>
        )}
        {coach.tags && coach.tags.length > 0 && (
          <div className="modal-tags">
            {coach.tags.map((tag, idx) => (
              <span key={idx} className="modal-tag">
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="modal-actions">
          <button className="btn btn-primary" onClick={() => onBook(coach)}>
            Book a Session
          </button>
          <button className="btn btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoachProfileModal;
