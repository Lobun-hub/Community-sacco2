'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("+254700000001");
  const [name, setName] = useState("Amina Hassan");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    localStorage.setItem("memberPhone", phone);
    localStorage.setItem("memberName", name);
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-100 py-16">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-10 shadow-xl shadow-slate-900/5">
          <h1 className="text-4xl font-bold text-slate-900">Member Login</h1>
          <p className="mt-3 text-slate-600">
            Use the seeded trial account, then click the button to preview your personal dashboard.
          </p>
          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            <label className="block space-y-2 text-sm font-medium text-slate-700">
              Full name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30"
              />
            </label>
            <label className="block space-y-2 text-sm font-medium text-slate-700">
              Phone number
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30"
              />
            </label>
            <button
              type="submit"
              className="inline-flex w-full justify-center rounded-2xl bg-brand-green px-6 py-4 text-base font-semibold text-white shadow hover:bg-emerald-700"
            >
              Receive OTP & Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
