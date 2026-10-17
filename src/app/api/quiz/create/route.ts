import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export type QuizFilterMode =
  | "all"
  | "new"
  | "incorrect"
  | "new_and_incorrect";

export type QuestionTypeFilter = "all" | "SBA" | "EMQ";

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

    const rawTypeFilter = String(body.questionTypeFilter || "all").trim();
    const validTypeFilters = new Set(["all", "SBA", "EMQ"]);
    const questionTypeFilter: QuestionTypeFilter = validTypeFilters.has(
      rawTypeFilter
    )
      ? (rawTypeFilter as QuestionTypeFilter)
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
        ...(questionTypeFilter !== "all"
          ? { questionType: questionTypeFilter }
          : {}),
      },
      select: {
        id: true,
        questionImageUrl: true,
        questionType: true,
        emqGroupId: true,
      },
      orderBy: { id: "asc" },
    });

    if (matchingQuestions.length === 0) {
      return NextResponse.json(
        { error: "No questions found for the selected specialties and format." },
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
            "No questions match the selected question pool filter, format, and specialties.",
        },
        { status: 404 }
      );
    }

    // Group EMQ questions by emqGroupId so linked stems stay together in order
    type QuestionItem = (typeof filteredQuestions)[number];
    const blocks: QuestionItem[][] = [];
    const emqGroupMap = new Map<string, QuestionItem[]>();

    for (const q of filteredQuestions) {
      if (q.questionType === "EMQ" && q.emqGroupId) {
        const list = emqGroupMap.get(q.emqGroupId) || [];
        list.push(q);
        emqGroupMap.set(q.emqGroupId, list);
      } else {
        blocks.push([q]);
      }
    }

    Array.from(emqGroupMap.values()).forEach((groupItems) => {
      groupItems.sort((a, b) => a.id.localeCompare(b.id));
      blocks.push(groupItems);
    });

    // Fisher-Yates shuffle of blocks
    for (let i = blocks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
    }

    // Prioritize blocks with embedded clinical images when questionTypeFilter is not strictly EMQ
    if (questionTypeFilter !== "EMQ") {
      blocks.sort((a, b) => {
        const aHasImg = a.some((q) => q.questionImageUrl) ? 1 : 0;
        const bHasImg = b.some((q) => q.questionImageUrl) ? 1 : 0;
        return bHasImg - aHasImg;
      });
    }

    const flattened = blocks.flat();
    const count = Math.max(1, Math.min(requestedCount, flattened.length));
    const selectedIds = flattened.slice(0, count).map((q) => q.id);

    const quizSession = await prisma.quizSession.create({
      data: {
        userId: user.id,
        specialties: JSON.stringify(specialties),
        filterMode,
        questionTypeFilter,
        questionIds: JSON.stringify(selectedIds),
        totalQuestions: selectedIds.length,
      },
    });

    return NextResponse.json({
      sessionId: quizSession.id,
      totalQuestions: quizSession.totalQuestions,
      filterMode: quizSession.filterMode,
      questionTypeFilter: quizSession.questionTypeFilter,
    });
  } catch (err) {
    console.error("[quiz/create] Error:", err);
    return NextResponse.json(
      { error: "Failed to generate custom quiz." },
      { status: 500 }
    );
  }
}
