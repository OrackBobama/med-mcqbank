import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const questions = await prisma.question.findMany({
    select: {
      id: true,
      specialty: true,
    },
  });

  // Order attempts chronologically so we can determine both total attempts and the LATEST attempt per question
  const userAttempts = await prisma.quizAttempt.findMany({
    where: { userId: user.id },
    include: {
      question: {
        select: { specialty: true },
      },
    },
    orderBy: { answeredAt: "asc" },
  });

  // Track latest attempt status per questionId
  const latestAttemptByQuestion = new Map<string, boolean>();
  for (const att of userAttempts) {
    latestAttemptByQuestion.set(att.questionId, att.isCorrect);
  }

  const specialtyMap = new Map<
    string,
    {
      specialty: string;
      totalQuestions: number;
      newCount: number;
      incorrectCount: number;
      newAndIncorrectCount: number;
      attemptedCount: number;
      correctCount: number;
    }
  >();

  for (const q of questions) {
    const entry = specialtyMap.get(q.specialty) || {
      specialty: q.specialty,
      totalQuestions: 0,
      newCount: 0,
      incorrectCount: 0,
      newAndIncorrectCount: 0,
      attemptedCount: 0,
      correctCount: 0,
    };
    entry.totalQuestions += 1;

    const latestStatus = latestAttemptByQuestion.get(q.id);
    if (latestStatus === undefined) {
      // Never attempted -> New
      entry.newCount += 1;
      entry.newAndIncorrectCount += 1;
    } else if (latestStatus === false) {
      // Latest attempt was wrong -> Incorrect
      entry.incorrectCount += 1;
      entry.newAndIncorrectCount += 1;
    }

    specialtyMap.set(q.specialty, entry);
  }

  for (const att of userAttempts) {
    const spec = att.question.specialty;
    const entry = specialtyMap.get(spec);
    if (entry) {
      entry.attemptedCount += 1;
      if (att.isCorrect) entry.correctCount += 1;
    }
  }

  const specialties = Array.from(specialtyMap.values())
    .map((item) => ({
      ...item,
      accuracy:
        item.attemptedCount > 0
          ? Math.round((item.correctCount / item.attemptedCount) * 100)
          : null,
    }))
    .sort((a, b) => a.specialty.localeCompare(b.specialty));

  return NextResponse.json({
    specialties,
    totalBankSize: questions.length,
  });
}
