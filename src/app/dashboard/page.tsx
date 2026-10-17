"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import TrendChart, { TrendPoint } from "@/components/TrendChart";
import {
  Target,
  CheckCircle2,
  ClipboardCheck,
  TrendingUp,
  PlusCircle,
  ArrowRight,
  Clock,
  Award,
  Layers,
  Calendar,
  Settings,
} from "lucide-react";

interface SpecialtyBreakdownItem {
  specialty: string;
  totalBankQuestions: number;
  attempted: number;
  correct: number;
  accuracy: number | null;
}

interface RecentSessionItem {
  id: string;
  specialties: string[];
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  accuracy: number | null;
  createdAt: string;
  completedAt: string | null;
}

interface DashboardResponse {
  user: {
    id: string;
    email: string;
    name: string | null;
    trainingLevel?: string | null;
    hospital?: string | null;
    state?: string | null;
    specialtyInterest?: string | null;
    avatarUrl?: string | null;
    examDate?: string | null;
  };
  summary: {
    overallAccuracy: number;
    totalAttempts: number;
    totalCorrect: number;
    uniqueQuestionsAnswered: number;
    totalBankSize: number;
    totalSessions: number;
    completedSessions: number;
  };
  specialtyBreakdown: SpecialtyBreakdownItem[];
  scoreTrend: TrendPoint[];
  recentSessions: RecentSessionItem[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await fetch("/api/dashboard", { cache: "no-store" });
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [router]);

  const attemptedSpecialties = (data?.specialtyBreakdown || []).filter(
    (s) => s.accuracy !== null
  );
  const strongestSpecialty =
    attemptedSpecialties.length > 0
      ? [...attemptedSpecialties].sort(
          (a, b) => (b.accuracy || 0) - (a.accuracy || 0)
        )[0]
      : null;

