import { TrendingUpIcon } from "./DashboardIcons";

type TrendData = { label: string; val: number; height: string };

export function SemesterBarChart({ data }: { data: TrendData[] }) {
  return (
    <section className="lg:col-span-4 rounded-xl border border-border bg-card text-card-foreground shadow-sm flex flex-col overflow-hidden">
      <header className="px-6 py-5 border-b border-border bg-muted/40">
        <h3 className="font-semibold tracking-tight text-foreground flex items-center gap-2">
          <TrendingUpIcon className="w-4 h-4 text-primary" />
          Tren Rata-rata IPS Mahasiswa
        </h3>
      </header>

      <div className="p-6 flex-1 flex items-end justify-center min-h-[300px]">
        {data.length === 0 ? (
          <div className="text-sm text-muted-foreground">Belum ada data nilai per semester.</div>
        ) : (
          <div className="w-full h-full flex items-end justify-between gap-2 sm:gap-4 px-2 pb-2">
            {data.map((item, idx) => (
              <div key={idx} className="group relative flex-1 flex flex-col items-center justify-end h-full">
                <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 bg-popover text-popover-foreground border border-border text-xs font-medium py-1.5 px-3 rounded-lg shadow-lg whitespace-nowrap z-10">
                  IPS: <span className="text-primary font-bold">{item.val}</span>
                </div>
                
                <div 
                  className="w-full max-w-[48px] bg-muted/50 rounded-t-xl relative overflow-hidden group-hover:shadow-lg transition-all"
                  style={{ height: item.height }}
                >
                  <div className="absolute bottom-0 left-0 right-0 bg-primary w-full h-full opacity-90 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="mt-4 text-[10px] sm:text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors text-center uppercase tracking-wider">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}