import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Fracto — RACP Divisional Written Examination MCQ Bank",
  description:
    "Fracto Clinical MCQ Bank & Analytics Platform for Medical Trainees preparing for the RACP Divisional Written Examination",
  icons: {
    icon: "/fracto-logo.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
