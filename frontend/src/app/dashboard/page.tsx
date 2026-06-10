"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { API_BASE_URL } from "../../lib/api";

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at?: string;
}

export default function ServicesPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const [ussdCode, setUssdCode] = useState("*700#");
  const [ussdResponse, setUssdResponse] = useState("");
  const [ussdLoading, setUssdLoading] = useState(false);
  const [ussdError, setUssdError] = useState<string | null>(null);

  const storageKey = (userId: number) => `sacco_notifications_${userId}`;

  const loadNotifications = useCallback(async () => {
    try {
      setLoadingNotifs(true);
      const stored = localStorage.getItem("sacco_user");
      if (!stored) return;
      const user = JSON.parse(stored);
      const res = await fetch(`${API_BASE_URL}/notifications/${user.user_id}`);
      if (!res.ok) return;
      const data = await res.json();

      // Merge with local read state stored in localStorage so read flags persist across reloads
      const localMapRaw = localStorage.getItem(storageKey(user.user_id));
      const localMap = localMapRaw ? JSON.parse(localMapRaw) : {};
      const merged = data.map((n: NotificationItem) => ({
        ...n,
        is_read: typeof localMap[n.id] === 'boolean' ? localMap[n.id] : n.is_read,
      }));

      setNotifications(merged);

      // Ensure local store contains entries for these notifications
      const updatedMap: Record<string, boolean> = { ...localMap };
      merged.forEach((m: NotificationItem) => {
        if (typeof updatedMap[m.id] !== 'boolean') updatedMap[m.id] = m.is_read;
      });
      localStorage.setItem(storageKey(user.user_id), JSON.stringify(updatedMap));
    } catch {
      // ignore
    } finally {
      setLoadingNotifs(false);
    }
  }, []);

  const markRead = async (id: number) => {
    try {
      const stored = localStorage.getItem("sacco_user");
      if (!stored) return;
      const user = JSON.parse(stored);
      const res = await fetch(`${API_BASE_URL}/notifications/${id}/read`, { method: "POST" });
      if (!res.ok) return;

      // Update local state optimistically
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));

      // Update local storage map
      const localMapRaw = localStorage.getItem(storageKey(user.user_id));
      const localMap = localMapRaw ? JSON.parse(localMapRaw) : {};
      localMap[id] = true;
      localStorage.setItem(storageKey(user.user_id), JSON.stringify(localMap));
    } catch {
      // ignore
    }
  };

  const runUSSD = async (code?: string) => {
    try {
      setUssdLoading(true);
      setUssdError(null);
      const stored = localStorage.getItem("sacco_user");
      if (!stored) return;
      const user = JSON.parse(stored);
      const payload = {
        phone: user.phone,
        code: code ?? ussdCode,
      };
      const res = await fetch(`${API_BASE_URL}/ussd`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error(errBody?.detail || `USSD failed (${res.status})`);
      }
      const data = await res.json();
      setUssdResponse(data.message);
    } catch (err) {
      setUssdError(err instanceof Error ? err.message : "Unable to execute USSD command.");
    } finally {
      setUssdLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    const stored = localStorage.getItem("sacco_user");
    if (!stored) return;
    const user = JSON.parse(stored);
    const es = new EventSource(`${API_BASE_URL}/notifications/stream/${user.user_id}`);
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        // apply local read state if present
        const localMapRaw = localStorage.getItem(storageKey(user.user_id));
        const localMap = localMapRaw ? JSON.parse(localMapRaw) : {};
        const item = { ...data, is_read: typeof localMap[data.id] === 'boolean' ? localMap[data.id] : data.is_read };
        setNotifications((prev) => [item, ...prev]);

        // ensure stored map has an entry for this notification
        if (typeof localMap[data.id] !== 'boolean') {
          localMap[data.id] = item.is_read;
          localStorage.setItem(storageKey(user.user_id), JSON.stringify(localMap));
        }
      } catch {
        // ignore
      }
    };
    es.onerror = () => {
      es.close();
    };
    return () => es.close();
  }, [loadNotifications]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-12">
      {unreadCount > 0 ? (
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
          You have <strong className="font-semibold">{unreadCount}</strong> unread notification{unreadCount>1?"s":""}. <button onClick={() => loadNotifications()} disabled={loadingNotifs} className="underline ml-2" type="button">{loadingNotifs ? "Refreshing..." : "Refresh"}</button>
        </div>
      ) : null}

      <div className="bg-slate-50 rounded-3xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">USSD Member Access</h3>
            <p className="text-sm text-gray-600 mt-1">Simulate SACCO USSD commands directly from your dashboard. Start with <span className="font-semibold">*700#</span>.</p>
          </div>
          <span className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white">
            Demo USSD: *700#
          </span>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-[1.6fr_0.8fr]">
          <input
            value={ussdCode}
            onChange={(e) => setUssdCode(e.target.value)}
            className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="button"
            onClick={() => runUSSD()}
            disabled={ussdLoading}
            className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-green-800 transition disabled:opacity-50"
          >
            {ussdLoading ? "Dialing..." : "Dial"}
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            { label: "Menu", code: "*700#" },
            { label: "Balance", code: "*700*1#" },
            { label: "Notifications", code: "*700*2#" },
            { label: "Loan status", code: "*700*3#" },
            { label: "Member info", code: "*700*4#" },
          ].map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => {
                setUssdCode(item.code);
                runUSSD(item.code);
              }}
              className="rounded-full border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:border-primary hover:text-primary transition"
            >
              {item.label}
            </button>
          ))}
        </div>
        {ussdError ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {ussdError}
          </div>
        ) : null}
        {ussdResponse ? (
          <div className="mt-4 rounded-2xl border border-gray-200 bg-white px-4 py-4 text-sm text-slate-700">
            <pre className="whitespace-pre-wrap text-sm">{ussdResponse}</pre>
          </div>
        ) : null}
      </div>

      {notifications.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h3 className="font-semibold text-primary">Notifications</h3>
            <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800">
              {unreadCount} unread
            </span>
          </div>
          <ul className="space-y-2">
            {notifications.map((n) => (
              <li key={n.id} className={`p-3 rounded-lg border ${n.is_read ? 'bg-gray-50 border-gray-100' : 'bg-white border-yellow-100'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{n.title}</p>
                    <p className="text-sm text-gray-600">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{n.created_at ? new Date(n.created_at).toLocaleString() : ''}</p>
                  </div>
                  {!n.is_read ? (
                    <button onClick={() => markRead(n.id)} className="ml-4 rounded-full bg-primary px-3 py-1 text-xs text-white">Mark read</button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <section className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-accent mb-4">Our Services</p>
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-5 leading-tight">
              Financial services designed for members, powered by transparency and trust.
            </h1>
            <p className="text-gray-600 text-lg leading-8 mb-8 max-w-2xl">
              Community SACCO offers tailored loans, savings plans, and responsible credit support for women entrepreneurs in Wajir. Our service model is designed to protect dignity, reduce bias, and keep families moving forward.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/register" className="inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-slate-950 shadow-sm hover:bg-yellow-500 transition">
                Become a Member
              </Link>
              <Link href="/" className="inline-flex items-center justify-center rounded-full border border-accent px-6 py-3 text-sm font-semibold text-accent hover:bg-accent/10 transition">
                Return Home
              </Link>
            </div>
          </div>
          <div className="overflow-hidden rounded-[32px] bg-slate-100 shadow-xl">
            <div className="p-8">
              <p className="text-sm uppercase tracking-[0.3em] text-green-600 mb-4">Member-first services</p>
              <h2 className="text-2xl font-semibold text-slate-900 mb-3">Trusted lending for Wajir entrepreneurs</h2>
              <p className="text-gray-600 leading-7">
                We combine local expertise, digital convenience, and human review to deliver fair access to capital, even when traditional lending is out of reach.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: "Member Savings",
            description: "Secure savings plans with clear returns and community support.",
          },
          {
            title: "Responsible Loans",
            description: "Flexible credit designed around seasonal income and market needs.",
          },
          {
            title: "Governance Support",
            description: "Transparent member oversight and ethical AI guidance for every decision.",
          },
        ].map((service) => (
          <article key={service.title} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition">
            <h3 className="text-xl font-semibold text-primary mb-3">{service.title}</h3>
            <p className="text-gray-600 leading-7">{service.description}</p>
          </article>
        ))}
      </section>

      <section className="bg-slate-950 text-white rounded-[32px] border border-slate-800 p-8">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-green-300 mb-4">How it works</p>
            <h2 className="text-3xl font-bold mb-5">Simple steps to join, save, and borrow with confidence.</h2>
            <p className="text-slate-300 leading-8">
              Start as a member, access support through your local SACCO officer, and use our inclusive lending channels whether you have a smartphone or not.
            </p>
          </div>
          <div className="grid gap-4">
            {[
              {
                step: "1",
                label: "Join the SACCO",
                detail: "Register through mobile or at a local branch with support from our community team.",
              },
              {
                step: "2",
                label: "Build your savings",
                detail: "Choose a savings plan that matches your cash flow and future goals.",
              },
              {
                step: "3",
                label: "Apply for credit",
                detail: "Submit an application with simple documentation and receive a fair review.",
              },
            ].map((item) => (
              <div key={item.step} className="rounded-3xl bg-slate-900 p-6 border border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-lg font-bold text-slate-950">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-semibold">{item.label}</h3>
                    <p className="text-sm text-slate-300">{item.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
          <h3 className="text-2xl font-semibold text-primary mb-4">Member benefits</h3>
          <ul className="space-y-3 text-gray-600">
            <li>• No hidden fees and transparent loan schedules.</li>
            <li>• Local credit officers with human review.</li>
            <li>• Inclusive access using USSD and mobile channels.</li>
            <li>• Ongoing financial education and community support.</li>
          </ul>
        </div>
        <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
          <h3 className="text-2xl font-semibold text-primary mb-4">Committed to fairness</h3>
          <p className="text-gray-600 leading-7">
            Our services are built around a community-first model. Every member receives equal opportunity, and every decision is reviewed to reduce bias and protect dignity.
          </p>
        </div>
      </section>
    </main>
  );
}
