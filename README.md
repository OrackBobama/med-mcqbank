# RACP Divisional Written Examination — MCQ Bank

A clinical multiple-choice question (MCQ) bank web application built for Basic Physician Trainees preparing for the **Royal Australasian College of Physicians (RACP) Divisional Written Examination**.

---

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, `lucide-react` icons
- **Backend**: Next.js Route Handlers (`src/app/api/...`)
- **Database**: SQLite (`prisma/dev.db`) with **Prisma ORM**
- **Data Ingestion & Media**: `csv-parse` + `tsx` CLI utility supporting `.csv` and `.json` question banks, plus `/api/media/[...path]` for serving local clinical figures from `data/images/`

---

## Core Features

1. **Public Clinical Landing Page (`/`) & New Trainee Registration (`/register`)**
   - Visitors land on a clinical overview page (`/`) showcasing the 4-option (`A`–`D`) RACP format, sample embedded Brugada ECG figure, and sub-specialty curriculum.
   - New trainees can register at `/register` with their **Full Name**, **Hospital/Institutional Email**, **Training Level** (`BPT 1–3`), and **Primary Hospital**, verified via a 6-digit Email One-Time Passcode (OTP).
   - Returning trainees sign in via `/login` using passwordless 6-digit Email OTP authentication.
2. **Embedded Clinical Photos in Question Stems & Explanations (`data/images/`, `ClinicalImage.tsx`)**
   - Questions and explanations can embed high-resolution diagnostic images (ECGs, HRCT chest scans, continuous-wave Doppler profiles, and pathophysiology diagrams).
   - Supports **both**:
     - **Local files** stored inside `data/images/` (e.g., `data/images/brugada_ecg.svg` or `brugada_ecg.svg`), served automatically via `GET /api/media/[...path]`
     - **External URLs** (`https://...`)
   - Includes a built-in **Enlarge Figure / Lightbox Zoom** modal in the quiz interface.
3. **Advanced Custom Quiz Generator (`/quiz/new`)**
   - **Question Pool Filter Modes**:
     - **Whole Question Bank** (`all`): All questions in the selected specialties.
     - **Only New Questions** (`new`): Unseen questions the trainee has never attempted.
     - **Only Incorrect Questions** (`incorrect`): Questions where the trainee's most recent attempt was wrong.
     - **New & Incorrect Questions** (`new_and_incorrect`): Union of unseen and currently incorrect questions.
   - **Multi-Specialty Checkboxes**: Select any combination of specialties (`Cardiology`, `Gastroenterology`, `Respiratory`, `Neurology`, `Infectious Diseases`) with live matching question counts per filter mode.
4. **Interactive Single-Question Quiz Interface (`/quiz/[sessionId]`)**
   - Displays one clinical vignette at a time with 4 options (**A–D**).
   - **Immediate Feedback**: Selecting an option immediately highlights the correct answer in emerald green (and any wrong selection in rose red) and expands the **RACP Clinical Rationale & Guideline Reference** explanation panel along with any explanation diagram.
5. **Trainee Performance Dashboard (`/dashboard`)**
   - Displays Overall Accuracy (%), Bank Coverage, Completed Quiz Sessions, Strongest Specialty, Accuracy by Specialty progress bars, and an SVG **Score Trend Over Time** chart plotted against the 75% RACP benchmark.

---

## Getting Started (Local Development)

### 1. Install Dependencies

```bash
npm install
```

### 2. Initialize SQLite Database & Seed Questions

Push the Prisma schema to `prisma/dev.db` and seed the 25 RACP clinical questions (including sample embedded diagnostic images):

```bash
npm run db:push
npm run db:seed
```

### 3. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## How to Ingest a Real CSV (or JSON) of Questions & Embed Photos

You can import any custom CSV or JSON file into the SQLite database using [`scripts/ingest-csv.ts`](file:///Users/malephar/Documents/Question%20Bank%20App/scripts/ingest-csv.ts).

### CSV / JSON Columns

| Column | Required | Description |
| :--- | :--- | :--- |
| `id` | Yes | Unique question identifier (e.g., `RACP-CARD-001`). Used for idempotent `upsert`. |
| `specialty` | Yes | Medical specialty name (e.g., `Cardiology`, `Gastroenterology`, `Respiratory`). |
| `questionText` | Yes | Full clinical vignette / stem text. |
| `questionImageUrl` | Optional | Path to a file in `data/images/` (e.g., `data/images/brugada_ecg.svg` or `my_xray.png`) **or** an external `https://...` image URL to display in the question stem. Leave blank if none. |
| `optionA` | Yes | Text for Option A. |
| `optionB` | Yes | Text for Option B. |
| `optionC` | Yes | Text for Option C. |
| `optionD` | Yes | Text for Option D. |
| `correctAnswer` | Yes | Single letter: `A`, `B`, `C`, or `D`. |
| `explanation` | Yes | Detailed clinical explanation shown immediately after an option is selected. |
| `explanationImageUrl` | Optional | Path to a file in `data/images/` (e.g., `data/images/lights_criteria.svg`) **or** an external `https://...` URL to display inside the post-answer explanation panel. Leave blank if none. |

### Adding Local Clinical Photos

1. Place your image files (`.png`, `.jpg`, `.jpeg`, `.webp`, `.gif`, or `.svg`) into the [`data/images/`](file:///Users/malephar/Documents/Question%20Bank%20App/data/images) folder.
2. Reference either the filename (`my_ecg.png`) or relative path (`data/images/my_ecg.png`) in the `questionImageUrl` or `explanationImageUrl` column of your CSV.
3. Run the ingestion command:

```bash
npm run ingest -- path/to/your_questions.csv
```
