import React from "react";

interface FractoLogoProps {
  className?: string;
  size?: number;
}

export default function FractoLogo({
  className = "",
  size = 40,
}: FractoLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className}
      aria-label="Fracto Logo"
      role="img"
    >
      <defs>
        <linearGradient id="fractoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#072849" />
          <stop offset="55%" stopColor="#01599f" />
          <stop offset="100%" stopColor="#0c8ee6" />
        </linearGradient>
        <linearGradient id="fractoFacet" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
      </defs>

      <rect
        x="6"
        y="6"
        width="108"
        height="108"
        rx="28"
        fill="url(#fractoGrad)"
      />
      <polygon points="34,30 88,30 78,44 34,44" fill="#ffffff" />
      <polygon points="34,30 50,30 50,90 34,78" fill="#e0f2fe" />
      <polygon points="34,54 74,54 66,68 34,68" fill="url(#fractoFacet)" />
      <path
        d="M 56,82 L 66,82 L 71,70 L 77,92 L 83,76 L 88,82 L 96,82"
        fill="none"
        stroke="#38bdf8"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
