# Fracto — RACP Divisional Written Examination MCQ Bank

**Fracto** is a clinical multiple-choice question (MCQ) and extended matching question (EMQ) bank web application built for Basic Physician Trainees preparing for the **Royal Australasian College of Physicians (RACP) Divisional Written Examination**.

---

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS (with dynamic CSS-variable Accent Palettes & Dark Mode), `lucide-react` icons
- **Backend**: Next.js Route Handlers (`src/app/api/...`)
- **Database**: SQLite (`prisma/dev.db`) with **Prisma ORM**
- **Transactional Email**: **Resend** (`src/lib/email.ts`) for sending 6-digit One-Time Passcodes (OTP)
- **Data Ingestion & Media**: `csv-parse` + `tsx` CLI utility supporting `.csv` and `.json` question banks (both 4-option `SBA` and up-to-10-option `EMQ` sets), plus `/api/media/[...path]` for serving local clinical figures from `data/images/`

---

## Core Features

1. **Public Clinical Landing Page (`/`) & New Trainee Registration (`/register`)**
   - Visitors land on a clinical overview page (`/`) showcasing the RACP format, sample embedded Brugada ECG figure, and sub-specialty curriculum.
   - New trainees register at `/register` with their **Full Name**, **Hospital/Institutional Email**, **Training Level** (`BPT 1–3`), and **Primary Hospital**, verified via a 6-digit Email One-Time Passcode (OTP) delivered via Resend.
2. **Extended Matching Questions (EMQs) & Single Best Answer (SBA) Formats**
   - **Single Best Answer (`SBA`)**: Classic 4-option (`A`–`D`) clinical vignettes (25 seeded across 5 medical specialties).
   - **Extended Matching Questions (`EMQ`)**: Multi-stem clinical question sets sharing a common **Theme** and up to **10 answer options (`A`–`J`)** (15 seeded across 5 clinical EMQ sets = **40 total questions**).
   - Linked EMQ stems sharing the same `emqGroupId` are kept grouped together in quiz sessions with an interactive **Linked Stems in Set** header switcher.
3. **Trainee Profile, Demographics & Settings Page (`/settings`)**
   - Update **Full Name**, **Email Address** (automatically refreshes the active session cookie), **Training Level**, **Primary Hospital**, **State / Territory** (`NSW`, `VIC`, `QLD`, `WA`, `SA`, `TAS`, `ACT`, `NT`, `NZ`), **Sub-specialty Interest**, and **Mobile Phone**.
   - **Custom Profile Photo**: Upload a photo directly from your device (stored as a data URL), choose from clinical avatar presets, or paste a custom image URL.
4. **Customisable Appearance & Themes (Light/Dark Mode + 5 Colour Highlights)**
   - Switch instantly between **Light Mode** and **Dark Mode** from `/settings` or the quick toggle in the top navigation bar.
   - Choose from **5 Colour Highlight Palettes**:
     - `Clinical Blue` (Default RACP Ocean Blue)
     - `Clinical Emerald` (Surgical Teal/Green)
     - `Royal Violet` (Academic Indigo/Violet)
     - `Crimson Rose` (Cardiology Rose)
     - `Warm Amber` (Diagnostic Gold/Amber)
5. **Target RACP Exam Date & Live Dashboard Countdown (`/dashboard` & `/settings#exam-date`)**
   - Set your target **RACP Divisional Written Examination Date** on `/settings`.
   - Displays a live **Exam Countdown Banner** on `/dashboard` showing exact days remaining, formatted target date, and remaining unseen questions, or a prominent prompt card linking to `/settings#exam-date` when unset.
6. **Embedded Clinical Photos in Question Stems & Explanations (`data/images/`, `ClinicalImage.tsx`)**
   - Supports both local files in `data/images/` (served via `GET /api/media/[...path]`) and external `https://...` URLs, with a built-in **Lightbox Zoom** modal.

---

## Getting Started (Local Development)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables (`.env`)

Create a `.env` file in the root directory (automatically git-ignored):

```env
DATABASE_URL="file:./dev.db"
RESEND_API_KEY="re_your_api_key"
RESEND_FROM_EMAIL="Fracto <noreply@mcq.baal.au>"
```

### 3. Initialize SQLite Database & Seed Questions (25 SBA + 15 EMQ = 40 Questions)

```bash
npm run db:push
npm run db:seed
```

### 4. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## How to Ingest a Real CSV (or JSON) of SBA & EMQ Questions

You can import any custom CSV or JSON file into the SQLite database using [`scripts/ingest-csv.ts`](file:///Users/malephar/Documents/Question%20Bank%20App/scripts/ingest-csv.ts).

### CSV / JSON Columns

| Column | Required | Description |
| :--- | :--- | :--- |
| `id` | Yes | Unique question identifier (e.g., `RACP-CARD-001` or `RACP-EMQ-CARD-001`). Used for idempotent `upsert`. |
| `specialty` | Yes | Medical specialty name (e.g., `Cardiology`, `Gastroenterology`, `Respiratory`). |
| `questionType` | Optional | `"SBA"` (default, 4 options `A`–`D`) or `"EMQ"` (Extended Matching Question, up to 10 options `A`–`J`). |
| `emqGroupId` | Optional | Shared group identifier for linked EMQ stems (e.g., `RACP-EMQ-CARD-01`). |
| `emqTheme` | Optional | Shared clinical theme title displayed at the top of an EMQ set. |
| `optionsJson` | For EMQ | JSON object mapping option letters (`A`–`J`) to option text (e.g. `{"A":"...","B":"...",...,"J":"..."}`). |
| `questionText` | Yes | Full clinical vignette / stem text. |
| `questionImageUrl` | Optional | Path to a file in `data/images/` **or** an external `https://...` URL. |
| `optionA`–`optionD` | For SBA | Text for Options A–D (auto-populated from `optionsJson` for EMQs). |
| `correctAnswer` | Yes | Single letter: `A`–`D` for SBA, or `A`–`J` for EMQ. |
| `explanation` | Yes | Detailed clinical explanation shown immediately after an option is selected. |
| `explanationImageUrl` | Optional | Path to a file in `data/images/` **or** an external `https://...` URL for the explanation panel. |

```bash
npm run ingest -- path/to/your_questions.csv
```
