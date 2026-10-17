import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOtpEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawEmail = String(body.email || "").trim().toLowerCase();

    if (!rawEmail || !rawEmail.includes("@")) {
      return NextResponse.json(
        {
          error:
            "Please enter a valid clinical or institutional email address.",
        },
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

    // Send transactional OTP email via Resend
    await sendOtpEmail({
      to: rawEmail,
      code,
    });

    return NextResponse.json({
      success: true,
      email: rawEmail,
      message: "A 6-digit one-time passcode has been sent to your email.",
    });
  } catch (err) {
    console.error("[request-otp] Error:", err);
    const errorMessage =
      err instanceof Error
        ? err.message
        : "Failed to send one-time passcode email.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
