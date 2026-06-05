"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [phone, setPhone] = useState("+254700000001");
  const [name, setName] = useState("Amina Hassan");
  const router = useRouter();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await fetch("http://localhost:8000/login", {
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
          Receive OTP & Login
        </button>
        <p className="text-xs text-center text-gray-500 mt-4">
          Demo: Use +254700000001 for Member, +254711111111 for Admin
        </p>
        <p className="text-xs text-center text-accent font-semibold mt-2">
          Kill Switch: Dial *700# to halt all AI messages
        </p>
      </form>
    </div>
  );
}