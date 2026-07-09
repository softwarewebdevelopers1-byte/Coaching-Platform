import { Router, Request, Response } from "express";
import DotEnvConfig from "../configs/DotEnv.js";
import { sendBookingConfirmationEmail } from "../services/Brevo.emailSender.js";
import { UserAccountsModel } from "../models/users.model.js";
import { BookingsCreatedModel, BookingsSessionsModel } from "../models/Bookings.model.js";
import { ClientModel, AppNotificationModel, NotificationModel } from "../models/Platform.model.js";
import { SlotRequestModel } from "../models/SlotRequests.model.js";
import { programsMatch } from "../utils/programs.js";

interface CoachOption {
  _id: string;
  name: string;
  email: string;
  phone: string | undefined;
  specialization: string;
  experience: number;
  currentWorkload: number;
  maxWorkload: number;
}

async function getEligibleCoaches(programName: string, goals: string[] = []): Promise<CoachOption[]> {
  const coaches = await UserAccountsModel.find({
    role: "coach",
    status: "active",
  }).select("-password");

  const qualified = coaches.filter(
    (coach) => coach.programName && programsMatch(coach.programName, programName),
  );

  const coachIds = qualified.map((coach) => String(coach._id));
  const openSlotCounts = await BookingsCreatedModel.aggregate([
    { $match: { coachId: { $in: coachIds }, status: "open" } },
    { $group: { _id: "$coachId", count: { $sum: 1 } } },
  ]);
  const openSlotsByCoach = new Map(openSlotCounts.map((item) => [item._id, item.count]));

  const normalizedGoals = Array.isArray(goals) ? goals.map((goal) => String(goal).toLowerCase()) : [];

  const scored = qualified
    .map((coach) => {
      const workloadRatio =
        (coach.currentWorkload || 0) / Math.max(coach.maxWorkload || 10, 1);
      const availabilityScore = openSlotsByCoach.get(String(coach._id)) || 0;
      const expertiseText = [coach.programName, ...(coach.expertise || [])]
        .join(" ")
        .toLowerCase();
      const specializationScore = normalizedGoals.filter((goal) =>
        expertiseText.includes(goal),
      ).length;
      const experienceScore = Math.min(coach.experience || 0, 20) / 20;

      return {
        coach: {
          _id: String(coach._id),
          name: coach.fullName,
          email: coach.email,
          phone: coach.phone,
          specialization: coach.programName,
          experience: coach.experience || 0,
          currentWorkload: coach.currentWorkload || 0,
          maxWorkload: coach.maxWorkload || 10,
        } as CoachOption,
        score:
          availabilityScore * 4 +
          specializationScore * 3 +
          experienceScore * 2 -
          workloadRatio * 5,
      };
    })
    .sort((a, b) => b.score - a.score);

  return scored.map((item) => item.coach);
}

