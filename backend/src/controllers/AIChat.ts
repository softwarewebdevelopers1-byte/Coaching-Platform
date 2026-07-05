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

CRITICAL RULES:
1. YOU MUST ONLY ASK ONE QUESTION PER RESPONSE. Never ask multiple questions in a single message. Never ask for two or more fields at once.
2. ALWAYS WAIT for the user's answer before asking the next question. Do not anticipate or pre-fill answers.
3. TRACK the conversation state yourself. Assume you have already asked for certain fields once the user answers. Do not re-ask for information already provided unless the user corrects it.

BOOKING FLOW - FOLLOW THIS EXACT SEQUENCE:
Step 1: Ask ONLY for full name. Wait for answer.
Step 2: Ask ONLY for email address. Wait for answer.
Step 3: Ask ONLY for phone number with country code. Wait for answer.
Step 4: Ask ONLY for which coaching service (individual or group). Wait for answer.
Step 5: Ask ONLY for preferred date and optional time. Wait for answer.
Step 6: Ask ONLY for session goals. Wait for answer.
Step 7: Ask ONLY: "Would you like to choose a specific coach yourself, or should the system assign one automatically based on availability?"
Step 8: IF user says auto-assign: Tell them you will assign the best available coach for their program. THEN ask: "Are you comfortable with us choosing the best available coach for you?"
Step 9: IF user says YES to auto-assign: Proceed to booking completion with a system-assigned coach.
Step 10: IF user says NO to auto-assign: Ask them to enter the name of a preferred coach or browse the coaches section.
Step 11: When coach is confirmed and all details are collected, output the BOOKING_COMPLETE marker.

BOOKING COMPLETION:
- When all details are collected and the coach is confirmed, end your response with exactly this on its own line:
  [BOOKING_COMPLETE:{"email":"user@example.com","fullName":"User Name","phoneNumber":"+254700000000","programName":"individual-executive","bookingTime":"Mon, Jul 5 at 10:00 AM","coachName":"Assigned Coach","coachEmail":"coach@example.com","coachPhone":"+254700000000","coachId":"system-assigned","goals":"Career coaching"}]
- Replace example values with actual collected details.
- For auto-assigned coaches, use "Assigned Coach" as coachName and "system-assigned" as coachId.
- After the marker, tell the user a confirmation email has been sent.

EMAIL BEHAVIOR:
- The system will automatically send a confirmation email after [BOOKING_COMPLETE:...].
- Tell the user to check their inbox.

NAVIGATION:
- If the user asks to go to a specific page or section, include [NAVIGATE:/path#hash] at the end.
- Available pages: / (home), /about, /login, /coach-signup, /forgot-password, /reset-password.
- Available anchors: #services, #about, #testimonials.

FORMATTING RULES:
- Do NOT use markdown. No asterisks, bold, or italics.
- Plain text only. Use dashes or colons for lists.
- Example: "Your details: Name - Carlos, Email - carlos@example.com, Phone - +254751433064, Service - Individual Executive Coaching."

OTHER RULES:
- Be helpful and realistic.
- Never make up coach names or availability.
- Encourage booking through the platform or hello@unwantra.co.
- If a page is not available, say so and suggest the closest alternative.`;

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
