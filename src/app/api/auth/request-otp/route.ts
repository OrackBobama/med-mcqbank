import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawEmail = String(body.email || "").trim().toLowerCase();

    if (!rawEmail || !rawEmail.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid clinical or institutional email address." },
        { status: 400 }
      );
    }

    // Generate a 6-digit numeric OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Invalidate previous unused OTPs for this email
    await prisma.otpToken.updateMany({
      where: { email: rawEmail, used: false },
      data: { used: true },
    });

    await prisma.otpToken.create({
      data: {
        email: rawEmail,
        code,
        expiresAt,
      },
    });

    console.log(
      `\n=========================================================\n` +
        `[RACP Auth] One-Time Passcode for ${rawEmail}: ${code}\n` +
        `Expires at: ${expiresAt.toISOString()}\n` +
        `=========================================================\n`
    );

    return NextResponse.json({
      success: true,
      email: rawEmail,
      message: "A 6-digit one-time passcode has been sent to your email.",
      // Expose devOtp in non-production environments to simplify local development & testing
      devOtp: process.env.NODE_ENV !== "production" ? code : undefined,
    });
  } catch (err) {
    console.error("[request-otp] Error:", err);
    return NextResponse.json(
      { error: "Failed to generate one-time passcode." },
      { status: 500 }
    );
  }
}
