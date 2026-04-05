import { Readable } from "node:stream";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { DEFAULT_MODEL, DEFAULT_SYSTEM_PROMPT } from "./shared/assistantConfig.js";

const KIMI_API_URL = "https://api.moonshot.cn/v1/chat/completions";

function sendJson(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(data));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";

    req.on("data", (chunk) => {
      raw += chunk;
    });

    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });

    req.on("error", reject);
  });
}

function kimiDevProxy(env) {
  return {
    name: "kimi-dev-proxy",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const pathname = req.url?.split("?")[0];
        if (pathname !== "/api/chat") {
          next();
          return;
        }

        if (req.method === "OPTIONS") {
          res.statusCode = 204;
          res.setHeader("Allow", "POST, OPTIONS");
          res.setHeader("Cache-Control", "no-store");
          res.end();
          return;
        }

        if (req.method !== "POST") {
          sendJson(res, 405, { message: "Method not allowed." });
          return;
        }

        if (!env.KIMI_API_KEY) {
          sendJson(res, 500, { message: "Missing KIMI_API_KEY in .env.local." });
          return;
        }

        let payload;
        try {
          payload = await readJsonBody(req);
        } catch {
          sendJson(res, 400, { message: "Invalid JSON body." });
          return;
        }

        const query = typeof payload?.query === "string" ? payload.query.trim() : "";
        if (!query) {
          sendJson(res, 400, { message: "Query is required." });
          return;
        }

        try {
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
          });

          if (!upstream.ok) {
            let message = `Kimi API request failed (HTTP ${upstream.status})`;

            try {
              const errorPayload = await upstream.json();
              message = errorPayload?.error?.message || errorPayload?.message || message;
            } catch {
              // Keep the fallback message when the upstream error body is not JSON.
            }

            sendJson(res, upstream.status, { message });
            return;
          }

          res.statusCode = upstream.status;
          res.setHeader(
            "Content-Type",
            upstream.headers.get("Content-Type") || "text/event-stream; charset=utf-8"
          );
          res.setHeader("Cache-Control", "no-store");

          if (!upstream.body) {
            res.end();
            return;
          }

          Readable.fromWeb(upstream.body).pipe(res);
        } catch (error) {
          sendJson(res, 500, {
            message: error instanceof Error ? error.message : "Kimi proxy failed.",
          });
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), kimiDevProxy(env)],
  };
});
