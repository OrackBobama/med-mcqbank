import React from "react";
import Link from "next/link";
import { getAuthenticatedUser } from "@/lib/auth";
import FractoLogo from "@/components/FractoLogo";
import {
  ArrowRight,
  UserPlus,
  LogIn,
  CheckCircle2,
  Image as ImageIcon,
  Filter,
  BarChart3,
  HeartPulse,
  Activity,
  Wind,
  Brain,
  Bug,
  ShieldCheck,
  LayoutDashboard,
} from "lucide-react";

export default async function LandingPage() {
  const user = await getAuthenticatedUser();

  const specialties = [
    {
      name: "Cardiology",
      icon: <HeartPulse className="h-5 w-5 text-rose-600" />,
      topics:
        "Valvular heart disease, Brugada channelopathies, HFrEF GDMT, AF anticoagulation",
    },
    {
      name: "Gastroenterology",
      icon: <Activity className="h-5 w-5 text-amber-600" />,
      topics:
        "Acute severe ulcerative colitis rescue, SBP albumin therapy, PBC, haemochromatosis",
    },
    {
      name: "Respiratory",
      icon: <Wind className="h-5 w-5 text-sky-600" />,
      topics:
        "Hypercapnic COPD NIV, IPF UIP HRCT patterns, Light's criteria, Löfgren syndrome",
    },
    {
      name: "Neurology",
      icon: <Brain className="h-5 w-5 text-purple-600" />,
      topics:
        "Guillain-Barré FVC monitoring, Giant Cell Arteritis, Lambert-Eaton, SAH nimodipine",
    },
    {
      name: "Infectious Diseases",
      icon: <Bug className="h-5 w-5 text-emerald-600" />,
      topics:
        "HIV cryptococcal meningitis ART timing, Melioidosis, febrile neutropenia, C. difficile",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3 group">
            <FractoLogo
              size={44}
              className="shrink-0 drop-shadow-sm transition-transform group-hover:scale-105"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-slate-900">
                  Fracto
                </span>
                <span className="hidden rounded-md bg-clinical-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-clinical-700 ring-1 ring-inset ring-clinical-200 sm:inline-block">
                  RACP MCQ Bank
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Divisional Written Examination Prep
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-clinical-700 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-clinical-800 sm:text-sm"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Go to Fracto Dashboard</span>
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 sm:text-sm"
                >
                  <LogIn className="h-4 w-4 text-slate-500" />
                  <span>Trainee Sign In</span>
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-clinical-700 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-clinical-800 sm:text-sm"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>New Trainee Registration</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-white via-clinical-50/30 to-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full bg-clinical-50 px-3.5 py-1.5 text-xs font-semibold text-clinical-800 ring-1 ring-inset ring-clinical-200">
                <ShieldCheck className="h-4 w-4 text-clinical-700" />
                <span>
                  Fracto Clinical Prep · RACP Adult Internal Medicine
                </span>
              </div>

              <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl sm:leading-[1.15]">
                Master the RACP Written Exam with{" "}
                <span className="bg-gradient-to-r from-clinical-800 via-clinical-600 to-sky-500 bg-clip-text text-transparent">
                  Fracto
                </span>
                .
              </h1>

              <p className="mt-5 text-base leading-relaxed text-slate-600 sm:text-lg">
                Practice high-yield 4-option (
                <code className="rounded bg-slate-200/70 px-1.5 py-0.5 text-sm font-semibold text-slate-800">
                  A–D
                </code>
                ) clinical vignettes enriched with diagnostic ECGs &amp;
                radiology imaging, adaptive question filtering (
                <strong className="font-semibold text-slate-800">New</strong>,{" "}
                <strong className="font-semibold text-slate-800">
                  Incorrect
                </strong>
                , or{" "}
                <strong className="font-semibold text-slate-800">
                  Full Bank
                </strong>
                ), and real-time sub-specialty analytics.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                {user ? (
                  <>
                    <Link
                      href="/quiz/new"
                      className="inline-flex items-center gap-2 rounded-xl bg-clinical-700 px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-clinical-800"
                    >
                      <span>Create Custom Quiz</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                    >
                      <span>View Performance Dashboard</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/register"
                      className="inline-flex items-center gap-2 rounded-xl bg-clinical-700 px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-clinical-800"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>Join Fracto as a Trainee</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                    >
                      <LogIn className="h-4 w-4" />
                      <span>Existing Trainee Sign In (OTP)</span>
                    </Link>
                  </>
                )}
              </div>

              <div className="mt-8 grid grid-cols-3 gap-4 border-t border-slate-200/80 pt-6">
                <div>
                  <p className="text-2xl font-bold text-clinical-800">A–D</p>
                  <p className="text-xs text-slate-500">4-Option RACP Format</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-clinical-800">4 Modes</p>
                  <p className="text-xs text-slate-500">
                    All / New / Incorrect Drilling
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-clinical-800">
                    5 Specialties
                  </p>
                  <p className="text-xs text-slate-500">With Clinical Imaging</p>
                </div>
              </div>
            </div>

            {/* Right Interactive Preview Card */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <span className="rounded-lg bg-clinical-800 px-2.5 py-1 text-xs font-bold text-white">
                    Fracto Vignette Preview
                  </span>
                  <span className="rounded-md bg-clinical-50 px-2.5 py-1 text-xs font-semibold text-clinical-700">
                    Cardiology · RACP-CARD-002
                  </span>
                </div>

                <p className="mt-4 text-xs leading-relaxed text-slate-700">
                  A 34-year-old man is referred following the sudden nocturnal
                  death of his brother. His 12-lead ECG shows a coved-type
                  ST-segment elevation of 3 mm in leads V1–V2 followed by a
                  negative T wave...
                </p>

                <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50/60 p-3">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-rose-900">
                    <span>Embedded Clinical ECG (Leads V1–V2)</span>
                    <span className="rounded bg-white px-1.5 py-0.5 text-[10px] text-rose-700 ring-1 ring-rose-200">
                      Zoomable Figure
                    </span>
                  </div>
                  <img
                    src="/api/media/brugada_ecg.svg"
                    alt="Sample Brugada Type 1 ECG"
                    className="mt-2 h-24 w-full rounded-lg border border-rose-200 object-cover"
                  />
                </div>

                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600">
                    <span className="font-bold">A.</span>
                    <span>KCNQ1 (potassium channel alpha-subunit)</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-emerald-500 bg-emerald-50 px-3 py-2 font-semibold text-emerald-950">
                    <div className="flex items-center gap-2.5">
                      <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        C
                      </span>
                      <span>SCN5A (cardiac sodium channel Nav1.5)</span>
                    </div>
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Platform Capabilities */}
      <section className="py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Why Trainees Prepare with Fracto
            </h2>
            <p className="mt-1.5 text-sm text-slate-600">
              Precision question bank tools designed to fracture complex clinical topics into high-yield mastery.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-clinical-50 text-clinical-700 ring-1 ring-clinical-200">
                <Filter className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">
                Targeted Question Pool Modes
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Customize every quiz session by selecting from the{" "}
                <strong>Whole Question Bank</strong>,{" "}
                <strong>Only New Questions</strong>,{" "}
                <strong>Only Incorrect Questions</strong>, or{" "}
                <strong>New &amp; Incorrect Questions</strong> across any
                combination of specialties.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                <ImageIcon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">
                Embedded Clinical Photos &amp; Diagrams
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Inspect high-resolution ECGs, HRCT chest imaging, Doppler
                profiles, and pathophysiology diagrams directly inside question
                stems and post-answer explanations—loaded from{" "}
                <code className="rounded bg-slate-100 px-1 py-0.5">
                  data/images/
                </code>{" "}
                or external URLs.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700 ring-1 ring-amber-200">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">
                Longitudinal Performance Analytics
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Track overall accuracy, unique question bank coverage,
                sub-specialty accuracy bars, and chronological quiz score trends
                against the 75% RACP benchmark.
              </p>
            </div>
          </div>

          {/* Specialty Curriculum Section */}
          <div className="mt-14 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col justify-between gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Fracto RACP Sub-Specialty Question Banks
                </h3>
                <p className="text-xs text-slate-500">
                  Pre-seeded clinical vignettes with expandable CSV/JSON
                  ingestion support
                </p>
              </div>
              <Link
                href={user ? "/quiz/new" : "/register"}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-clinical-700 hover:underline"
              >
                <span>
                  {user
                    ? "Launch Custom Quiz Generator"
                    : "Register on Fracto to Start Practicing"}
                </span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {specialties.map((spec) => (
                <div
                  key={spec.name}
                  className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-slate-200/80">
                      {spec.icon}
                    </div>
                    <span className="text-sm font-bold text-slate-900">
                      {spec.name}
                    </span>
                  </div>
                  <p className="mt-2.5 text-[11px] leading-relaxed text-slate-600">
                    {spec.topics}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
