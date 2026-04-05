# React + Vite Homepage

## Start

```bash
npm install
npm run dev
```

## LLM config

1. Copy `.env.example` to `.env.local`
2. Fill `VITE_LLM_API_URL`
3. Fill `VITE_LLM_MODEL`
4. `VITE_LLM_API_KEY` can stay empty if your provider does not require it

The current chat helper assumes an OpenAI-compatible `chat/completions` streaming API. If you switch to a different protocol, update `src/lib/chat.js`.
