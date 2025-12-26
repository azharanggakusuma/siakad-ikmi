import React from "react";

interface PageHeaderProps {
  title: string;
  breadcrumb: string[];
}

export default function PageHeader({ title, breadcrumb }: PageHeaderProps) {
  return (
    <div className="flex flex-col min-w-0"> 
      <h1 className="text-2xl font-bold tracking-tight text-slate-800 truncate">
        {title}
      </h1>
      <div className="mt-1 flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-slate-400 truncate">
        {breadcrumb.map((item, idx) => (
          <React.Fragment key={`${item}-${idx}`}>
            <span className="truncate">{item}</span>
            {idx < breadcrumb.length - 1 && (
              <span className="text-slate-300 shrink-0">/</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}