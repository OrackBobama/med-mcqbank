"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import {
  AccentColor,
  ThemeMode,
  useTheme,
} from "@/components/ThemeProvider";
import {
  User,
  Mail,
  Building2,
  GraduationCap,
  MapPin,
  Stethoscope,
  Phone,
  Calendar,
  Palette,
  Sun,
  Moon,
  Upload,
  CheckCircle2,
  AlertCircle,
  Save,
  Sparkles,
} from "lucide-react";

const AVATAR_PRESETS = [
  {
    label: "Fracto Blue",
    url: "/api/media/avatar_physician_blue.svg",
  },
  {
    label: "Surgical Emerald",
    url: "/api/media/avatar_physician_emerald.svg",
  },
  {
    label: "Neurology Violet",
    url: "/api/media/avatar_physician_violet.svg",
  },
];

const ACCENT_OPTIONS: {
  key: AccentColor;
  label: string;
  description: string;
  swatchHex: string;
}[] = [
  {
    key: "clinical",
    label: "Fracto Ocean Blue",
    description: "Classic clinical navy & cerulean",
    swatchHex: "#0070c4",
  },
  {
    key: "emerald",
    label: "Surgical Emerald",
    description: "Crisp operating-theatre green",
    swatchHex: "#059669",
  },
  {
    key: "violet",
    label: "Neurology Violet",
    description: "Deep academic royal purple",
    swatchHex: "#7c3aed",
  },
  {
    key: "rose",
    label: "Cardiology Rose",
    description: "High-contrast arterial crimson",
    swatchHex: "#e11d48",
  },
  {
    key: "amber",
    label: "Diagnostic Amber",
    description: "Warm golden clinical highlight",
    swatchHex: "#d97706",
  },
];

