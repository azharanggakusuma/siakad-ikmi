import React from "react";

type StatCardProps = {
  label: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  themeColor: "chart-1" | "chart-2" | "chart-3" | "chart-4";
};

export function StatCard({ label, value, description, icon, themeColor }: StatCardProps) {
  const colorMap = {
    "chart-1": "text-chart-1 border-chart-1/20 bg-chart-1/10",
    "chart-2": "text-chart-2 border-chart-2/20 bg-chart-2/10",
    "chart-3": "text-chart-3 border-chart-3/20 bg-chart-3/10",
    "chart-4": "text-chart-4 border-chart-4/20 bg-chart-4/10",
  };

  return (
    <div className="group relative rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-foreground">
              {value}
            </span>
          </div>
          <p className="mt-1 text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            {description}
          </p>
        </div>
        
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${colorMap[themeColor]} transition-transform group-hover:scale-105`}>
          {icon}
        </div>
      </div>
    </div>
  );
}