"use client";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "../../lib/api";

interface User {
  user_id: number;
  name: string;
  savings_balance: number;
}

interface Loan {
  id: number;
  amount: number;
  purpose: string;
  status: string;
  risk_score: number;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("sacco_user");
    if (!stored) return router.push("/login");
    const userData = JSON.parse(stored);
    setUser(userData);
    fetch(`${API_BASE_URL}/loans/${userData.user_id}`)
      .then(res => res.json())
      .then(setLoans);
  }, [router]);

  const applyLoan = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const res = await fetch(`${API_BASE_URL}/loans/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.user_id, amount: parseFloat(amount), purpose }),
    });
    const data = await res.json();
    setLoans([...loans, data]);
    setAmount("");
    setPurpose("");
    alert("Application submitted! Guardian Agent is reviewing for fairness.");
  };

  if (!user) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-primary text-white p-6 rounded-xl shadow-md flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Karibu, {user.name}</h2>
          <p className="text-green-100">Member ID: {user.user_id} | Wajir West</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-green-100">Savings Balance</p>
          <p className="text-3xl font-bold text-accent">KES {user.savings_balance.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Apply Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-primary mb-4">Apply for a Loan</h3>
          <form onSubmit={applyLoan} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Amount (KES)</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-2 border rounded" placeholder="e.g., 10000" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Purpose</label>
              <select value={purpose} onChange={e => setPurpose(e.target.value)} className="w-full p-2 border rounded" required>
                <option value="">Select Purpose</option>
                <option value="Livestock Purchase">Livestock Purchase</option>
                <option value="Business Stock">Business Stock</option>
                <option value="School Fees">School Fees</option>
                <option value="Emergency Medical">Emergency Medical</option>
              </select>
            </div>
            <button type="submit" className="w-full bg-accent text-dark font-bold py-2 rounded hover:bg-yellow-500 transition">
              Submit Application
            </button>
          </form>
        </div>

        {/* Loan Status */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-primary mb-4">Your Applications</h3>
          {loans.length === 0 ? (
            <p className="text-gray-500">No active loans.</p>
          ) : (
            <div className="space-y-3">
              {loans.map((loan) => (
                <div key={loan.id} className="p-3 bg-gray-50 rounded-lg border-l-4 border-accent">
                  <div className="flex justify-between font-semibold">
                    <span>KES {loan.amount.toLocaleString()}</span>
                    <span className={`text-sm px-2 py-1 rounded ${loan.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {loan.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{loan.purpose}</p>
                  <p className="text-xs text-gray-400 mt-1">Guardian Risk Score: {loan.risk_score.toFixed(1)} (Low Bias)</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}