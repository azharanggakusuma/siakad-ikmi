import React, { useState } from "react";
import { ChartPieIcon } from "./DashboardIcons";
import { cn } from "@/lib/utils"; 

type Counts = { A: number; B: number; C: number; D: number; E: number };

// Konfigurasi Warna & Label
const CHART_CONFIG = [
  { key: "A", label: "A (Sangat Baik)", colorVar: "var(--color-chart-2)", colorClass: "bg-chart-2" },
  { key: "B", label: "B (Baik)", colorVar: "var(--color-chart-3)", colorClass: "bg-chart-3" },
  { key: "C", label: "C (Cukup)", colorVar: "var(--color-chart-5)", colorClass: "bg-chart-5" },
  { key: "D", label: "D/E (Kurang)", colorVar: "var(--color-chart-1)", colorClass: "bg-chart-1" },
];

export function GradeDonutChart({ counts, total }: { counts: Counts; total: number }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // --- 1. Persiapan Data ---
  const dataValues = [
    counts.A,
    counts.B,
    counts.C,
    counts.D + counts.E
  ];

  // --- 2. Konfigurasi SVG (FIXED) ---
  const size = 200;
  const strokeWidth = 20;
  const hoverSizeIncrease = 6; // Penambahan ketebalan saat hover
  const center = size / 2;
  
  // [PERBAIKAN] Radius dikurangi agar saat membesar tidak keluar dari kotak 200x200
  const radius = (size - (strokeWidth + hoverSizeIncrease)) / 2;
  
  const circumference = 2 * Math.PI * radius;
  
  // Gap = 0 (Menyatu)
  const gapAngle = 0; 
  const gapLength = (gapAngle / 360) * circumference;

  let currentAngle = -90; 

  // --- 3. Generate Segments ---
  const segments = dataValues.map((val, index) => {
    const percentage = total > 0 ? val / total : 0;
    
    const hasMultipleSegments = dataValues.filter(v => v > 0).length > 1;
    const strokeLength = (percentage * circumference) - (hasMultipleSegments ? gapLength : 0);
    
    const angle = (percentage * 360);
    const startAngle = currentAngle;
    currentAngle += angle;

    return {
      index,
      value: val,
      percentage: Math.round(percentage * 100),
      strokeLength: Math.max(0, strokeLength), 
      rotation: startAngle,
      config: CHART_CONFIG[index],
      isVisible: val > 0
    };
  });

  return (
    <section className="lg:col-span-3 rounded-xl border border-border bg-card text-card-foreground shadow-sm flex flex-col overflow-hidden">
      <header className="px-6 py-5 border-b border-border bg-muted/40 flex items-center justify-between">
        <h3 className="font-semibold tracking-tight text-foreground flex items-center gap-2">
          <ChartPieIcon className="w-4 h-4 text-chart-2" />
          Distribusi Nilai
        </h3>
      </header>

      <div className="p-6 flex-1 flex flex-col items-center justify-center min-h-[300px]">
        {total === 0 ? (
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
             <div className="bg-muted p-4 rounded-full">
               <ChartPieIcon className="w-8 h-8 opacity-50" />
             </div>
             <p className="text-sm font-medium">Belum ada data nilai.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center w-full animate-in fade-in zoom-in duration-500">
            {/* SVG DONUT */}
            <div className="relative group">
              <svg 
                width={size} 
                height={size} 
                viewBox={`0 0 ${size} ${size}`} 
                className="transform transition-all duration-300 overflow-visible"
              >
                {/* Background Track */}
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  className="text-muted/20"
                />

                {/* Data Segments */}
                {segments.map((seg) => {
                  if (!seg.isVisible) return null;
                  
                  const isHovered = hoveredIndex === seg.index;
                  const isDimmed = hoveredIndex !== null && hoveredIndex !== seg.index;

                  return (
                    <circle
                      key={seg.index}
                      cx={center}
                      cy={center}
                      r={radius}
                      fill="none"
                      stroke={seg.config.colorVar}
                      // Saat hover, ketebalan ditambah hoverSizeIncrease
                      strokeWidth={isHovered ? strokeWidth + hoverSizeIncrease : strokeWidth} 
                      strokeDasharray={`${seg.strokeLength} ${circumference}`}
                      strokeDashoffset={0}
                      strokeLinecap="butt"
                      transform={`rotate(${seg.rotation} ${center} ${center})`}
                      className={cn(
                        "transition-all duration-300 ease-out cursor-pointer",
                        isDimmed ? "opacity-30 blur-[1px]" : "opacity-100"
                      )}
                      onMouseEnter={() => setHoveredIndex(seg.index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    />
                  );
                })}
              </svg>

              {/* Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-4xl font-extrabold text-foreground tracking-tighter">
                  {hoveredIndex !== null ? segments[hoveredIndex].value : total}
                </span>
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">
                  {hoveredIndex !== null ? "Mata Kuliah" : "Total Nilai"}
                </span>
              </div>
            </div>

            {/* Legend Grid */}
            <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-3 w-full px-2">
              {segments.map((seg) => (
                <div 
                  key={seg.index} 
                  className={cn(
                    "flex items-center justify-between p-2 rounded-lg transition-all duration-200 cursor-default border border-transparent",
                    hoveredIndex === seg.index ? "bg-muted border-border shadow-sm" : "hover:bg-muted/50"
                  )}
                  onMouseEnter={() => setHoveredIndex(seg.index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className="flex items-center gap-2.5">
                    <span 
                      className={cn("w-3 h-3 rounded-sm shadow-sm ring-1 ring-background", seg.config.colorClass)} 
                    />
                    <span className="text-muted-foreground font-medium text-xs">
                      {seg.config.label.split(" (")[0]} 
                      <span className="text-[10px] opacity-70 ml-1">({seg.config.label.split(" (")[1].replace(")", "")})</span>
                    </span>
                  </div>
                  <span className="font-bold text-foreground text-xs">{seg.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}