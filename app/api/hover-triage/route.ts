import {
  buildHoverRequest,
  localHoverTriage,
  normalizeHoverResult,
  parseHoverInput,
} from "@/lib/hover-triage";

const allowedOrigin = (origin: string | null) =>
  !origin || origin.startsWith("chrome-extension://") || /^http:\/\/localhost:\d+$/.test(origin);

const responseHeaders = (origin: string | null) => ({
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Origin": origin && allowedOrigin(origin) ? origin : "http://localhost:3000",
  "Cache-Control": "private, max-age=300",
  Vary: "Origin",
});

export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin");
  return new Response(null, { status: allowedOrigin(origin) ? 204 : 403, headers: responseHeaders(origin) });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (!allowedOrigin(origin)) {
    return Response.json({ error: "Origin not allowed." }, { status: 403, headers: responseHeaders(origin) });
  }

  let input;
  try {
    input = parseHoverInput(await request.json());
  } catch {
    input = null;
  }

  if (!input) {
    return Response.json({ error: "A subject or snippet is required." }, { status: 400, headers: responseHeaders(origin) });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || "google/gemini-3.1-flash-lite";
  if (!apiKey) {
    return Response.json(localHoverTriage(input), { headers: responseHeaders(origin) });
  }

  try {
    const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com/AadhikR/indox-triage",
        "X-Title": "Inbox Triage",
      },
      body: JSON.stringify(buildHoverRequest(input, model)),
      signal: AbortSignal.timeout(8_000),
    });

    if (!openRouterResponse.ok) throw new Error(`OpenRouter returned ${openRouterResponse.status}.`);
    const data = await openRouterResponse.json();
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== "string") throw new Error("OpenRouter returned no hover analysis.");

    return Response.json(
      { ...normalizeHoverResult(JSON.parse(content)), source: "ai" },
      { headers: responseHeaders(origin) },
    );
  } catch (error) {
    console.error("Hover analysis failed; using local fallback.", error);
    return Response.json(localHoverTriage(input), { headers: responseHeaders(origin) });
  }
}
