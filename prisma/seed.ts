import { ingestQuestionsFromFile } from "../scripts/ingest-csv";

async function main() {
  console.log("Seeding RACP Divisional Written Examination Question Bank...");
  const count = await ingestQuestionsFromFile("data/racp_questions.csv");
  console.log(`Seeded ${count} questions across 5 RACP specialties.`);
}

main().catch((err) => {
  console.error("Error seeding database:", err);
  process.exit(1);
});
