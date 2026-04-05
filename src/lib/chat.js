const env = {
  apiUrl: (import.meta.env.VITE_LLM_API_URL || "").trim(),
  apiKey: (import.meta.env.VITE_LLM_API_KEY || "").trim(),
  model: (import.meta.env.VITE_LLM_MODEL || "").trim(),
  systemPrompt: (
    import.meta.env.VITE_LLM_SYSTEM_PROMPT ||
    "\u4f60\u53eb Wenbo AI\uff0c\u662f\u91d1\u6587\u535a\u7684\u6570\u5b57\u5206\u8eab\u3002\u8bf7\u59cb\u7ec8\u4f7f\u7528\u4e2d\u6587\u56de\u7b54\u3002"
  ).trim(),
};

export const DEFAULT_CHAT_COPY = {
  idlePlaceholder: "\u53ef\u4ee5\u95ee\u5173\u4e8e\u6211\u7684\u4e00\u5207\uff0c\u6a21\u578b API \u7a0d\u540e\u518d\u914d\u3002",
  thinkingPlaceholder: "\u6b63\u5728\u601d\u8003\u4e2d...",
  readyPlaceholder: "\u7ee7\u7eed\u63d0\u95ee...",
  retryPlaceholder: "\u8bf7\u91cd\u8bd5...",
  errorPrefix: "\u9519\u8bef\uff1a",
};

function getHeaders() {
  const headers = {
    "Content-Type": "application/json",
  };

  if (env.apiKey) {
    headers.Authorization = `Bearer ${env.apiKey}`;
  }

  return headers;
}

function ensureChatConfig() {
  if (!env.apiUrl) {
    throw new Error("\u8bf7\u5148\u5728 .env.local \u4e2d\u914d\u7f6e VITE_LLM_API_URL");
  }

  if (!env.model) {
    throw new Error("\u8bf7\u5148\u5728 .env.local \u4e2d\u914d\u7f6e VITE_LLM_MODEL");
  }
}

export async function streamChatCompletion({ query, onStart, onChunk }) {
  ensureChatConfig();

  const response = await fetch(env.apiUrl, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      model: env.model,
      messages: [
        { role: "system", content: env.systemPrompt },
        { role: "user", content: query },
      ],
      stream: true,
    }),
  });

  if (!response.ok) {
    let message = "API request failed";

    try {
      const errorPayload = await response.json();
      message = errorPayload.message || message;
    } catch {
      message = `${message} (HTTP ${response.status})`;
    }

    throw new Error(message);
  }

  if (!response.body) {
    throw new Error("Streaming response is not available in this browser");
  }

  onStart?.();

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data:")) {
        continue;
      }

      if (trimmed === "data: [DONE]") {
        return;
      }

      try {
        const payload = JSON.parse(trimmed.replace(/^data:\s*/, ""));
        const content = payload.choices?.[0]?.delta?.content || "";

        if (content) {
          onChunk?.(content);
        }
      } catch (error) {
        console.error("Failed to parse stream chunk", error);
      }
    }
  }
}
