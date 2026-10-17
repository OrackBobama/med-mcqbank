"use client";

import React from "react";

export interface TrendPoint {
  sessionId: string;
  sessionNumber: number;
  label: string;
  specialties: string[];
  answered: number;
  correct: number;
  totalQuestions: number;
  accuracy: number;
  createdAt: string;
}

interface TrendChartProps {
  data: TrendPoint[];
}

export default function TrendChart({ data }: TrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-56 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center">
        <p className="text-sm font-medium text-slate-600">
          No quiz score history recorded yet
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Complete or answer questions in a custom examination session to plot your accuracy trajectory over time.
        </p>
      </div>
    );
  }

  const width = 680;
  const height = 230;
  const padLeft = 44;
  const padRight = 24;
  const padTop = 24;
  const padBottom = 38;
  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  const getX = (index: number) => {
    if (data.length === 1) return padLeft + plotWidth / 2;
    return padLeft + (index / (data.length - 1)) * plotWidth;
  };

  const getY = (accuracy: number) => {
    const clamped = Math.max(0, Math.min(100, accuracy));
    return padTop + plotHeight - (clamped / 100) * plotHeight;
  };

  const points = data.map((d, i) => ({
    x: getX(i),
    y: getY(d.accuracy),
    ...d,
  }));

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  const areaPath =
    points.length > 1
      ? `M ${points[0].x},${padTop + plotHeight} ` +
        points.map((p) => `L ${p.x},${p.y}`).join(" ") +
        ` L ${points[points.length - 1].x},${padTop + plotHeight} Z`
      : "";

  const yTicks = [0, 25, 50, 75, 100];

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-60 w-full min-w-[440px]"
        role="img"
        aria-label="Quiz Score Accuracy Trend Over Time"
      >
        <defs>
          <linearGradient id="clinicalTrendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0070c4" stopOpacity="0.24" />
            <stop offset="100%" stopColor="#0070c4" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal reference lines */}
        {yTicks.map((tick) => {
          const y = getY(tick);
          const isPassBenchmark = tick === 75;
          return (
            <g key={tick}>
              <line
                x1={padLeft}
                y1={y}
                x2={width - padRight}
                y2={y}
                stroke={isPassBenchmark ? "#10b981" : "#e2e8f0"}
                strokeDasharray={isPassBenchmark ? "4 4" : undefined}
                strokeWidth={isPassBenchmark ? 1.5 : 1}
              />
              <text
                x={padLeft - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-slate-400 text-[10px] font-medium"
              >
                {tick}%
              </text>
            </g>
          );
        })}

        {/* Area fill when >1 point */}
        {areaPath && <path d={areaPath} fill="url(#clinicalTrendGrad)" />}

        {/* Trend line */}
        {points.length > 1 && (
          <polyline
            fill="none"
            stroke="#0070c4"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={polylinePoints}
          />
        )}

        {/* Data nodes & labels */}
        {points.map((pt) => (
          <g key={pt.sessionId}>
            <circle
              cx={pt.x}
              cy={pt.y}
              r={5.5}
              className="fill-white stroke-clinical-600"
              strokeWidth={3}
            />
            <text
              x={pt.x}
              y={pt.y - 10}
              textAnchor="middle"
              className="fill-slate-800 text-[11px] font-bold"
            >
              {pt.accuracy}%
            </text>
            <text
              x={pt.x}
              y={height - 12}
              textAnchor="middle"
              className="fill-slate-500 text-[10px] font-medium"
            >
              {pt.label}
            </text>
          </g>
        ))}
      </svg>
      <div className="mt-1 flex items-center justify-between px-2 text-[11px] text-slate-500">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-clinical-600" />
            Session Score (%)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0.5 w-4 border-t border-dashed border-emerald-500 bg-emerald-500" />
            Target RACP Benchmark (75%)
          </span>
        </div>
        <span>Chronological Quiz Sessions</span>
      </div>
    </div>
  );
}
