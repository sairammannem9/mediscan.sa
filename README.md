# SA Doctor Scan (Starter)

A tiny full‑stack starter you can upload to Rocket.ai (or run locally) for your health-scanner website:

- **/public/index.html** – simple UI (scan symptom, scan medicine, ask a question)
- **/public/app.js** – front‑end that sends requests to the backend
- **/public/styles.css** – minimal styling
- **/server.js** – Node/Express server with two endpoints:
  - `POST /api/ask` – forwards a text question to OpenAI
  - `POST /api/scan` – forwards an image + mode ("symptom" or "medicine") to OpenAI Vision
- **.env.example** – where to put your `OPENAI_API_KEY`

## Quick start (local)

1) Install Node 18+
2) In this folder, run:
```
npm install
cp .env.example .env
# edit .env and paste your key
npm run dev
```
3) Open http://localhost:5173
4) Try the three flows.

## Deploying on Rocket.ai
- Create a new project → upload this zip.
- In **Settings → Environment**, add `OPENAI_API_KEY` with your key.
- Press **Build/Run**. Use the **Preview** URL.

> **Note:** This is a starter. It does not diagnose conditions. Always show a medical disclaimer and advise users to consult a professional for serious concerns.
