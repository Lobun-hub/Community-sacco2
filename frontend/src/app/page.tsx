import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-brand-green/90 via-slate-800 to-slate-950 text-white">
      <div className="container mx-auto px-6 py-20">
        <div className="rounded-3xl border border-white/10 bg-white/10 p-10 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex rounded-full bg-white/10 px-4 py-1 text-sm font-semibold uppercase tracking-[0.24em] text-slate-200">
              Community SACCO
            </p>
            <h1 className="mt-6 text-5xl font-black tracking-tight text-white sm:text-6xl">
              Build local savings and loans with trust, fairness, and speed.
            </h1>
            <p className="mt-6 text-xl leading-8 text-slate-200">
              Preview the member dashboard, loan application flow, and compliance reporting all in one ethical fintech demo.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/login" className="inline-flex items-center justify-center rounded-full bg-brand-gold px-8 py-4 text-base font-semibold text-slate-950 shadow-lg shadow-brand-green/20 transition hover:bg-yellow-300">
                Join Community SACCO
              </Link>
              <Link href="/admin" className="inline-flex items-center justify-center rounded-full border border-white/20 px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10">
                View Admin Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
