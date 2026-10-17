"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FractoLogo from "@/components/FractoLogo";
import {
  User,
  Mail,
  Building2,
  GraduationCap,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  UserPlus,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<"profile" | "otp">("profile");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [trainingLevel, setTrainingLevel] = useState("BPT 2");
  const [hospital, setHospital] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send verification passcode.");
        return;
      }

      setInfoMessage(
        data.message ||
          `We sent a 6-digit verification passcode to ${email}. Please check your inbox.`
      );
      setStep("otp");
    } catch {
      setError("Network error while requesting verification passcode.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code: otpCode,
          name,
          trainingLevel,
          hospital,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid verification code.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error while completing registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link
          href="/"
          className="mx-auto flex w-fit items-center justify-center transition hover:scale-105"
        >
          <FractoLogo size={60} className="drop-shadow-md" />
        </Link>
        <h1 className="mt-4 text-center text-2xl font-extrabold tracking-tight text-slate-900">
          Create Your Fracto Account
        </h1>
        <p className="mt-1 text-center text-sm text-slate-600">
          RACP Divisional Written Examination Practice &amp; Analytics
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-2xl border border-slate-200/90 bg-white px-6 py-8 shadow-sm sm:px-10">
          <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                {step === "profile"
                  ? "Trainee Profile Details"
                  : "Verify Trainee Email"}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {step === "profile"
                  ? "Step 1 of 2 — Enter your clinical training details"
                  : `Step 2 of 2 — Enter the 6-digit OTP emailed to ${email}`}
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-clinical-50 px-2.5 py-1 text-xs font-medium text-clinical-700 ring-1 ring-inset ring-clinical-200">
              <UserPlus className="h-3.5 w-3.5" />
              Register
            </span>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-medium text-rose-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {step === "profile" ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
                >
                  Full Name &amp; Title
                </label>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Dr. Clara Vance"
                    className="block w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-clinical-600 focus:outline-none focus:ring-2 focus:ring-clinical-500/20"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
                >
                  Hospital or Institutional Email
                </label>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="block w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-clinical-600 focus:outline-none focus:ring-2 focus:ring-clinical-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="trainingLevel"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
                  >
                    Training Level
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <GraduationCap className="h-4 w-4" />
                    </div>
                    <select
                      id="trainingLevel"
                      name="trainingLevel"
                      value={trainingLevel}
                      onChange={(e) => setTrainingLevel(e.target.value)}
                      className="block w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 shadow-sm focus:border-clinical-600 focus:outline-none focus:ring-2 focus:ring-clinical-500/20"
                    >
                      <option value="BPT 1">BPT Year 1</option>
                      <option value="BPT 2">BPT Year 2</option>
                      <option value="BPT 3">BPT Year 3</option>
                      <option value="OTP / Fellow">OTP / Advanced Trainee</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="hospital"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
                  >
                    Primary Hospital
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <input
                      id="hospital"
                      name="hospital"
                      type="text"
                      required
                      value={hospital}
                      onChange={(e) => setHospital(e.target.value)}
                      placeholder="Royal Melbourne"
                      className="block w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-clinical-600 focus:outline-none focus:ring-2 focus:ring-clinical-500/20"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-clinical-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-clinical-800 focus:outline-none focus:ring-2 focus:ring-clinical-600 focus:ring-offset-2 disabled:opacity-60"
              >
                <span>
                  {loading
                    ? "Sending Verification OTP..."
                    : "Continue & Send Email OTP"}
                </span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyAndRegister} className="space-y-5">
              {infoMessage && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 p-3.5 text-xs font-medium text-emerald-900">
                  {infoMessage}
                </div>
              )}

              <div>
                <label
                  htmlFor="otp"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
                >
                  6-Digit One-Time Passcode
                </label>
                <div className="relative mt-2">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    required
                    value={otpCode}
                    onChange={(e) =>
                      setOtpCode(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="123456"
                    className="block w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 font-mono text-base tracking-[0.35em] text-slate-900 placeholder-slate-300 shadow-sm focus:border-clinical-600 focus:outline-none focus:ring-2 focus:ring-clinical-500/20"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <button
                  type="submit"
                  disabled={loading || otpCode.length !== 6}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-clinical-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-clinical-800 focus:outline-none focus:ring-2 focus:ring-clinical-600 focus:ring-offset-2 disabled:opacity-60"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>
                    {loading
                      ? "Completing Registration..."
                      : "Complete Registration & Launch Portal"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep("profile");
                    setOtpCode("");
                    setError(null);
                    setInfoMessage(null);
                  }}
                  className="text-center text-xs font-medium text-slate-500 hover:text-slate-800"
                >
                  Edit trainee profile details
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 border-t border-slate-100 pt-5 text-center text-xs text-slate-600">
            Already have a trainee account?{" "}
            <Link
              href="/login"
              className="font-semibold text-clinical-700 hover:underline"
            >
              Sign in with Email OTP
            </Link>{" "}
            ·{" "}
            <Link href="/" className="text-slate-500 hover:text-slate-800">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
