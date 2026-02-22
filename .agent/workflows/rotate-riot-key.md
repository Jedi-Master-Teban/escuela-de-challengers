---
description: Daily Riot API key rotation on Render (production)
---

## Daily Riot API Key Rotation — Render

Every day before using the live site, rotate the Riot API key. This takes ~2 minutes and has ~30 seconds of downtime on the proxy only (frontend stays up).

### Step 1 — Get a new key

1. Go to https://developer.riotgames.com
2. Log in → click **"Regenerate API Key"** on your app dashboard
3. Copy the new key (format: `RGAPI-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

### Step 2 — Update the key on Render

1. Go to https://dashboard.render.com
2. Click your proxy service (e.g., `academia-proxy`)
3. Click **"Environment"** tab in the left sidebar
4. Find `RIOT_API_KEY` → click the pencil icon → paste the new key → click **"Save Changes"**

### Step 3 — Redeploy the proxy

Render will prompt you to deploy after saving env vars. Click **"Manual Deploy" → "Deploy latest commit"**.

The proxy restarts in ~30 seconds. The frontend (Vercel) is unaffected.

### Step 4 — Verify

Go to https://your-site.vercel.app → open the Summoner Tracker → search for any summoner → confirm data loads.

---

> [!NOTE]
> If you ever get a Production API Key from Riot (requires app review), this daily rotation becomes unnecessary. Apply at: https://developer.riotgames.com/app-type
