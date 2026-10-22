import { ActionError, defineAction } from "astro:actions";
import { z } from "astro/zod";
import { env } from "cloudflare:workers";
import { areaBySlug } from "../data/practice-areas";
import { site } from "../data/site";
import { EmailError, sendEmail } from "../lib/email";
import { verifyTurnstile } from "../lib/turnstile";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(120, "Enter a shorter name."),
  email: z.email("Enter an email address in the format name@example.com.").max(200),
  phone: z
    .string()
    .trim()
    .max(40, "Enter a shorter phone number.")
    .regex(/^[0-9+()\s-]*$/, "Enter a phone number using digits, spaces and +.")
    .optional(),
  area: z
    .string()
    .optional()
    .refine((v) => !v || Boolean(areaBySlug(v)), "Choose a practice area from the list."),
  message: z
    .string()
    .trim()
    .min(10, "Tell us a little more about your matter (at least 10 characters).")
    .max(5000, "Keep your message under 5,000 characters."),
  consent: z.boolean().refine((v) => v, "Confirm that we may use your details to respond."),
  // Honeypot: real people never see or fill this field.
  website: z.string().optional(),
  "cf-turnstile-response": z.string().default(""),
});

export const server = {
  contact: defineAction({
    accept: "form",
    input: contactSchema,
    handler: async (input, context) => {
      // Honeypot filled: treat as a bot. Report success so it learns nothing, but send nothing.
      if (input.website) return { ok: true as const };

      const ip = context.request.headers.get("CF-Connecting-IP");
      const human = await verifyTurnstile(input["cf-turnstile-response"], env.TURNSTILE_SECRET_KEY, ip);
      if (!human) {
        throw new ActionError({
          code: "FORBIDDEN",
          message: "We could not confirm the security check. Refresh the page and try again.",
        });
      }

      const to = env.CONTACT_TO_EMAIL || site.email;
      const lines = [
        `Name: ${input.name}`,
        `Email: ${input.email}`,
        `Phone: ${input.phone || "Not given"}`,
        `Practice area: ${(input.area && areaBySlug(input.area)?.name) || "Not chosen"}`,
        "",
        input.message,
        "",
        "Consent: the sender agreed to the privacy notice.",
      ];

      try {
        await sendEmail(
          {
            to,
            replyTo: input.email,
            subject: `Website enquiry from ${input.name}`,
            text: lines.join("\n"),
          },
          {
            apiKey: env.RESEND_API_KEY,
            // Sender is website@<site.url hostname>; that domain must be verified with Resend.
            from: `${site.shortName} website <website@${new URL(site.url).hostname.replace(/^www\./, "")}>`,
          },
        );
      } catch (error) {
        // Never log the message body (POPIA). The error carries only provider status.
        console.error(
          "[contact] send failed:",
          error instanceof EmailError ? error.message : "unknown error",
        );
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Your message could not be sent.",
        });
      }

      return { ok: true as const };
    },
  }),
};
