const APEX_DOMAINS = ["crowdventure.quest", "venturesolo.quest"] as const;

export function rootHostname(host: string): string {
  const hostname = host.split(":")[0] ?? "localhost";
  if (hostname === "localhost" || hostname.endsWith(".localhost")) {
    return "localhost";
  }

  for (const domain of APEX_DOMAINS) {
    if (hostname === domain || hostname.endsWith(`.${domain}`)) {
      return domain;
    }
  }

  const parts = hostname.split(".");
  if (parts.length < 2) return hostname;
  return parts.slice(-2).join(".");
}

export function isOnCreatorHost(host: string, subdomain: string): boolean {
  const hostname = host.split(":")[0] ?? "";
  return hostname === `${subdomain}.${rootHostname(host)}`;
}

export function platformUrl(host: string): string {
  const port = host.includes(":") ? `:${host.split(":")[1]}` : "";
  const root = rootHostname(host);
  const protocol = root === "localhost" ? "http" : "https";
  return `${protocol}://${root}${port}`;
}

export function creatorUrl(host: string, subdomain: string, path = ""): string {
  const hostname = host.split(":")[0] ?? "localhost";
  const port = host.includes(":") ? host.split(":")[1] : "";
  const root = rootHostname(host);
  const protocol =
    root === "localhost" || hostname === "localhost" || hostname.endsWith(".localhost")
      ? "http"
      : "https";
  const portSuffix = port ? `:${port}` : "";
  return `${protocol}://${subdomain}.${root}${portSuffix}${path}`;
}

export function isSameOriginRequest(request: Request): boolean {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin") return false;

  const origin = request.headers.get("origin");
  if (!origin || !isAllowedAppOrigin(origin)) return false;

  const forwarded = request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (!forwarded) return false;

  try {
    const url = new URL(origin);
    const host = forwarded.split(",")[0]?.trim() ?? "";
    const [hostname, port] = host.split(":");
    if (url.hostname !== hostname) return false;
    const originPort = url.port || (url.protocol === "https:" ? "443" : "80");
    const requestPort = port || (url.protocol === "https:" ? "443" : "80");
    return originPort === requestPort;
  } catch {
    return false;
  }
}

export function isAllowedAppOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    const hostname = url.hostname;
    if (hostname === "localhost" || hostname.endsWith(".localhost")) return true;
    return APEX_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}
