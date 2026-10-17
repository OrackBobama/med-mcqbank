"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import {
  CheckSquare,
  Square,
  Play,
  HeartPulse,
  Activity,
  Wind,
  Brain,
  Bug,
  Layers,
  AlertCircle,
  SlidersHorizontal,
  Sparkles,
  RotateCcw,
  Combine,
  Database,
  ListChecks,
  Grid,
} from "lucide-react";

type FilterMode = "all" | "new" | "incorrect" | "new_and_incorrect";
type QuestionTypeFilter = "all" | "SBA" | "EMQ";

interface SpecialtyStat {
  specialty: string;
  totalQuestions: number;
  sbaCount: number;
  emqCount: number;
  newCount: number;
  incorrectCount: number;
  newAndIncorrectCount: number;
  attemptedCount: number;
  correctCount: number;
  accuracy: number | null;
}

const SPECIALTY_ICONS: Record<string, React.ReactNode> = {
  Cardiology: <HeartPulse className="h-5 w-5 text-rose-600" />,
  Gastroenterology: <Activity className="h-5 w-5 text-amber-600" />,
  Respiratory: <Wind className="h-5 w-5 text-sky-600" />,
  Neurology: <Brain className="h-5 w-5 text-purple-600" />,
  "Infectious Diseases": <Bug className="h-5 w-5 text-emerald-600" />,
};

