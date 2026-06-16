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
      name: "Apex Coaching",
      email: "softwarewebdevelopers1@gmail.com",
    },
    to: [{ email: booking.email, name: booking.fullName }],
    subject: "Your Apex Coaching session is booked",
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

function generateBookingEmailTemplate(booking: BookingConfirmationDetails): string {
  const currentYear = new Date().getFullYear();
  const coachName = booking.coachName || `Coach #${booking.coachId}`;
  const coachEmail = booking.coachEmail || "hello@apexcoaching.com";
  const coachPhone = booking.coachPhone || "+1 800 555 0100";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Apex Coaching Booking</title>
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
      <p class="brand">Apex<span>Coaching</span></p>
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
      <p>Thank you for booking with Apex Coaching.</p>
    </div>

    <div class="footer">
      &copy; ${currentYear} Apex Coaching. Need help? Contact hello@apexcoaching.com.
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
