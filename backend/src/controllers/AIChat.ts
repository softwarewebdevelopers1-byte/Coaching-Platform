import { Router, Request, Response } from "express";
import DotEnvConfig from "../configs/DotEnv.js";
import { sendBookingConfirmationEmail } from "../services/Brevo.emailSender.js";

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
          "I am sorry, the AI assistant is currently unavailable. Please email us at hello@unwantra.co for help booking a discovery call.",
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
- Users can book discovery calls through the platform.

BOOKING FLOW:
1. Ask for full name, email, phone number with country code, coaching service (individual or group), preferred date and optional time, and session goals ONE FIELD AT A TIME. Wait for each answer before asking the next.
2. Ask whether the user wants to choose a specific coach or have the system assign one automatically.
3. If auto-assign: tell them you will assign a coach based on availability and their program needs. Then ask: "Are you comfortable with us choosing the best available coach for you?"
4. If they say YES to being comfortable with auto-assignment, proceed to booking completion.
5. If they say NO to being comfortable, ask them to enter the name of a preferred coach or let them browse coaches on the platform.
6. When all details are collected and the coach is confirmed, end your response with exactly this on its own line:
   [BOOKING_COMPLETE:{"email":"user@example.com","fullName":"User Name","phoneNumber":"+254700000000","programName":"individual-executive","bookingTime":"Mon, Jul 5 at 10:00 AM","goals":"Career coaching"}]
   Replace the example values with the actual collected details from the conversation.

EMAIL BEHAVIOR:
- After you output [BOOKING_COMPLETE:...], the system will automatically send a confirmation email to the user's email address with the booking summary.
- Tell the user that a confirmation email has been sent and they will receive it shortly.

NAVIGATION RULES:
- If the user asks to go to a specific page or section, include a special marker at the very end of your response on its own line: [NAVIGATE:/path#hash].
- Available pages: / (home), /about (about page), /login (staff login), /coach-signup (coach onboarding), /forgot-password (forgot password), /reset-password (reset password).
- Available section anchors on the home page: #services (coaching services), #about (about preview), #testimonials (client stories).
- Examples: if user says "take me to about page" -> reply normally then add [NAVIGATE:/about]. If user says "show me services" -> reply normally then add [NAVIGATE:/#services].

FORMATTING RULES:
- Do NOT use markdown formatting.
- No asterisks, no bold, no italics.
- Write in plain text only.
- Use simple dashes or colons for lists.
- Example of correct format: "Your discovery-call details: Name - Carlos Maina, Email - carlosmaina198@gmail.com, Phone - +254751433064, Service - Individual Executive Coaching."

OTHER RULES:
- Be helpful, realistic, and guide users through the booking process naturally.
- Keep responses concise and actionable.
- Never make up coach names or availability. Direct users to the coaches section of the platform if needed.
- Always encourage users to book through the platform or contact hello@unwantra.co if they need help.
- The platform supports coaches from Kenya, Nigeria, South Africa and other African countries.
- If the user asks for a page that does not exist, tell them politely that the page is not available and suggest the closest alternative. Do NOT invent URLs.`;

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
        model: "openai/gpt-oss-120b",
        messages,
        max_tokens: 1024,
        temperature: 0.7,
        top_p: 1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error:", response.status, errorText);
      res.status(502).json({
        message: "AI service error",
        reply:
          "I am having trouble connecting right now. Please try again in a moment or email hello@unwantra.co for help.",
      });
      return;
    }

    const data = await response.json();
    let reply =
      data.choices?.[0]?.message?.content ||
      "I am sorry, I could not generate a response. Please try again.";

    const bookingMatch = reply.match(/\[BOOKING_COMPLETE:(\{.*\})\]/s);
    if (bookingMatch) {
      try {
        const bookingData = JSON.parse(bookingMatch[1] as string);
        await sendBookingConfirmationEmail({
          email: bookingData.email,
          fullName: bookingData.fullName,
          phoneNumber: bookingData.phoneNumber,
          programName: bookingData.programName,
          bookingTime: bookingData.bookingTime,
          coachName: bookingData.coachName,
          coachEmail: bookingData.coachEmail,
          coachPhone: bookingData.coachPhone,
          coachId: bookingData.coachId || "system-assigned",
        });
        reply = reply.replace(/\[BOOKING_COMPLETE:\{.*\}\]/s, "").trim();
        if (!reply) {
          reply =
            "Your discovery call has been confirmed. A confirmation email has been sent to your email address. Please check your inbox for the full details.";
        }
      } catch (emailError) {
        console.error("Failed to send booking confirmation email from AI:", emailError);
        reply = reply.replace(/\[BOOKING_COMPLETE:\{.*\}]/s, "").trim();
        if (!reply) {
          reply =
            "Your discovery call details have been saved. There was an issue sending the confirmation email, but our team will follow up shortly.";
        }
      }
    }

    const navigateMatch = reply.match(/\[NAVIGATE:([^\]]+)\]/);
    if (navigateMatch) {
      const targetPath = navigateMatch[1].trim();
      reply = reply.replace(/\[NAVIGATE:[^\]]+\]/, "").trim();
      if (targetPath) {
        res.setHeader("X-Navigate-To", targetPath);
      }
    }

    res.status(200).json({ reply, history: [...messages.slice(1), { role: "assistant", content: reply }] });
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
