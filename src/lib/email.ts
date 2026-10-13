// Transactional email behind one function, so the provider can be swapped without touching the action.
// Default provider: Resend (REST API via fetch; no SDK needed on Workers).

export interface OutgoingEmail {
  to: string;
  replyTo: string;
  subject: string;
  text: string;
}

export interface EmailConfig {
  apiKey: string | undefined;
  from: string;
}

export class EmailError extends Error {}

export async function sendEmail(email: OutgoingEmail, config: EmailConfig): Promise<void> {
  if (!config.apiKey) throw new EmailError("Email provider is not configured.");

  // Local testing without a real key: set RESEND_API_KEY=dry-run in .dev.vars. Never logs the message body.
  if (config.apiKey === "dry-run") {
    console.info(`[email] dry run: message for ${email.to} (${email.text.length} characters) not sent.`);
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: config.from,
      to: [email.to],
      reply_to: email.replyTo,
      subject: email.subject,
      text: email.text,
    }),
  });

  if (!response.ok) {
    // Status only: the response may echo message content.
    throw new EmailError(`Email provider responded with ${response.status}.`);
  }
}
