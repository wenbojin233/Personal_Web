const env = {
  apiUrl: (import.meta.env.VITE_LLM_API_URL || "/api/chat").trim(),
};

export const DEFAULT_CHAT_COPY = {
  idlePlaceholder: "可以问我关于 Wenbo Jin 的背景、经历和项目。",
  thinkingPlaceholder: "\u6b63\u5728\u601d\u8003\u4e2d...",
  readyPlaceholder: "\u7ee7\u7eed\u63d0\u95ee...",
  retryPlaceholder: "\u8bf7\u91cd\u8bd5...",
  errorPrefix: "\u9519\u8bef\uff1a",
};

function ensureChatConfig() {
  if (!env.apiUrl) {
    throw new Error("\u8bf7\u5148\u5728 .env.local \u4e2d\u914d\u7f6e VITE_LLM_API_URL");
  }
}

export async function streamChatCompletion({ query, onStart, onChunk }) {
  ensureChatConfig();

  const response = await fetch(env.apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
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