export default function SettingsPage() {
  const router = useRouter();
  const { themeMode, accentColor, applyTheme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [trainingLevel, setTrainingLevel] = useState("BPT 2");
  const [hospital, setHospital] = useState("");
  const [stateRegion, setStateRegion] = useState("NSW");
  const [specialtyInterest, setSpecialtyInterest] = useState("Cardiology");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [examDate, setExamDate] = useState("");
  const [selectedMode, setSelectedMode] = useState<ThemeMode>("light");
  const [selectedAccent, setSelectedAccent] = useState<AccentColor>("clinical");

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/user/settings", { cache: "no-store" });
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        if (data.user) {
          const u = data.user;
          setName(u.name || "");
          setEmail(u.email || "");
          setTrainingLevel(u.trainingLevel || "BPT 2");
          setHospital(u.hospital || "");
          setStateRegion(u.state || "NSW");
          setSpecialtyInterest(u.specialtyInterest || "Cardiology");
          setPhone(u.phone || "");
          setAvatarUrl(u.avatarUrl || "");
          if (u.examDate) {
            const iso = new Date(u.examDate).toISOString().split("T")[0];
            setExamDate(iso);
          }
          const m = (u.themeMode || themeMode) as ThemeMode;
          const a = (u.accentColor || accentColor) as AccentColor;
          setSelectedMode(m);
          setSelectedAccent(a);
          applyTheme(m, a);
        }
      } catch {
        setErrorMsg("Failed to load trainee settings.");
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg("Profile photo must be smaller than 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatarUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectMode = (mode: ThemeMode) => {
    setSelectedMode(mode);
    applyTheme(mode, selectedAccent);
  };

  const handleSelectAccent = (accent: AccentColor) => {
    setSelectedAccent(accent);
    applyTheme(selectedMode, accent);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          trainingLevel,
          hospital,
          state: stateRegion,
          specialtyInterest,
          phone,
          avatarUrl: avatarUrl || null,
          examDate: examDate || null,
          themeMode: selectedMode,
          accentColor: selectedAccent,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Could not save profile settings.");
        return;
      }

      applyTheme(selectedMode, selectedAccent);
      setSuccessMsg(
        "Your Fracto profile, appearance theme, and RACP exam countdown settings have been saved."
      );
      router.refresh();
    } catch {
      setErrorMsg("Network error while saving settings.");
    } finally {
      setSaving(false);
    }
  };

  // Compute live days until exam preview
  const daysRemainingPreview = (() => {
    if (!examDate) return null;
    const target = new Date(`${examDate}T09:00:00`);
    const now = new Date();
    const diffMs = target.getTime() - now.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  })();

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <Navbar
        userEmail={email}
        userName={name}
        userAvatar={avatarUrl || null}
      />

      <main className="mx-auto max-w-4xl px-4 pt-8 sm:px-6">
        <div className="mb-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-clinical-50 px-3 py-1 text-xs font-semibold text-clinical-700 ring-1 ring-inset ring-clinical-200">
            <Sparkles className="h-3.5 w-3.5" />
            Trainee Profile &amp; Customisation
          </span>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            Fracto Account &amp; Appearance Settings
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage your personal details, custom profile photo, RACP examination countdown date, and interface theme.
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Loading your Fracto settings...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSaveSettings} className="space-y-6">
            {successMsg && (
              <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-900">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-900">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Section 1: Custom Profile Photo & Identity */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base font-bold text-slate-900">
                  1. Profile Photo &amp; Account Identity
                </h2>
                <p className="text-xs text-slate-500">
                  Upload a custom profile photo, select a clinical preset, or update your name and email address
                </p>
              </div>

              <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-center">
                <div className="flex items-center gap-4">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profile Avatar Preview"
                      className="h-20 w-20 rounded-full border-2 border-clinical-600 object-cover shadow-sm"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-clinical-50 text-clinical-700 ring-2 ring-clinical-200">
                      <User className="h-9 w-9" />
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-clinical-700 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-clinical-800">
                      <Upload className="h-3.5 w-3.5" />
                      <span>Upload Photo from Device</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="sr-only"
                      />
                    </label>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-medium text-slate-500">
                        Or choose preset:
                      </span>
                      {AVATAR_PRESETS.map((preset) => (
                        <button
                          key={preset.url}
                          type="button"
                          onClick={() => setAvatarUrl(preset.url)}
                          className={`rounded-lg border px-2 py-1 text-[11px] font-semibold transition ${
                            avatarUrl === preset.url
                              ? "border-clinical-600 bg-clinical-50 text-clinical-800"
                              : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label
                  htmlFor="avatarUrlInput"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-600"
                >
                  Custom Profile Photo URL (Optional)
                </label>
                <input
                  id="avatarUrlInput"
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://... or /api/media/avatar_physician_blue.svg"
                  className="mt-1.5 block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 shadow-sm focus:border-clinical-600 focus:outline-none focus:ring-2 focus:ring-clinical-500/20"
                />
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="nameInput"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
                  >
                    Full Name &amp; Clinical Title
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      id="nameInput"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Dr. Clara Vance"
                      className="block w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 shadow-sm focus:border-clinical-600 focus:outline-none focus:ring-2 focus:ring-clinical-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="emailInput"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
                  >
                    Email Address
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      id="emailInput"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 shadow-sm focus:border-clinical-600 focus:outline-none focus:ring-2 focus:ring-clinical-500/20"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Demographic & Training Data */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base font-bold text-slate-900">
                  2. Clinical &amp; Demographic Information
                </h2>
                <p className="text-xs text-slate-500">
                  Your training stage, hospital network, jurisdiction, and sub-specialty interest
                </p>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="trainingLevelSelect"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
                  >
                    RACP Training Stage
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <GraduationCap className="h-4 w-4" />
                    </div>
                    <select
                      id="trainingLevelSelect"
                      value={trainingLevel}
                      onChange={(e) => setTrainingLevel(e.target.value)}
                      className="block w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 shadow-sm focus:border-clinical-600 focus:outline-none focus:ring-2 focus:ring-clinical-500/20"
                    >
                      <option value="BPT 1">Basic Physician Trainee — Year 1 (BPT 1)</option>
                      <option value="BPT 2">Basic Physician Trainee — Year 2 (BPT 2)</option>
                      <option value="BPT 3">Basic Physician Trainee — Year 3 (BPT 3)</option>
                      <option value="Advanced Trainee">Advanced Trainee (AT)</option>
                      <option value="OTP / Fellow">Overseas Trained Physician (OTP)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="hospitalInput"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
                  >
                    Primary Hospital / Health Network
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <input
                      id="hospitalInput"
                      type="text"
                      value={hospital}
                      onChange={(e) => setHospital(e.target.value)}
                      placeholder="Royal Prince Alfred Hospital"
                      className="block w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 shadow-sm focus:border-clinical-600 focus:outline-none focus:ring-2 focus:ring-clinical-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="stateSelect"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
                  >
                    State / Jurisdiction
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <select
                      id="stateSelect"
                      value={stateRegion}
                      onChange={(e) => setStateRegion(e.target.value)}
                      className="block w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 shadow-sm focus:border-clinical-600 focus:outline-none focus:ring-2 focus:ring-clinical-500/20"
                    >
                      <option value="NSW">New South Wales (NSW)</option>
                      <option value="VIC">Victoria (VIC)</option>
                      <option value="QLD">Queensland (QLD)</option>
                      <option value="WA">Western Australia (WA)</option>
                      <option value="SA">South Australia (SA)</option>
                      <option value="TAS">Tasmania (TAS)</option>
                      <option value="ACT">Australian Capital Territory (ACT)</option>
                      <option value="NT">Northern Territory (NT)</option>
                      <option value="NZ">Aotearoa New Zealand (NZ)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="specialtyInterestSelect"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
                  >
                    Intended Sub-Specialty Interest
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Stethoscope className="h-4 w-4" />
                    </div>
                    <select
                      id="specialtyInterestSelect"
                      value={specialtyInterest}
                      onChange={(e) => setSpecialtyInterest(e.target.value)}
                      className="block w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 shadow-sm focus:border-clinical-600 focus:outline-none focus:ring-2 focus:ring-clinical-500/20"
                    >
                      <option value="Cardiology">Cardiology</option>
                      <option value="Gastroenterology">Gastroenterology &amp; Hepatology</option>
                      <option value="Respiratory">Respiratory &amp; Sleep Medicine</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Infectious Diseases">Infectious Diseases</option>
                      <option value="General Medicine">General &amp; Acute Care Medicine</option>
                      <option value="Nephrology">Nephrology</option>
                      <option value="Oncology / Haematology">Medical Oncology / Haematology</option>
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="phoneInput"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
                  >
                    Mobile / Pager Contact (Optional)
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Phone className="h-4 w-4" />
                    </div>
                    <input
                      id="phoneInput"
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+61 400 123 456"
                      className="block w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 shadow-sm focus:border-clinical-600 focus:outline-none focus:ring-2 focus:ring-clinical-500/20"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: RACP Examination Date Countdown */}
            <div
              id="exam-date"
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    3. Target RACP Divisional Written Examination Date
                  </h2>
                  <p className="text-xs text-slate-500">
                    Set your sitting date to display a live countdown timer on your Fracto Dashboard
                  </p>
                </div>
                <Calendar className="h-5 w-5 text-clinical-700" />
              </div>

              <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <label
                    htmlFor="examDateInput"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
                  >
                    Examination Sitting Date
                  </label>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <input
                      id="examDateInput"
                      type="date"
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                      className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 shadow-sm focus:border-clinical-600 focus:outline-none focus:ring-2 focus:ring-clinical-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setExamDate("2027-02-15")}
                      className="rounded-xl border border-clinical-200 bg-clinical-50 px-3 py-2 text-xs font-semibold text-clinical-800 transition hover:bg-clinical-100"
                    >
                      Set Feb 2027 RACP Sitting (2027-02-15)
                    </button>
                    {examDate && (
                      <button
                        type="button"
                        onClick={() => setExamDate("")}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100"
                      >
                        Clear Date
                      </button>
                    )}
                  </div>
                </div>

                {daysRemainingPreview !== null && (
                  <div className="rounded-xl border border-clinical-200 bg-clinical-50/70 px-5 py-3 text-center">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-clinical-700">
                      Countdown Preview
                    </p>
                    <p className="mt-0.5 text-2xl font-extrabold text-clinical-900">
                      {daysRemainingPreview >= 0
                        ? `${daysRemainingPreview} Days`
                        : "Passed"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Section 4: Customisable Appearance / Themes */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    4. Appearance, Dark Mode &amp; Colour Highlights
                  </h2>
                  <p className="text-xs text-slate-500">
                    Personalise Fracto with Light or Dark mode and choose your interface accent colour
                  </p>
                </div>
                <Palette className="h-5 w-5 text-clinical-700" />
              </div>

              {/* Light vs Dark Mode */}
              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Interface Mode
                </p>
                <div className="mt-2.5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => handleSelectMode("light")}
                    className={`flex items-center gap-3.5 rounded-xl border p-4 text-left transition ${
                      selectedMode === "light"
                        ? "border-clinical-600 bg-clinical-50/50 ring-2 ring-clinical-600/20"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                      <Sun className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        Clinical Light Mode
                      </p>
                      <p className="text-xs text-slate-500">
                        High-contrast daytime examination paper palette
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectMode("dark")}
                    className={`flex items-center gap-3.5 rounded-xl border p-4 text-left transition ${
                      selectedMode === "dark"
                        ? "border-clinical-600 bg-clinical-50/50 ring-2 ring-clinical-600/20"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-sky-300">
                      <Moon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        Night-Shift Dark Mode
                      </p>
                      <p className="text-xs text-slate-500">
                        Low-glare dark slate theme for evening study
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* 5 Accent Colour Highlight Swatches */}
              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Highlight Accent Colour
                </p>
                <div className="mt-2.5 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {ACCENT_OPTIONS.map((opt) => {
                    const isSelected = selectedAccent === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => handleSelectAccent(opt.key)}
                        className={`flex flex-col items-start rounded-xl border p-3.5 text-left transition ${
                          isSelected
                            ? "border-clinical-600 bg-clinical-50/40 ring-2 ring-clinical-600"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <div className="flex w-full items-center justify-between">
                          <span
                            className="h-6 w-6 rounded-full shadow-sm ring-2 ring-white"
                            style={{ backgroundColor: opt.swatchHex }}
                          />
                          {isSelected && (
                            <span className="rounded-md bg-clinical-700 px-1.5 py-0.5 text-[10px] font-bold text-white">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="mt-2.5 text-xs font-bold text-slate-900">
                          {opt.label}
                        </p>
                        <p className="mt-0.5 text-[11px] leading-tight text-slate-500">
                          {opt.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Save Button Bar */}
            <div className="flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-clinical-700 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-clinical-800 disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                <span>
                  {saving ? "Saving Settings..." : "Save Profile & Appearance"}
                </span>
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
