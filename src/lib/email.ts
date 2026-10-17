import { Resend } from "resend";

export interface SendOtpEmailParams {
  to: string;
  code: string;
}

export async function sendOtpEmail({ to, code }: SendOtpEmailParams) {
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY is not configured in server environment variables."
    );
  }

  const resend = new Resend(apiKey);
  const fromAddress =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "RACP Written Exam Prep <noreply@mcq.baal.au>";

  const { data, error } = await resend.emails.send({
    from: fromAddress,
    to: [to],
    subject: `${code} is your RACP MCQ Bank One-Time Passcode`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background-color: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0;">
        <div style="background-color: #ffffff; padding: 28px; border-radius: 12px; border: 1px solid #e2e8f0;">
          <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #01599f;">
            RACP Divisional Written Examination
          </p>
          <h1 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #0f172a;">
            Your One-Time Passcode (OTP)
          </h1>
          <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #475569;">
            Enter the 6-digit verification code below to sign in to the Basic Physician Training MCQ Question Bank. This code expires in <strong>10 minutes</strong>.
          </p>
          <div style="background-color: #f0f7ff; border: 1px solid #bae0fd; border-radius: 12px; padding: 18px; text-align: center; margin-bottom: 24px;">
            <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 32px; font-weight: 800; letter-spacing: 0.3em; color: #072849;">
              ${code}
            </span>
          </div>
          <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.5;">
            If you did not request this passcode, you can safely ignore this email.
          </p>
        </div>
      </div>
    `,
    text: `RACP Divisional Written Examination MCQ Bank\n\nYour 6-digit One-Time Passcode is: ${code}\n\nThis code expires in 10 minutes.`,
  });

  if (error) {
    throw new Error(error.message || "Failed to send email via Resend.");
  }

  return data;
}
