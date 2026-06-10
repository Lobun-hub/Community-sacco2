"use client";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "../../lib/api";

interface AuditLog {
  framework: string;
  action: string;
  timestamp?: string;
}

interface LoanItem {
  id: number;
  user_id: number;
  user_name?: string;
  amount: number;
  purpose: string;
  status: string;
  risk_score: number;
  created_at?: string;
}

interface MemberItem {
  id: number;
  phone: string;
  name: string;
  role: string;
  business_type?: string;
  savings_balance: number;
  is_active: boolean;
}

interface AdminMetrics {
  total_loans: number;
  approval_rate: string;
  bias_flags: number;
  oasis_compliance: string;
  recent_audits: AuditLog[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [activityLogs, setActivityLogs] = useState<AuditLog[]>([]);
  const [loans, setLoans] = useState<LoanItem[]>([]);
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const [loansLoading, setLoansLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activityError, setActivityError] = useState<string | null>(null);
  const [loansError, setLoansError] = useState<string | null>(null);
  const [membersError, setMembersError] = useState<string | null>(null);

  const [adminPhone, setAdminPhone] = useState("+254711111111");
  const [adminPassword, setAdminPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMessage, setNotifMessage] = useState("");
  const [notifRecipients, setNotifRecipients] = useState("");
  const [notifSending, setNotifSending] = useState(false);

  const loadMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/metrics`);
      if (!res.ok) {
        throw new Error(`Failed to load metrics (${res.status})`);
      }
      const data = await res.json();
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load admin data.");
    } finally {
      setLoading(false);
    }
  };

  const loadActivityLogs = async () => {
    setActivityLoading(true);
    setActivityError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/audit-log`);
      if (!res.ok) {
        throw new Error(`Failed to load activity log (${res.status})`);
      }
      const data = await res.json();
      setActivityLogs(data);
    } catch (err) {
      setActivityError(err instanceof Error ? err.message : "Unable to load activity log.");
    } finally {
      setActivityLoading(false);
    }
  };

  const loadLoans = async () => {
    setLoansLoading(true);
    setLoansError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/loans`);
      if (!res.ok) {
        throw new Error(`Failed to load loans (${res.status})`);
      }
      const data = await res.json();
      setLoans(data);
    } catch (err) {
      setLoansError(err instanceof Error ? err.message : "Unable to load loan requests.");
    } finally {
      setLoansLoading(false);
    }
  };

  const loadMembers = async () => {
    setMembersLoading(true);
    setMembersError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/members`);
      if (!res.ok) {
        throw new Error(`Failed to load members (${res.status})`);
      }
      const data = await res.json();
      setMembers(data);
    } catch (err) {
      setMembersError(err instanceof Error ? err.message : "Unable to load members.");
    } finally {
      setMembersLoading(false);
    }
  };

  const handleApproveLoan = async (loanId: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/loans/${loanId}/approve`, {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error(`Failed to approve loan (${res.status})`);
      }
      await Promise.all([loadLoans(), loadActivityLogs(), loadMetrics()]);
    } catch (err) {
      setLoansError(err instanceof Error ? err.message : "Unable to approve loan.");
    }
  };

  const handleRejectLoan = async (loanId: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/loans/${loanId}/reject`, {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error(`Failed to reject loan (${res.status})`);
      }
      await Promise.all([loadLoans(), loadActivityLogs(), loadMetrics()]);
    } catch (err) {
      setLoansError(err instanceof Error ? err.message : "Unable to reject loan.");
    }
  };

  const handleToggleMember = async (memberId: number, active: boolean) => {
    try {
      const route = active ? "activate" : "deactivate";
      const res = await fetch(`${API_BASE_URL}/admin/members/${memberId}/${route}`, {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error(`Failed to ${route} member (${res.status})`);
      }
      await Promise.all([loadMembers(), loadActivityLogs()]);
    } catch (err) {
      setMembersError(err instanceof Error ? err.message : "Unable to update member status.");
    }
  };

  const handleSendNotification = async (e?: FormEvent) => {
    e?.preventDefault();
    setNotifSending(true);
    try {
      const body: {
        title: string;
        message: string;
        recipient_ids?: number[];
      } = { title: notifTitle, message: notifMessage };
      if (notifRecipients.trim()) {
        body.recipient_ids = notifRecipients.split(",").map((s) => Number(s.trim())).filter(Boolean);
      }
      const res = await fetch(`${API_BASE_URL}/admin/notifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Failed to send notification (${res.status})`);
      setNotifTitle("");
      setNotifMessage("");
      setNotifRecipients("");
      await Promise.all([loadActivityLogs(), loadMembers()]);
      alert("Notification sent successfully.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unable to send notification.");
    } finally {
      setNotifSending(false);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("sacco_user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.role === "admin") {
          setIsAdmin(true);
          Promise.all([loadMetrics(), loadActivityLogs(), loadLoans(), loadMembers()]);
          return;
        }
      } catch {
        // ignore invalid storage
      }
    }
    setLoading(false);
    setActivityLoading(false);
    setLoansLoading(false);
    setMembersLoading(false);
  }, []);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoggingIn(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: adminPhone, name: "Admin", password: adminPassword }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.detail || `Login failed (${res.status})`);
      }

        const userData = await res.json();
      if (userData.role !== "admin") {
        throw new Error("Admin login required.");
      }

      localStorage.setItem("sacco_user", JSON.stringify(userData));
      setIsAdmin(true);
      await Promise.all([loadMetrics(), loadActivityLogs(), loadLoans(), loadMembers()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to authenticate admin.");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("sacco_user");
    router.push("/");
  };

  if (loading) return <div className="p-10 text-center">Loading Governance Data...</div>;

  if (!isAdmin) {
    return (
      <div className="max-w-lg mx-auto p-8 bg-white rounded-3xl shadow-xl border border-gray-200">
        <h1 className="text-3xl font-bold text-primary mb-4">Admin Login</h1>
        <p className="text-sm text-gray-600 mb-6">Enter the admin password to access the SACCO governance dashboard.</p>

        {error ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleLogin} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Admin Phone</span>
            <input
              type="tel"
              value={adminPhone}
              onChange={(event) => setAdminPhone(event.target.value)}
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="+254711111111"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Password</span>
            <input
              type="password"
              value={adminPassword}
              onChange={(event) => setAdminPassword(event.target.value)}
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="admin"
            />
          </label>

          <button
            type="submit"
            disabled={loggingIn}
            className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-800 disabled:opacity-50"
          >
            {loggingIn ? "Signing in..." : "Sign in as Admin"}
          </button>
        </form>
      </div>
    );
  }

  if (isAdmin && !metrics) {
    return (
      <div className="max-w-4xl mx-auto p-10 text-center bg-white rounded-xl shadow-sm border border-red-100 text-red-700">
        <p className="font-semibold mb-4">{error || "Unable to load admin metrics."}</p>
        <div className="flex flex-col gap-3 items-center justify-center">
          <button onClick={loadMetrics} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-green-800 transition">
            Retry
          </button>
          <button onClick={handleLogout} className="rounded-full bg-accent text-dark px-4 py-2 text-sm font-semibold hover:bg-yellow-500 transition">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Governance & Compliance</h1>
          <p className="text-sm text-gray-600 mt-1">Review current risk, bias, and audit status for the SACCO.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={loadMetrics} className="rounded-full bg-white/10 border border-white/30 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 transition">
            Refresh Metrics
          </button>
          <button onClick={handleLogout} className="rounded-full bg-accent text-dark px-4 py-2 text-sm font-semibold hover:bg-yellow-500 transition">
            Log out
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Notification composer */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-bold text-primary mb-4">Send Announcement</h2>
          <p className="text-sm text-gray-600 mb-4">Broadcast a message to all members or specify recipient IDs (comma-separated).</p>
          <form onSubmit={handleSendNotification} className="space-y-3">
            <input value={notifTitle} onChange={(e) => setNotifTitle(e.target.value)} placeholder="Title" className="w-full p-3 border rounded-lg" />
            <textarea value={notifMessage} onChange={(e) => setNotifMessage(e.target.value)} placeholder="Message" className="w-full p-3 border rounded-lg" />
            <input value={notifRecipients} onChange={(e) => setNotifRecipients(e.target.value)} placeholder="Recipient IDs (optional) e.g. 2,3" className="w-full p-3 border rounded-lg" />
            <div className="flex gap-2">
              <button type="submit" disabled={notifSending} className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-green-800 transition">
                {notifSending ? "Sending..." : "Send"}
              </button>
            </div>
          </form>
        </div>
        {/* TRACK Dashboard */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-primary">
          <h2 className="text-xl font-bold text-primary mb-4">TRACK Framework</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span>Training Data Audit</span>
              <span className="text-green-600 font-bold">Passed</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span>Amplification Detection</span>
              <span className="text-green-600 font-bold">0 Bias Flags</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span>Kill Switch Status</span>
              <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">ARMED (*733#)</span>
            </div>
          </div>
        </div>

        {/* OASIS Dashboard */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-accent">
          <h2 className="text-xl font-bold text-primary mb-4">OASIS Framework</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span>Opt-In Consent Rate</span>
              <span className="font-bold">94.2%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span>Data Sovereignty</span>
              <span className="text-green-600 font-bold">Kenya Hosted</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span>Encryption at Rest</span>
              <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">AES-256</span>
            </div>
          </div>
        </div>
      </div>

      {/* Loan Oversight */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-primary">Loan Oversight</h2>
            <p className="text-sm text-gray-600">Approve or reject loan applications that require human review beyond AI oversight.</p>
          </div>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-600">
            {loans.length} requests
          </span>
        </div>

        {loansLoading ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-gray-500">
            Loading loan requests...
          </div>
        ) : loansError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
            {loansError}
          </div>
        ) : loans.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center text-gray-600">
            No loan requests available for review.
          </div>
        ) : (
          <div className="space-y-4">
            {loans.map((loan) => (
              <div key={loan.id} className="rounded-3xl border border-gray-100 bg-gray-50 p-5 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{loan.purpose}</h3>
                    <p className="text-sm text-gray-500">{loan.user_name || `Member ${loan.user_id}`} • {loan.amount.toLocaleString()} KES</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${loan.status === "approved" ? "bg-green-100 text-green-700" : loan.status === "rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {loan.status.toUpperCase()}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
                    <p className="font-semibold text-gray-800">Risk score</p>
                    <p>{loan.risk_score.toFixed(1)}%</p>
                  </div>
                  <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
                    <p className="font-semibold text-gray-800">Requested</p>
                    <p>{loan.created_at ? new Date(loan.created_at).toLocaleString() : "Unknown"}</p>
                  </div>
                  <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
                    <p className="font-semibold text-gray-800">Member</p>
                    <p>{loan.user_name || "Member record not found"}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                  <button
                    onClick={() => handleApproveLoan(loan.id)}
                    className="rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleRejectLoan(loan.id)}
                    className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Member Controls */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-primary">Member Controls</h2>
            <p className="text-sm text-gray-600">Activate or deactivate members with a single click.</p>
          </div>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-600">
            {members.length} members
          </span>
        </div>

        {membersLoading ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-gray-500">
            Loading members...
          </div>
        ) : membersError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
            {membersError}
          </div>
        ) : members.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center text-gray-600">
            No members found.
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <div key={member.id} className="grid gap-4 rounded-3xl border border-gray-100 bg-gray-50 p-5 md:grid-cols-[1fr_auto]">
                <div>
                  <p className="font-semibold text-gray-800">{member.name}</p>
                  <p className="text-sm text-gray-500">{member.phone} • {member.business_type || "No business type"}</p>
                  <p className="text-sm text-gray-500">Savings: KES {member.savings_balance.toLocaleString()}</p>
                </div>
                <div className="flex flex-col items-start gap-2 sm:items-end">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${member.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {member.is_active ? "Active" : "Inactive"}
                  </span>
                  <button
                    onClick={() => handleToggleMember(member.id, !member.is_active)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold text-white ${member.is_active ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}`}
                  >
                    {member.is_active ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Audits */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-bold text-primary mb-4">Recent Audit Logs (PRIDE)</h2>
        <ul className="space-y-4">
          {metrics!.recent_audits.map((log: AuditLog, i: number) => (
            <li key={i} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="font-semibold text-gray-700">[{log.framework}]</span>
                <span className="text-xs uppercase tracking-wide text-gray-500">
                  {log.timestamp ? new Date(log.timestamp).toLocaleString() : "No timestamp"}
                </span>
              </div>
              <p className="mt-2 text-gray-600">{log.action}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* All System Activity */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-primary">All System Activity</h2>
            <p className="text-sm text-gray-600">Full activity feed for the SACCO system.</p>
          </div>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-600">
            {activityLogs.length} entries
          </span>
        </div>

        {activityLoading ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-gray-500">
            Loading activity feed...
          </div>
        ) : activityError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
            {activityError}
          </div>
        ) : activityLogs.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center text-gray-600">
            No activity found yet.
          </div>
        ) : (
          <ul className="space-y-3">
            {activityLogs.map((log: AuditLog, i: number) => (
              <li key={i} className="rounded-3xl border border-gray-100 bg-gray-50 p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-gray-700">{log.action}</span>
                  <span className="text-xs uppercase tracking-wide text-gray-500">
                    {log.timestamp ? new Date(log.timestamp).toLocaleString() : "No timestamp"}
                  </span>
                </div>
                <p className="mt-3 text-xs text-gray-500">Framework: {log.framework}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}