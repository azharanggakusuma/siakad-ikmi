import { ChartPieIcon } from "./DashboardIcons";

type Counts = { A: number; B: number; C: number; D: number; E: number };

export function GradeDonutChart({ counts, total }: { counts: Counts; total: number }) {
  const pA = total > 0 ? (counts.A / total) * 100 : 0;
  const pB = total > 0 ? (counts.B / total) * 100 : 0;
  const pC = total > 0 ? (counts.C / total) * 100 : 0;
  const pD = total > 0 ? (counts.D / total) * 100 : 0;
  
  const stopA = pA;
  const stopB = stopA + pB;
  const stopC = stopB + pC;
  const stopD = stopC + pD;

  const gradient = `conic-gradient(
    var(--color-chart-2) 0% ${stopA}%, 
    var(--color-chart-1) ${stopA}% ${stopB}%, 
    var(--color-chart-4) ${stopB}% ${stopC}%, 
    var(--color-chart-5) ${stopC}% ${stopD}%,
    var(--color-muted) ${stopD}% 100%
  )`;

  const legend = [
    { label: "A (Sangat Baik)", colorClass: "bg-chart-2", val: `${Math.round(pA)}%` },
    { label: "B (Baik)", colorClass: "bg-chart-1", val: `${Math.round(pB)}%` },
    { label: "C (Cukup)", colorClass: "bg-chart-4", val: `${Math.round(pC)}%` },
    { label: "D/E (Kurang)", colorClass: "bg-chart-5", val: `${Math.round(100 - stopC)}%` },
  ];

  return (
    <section className="lg:col-span-3 rounded-xl border border-border bg-card text-card-foreground shadow-sm flex flex-col overflow-hidden">
      <header className="px-6 py-5 border-b border-border bg-muted/40">
        <h3 className="font-semibold tracking-tight text-foreground flex items-center gap-2">
          <ChartPieIcon className="w-4 h-4 text-chart-2" />
          Distribusi Nilai Mata Kuliah
        </h3>
      </header>

      <div className="p-6 flex-1 flex flex-col items-center justify-center min-h-[300px]">
        {total === 0 ? (
          <div className="text-sm text-muted-foreground">Belum ada data nilai.</div>
        ) : (
          <div className="flex flex-col items-center w-full">
            <div className="relative w-52 h-52 rounded-full shadow-lg border-4 border-card" style={{ background: gradient }}>
              <div className="absolute inset-4 bg-card rounded-full flex items-center justify-center flex-col shadow-inner">
                <span className="text-4xl font-extrabold text-card-foreground tracking-tight">{total}</span>
                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mt-1">Total Nilai</span>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-x-12 gap-y-4 w-full px-4">
              {legend.map((l, i) => (
                <div key={i} className="flex items-center justify-between text-sm group cursor-default">
                  <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${l.colorClass} ring-2 ring-card shadow-sm group-hover:scale-125 transition-transform`} />
                    <span className="text-muted-foreground font-medium text-xs sm:text-sm group-hover:text-foreground transition-colors">{l.label}</span>
                  </div>
                  <span className="font-bold text-foreground text-xs sm:text-sm">{l.val}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}