  // Compute Exam Countdown
  const examCountdown = (() => {
    const rawDate = data?.user.examDate;
    if (!rawDate) return null;
    const target = new Date(rawDate);
    if (isNaN(target.getTime())) return null;
    const now = new Date();
    const diffDays = Math.ceil(
      (target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return {
      diffDays,
      formattedDate: target.toLocaleDateString("en-AU", {
        weekday: "short",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    };
  })();

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <Navbar
        userEmail={data?.user.email}
        userName={data?.user.name}
        userAvatar={data?.user.avatarUrl}
      />

      <main className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        {/* Welcome & Quick CTA Banner */}
        <div className="mb-6 flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-clinical-50 px-3 py-1 text-xs font-semibold text-clinical-700 ring-1 ring-inset ring-clinical-200">
                Fracto · RACP Basic Physician Training Analytics
              </span>
              {data?.user.trainingLevel && (
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                  {data.user.trainingLevel}
                  {data.user.hospital ? ` · ${data.user.hospital}` : ""}
                </span>
              )}
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              Fracto Performance Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Monitor your Divisional Written Examination readiness, specialty accuracy breakdown, and longitudinal score trajectory.
            </p>
          </div>

          <Link
            href="/quiz/new"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-clinical-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-clinical-800"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Create Custom Quiz</span>
          </Link>
        </div>

        {/* RACP Exam Date Countdown Widget or Prompt Banner */}
        {!loading && data && (
          <div className="mb-8">
            {examCountdown ? (
              <div className="flex flex-col justify-between gap-4 rounded-2xl border border-clinical-200 bg-gradient-to-r from-clinical-900 via-clinical-800 to-clinical-700 p-6 text-white shadow-sm sm:flex-row sm:items-center">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/25">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="inline-block rounded-md bg-white/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-clinical-100">
                      RACP Divisional Written Examination Countdown
                    </span>
                    <h2 className="mt-1.5 text-xl font-extrabold tracking-tight sm:text-2xl">
                      {examCountdown.diffDays > 0
                        ? `${examCountdown.diffDays} Days Remaining Until Exam Day`
                        : examCountdown.diffDays === 0
                        ? "Examination Day is Today!"
                        : `Exam Sitting Completed (${Math.abs(
                            examCountdown.diffDays
                          )} days ago)`}
                    </h2>
                    <p className="mt-0.5 text-xs text-clinical-100 sm:text-sm">
                      Target Sitting Date:{" "}
                      <strong className="font-semibold text-white">
                        {examCountdown.formattedDate}
                      </strong>{" "}
                      · Remaining Unseen Bank Questions:{" "}
                      <strong className="font-semibold text-white">
                        {Math.max(
                          0,
                          data.summary.totalBankSize -
                            data.summary.uniqueQuestionsAnswered
                        )}
                      </strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="hidden rounded-xl bg-white/10 px-4 py-2.5 text-center ring-1 ring-white/20 sm:block">
                    <p className="text-2xl font-black leading-none text-white">
                      {Math.max(0, examCountdown.diffDays)}
                    </p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-clinical-100">
                      Days Left
                    </p>
                  </div>
                  <Link
                    href="/settings#exam-date"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-clinical-900 shadow-sm transition hover:bg-clinical-50"
                  >
                    <Settings className="h-3.5 w-3.5" />
                    <span>Update Exam Date</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex flex-col justify-between gap-4 rounded-2xl border border-dashed border-clinical-300 bg-clinical-50/50 p-5 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-clinical-700 text-white shadow-sm">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 sm:text-base">
                      Set Your RACP Divisional Written Examination Date
                    </h2>
                    <p className="text-xs text-slate-600">
                      Configure your target sitting date in Settings to display a live exam countdown timer on your dashboard.
                    </p>
                  </div>
                </div>
                <Link
                  href="/settings#exam-date"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-clinical-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-clinical-800"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Set Exam Date in Settings</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>
        )}

        {loading || !data ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Computing clinical performance metrics...
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Overall Accuracy
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-clinical-50 text-clinical-700">
                    <Target className="h-5 w-5" />
                  </div>
                </div>
                <p className="mt-3 text-3xl font-bold text-slate-900">
                  {data.summary.totalAttempts > 0
                    ? `${data.summary.overallAccuracy}%`
                    : "—"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {data.summary.totalCorrect} correct of{" "}
                  {data.summary.totalAttempts} total question attempts
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Bank Coverage
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                </div>
                <p className="mt-3 text-3xl font-bold text-slate-900">
                  {data.summary.uniqueQuestionsAnswered}{" "}
                  <span className="text-lg font-medium text-slate-400">
                    / {data.summary.totalBankSize}
                  </span>
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Unique RACP vignettes (SBA &amp; EMQ) attempted
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Quiz Sessions
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                    <ClipboardCheck className="h-5 w-5" />
                  </div>
                </div>
                <p className="mt-3 text-3xl font-bold text-slate-900">
                  {data.summary.completedSessions}{" "}
                  <span className="text-lg font-medium text-slate-400">
                    / {data.summary.totalSessions}
                  </span>
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Completed custom quiz sessions
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Strongest Specialty
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                    <Award className="h-5 w-5" />
                  </div>
                </div>
                <p className="mt-3 truncate text-xl font-bold text-slate-900">
                  {strongestSpecialty ? strongestSpecialty.specialty : "—"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {strongestSpecialty
                    ? `${strongestSpecialty.accuracy}% accuracy (${strongestSpecialty.correct}/${strongestSpecialty.attempted})`
                    : "Answer questions to unlock specialty ranking"}
                </p>
              </div>
            </div>

            {/* Two-Column Analytics Row: Accuracy by Specialty + Score Trend Over Time */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Accuracy Breakdown by Specialty */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Accuracy by Specialty
                    </h2>
                    <p className="text-xs text-slate-500">
                      Performance breakdown across RACP sub-specialties
                    </p>
                  </div>
                  <Layers className="h-5 w-5 text-clinical-700" />
                </div>

                <div className="mt-5 space-y-4">
                  {data.specialtyBreakdown.map((item) => {
                    const hasAttempts = item.accuracy !== null;
                    const acc = item.accuracy ?? 0;

                    let barColor = "bg-slate-300";
                    let badgeStyle = "bg-slate-100 text-slate-600";

                    if (hasAttempts) {
                      if (acc >= 75) {
                        barColor = "bg-emerald-500";
                        badgeStyle =
                          "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
                      } else if (acc >= 50) {
                        barColor = "bg-amber-500";
                        badgeStyle =
                          "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
                      } else {
                        barColor = "bg-rose-500";
                        badgeStyle =
                          "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
                      }
                    }

                    return (
                      <div key={item.specialty} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-800">
                            {item.specialty}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500">
                              {item.correct}/{item.attempted} correct
                            </span>
                            <span
                              className={`rounded-md px-2 py-0.5 font-bold ${badgeStyle}`}
                            >
                              {hasAttempts ? `${acc}%` : "No attempts"}
                            </span>
                          </div>
                        </div>
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                            style={{
                              width: `${hasAttempts ? Math.max(acc, 4) : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Score Trend Over Time */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-7">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Score Trend Over Time
                    </h2>
                    <p className="text-xs text-slate-500">
                      Session accuracy trajectory across chronological practice exams
                    </p>
                  </div>
                  <TrendingUp className="h-5 w-5 text-clinical-700" />
                </div>

                <div className="mt-5">
                  <TrendChart data={data.scoreTrend} />
                </div>
              </div>
            </div>

            {/* Historical Quiz Sessions Table */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Historical Quiz Sessions
                  </h2>
                  <p className="text-xs text-slate-500">
                    Review completed examination sessions or resume in-progress quizzes
                  </p>
                </div>
                <Clock className="h-5 w-5 text-slate-400" />
              </div>

              {data.recentSessions.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-sm font-medium text-slate-600">
                    You haven&apos;t generated any custom quizzes yet.
                  </p>
                  <Link
                    href="/quiz/new"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-clinical-700 hover:underline"
                  >
                    <span>Generate your first custom Fracto quiz</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        <th className="pb-3 pr-4">Date &amp; Time</th>
                        <th className="pb-3 pr-4">Selected Specialties</th>
                        <th className="pb-3 pr-4">Progress</th>
                        <th className="pb-3 pr-4">Accuracy</th>
                        <th className="pb-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.recentSessions.map((sess) => {
                        const isComplete =
                          sess.completedAt !== null ||
                          sess.answeredCount >= sess.totalQuestions;

                        return (
                          <tr key={sess.id} className="hover:bg-slate-50/80">
                            <td className="whitespace-nowrap py-3.5 pr-4 text-xs text-slate-600">
                              {new Date(sess.createdAt).toLocaleString([], {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })}
                            </td>
                            <td className="py-3.5 pr-4">
                              <div className="flex flex-wrap gap-1">
                                {sess.specialties.map((sp) => (
                                  <span
                                    key={sp}
                                    className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700"
                                  >
                                    {sp}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="whitespace-nowrap py-3.5 pr-4 text-xs font-medium text-slate-700">
                              {sess.answeredCount} / {sess.totalQuestions}{" "}
                              questions
                            </td>
                            <td className="whitespace-nowrap py-3.5 pr-4">
                              {sess.accuracy !== null ? (
                                <span
                                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                    sess.accuracy >= 75
                                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                                      : sess.accuracy >= 50
                                      ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                                      : "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
                                  }`}
                                >
                                  {sess.accuracy}% ({sess.correctCount}/
                                  {sess.answeredCount})
                                </span>
                              ) : (
                                <span className="text-xs text-slate-400">
                                  Not started
                                </span>
                              )}
                            </td>
                            <td className="whitespace-nowrap py-3.5 text-right">
                              <Link
                                href={`/quiz/${sess.id}`}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-clinical-700 shadow-sm transition hover:bg-clinical-50"
                              >
                                <span>{isComplete ? "Review" : "Resume"}</span>
                                <ArrowRight className="h-3.5 w-3.5" />
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
