"use client";

import React, { useState } from "react";
import { Maximize2, X, Image as ImageIcon } from "lucide-react";

interface ClinicalImageProps {
  rawUrl?: string | null;
  caption?: string;
}

export function resolveClinicalImageUrl(rawUrl?: string | null): string | null {
  if (!rawUrl) return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  // Strip leading "./", "/", "data/", or "images/" so any local path resolves via /api/media/
  const cleaned = trimmed
    .replace(/^\.?\//, "")
    .replace(/^data\//, "")
    .replace(/^images\//, "");

  return `/api/media/${cleaned}`;
}

export default function ClinicalImage({ rawUrl, caption }: ClinicalImageProps) {
  const [zoomed, setZoomed] = useState(false);
  const src = resolveClinicalImageUrl(rawUrl);

  if (!src) return null;

  return (
    <>
      <div className="my-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-900/5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200/80 bg-white px-3.5 py-2 text-xs">
          <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
            <ImageIcon className="h-3.5 w-3.5 text-clinical-700" />
            <span>{caption || "Clinical Diagnostic Figure"}</span>
          </span>
          <button
            type="button"
            onClick={() => setZoomed(true)}
            className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700 transition hover:bg-clinical-50 hover:text-clinical-800"
          >
            <Maximize2 className="h-3 w-3" />
            <span>Enlarge Figure</span>
          </button>
        </div>

        <div
          onClick={() => setZoomed(true)}
          className="flex cursor-zoom-in items-center justify-center bg-white p-3"
        >
          <img
            src={src}
            alt={caption || "Clinical examination figure"}
            className="max-h-72 w-auto max-w-full rounded-lg object-contain"
          />
        </div>
      </div>

      {zoomed && (
        <div
          onClick={() => setZoomed(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] max-w-4xl overflow-auto rounded-2xl border border-slate-700 bg-white p-4 shadow-2xl"
          >
            <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                {caption || "Clinical Diagnostic Figure (Full Resolution)"}
              </span>
              <button
                type="button"
                onClick={() => setZoomed(false)}
                className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-700"
              >
                <X className="h-4 w-4" />
                <span>Close</span>
              </button>
            </div>
            <img
              src={src}
              alt={caption || "Enlarged clinical figure"}
              className="mx-auto max-h-[78vh] w-auto max-w-full rounded-lg object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
