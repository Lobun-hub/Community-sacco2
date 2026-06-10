"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "../../lib/api";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [business, setBusiness] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, name, business_type: business }),
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => null);
        throw new Error(errorBody?.detail ?? "Unable to register at this time.");
      }

      await res.json();
      router.push("/login?registered=true");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-20 p-8 bg-white rounded-3xl shadow-xl border border-gray-100">
      <div className="mb-8 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-accent mb-3">Become a member</p>
        <h1 className="text-3xl font-bold text-primary">Join Community SACCO</h1>
        <p className="text-gray-600 mt-3">
          Register your member account first, then return to login and access our services.
        </p>
      </div>

      <form onSubmit={handleRegister} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            placeholder="Amina Hassan"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            placeholder="+254700000001"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Business Type</label>
          <input
            type="text"
            value={business}
            onChange={(e) => setBusiness(e.target.value)}
            className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            placeholder="Livestock trading, market goods, or savings group"
          />
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-primary px-5 py-3 text-white font-semibold shadow-sm hover:bg-green-800 transition disabled:opacity-60"
        >
          {loading ? "Registering…" : "Register as Member"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Already registered? <a href="/login" className="font-semibold text-accent hover:text-primary">Login here</a>.
      </p>
    </div>
  );
}
