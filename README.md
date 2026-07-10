# SehatVaani Admin — UI Prototype

A **frontend-only redesign** of the SehatVaani admin panel. Built with Next.js, TypeScript, and Tailwind CSS. Uses mock data — no PHP, database, or backend required.

## Features

- Full admin UI: Dashboard, Medical Records, Billing, Subscriptions, Staff, User Profiles
- Original SehatVaani **sky-blue** design system (`#0ea5e9`)
- Split-screen login, weekly analytics charts, live activity feed
- Command palette (`Ctrl+K` / `⌘K`), notifications, dark mode
- Accordion user profiles with edit modals and CRUD actions
- Settings & Help Center pages

## Demo Login

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `admin@sehatvaani.com` | `admin123` |
| Admin | `rajesh@sehatvaani.com` | `admin123` |

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

1. Import this repo at [vercel.com](https://vercel.com)
2. Framework preset: **Next.js** (auto-detected)
3. Deploy — no environment variables needed

## Project Structure

```
src/
├── app/           # Pages (Next.js App Router)
├── components/    # Layout & UI
├── context/       # Auth, theme, toasts
└── data/          # Mock data
```

## Notes

- Mock data only — mutations reset on page reload
- UI prototype for team review before connecting to the PHP backend