async function findOpenSlotForCoach(coachId: string, preferredDate: string) {
  if (!preferredDate) return null;
  const start = new Date(preferredDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(preferredDate);
  end.setHours(23, 59, 59, 999);

  return BookingsCreatedModel.findOne({
    coachId,
    status: "open",
    bookingDate: { $gte: start, $lte: end },
  });
}

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
Step 9: IF user says YES to auto-assign: End your response with exactly [BOOKING_COMPLETE:{"email":"user@example.com","fullName":"User Name","phoneNumber":"+254700000000","programName":"individual-executive","bookingTime":"Mon, Jul 5 at 10:00 AM","goals":"Career coaching","coachMode":"auto"}] on its own line. Do NOT fill in coach data - the system will use real coach data automatically.
Step 10: IF user says NO to auto-assign: End your response with exactly [SHOW_COACH_SELECTION:{"programName":"individual-executive"}] on its own line. The system will show available coaches for the user to choose from. Wait for the user to select a coach.
Step 11: When the user selects a coach from the dropdown, the system will send you a message like "I choose {coach name}". You MUST immediately confirm the booking. End your response with exactly [BOOKING_COMPLETE:{"email":"...","fullName":"...","phoneNumber":"...","programName":"...","bookingTime":"...","goals":"...","coachMode":"manual","coachName":"Exact Selected Coach Name"}] on its own line. Use the exact coach name from the user's selection. Do NOT show the coach list again. Do NOT ask more questions.

EMAIL BEHAVIOR:
- The system will automatically send a confirmation email after [BOOKING_COMPLETE:...].
- The email will include the actual assigned coach name, email, and phone number.
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
- Never make up coach names, emails, or availability. Never say "system-assigned" or "Assigned Coach" as a placeholder. Always use real data or let the system handle it.
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

    const navigateMatch = reply.match(/\[NAVIGATE:([^\]]+)\]/);
    if (navigateMatch) {
      const targetPath = navigateMatch[1].trim();
      reply = reply.replace(/\[NAVIGATE:[^\]]+\]/, "").trim();
      if (targetPath) {
        res.setHeader("X-Navigate-To", targetPath);
      }
    }

    const showCoachMatch = reply.match(/\[SHOW_COACH_SELECTION:\s*(\{.*?\})\s*\]/s);
    if (showCoachMatch) {
      try {
        const meta = JSON.parse(showCoachMatch[1] as string);
        const programName = String(meta.programName || "");
        const eligible = programName ? await getEligibleCoaches(programName) : [];
        const coachesPayload = eligible.map((coach) => ({
          id: coach._id,
          name: coach.name,
          email: coach.email,
          phone: coach.phone,
          specialization: coach.specialization,
          experience: coach.experience,
        }));
        reply = reply.replace(/\[SHOW_COACH_SELECTION:\s*\{.*?\}\s*\]/gs, "").trim();
        if (!reply) {
          reply = "Here are the available coaches for your program. Please select one from the list below.";
        }
        res.setHeader("X-Coach-Selection", JSON.stringify({ coaches: coachesPayload, programName }));
      } catch {
        reply = reply.replace(/\[SHOW_COACH_SELECTION:\s*\{.*?\}\s*\]/gs, "").trim();
      }
    }

    const bookingMatch = reply.match(/\[BOOKING_COMPLETE:\s*(\{.*?\})\s*\]/s);
    if (bookingMatch) {
      try {
        const bookingData = JSON.parse(bookingMatch[1] as string);
        let coachId = bookingData.coachId;
        let coachName = bookingData.coachName || "";
        let coachEmail = bookingData.coachEmail || "";
        let coachPhone = bookingData.coachPhone || "";
        let slotId = bookingData.slotId;

        // If auto mode requested, choose the best coach. If manual mode but no coachId
        // was provided, try to resolve the coach by name. Only fall back to auto-assign
        // when no explicit coach can be resolved.
        if (bookingData.coachMode === "auto") {
          const eligible = await getEligibleCoaches(bookingData.programName, bookingData.goals || []);
          const best = eligible[0];
          if (!best) {
            reply = "I am sorry, we do not have any coaches available for this program right now. Please try another service or contact hello@unwantra.co for assistance.";
            res.status(200).json({ reply, history: [...messages.slice(1), { role: "assistant", content: reply }] });
            return;
          }
          coachId = best._id;
          coachName = best.name;
          coachEmail = best.email;
          coachPhone = best.phone;

          const preferredDate: string = bookingData.bookingTime ? (new Date(bookingData.bookingTime).toISOString().split("T")[0] || "") : "";
          const existingSlot = preferredDate ? await findOpenSlotForCoach(coachId, preferredDate) : null;

          if (existingSlot) {
            slotId = String(existingSlot._id);
            await BookingsCreatedModel.findByIdAndUpdate(existingSlot._id, { status: "booked" });
          } else {
            await SlotRequestModel.create({
              fullName: bookingData.fullName,
              email: bookingData.email,
              phoneNumber: bookingData.phoneNumber,
              programName: bookingData.programName,
              coachId,
              coachName,
              coachEmail,
              message: Array.isArray(bookingData.goals) ? bookingData.goals.join(", ") : String(bookingData.goals || ""),
              requestedDate: preferredDate,
              requestedTime: "",
              status: "pending",
            });
            await AppNotificationModel.create({
              recipientId: coachId,
              title: "New slot request",
              message: `${bookingData.fullName} requested a coaching slot for ${bookingData.programName}.`,
              type: "slot_request",
              read: false,
            });
          }
        } else {
          // manual mode: if coachId not provided, try to resolve by name
          if (!coachId && coachName) {
            const trimmedName = String(coachName).trim();
            const found = await UserAccountsModel.findOne({ fullName: { $regex: `^${trimmedName}$`, $options: "i" }, role: "coach", status: "active" }).select("-password");
            if (found) {
              coachId = String(found._id);
              coachName = found.fullName;
              coachEmail = found.email;
              coachPhone = found.phone;
            } else {
              const found2 = await UserAccountsModel.findOne({ fullName: { $regex: trimmedName, $options: "i" }, role: "coach", status: "active" }).select("-password");
              if (found2) {
                coachId = String(found2._id);
                coachName = found2.fullName;
                coachEmail = found2.email;
                coachPhone = found2.phone;
              }
            }
          }

          if (!coachId) {
            const eligible = await getEligibleCoaches(bookingData.programName, bookingData.goals || []);
            const best = eligible[0];
            if (!best) {
              reply = "I am sorry, we do not have any coaches available for this program right now. Please try another service or contact hello@unwantra.co for assistance.";
              res.status(200).json({ reply, history: [...messages.slice(1), { role: "assistant", content: reply }] });
              return;
            }
            coachId = best._id;
            coachName = best.name;
            coachEmail = best.email;
            coachPhone = best.phone;
          }

          const preferredDate: string = bookingData.bookingTime ? (new Date(bookingData.bookingTime).toISOString().split("T")[0] || "") : "";
          const existingSlot = preferredDate ? await findOpenSlotForCoach(coachId, preferredDate) : null;

          if (existingSlot) {
            slotId = String(existingSlot._id);
            await BookingsCreatedModel.findByIdAndUpdate(existingSlot._id, { status: "booked" });
          } else {
            await SlotRequestModel.create({
              fullName: bookingData.fullName,
              email: bookingData.email,
              phoneNumber: bookingData.phoneNumber,
              programName: bookingData.programName,
              coachId,
              coachName,
              coachEmail,
              message: Array.isArray(bookingData.goals) ? bookingData.goals.join(", ") : String(bookingData.goals || ""),
              requestedDate: preferredDate,
              requestedTime: "",
              status: "pending",
            });
            await AppNotificationModel.create({
              recipientId: coachId,
              title: "New slot request",
              message: `${bookingData.fullName} requested a coaching slot for ${bookingData.programName}.`,
              type: "slot_request",
              read: false,
            });
          }
        }

        const client = await ClientModel.findOneAndUpdate(
          { email: bookingData.email },
          { fullName: bookingData.fullName, email: bookingData.email, phoneNumber: bookingData.phoneNumber, goals: bookingData.goals },
          { upsert: true, new: true, setDefaultsOnInsert: true },
        );

        const booking = await BookingsSessionsModel.create({
          email: bookingData.email,
          fullName: bookingData.fullName,
          phoneNumber: bookingData.phoneNumber,
          programName: bookingData.programName,
          coachId,
          coachName,
          coachEmail,
          coachPhone,
          bookingTime: bookingData.bookingTime,
          status: "pending",
        });

        await AppNotificationModel.create({
          recipientId: coachId,
          title: "New Booking Confirmed",
          message: `Client ${bookingData.fullName} booked a slot for ${bookingData.programName} on ${bookingData.bookingTime}.`,
          type: "slot_booking",
          read: false,
        });

        await UserAccountsModel.findByIdAndUpdate(coachId, {
          $inc: { currentWorkload: 1 },
        });

        await AppNotificationModel.create({
          recipientId: coachId,
          title: "New booking received",
          message: `${bookingData.fullName} booked a discovery session for ${bookingData.programName} with you.`,
          type: "slot_booking",
          read: false,
        });

        await NotificationModel.create({
          recipientEmail: bookingData.email,
          recipientPhone: bookingData.phoneNumber,
          channel: "email",
          type: "booking_confirmation",
          status: "queued",
          payload: { bookingId: booking._id, programName: bookingData.programName, coachName, bookingTime: bookingData.bookingTime },
        });

        await sendBookingConfirmationEmail({
          email: bookingData.email,
          fullName: bookingData.fullName,
          phoneNumber: bookingData.phoneNumber,
          programName: bookingData.programName,
          coachId,
          coachName,
          coachEmail,
          coachPhone,
          bookingTime: bookingData.bookingTime,
        });

        reply = reply.replace(/\[BOOKING_COMPLETE:\s*\{.*?\}\s*\]/gs, "").trim();
        if (!reply) {
          reply = `Your discovery call has been confirmed with ${coachName}. A confirmation email has been sent to ${bookingData.email}. Please check your inbox for the full details.`;
        }
      } catch (bookingError) {
        console.error("Booking completion error:", bookingError);
        reply = reply.replace(/\[BOOKING_COMPLETE:\s*\{.*?\}\s*\]/gs, "").trim();
        if (!reply) {
          reply = "Your discovery call details have been saved. There was a small issue finishing the booking, but our team will follow up with you shortly.";
        }
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
