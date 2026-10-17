import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export type QuizFilterMode =
  | "all"
  | "new"
  | "incorrect"
  | "new_and_incorrect";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const specialties: string[] = Array.isArray(body.specialties)
      ? body.specialties.map((s: unknown) => String(s))
      : [];
    const requestedCount = Number(body.questionCount) || 5;
    const rawFilterMode = String(body.filterMode || "all").trim();
    const validModes = new Set([
      "all",
      "new",
      "incorrect",
      "new_and_incorrect",
    ]);
    const filterMode: QuizFilterMode = validModes.has(rawFilterMode)
      ? (rawFilterMode as QuizFilterMode)
      : "all";

    if (specialties.length === 0) {
      return NextResponse.json(
        { error: "Please select at least one medical specialty." },
        { status: 400 }
      );
    }

    const matchingQuestions = await prisma.question.findMany({
      where: {
        specialty: { in: specialties },
      },
      select: { id: true, questionImageUrl: true },
    });

    if (matchingQuestions.length === 0) {
      return NextResponse.json(
        { error: "No questions found for the selected specialties." },
        { status: 404 }
      );
    }

    // Determine user's latest attempt status per question
    const userAttempts = await prisma.quizAttempt.findMany({
      where: { userId: user.id },
      select: { questionId: true, isCorrect: true },
      orderBy: { answeredAt: "asc" },
    });

    const latestAttemptMap = new Map<string, boolean>();
    for (const att of userAttempts) {
      latestAttemptMap.set(att.questionId, att.isCorrect);
    }

    const filteredQuestions = matchingQuestions.filter((q) => {
      const latestStatus = latestAttemptMap.get(q.id);
      if (filterMode === "new") {
        return latestStatus === undefined;
      }
      if (filterMode === "incorrect") {
        return latestStatus === false;
      }
      if (filterMode === "new_and_incorrect") {
        return latestStatus === undefined || latestStatus === false;
      }
      return true; // "all"
    });

    if (filteredQuestions.length === 0) {
      return NextResponse.json(
        {
          error:
            "No questions match the selected question pool filter and specialties.",
        },
        { status: 404 }
      );
    }

    // Fisher-Yates shuffle, prioritizing questions with embedded clinical images first when available so trainees immediately see visual vignettes
    const shuffled = [...filteredQuestions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    shuffled.sort((a, b) => {
      const aHasImg = a.questionImageUrl ? 1 : 0;
      const bHasImg = b.questionImageUrl ? 1 : 0;
      return bHasImg - aHasImg;
    });

    const count = Math.max(1, Math.min(requestedCount, shuffled.length));
    const selectedIds = shuffled.slice(0, count).map((q) => q.id);

    const quizSession = await prisma.quizSession.create({
      data: {
        userId: user.id,
        specialties: JSON.stringify(specialties),
        filterMode,
        questionIds: JSON.stringify(selectedIds),
        totalQuestions: selectedIds.length,
      },
    });

    return NextResponse.json({
      sessionId: quizSession.id,
      totalQuestions: quizSession.totalQuestions,
      filterMode: quizSession.filterMode,
    });
  } catch (err) {
    console.error("[quiz/create] Error:", err);
    return NextResponse.json(
      { error: "Failed to generate custom quiz." },
      { status: 500 }
    );
  }
}
