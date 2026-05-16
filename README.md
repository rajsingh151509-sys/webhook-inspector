# Webhook Inspector

A self-hosted alternative to webhook.site. Deploy once, get a permanent URL for capturing and inspecting HTTP requests from external systems.

## What it does

- Generates unique endpoint URLs (e.g. `https://your-app.vercel.app/api/hook/abc123xyz`)
- Captures every incoming request — method, path, headers, query params, body, source IP
- Live UI to browse captured requests, auto-refreshes every 3 seconds
- Pretty-prints JSON bodies
- Keeps the last 100 requests per bin, 30-day TTL on inactive bins

## Deploy to Vercel (one-time setup, ~10 minutes)

### 1. Push this folder to a new GitHub repo

```bash
cd webhook-inspector
git init
git add .
git commit -m "Initial commit"
# Create a new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/webhook-inspector.git
git branch -M main
git push -u origin main
```

### 2. Import to Vercel

1. Go to https://vercel.com/new
2. Import your `webhook-inspector` repo
3. Click **Deploy** (accept all defaults — Next.js auto-detects)
4. Wait for the build to finish

### 3. Add storage

The app uses Vercel KV (Redis) to persist captured requests.

1. In your Vercel project, go to the **Storage** tab
2. Click **Create Database** → **KV** → name it `webhook-store` → Create
3. Click **Connect Project** to link it to your webhook-inspector project
4. Vercel auto-injects the env vars. Go to **Deployments** → click the latest → **Redeploy** to pick them up.

### 4. Use it

1. Visit your deployed URL (e.g. `https://webhook-inspector-xyz.vercel.app`)
2. Click **Create new endpoint**
3. Copy the URL and share it with whichever system needs to send you requests
4. Watch requests appear live

## Quick test

```bash
curl -X POST https://your-app.vercel.app/api/hook/YOUR_BIN_ID \
  -H "Content-Type: application/json" \
  -d '{"event": "test", "value": 42}'
```

Refresh the bin page — you'll see the request captured.

## Notes

- Bin URLs are random 10-character IDs. Treat them as semi-secret — anyone with the URL can send requests to it. Don't post them publicly.
- The receiver always returns `{ok: true}` with HTTP 200. If you need to simulate specific status codes back to the caller, you'll need to extend the handler.
- Body is captured as raw text. Binary payloads will appear as garbled text — most webhooks are JSON/form-encoded so this is fine.
- Max body size is whatever Vercel's serverless function limit allows (4.5 MB on Hobby tier).

## Local dev

```bash
npm install
# Set up local KV via Vercel CLI or use upstash directly
npm run dev
```

## Cost

Vercel Hobby tier + Vercel KV free tier covers this comfortably for normal partner-integration testing volumes (free tier KV: 30k commands/day, 256MB).
