import React from "react";

export default function SiteFooter() {
  return (
    <footer className="w-full py-6 mt-8 border-t border-slate-200 bg-white print:hidden font-sans">
      <div className="max-w-screen-xl mx-auto px-4 text-center space-y-1">
        <p className="text-[11px] text-slate-500 font-medium">
          &copy; {new Date().getFullYear()} <span className="text-slate-800 font-bold">Azharangga Kusuma</span>. All rights reserved.
        </p>
        <p className="text-[10px] text-slate-400">
          Built with <span className="text-slate-600 font-semibold">Next.js</span> & <span className="text-slate-600 font-semibold">Tailwind CSS</span>
        </p>
      </div>
    </footer>
  );
}