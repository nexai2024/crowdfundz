const RESERVED = new Set([
  "www",
  "api",
  "app",
  "admin",
  "mail",
  "static",
  "assets",
  "localhost",
  "crowdventure",
  "venturesolo",
]);

const SUBDOMAIN_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,30}[a-z0-9])?$/;

export function normalizeSubdomain(value: string): string {
  return value.trim().toLowerCase();
}

const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,48}[a-z0-9])?$/;

export function normalizeSlug(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}

export function slugError(value: string): string | null {
  const slug = normalizeSlug(value);
  if (!SLUG_PATTERN.test(slug)) {
    return "Use 1–50 letters, numbers, or hyphens. It cannot start or end with a hyphen.";
  }
  return null;
}

export function subdomainError(value: string): string | null {
  const subdomain = normalizeSubdomain(value);
  if (!SUBDOMAIN_PATTERN.test(subdomain)) {
    return "Use 1–32 letters, numbers, or hyphens. It cannot start or end with a hyphen.";
  }
  if (RESERVED.has(subdomain)) {
    return "That subdomain is reserved.";
  }
  return null;
}
