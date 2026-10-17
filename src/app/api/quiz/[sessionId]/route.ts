import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const session = await prisma.quizSession.findFirst({
    where: {
      id: params.sessionId,
      userId: user.id,
    },
    include: {
      attempts: true,
    },
  });

  if (!session) {
    return NextResponse.json(
      { error: "Quiz session not found." },
      { status: 404 }
    );
  }

  const questionIds: string[] = JSON.parse(session.questionIds);
  const questions = await prisma.question.findMany({
    where: { id: { in: questionIds } },
  });

  const questionMap = new Map(questions.map((q) => [q.id, q]));
  const attemptMap = new Map(session.attempts.map((a) => [a.questionId, a]));

  const orderedQuestions = questionIds
    .map((id) => {
      const q = questionMap.get(id);
      if (!q) return null;
      const attempt = attemptMap.get(id);
      return {
        id: q.id,
        specialty: q.specialty,
        questionText: q.questionText,
        questionImageUrl: q.questionImageUrl,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        // Reveal correctAnswer, explanation, and explanationImageUrl immediately if already answered
        correctAnswer: attempt ? q.correctAnswer : undefined,
        explanation: attempt ? q.explanation : undefined,
        explanationImageUrl: attempt ? q.explanationImageUrl : undefined,
        attempt: attempt
          ? {
              selectedOption: attempt.selectedOption,
              isCorrect: attempt.isCorrect,
              answeredAt: attempt.answeredAt,
            }
          : null,
      };
    })
    .filter(Boolean);

  return NextResponse.json({
    session: {
      id: session.id,
      specialties: JSON.parse(session.specialties) as string[],
      filterMode: session.filterMode,
      totalQuestions: session.totalQuestions,
      completedAt: session.completedAt,
      createdAt: session.createdAt,
      answeredCount: session.attempts.length,
      correctCount: session.attempts.filter((a) => a.isCorrect).length,
    },
    questions: orderedQuestions,
  });
}
