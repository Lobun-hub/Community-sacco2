import Link from "next/link";

export default function Home() {
  return (
    <main className="max-w-6xl mx-auto p-6">
      {/* Hero */}
      <section className="grid gap-10 items-center bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-12 md:grid-cols-[1.2fr_0.8fr]">
        <div className="text-center md:text-left">
          <p className="text-sm uppercase tracking-[0.3em] text-accent mb-4">Community SACCO for Wajir</p>
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-5 leading-tight">
            Fair Loans. Human Dignity. Financial Growth.
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto md:mx-0">
            Empowering women livestock traders and market vendors in Wajir County through ethical, transparent, and human-centered financial services.
          </p>
          <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4">
            <Link href="/register" className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-800 transition">
              Join Community SACCO
            </Link>
            <Link href="/admin" className="border-2 border-primary text-primary px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition">
              Admin Portal
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-[32px] bg-slate-100 shadow-xl">
          <img
            src="/wajir.png"
            alt="Wajir woman entrepreneur at market"
            className="w-full h-96 object-cover"
            loading="lazy"
          />
          <div className="p-5 bg-white border-t border-gray-100">
            <p className="text-sm text-gray-500">Supporting financial resilience for women-led businesses in rural Kenya.</p>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="bg-slate-50 rounded-3xl border border-slate-200 p-8 mb-12">
        <div className="max-w-5xl mx-auto grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-accent mb-4">About Community SACCO</p>
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Building trusted financial pathways for women-led enterprises in Wajir.
            </h2>
            <p className="text-gray-600 leading-8 mb-6">
              Community SACCO blends local knowledge, ethical lending, and simple technology so women livestock traders and market vendors can access credit with dignity and transparency.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
                <h3 className="font-semibold text-lg mb-2">Local impact</h3>
                <p className="text-gray-600">Loans tailored to rural livelihoods and cashflow patterns in Wajir County.</p>
              </div>
              <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
                <h3 className="font-semibold text-lg mb-2">Transparent process</h3>
                <p className="text-gray-600">Clear terms, human review, and an inclusive USSD option for every member.</p>
              </div>
            </div>
          </div>
          <div className="rounded-[28px] bg-primary/5 p-8 shadow-inner border border-primary/10">
            <p className="text-primary font-semibold uppercase tracking-[0.24em] mb-4">Our mission</p>
            <p className="text-gray-700 leading-8">
              To unlock economic agency for women entrepreneurs through trusted savings and loan services, ethical AI oversight, and community-centered governance.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-3 gap-6 mb-12">
        {[
          { title: "Ethical AI (TRACK)", desc: "Zero bias based on gender, clan, or marital status." },
          { title: "Human-in-the-Loop", desc: "All final decisions reviewed by local loan officers." },
          { title: "USSD Fallback", desc: "Dial *123# anytime. No smartphone required." }
        ].map((f, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-accent">
            <h3 className="font-bold text-lg mb-2">{f.title}</h3>
            <p className="text-gray-600">{f.desc}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
