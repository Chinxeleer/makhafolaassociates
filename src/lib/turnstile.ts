// Server-side verification of a Cloudflare Turnstile token.
export async function verifyTurnstile(
  token: string,
  secret: string | undefined,
  remoteIp: string | null,
): Promise<boolean> {
  if (!secret || !token) return false;
  const body = new FormData();
  body.append("secret", secret);
  body.append("response", token);
  if (remoteIp) body.append("remoteip", remoteIp);

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body,
  });
  if (!response.ok) return false;
  const result = (await response.json()) as { success?: boolean };
  return result.success === true;
}
