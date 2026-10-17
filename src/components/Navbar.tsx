"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Stethoscope,
  LayoutDashboard,
  FilePlus2,
  LogOut,
  UserCheck,
} from "lucide-react";

interface NavbarProps {
  userEmail?: string;
  userName?: string | null;
}

export default function Navbar({ userEmail, userName }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-clinical-800 text-white shadow-sm transition group-hover:bg-clinical-700">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-slate-900">
                RACP Written Exam Prep
              </span>
              <span className="hidden rounded-md bg-clinical-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-clinical-700 ring-1 ring-inset ring-clinical-200 sm:inline-block">
                Divisional MCQ Bank
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Basic Physician Training Clinical Question Portal
            </p>
          </div>
        </Link>

        {userEmail && (
          <div className="flex items-center gap-2 sm:gap-4">
            <nav className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
              <Link
                href="/dashboard"
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
                  pathname === "/dashboard"
                    ? "bg-white text-clinical-800 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/quiz/new"
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
                  pathname?.startsWith("/quiz")
                    ? "bg-white text-clinical-800 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <FilePlus2 className="h-4 w-4" />
                <span>New Quiz</span>
              </Link>
            </nav>

            <div className="hidden items-center gap-2 border-l border-slate-200 pl-4 md:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-clinical-50 text-clinical-700 ring-1 ring-clinical-200">
                <UserCheck className="h-4 w-4" />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-slate-800">
                  {userName || "BPT Trainee"}
                </p>
                <p className="text-slate-500 max-w-[160px] truncate">
                  {userEmail}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
