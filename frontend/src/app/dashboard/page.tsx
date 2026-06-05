'use client';

import { useEffect, useState } from "react";

interface Loan {
  id: number;
  amount: number;
  purpose: string;
  status: string;
  risk_score: number;
  created_at: string;
}

interface Member {
  id: number;
  full_name: string;
  phone: string;
  savings_balance: number;
  loans: Loan[];
}

export default function DashboardPage() {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState(10000);
  const [purpose, setPurpose] = useState("Livestock Purchase");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const phone = localStorage.getItem("memberPhone") || "+254700000001";
    fetch(`http://localhost:8000/members/${encodeURIComponent(phone)}`)
      .then((res) => res.json())
      .then((data) => {
        setMember(data);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!member) return;

    setMessage("Submitting application...");
    const response = await fetch("http://localhost:8000/loans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ member_id: member.id, amount, purpose }),
    });

    if (response.ok) {
      const loan = await response.json();
      setMember({ ...member, loans: [loan, ...member.loans] });
      setMessage("Your loan application has been submitted.");
      setAmount(10000);
      setPurpose("Livestock Purchase");
    } else {
      setMessage("Unable to submit the application. Please try again.");
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-slate-100 p-10">Loading dashboard…</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-6">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl bg-white p-10 shadow-lg shadow-slate-200/60">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-brand-green">Member Dashboard</p>
                <h1 className="mt-4 text-3xl font-bold text-slate-900">Welcome, {member?.full_name}</h1>
              </div>
            </div>
            <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm text-slate-500">Savings balance</p>
              <p className="mt-3 text-4xl font-semibold text-slate-900">KES {member?.savings_balance.toLocaleString()}</p>
              <p className="mt-2 text-slate-600">Phone: {member?.phone}</p>
            </div>

            <section className="mt-10">
              <h2 className="text-2xl font-semibold text-slate-900">Apply for a loan</h2>
              <form onSubmit={handleSubmit} className="mt-6 space-y-5 rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <label className="block text-sm font-medium text-slate-700">
                  Amount (KES)
                  <input
                    type="number"
                    value={amount}
                    onChange={(event) => setAmount(Number(event.target.value))}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/20"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Purpose
                  <select
                    value={purpose}
                    onChange={(event) => setPurpose(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/20"
                  >
                    <option>Livestock Purchase</option>
                    <option>Education Support</option>
                    <option>Business Expansion</option>
                    <option>Farm Equipment</option>
                  </select>
                </label>
                <button className="w-full rounded-2xl bg-brand-gold px-6 py-4 text-base font-semibold text-slate-950 shadow hover:bg-yellow-300">
                  Submit Application
                </button>
                {message ? <p className="text-sm text-slate-600">{message}</p> : null}
              </form>
            </section>
          </div>

          <aside className="rounded-3xl bg-white p-10 shadow-lg shadow-slate-200/60">
            <h2 className="text-2xl font-semibold text-slate-900">Loan history</h2>
            <div className="mt-6 space-y-4">
              {member?.loans.length ? (
                member.loans.map((loan) => (
                  <div key={loan.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-slate-900">KES {loan.amount.toLocaleString()}</p>
                      <span className="rounded-full bg-brand-green/10 px-3 py-1 text-sm font-semibold text-brand-green">
                        {loan.status}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-slate-600">{loan.purpose}</p>
                    <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                      <span>Risk score: {loan.risk_score}</span>
                      <span>{new Date(loan.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-600">
                  No loan applications yet. Apply once to see them here.
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
