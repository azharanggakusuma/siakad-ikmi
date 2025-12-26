import Image from "next/image";

export function LoginBranding() {
  return (
    <div className="hidden lg:flex flex-col justify-between bg-[#1B3F95] p-16 text-white relative overflow-hidden h-full">
      {/* Dekorasi Background */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 h-[400px] w-[400px] rounded-full bg-white/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-[300px] w-[300px] rounded-full bg-blue-400/20 blur-3xl" />

      {/* Brand Header */}
      <div className="relative z-10 flex items-center gap-4">
        <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-white shadow-lg p-2 flex items-center justify-center">
          <Image
            src="/img/logo-ikmi.png"
            alt="Logo IKMI"
            fill
            className="object-contain p-1"
            priority
          />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-wide">SIAKAD</h2>
          <p className="text-xs text-blue-200 font-medium tracking-widest uppercase">
            STMIK IKMI Cirebon
          </p>
        </div>
      </div>

      {/* Main Hero Text */}
      <div className="relative z-10 max-w-md space-y-6">
        <h1 className="text-5xl font-extrabold leading-tight tracking-tight">
          Portal Akademik <br />
          <span className="text-blue-200">Terintegrasi.</span>
        </h1>
        <p className="text-lg text-blue-100/80 leading-relaxed font-light">
          Sistem Informasi Akademik untuk pengelolaan data perkuliahan, nilai, dan
          administrasi akademik Civitas STMIK IKMI Cirebon.
        </p>
      </div>

      {/* Footer Kiri */}
      <div className="relative z-10 flex items-center gap-2 text-sm text-blue-200/60">
        <div className="h-px w-8 bg-blue-200/30" />
        <span>Academic Information System</span>
      </div>
    </div>
  );
}