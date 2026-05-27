# 🛡️ ModKit — AI-Powered Reddit Mod Assistant

> **Reddit Mod Tools & Migrated Apps Hackathon** — Best New Mod Tool Category

ModKit is a unified moderation assistant built on [Devvit](https://developers.reddit.com/docs/devvit) that brings AI-powered toxicity detection, duplicate post identification, and intelligent mod action suggestions directly into the Reddit moderation experience.

---

## ✨ Features

| Feature | Description |
|---|---|
| **AI Toxicity Alerts** | Groq scores every post 0–100% and flags hate speech, harassment, spam, and more |
| **Duplicate Detection** | pgvector cosine similarity catches reposts before they clog the queue |
| **Smart Mod Queue** | Prioritised queue view with AI analysis badges baked in |
| **AI Suggestions** | One-tap approve/remove/warn actions with confidence scores |
| **Mod Dashboard** | At-a-glance stats: queue depth, alerts today, dupes & toxic posts this week |

---

## 🗂️ Project Structure

```
## Project Structure
modkit/
├── backend/ # Legacy Node.js + Express API (deployed to Vercel)
│ └── ⚠️ Optional – Kept for legacy support, not required for core features
└── devvit-app/ # Reddit Devvit Web app – runs entirely on Reddit
 └── server/ # Hono server, UI entrypoint (index.ts) – handles all AI & database logic
├── devvit.json # App configuration
└── package.json

---

## 🔧 Usage

### Analyzing a Post
1. Open any post in your subreddit
2. Click the **⋯ more options** menu
3. Select **🔍 Analyze with ModKit**
4. A toast shows the toxicity level and whether a duplicate was found
5. Open the **ModKit Dashboard** to see full analysis + AI suggestions

### Opening the Dashboard
- Go to **Mod Tools** in your subreddit sidebar
- Click **🛡️ Open ModKit Dashboard**
- A pinned post is created with the live dashboard

### Dashboard Tabs
- **📋 Queue** — sorted list of recent posts with AI badges; tap any row for details + action chips
- **🚨 Alerts** — posts that crossed your toxicity threshold
- **📊 Stats** — weekly summary numbers

---

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Reddit App | `@devvit/web` (Hono) – TypeScript |
  Reddit Developer Platform
| Backend | Node.js + Express + TypeScript |
| Hosting | Vercel (serverless) |
| AI |   Groq (`llama-3.3-70b-versatile`) |
| Database | Supabase (PostgreSQL + pgvector) |

---

## 📄 License

MIT — built for the Reddit Mod Tools & Migrated Apps Hackathon 2026.
