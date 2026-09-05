# Gokul Dhara Society — Ganapati Chanda Manager

React app to manage pandal money flow for **Gokul Dhara Society**.

## Features

- **Login** — only authorized committee members can open the app
- **Collect Chanda** — donor name, mobile, wing, room, amount; saves the record and opens WhatsApp with a digital receipt ready to send
- **Dashboard** — total donations, total expenses, remaining balance
- **Donations** — search, resend receipt, delete
- **Expenses** — record festival spending by category
- Mobile-friendly layout with bottom navigation on phones

Data is stored in the browser (`localStorage`) on this device.

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Live site

After GitHub Pages is enabled (Settings → Pages → Source: **GitHub Actions**):

**https://pranshu1009.github.io/Ganapati_2026/**

## Shared login (everyone uses the same)

- **Username:** `gokuldhara`
- **Password:** `ganapati2026`

## Receipts

After saving a donation, WhatsApp Web/App opens with a pre-filled receipt for the donor’s number. Tap **Send** to deliver it. Resend anytime from the Donations page.