export default function NewQuizPage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    email: string;
    name?: string | null;
    avatarUrl?: string | null;
  } | null>(null);
  const [specialties, setSpecialties] = useState<SpecialtyStat[]>([]);
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [questionTypeFilter, setQuestionTypeFilter] =
    useState<QuestionTypeFilter>("all");
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [meRes, specRes] = await Promise.all([
          fetch("/api/auth/me", { cache: "no-store" }),
          fetch("/api/specialties", { cache: "no-store" }),
        ]);

        if (meRes.status === 401 || specRes.status === 401) {
          router.push("/login");
          return;
        }

        const meData = await meRes.json();
        const specData = await specRes.json();

        setUser(meData.user);
        const list: SpecialtyStat[] = specData.specialties || [];
        setSpecialties(list);
        setSelectedSpecs(list.map((s) => s.specialty));
      } catch {
        setError("Failed to load specialty catalog.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  const getCountForMode = (item: SpecialtyStat, mode: FilterMode): number => {
    if (questionTypeFilter === "SBA" && mode === "all") {
      return item.sbaCount ?? item.totalQuestions;
    }
    if (questionTypeFilter === "EMQ" && mode === "all") {
      return item.emqCount ?? 0;
    }
    switch (mode) {
      case "new":
        return item.newCount;
      case "incorrect":
        return item.incorrectCount;
      case "new_and_incorrect":
        return item.newAndIncorrectCount;
      case "all":
      default:
        return item.totalQuestions;
    }
  };

  const selectedSpecItems = specialties.filter((s) =>
    selectedSpecs.includes(s.specialty)
  );

  const totalByFormat: Record<QuestionTypeFilter, number> = {
    all: selectedSpecItems.reduce((sum, s) => sum + s.totalQuestions, 0),
    SBA: selectedSpecItems.reduce(
      (sum, s) => sum + (s.sbaCount ?? s.totalQuestions),
      0
    ),
    EMQ: selectedSpecItems.reduce((sum, s) => sum + (s.emqCount ?? 0), 0),
  };

  const poolCountsByMode: Record<FilterMode, number> = {
    all: totalByFormat[questionTypeFilter],
    new: selectedSpecItems.reduce((sum, s) => sum + s.newCount, 0),
    incorrect: selectedSpecItems.reduce((sum, s) => sum + s.incorrectCount, 0),
    new_and_incorrect: selectedSpecItems.reduce(
      (sum, s) => sum + s.newAndIncorrectCount,
      0
    ),
  };

  const availablePool =
    questionTypeFilter === "all"
      ? poolCountsByMode[filterMode]
      : Math.min(poolCountsByMode[filterMode], totalByFormat[questionTypeFilter]);

  useEffect(() => {
    if (availablePool > 0 && questionCount > availablePool) {
      setQuestionCount(availablePool);
    } else if (availablePool > 0 && questionCount < 1) {
      setQuestionCount(Math.min(5, availablePool));
    }
  }, [availablePool, questionCount]);

  const toggleSpecialty = (spec: string) => {
    setSelectedSpecs((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
    );
  };

  const selectAll = () => {
    setSelectedSpecs(specialties.map((s) => s.specialty));
  };

  const clearAll = () => {
    setSelectedSpecs([]);
  };

  const handleStartQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSpecs.length === 0) {
      setError("Please select at least one specialty.");
      return;
    }
    if (availablePool === 0) {
      setError(
        "No questions match your current question pool filter, format, and selected specialties."
      );
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/quiz/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          specialties: selectedSpecs,
          questionCount,
          filterMode,
          questionTypeFilter,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not create quiz.");
        return;
      }

      router.push(`/quiz/${data.sessionId}`);
    } catch {
      setError("Network error while creating custom quiz.");
    } finally {
      setSubmitting(false);
    }
  };

  const filterModesList: {
    key: FilterMode;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
  }[] = [
    {
      key: "all",
      title: "Whole Question Bank",
      subtitle: "Include all clinical vignettes in selected specialties",
      icon: <Database className="h-4 w-4 text-clinical-700" />,
    },
    {
      key: "new",
      title: "Only New Questions",
      subtitle: "Unseen questions you have never attempted before",
      icon: <Sparkles className="h-4 w-4 text-emerald-600" />,
    },
    {
      key: "incorrect",
      title: "Only Incorrect Questions",
      subtitle: "Target questions where your latest attempt was wrong",
      icon: <RotateCcw className="h-4 w-4 text-rose-600" />,
    },
    {
      key: "new_and_incorrect",
      title: "New & Incorrect Questions",
      subtitle: "Combine unseen vignettes with previously missed questions",
      icon: <Combine className="h-4 w-4 text-amber-600" />,
    },
  ];

  const formatOptionsList: {
    key: QuestionTypeFilter;
    title: string;
    badge: string;
    subtitle: string;
    icon: React.ReactNode;
  }[] = [
    {
      key: "all",
      title: "All Question Formats",
      badge: "SBA + EMQ",
      subtitle: "Mix 4-option Single Best Answer & 10-option Extended Matching sets",
      icon: <Layers className="h-4 w-4 text-clinical-700" />,
    },
    {
      key: "SBA",
      title: "Single Best Answer (SBA)",
      badge: "4 Options (A–D)",
      subtitle: "Classic RACP Paper 1 & 2 single-vignette 4-option MCQs",
      icon: <ListChecks className="h-4 w-4 text-sky-600" />,
    },
    {
      key: "EMQ",
      title: "Extended Matching (EMQ)",
      badge: "10 Options (A–J)",
      subtitle: "Linked clinical stems sharing a 10-option diagnostic/management list",
      icon: <Grid className="h-4 w-4 text-violet-600" />,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar
        userEmail={user?.email}
        userName={user?.name}
        userAvatar={user?.avatarUrl}
      />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-clinical-50 px-2.5 py-1 text-xs font-semibold text-clinical-700 ring-1 ring-inset ring-clinical-200">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Fracto Custom Quiz Generator
          </span>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            Configure Fracto RACP Practice Examination
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Choose between Single Best Answer (4-option A–D) and Extended Matching Questions (10-option A–J), filter by question status, and select your target specialties.
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Loading RACP specialty question bank...
            </p>
          </div>
        ) : (
          <form onSubmit={handleStartQuiz} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Question Format Selector (SBA vs EMQ) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base font-semibold text-slate-900">
                  1. Select Examination Question Format
                </h2>
                <p className="text-xs text-slate-500">
                  Practice classic 4-option Single Best Answer (SBA) questions, 10-option Extended Matching Questions (EMQs), or a combined examination
                </p>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {formatOptionsList.map((fmt) => {
                  const isSelected = questionTypeFilter === fmt.key;
                  const fmtCount = totalByFormat[fmt.key];

                  return (
                    <button
                      key={fmt.key}
                      type="button"
                      onClick={() => {
                        setQuestionTypeFilter(fmt.key);
                        if (fmt.key === "EMQ" && questionCount < 3) {
                          setQuestionCount(Math.min(6, fmtCount || 3));
                        }
                      }}
                      className={`flex flex-col justify-between rounded-xl border p-4 text-left transition ${
                        isSelected
                          ? "border-clinical-600 bg-clinical-50/50 ring-2 ring-clinical-600/20"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                            {fmt.icon}
                          </div>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                              isSelected
                                ? "bg-clinical-700 text-white"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {fmtCount} Qs
                          </span>
                        </div>
                        <p className="mt-3 text-sm font-bold text-slate-900">
                          {fmt.title}
                        </p>
                        <span className="mt-1 inline-block rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                          {fmt.badge}
                        </span>
                        <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                          {fmt.subtitle}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Question Pool Filter Mode */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base font-semibold text-slate-900">
                  2. Select Question Pool Filter
                </h2>
                <p className="text-xs text-slate-500">
                  Choose whether to draw from the entire bank, only unseen questions, or questions you previously answered incorrectly
                </p>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {filterModesList.map((mode) => {
                  const isSelected = filterMode === mode.key;
                  const modeCount = poolCountsByMode[mode.key];

                  return (
                    <button
                      key={mode.key}
                      type="button"
                      onClick={() => setFilterMode(mode.key)}
                      className={`flex items-start justify-between rounded-xl border p-4 text-left transition ${
                        isSelected
                          ? "border-clinical-600 bg-clinical-50/50 ring-2 ring-clinical-600/20"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                          {mode.icon}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {mode.title}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {mode.subtitle}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`ml-2 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          isSelected
                            ? "bg-clinical-700 text-white"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {modeCount} Qs
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Specialties Selection */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    3. Select Medical Specialties
                  </h2>
                  <p className="text-xs text-slate-500">
                    {selectedSpecs.length} of {specialties.length} specialties selected ({availablePool} matching questions in pool)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={selectAll}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={clearAll}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {specialties.map((item) => {
                  const isChecked = selectedSpecs.includes(item.specialty);
                  const icon = SPECIALTY_ICONS[item.specialty] || (
                    <Layers className="h-5 w-5 text-clinical-600" />
                  );
                  const matchingInSpec = getCountForMode(item, filterMode);

                  return (
                    <label
                      key={item.specialty}
                      onClick={() => toggleSpecialty(item.specialty)}
                      className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition ${
                        isChecked
                          ? "border-clinical-600 bg-clinical-50/40 ring-1 ring-clinical-600"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="sr-only"
                          aria-label={item.specialty}
                        />
                        <div className="text-clinical-700">
                          {isChecked ? (
                            <CheckSquare className="h-5 w-5 text-clinical-700" />
                          ) : (
                            <Square className="h-5 w-5 text-slate-300" />
                          )}
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                          {icon}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {item.specialty}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            <strong className="text-slate-700">
                              {matchingInSpec} matching
                            </strong>{" "}
                            ({item.sbaCount ?? item.totalQuestions} SBA · {item.emqCount ?? 0} EMQ)
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        {item.accuracy !== null ? (
                          <span
                            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              item.accuracy >= 75
                                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                                : item.accuracy >= 50
                                ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                                : "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
                            }`}
                          >
                            {item.accuracy}% acc
                          </span>
                        ) : (
                          <span className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-500">
                            Unattempted
                          </span>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Step 4: Number of Questions */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base font-semibold text-slate-900">
                  4. Total Number of Questions
                </h2>
                <p className="text-xs text-slate-500">
                  Choose how many questions to sample from the {availablePool} matching questions
                </p>
              </div>

              {availablePool === 0 ? (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900">
                  No questions currently match this filter combination (e.g. you have 0 incorrect questions in the selected specialties). Switch to <strong>Whole Question Bank</strong>, <strong>Only New Questions</strong>, or <strong>New &amp; Incorrect Questions</strong> above.
                </div>
              ) : (
                <>
                  <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1 space-y-2">
                      <input
                        type="range"
                        min={1}
                        max={Math.max(1, availablePool)}
                        value={Math.min(
                          questionCount,
                          Math.max(1, availablePool)
                        )}
                        disabled={availablePool === 0}
                        onChange={(e) =>
                          setQuestionCount(Number(e.target.value))
                        }
                        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-clinical-700"
                      />
                      <div className="flex justify-between text-[11px] font-medium text-slate-400">
                        <span>1 Question</span>
                        <span>Max Pool ({availablePool} Questions)</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <label
                        htmlFor="questionCountInput"
                        className="text-xs font-semibold uppercase tracking-wider text-slate-500"
                      >
                        Count:
                      </label>
                      <input
                        id="questionCountInput"
                        type="number"
                        min={1}
                        max={Math.max(1, availablePool)}
                        value={questionCount}
                        disabled={availablePool === 0}
                        onChange={(e) =>
                          setQuestionCount(
                            Math.max(
                              1,
                              Math.min(
                                availablePool || 1,
                                Number(e.target.value) || 1
                              )
                            )
                          )
                        }
                        className="w-20 rounded-xl border border-slate-300 px-3 py-2 text-center text-base font-bold text-slate-900 shadow-sm focus:border-clinical-600 focus:outline-none focus:ring-2 focus:ring-clinical-500/20"
                      />
                    </div>
                  </div>

                  {/* Quick preset pills */}
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="mr-1 text-xs font-medium text-slate-500">
                      Quick Presets:
                    </span>
                    {[3, 5, 10, 15, 25].map((preset) => {
                      if (preset > availablePool) return null;
                      return (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setQuestionCount(preset)}
                          className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                            questionCount === preset
                              ? "bg-clinical-700 text-white"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {preset} Questions
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => setQuestionCount(availablePool)}
                      className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                        questionCount === availablePool
                          ? "bg-clinical-700 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      All Matching ({availablePool})
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Submit Bar */}
            <div className="flex items-center justify-between rounded-2xl border border-clinical-200 bg-clinical-900 px-6 py-5 text-white shadow-sm">
              <div>
                <p className="text-sm font-semibold">
                  Ready to Launch Custom Examination
                </p>
                <p className="text-xs text-clinical-200">
                  {availablePool > 0 ? questionCount : 0} RACP clinical vignettes · Format:{" "}
                  <strong className="text-white">
                    {formatOptionsList.find((f) => f.key === questionTypeFilter)?.badge}
                  </strong>{" "}
                  · Pool:{" "}
                  <strong className="text-white">
                    {filterModesList.find((m) => m.key === filterMode)?.title}
                  </strong>
                </p>
              </div>
              <button
                type="submit"
                disabled={
                  submitting ||
                  selectedSpecs.length === 0 ||
                  availablePool === 0
                }
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-clinical-900 shadow-sm transition hover:bg-clinical-50 disabled:opacity-50"
              >
                <Play className="h-4 w-4 fill-clinical-900" />
                <span>
                  {submitting ? "Generating Quiz..." : "Start Custom Quiz"}
                </span>
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
