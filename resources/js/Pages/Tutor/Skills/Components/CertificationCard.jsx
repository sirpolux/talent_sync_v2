function StatusPill({ status }) {
  const value = String(status || "pending").toLowerCase();
  const map = {
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    rejected: "bg-rose-50 text-rose-700 border-rose-200",
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${map[value] || "bg-slate-50 text-slate-700 border-slate-200"}`}>
      {value}
    </span>
  );
}

export default function CertificationCard({ certification = null, showStatus = true }) {
  const issuedAt = certification?.issued_at ? new Date(certification.issued_at).toLocaleDateString() : null;
  const expiresAt = certification?.expires_at ? new Date(certification.expires_at).toLocaleDateString() : null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-900">{certification?.name ?? "Certification"}</h3>
            <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
              {certification?.specialty_name ?? certification?.specialty?.name ?? "Specialty"}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
            {certification?.issuer ? <span>Issuer: {certification.issuer}</span> : null}
            {issuedAt ? <span>Issued: {issuedAt}</span> : null}
            {expiresAt ? <span>Expires: {expiresAt}</span> : null}
          </div>

          {certification?.notes ? <p className="mt-2 text-sm text-slate-600">{certification.notes}</p> : null}
        </div>

        {showStatus && certification?.status ? <StatusPill status={certification.status} /> : null}
      </div>
    </div>
  );
}