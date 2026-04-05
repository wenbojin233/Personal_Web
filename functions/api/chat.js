import { DEFAULT_MODEL, DEFAULT_SYSTEM_PROMPT } from "../../shared/assistantConfig.js";

const KIMI_API_URL = "https://api.moonshot.cn/v1/chat/completions";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      Allow: "POST, OPTIONS",
      "Cache-Control": "no-store",
    },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.KIMI_API_KEY) {
    return json(
      {
        message: "Cloudflare Pages secret KIMI_API_KEY is not configured.",
      },
      500
    );
  }

  let payload;

  try {
    payload = await request.json();
  } catch {
    return json({ message: "Invalid JSON body." }, 400);
  }

  const query = typeof payload?.query === "string" ? payload.query.trim() : "";
  if (!query) {
    return json({ message: "Query is required." }, 400);
  }

  const upstream = await fetch(KIMI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.KIMI_API_KEY}`,
    },
    body: JSON.stringify({
      model: env.KIMI_MODEL || DEFAULT_MODEL,
      messages: [
        {
          role: "system",
          content: env.KIMI_SYSTEM_PROMPT || DEFAULT_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: query,
        },
      ],
      stream: true,
    }),
    signal: request.signal,
  });

  if (!upstream.ok) {
    let message = `Kimi API request failed (HTTP ${upstream.status})`;

    try {
      const errorPayload = await upstream.json();
      message = errorPayload?.error?.message || errorPayload?.message || message;
    } catch {
      // Ignore parse failures and keep the fallback error message.
    }

    return json({ message }, upstream.status);
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("Content-Type") || "text/event-stream; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
