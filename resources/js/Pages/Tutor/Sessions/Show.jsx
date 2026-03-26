import TutorLayout from "@/Layouts/TutorLayout";
import { Head, Link } from "@inertiajs/react";
import { ArrowLeft, CalendarDays, CircleCheckBig, CircleDot, Clock3, Users, UploadCloud, FileText } from "lucide-react";

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
    running: "bg-emerald-50 text-emerald-700 border-emerald-200",
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

function DetailRow({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-medium text-slate-900">{value ?? "—"}</div>
    </div>
  );
}

function PersonCard({ item, roleLabel }) {
  const name = item?.name ?? item?.user?.name ?? item?.participant?.name ?? "Participant";
  const email = item?.email ?? item?.user?.email ?? item?.participant?.email ?? null;
  const status = item?.status ?? item?.progress_status ?? item?.pivot?.status ?? null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-900">{name}</div>
          {email ? <div className="mt-1 text-sm text-slate-500">{email}</div> : null}
          {roleLabel ? <div className="mt-2 text-xs font-medium text-slate-500">{roleLabel}</div> : null}
        </div>
        {status ? <StatusPill status={status} /> : null}
      </div>
    </div>
  );
}

function UploadCard({ upload }) {
  const fileName = upload?.name ?? upload?.file_name ?? upload?.original_name ?? upload?.title ?? "Assessment upload";
  const url = upload?.url ?? upload?.file_url ?? upload?.path ?? null;
  const uploadedAt = formatDateTime(upload?.created_at ?? upload?.uploaded_at);
  const participantName = upload?.participant?.name ?? upload?.user?.name ?? upload?.organization_user?.name ?? null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <UploadCloud className="h-4 w-4 text-slate-500" />
            {url ? (
              <a href={url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-slate-900 hover:underline">
                {fileName}
              </a>
            ) : (
              <div className="text-sm font-semibold text-slate-900">{fileName}</div>
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
            {participantName ? <span>Participant: {participantName}</span> : null}
            {uploadedAt ? <span>Uploaded: {uploadedAt}</span> : null}
            {upload?.status ? <span>Status: {String(upload.status)}</span> : null}
          </div>
          {upload?.notes ? <p className="mt-2 text-sm text-slate-600">{upload.notes}</p> : null}
        </div>
        {upload?.review_status ? <StatusPill status={upload.review_status} /> : null}
      </div>
    </div>
  );
}

export default function Show({ session = null }) {
  const participants = Array.isArray(session?.participants) ? session.participants : [];
  const progress = Array.isArray(session?.progress) ? session.progress : [];
  const uploads = Array.isArray(session?.assessment_uploads) ? session.assessment_uploads : [];

  return (
    <TutorLayout headerTitle="Training Sessions">
      <Head title={session?.title ?? "Training Session"} />

      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl bg-gradient-to-r from-[#1E3A8A] to-[#059669] p-6 text-white shadow-lg">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-4xl">
              <Link
                href={route("trainer.sessions.index")}
                className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/90 transition hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to sessions
              </Link>
              <h1 className="mt-4 text-3xl font-bold">{session?.title ?? session?.name ?? "Training Session"}</h1>
              <p className="mt-2 text-sm leading-6 text-white/80">
                Review session details, participants, progress updates, and assessment uploads in one place.
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
          <DetailRow label="Skill" value={session?.skill?.name ?? session?.skill_name} />
          <DetailRow label="Organization" value={session?.organization?.name ?? session?.organization_name} />
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
                  {session?.description ?? session?.overview ?? "No session description was provided for this session."}
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                      <Users className="h-4 w-4" />
                      Participants
                    </div>
                    <div className="mt-1 text-2xl font-semibold text-slate-900">{participants.length}</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                      <CircleDot className="h-4 w-4" />
                      Progress
                    </div>
                    <div className="mt-1 text-2xl font-semibold text-slate-900">{progress.length}</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                      <CircleCheckBig className="h-4 w-4" />
                      Uploads
                    </div>
                    <div className="mt-1 text-2xl font-semibold text-slate-900">{uploads.length}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-lg font-semibold text-slate-900">Participants</h2>
              </div>
              <div className="p-5">
                {participants.length ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {participants.map((participant, index) => (
                      <PersonCard key={participant?.id ?? index} item={participant} roleLabel="Participant" />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                    No participants have been added to this session.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-lg font-semibold text-slate-900">Progress updates</h2>
              </div>
              <div className="p-5">
                {progress.length ? (
                  <div className="space-y-3">
                    {progress.map((item, index) => (
                      <div key={item?.id ?? index} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="text-sm font-semibold text-slate-900">{item?.title ?? item?.name ?? `Progress item ${index + 1}`}</div>
                            <div className="mt-1 text-xs text-slate-500">
                              {item?.participant?.name ?? item?.user?.name ?? "Participant"}
                              {item?.created_at ? ` · ${formatDateTime(item.created_at)}` : ""}
                            </div>
                          </div>
                          {item?.status ? <StatusPill status={item.status} /> : null}
                        </div>
                        {item?.notes ? <p className="mt-3 text-sm text-slate-600">{item.notes}</p> : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                    No progress records are available for this session.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-lg font-semibold text-slate-900">Assessment uploads</h2>
              </div>
              <div className="p-5">
                {uploads.length ? (
                  <div className="space-y-3">
                    {uploads.map((upload, index) => (
                      <UploadCard key={upload?.id ?? index} upload={upload} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                    No assessment uploads are available for this session.
                  </div>
                )}
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
                <DetailRow label="Status" value={session?.status} />
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
        </div>
      </div>
    </TutorLayout>
  );
}