"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import FractoLogo from "@/components/FractoLogo";
import { useTheme } from "@/components/ThemeProvider";
import {
  LayoutDashboard,
  FilePlus2,
  Settings,
  LogOut,
  UserCheck,
  Sun,
  Moon,
} from "lucide-react";

interface NavbarProps {
  userEmail?: string;
  userName?: string | null;
  userAvatar?: string | null;
}

export default function Navbar({
  userEmail,
  userName,
  userAvatar,
}: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { themeMode, setThemeMode } = useTheme();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const toggleQuickTheme = async () => {
    const nextMode = themeMode === "dark" ? "light" : "dark";
    setThemeMode(nextMode);
    if (userEmail) {
      fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ themeMode: nextMode }),
      }).catch(() => {});
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <FractoLogo
            size={42}
            className="shrink-0 drop-shadow-sm transition-transform group-hover:scale-105"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold tracking-tight text-slate-900">
                Fracto
              </span>
              <span className="hidden rounded-md bg-clinical-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-clinical-700 ring-1 ring-inset ring-clinical-200 sm:inline-block">
                RACP MCQ Bank
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Divisional Written Examination Prep
            </p>
          </div>
        </Link>

        {userEmail && (
          <div className="flex items-center gap-2 sm:gap-3">
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
              <Link
                href="/settings"
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
                  pathname === "/settings"
                    ? "bg-white text-clinical-800 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </nav>

            <button
              type="button"
              onClick={toggleQuickTheme}
              title={
                themeMode === "dark"
                  ? "Switch to Light Mode"
                  : "Switch to Dark Mode"
              }
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100"
            >
              {themeMode === "dark" ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-slate-600" />
              )}
            </button>

            <Link
              href="/settings"
              className="hidden items-center gap-2 border-l border-slate-200 pl-3 transition hover:opacity-85 md:flex"
            >
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName || "Trainee Avatar"}
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-clinical-500/40"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-clinical-50 text-clinical-700 ring-1 ring-clinical-200">
                  <UserCheck className="h-4 w-4" />
                </div>
              )}
              <div className="text-xs">
                <p className="font-semibold text-slate-800">
                  {userName || "BPT Trainee"}
                </p>
                <p className="max-w-[140px] truncate text-slate-500">
                  {userEmail}
                </p>
              </div>
            </Link>

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
