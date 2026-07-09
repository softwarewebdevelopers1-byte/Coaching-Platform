import React, { useEffect, useRef, useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface CoachOption {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  experience: number;
}

interface AIChatWidgetProps {
  apiBaseUrl?: string;
}

function formatReadableDate(value: string): string {
  if (!value) return "";
  const trimmed = value.trim();
  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return trimmed;
}

const AIChatWidget: React.FC<AIChatWidgetProps> = ({ apiBaseUrl }) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your Unwantra assistant. I can help you understand our coaching services or guide you through booking a discovery call. How can I help you today?",
    },
  ]);
  const [sending, setSending] = useState(false);
  const [coachOptions, setCoachOptions] = useState<CoachOption[]>([]);
  const [bookingMeta, setBookingMeta] = useState<any | null>(null);
  const [selectedCoachId, setSelectedCoachId] = useState("");
  const justPickedCoachRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, coachOptions]);

  const baseUrl = apiBaseUrl || "https://coaching-platform-38p5.onrender.com";

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSending(true);
    setCoachOptions([]);
    setSelectedCoachId("");

    try {
      const res = await fetch(`${baseUrl}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json().catch(() => null);
      const bookingHeader = res.headers.get("X-Booking-Meta");
      let parsedBooking: any = null;
      if (bookingHeader) {
        try {
          parsedBooking = JSON.parse(bookingHeader);
          setBookingMeta(parsedBooking);
        } catch {
          parsedBooking = null;
          setBookingMeta(null);
        }
      } else {
        setBookingMeta(null);
      }
      let reply =
        data && typeof data.reply === "string"
          ? data.reply
          : "Thanks for your message. If you'd like, you can also browse our coaches or contact us at hello@unwantra.co.";

      const navigateTo = res.headers.get("X-Navigate-To");
      if (navigateTo) {
        if (navigateTo.startsWith("#")) {
          const targetId = navigateTo.slice(1);
          const target = document.getElementById(targetId);
          if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
          } else {
            window.location.hash = targetId;
          }
        } else {
          window.location.href = navigateTo;
        }
      }

      const coachSelectionHeader = res.headers.get("X-Coach-Selection");
      if (coachSelectionHeader) {
        try {
          const parsed = JSON.parse(coachSelectionHeader);
          if (Array.isArray(parsed.coaches)) {
            setCoachOptions(parsed.coaches);
          }
        } catch {
          // ignore parse error
        }
      }

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      // If booking metadata present, also add a structured assistant confirmation
      if (parsedBooking) {
        setMessages((prev) => [...prev, { role: "assistant", content: `Booking confirmed: ${parsedBooking.coachName} — ${formatReadableDate(parsedBooking.bookingTime)}` }]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm having trouble connecting right now. Please try again in a moment or email hello@unwantra.co for help.",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleCoachSelect = (coach: CoachOption) => {
    setSelectedCoachId(coach.id);
    justPickedCoachRef.current = true;
    const text = `I choose ${coach.name}`;
    const userMessage: Message = { role: "user", content: text };
    const newMessages: Message[] = [...messages, userMessage];
    setMessages(newMessages);
    setInput(text);
    setCoachOptions([]);
    setTimeout(() => {
      sendMessageDirect(text, newMessages);
    }, 300);
  };

  const sendMessageDirect = async (text: string, historyOverride?: Message[]) => {
    setSending(true);
    setInput("");

    try {
      const historyToSend = (historyOverride || messages).map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch(`${baseUrl}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: historyToSend,
        }),
      });

      const data = await res.json().catch(() => null);
      const bookingHeader = res.headers.get("X-Booking-Meta");
      let parsedBooking: any = null;
      if (bookingHeader) {
        try {
          parsedBooking = JSON.parse(bookingHeader);
          setBookingMeta(parsedBooking);
        } catch {
          parsedBooking = null;
          setBookingMeta(null);
        }
      } else {
        setBookingMeta(null);
      }
      let reply =
        data && typeof data.reply === "string"
          ? data.reply
          : "Thanks for your message. If you'd like, you can also browse our coaches or contact us at hello@unwantra.co.";

      const navigateTo = res.headers.get("X-Navigate-To");
      if (navigateTo) {
        if (navigateTo.startsWith("#")) {
          const targetId = navigateTo.slice(1);
          const target = document.getElementById(targetId);
          if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
          } else {
            window.location.hash = targetId;
          }
        } else {
          window.location.href = navigateTo;
        }
      }

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      if (parsedBooking) {
        setMessages((prev) => [...prev, { role: "assistant", content: `Booking confirmed: ${parsedBooking.coachName} — ${formatReadableDate(parsedBooking.bookingTime)}` }]);
      }

      const coachSelectionHeader = res.headers.get("X-Coach-Selection");
      if (coachSelectionHeader) {
        try {
          const parsed = JSON.parse(coachSelectionHeader);
          if (Array.isArray(parsed.coaches)) {
            const justPickedCoach = justPickedCoachRef.current;
            if (!justPickedCoach) {
              setCoachOptions(parsed.coaches);
            } else {
              const picked = parsed.coaches.find((c: { id: string }) => c.id === selectedCoachId);
              if (picked) {
                const followUp = `I have selected ${picked.name}. Please proceed with booking ${picked.name}.`;
                setMessages((prev) => [...prev, { role: "user", content: followUp }]);
                setInput(followUp);
                setSelectedCoachId("");
                setCoachOptions([]);
                setTimeout(() => {
                  sendMessageDirect(followUp);
                }, 300);
              } else {
                setCoachOptions(parsed.coaches);
              }
            }
          }
        } catch {
          // ignore parse error
        } finally {
          justPickedCoachRef.current = false;
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm having trouble connecting right now. Please try again in a moment or email hello@unwantra.co for help.",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="uw-ai-widget">
      {open && (
        <div className="uw-ai-chat">
          <div className="uw-ai-header">
            <div className="uw-ai-header-info">
              <span className="uw-ai-avatar" aria-hidden>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" fill="#415944"/>
                  <path d="M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="12" cy="11" r="1.5" fill="white"/>
                  <path d="M9 9H9.01" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M15 9H15.01" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M10 17L11 19L13 19L14 17" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <div>
                <strong>Unwantra Assistant</strong>
                <span>Typically replies instantly</span>
              </div>
            </div>
            <button
              type="button"
              className="uw-ai-close"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>
          <div className="uw-ai-messages">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`uw-ai-message ${msg.role === "user" ? "user" : "assistant"}`}
              >
                <div className="uw-ai-bubble">{msg.content}</div>
              </div>
            ))}
            {sending && (
              <div className="uw-ai-message assistant">
                <div className="uw-ai-bubble uw-ai-typing">
                  <span className="uw-ai-dot" />
                  <span className="uw-ai-dot" />
                  <span className="uw-ai-dot" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

            {bookingMeta && (
              <div className="uw-ai-booking-confirm">
                <strong>Booking {bookingMeta.status === 'confirmed' ? 'Confirmed' : 'Requested'}</strong>
                <div>{bookingMeta.programName} with {bookingMeta.coachName}</div>
                <div>{bookingMeta.bookingTime ? formatReadableDate(bookingMeta.bookingTime) : 'Time to be confirmed'}</div>
                <div style={{ marginTop: 6 }}>
                  <button onClick={() => { window.location.href = '/dashboard/bookings'; }} style={{ marginRight: 8 }}>View bookings</button>
                  <button onClick={() => setBookingMeta(null)}>Dismiss</button>
                </div>
              </div>
            )}

          {coachOptions.length > 0 && (
            <div className="uw-ai-coach-select">
              <label>
                Choose a coach
                <select
                  value={selectedCoachId}
                  onChange={(e) => {
                    const coach = coachOptions.find((c) => c.id === e.target.value);
                    if (coach) handleCoachSelect(coach);
                  }}
                >
                  <option value="">Select a coach...</option>
                  {coachOptions.map((coach) => (
                    <option key={coach.id} value={coach.id}>
                      {coach.name} - {coach.specialization} ({coach.experience} yrs)
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          <form
            className="uw-ai-form"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about coaching or booking..."
              aria-label="Type a message"
            />
            <button type="submit" disabled={!input.trim() || sending} aria-label="Send">
              Send
            </button>
          </form>
        </div>
      )}
      <button
        type="button"
        className={`uw-ai-trigger ${open ? "active" : ""}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? "Close chat" : "Open chat assistant"}
      >
        {open ? "✕" : (
          <span className="uw-ai-trigger-inner">
            <span className="uw-ai-trigger-icon" aria-hidden>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" fill="#415944"/>
                <path d="M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="12" cy="11" r="1.5" fill="white"/>
                <path d="M9 9H9.01" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <path d="M15 9H15.01" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <path d="M10 17L11 19L13 19L14 17" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <span className="uw-ai-trigger-text">Ask Unwantra</span>
          </span>
        )}
      </button>
    </div>
  );
};

export default AIChatWidget;

