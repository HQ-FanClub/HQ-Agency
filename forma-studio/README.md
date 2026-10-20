# FORMA Creative Lab v3 · Private test build

A **visual-first** experimental studio inspired by the workflow category of professional generative media tools, not an identical clone of their UI or proprietary models.

## What you can actually do now

- **Image Studio:** send a prompt to your own configured NVIDIA API, choose FLUX Schnell, FLUX Dev, or SD3 Medium (legacy endpoint) and output aspect ratio; preview genuine provider-returned image and download PNG. If no key is configured, app clearly says so and takes you to Connections. **Image generation requires provider access and may use paid/free quota. Not automatically free.**
- **Motion Studio:** import JPG/PNG/WebP or use generated image, choose six camera moves, render a *real downloadable WebM video file* locally via browser Canvas and MediaRecorder. This is animated still-image camera motion, **not diffusion-based AI motion or coherent newly generated content**. Chrome/Edge support required.
- **My Creations:** gallery of generated images/video outputs during the active browser session. Download anything important.
- **Creative Team:** separate Ollama-backed assistant screen with ten role choices. Calls your existing Cloudflare Worker through the loopback gateway.
- **Usage:** counts successful images, motion exports, AI messages and failed actions from this browser, NOT provider billing.
- **Pricing:** honest concept-only plans; no checkout, subscription or payment integration.
- **Connections:** set freshly issued NVIDIA key(s) via form. They are POSTed to local localhost server and saved in local \`.env\`. Key values are not embedded in HTML/JS, nor written to localStorage.

## Start on Windows

1. Download latest branch ZIP at https://github.com/HQ-FanClub/HQ-Agency/archive/refs/heads/forma-cinema-v3.zip
2. Extract ZIP. Open the **forma-studio** folder in the extracted tree.
3. Double-click **START-FORMA.bat**. Node.js version 20+ is required, no npm packages.
4. Open **http://localhost:3210**.
5. Connections → NVIDIA image engine: create **new** NVIDIA key(s) and paste into local field, click Save locally. Do **not** reuse any keys previously pasted in a chat.
6. Image Studio → enter prompt → Generate image.
7. Motion Studio → Use last generation or Upload image → pick motion → Render motion clip → Download video.

No public website has been updated by this code branch. Only the local test version is configured.

**If provider says HTTP 401, 403, 404, 422, or 429**, these indicate rejected credentials, lack of model entitlement, changed endpoint/request schema, or rate/credit quota. A saved key does not guarantee image generation. No live NVIDIA call was performed during this code build.

## Tech and trust boundaries

- Local Node 20+ HTTP server binds **127.0.0.1** and offers a small **static asset allowlist**; it must never serve \`.env\`, repository metadata, or arbitrary disk files.
- Server routes: \`GET /api/health\`, \`POST /api/local-keys\`, \`POST /api/generate\`, \`POST /api/chat\`.
- Browser requests are same-origin to **http://localhost:3210**. Do not add keys to client-side JavaScript.
- The public GitHub repository is not a safe place for keys. The private \`.env\` is git-ignored.
- *CORS is not authentication.* Before production: implement user auth and session scopes, backend quotas and abuse prevention, durable media storage, payment provider + real usage reconciliation, secure hosting, logging, consent and privacy controls.
- RTX 4050 can run optimized local diffusion workflows, e.g. ComfyUI under low VRAM. That separate adapter is **not implemented in this build**.
- Generative video models from Higgsfield, LTX, Kling, Sora, etc. are **not available** inside this source yet. Local camera-motion exporting is functional in browsers supporting MediaRecorder; provider AI video integration requires a separately funded API and backend work.

## Key safety

The old shared .env and 21 posted NVIDIA API keys are exposed. Revoke and reissue **all keys shared outside private local storage**, including LTX/Supabase secrets where relevant. This repository never stores any of them.

## Verification status

JavaScript syntax and code wiring have been inspected; a real browser render, live NVIDIA generation and WebM encoding on your specific laptop have **not** been tested by the assistant. This is a test milestone rather than a production launch.
