'use client';

import { useEffect, useState } from "react";

interface AdminMetrics {
  track_compliance: {
    bias_check: string;
    data_safety: string;
    privacy_assurance: string;
  };
  oasis_compliance: {
    governance: string;
    ethics: string;
    data_sovereignty: string;
  };
}

export default function AdminPage() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);

  useEffect(() => {
    fetch("http://localhost:8000/admin/metrics")
      .then((res) => res.json())
      .then(setMetrics)
      .catch(() => null);
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 py-16">
      <div className="container mx-auto px-6">
        <div className="rounded-3xl bg-white p-10 shadow-xl shadow-slate-900/10">
          <h1 className="text-4xl font-bold text-slate-900">Admin Compliance Dashboard</h1>
          <p className="mt-3 text-slate-600">
            TRACK and OASIS compliance metrics for Community SACCO.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-xl font-semibold text-slate-900">TRACK Compliance</h2>
              {metrics ? (
                <dl className="mt-5 space-y-4 text-sm text-slate-700">
                  <div>
                    <dt className="font-semibold">Bias check</dt>
                    <dd>{metrics.track_compliance.bias_check}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Data safety</dt>
                    <dd>{metrics.track_compliance.data_safety}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Privacy assurance</dt>
                    <dd>{metrics.track_compliance.privacy_assurance}</dd>
                  </div>
                </dl>
              ) : (
                <p className="mt-5 text-slate-500">Loading metrics…</p>
              )}
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-xl font-semibold text-slate-900">OASIS Compliance</h2>
              {metrics ? (
                <dl className="mt-5 space-y-4 text-sm text-slate-700">
                  <div>
                    <dt className="font-semibold">Governance</dt>
                    <dd>{metrics.oasis_compliance.governance}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Ethics</dt>
                    <dd>{metrics.oasis_compliance.ethics}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Data sovereignty</dt>
                    <dd>{metrics.oasis_compliance.data_sovereignty}</dd>
                  </div>
                </dl>
              ) : (
                <p className="mt-5 text-slate-500">Loading metrics…</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
