# React + Vite Homepage

## Start

```bash
npm install
npm run dev
```

## LLM config

This project now uses a Cloudflare Pages Function as the server-side proxy for Kimi.

### Cloudflare Pages production

In your Cloudflare dashboard, open your Pages project and set these under `Settings > Variables and Secrets`:

```bash
KIMI_API_KEY=your_kimi_cn_api_key
KIMI_MODEL=kimi-k2.5
```

Redeploy after saving the secret/variables so the function can read them.

The full "金文博助手" prompt is now built into the project defaults. Only add `KIMI_SYSTEM_PROMPT` if you want to override it.

### Local development

`npm run dev` now includes a Vite-side dev proxy for `/api/chat`. Put these into `.env.local`:

```bash
VITE_LLM_API_URL=/api/chat
KIMI_API_KEY=your_kimi_cn_api_key
KIMI_MODEL=kimi-k2.5
```

The browser still only calls `/api/chat`. In local development, Vite handles that route; on Cloudflare Pages, `functions/api/chat.js` handles it.

## Notes

- Do not put `KIMI_API_KEY` into any `VITE_*` variable. `VITE_*` values are exposed to the browser.
- Cloudflare Pages Functions read secrets and environment variables from `context.env`.
