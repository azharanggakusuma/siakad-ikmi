import React from "react";
import { TrendingUpIcon } from "./DashboardIcons";

type TrendData = { label: string; val: number; height: string };

// Helper: Membuat path garis lurus (tajam/sharp)
function createSharpPath(points: [number, number][]) {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0][0]},${points[0][1]}`;

  let d = `M ${points[0][0]},${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i][0]},${points[i][1]}`;
  }
  return d;
}

// [UBAH] Tambahkan prop 'title'
export function SemesterLineChart({ data, title }: { data: TrendData[]; title: string }) {
  // --- Konfigurasi Ukuran BESAR ---
  const width = 800;
  const height = 350; 
  const paddingX = 40; 
  
  const paddingTop = 20; 
  const paddingBottom = 30; 
  
  const graphHeight = height - paddingTop - paddingBottom;
  const graphWidth = width - paddingX * 2;
  const maxVal = 4; 

  const getX = (index: number) => {
    if (data.length <= 1) return width / 2;
    return paddingX + index * (graphWidth / (data.length - 1));
  };

  const getY = (val: number) => {
    return height - paddingBottom - (val / maxVal) * graphHeight;
  };

  const points: [number, number][] = data.map((d, i) => [getX(i), getY(d.val)]);
  const linePath = createSharpPath(points);
  
  const areaPath = points.length > 1 
    ? `${linePath} L ${getX(data.length - 1)},${height - paddingBottom} L ${getX(0)},${height - paddingBottom} Z`
    : "";

  return (
    <section className="lg:col-span-4 rounded-xl border border-border bg-card text-card-foreground shadow-sm flex flex-col overflow-hidden relative group/chart">
      {/* Header */}
      <header className="px-6 py-5 border-b border-border bg-transparent flex justify-between items-center">
        <h3 className="font-semibold tracking-tight text-foreground flex items-center gap-2">
          <TrendingUpIcon className="w-5 h-5 text-primary" />
          {/* [UBAH] Gunakan prop title di sini */}
          {title}
        </h3>
        
        {data.length > 0 && (
           <div className="text-xs text-muted-foreground font-semibold bg-muted/30 px-3 py-1 rounded-full border border-border/50">
             Skala Indeks 4.00
           </div>
        )}
      </header>

      {/* Chart Area */}
      <div className="p-4 flex-1 flex items-center justify-center min-h-[350px]">
        {data.length === 0 ? (
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
             <div className="bg-muted p-4 rounded-full">
               <TrendingUpIcon className="w-10 h-10 opacity-50" />
             </div>
             <p className="text-lg font-medium">Belum ada data nilai.</p>
          </div>
        ) : (
          <div className="w-full h-full relative">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-auto max-h-[350px] overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="largeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.25" className="text-primary" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0.0" className="text-primary" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 1, 2, 3, 4].map((gridVal) => {
                const y = getY(gridVal);
                return (
                  <g key={gridVal}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={width - paddingX}
                      y2={y}
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeOpacity={0.1}
                      className="text-muted-foreground"
                    />
                    <text
                      x={paddingX - 12}
                      y={y + 5}
                      className="fill-muted-foreground text-[13px] font-bold"
                      textAnchor="end"
                    >
                      {gridVal}
                    </text>
                  </g>
                );
              })}

              {/* Area Fill */}
              {areaPath && (
                <path
                  d={areaPath}
                  fill="url(#largeGradient)"
                  className="text-primary transition-all duration-500 ease-out"
                />
              )}

              {/* GARIS UTAMA */}
              <path
                d={linePath}
                fill="none"
                stroke="currentColor"
                strokeWidth="4" 
                strokeLinecap="square"
                strokeLinejoin="round"
                className="text-primary drop-shadow-sm"
              />

              {/* Points */}
              {points.map((pos, idx) => {
                const [x, y] = pos;
                const item = data[idx];
                
                return (
                  <g key={idx} className="group cursor-pointer">
                    <circle cx={x} cy={y} r="30" fill="transparent" />
                    
                    <line 
                      x1={x} y1={y} 
                      x2={x} y2={height - paddingBottom} 
                      stroke="currentColor" 
                      strokeWidth="2.5"
                      className="text-primary opacity-0 group-hover:opacity-30 transition-opacity duration-200"
                    />

                    <circle
                      cx={x}
                      cy={y}
                      r="6" 
                      className="fill-background stroke-primary stroke-[3.5px] transition-all duration-200 group-hover:r-8 group-hover:stroke-[5px] shadow-sm"
                    />

                    <g className="opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-1 group-hover:-translate-y-2 pointer-events-none">
                      <rect
                        x={x - 40}
                        y={y - 55}
                        width="80"
                        height="40"
                        rx="8"
                        className="fill-popover stroke-border stroke-1 shadow-lg"
                      />
                      <text
                        x={x}
                        y={y - 30}
                        textAnchor="middle"
                        className="fill-foreground text-[14px] font-bold"
                      >
                        {item.val.toFixed(2)}
                      </text>
                    </g>
                  </g>
                );
              })}
              
               {points.map((pos, idx) => (
                  <text
                    key={`label-${idx}`}
                    x={pos[0]}
                    y={height - 5}
                    textAnchor="middle"
                    className="fill-muted-foreground text-[13px] font-semibold uppercase tracking-wide"
                  >
                     {data[idx].label.replace("Smt ", "S")}
                  </text>
               ))}
            </svg>
          </div>
        )}
      </div>
    </section>
  );
}