# Pamungkas.org — Digital Residue

A retro-terminal portfolio, quest log, and digital residue terminal for **Satriyo Pamungkas** (System Architect / Software Developer).

Built with **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Cloudflare Pages Functions**.

---

## Features

- **Retro Game & CRT Aesthetics:** 8-bit palette, scanlines, pixel typography, and inventory navigation hotkeys (`[1]`, `[2]`, `[3]`, `[ESC]`).
- **Live GitHub Activity Streams:** Dynamic fetching of repositories, push events, and recent commit history with in-memory caching and request deduplication.
- **Secure Cloudflare Edge Proxy:** Hardened Cloudflare Pages Functions reverse proxying GitHub API with strict route/method whitelisting and edge caching headers.
- **XSS-Safe Markdown Rendering:** Markdown view for project READMEs, developer bio, and chronicles sanitized via DOMPurify.

---

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`)
- **Backend / Edge Functions:** Cloudflare Pages Functions (`@cloudflare/workers-types`)
- **Markdown & Security:** Marked, DOMPurify

---

## Local Development

### Prerequisites

- Node.js (v20+ recommended)
- npm

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/satriyop/pamungkas.org.git
   cd pamungkas.org
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables (Optional):**
   Copy `.env.example` to `.env` or `.dev.vars`:
   ```bash
   cp .env.example .env
   ```
   Add a GitHub Personal Access Token (`GITHUB_TOKEN`) to avoid GitHub API rate limits.

4. **Run the Development Server:**
   - **Frontend Only (Vite):**
     ```bash
     npm run dev
     ```
   - **Full-Stack with Cloudflare Functions Proxy (Wrangler):**
     ```bash
     npm run dev:full
     ```

5. **Type Check & Build:**
   ```bash
   npm run build
   ```

---

## Deployment

This site is designed for zero-config deployment on **Cloudflare Pages**:
- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Functions directory:** `functions`
- **Environment variables:** Set `GITHUB_TOKEN` in Cloudflare Pages Dashboard under **Settings > Environment Variables**.
