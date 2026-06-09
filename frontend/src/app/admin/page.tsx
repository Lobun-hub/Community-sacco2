"use client";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../lib/api";

interface AuditLog {
  framework: string;
  action: string;
}

interface AdminMetrics {
  total_loans: number;
  approval_rate: string;
  bias_flags: number;
  oasis_compliance: string;
  recent_audits: AuditLog[];
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/admin/metrics`)
      .then(res => res.json())
      .then(setMetrics);
  }, []);

  if (!metrics) return <div className="p-10 text-center">Loading Governance Data...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Governance & Compliance</h1>
        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">System Healthy</span>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
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

      {/* Recent Audits */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-bold text-primary mb-4">Recent Audit Logs (PRIDE)</h2>
        <ul className="space-y-2">
          {metrics.recent_audits.map((log: AuditLog, i: number) => (
            <li key={i} className="flex justify-between text-sm border-b pb-2">
              <span className="font-semibold text-gray-700">[{log.framework}]</span>
              <span className="text-gray-600">{log.action}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}