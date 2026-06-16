// creating the interfaces ts variable to prevent error
interface EmailSender {
  name: string;
  email: string;
}

interface EmailRecipient {
  email: string;
  name?: string;
}

interface BrevoEmailPayload {
  sender: EmailSender;
  to: EmailRecipient[];
  subject: string;
  htmlContent: string;
}

interface BrevoResponse {
  messageId?: string;
  [key: string]: any;
}

interface BrevoErrorResponse {
  code?: string;
  message?: string;
  [key: string]: any;
}
export type {
  EmailSender,
  EmailRecipient,
  BrevoEmailPayload,
  BrevoResponse,
  BrevoErrorResponse,
};
