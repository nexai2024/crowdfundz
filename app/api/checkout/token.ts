import { createHmac } from "crypto";

export function createBackerToken(email: string): string {
  const secret = process.env.BETTER_AUTH_SECRET || "default_secret";
  const hmac = createHmac("sha256", secret);
  hmac.update(email);
  return hmac.digest("hex");
}
