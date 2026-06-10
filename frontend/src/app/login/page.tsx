"use client";
import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { API_BASE_URL } from "../../lib/api";

export default function LoginPage() {
  const [phone, setPhone] = useState("+254700000001");
  const [name, setName] = useState("Amina Hassan");
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered") === "true";

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, name }),
    });
    const data = await res.json();
    localStorage.setItem("sacco_user", JSON.stringify(data));
    router.push("/dashboard");
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-primary mb-6 text-center">Member Login</h2>
      {registered ? (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-center text-sm text-green-700 mb-4">
          Registration successful! Please log in to access Community SACCO services.
        </div>
      ) : null}
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none" required />
        </div>
        <button type="submit" className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-green-800 transition">
          Login
        </button>
        <p className="text-xs text-center text-gray-500 mt-4">
          Demo: Use +254700000001 for Member, +254711111111 for Admin
        </p>
        <p className="text-xs text-center text-accent font-semibold mt-2">
          Kill Switch: Dial *700# to halt all AI messages
        </p>
      </form>
      <p className="text-center text-sm text-gray-500 mt-6">
        Not registered yet? <a href="/register" className="font-semibold text-accent hover:text-primary">Create a member account</a> first.
      </p>
    </div>
  );
}