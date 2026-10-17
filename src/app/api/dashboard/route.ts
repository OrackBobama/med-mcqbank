import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [allQuestions, attempts, sessions] = await Promise.all([
    prisma.question.findMany({
      select: { id: true, specialty: true },
    }),
    prisma.quizAttempt.findMany({
      where: { userId: user.id },
      include: {
        question: {
          select: { specialty: true },
        },
      },
      orderBy: { answeredAt: "asc" },
    }),
    prisma.quizSession.findMany({
      where: { userId: user.id },
      include: {
        attempts: true,
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const totalAttempts = attempts.length;
  const totalCorrect = attempts.filter((a) => a.isCorrect).length;
  const overallAccuracy =
    totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  const uniqueQuestionsAnswered = new Set(attempts.map((a) => a.questionId))
    .size;

  // Specialty breakdown
  const specialtyMap = new Map<
    string,
    {
      specialty: string;
      totalBankQuestions: number;
      attempted: number;
      correct: number;
    }
  >();

  for (const q of allQuestions) {
    const entry = specialtyMap.get(q.specialty) || {
      specialty: q.specialty,
      totalBankQuestions: 0,
      attempted: 0,
      correct: 0,
    };
    entry.totalBankQuestions += 1;
    specialtyMap.set(q.specialty, entry);
  }

  for (const att of attempts) {
    const spec = att.question.specialty;
    const entry = specialtyMap.get(spec);
    if (entry) {
      entry.attempted += 1;
      if (att.isCorrect) entry.correct += 1;
    }
  }

  const specialtyBreakdown = Array.from(specialtyMap.values())
    .map((s) => ({
      ...s,
      accuracy:
        s.attempted > 0 ? Math.round((s.correct / s.attempted) * 100) : null,
    }))
    .sort((a, b) => a.specialty.localeCompare(b.specialty));

  // Score trend over time (include sessions that have at least 1 answered question)
  const scoreTrend = sessions
    .filter((s) => s.attempts.length > 0)
    .map((s, idx) => {
      const answered = s.attempts.length;
      const correct = s.attempts.filter((a) => a.isCorrect).length;
      const accuracy = Math.round((correct / answered) * 100);
      return {
        sessionId: s.id,
        sessionNumber: idx + 1,
        label: `Quiz #${idx + 1}`,
        specialties: JSON.parse(s.specialties) as string[],
        answered,
        correct,
        totalQuestions: s.totalQuestions,
        accuracy,
        createdAt: s.createdAt,
        completedAt: s.completedAt,
      };
    });

  // Recent sessions (newest first)
  const recentSessions = [...sessions].reverse().map((s) => {
    const answered = s.attempts.length;
    const correct = s.attempts.filter((a) => a.isCorrect).length;
    const accuracy =
      answered > 0 ? Math.round((correct / answered) * 100) : null;
    return {
      id: s.id,
      specialties: JSON.parse(s.specialties) as string[],
      totalQuestions: s.totalQuestions,
      answeredCount: answered,
      correctCount: correct,
      accuracy,
      createdAt: s.createdAt,
      completedAt: s.completedAt,
    };
  });

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      trainingLevel: user.trainingLevel,
      hospital: user.hospital,
      state: user.state,
      specialtyInterest: user.specialtyInterest,
      avatarUrl: user.avatarUrl,
      examDate: user.examDate,
      themeMode: user.themeMode,
      accentColor: user.accentColor,
    },
    summary: {
      overallAccuracy,
      totalAttempts,
      totalCorrect,
      uniqueQuestionsAnswered,
      totalBankSize: allQuestions.length,
      totalSessions: sessions.length,
      completedSessions: sessions.filter(
        (s) => s.completedAt !== null || s.attempts.length >= s.totalQuestions
      ).length,
    },
    specialtyBreakdown,
    scoreTrend,
    recentSessions,
  });
}
