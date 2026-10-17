import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawEmail = String(body.email || "").trim().toLowerCase();
    const rawCode = String(body.code || "").trim();
    const rawName = body.name ? String(body.name).trim() : undefined;
    const rawTrainingLevel = body.trainingLevel
      ? String(body.trainingLevel).trim()
      : undefined;
    const rawHospital = body.hospital ? String(body.hospital).trim() : undefined;
    const isRegistration = Boolean(body.isRegistration);

    if (!rawEmail || !rawCode) {
      return NextResponse.json(
        { error: "Email and 6-digit passcode are required." },
        { status: 400 }
      );
    }

    if (isRegistration) {
      const existingUser = await prisma.user.findUnique({
        where: { email: rawEmail },
        select: { id: true, email: true },
      });

      if (existingUser) {
        return NextResponse.json(
          {
            error:
              "This email address is already registered. Redirecting you to the sign-in page.",
            code: "EMAIL_ALREADY_REGISTERED",
            email: rawEmail,
          },
          { status: 409 }
        );
      }
    }

    const otpRecord = await prisma.otpToken.findFirst({
      where: {
        email: rawEmail,
        code: rawCode,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      return NextResponse.json(
        {
          error:
            "Invalid or expired one-time passcode. Please request a new code.",
        },
        { status: 401 }
      );
    }

    // Mark OTP as used
    await prisma.otpToken.update({
      where: { id: otpRecord.id },
      data: { used: true },
    });

    // Upsert User record with any registration profile details provided
    const defaultName = rawEmail
      .split("@")[0]
      .replace(/[._-]/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

    const updateData: {
      name?: string;
      trainingLevel?: string;
      hospital?: string;
    } = {};
    if (rawName) updateData.name = rawName;
    if (rawTrainingLevel) updateData.trainingLevel = rawTrainingLevel;
    if (rawHospital) updateData.hospital = rawHospital;

    const user = await prisma.user.upsert({
      where: { email: rawEmail },
      update: updateData,
      create: {
        email: rawEmail,
        name: rawName || `Dr. ${defaultName}`,
        trainingLevel: rawTrainingLevel || "BPT Trainee",
        hospital: rawHospital || null,
      },
    });

    const token = createSessionToken(user.id, user.email);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        trainingLevel: user.trainingLevel,
        hospital: user.hospital,
      },
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err) {
    console.error("[verify-otp] Error:", err);
    return NextResponse.json(
      { error: "Failed to verify passcode." },
      { status: 500 }
    );
  }
}
