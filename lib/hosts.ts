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

export function safeInternalPath(value: string | undefined) {
  if (!value) return undefined;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return undefined;
  if (value.includes("://") || value.includes("\\")) return undefined;
  return value;
}

function isLocalHost(hostname: string) {
  return hostname === "localhost" || hostname.endsWith(".localhost") || hostname === "127.0.0.1";
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
    const host = forwarded.split(",")[0]?.trim().toLowerCase() ?? "";
    const [hostname, port] = host.split(":");
    if (url.hostname !== hostname) return false;
    const local = isLocalHost(hostname);
    const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
    const requestProtocol =
      forwardedProto === "http" || forwardedProto === "https"
        ? `${forwardedProto}:`
        : local
          ? "http:"
          : "https:";
    if (url.protocol !== requestProtocol) return false;
    const originPort = url.port || (url.protocol === "https:" ? "443" : "80");
    const requestPort = port || (requestProtocol === "https:" ? "443" : "80");
    return originPort === requestPort;
  } catch {
    return false;
  }
}

export function isAllowedAppOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    const hostname = url.hostname;
    const local = isLocalHost(hostname);
    if (local) return url.protocol === "http:" || url.protocol === "https:";
    if (url.protocol !== "https:") return false;
    return APEX_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}
