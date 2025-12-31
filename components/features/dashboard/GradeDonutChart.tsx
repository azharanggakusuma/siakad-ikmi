import React, { useState } from "react";
import { ChartPieIcon } from "./DashboardIcons";
import { cn } from "@/lib/utils"; 

type Counts = { A: number; B: number; C: number; D: number; E: number };

// Konfigurasi Warna & Label yang Harmonis
const CHART_CONFIG = [
  { 
    key: "A", 
    label: "A (Sangat Baik)", 
    // Menggunakan variabel CSS agar sinkron dengan tema (biasanya Hijau/Teal)
    colorVar: "var(--color-chart-2)", 
    // Background transparan untuk legenda
    bgClass: "bg-chart-2/10",
    textClass: "text-chart-2",
    indicatorClass: "bg-chart-2" 
  },
  { 
    key: "B", 
    label: "B (Baik)", 
    // (Biasanya Biru)
    colorVar: "var(--color-chart-3)", 
    bgClass: "bg-chart-3/10",
    textClass: "text-chart-3",
    indicatorClass: "bg-chart-3" 
  },
  { 
    key: "C", 
    label: "C (Cukup)", 
    // (Biasanya Kuning/Oranye)
    colorVar: "var(--color-chart-5)", 
    bgClass: "bg-chart-5/10",
    textClass: "text-chart-5",
    indicatorClass: "bg-chart-5" 
  },
  { 
    key: "D", 
    label: "D/E (Kurang)", 
    // (Biasanya Merah)
    colorVar: "var(--color-chart-1)", 
    bgClass: "bg-chart-1/10",
    textClass: "text-chart-1",
    indicatorClass: "bg-chart-1" 
  },
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

  // --- 2. Konfigurasi SVG ---
  const size = 220; // Sedikit diperbesar agar lega
  const strokeWidth = 22; // Ketebalan donat
  const hoverExpand = 6; // Seberapa besar membesar saat hover
  
  // Perhitungan Radius agar tidak terpotong (Size - MaxStroke) / 2
  const radius = (size - (strokeWidth + hoverExpand)) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Gap 0 agar menyatu (Solid)
  const gapAngle = 0; 
  const gapLength = (gapAngle / 360) * circumference;

  let currentAngle = -90; // Mulai dari jam 12

  // --- 3. Generate Segments ---
  const segments = dataValues.map((val, index) => {
    const percentage = total > 0 ? val / total : 0;
    
    // Logic: Jika hanya 1 segmen yg ada nilainya, jangan kurangi gapLength
    const hasMultiple = dataValues.filter(v => v > 0).length > 1;
    const strokeLength = (percentage * circumference) - (hasMultiple ? gapLength : 0);
    
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
    <section className="lg:col-span-3 rounded-xl border border-border bg-card text-card-foreground shadow-sm flex flex-col overflow-hidden h-full">
      <header className="px-6 py-5 border-b border-border bg-muted/20 flex items-center justify-between">
        <h3 className="font-semibold tracking-tight text-foreground flex items-center gap-2">
          <ChartPieIcon className="w-4 h-4 text-primary" />
          Distribusi Nilai
        </h3>
      </header>

      <div className="p-6 flex-1 flex flex-col items-center justify-between min-h-[320px]">
        {total === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-3 text-muted-foreground">
             <div className="bg-muted p-4 rounded-full">
               <ChartPieIcon className="w-10 h-10 opacity-30" />
             </div>
             <p className="text-sm font-medium">Belum ada data nilai.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center w-full animate-in fade-in zoom-in duration-500 flex-1 justify-center">
            
            {/* --- SVG DONUT CHART --- */}
            <div className="relative group my-4">
              <svg 
                width={size} 
                height={size} 
                viewBox={`0 0 ${size} ${size}`} 
                className="overflow-visible transform transition-transform duration-300"
              >
                {/* Track Background (Lingkaran abu-abu tipis di belakang) */}
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  className="text-muted/10"
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
                      strokeWidth={isHovered ? strokeWidth + hoverExpand : strokeWidth} 
                      strokeDasharray={`${seg.strokeLength} ${circumference}`}
                      strokeDashoffset={0}
                      strokeLinecap="butt" // Ujung Rata (Nyatu)
                      transform={`rotate(${seg.rotation} ${center} ${center})`}
                      className={cn(
                        "transition-all duration-300 ease-out cursor-pointer",
                        isDimmed ? "opacity-20 saturate-0" : "opacity-100"
                      )}
                      onMouseEnter={() => setHoveredIndex(seg.index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    />
                  );
                })}
              </svg>

              {/* Center Info Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                <span className={cn(
                  "text-4xl font-black tracking-tighter transition-colors duration-200",
                  hoveredIndex !== null ? segments[hoveredIndex].config.textClass : "text-foreground"
                )}>
                  {hoveredIndex !== null ? segments[hoveredIndex].value : total}
                </span>
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
                  {hoveredIndex !== null ? "Mata Kuliah" : "Total MK"}
                </span>
              </div>
            </div>

            {/* --- LEGEND GRID --- */}
            <div className="w-full grid grid-cols-2 gap-3 mt-4">
              {segments.map((seg) => (
                <div 
                  key={seg.index} 
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-lg border border-transparent transition-all duration-200 cursor-default",
                    // Jika di-hover, beri background warna sesuai kategori
                    hoveredIndex === seg.index 
                      ? `${seg.config.bgClass} border-${seg.config.textClass}/20` 
                      : "hover:bg-muted/50 border-transparent"
                  )}
                  onMouseEnter={() => setHoveredIndex(seg.index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    {/* Indikator Kotak Kecil */}
                    <span 
                      className={cn("w-2.5 h-2.5 rounded-sm flex-shrink-0", seg.config.indicatorClass)} 
                    />
                    <span className="text-muted-foreground font-medium text-xs truncate">
                      {/* Label Pendek: Ambil huruf depannya saja (A, B, C...) */}
                      <span className={cn("font-bold mr-1", seg.config.textClass)}>
                        {seg.config.label.split(" ")[0]}
                      </span>
                      <span className="text-[10px] opacity-70">
                        {seg.config.label.split("(")[1].replace(")", "")}
                      </span>
                    </span>
                  </div>
                  <span className="font-bold text-foreground text-xs ml-2">
                    {seg.percentage}%
                  </span>
                </div>
              ))}
            </div>

          </div>
        )}
      </div>
    </section>
  );
}