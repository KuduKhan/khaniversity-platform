/**
 * Browser CSRF protection across Next.js hosting and trusted reverse proxies.
 * Request.url can be normalized to an internal hostname by Next.js. Compare
 * Origin against the incoming Host and forwarded protocol instead.
 *
 * Missing Origin fails closed. This does NOT replace session authorization.
 */
export function isSameOriginRequest(request: Request): boolean {
  const source = request.headers.get("origin");
  if (!source) return false;
  try {
    const parsed = new URL(source);
    if (parsed.username || parsed.password || !["http:", "https:"].includes(parsed.protocol))
      return false;
    const actual = new URL(request.url);
    const host = request.headers.get("host") ||
      request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
      actual.host;
    const scheme = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
      actual.protocol.slice(0, -1);
    return parsed.host.toLowerCase() === host.toLowerCase() &&
      parsed.protocol.toLowerCase() === `${scheme.toLowerCase()}:`;
  } catch {
    return false;
  }
}
