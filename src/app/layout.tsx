import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RACP Written Examination MCQ Bank",
  description:
    "Clinical MCQ Bank for Medical Trainees preparing for the RACP Divisional Written Examination",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
