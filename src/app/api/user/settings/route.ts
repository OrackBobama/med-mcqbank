import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createSessionToken,
  getAuthenticatedUser,
  SESSION_COOKIE_NAME,
} from "@/lib/auth";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      trainingLevel: user.trainingLevel,
      hospital: user.hospital,
      state: user.state,
      specialtyInterest: user.specialtyInterest,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      examDate: user.examDate,
      themeMode: user.themeMode,
      accentColor: user.accentColor,
    },
  });
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const updateData: {
      name?: string | null;
      email?: string;
      trainingLevel?: string | null;
      hospital?: string | null;
      state?: string | null;
      specialtyInterest?: string | null;
      phone?: string | null;
      avatarUrl?: string | null;
      examDate?: Date | null;
      themeMode?: string;
      accentColor?: string;
    } = {};

    if (body.name !== undefined) {
      updateData.name = String(body.name || "").trim() || null;
    }

    if (body.email !== undefined) {
      const nextEmail = String(body.email || "")
        .trim()
        .toLowerCase();
      if (!nextEmail || !nextEmail.includes("@")) {
        return NextResponse.json(
          { error: "Please provide a valid email address." },
          { status: 400 }
        );
      }

      if (nextEmail !== user.email) {
        const existing = await prisma.user.findUnique({
          where: { email: nextEmail },
        });
        if (existing && existing.id !== user.id) {
          return NextResponse.json(
            {
              error:
                "That email address is already associated with another Fracto account.",
            },
            { status: 409 }
          );
        }
        updateData.email = nextEmail;
      }
    }

    if (body.trainingLevel !== undefined) {
      updateData.trainingLevel =
        String(body.trainingLevel || "").trim() || null;
    }
    if (body.hospital !== undefined) {
      updateData.hospital = String(body.hospital || "").trim() || null;
    }
    if (body.state !== undefined) {
      updateData.state = String(body.state || "").trim() || null;
    }
    if (body.specialtyInterest !== undefined) {
      updateData.specialtyInterest =
        String(body.specialtyInterest || "").trim() || null;
    }
    if (body.phone !== undefined) {
      updateData.phone = String(body.phone || "").trim() || null;
    }
    if (body.avatarUrl !== undefined) {
      updateData.avatarUrl = String(body.avatarUrl || "").trim() || null;
    }

    if (body.examDate !== undefined) {
      if (!body.examDate) {
        updateData.examDate = null;
      } else {
        const parsedDate = new Date(body.examDate);
        if (isNaN(parsedDate.getTime())) {
          return NextResponse.json(
            { error: "Invalid examination date format." },
            { status: 400 }
          );
        }
        updateData.examDate = parsedDate;
      }
    }

    if (body.themeMode !== undefined) {
      updateData.themeMode = body.themeMode === "dark" ? "dark" : "light";
    }
    if (body.accentColor !== undefined) {
      const validAccents = new Set([
        "clinical",
        "emerald",
        "violet",
        "rose",
        "amber",
      ]);
      const rawAccent = String(body.accentColor).trim();
      if (validAccents.has(rawAccent)) {
        updateData.accentColor = rawAccent;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        trainingLevel: updatedUser.trainingLevel,
        hospital: updatedUser.hospital,
        state: updatedUser.state,
        specialtyInterest: updatedUser.specialtyInterest,
        phone: updatedUser.phone,
        avatarUrl: updatedUser.avatarUrl,
        examDate: updatedUser.examDate,
        themeMode: updatedUser.themeMode,
        accentColor: updatedUser.accentColor,
      },
    });

    // Refresh session cookie if email changed
    if (updateData.email) {
      const newToken = createSessionToken(updatedUser.id, updatedUser.email);
      response.cookies.set(SESSION_COOKIE_NAME, newToken, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return response;
  } catch (err) {
    console.error("[api/user/settings] Error:", err);
    return NextResponse.json(
      { error: "Failed to save user settings." },
      { status: 500 }
    );
  }
}
