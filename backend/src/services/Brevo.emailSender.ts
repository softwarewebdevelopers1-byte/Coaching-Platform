import axios, { AxiosError } from "axios";
import type {
  BrevoEmailPayload,
  BrevoResponse,
  BrevoErrorResponse,
} from "../types/Brevo.sender.js";
import DotEnvConfig from "../configs/DotEnv.js";

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

  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>We received your enquiry</title>
  <style>
    body { margin: 0; padding: 24px; background: #f6f3ee; color: #1a1612; font-family: Arial, sans-serif; line-height: 1.6; }
    .email-container { max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #e7ded2; }
    .header { background: #1a1612; color: #ffffff; padding: 32px 28px; }
    .brand { font-size: 26px; font-weight: 700; margin: 0 0 8px; }
    .brand span { color: #e8b96a; }
    .header p { margin: 0; color: #f4e7d1; }
    .content { padding: 30px 28px; }
    .lead { font-size: 17px; margin: 0 0 22px; }
    .panel { border: 1px solid #e7ded2; border-radius: 10px; overflow: hidden; margin: 24px 0; }
    .row { display: flex; gap: 18px; padding: 14px 16px; border-bottom: 1px solid #eee8df; }
    .row:last-child { border-bottom: 0; }
    .label { min-width: 140px; color: #6d6258; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; }
    .value { font-size: 15px; color: #1a1612; }
    .next-steps { background: #fbf4e7; border: 1px solid #e8b96a; border-radius: 10px; padding: 18px; margin: 24px 0; }
    .next-steps h2 { margin: 0 0 10px; font-size: 18px; }
    .footer { background: #faf8f4; padding: 22px 28px; color: #786f66; font-size: 13px; text-align: center; }
    a { color: #9b6a17; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <p class="brand">UnWantraCoaching</p>
      <p>Thank you for reaching out</p>
    </div>
    <div class="content">
      <p class="lead">Hello ${escapeHtml(details.name)},</p>
      <p>We have received your enquiry and a member of the UnWantraCoaching team will follow up within 1–2 business days to discuss your coaching goals and schedule a discovery call if appropriate.</p>

      <div class="panel">
        <div class="row">
          <div class="label">Coaching interest</div>
          <div class="value">${escapeHtml(details.interest)}</div>
        </div>
      </div>

      <div class="next-steps">
        <h2>What happens next</h2>
        <p>Our team will review your goals, match you with the most suitable coach, and reach out to arrange a discovery call at a time that works for you.</p>
        <p>You can also book a discovery call directly from our website whenever you are ready.</p>
      </div>

      <p>Thank you for choosing UnWantraCoaching.</p>
    </div>

    <div class="footer">
      &copy; ${currentYear} UnWantraCoaching. Need help? Contact hello@unwantracoaching.co.ke.
    </div>
  </div>
</body>
</html>`;

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
  <style>
    body { margin: 0; padding: 24px; background: #f6f3ee; color: #1a1612; font-family: Arial, sans-serif; line-height: 1.6; }
    .email-container { max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #e7ded2; }
    .header { background: #1a1612; color: #ffffff; padding: 32px 28px; }
    .brand { font-size: 26px; font-weight: 700; margin: 0 0 8px; }
    .brand span { color: #e8b96a; }
    .header p { margin: 0; color: #f4e7d1; }
    .content { padding: 30px 28px; }
    .lead { font-size: 17px; margin: 0 0 22px; }
    .status-box { background: #fffbeb; border: 1px solid #f59e0b; border-radius: 10px; padding: 18px; margin: 24px 0; text-align: center; }
    .status-box h2 { margin: 0 0 8px; font-size: 18px; color: #b45309; }
    .status-box p { margin: 0; color: #92400e; font-size: 14px; }
    .panel { border: 1px solid #e7ded2; border-radius: 10px; overflow: hidden; margin: 24px 0; }
    .row { display: flex; gap: 18px; padding: 14px 16px; border-bottom: 1px solid #eee8df; }
    .row:last-child { border-bottom: 0; }
    .label { min-width: 140px; color: #6d6258; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; }
    .value { font-size: 15px; color: #1a1612; }
    .footer { background: #faf8f4; padding: 22px 28px; color: #786f66; font-size: 13px; text-align: center; }
    a { color: #9b6a17; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <p class="brand">UnWantraCoaching</p>
      <p>We've received your session request.</p>
    </div>
    <div class="content">
      <p class="lead">Hello ${escapeHtml(details.fullName)},</p>
      <p>Thank you for your interest in coaching with us! We've received your session request and your coach has been notified.</p>

      <div class="status-box">
        <h2>⏳ Request Pending</h2>
        <p>Your coach will review your request and get back to you with available times shortly.</p>
      </div>

      <div class="panel">
        <div class="row">
          <div class="label">Program</div>
          <div class="value">${escapeHtml(details.programName)}</div>
        </div>
        <div class="row">
          <div class="label">Coach</div>
          <div class="value">${escapeHtml(details.coachName)}</div>
        </div>
        <div class="row">
          <div class="label">Coach Email</div>
          <div class="value"><a href="mailto:${escapeHtml(details.coachEmail)}">${escapeHtml(details.coachEmail)}</a></div>
        </div>
      </div>

      <p>You'll receive another email once your coach confirms a session time. If you have any questions in the meantime, feel free to reach out.</p>
      <p>Thank you for choosing UnWantraCoaching!</p>
    </div>
    <div class="footer">
      &copy; ${currentYear} UnWantraCoaching. Need help? Contact hello@unwantracoaching.co.ke.
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
  <style>
    body { margin: 0; padding: 24px; background: #f6f3ee; color: #1a1612; font-family: Arial, sans-serif; line-height: 1.6; }
    .email-container { max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #e7ded2; }
    .header { background: #1a1612; color: #ffffff; padding: 32px 28px; }
    .brand { font-size: 26px; font-weight: 700; margin: 0 0 8px; }
    .brand span { color: #e8b96a; }
    .header p { margin: 0; color: #f4e7d1; }
    .content { padding: 30px 28px; }
    .lead { font-size: 17px; margin: 0 0 22px; }
    .status-box { background: #f0fdf4; border: 1px solid #22c55e; border-radius: 10px; padding: 18px; margin: 24px 0; text-align: center; }
    .status-box h2 { margin: 0 0 8px; font-size: 18px; color: #166534; }
    .status-box p { margin: 0; color: #15803d; font-size: 14px; }
    .panel { border: 1px solid #e7ded2; border-radius: 10px; overflow: hidden; margin: 24px 0; }
    .row { display: flex; gap: 18px; padding: 14px 16px; border-bottom: 1px solid #eee8df; }
    .row:last-child { border-bottom: 0; }
    .label { min-width: 140px; color: #6d6258; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; }
    .value { font-size: 15px; color: #1a1612; }
    .coach-box { background: #fbf4e7; border: 1px solid #e8b96a; border-radius: 10px; padding: 18px; margin: 24px 0; }
    .coach-box h2 { margin: 0 0 10px; font-size: 18px; }
    .footer { background: #faf8f4; padding: 22px 28px; color: #786f66; font-size: 13px; text-align: center; }
    a { color: #9b6a17; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <p class="brand">UnWantraCoaching</p>
      <p>Great news — your session has been scheduled!</p>
    </div>
    <div class="content">
      <p class="lead">Hello ${escapeHtml(details.fullName)},</p>
      <p>Your coach has reviewed your request and scheduled your coaching session. Here are the details:</p>

      <div class="status-box">
        <h2>✅ Session Confirmed</h2>
        <p>Your coaching session has been scheduled successfully.</p>
      </div>

      <div class="panel">
        <div class="row">
          <div class="label">Program</div>
          <div class="value">${escapeHtml(details.programName)}</div>
        </div>
        <div class="row">
          <div class="label">Coach</div>
          <div class="value">${escapeHtml(details.coachName)}</div>
        </div>
        <div class="row">
          <div class="label">Scheduled Time</div>
          <div class="value"><strong>${escapeHtml(details.scheduledTime)}</strong></div>
        </div>
      </div>

      ${notes}

      <div class="coach-box">
        <h2>Coach Contact Details</h2>
        <p>Email: <a href="mailto:${escapeHtml(details.coachEmail)}">${escapeHtml(details.coachEmail)}</a></p>
        <p>Phone: <a href="tel:${escapeHtml(coachPhone)}">${escapeHtml(coachPhone)}</a></p>
      </div>

      <p>Your coach may reach out to share a meeting link or any preparation notes before the session.</p>
      <p>Thank you for choosing UnWantraCoaching!</p>
    </div>
    <div class="footer">
      &copy; ${currentYear} UnWantraCoaching. Need help? Contact hello@unwantracoaching.co.ke.
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
  <style>
    body { margin: 0; padding: 24px; background: #f6f3ee; color: #1a1612; font-family: Arial, sans-serif; line-height: 1.6; }
    .email-container { max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #e7ded2; }
    .header { background: #1a1612; color: #ffffff; padding: 32px 28px; }
    .brand { font-size: 26px; font-weight: 700; margin: 0 0 8px; }
    .brand span { color: #e8b96a; }
    .header p { margin: 0; color: #f4e7d1; }
    .content { padding: 30px 28px; }
    .lead { font-size: 17px; margin: 0 0 22px; }
    .status-box { background: #fef2f2; border: 1px solid #ef4444; border-radius: 10px; padding: 18px; margin: 24px 0; text-align: center; }
    .status-box h2 { margin: 0 0 8px; font-size: 18px; color: #b91c1c; }
    .status-box p { margin: 0; color: #991b1b; font-size: 14px; }
    .panel { border: 1px solid #e7ded2; border-radius: 10px; overflow: hidden; margin: 24px 0; }
    .row { display: flex; gap: 18px; padding: 14px 16px; border-bottom: 1px solid #eee8df; }
    .row:last-child { border-bottom: 0; }
    .label { min-width: 140px; color: #6d6258; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; }
    .value { font-size: 15px; color: #1a1612; }
    .footer { background: #faf8f4; padding: 22px 28px; color: #786f66; font-size: 13px; text-align: center; }
    a { color: #9b6a17; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <p class="brand">UnWantraCoaching</p>
      <p>Update on your session request.</p>
    </div>
    <div class="content">
      <p class="lead">Hello ${escapeHtml(details.fullName)},</p>
      <p>Thank you for your interest in coaching with us. Unfortunately, your coach was unable to accommodate your session request at this time.</p>

      <div class="status-box">
        <h2>Request Declined</h2>
        <p>Your session request has been declined. You may submit a new request or choose another coach.</p>
      </div>

      <div class="panel">
        <div class="row">
          <div class="label">Program</div>
          <div class="value">${escapeHtml(details.programName)}</div>
        </div>
        <div class="row">
          <div class="label">Coach</div>
          <div class="value">${escapeHtml(details.coachName)}</div>
        </div>
        <div class="row">
          <div class="label">Coach Email</div>
          <div class="value"><a href="mailto:${escapeHtml(details.coachEmail)}">${escapeHtml(details.coachEmail)}</a></div>
        </div>
      </div>

      <p>If you have questions, feel free to reach out or browse other available coaches on our website.</p>
      <p>Thank you for choosing UnWantraCoaching!</p>
    </div>
    <div class="footer">
      &copy; ${currentYear} UnWantraCoaching. Need help? Contact hello@unwantracoaching.co.ke.
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
  <style>
    body { margin: 0; padding: 24px; background: #f6f3ee; color: #1a1612; font-family: Arial, sans-serif; line-height: 1.6; }
    .email-container { max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #e7ded2; }
    .header { background: #1a1612; color: #ffffff; padding: 32px 28px; }
    .brand { font-size: 26px; font-weight: 700; margin: 0 0 8px; }
    .brand span { color: #e8b96a; }
    .header p { margin: 0; color: #f4e7d1; }
    .content { padding: 30px 28px; }
    .lead { font-size: 17px; margin: 0 0 22px; }
    .panel { border: 1px solid #e7ded2; border-radius: 10px; overflow: hidden; margin: 24px 0; }
    .row { display: flex; gap: 18px; padding: 14px 16px; border-bottom: 1px solid #eee8df; }
    .row:last-child { border-bottom: 0; }
    .label { min-width: 140px; color: #6d6258; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; }
    .value { font-size: 15px; color: #1a1612; }
    .footer { background: #faf8f4; padding: 22px 28px; color: #786f66; font-size: 13px; text-align: center; }
    a { color: #9b6a17; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <p class="brand">UnWantraCoaching</p>
      <p>You have a new session request.</p>
    </div>
    <div class="content">
      <p class="lead">Hello ${escapeHtml(details.coachName)},</p>
      <p>A client has requested a coaching session with you. Please review the request in your coach dashboard.</p>

      <div class="panel">
        <div class="row">
          <div class="label">Client</div>
          <div class="value">${escapeHtml(details.fullName)}</div>
        </div>
        <div class="row">
          <div class="label">Email</div>
          <div class="value"><a href="mailto:${escapeHtml(details.email)}">${escapeHtml(details.email)}</a></div>
        </div>
        <div class="row">
          <div class="label">Phone</div>
          <div class="value">${escapeHtml(details.phoneNumber)}</div>
        </div>
        <div class="row">
          <div class="label">Program</div>
          <div class="value">${escapeHtml(details.programName)}</div>
        </div>
      </div>

      ${clientMessage}

      <p>Log in to your coach portal to approve or decline this request.</p>
    </div>
    <div class="footer">
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
  <style>
    body { margin: 0; padding: 24px; background: #f6f3ee; color: #1a1612; font-family: Arial, sans-serif; line-height: 1.6; }
    .email-container { max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #e7ded2; }
    .header { background: #1a1612; color: #ffffff; padding: 32px 28px; }
    .brand { font-size: 26px; font-weight: 700; margin: 0 0 8px; }
    .brand span { color: #e8b96a; }
    .header p { margin: 0; color: #f4e7d1; }
    .content { padding: 30px 28px; }
    .lead { font-size: 17px; margin: 0 0 22px; }
    .panel { border: 1px solid #e7ded2; border-radius: 10px; overflow: hidden; margin: 24px 0; }
    .row { display: flex; gap: 18px; padding: 14px 16px; border-bottom: 1px solid #eee8df; }
    .row:last-child { border-bottom: 0; }
    .label { min-width: 140px; color: #6d6258; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; }
    .value { font-size: 15px; color: #1a1612; }
    .coach-box { background: #fbf4e7; border: 1px solid #e8b96a; border-radius: 10px; padding: 18px; margin: 24px 0; }
    .coach-box h2 { margin: 0 0 10px; font-size: 18px; }
    .footer { background: #faf8f4; padding: 22px 28px; color: #786f66; font-size: 13px; text-align: center; }
    a { color: #9b6a17; }
    @media (max-width: 560px) {
      body { padding: 12px; }
      .row { display: block; }
      .label { display: block; margin-bottom: 4px; }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <p class="brand">UnWantraCoaching</p>
      <p>Your coaching session has been booked successfully.</p>
    </div>

    <div class="content">
      <p class="lead">Hello ${escapeHtml(booking.fullName)},</p>
      <p>Your booking is confirmed. Here are the details for your upcoming coaching session.</p>

      <div class="panel">
        <div class="row">
          <div class="label">Program</div>
          <div class="value">${escapeHtml(booking.programName)}</div>
        </div>
        <div class="row">
          <div class="label">Coach</div>
          <div class="value">${escapeHtml(coachName)}</div>
        </div>
        <div class="row">
          <div class="label">Session Time</div>
          <div class="value">${escapeHtml(booking.bookingTime)}</div>
        </div>
        <div class="row">
          <div class="label">Your Phone</div>
          <div class="value">${escapeHtml(booking.phoneNumber)}</div>
        </div>
      </div>

      <div class="coach-box">
        <h2>Coach Contact Details</h2>
        <p>Email: <a href="mailto:${escapeHtml(coachEmail)}">${escapeHtml(coachEmail)}</a></p>
        <p>Phone: <a href="tel:${escapeHtml(coachPhone)}">${escapeHtml(coachPhone)}</a></p>
      </div>

      <p>Your coach will reach out within 24 hours to confirm the session link and any preparation notes.</p>
      <p>Thank you for booking with UnWantraCoaching.</p>
    </div>

    <div class="footer">
      &copy; ${currentYear} UnWantraCoaching. Need help? Contact hello@unwantracoaching.co.ke.
    </div>
  </div>
</body>
</html>`;
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
