import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface RawQuestionRow {
  id: string;
  specialty: string;
  questionText: string;
  questionImageUrl?: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string;
  explanationImageUrl?: string;
}

export async function ingestQuestionsFromFile(filePath: string) {
  const resolvedPath = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Question file not found at: ${resolvedPath}`);
  }

  const ext = path.extname(resolvedPath).toLowerCase();
  const content = fs.readFileSync(resolvedPath, "utf8");

  let rows: RawQuestionRow[] = [];

  if (ext === ".json") {
    rows = JSON.parse(content);
  } else if (ext === ".csv") {
    rows = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
  } else {
    throw new Error(`Unsupported file extension '${ext}'. Use .csv or .json`);
  }

  const validOptions = new Set(["A", "B", "C", "D"]);
  let upsertedCount = 0;

  for (const row of rows) {
    const answer = String(row.correctAnswer || "").trim().toUpperCase();
    if (!validOptions.has(answer)) {
      throw new Error(
        `Invalid correctAnswer '${row.correctAnswer}' for question '${row.id}'. Must be A, B, C, or D.`
      );
    }

    const qImage = row.questionImageUrl?.trim() || null;
    const expImage = row.explanationImageUrl?.trim() || null;

    await prisma.question.upsert({
      where: { id: row.id.trim() },
      update: {
        specialty: row.specialty.trim(),
        questionText: row.questionText.trim(),
        questionImageUrl: qImage,
        optionA: row.optionA.trim(),
        optionB: row.optionB.trim(),
        optionC: row.optionC.trim(),
        optionD: row.optionD.trim(),
        correctAnswer: answer,
        explanation: row.explanation.trim(),
        explanationImageUrl: expImage,
      },
      create: {
        id: row.id.trim(),
        specialty: row.specialty.trim(),
        questionText: row.questionText.trim(),
        questionImageUrl: qImage,
        optionA: row.optionA.trim(),
        optionB: row.optionB.trim(),
        optionC: row.optionC.trim(),
        optionD: row.optionD.trim(),
        correctAnswer: answer,
        explanation: row.explanation.trim(),
        explanationImageUrl: expImage,
      },
    });
    upsertedCount++;
  }

  return upsertedCount;
}

if (require.main === module) {
  const targetFile = process.argv[2] || "data/racp_questions.csv";
  console.log(`[RACP Ingest] Reading questions from ${targetFile}...`);
  ingestQuestionsFromFile(targetFile)
    .then((count) => {
      console.log(
        `[RACP Ingest] Successfully ingested ${count} RACP questions (Options A-D, with clinical media support).`
      );
      process.exit(0);
    })
    .catch((err) => {
      console.error("[RACP Ingest] Failed:", err);
      process.exit(1);
    });
}
