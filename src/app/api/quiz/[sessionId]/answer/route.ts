import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const questionId = String(body.questionId || "").trim();
    const selectedOption = String(body.selectedOption || "")
      .trim()
      .toUpperCase();

    if (!["A", "B", "C", "D"].includes(selectedOption)) {
      return NextResponse.json(
        { error: "Selected option must be A, B, C, or D." },
        { status: 400 }
      );
    }

    const session = await prisma.quizSession.findFirst({
      where: {
        id: params.sessionId,
        userId: user.id,
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Quiz session not found." },
        { status: 404 }
      );
    }

    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return NextResponse.json(
        { error: "Question not found." },
        { status: 404 }
      );
    }

    const isCorrect = question.correctAnswer.toUpperCase() === selectedOption;

    // Upsert attempt for this session + question
    const attempt = await prisma.quizAttempt.upsert({
      where: {
        sessionId_questionId: {
          sessionId: session.id,
          questionId: question.id,
        },
      },
      update: {
        selectedOption,
        isCorrect,
        answeredAt: new Date(),
      },
      create: {
        sessionId: session.id,
        userId: user.id,
        questionId: question.id,
        selectedOption,
        isCorrect,
      },
    });

    // Check if all questions in this session have been answered
    const allAttempts = await prisma.quizAttempt.findMany({
      where: { sessionId: session.id },
    });

    let completedAt = session.completedAt;
    if (allAttempts.length >= session.totalQuestions && !completedAt) {
      const updated = await prisma.quizSession.update({
        where: { id: session.id },
        data: { completedAt: new Date() },
      });
      completedAt = updated.completedAt;
    }

    return NextResponse.json({
      attempt: {
        selectedOption: attempt.selectedOption,
        isCorrect: attempt.isCorrect,
        answeredAt: attempt.answeredAt,
      },
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      explanationImageUrl: question.explanationImageUrl,
      sessionStats: {
        answeredCount: allAttempts.length,
        correctCount: allAttempts.filter((a) => a.isCorrect).length,
        totalQuestions: session.totalQuestions,
        completedAt,
      },
    });
  } catch (err) {
    console.error("[quiz/answer] Error:", err);
    return NextResponse.json(
      { error: "Failed to submit answer." },
      { status: 500 }
    );
  }
}
