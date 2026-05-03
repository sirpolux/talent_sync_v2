import StaffLayout from "@/Layouts/StaffLayout";
import { Head, Link } from "@inertiajs/react";
import { ArrowLeft, CalendarDays, Clock3, FileText, MapPin, ShieldCheck, UserCheck } from "lucide-react";

function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function StatusPill({ status }) {
  const value = String(status || "draft").toLowerCase();
  const map = {
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    scheduled: "bg-indigo-50 text-indigo-700 border-indigo-200",
    draft: "bg-slate-50 text-slate-700 border-slate-200",
    completed: "bg-blue-50 text-blue-700 border-blue-200",
    cancelled: "bg-rose-50 text-rose-700 border-rose-200",
    paused: "bg-amber-50 text-amber-700 border-amber-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rejected: "bg-rose-50 text-rose-700 border-rose-200",
    waitlisted: "bg-orange-50 text-orange-700 border-orange-200",
    withdrawn: "bg-slate-50 text-slate-700 border-slate-200",
    no_show: "bg-slate-50 text-slate-700 border-slate-200",
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

function DetailRow({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-medium text-slate-900">{value ?? "—"}</div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
        {Icon ? <Icon className="h-4 w-4" /> : null}
        {label}
      </div>
      <div className="mt-2 text-sm font-semibold text-slate-900">{value ?? "—"}</div>
    </div>
  );
}

export default function Show({ trainer = null, session = null, participant = null, flash = {} }) {
  const hasApplied = Boolean(participant);
  const canApply = Boolean(session?.can_apply);
  const canWithdraw = Boolean(session?.can_withdraw);
  const registrationStatus = participant?.status ?? session?.registration_status ?? session?.participant_status ?? null;

  const actionHref = hasApplied
    ? route("staff.training.sessions.withdraw", session.id)
    : route("staff.training.sessions.apply", session.id);

  return (
    <StaffLayout headerTitle="Training Sessions" openedMenu="training">
      <Head title={session?.title ?? "Training Session"} />

      <div className="mx-auto max-w-6xl space-y-6">
        {flash?.success ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{flash.success}</div> : null}
        {flash?.error ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{flash.error}</div> : null}
        {flash?.status ? <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">{flash.status}</div> : null}

        <div className="rounded-3xl bg-gradient-to-r from-[#1E3A8A] to-[#059669] p-6 text-white shadow-lg">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-4xl">
              <Link href={route("staff.training.sessions.index")} className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/90 transition hover:bg-white/20">
                <ArrowLeft className="h-4 w-4" />
                Back to sessions
              </Link>
              <h1 className="mt-4 text-3xl font-bold">{session?.title ?? "Training Session"}</h1>
              <p className="mt-2 text-sm leading-6 text-white/80">
                View your session details and registration status.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 text-sm text-white/90 backdrop-blur">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                <span>{formatDateTime(session?.created_at)}</span>
              </div>
              <div className="mt-2">
                <StatusPill status={session?.status} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          <DetailRow label="Skill" value={session?.skill?.name ?? "—"} />
          <DetailRow label="Organization" value={session?.organization?.name ?? "—"} />
          <DetailRow label="Start date" value={formatDateTime(session?.start_date ?? session?.starts_at)} />
          <DetailRow label="End date" value={formatDateTime(session?.end_date ?? session?.ends_at)} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-lg font-semibold text-slate-900">Session overview</h2>
              </div>
              <div className="p-5">
                <p className="text-sm leading-7 text-slate-600">
                  {session?.description ?? "No session description was provided for this session."}
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <InfoItem icon={UserCheck} label="Your registration" value={registrationStatus ?? (hasApplied ? "applied" : "not applied")} />
                  <InfoItem icon={Clock3} label="Duration" value={session?.duration_minutes ? `${session.duration_minutes} minutes` : "—"} />
                  <InfoItem icon={MapPin} label="Mode / Location" value={[session?.mode, session?.location].filter(Boolean).join(" · ") || "—"} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-lg font-semibold text-slate-900">Your application</h2>
              </div>
              <div className="p-5">
                {hasApplied ? (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusPill status={registrationStatus} />
                      <span className="text-sm text-slate-600">Your registration is currently {registrationStatus ?? "submitted"}.</span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <DetailRow label="Applied on" value={formatDateTime(participant?.created_at)} />
                      <DetailRow label="Reviewed on" value={formatDateTime(participant?.reviewed_at)} />
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4 text-sm leading-7 text-slate-600">
                      {participant?.review_notes ?? "No review notes have been provided yet."}
                    </div>

                    {canWithdraw ? (
                      <Link
                        href={actionHref}
                        method="post"
                        as="button"
                        className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-black"
                        preserveScroll
                      >
                        Withdraw application
                      </Link>
                    ) : null}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                      You have not applied for this session yet.
                    </div>

                    {canApply ? (
                      <Link
                        href={actionHref}
                        method="post"
                        as="button"
                        className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-black"
                        preserveScroll
                      >
                        Apply for session
                      </Link>
                    ) : (
                      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        Registration is not available for this session status.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-lg font-semibold text-slate-900">Notes</h2>
              </div>
              <div className="p-5">
                <div className="rounded-xl bg-slate-50 p-4 text-sm leading-7 text-slate-600">
                  {session?.notes ?? session?.remarks ?? "No additional notes were provided."}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-lg font-semibold text-slate-900">Session details</h2>
              </div>
              <div className="space-y-3 p-5">
                <DetailRow label="Session ID" value={session?.id} />
                <DetailRow label="Created" value={formatDateTime(session?.created_at)} />
                <DetailRow label="Updated" value={formatDateTime(session?.updated_at)} />
                <DetailRow label="Capacity" value={session?.capacity ?? "—"} />
                <DetailRow label="Trainer" value={trainer?.name ?? trainer?.email ?? "—"} />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-lg font-semibold text-slate-900">Registration summary</h2>
              </div>
              <div className="space-y-3 p-5">
                <DetailRow label="Has applied" value={hasApplied ? "Yes" : "No"} />
                <DetailRow label="Can apply" value={canApply ? "Yes" : "No"} />
                <DetailRow label="Can withdraw" value={canWithdraw ? "Yes" : "No"} />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-lg font-semibold text-slate-900">What you can do</h2>
              </div>
              <div className="p-5 text-sm leading-7 text-slate-600">
                <ul className="list-disc space-y-2 pl-5">
                  <li>Review the session details and schedule.</li>
                  <li>Check whether you have already applied.</li>
                  <li>Apply if the session is scheduled and open.</li>
                  <li>Withdraw your application while it is still actionable.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
