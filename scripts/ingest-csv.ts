import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface RawQuestionRow {
  id: string;
  questionType?: string; // "SBA" | "EMQ"
  emqGroupId?: string;
  emqTheme?: string;
  specialty: string;
  questionText: string;
  questionImageUrl?: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  optionsJson?: string | Record<string, string>;
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

  const validSbaOptions = new Set(["A", "B", "C", "D"]);
  const validEmqOptions = new Set([
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
  ]);
  let upsertedCount = 0;

  for (const row of rows) {
    const qType =
      String(row.questionType || "SBA")
        .trim()
        .toUpperCase() === "EMQ"
        ? "EMQ"
        : "SBA";
    const answer = String(row.correctAnswer || "").trim().toUpperCase();

    if (qType === "SBA" && !validSbaOptions.has(answer)) {
      throw new Error(
        `Invalid SBA correctAnswer '${row.correctAnswer}' for question '${row.id}'. Must be A, B, C, or D.`
      );
    }
    if (qType === "EMQ" && !validEmqOptions.has(answer)) {
      throw new Error(
        `Invalid EMQ correctAnswer '${row.correctAnswer}' for question '${row.id}'. Must be A through J.`
      );
    }

    const qImage = row.questionImageUrl?.trim() || null;
    const expImage = row.explanationImageUrl?.trim() || null;
    const emqGroupId = row.emqGroupId?.trim() || null;
    const emqTheme = row.emqTheme?.trim() || null;

    let optionsJsonStr: string | null = null;
    if (row.optionsJson) {
      optionsJsonStr =
        typeof row.optionsJson === "string"
          ? row.optionsJson.trim() || null
          : JSON.stringify(row.optionsJson);
    }

    await prisma.question.upsert({
      where: { id: row.id.trim() },
      update: {
        questionType: qType,
        emqGroupId,
        emqTheme,
        specialty: row.specialty.trim(),
        questionText: row.questionText.trim(),
        questionImageUrl: qImage,
        optionA: (row.optionA || "").trim(),
        optionB: (row.optionB || "").trim(),
        optionC: (row.optionC || "").trim(),
        optionD: (row.optionD || "").trim(),
        optionsJson: optionsJsonStr,
        correctAnswer: answer,
        explanation: row.explanation.trim(),
        explanationImageUrl: expImage,
      },
      create: {
        id: row.id.trim(),
        questionType: qType,
        emqGroupId,
        emqTheme,
        specialty: row.specialty.trim(),
        questionText: row.questionText.trim(),
        questionImageUrl: qImage,
        optionA: (row.optionA || "").trim(),
        optionB: (row.optionB || "").trim(),
        optionC: (row.optionC || "").trim(),
        optionD: (row.optionD || "").trim(),
        optionsJson: optionsJsonStr,
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
  console.log(`[Fracto Ingest] Reading questions from ${targetFile}...`);
  ingestQuestionsFromFile(targetFile)
    .then((count) => {
      console.log(
        `[Fracto Ingest] Successfully ingested ${count} RACP questions (SBA & EMQ formats).`
      );
      process.exit(0);
    })
    .catch((err) => {
      console.error("[Fracto Ingest] Failed:", err);
      process.exit(1);
    });
}
