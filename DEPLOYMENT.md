# Deployment Guide — OptiFit frontend + Apps Script

This guide walks through deploying the Apps Script webhook and the Next.js frontend (recommended: Vercel). It also includes local production commands.

## 1) Apps Script (Google Sheets webhook)

- See `APPS_SCRIPT.md` in the repo for the full script. Key steps:
  1. Open https://script.google.com and create a new project.
 2. Paste the script from `APPS_SCRIPT.md` and set `SPREADSHEET_ID` (already set) and `SHEET_NAME`.
 3. Save and deploy as **Web app** (Execute as: Me, Who has access: Anyone).
 4. Copy the resulting `exec` URL.

## 2) Configure Frontend environment

- Locally (already present): update `.env` with the `NEXT_PUBLIC_APPS_SCRIPT_URL` value (it is in the repo root). Example:
```
NEXT_PUBLIC_APPS_SCRIPT_URL=https://script.google.com/macros/s/XXXXX/exec
```

- In production (Vercel / Netlify / other) set the same env key in the dashboard.

## 3) Local production run (optional)

Install dependencies and build:
```bash
npm install
npm run build
```

Run production server:
```bash
npm start
```

Open `http://localhost:3000` (or whatever port Next shows).

## 4) Deploy to Vercel (recommended)

1. Create a Git repository (GitHub/GitLab/Bitbucket) and push the project.
2. Sign in to https://vercel.com and `New Project` → import your repo.
3. In Project Settings → Environment Variables add:
   - Key: `NEXT_PUBLIC_APPS_SCRIPT_URL`
   - Value: your Apps Script `exec` URL
   - Environment: `Production` (and `Preview` if you want)
4. Leave Build Command as `npm run build` and Output Directory empty (Next auto-detects).
5. Deploy — Vercel will build and publish your app.

## 5) Verify end-to-end

1. Open the deployed site and run a test submission through the UI.
2. Check the Google Sheet — new rows should appear.
3. If no row appears:
   - Verify the Web app `exec` URL is correct in Vercel env
   - Open Apps Script Executions to see errors
   - Ensure the Apps Script deployment has `Who has access: Anyone` if you post from client-side

## 6) Security notes
- For public-facing production, consider adding a shared secret and validating it in `doPost`.
- For high volumes, Apps Script quotas may be limiting — consider a lightweight server that batches writes.

---

If you want, I can:
- Add a `APPS_SCRIPT.md` entry with the exact deployed URL and a curl test in the repository,
- Or I can help connect your GitHub repo to Vercel and set the env vars (you will need to authorize Vercel).
