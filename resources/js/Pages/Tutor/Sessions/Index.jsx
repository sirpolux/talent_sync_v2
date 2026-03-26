import TutorLayout from "@/Layouts/TutorLayout";
import { Head, Link } from "@inertiajs/react";
import { CalendarDays, CircleCheckBig, CircleDot, Clock3, PlusCircle, ArrowRight, Users, Layers3 } from "lucide-react";

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

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
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    scheduled: "bg-indigo-50 text-indigo-700 border-indigo-200",
    draft: "bg-slate-50 text-slate-700 border-slate-200",
    completed: "bg-blue-50 text-blue-700 border-blue-200",
    cancelled: "bg-rose-50 text-rose-700 border-rose-200",
    paused: "bg-amber-50 text-amber-700 border-amber-200",
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

function SessionCard({ session }) {
  const skillName = session?.skill?.name ?? session?.skill_name ?? "Skill";
  const organizationName =
    session?.organization?.name ?? session?.organization_name ?? "Organization";
  const participantCount = session?.participants_count ?? session?.participants?.length ?? 0;
  const progressCount = session?.progress_count ?? session?.progress?.length ?? 0;
  const uploadCount = session?.assessment_uploads_count ?? session?.assessment_uploads?.length ?? 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-slate-900">{session?.title ?? session?.name ?? "Training Session"}</h3>
            <StatusPill status={session?.status} />
          </div>

          <div className="flex flex-wrap gap-2 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1">
              <Layers3 className="h-4 w-4" />
              {skillName}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1">
              <CalendarDays className="h-4 w-4" />
              {formatDate(session?.start_date ?? session?.starts_at)}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1">
              <Clock3 className="h-4 w-4" />
              {formatDate(session?.end_date ?? session?.ends_at)}
            </span>
          </div>

          <p className="max-w-3xl text-sm leading-6 text-slate-600">
            {session?.description ?? session?.overview ?? "No session description provided."}
          </p>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                <Users className="h-4 w-4" />
                Participants
              </div>
              <div className="mt-1 text-lg font-semibold text-slate-900">{participantCount}</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                <CircleDot className="h-4 w-4" />
                Progress items
              </div>
              <div className="mt-1 text-lg font-semibold text-slate-900">{progressCount}</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                <CircleCheckBig className="h-4 w-4" />
                Uploads
              </div>
              <div className="mt-1 text-lg font-semibold text-slate-900">{uploadCount}</div>
            </div>
          </div>

          <div className="text-sm text-slate-500">
            <span className="font-medium text-slate-700">{organizationName}</span>
            {session?.created_at ? (
              <>
                {" "}
                · Created {formatDateTime(session.created_at)}
              </>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3 lg:flex-col lg:items-stretch">
          <Link
            href={route("trainer.sessions.show", session.id)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-black"
          >
            View more
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Index({ sessions = {}, filters = {}, activeCapBySkill = [], canCreate = true, flash = {} }) {
  const items = sessions?.data ?? [];
  const meta = sessions?.meta ?? {};
  const links = sessions?.links ?? [];
  const capEntries = Array.isArray(activeCapBySkill) ? activeCapBySkill : [];

  return (
    <TutorLayout headerTitle="Training Sessions">
      <Head title="Training Sessions" />

      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl bg-gradient-to-r from-[#1E3A8A] to-[#059669] p-6 text-white shadow-lg">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/90">
                <CalendarDays className="h-4 w-4" />
                Trainer sessions
              </div>
              <h1 className="mt-3 text-3xl font-bold">Training Sessions</h1>
              <p className="mt-2 text-sm leading-6 text-white/80">
                Review scheduled sessions, open full details, and create new sessions when the active cap allows it.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                href={route("trainer.sessions.create")}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-sm transition ${
                  canCreate ? "bg-white text-[#1E3A8A] hover:bg-slate-100" : "cursor-not-allowed bg-white/30 text-white/70"
                }`}
                aria-disabled={!canCreate}
              >
                <PlusCircle className="h-4 w-4" />
                Create session
              </Link>
              {!canCreate ? (
                <div className="rounded-xl bg-amber-400/15 px-4 py-3 text-sm text-amber-50 ring-1 ring-amber-300/30">
                  The active-session cap per skill has been reached. Close or complete an active session before creating another one for the same skill.
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {flash?.success ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {flash.success}
          </div>
        ) : null}

        {capEntries.length ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <h2 className="text-sm font-semibold text-amber-900">Active session cap by skill</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {capEntries.map((entry, index) => (
                <div key={entry.skillId ?? entry.skill_id ?? `${entry.skillName ?? "skill"}-${index}`} className="rounded-xl border border-amber-200 bg-white p-4">
                  <div className="text-sm font-medium text-slate-900">{entry.skillName ?? entry.skill_name ?? "Skill"}</div>
                  <div className="mt-1 text-sm text-slate-600">
                    Active {entry.activeCount ?? entry.active_count ?? 0} / {entry.maxActive ?? entry.max_active ?? 3}
                  </div>
                  {Number(entry.activeCount ?? entry.active_count ?? 0) >= Number(entry.maxActive ?? entry.max_active ?? 3) ? (
                    <div className="mt-2 text-xs font-medium text-rose-700">Cap reached</div>
                  ) : (
                    <div className="mt-2 text-xs font-medium text-emerald-700">Creation allowed</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Sessions</h2>
            <p className="mt-1 text-sm text-slate-600">
              {meta?.total ?? items.length} session{(meta?.total ?? items.length) === 1 ? "" : "s"} available
            </p>
          </div>

          <div className="p-5">
            <div className="space-y-4">
              {items.length ? (
                items.map((session) => <SessionCard key={session.id} session={session} />)
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
                  No training sessions found.
                </div>
              )}
            </div>

            {links.length > 3 ? (
              <div className="mt-6 flex flex-wrap gap-2">
                {links.map((link, index) =>
                  link.url ? (
                    <Link
                      key={`${link.label}-${index}`}
                      href={link.url}
                      className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                        link.active
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                      dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                  ) : (
                    <span
                      key={`${link.label}-${index}`}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-400"
                      dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                  )
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </TutorLayout>
  );
}