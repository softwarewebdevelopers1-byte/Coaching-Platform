import axios, { AxiosError } from "axios";
import type {
  BrevoEmailPayload,
  BrevoResponse,
  BrevoErrorResponse,
} from "../types/Brevo.sender.js";
import DotEnvConfig from "../configs/DotEnv.js";
import { PROGRAMS } from "../utils/programs.js";

function formatReadableDate(value: string): string {
  if (!value) return "";
  const trimmed = value.trim();
  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return trimmed;
}

function getProgramTitle(programName?: string): string {
  if (!programName) return "Coaching Program";
  const match = PROGRAMS.find(
    (program) =>
      program.id === programName ||
      program.title.toLowerCase() === programName.toLowerCase(),
  );
  return match?.title || programName;
}

function buildStyledEmailHtml({
  title,
  preheader,
  body,
  footerNote,
  accentColor = "#e8b96a",
}: {
  title: string;
  preheader: string;
  body: string;
  footerNote: string;
  accentColor?: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #f6f3ee; color: #1a1612; font-family: Arial, Helvetica, sans-serif; line-height: 1.6;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;visibility:hidden;">${escapeHtml(preheader)}</div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse; margin: 0; padding: 0; background-color: #f6f3ee;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 640px; border-collapse: separate; border-spacing: 0; background-color: #ffffff; border: 1px solid #e7ded2; border-radius: 16px; overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #1a1612 0%, #2d2418 100%); padding: 32px 28px;">
              <p style="font-size: 26px; font-weight: 700; margin: 0 0 8px; color: #ffffff; font-family: Arial, Helvetica, sans-serif;">UnWantra<span style="color: ${accentColor};">Coaching</span></p>
              <p style="margin: 0; color: #f4e7d1; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">${escapeHtml(preheader)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 28px;">
              ${body}
            </td>
          </tr>
          <tr>
            <td style="background-color: #faf8f4; padding: 22px 28px; color: #786f66; font-size: 13px; text-align: center; border-top: 1px solid #e7ded2; font-family: Arial, Helvetica, sans-serif;">
              ${footerNote}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

interface BookingConfirmationDetails {
  email: string;
  fullName: string;
  phoneNumber: string;
  programName: string;
  coachId: string;
  coachName?: string;
  coachEmail?: string;
  coachPhone?: string;
  bookingTime: string;
  googleMeetingLink?: string | undefined;
}

export async function sendBookingConfirmationEmail(
  booking: BookingConfirmationDetails,
): Promise<void> {
  const apiKey = DotEnvConfig.BrevoApiKey.trim();

  const payload: BrevoEmailPayload = {
    sender: {
      name: "UnWantraCoaching",
      email: "softwarewebdevelopers1@gmail.com",
    },
    to: [{ email: booking.email, name: booking.fullName }],
    subject: "Your UnWantraCoaching session is booked",
    htmlContent: generateBookingEmailTemplate(booking),
  };

  try {
    const response = await axios.post<BrevoResponse>(
      "https://api.brevo.com/v3/smtp/email",
      payload,
      {
        headers: {
          "api-key": apiKey,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("Booking confirmation email sent:", response.data.messageId);
  } catch (err) {
    handleEmailError(err as AxiosError<BrevoErrorResponse>);
  }
}

interface ContactAcknowledgmentDetails {
  email: string;
  name: string;
  interest: string;
}

export async function sendContactAcknowledgmentEmail(
  details: ContactAcknowledgmentDetails,
): Promise<void> {
  const apiKey = DotEnvConfig.BrevoApiKey.trim();
  const currentYear = new Date().getFullYear();

  const htmlContent = buildStyledEmailHtml({
    title: "We received your enquiry",
    preheader: "Thank you for reaching out — a coach will follow up soon.",
    body: `
      <p style="font-size: 17px; margin: 0 0 22px; font-weight: 700; font-family: Arial, sans-serif; color: #1a1612;">Hello ${escapeHtml(details.name)},</p>
      <p style="margin: 0 0 20px 0; font-size: 15px; color: #1a1612; font-family: Arial, sans-serif;">We have received your enquiry and a member of the UnWantraCoaching team will follow up within 1–2 business days to discuss your coaching goals and schedule a discovery call if appropriate.</p>

      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse; border: 1px solid #e7ded2; border-radius: 10px; overflow: hidden; margin: 24px 0;">
        <tr>
          <td style="padding: 14px 16px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: #6d6258; width: 140px; border-bottom: 0; font-family: Arial, sans-serif; vertical-align: top;">Coaching interest</td>
          <td style="padding: 14px 16px; font-size: 15px; color: #1a1612; border-bottom: 0; font-family: Arial, sans-serif; vertical-align: top;">${escapeHtml(getProgramTitle(details.interest))}</td>
        </tr>
      </table>

      <div style="background-color: #fbf4e7; border: 1px solid #e8b96a; border-radius: 10px; padding: 18px; margin: 24px 0;">
        <h2 style="margin: 0 0 10px 0; font-size: 18px; color: #1a1612; font-family: Arial, sans-serif; font-weight: 700;">What happens next</h2>
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #1a1612; font-family: Arial, sans-serif;">Our team will review your goals, match you with the most suitable coach, and reach out to arrange a discovery call at a time that works for you.</p>
        <p style="margin: 0; font-size: 14px; color: #1a1612; font-family: Arial, sans-serif;">You can also book a discovery call directly from our website whenever you are ready.</p>
      </div>

      <p style="margin: 20px 0 0 0; font-size: 15px; color: #1a1612; font-family: Arial, sans-serif;">Thank you for choosing UnWantraCoaching.</p>
    `,
    footerNote: `&copy; ${currentYear} UnWantraCoaching. Need help? Contact <a href="mailto:hello@unwantracoaching.co.ke" style="color: #9b6a17; text-decoration: underline;">hello@unwantracoaching.co.ke</a>.`,
  });

  const payload: BrevoEmailPayload = {
    sender: {
      name: "Unwantra Coaching",
      email: "softwarewebdevelopers1@gmail.com",
    },
    to: [{ email: details.email, name: details.name }],
    subject: "We received your coaching enquiry — Unwantra",
    htmlContent,
  };

  try {
    const response = await axios.post<BrevoResponse>(
      "https://api.brevo.com/v3/smtp/email",
      payload,
      {
        headers: {
          "api-key": apiKey,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("Contact acknowledgment email sent:", response.data.messageId);
  } catch (err) {
    handleEmailError(err as AxiosError<BrevoErrorResponse>);
  }
}

// ── Slot Request: received by user ────────────────────────────────────────────
interface SlotRequestReceivedDetails {
  email: string;
  fullName: string;
  programName: string;
  coachName: string;
  coachEmail: string;
}

export async function sendSlotRequestReceivedEmail(
  details: SlotRequestReceivedDetails,
): Promise<void> {
  const apiKey = DotEnvConfig.BrevoApiKey.trim();
  const currentYear = new Date().getFullYear();

  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Session Request Received</title>
</head>
<body style="margin: 0; padding: 24px; background-color: #f6f3ee; color: #1a1612; font-family: Arial, sans-serif; line-height: 1.6;">
  <div style="max-width: 640px; margin: 0 auto; background-color: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #e7ded2;">
    <div style="background-color: #1a1612; color: #ffffff; padding: 32px 28px;">
      <p style="font-size: 26px; font-weight: 700; margin: 0 0 8px; font-family: Arial, sans-serif; color: #ffffff;">UnWantra<span style="color: #e8b96a;">Coaching</span></p>
      <p style="margin: 0; color: #f4e7d1; font-family: Arial, sans-serif; font-size: 14px;">We've received your session request.</p>
    </div>
    <div style="padding: 30px 28px;">
      <p style="font-size: 17px; margin: 0 0 22px; font-weight: 700; font-family: Arial, sans-serif; color: #1a1612;">Hello ${escapeHtml(details.fullName)},</p>
      <p style="margin: 0; font-size: 15px; color: #1a1612; font-family: Arial, sans-serif;">Thank you for your interest in coaching with us! We've received your session request and your coach has been notified.</p>

      <div style="background-color: #fffbeb; border: 1px solid #f59e0b; border-radius: 10px; padding: 18px; margin: 24px 0; text-align: center;">
        <h2 style="margin: 0 0 8px 0; font-size: 18px; color: #b45309; font-family: Arial, sans-serif; font-weight: 700;">⏳ Request Pending</h2>
        <p style="margin: 0; color: #92400e; font-size: 14px; font-family: Arial, sans-serif;">Your coach will review your request and get back to you with available times shortly.</p>
      </div>

      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse; border: 1px solid #e7ded2; border-radius: 10px; overflow: hidden; margin: 24px 0;">
        <tr style="border-bottom: 1px solid #eee8df;">
          <td style="padding: 14px 16px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: #6d6258; width: 140px; font-family: Arial, sans-serif; vertical-align: top;">Program</td>
          <td style="padding: 14px 16px; font-size: 15px; color: #1a1612; font-family: Arial, sans-serif; vertical-align: top;">${escapeHtml(getProgramTitle(details.programName))}</td>
        </tr>
        <tr style="border-bottom: 1px solid #eee8df;">
          <td style="padding: 14px 16px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: #6d6258; width: 140px; font-family: Arial, sans-serif; vertical-align: top;">Coach</td>
          <td style="padding: 14px 16px; font-size: 15px; color: #1a1612; font-family: Arial, sans-serif; vertical-align: top;">${escapeHtml(details.coachName)}</td>
        </tr>
        <tr>
          <td style="padding: 14px 16px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: #6d6258; width: 140px; font-family: Arial, sans-serif; vertical-align: top;">Coach Email</td>
          <td style="padding: 14px 16px; font-size: 15px; color: #1a1612; font-family: Arial, sans-serif; vertical-align: top;"><a href="mailto:${escapeHtml(details.coachEmail)}" style="color: #9b6a17; text-decoration: underline;">${escapeHtml(details.coachEmail)}</a></td>
        </tr>
      </table>

      <p style="margin: 0 0 16px 0; font-size: 15px; color: #1a1612; font-family: Arial, sans-serif;">You'll receive another email once your coach confirms a session time. If you have any questions in the meantime, feel free to reach out.</p>
      <p style="margin: 0; font-size: 15px; color: #1a1612; font-family: Arial, sans-serif;">Thank you for choosing UnWantraCoaching!</p>
    </div>
    <div style="background-color: #faf8f4; padding: 22px 28px; color: #786f66; font-size: 13px; text-align: center; border-top: 1px solid #e7ded2; font-family: Arial, sans-serif;">
      &copy; ${currentYear} UnWantraCoaching. Need help? Contact <a href="mailto:hello@unwantracoaching.co.ke" style="color: #9b6a17; text-decoration: underline;">hello@unwantracoaching.co.ke</a>.
    </div>
  </div>
</body>
</html>`;

  const payload: BrevoEmailPayload = {
    sender: { name: "UnWantraCoaching", email: "softwarewebdevelopers1@gmail.com" },
    to: [{ email: details.email, name: details.fullName }],
    subject: "Your session request has been received — UnWantraCoaching",
    htmlContent,
  };

  try {
    const response = await axios.post<BrevoResponse>(
      "https://api.brevo.com/v3/smtp/email",
      payload,
      { headers: { "api-key": apiKey, "Content-Type": "application/json" } },
    );
    console.log("Slot request received email sent:", response.data.messageId);
  } catch (err) {
    handleEmailError(err as AxiosError<BrevoErrorResponse>);
  }
}

// ── Slot Request: approved by coach ───────────────────────────────────────────
interface SlotRequestApprovedDetails {
  email: string;
  fullName: string;
  programName: string;
  coachName: string;
  coachEmail: string;
  coachPhone?: string;
  scheduledTime: string;
  coachNotes?: string;
  googleMeetingLink?: string;
}

export async function sendSlotRequestApprovedEmail(
  details: SlotRequestApprovedDetails,
): Promise<void> {
  const apiKey = DotEnvConfig.BrevoApiKey.trim();
  const currentYear = new Date().getFullYear();
  const coachPhone = details.coachPhone || "+1 800 555 0100";
  const notes = details.coachNotes
    ? `<p style="margin-top:14px;padding:12px;background:#f0fdf4;border-radius:8px;font-size:14px;color:#166534;"><strong>Coach's note:</strong> ${escapeHtml(details.coachNotes)}</p>`
    : "";

  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Session Scheduled</title>
</head>
<body style="margin: 0; padding: 24px; background-color: #f6f3ee; color: #1a1612; font-family: Arial, sans-serif; line-height: 1.6;">
  <div style="max-width: 640px; margin: 0 auto; background-color: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #e7ded2;">
    <div style="background-color: #1a1612; color: #ffffff; padding: 32px 28px;">
      <p style="font-size: 26px; font-weight: 700; margin: 0 0 8px; font-family: Arial, sans-serif; color: #ffffff;">UnWantra<span style="color: #e8b96a;">Coaching</span></p>
      <p style="margin: 0; color: #f4e7d1; font-family: Arial, sans-serif; font-size: 14px;">Great news — your session has been scheduled!</p>
    </div>
    <div style="padding: 30px 28px;">
      <p style="font-size: 17px; margin: 0 0 22px; font-weight: 700; font-family: Arial, sans-serif; color: #1a1612;">Hello ${escapeHtml(details.fullName)},</p>
      <p style="margin: 0; font-size: 15px; color: #1a1612; font-family: Arial, sans-serif;">Your coach has reviewed your request and scheduled your coaching session. Here are the details:</p>

      <div style="background-color: #f0fdf4; border: 1px solid #22c55e; border-radius: 10px; padding: 18px; margin: 24px 0; text-align: center;">
        <h2 style="margin: 0 0 8px 0; font-size: 18px; color: #166534; font-family: Arial, sans-serif; font-weight: 700;">✅ Session Confirmed</h2>
        <p style="margin: 0; color: #15803d; font-size: 14px; font-family: Arial, sans-serif;">Your coaching session has been scheduled successfully.</p>
      </div>

      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse; border: 1px solid #e7ded2; border-radius: 10px; overflow: hidden; margin: 24px 0;">
        <tr style="border-bottom: 1px solid #eee8df;">
          <td style="padding: 14px 16px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: #6d6258; width: 140px; font-family: Arial, sans-serif; vertical-align: top;">Program</td>
          <td style="padding: 14px 16px; font-size: 15px; color: #1a1612; font-family: Arial, sans-serif; vertical-align: top;">${escapeHtml(getProgramTitle(details.programName))}</td>
        </tr>
        <tr style="border-bottom: 1px solid #eee8df;">
          <td style="padding: 14px 16px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: #6d6258; width: 140px; font-family: Arial, sans-serif; vertical-align: top;">Coach</td>
          <td style="padding: 14px 16px; font-size: 15px; color: #1a1612; font-family: Arial, sans-serif; vertical-align: top;">${escapeHtml(details.coachName)}</td>
        </tr>
        <tr>
          <td style="padding: 14px 16px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: #6d6258; width: 140px; font-family: Arial, sans-serif; vertical-align: top;">Scheduled Time</td>
          <td style="padding: 14px 16px; font-size: 15px; color: #1a1612; font-family: Arial, sans-serif; vertical-align: top;"><strong>${escapeHtml(formatReadableDate(details.scheduledTime))}</strong></td>
        </tr>
      </table>

      ${notes}

      <div style="background-color: #fbf4e7; border: 1px solid #e8b96a; border-radius: 10px; padding: 18px; margin: 24px 0;">
        <h2 style="margin: 0 0 10px 0; font-size: 18px; color: #1a1612; font-family: Arial, sans-serif; font-weight: 700;">Coach Contact Details</h2>
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #1a1612; font-family: Arial, sans-serif;">Email: <a href="mailto:${escapeHtml(details.coachEmail)}" style="color: #9b6a17; text-decoration: underline;">${escapeHtml(details.coachEmail)}</a></p>
        <p style="margin: 0; font-size: 14px; color: #1a1612; font-family: Arial, sans-serif;">Phone: <a href="tel:${escapeHtml(coachPhone)}" style="color: #9b6a17; text-decoration: underline;">${escapeHtml(coachPhone)}</a></p>
      </div>

      ${details.googleMeetingLink ? `
      <div style="margin: 24px 0; text-align: center; background-color: #e8f5e9; border: 1px solid #a5d6a7; border-radius: 12px; padding: 24px;">
        <h3 style="margin: 0 0 8px 0; font-size: 17px; color: #1b5e20; font-family: Arial, sans-serif; font-weight: 700;">
          <img src="https://fonts.gstatic.com/s/i/productlogos/meet_2020q4/v1/web-64dp/logo_meet_2020q4_color_2x_web_64dp.png" alt="Google Meet" width="28" height="28" style="vertical-align:middle;margin-right:8px;border-radius:6px;" />
          Join Your Google Meet Session
        </h3>
        <p style="margin: 0 0 18px 0; font-size: 14px; color: #2e7d32; font-family: Arial, sans-serif;">Your Google Meet link is ready. Click the button below at your scheduled session time to join.</p>
        <a href="${escapeHtml(details.googleMeetingLink)}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 14px 28px; background-color: #00897b; color: #ffffff !important; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 15px; letter-spacing: 0.02em;">▶ Join Google Meeting</a>
        <div style="margin-top: 14px; font-size: 12px; color: #555; word-break: break-all; font-family: Arial, sans-serif;">
          Or copy this link: <a href="${escapeHtml(details.googleMeetingLink)}" style="color: #00897b; text-decoration: underline;">${escapeHtml(details.googleMeetingLink)}</a>
        </div>
      </div>
      ` : `
      <p style="margin: 20px 0 0 0; font-size: 15px; color: #1a1612; font-family: Arial, sans-serif;">Your coach may reach out to share a meeting link or any preparation notes before the session.</p>
      `}
      <p style="margin: 20px 0 0 0; font-size: 15px; color: #1a1612; font-family: Arial, sans-serif;">Thank you for choosing UnWantraCoaching!</p>
    </div>
    <div style="background-color: #faf8f4; padding: 22px 28px; color: #786f66; font-size: 13px; text-align: center; border-top: 1px solid #e7ded2; font-family: Arial, sans-serif;">
      &copy; ${currentYear} UnWantraCoaching. Need help? Contact <a href="mailto:hello@unwantracoaching.co.ke" style="color: #9b6a17; text-decoration: underline;">hello@unwantracoaching.co.ke</a>.
    </div>
  </div>
</body>
</html>`;

  const payload: BrevoEmailPayload = {
    sender: { name: "UnWantraCoaching", email: "softwarewebdevelopers1@gmail.com" },
    to: [{ email: details.email, name: details.fullName }],
    subject: "Your coaching session is scheduled — UnWantraCoaching",
    htmlContent,
  };

  try {
    const response = await axios.post<BrevoResponse>(
      "https://api.brevo.com/v3/smtp/email",
      payload,
      { headers: { "api-key": apiKey, "Content-Type": "application/json" } },
    );
    console.log("Slot request approved email sent:", response.data.messageId);
  } catch (err) {
    handleEmailError(err as AxiosError<BrevoErrorResponse>);
  }
}

// ── Slot Request: declined by coach ───────────────────────────────────────────
interface SlotRequestDeclinedDetails {
  email: string;
  fullName: string;
  programName: string;
  coachName: string;
  coachEmail: string;
}

export async function sendSlotRequestDeclinedEmail(
  details: SlotRequestDeclinedDetails,
): Promise<void> {
  const apiKey = DotEnvConfig.BrevoApiKey.trim();
  const currentYear = new Date().getFullYear();

  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Session Request Declined</title>
</head>
<body style="margin: 0; padding: 24px; background-color: #f6f3ee; color: #1a1612; font-family: Arial, sans-serif; line-height: 1.6;">
  <div style="max-width: 640px; margin: 0 auto; background-color: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #e7ded2;">
    <div style="background-color: #1a1612; color: #ffffff; padding: 32px 28px;">
      <p style="font-size: 26px; font-weight: 700; margin: 0 0 8px; font-family: Arial, sans-serif; color: #ffffff;">UnWantra<span style="color: #e8b96a;">Coaching</span></p>
      <p style="margin: 0; color: #f4e7d1; font-family: Arial, sans-serif; font-size: 14px;">Update on your session request.</p>
    </div>
    <div style="padding: 30px 28px;">
      <p style="font-size: 17px; margin: 0 0 22px; font-weight: 700; font-family: Arial, sans-serif; color: #1a1612;">Hello ${escapeHtml(details.fullName)},</p>
      <p style="margin: 0; font-size: 15px; color: #1a1612; font-family: Arial, sans-serif;">Thank you for your interest in coaching with us. Unfortunately, your coach was unable to accommodate your session request at this time.</p>

      <div style="background-color: #fef2f2; border: 1px solid #ef4444; border-radius: 10px; padding: 18px; margin: 24px 0; text-align: center;">
        <h2 style="margin: 0 0 8px 0; font-size: 18px; color: #b91c1c; font-family: Arial, sans-serif; font-weight: 700;">Request Declined</h2>
        <p style="margin: 0; color: #991b1b; font-size: 14px; font-family: Arial, sans-serif;">Your session request has been declined. You may submit a new request or choose another coach.</p>
      </div>

      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse; border: 1px solid #e7ded2; border-radius: 10px; overflow: hidden; margin: 24px 0;">
        <tr style="border-bottom: 1px solid #eee8df;">
          <td style="padding: 14px 16px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: #6d6258; width: 140px; font-family: Arial, sans-serif; vertical-align: top;">Program</td>
          <td style="padding: 14px 16px; font-size: 15px; color: #1a1612; font-family: Arial, sans-serif; vertical-align: top;">${escapeHtml(getProgramTitle(details.programName))}</td>
        </tr>
        <tr style="border-bottom: 1px solid #eee8df;">
          <td style="padding: 14px 16px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: #6d6258; width: 140px; font-family: Arial, sans-serif; vertical-align: top;">Coach</td>
          <td style="padding: 14px 16px; font-size: 15px; color: #1a1612; font-family: Arial, sans-serif; vertical-align: top;">${escapeHtml(details.coachName)}</td>
        </tr>
        <tr>
          <td style="padding: 14px 16px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: #6d6258; width: 140px; font-family: Arial, sans-serif; vertical-align: top;">Coach Email</td>
          <td style="padding: 14px 16px; font-size: 15px; color: #1a1612; font-family: Arial, sans-serif; vertical-align: top;"><a href="mailto:${escapeHtml(details.coachEmail)}" style="color: #9b6a17; text-decoration: underline;">${escapeHtml(details.coachEmail)}</a></td>
        </tr>
      </table>

      <p style="margin: 0 0 16px 0; font-size: 15px; color: #1a1612; font-family: Arial, sans-serif;">If you have questions, feel free to reach out or browse other available coaches on our website.</p>
      <p style="margin: 0; font-size: 15px; color: #1a1612; font-family: Arial, sans-serif;">Thank you for choosing UnWantraCoaching!</p>
    </div>
    <div style="background-color: #faf8f4; padding: 22px 28px; color: #786f66; font-size: 13px; text-align: center; border-top: 1px solid #e7ded2; font-family: Arial, sans-serif;">
      &copy; ${currentYear} UnWantraCoaching. Need help? Contact <a href="mailto:hello@unwantracoaching.co.ke" style="color: #9b6a17; text-decoration: underline;">hello@unwantracoaching.co.ke</a>.
    </div>
  </div>
</body>
</html>`;

  const payload: BrevoEmailPayload = {
    sender: { name: "UnWantraCoaching", email: "softwarewebdevelopers1@gmail.com" },
    to: [{ email: details.email, name: details.fullName }],
    subject: "Your session request was declined — UnWantraCoaching",
    htmlContent,
  };

  try {
    const response = await axios.post<BrevoResponse>(
      "https://api.brevo.com/v3/smtp/email",
      payload,
      { headers: { "api-key": apiKey, "Content-Type": "application/json" } },
    );
    console.log("Slot request declined email sent:", response.data.messageId);
  } catch (err) {
    handleEmailError(err as AxiosError<BrevoErrorResponse>);
  }
}

// ── Slot Request: notify coach of new request ─────────────────────────────────
interface SlotRequestCoachNotificationDetails {
  coachEmail: string;
  coachName: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  programName: string;
  message: string;
}

export async function sendSlotRequestCoachNotificationEmail(
  details: SlotRequestCoachNotificationDetails,
): Promise<void> {
  const apiKey = DotEnvConfig.BrevoApiKey.trim();
  const currentYear = new Date().getFullYear();
  const clientMessage = details.message
    ? `<p style="margin-top:14px;padding:12px;background:#fffbeb;border-radius:8px;font-size:14px;color:#92400e;"><strong>Client message:</strong> ${escapeHtml(details.message)}</p>`
    : "";

  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Session Request</title>
</head>
<body style="margin: 0; padding: 24px; background-color: #f6f3ee; color: #1a1612; font-family: Arial, sans-serif; line-height: 1.6;">
  <div style="max-width: 640px; margin: 0 auto; background-color: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #e7ded2;">
    <div style="background-color: #1a1612; color: #ffffff; padding: 32px 28px;">
      <p style="font-size: 26px; font-weight: 700; margin: 0 0 8px; font-family: Arial, sans-serif; color: #ffffff;">UnWantra<span style="color: #e8b96a;">Coaching</span></p>
      <p style="margin: 0; color: #f4e7d1; font-family: Arial, sans-serif; font-size: 14px;">You have a new session request.</p>
    </div>
    <div style="padding: 30px 28px;">
      <p style="font-size: 17px; margin: 0 0 22px; font-weight: 700; font-family: Arial, sans-serif; color: #1a1612;">Hello ${escapeHtml(details.coachName)},</p>
      <p style="margin: 0; font-size: 15px; color: #1a1612; font-family: Arial, sans-serif;">A client has requested a coaching session with you. Please review the request in your coach dashboard.</p>

      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse; border: 1px solid #e7ded2; border-radius: 10px; overflow: hidden; margin: 24px 0;">
        <tr style="border-bottom: 1px solid #eee8df;">
          <td style="padding: 14px 16px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: #6d6258; width: 140px; font-family: Arial, sans-serif; vertical-align: top;">Client</td>
          <td style="padding: 14px 16px; font-size: 15px; color: #1a1612; font-family: Arial, sans-serif; vertical-align: top;">${escapeHtml(details.fullName)}</td>
        </tr>
        <tr style="border-bottom: 1px solid #eee8df;">
          <td style="padding: 14px 16px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: #6d6258; width: 140px; font-family: Arial, sans-serif; vertical-align: top;">Email</td>
          <td style="padding: 14px 16px; font-size: 15px; color: #1a1612; font-family: Arial, sans-serif; vertical-align: top;"><a href="mailto:${escapeHtml(details.email)}" style="color: #9b6a17; text-decoration: underline;">${escapeHtml(details.email)}</a></td>
        </tr>
        <tr style="border-bottom: 1px solid #eee8df;">
          <td style="padding: 14px 16px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: #6d6258; width: 140px; font-family: Arial, sans-serif; vertical-align: top;">Phone</td>
          <td style="padding: 14px 16px; font-size: 15px; color: #1a1612; font-family: Arial, sans-serif; vertical-align: top;">${escapeHtml(details.phoneNumber)}</td>
        </tr>
        <tr>
          <td style="padding: 14px 16px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: #6d6258; width: 140px; font-family: Arial, sans-serif; vertical-align: top;">Program</td>
          <td style="padding: 14px 16px; font-size: 15px; color: #1a1612; font-family: Arial, sans-serif; vertical-align: top;">${escapeHtml(getProgramTitle(details.programName))}</td>
        </tr>
      </table>

      ${clientMessage}

      <p style="margin: 20px 0 0 0; font-size: 15px; color: #1a1612; font-family: Arial, sans-serif;">Log in to your coach portal to approve or decline this request.</p>
    </div>
    <div style="background-color: #faf8f4; padding: 22px 28px; color: #786f66; font-size: 13px; text-align: center; border-top: 1px solid #e7ded2; font-family: Arial, sans-serif;">
      &copy; ${currentYear} UnWantraCoaching. Coach portal notification.
    </div>
  </div>
</body>
</html>`;

  const payload: BrevoEmailPayload = {
    sender: { name: "UnWantraCoaching", email: "softwarewebdevelopers1@gmail.com" },
    to: [{ email: details.coachEmail, name: details.coachName }],
    subject: "New session request — UnWantraCoaching",
    htmlContent,
  };

  try {
    const response = await axios.post<BrevoResponse>(
      "https://api.brevo.com/v3/smtp/email",
      payload,
      { headers: { "api-key": apiKey, "Content-Type": "application/json" } },
    );
    console.log("Coach notification email sent:", response.data.messageId);
  } catch (err) {
    handleEmailError(err as AxiosError<BrevoErrorResponse>);
  }
}

function generateBookingEmailTemplate(booking: BookingConfirmationDetails): string {
  const currentYear = new Date().getFullYear();
  const coachName = booking.coachName || `Coach #${booking.coachId}`;
  const coachEmail = booking.coachEmail || "hello@unwantracoaching.co.ke";
  const coachPhone = booking.coachPhone || "+1 800 555 0100";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your UnWantraCoaching Booking</title>
</head>
<body style="margin: 0; padding: 24px; background-color: #f6f3ee; color: #1a1612; font-family: Arial, sans-serif; line-height: 1.6;">
  <div style="max-width: 640px; margin: 0 auto; background-color: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #e7ded2;">
    <div style="background-color: #1a1612; color: #ffffff; padding: 32px 28px;">
      <p style="font-size: 26px; font-weight: 700; margin: 0 0 8px; font-family: Arial, sans-serif; color: #ffffff;">UnWantra<span style="color: #e8b96a;">Coaching</span></p>
      <p style="margin: 0; color: #f4e7d1; font-family: Arial, sans-serif; font-size: 14px;">Your coaching session has been booked successfully.</p>
    </div>

    <div style="padding: 30px 28px;">
      <p style="font-size: 17px; margin: 0 0 22px; font-weight: 700; font-family: Arial, sans-serif; color: #1a1612;">Hello ${escapeHtml(booking.fullName)},</p>
      <p style="margin: 0; font-size: 15px; color: #1a1612; font-family: Arial, sans-serif;">Your booking is confirmed. Here are the details for your upcoming coaching session.</p>

      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse; border: 1px solid #e7ded2; border-radius: 10px; overflow: hidden; margin: 24px 0;">
        <tr style="border-bottom: 1px solid #eee8df;">
          <td style="padding: 14px 16px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: #6d6258; width: 140px; font-family: Arial, sans-serif; vertical-align: top;">Program</td>
          <td style="padding: 14px 16px; font-size: 15px; color: #1a1612; font-family: Arial, sans-serif; vertical-align: top;">${escapeHtml(getProgramTitle(booking.programName))}</td>
        </tr>
        <tr style="border-bottom: 1px solid #eee8df;">
          <td style="padding: 14px 16px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: #6d6258; width: 140px; font-family: Arial, sans-serif; vertical-align: top;">Coach</td>
          <td style="padding: 14px 16px; font-size: 15px; color: #1a1612; font-family: Arial, sans-serif; vertical-align: top;">${escapeHtml(coachName)}</td>
        </tr>
        <tr style="border-bottom: 1px solid #eee8df;">
          <td style="padding: 14px 16px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: #6d6258; width: 140px; font-family: Arial, sans-serif; vertical-align: top;">Session Time</td>
          <td style="padding: 14px 16px; font-size: 15px; color: #1a1612; font-family: Arial, sans-serif; vertical-align: top;">${escapeHtml(formatReadableDate(booking.bookingTime))}</td>
        </tr>
        <tr>
          <td style="padding: 14px 16px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: #6d6258; width: 140px; font-family: Arial, sans-serif; vertical-align: top;">Your Phone</td>
          <td style="padding: 14px 16px; font-size: 15px; color: #1a1612; font-family: Arial, sans-serif; vertical-align: top;">${escapeHtml(booking.phoneNumber)}</td>
        </tr>
      </table>

      <div style="background-color: #fbf4e7; border: 1px solid #e8b96a; border-radius: 10px; padding: 18px; margin: 24px 0;">
        <h2 style="margin: 0 0 10px 0; font-size: 18px; color: #1a1612; font-family: Arial, sans-serif; font-weight: 700;">Coach Contact Details</h2>
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #1a1612; font-family: Arial, sans-serif;">Email: <a href="mailto:${escapeHtml(coachEmail)}" style="color: #9b6a17; text-decoration: underline;">${escapeHtml(coachEmail)}</a></p>
        <p style="margin: 0; font-size: 14px; color: #1a1612; font-family: Arial, sans-serif;">Phone: <a href="tel:${escapeHtml(coachPhone)}" style="color: #9b6a17; text-decoration: underline;">${escapeHtml(coachPhone)}</a></p>
      </div>

      ${booking.googleMeetingLink ? `
      <div style="margin: 24px 0; text-align: center; background-color: #e8f5e9; border: 1px solid #a5d6a7; border-radius: 12px; padding: 24px;">
        <h3 style="margin: 0 0 8px 0; font-size: 17px; color: #1b5e20; font-family: Arial, sans-serif; font-weight: 700;">
          <img src="https://fonts.gstatic.com/s/i/productlogos/meet_2020q4/v1/web-64dp/logo_meet_2020q4_color_2x_web_64dp.png" alt="Google Meet" width="28" height="28" style="vertical-align:middle;margin-right:8px;border-radius:6px;" />
          Join Your Google Meet Session
        </h3>
        <p style="margin: 0 0 18px 0; font-size: 14px; color: #2e7d32; font-family: Arial, sans-serif;">Your Google Meet link is ready. Click the button below at your scheduled session time to join.</p>
        <a href="${escapeHtml(booking.googleMeetingLink)}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 14px 28px; background-color: #00897b; color: #ffffff !important; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 15px; letter-spacing: 0.02em;">▶ Join Google Meeting</a>
        <div style="margin-top: 14px; font-size: 12px; color: #555; word-break: break-all; font-family: Arial, sans-serif;">
          Or copy this link: <a href="${escapeHtml(booking.googleMeetingLink)}" style="color:#00897b; text-decoration: underline;">${escapeHtml(booking.googleMeetingLink)}</a>
        </div>
      </div>` : `<p style="margin: 20px 0 0 0; font-size: 15px; color: #1a1612; font-family: Arial, sans-serif;">Your coach will reach out within 24 hours to confirm the session link and any preparation notes.</p>`}
      <p style="margin: 20px 0 0 0; font-size: 15px; color: #1a1612; font-family: Arial, sans-serif;">Thank you for booking with UnWantraCoaching.</p>
    </div>

    <div style="background-color: #faf8f4; padding: 22px 28px; color: #786f66; font-size: 13px; text-align: center; border-top: 1px solid #e7ded2; font-family: Arial, sans-serif;">
      &copy; ${currentYear} UnWantraCoaching. Need help? Contact <a href="mailto:hello@unwantracoaching.co.ke" style="color: #9b6a17; text-decoration: underline;">hello@unwantracoaching.co.ke</a>.
    </div>
  </div>
</body>
</html>\`;
}

interface ResetPasswordDetails {
  email: string;
  fullName: string;
  resetLink: string;
}

export async function sendResetPasswordEmail(
  details: ResetPasswordDetails,
): Promise<void> {
  const apiKey = DotEnvConfig.BrevoApiKey.trim();
  const currentYear = new Date().getFullYear();

  const htmlContent = buildStyledEmailHtml({
    title: "Reset your UnWantraCoaching password",
    preheader: "Password reset request",
    body: `
      <p style="font-size: 17px; margin: 0 0 22px; font-weight: 700; font-family: Arial, sans-serif; color: #1a1612;">Hello ${escapeHtml(details.fullName)},</p>
      <p style="margin: 0 0 20px 0; font-size: 15px; color: #1a1612; font-family: Arial, sans-serif;">We received a request to reset your password. Click the button below to choose a new password. This link will expire in 1 hour.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${details.resetLink}" style="background-color: #e8b96a; color: #1a1612; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 8px; font-size: 16px; display: inline-block;">Reset Password</a>
      </div>
      <p style="margin: 0 0 10px 0; font-size: 15px; color: #1a1612; font-family: Arial, sans-serif;">If the button doesn't work, you can copy and paste the following link into your browser:</p>
      <p style="margin: 0 0 20px 0; font-size: 14px; color: #9b6a17; word-break: break-all; font-family: Arial, sans-serif;"><a href="${details.resetLink}" style="color: #9b6a17; text-decoration: underline;">${details.resetLink}</a></p>
      <p style="margin: 0; font-size: 15px; color: #6d6258; font-family: Arial, sans-serif;">If you didn't request a password reset, you can safely ignore this email.</p>
    `,
    footerNote: `&copy; ${currentYear} UnWantraCoaching.`,
  });

  const payload: BrevoEmailPayload = {
    sender: { name: "UnWantraCoaching", email: "softwarewebdevelopers1@gmail.com" },
    to: [{ email: details.email, name: details.fullName }],
    subject: "Reset your UnWantraCoaching password",
    htmlContent,
  };

  try {
    const response = await axios.post<BrevoResponse>(
      "https://api.brevo.com/v3/smtp/email",
      payload,
      { headers: { "api-key": apiKey, "Content-Type": "application/json" } },
    );
    console.log("Reset password email sent:", response.data.messageId);
  } catch (err) {
    handleEmailError(err as AxiosError<BrevoErrorResponse>);
  }
}

function escapeHtml(value: string): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function handleEmailError(error: AxiosError<BrevoErrorResponse>): void {
  if (error.response) {
    console.error(
      `Email sending failed with status ${error.response.status}:`,
      error.response.data,
    );

    const errorData = error.response.data;
    if (errorData.code === "unauthorized") {
      console.error(
        "Invalid API key. Please check your BREVO_API_KEY environment variable.",
      );
    } else if (errorData.code === "invalid_parameter") {
      console.error(
        "Invalid email parameters. Please check the email format and content.",
      );
    }
  } else if (error.request) {
    console.error(
      "No response received from Brevo API. Please check your network connection.",
    );
  } else {
    console.error("Error setting up email request:", error.message);
  }
}
