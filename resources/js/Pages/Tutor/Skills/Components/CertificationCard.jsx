function StatusPill({ status }) {
  const value = String(status || "pending").toLowerCase();
  const map = {
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    rejected: "bg-rose-50 text-rose-700 border-rose-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${
        map[value] || "bg-slate-50 text-slate-700 border-slate-200"
      }`}
    >
      {value}
    </span>
  );
}

function formatDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString();
}

export default function CertificationCard({ certification = null, showStatus = true }) {
  const issuedAt = formatDate(certification?.issued_at);
  const expiresAt = formatDate(certification?.expires_at);
  const attachments = Array.isArray(certification?.attachments) ? certification.attachments : [];
  const specialtyName =
    certification?.specialty?.name ?? certification?.specialty_name ?? certification?.trainer_specialty?.name ?? "Specialty";
  const skillName = certification?.specialty?.skill?.name ?? certification?.skill?.name ?? null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-900">{certification?.name ?? certification?.title ?? "Certification"}</h3>
            <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
              {specialtyName}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
            {skillName ? <span>Skill: {skillName}</span> : null}
            {certification?.issuer ? <span>Issuer: {certification.issuer}</span> : null}
            {certification?.reference_number ? <span>Ref: {certification.reference_number}</span> : null}
            {certification?.credential_id ? <span>Credential ID: {certification.credential_id}</span> : null}
            {issuedAt ? <span>Issued: {issuedAt}</span> : null}
            {expiresAt ? <span>Expires: {expiresAt}</span> : null}
          </div>

          {certification?.notes ? <p className="mt-2 text-sm text-slate-600">{certification.notes}</p> : null}

          {attachments.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {attachments.map((attachment, index) => {
                const label = attachment?.name ?? attachment?.file_name ?? attachment?.original_name ?? `Attachment ${index + 1}`;
                const url = attachment?.url ?? attachment?.file_url ?? attachment?.path ?? null;

                const chip = (
                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
                    {label}
                  </span>
                );

                return url ? (
                  <a key={attachment?.id ?? `${label}-${index}`} href={url} target="_blank" rel="noreferrer">
                    {chip}
                  </a>
                ) : (
                  <span key={attachment?.id ?? `${label}-${index}`}>{chip}</span>
                );
              })}
            </div>
          ) : null}
        </div>

        {showStatus && certification?.status ? <StatusPill status={certification.status} /> : null}
      </div>
    </div>
  );
}