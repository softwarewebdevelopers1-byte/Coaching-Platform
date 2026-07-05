import React, { useEffect, useRef, useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIChatWidgetProps {
  apiBaseUrl?: string;
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
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const baseUrl = apiBaseUrl || "https://coaching-platform-38p5.onrender.com";

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSending(true);

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
      let reply =
        data && typeof data.reply === "string"
          ? data.reply
          : "Thanks for your message. If you'd like, you can also browse our coaches or contact us at hello@unwantra.co.";

      const navigateTo = res.headers.get("X-Navigate-To");
      if (navigateTo) {
        window.location.href = navigateTo;
      }

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
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
              <span className="uw-ai-avatar" aria-hidden>🧭</span>
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
            <span className="uw-ai-trigger-icon" aria-hidden>🧭</span>
            <span className="uw-ai-trigger-text">Ask Unwantra</span>
          </span>
        )}
      </button>
    </div>
  );
};

export default AIChatWidget;
