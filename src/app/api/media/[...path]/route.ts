import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

const MIME_MAP: Record<string, string> = {
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const segments = params.path || [];
    if (segments.length === 0) {
      return NextResponse.json({ error: "Missing media path" }, { status: 400 });
    }

    // Normalize relative path: strip leading "data/" or "images/" if included so both
    // "data/images/foo.svg", "images/foo.svg", and "foo.svg" resolve cleanly inside data/images/
    let relativePath = segments.join("/");
    relativePath = relativePath.replace(/^data\//, "").replace(/^images\//, "");

    const baseDir = path.resolve(process.cwd(), "data", "images");
    const candidatePath = path.resolve(baseDir, relativePath);

    // Prevent path traversal outside data/images
    if (!candidatePath.startsWith(baseDir)) {
      return NextResponse.json({ error: "Forbidden path" }, { status: 403 });
    }

    if (!fs.existsSync(candidatePath) || !fs.statSync(candidatePath).isFile()) {
      return NextResponse.json(
        { error: `Media file not found: ${relativePath}` },
        { status: 404 }
      );
    }

    const ext = path.extname(candidatePath).toLowerCase();
    const contentType = MIME_MAP[ext] || "application/octet-stream";
    const fileBuffer = fs.readFileSync(candidatePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("[api/media] Error serving file:", err);
    return NextResponse.json(
      { error: "Failed to serve media file" },
      { status: 500 }
    );
  }
}
