import { TrendingUpIcon } from "./DashboardIcons";

type TrendData = { label: string; val: number; height: string };

export function SemesterLineChart({ data }: { data: TrendData[] }) {
  // Konfigurasi Ukuran SVG
  const width = 600;
  const height = 250;
  const paddingX = 40;
  const paddingY = 40;
  const graphHeight = height - paddingY * 2;
  const graphWidth = width - paddingX * 2;

  // Nilai Maksimal IPS selalu 4.00
  const maxVal = 4;

  // Fungsi Helper untuk mendapatkan koordinat X
  const getX = (index: number) => {
    // Jika data hanya 1, taruh di tengah
    if (data.length <= 1) return width / 2;
    return paddingX + (index * (graphWidth / (data.length - 1)));
  };

  // Fungsi Helper untuk mendapatkan koordinat Y (SVG y=0 ada di atas)
  const getY = (val: number) => {
    return height - paddingY - (val / maxVal) * graphHeight;
  };

  // Membuat string path untuk garis (Polyline)
  const points = data
    .map((d, i) => `${getX(i)},${getY(d.val)}`)
    .join(" ");

  return (
    <section className="lg:col-span-4 rounded-xl border border-border bg-card text-card-foreground shadow-sm flex flex-col overflow-hidden">
      <header className="px-6 py-5 border-b border-border bg-muted/40">
        <h3 className="font-semibold tracking-tight text-foreground flex items-center gap-2">
          <TrendingUpIcon className="w-4 h-4 text-primary" />
          Tren IPS Mahasiswa
        </h3>
      </header>

      <div className="p-6 flex-1 flex items-center justify-center min-h-[300px]">
        {data.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            Belum ada data nilai per semester.
          </div>
        ) : (
          <div className="w-full h-full overflow-hidden">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-auto max-h-[300px]"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Grid Lines Horizontal (0, 1, 2, 3, 4) */}
              {[0, 1, 2, 3, 4].map((gridVal) => {
                const y = getY(gridVal);
                return (
                  <g key={gridVal}>
                    {/* Garis Putus-putus */}
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={width - paddingX}
                      y2={y}
                      stroke="currentColor"
                      strokeOpacity={0.1}
                      strokeDasharray="4 4"
                      className="text-muted-foreground"
                    />
                    {/* Label Angka di Kiri */}
                    <text
                      x={paddingX - 10}
                      y={y + 4}
                      className="fill-muted-foreground text-[10px]"
                      textAnchor="end"
                    >
                      {gridVal}
                    </text>
                  </g>
                );
              })}

              {/* Definisi Gradient untuk Area di bawah garis (Opsional) */}
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" className="text-primary" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0" className="text-primary" />
                </linearGradient>
              </defs>

              {/* Area Shader (Warna pudar di bawah garis) */}
              {data.length > 1 && (
                <path
                  d={`${points} L${getX(data.length - 1)},${height - paddingY} L${getX(0)},${height - paddingY} Z`}
                  fill="url(#lineGradient)"
                  className="text-primary"
                  style={{ transition: 'd 0.5s ease' }}
                />
              )}

              {/* Garis Utama (Line) */}
              <polyline
                points={points}
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-primary"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ transition: 'points 0.5s ease' }}
              />

              {/* Titik Data (Dots) & Tooltip */}
              {data.map((item, idx) => {
                const x = getX(idx);
                const y = getY(item.val);
                return (
                  <g key={idx} className="group">
                    {/* Area Hover Invisible (supaya gampang di-hover) */}
                    <circle cx={x} cy={y} r="20" fill="transparent" className="cursor-pointer" />
                    
                    {/* Titik Lingkaran */}
                    <circle
                      cx={x}
                      cy={y}
                      r="5"
                      className="fill-background stroke-primary stroke-[3px] transition-all duration-200 group-hover:r-6"
                    />

                    {/* Popover/Tooltip saat Hover */}
                    <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                       {/* Background Tooltip */}
                       <rect 
                         x={x - 24} 
                         y={y - 40} 
                         width="48" 
                         height="26" 
                         rx="6" 
                         className="fill-popover stroke-border stroke-1 shadow-sm" 
                       />
                       {/* Teks Nilai */}
                       <text 
                         x={x} 
                         y={y - 23} 
                         textAnchor="middle" 
                         className="fill-popover-foreground text-[12px] font-bold"
                       >
                         {item.val}
                       </text>
                    </g>

                    {/* Label Sumbu X (Semester) */}
                    <text
                      x={x}
                      y={height - 10}
                      textAnchor="middle"
                      className="fill-muted-foreground text-[10px] font-medium uppercase"
                    >
                      {item.label.includes("Smt") ? item.label.replace("Smt ", "S") : item.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}
      </div>
    </section>
  );
}