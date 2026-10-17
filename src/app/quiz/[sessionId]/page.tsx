"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ClinicalImage from "@/components/ClinicalImage";
import {
  CheckCircle2,
  XCircle,
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  Award,
  BarChart3,
  PlusCircle,
  Grid,
  ListChecks,
} from "lucide-react";

type OptionKey =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J";

interface QuestionItem {
  id: string;
  specialty: string;
  questionType?: "SBA" | "EMQ";
  emqGroupId?: string | null;
  emqTheme?: string | null;
  questionText: string;
  questionImageUrl?: string | null;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  optionsMap?: Record<string, string>;
  correctAnswer?: OptionKey;
  explanation?: string;
  explanationImageUrl?: string | null;
  attempt: {
    selectedOption: OptionKey;
    isCorrect: boolean;
    answeredAt: string;
  } | null;
}

interface SessionInfo {
  id: string;
  specialties: string[];
  filterMode?: string;
  questionTypeFilter?: string;
  totalQuestions: number;
  completedAt: string | null;
  createdAt: string;
  answeredCount: number;
  correctCount: number;
}

const FILTER_MODE_LABELS: Record<string, string> = {
  all: "Whole Bank",
  new: "Only New",
  incorrect: "Only Incorrect",
  new_and_incorrect: "New & Incorrect",
};

