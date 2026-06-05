import Link from "next/link";

export default function Home() {
  return (
    <main className="max-w-6xl mx-auto p-6">
      {/* Hero */}
      <section className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100 mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
          Fair Loans. Human Dignity. Financial Growth.
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Empowering women livestock traders and market vendors in Wajir County through ethical, transparent, and human-centered financial services.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/login" className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-800 transition">
            Join Community SACCO
          </Link>
          <Link href="/admin" className="border-2 border-primary text-primary px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition">
            Admin Portal
          </Link>
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