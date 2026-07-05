import { Router, Request, Response } from "express";
import DotEnvConfig from "../configs/DotEnv.js";

const router = Router();

router.post("/chat", async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== "string") {
      res.status(400).json({ message: "Message is required" });
      return;
    }

    const apiKey = DotEnvConfig.GroqApiKey as string | undefined;

    if (!apiKey) {
      res.status(500).json({
        message: "AI service is not configured on the server.",
        reply:
          "I'm sorry, the AI assistant is currently unavailable. Please email us at hello@unwantra.co for help booking a discovery call.",
      });
      return;
    }

    const systemPrompt = `You are the Unwantra Coaching Platform assistant. You help visitors understand our coaching services and book discovery calls.

UNWANTRA COACHING PLATFORM CONTEXT:
- Platform name: Unwantra Coaching Platform
- Services: Individual Executive Coaching and Group Executive Coaching
- Individual Executive Coaching: Private one-to-one coaching for senior leaders who want to lead with courage, clarity, stronger boundaries, and values-based influence.
- Group Executive Coaching: Facilitated coaching cohorts for leadership teams and emerging executives who need trust, alignment, and shared leadership language.
- Programs are led by experienced African-led, women-led coaches.
- Users can book discovery calls through the platform by selecting a coach, choosing an available date/time, and filling in their details (full name, email, phone number, coaching service, goals).
- When a user requests a discovery call for a specific program, ask for all personal info required: full name, email address, phone number with country code, which coaching service (individual or group), preferred date and optional time, and session goals.
- When choosing a coach, ask if they want to choose a specific coach or have the system assign one automatically based on availability and program.
- Be helpful, realistic, and guide users through the booking process naturally.
- Keep responses concise and actionable.
- Never make up coach names or availability. Direct users to the coaches section of the platform.
- Always encourage users to book through the platform or contact hello@unwantra.co.
- The platform supports coaches from Kenya, Nigeria, South Africa and other African countries.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(history || []).map((m: { role: string; content: string }) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages,
        max_tokens: 512,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error:", response.status, errorText);
      res.status(502).json({
        message: "AI service error",
        reply:
          "I’m having trouble connecting right now. Please try again in a moment or email hello@unwantra.co for help.",
      });
      return;
    }

    const data = await response.json();
    const reply =
      data.choices?.[0]?.message?.content ||
      "I’m sorry, I couldn’t generate a response. Please try again.";

    res.status(200).json({ reply, history: [...messages, { role: "assistant", content: reply }] });
  } catch (error) {
    console.error("AI chat error:", error);
    res.status(500).json({
      message: "Internal server error",
      reply:
        "Something went wrong on our side. Please email hello@unwantra.co or try refreshing the page.",
    });
  }
});

export default router;