export default function QuizSessionPage() {
  const params = useParams<{ sessionId: string }>();
  const router = useRouter();
  const sessionId = params.sessionId;

  const [user, setUser] = useState<{
    email: string;
    name?: string | null;
    avatarUrl?: string | null;
  } | null>(null);
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submittingOption, setSubmittingOption] = useState<OptionKey | null>(
    null
  );
  const [showSummary, setShowSummary] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadQuiz() {
      try {
        const [meRes, quizRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch(`/api/quiz/${sessionId}`),
        ]);

        if (meRes.status === 401 || quizRes.status === 401) {
          router.push("/login");
          return;
        }

        if (!quizRes.ok) {
          setError("Quiz session could not be found.");
          return;
        }

        const meData = await meRes.json();
        const quizData = await quizRes.json();

        setUser(meData.user);
        setSession(quizData.session);
        setQuestions(quizData.questions || []);

        const firstUnanswered = (quizData.questions || []).findIndex(
          (q: QuestionItem) => !q.attempt
        );
        if (firstUnanswered !== -1) {
          setCurrentIndex(firstUnanswered);
        }
      } catch {
        setError("Failed to load quiz session.");
      } finally {
        setLoading(false);
      }
    }
    loadQuiz();
  }, [sessionId, router]);

  const currentQuestion = questions[currentIndex];

  const handleSelectOption = async (option: OptionKey) => {
    if (!currentQuestion || currentQuestion.attempt || submittingOption) {
      return;
    }

    setSubmittingOption(option);

    try {
      const res = await fetch(`/api/quiz/${sessionId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          selectedOption: option,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to record answer.");
        return;
      }

      setQuestions((prev) =>
        prev.map((q, idx) =>
          idx === currentIndex
            ? {
                ...q,
                correctAnswer: data.correctAnswer,
                explanation: data.explanation,
                explanationImageUrl: data.explanationImageUrl,
                attempt: data.attempt,
              }
            : q
        )
      );

      if (data.sessionStats) {
        setSession((prev) =>
          prev
            ? {
                ...prev,
                answeredCount: data.sessionStats.answeredCount,
                correctCount: data.sessionStats.correctCount,
                completedAt: data.sessionStats.completedAt,
              }
            : prev
        );
      }
    } catch {
      setError("Network error while submitting answer.");
    } finally {
      setSubmittingOption(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar
          userEmail={user?.email}
          userName={user?.name}
          userAvatar={user?.avatarUrl}
        />
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <p className="text-sm font-medium text-slate-500">
            Loading clinical examination vignette...
          </p>
        </div>
      </div>
    );
  }

  if (error || !session || !currentQuestion) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar
          userEmail={user?.email}
          userName={user?.name}
          userAvatar={user?.avatarUrl}
        />
        <div className="mx-auto max-w-3xl px-4 py-12">
          <div className="rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm">
            <p className="text-base font-semibold text-rose-700">
              {error || "Unable to display question."}
            </p>
            <Link
              href="/dashboard"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-clinical-700 px-4 py-2 text-xs font-semibold text-white"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isEmq = currentQuestion.questionType === "EMQ";
  const ALL_OPTION_KEYS: OptionKey[] = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
  ];

  const optionsList: { key: OptionKey; text: string }[] =
    isEmq && currentQuestion.optionsMap
      ? ALL_OPTION_KEYS.filter(
          (k) =>
            currentQuestion.optionsMap &&
            Boolean(currentQuestion.optionsMap[k])
        ).map((k) => ({
          key: k,
          text: currentQuestion.optionsMap![k],
        }))
      : [
          { key: "A", text: currentQuestion.optionA },
          { key: "B", text: currentQuestion.optionB },
          { key: "C", text: currentQuestion.optionC },
          { key: "D", text: currentQuestion.optionD },
        ];

  // Find sibling questions in this session that belong to the same EMQ group
  const emqGroupSiblings =
    isEmq && currentQuestion.emqGroupId
      ? questions
          .map((q, idx) => ({ q, idx }))
          .filter((item) => item.q.emqGroupId === currentQuestion.emqGroupId)
      : [];
  const currentStemPositionInGroup = emqGroupSiblings.findIndex(
    (item) => item.idx === currentIndex
  );

  const accuracyPercent =
    session.answeredCount > 0
      ? Math.round((session.correctCount / session.answeredCount) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <Navbar
        userEmail={user?.email}
        userName={user?.name}
        userAvatar={user?.avatarUrl}
      />

      <main className="mx-auto max-w-4xl px-4 pt-6 sm:px-6">
        {/* Top Session Progress & Question Navigator */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="rounded-lg bg-clinical-800 px-3 py-1 text-xs font-bold text-white">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${
                  isEmq
                    ? "bg-violet-50 text-violet-800 ring-violet-200"
                    : "bg-sky-50 text-sky-800 ring-sky-200"
                }`}
              >
                {isEmq ? (
                  <>
                    <Grid className="h-3.5 w-3.5" />
                    EMQ ({optionsList.length} Options)
                  </>
                ) : (
                  <>
                    <ListChecks className="h-3.5 w-3.5" />
                    SBA (4 Options)
                  </>
                )}
              </span>
              <span className="rounded-lg bg-clinical-50 px-2.5 py-1 text-xs font-semibold text-clinical-700 ring-1 ring-inset ring-clinical-200">
                {currentQuestion.specialty}
              </span>
              {session.filterMode && (
                <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  Pool: {FILTER_MODE_LABELS[session.filterMode] || session.filterMode}
                </span>
              )}
              <span className="font-mono text-xs text-slate-400">
                {currentQuestion.id}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="font-medium text-slate-600">
                Progress:{" "}
                <strong className="text-slate-900">
                  {session.answeredCount}/{session.totalQuestions}
                </strong>
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-800">
                Score: {session.correctCount}/{session.answeredCount || 0} (
                {accuracyPercent}%)
              </span>
            </div>
          </div>

          {/* Question Pill Strip */}
          <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-3">
            {questions.map((q, idx) => {
              const isCurrent = idx === currentIndex && !showSummary;
              const isAnswered = Boolean(q.attempt);
              const isRight = q.attempt?.isCorrect;

              let btnStyle =
                "bg-slate-100 text-slate-600 hover:bg-slate-200 border-transparent";
              if (isAnswered) {
                btnStyle = isRight
                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                  : "bg-rose-100 text-rose-800 border-rose-300";
              }
              if (isCurrent) {
                btnStyle += " ring-2 ring-clinical-700 ring-offset-1 font-bold";
              }

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => {
                    setShowSummary(false);
                    setCurrentIndex(idx);
                  }}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-medium transition ${btnStyle}`}
                >
                  {idx + 1}
                </button>
              );
            })}

            {session.answeredCount > 0 && (
              <button
                type="button"
                onClick={() => setShowSummary(true)}
                className={`ml-auto rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  showSummary
                    ? "bg-clinical-800 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Session Summary
              </button>
            )}
          </div>
        </div>

        {showSummary ? (
          /* End-of-Quiz Summary Panel */
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-clinical-50 text-clinical-700 ring-1 ring-clinical-200">
                <Award className="h-7 w-7" />
              </div>
              <h2 className="mt-4 text-2xl font-bold text-slate-900">
                Examination Session Summary
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                You have answered {session.answeredCount} of{" "}
                {session.totalQuestions} questions in this session.
              </p>

              <div className="mt-6 grid w-full max-w-lg grid-cols-3 gap-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-500">Accuracy</p>
                  <p className="mt-1 text-2xl font-bold text-clinical-800">
                    {accuracyPercent}%
                  </p>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
                  <p className="text-xs font-medium text-emerald-700">Correct</p>
                  <p className="mt-1 text-2xl font-bold text-emerald-800">
                    {session.correctCount}
                  </p>
                </div>
                <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4">
                  <p className="text-xs font-medium text-rose-700">Incorrect</p>
                  <p className="mt-1 text-2xl font-bold text-rose-800">
                    {session.answeredCount - session.correctCount}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl bg-clinical-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-clinical-800"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>View Updated Performance Dashboard</span>
                </Link>
                <Link
                  href="/quiz/new"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Generate Another Quiz</span>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* Single-Question Clinical Vignette View */
          <div className="space-y-6">
            {/* EMQ Shared Theme & Multi-Stem Group Banner */}
            {isEmq && (
              <div className="rounded-2xl border border-violet-200 bg-violet-50/70 p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-violet-700 px-2.5 py-1 text-xs font-bold text-white">
                      <Grid className="h-3.5 w-3.5" />
                      Extended Matching Question (EMQ)
                    </span>
                    {currentQuestion.emqGroupId && (
                      <span className="rounded-md bg-white/80 px-2 py-0.5 font-mono text-xs font-semibold text-violet-800 ring-1 ring-violet-200">
                        Set: {currentQuestion.emqGroupId}
                      </span>
                    )}
                  </div>
                  {emqGroupSiblings.length > 1 && (
                    <span className="text-xs font-semibold text-violet-800">
                      Clinical Stem {currentStemPositionInGroup + 1} of{" "}
                      {emqGroupSiblings.length} in this Shared Option Set
                    </span>
                  )}
                </div>

                {currentQuestion.emqTheme && (
                  <p className="mt-2.5 text-sm font-bold text-slate-900">
                    Theme: {currentQuestion.emqTheme}
                  </p>
                )}
                <p className="mt-1 text-xs text-slate-600">
                  For each clinical presentation below, select the single most appropriate option from the shared{" "}
                  <strong>{optionsList.length}-option list (A–{optionsList[optionsList.length - 1]?.key || "J"})</strong>. Each option may be used once, more than once, or not at all.
                </p>

                {emqGroupSiblings.length > 1 && (
                  <div className="mt-3.5 flex flex-wrap items-center gap-2 border-t border-violet-200/70 pt-3">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-violet-800">
                      Linked Stems in Set:
                    </span>
                    {emqGroupSiblings.map((sib, sIdx) => {
                      const isActiveStem = sib.idx === currentIndex;
                      const sibAttempt = sib.q.attempt;
                      return (
                        <button
                          key={sib.q.id}
                          type="button"
                          onClick={() => setCurrentIndex(sib.idx)}
                          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${
                            isActiveStem
                              ? "border-violet-700 bg-violet-700 text-white shadow-sm"
                              : sibAttempt
                              ? sibAttempt.isCorrect
                                ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                                : "border-rose-300 bg-rose-50 text-rose-800"
                              : "border-violet-200 bg-white text-violet-900 hover:bg-violet-100/60"
                          }`}
                        >
                          <span>Stem {sIdx + 1} (Q{sib.idx + 1})</span>
                          {sibAttempt && (
                            <span className="font-bold">
                              · {sibAttempt.selectedOption}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              {/* Clinical Stem */}
              <div className="prose prose-slate max-w-none">
                <p className="text-base leading-relaxed text-slate-900 sm:text-[17px] sm:leading-8">
                  {currentQuestion.questionText}
                </p>
              </div>

              {/* Embedded Question Stem Photo / Diagnostic Figure */}
              {currentQuestion.questionImageUrl && (
                <ClinicalImage
                  rawUrl={currentQuestion.questionImageUrl}
                  caption={`Clinical Investigation Figure — ${currentQuestion.id}`}
                />
              )}

              {/* Answer Options Header for EMQ vs SBA */}
              <div className="mt-7 mb-3 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {isEmq
                    ? `Shared Extended Matching Option List (Options A–${
                        optionsList[optionsList.length - 1]?.key || "J"
                      })`
                    : "Select Single Best Answer (Options A–D)"}
                </span>
                <span className="text-xs text-slate-400">
                  {optionsList.length} Options Available
                </span>
              </div>

              {/* Options List (4 Options A–D for SBA, up to 10 Options A–J in 2-col grid for EMQ) */}
              <div
                className={
                  isEmq
                    ? "grid grid-cols-1 gap-2.5 sm:grid-cols-2"
                    : "space-y-3"
                }
              >
                {optionsList.map((opt) => {
                  const attempt = currentQuestion.attempt;
                  const isAnswered = Boolean(attempt);
                  const isSelected = attempt?.selectedOption === opt.key;
                  const isCorrectAnswer =
                    currentQuestion.correctAnswer === opt.key;

                  let cardStyle =
                    "border-slate-200 bg-white hover:border-clinical-500 hover:bg-clinical-50/30 cursor-pointer";
                  let badgeStyle =
                    "bg-slate-100 text-slate-700 border-slate-200";

                  if (isAnswered) {
                    if (isCorrectAnswer) {
                      cardStyle =
                        "border-emerald-500 bg-emerald-50/80 text-emerald-950 ring-1 ring-emerald-500 cursor-default";
                      badgeStyle =
                        "bg-emerald-600 text-white border-emerald-600";
                    } else if (isSelected && !isCorrectAnswer) {
                      cardStyle =
                        "border-rose-500 bg-rose-50/80 text-rose-950 ring-1 ring-rose-500 cursor-default";
                      badgeStyle = "bg-rose-600 text-white border-rose-600";
                    } else {
                      cardStyle =
                        "border-slate-200 bg-slate-50/60 text-slate-500 opacity-75 cursor-default";
                      badgeStyle =
                        "bg-slate-200 text-slate-500 border-slate-200";
                    }
                  } else if (submittingOption === opt.key) {
                    cardStyle =
                      "border-clinical-600 bg-clinical-50 ring-1 ring-clinical-600";
                    badgeStyle =
                      "bg-clinical-700 text-white border-clinical-700";
                  }

                  return (
                    <button
                      key={opt.key}
                      type="button"
                      disabled={isAnswered || Boolean(submittingOption)}
                      onClick={() => handleSelectOption(opt.key)}
                      className={`flex w-full items-start gap-3.5 rounded-xl border p-3.5 text-left transition ${cardStyle}`}
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-sm font-bold transition ${badgeStyle}`}
                      >
                        {opt.key}
                      </span>
                      <div className="flex-1 pt-1 text-sm font-medium leading-relaxed">
                        {opt.text}
                      </div>
                      {isAnswered && isCorrectAnswer && (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          Correct
                        </span>
                      )}
                      {isAnswered && isSelected && !isCorrectAnswer && (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-800">
                          <XCircle className="h-4 w-4 text-rose-600" />
                          Your Choice
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Immediate Feedback & Clinical Explanation Panel */}
              {currentQuestion.attempt && (
                <div
                  className={`mt-7 rounded-2xl border p-5 sm:p-6 ${
                    currentQuestion.attempt.isCorrect
                      ? "border-emerald-200 bg-emerald-50/50"
                      : "border-rose-200 bg-rose-50/40"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/70 pb-3.5">
                    <div className="flex items-center gap-2.5">
                      {currentQuestion.attempt.isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-rose-600" />
                      )}
                      <span
                        className={`text-sm font-bold ${
                          currentQuestion.attempt.isCorrect
                            ? "text-emerald-900"
                            : "text-rose-900"
                        }`}
                      >
                        {currentQuestion.attempt.isCorrect
                          ? "Correct! Well reasoned."
                          : `Incorrect — You selected Option ${currentQuestion.attempt.selectedOption}.`}
                      </span>
                    </div>
                    <span className="rounded-lg bg-white px-3 py-1 text-xs font-bold text-slate-800 shadow-sm ring-1 ring-slate-200">
                      Correct Answer: Option {currentQuestion.correctAnswer}
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-clinical-800">
                      <BookOpenCheck className="h-4 w-4 text-clinical-700" />
                      <span>RACP Clinical Rationale &amp; Guideline Reference</span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-slate-800">
                      {currentQuestion.explanation}
                    </p>

                    {/* Embedded Explanation Photo / Pathophysiology Diagram */}
                    {currentQuestion.explanationImageUrl && (
                      <ClinicalImage
                        rawUrl={currentQuestion.explanationImageUrl}
                        caption={`Explanation Reference Diagram — ${currentQuestion.id}`}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Navigation Footer */}
              <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5">
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-40 sm:text-sm"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Previous Question</span>
                </button>

                <div className="flex items-center gap-3">
                  {currentIndex < questions.length - 1 ? (
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentIndex((i) =>
                          Math.min(questions.length - 1, i + 1)
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-xl bg-clinical-700 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-clinical-800 sm:text-sm"
                    >
                      <span>Next Question</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowSummary(true)}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 sm:text-sm"
                    >
                      <Award className="h-4 w-4" />
                      <span>Finish &amp; View Results</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
