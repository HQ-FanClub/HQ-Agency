# FORMA Studio v2 — Design-first test build

A separate, deliberately non-production prototype in **\`forma-studio/\`**. Keeps the existing HQ Agency and your live FORMA deployments untouched.

## What is implemented

- Original responsive editorial app UI: Studio, Projects, Assets, Usage, Pricing, Settings.
- Creative specialist conversations backed by your existing Cloudflare Ollama Worker.
- User/agent message separation, formatted headings, copy, progress clock, stop, retry, scroll preservation.
- Procedural vector design engine: three distinct editable SVG poster compositions, custom text/palette/aspect ratio, downloadable SVG and raster PNG. **These are generated programmatically, not by an image diffusion model**.
- Optional NVIDIA FLUX/SD3 image generation gateway, using **server-side credentials only**. Status and failure shown rather than fabricated results.
- Projects and conversations in browser localStorage, JSON import/export.
- Local counts of successful chats, layouts, images and failed requests. They **do not** represent provider billed usage.
- Pricing screens are concept-only, with no payments or subscriptions.

## Windows: one-click setup (NEW)

1. Download the latest branch ZIP and extract.
2. Open the nested `forma-studio` folder.
3. Double-click `START-FORMA.bat` (no npm install).
4. Visit `http://localhost:3210` (the launcher should open it).
5. In **Settings → Image / video backend → Connect NVIDIA privately**, paste **freshly rotated** NVIDIA key(s) and click **Save keys locally**. You do not have to edit any source code or environment file.
6. Keep the black startup window open and test **Studio → Generate AI image**.

The local setup API accepts up to 30 keys separated by commas or newlines, stores them **only in the local `.env`** and activates them immediately. It accepts requests only from the matching localhost web origin. The source repository and downloads contain no API keys. No real provider image was generated during automated testing; availability depends on NVIDIA service, entitlement and quotas. **All keys previously shared in chats should be revoked, not reused.**

The local server serves only `index.html`, `app.js`, `design.js`, and `styles.css`. It explicitly blocks browser access to `.env` and other sensitive local files.

## Quick start — one command

Requires Node.js 20+.

1. Download this branch from GitHub as ZIP.
2. Extract and open PowerShell **inside the \`forma-studio\` folder**.
3. Run \`node server.cjs\`
4. Open http://localhost:3210

Ollama calls are proxied by the local server to your existing Cloudflare Worker. If its origin restriction changes, set \`FORMA_FRONTEND_ORIGIN\` in local \`.env\` and fix the Worker origin policy server-side. This proxy is for private LOCAL testing, not production authentication.

For **real NVIDIA images**, create \`forma-studio/.env\` using \`.env.example\`, insert **newly rotated** provider keys and restart the local server. No API keys may be stored in the client, copied into HTML/JS, or committed to GitHub. Image endpoints/entitlements have **not** been verified live. NVIDIA may reject requests due to API access, policy, quota, cost, or changed endpoints.

For editing graphics offline, the app works even without any API key.

## Hosted Cloudflare version

These static files can be deployed to Cloudflare Workers static assets for browsing, editable SVG layout creation and downloads. A static Cloudflare HTTPS site **cannot reliably call an unprotected http://localhost:3000 on a user's PC**. Use a secure authenticated gateway or private tunnel to an image engine, with a proper origin policy. Do not expose your NVIDIA/LTX keys or your laptop's local engine to the public Internet.

Cloudflare Ollama Worker is currently configured to allow only https://forma-creative-os.hqd.workers.dev. Test the frontend on that exact origin or adjust allowed origins securely. **CORS is not authentication**.

## GPU path for RTX 4050 laptop

Many laptop RTX 4050s have 6 GB VRAM. Use optimized SD 1.5 or SDXL in low-VRAM mode via ComfyUI, with a local gateway API. Avoid trying to run unoptimized 10 GB CompVis SD v1 code. ComfyUI integration is a future provider adapter; **not already wired into this package**.

## Production gates

Rotate all credentials found in shared old \`.env\` files (NVIDIA keys, LTX key, Supabase secret). All 18 NVIDIA keys in the shared file must be considered compromised. Revoke them and use new secrets. Implement real user login, server-enforced quotas, trusted origin policy, durable rate limiting, image storage, provider reconciliation, persistent DB, real billing, and end-to-end QA before public launch. **Do not deploy local \`.env\`**.

No actual real money pricing or billing integration is included. Image-to-video is documented in the existing HQ Vision engine but not integrated in this v2 UI. This is a private test milestone, not the full finished production system.
