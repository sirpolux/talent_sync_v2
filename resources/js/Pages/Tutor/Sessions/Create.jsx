import TutorLayout from "@/Layouts/TutorLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowLeft, CircleAlert, PlusCircle } from "lucide-react";

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

function normalizeSkillId(value) {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  return String(value);
}

export default function Create({
  skills = [],
  activeCapBySkill = [],
  canCreate = true,
  activeCapReached = false,
  flash = {},
  organization = null,
  trainer = null,
}) {
  const capEntries = Array.isArray(activeCapBySkill) ? activeCapBySkill : [];
  const approvedSkills = Array.isArray(skills) ? skills : [];

  const form = useForm({
    skill_id: "",
    title: "",
    description: "",
    duration_minutes: "",
    start_date: "",
    end_date: "",
    calendar_link: "",
    status: "scheduled",
    capacity: "",
    location: "",
    mode: "",
  });

  const selectedSkill = approvedSkills.find((skill) => normalizeSkillId(skill?.skill_id ?? skill?.id) === normalizeSkillId(form.data.skill_id));
  const selectedSkillActiveCount = Number(
    selectedSkill?.active_session_count ?? selectedSkill?.active_session_count ?? selectedSkill?.activeSessionsCount ?? selectedSkill?.active_sessions_count ?? 0
  );
  const selectedSkillCanCreate = selectedSkill ? selectedSkillActiveCount < 3 : false;
  const helperRoute = route("trainer.sessions.calendar", {
    skill: selectedSkill?.name ?? selectedSkill?.title ?? "",
    title: form.data.title || "",
    description: form.data.description || "",
  });
  const helperLabel = organization?.current?.name || organization?.current?.company_name || organization?.current?.organization_name || trainer?.name || "your team";

  const handleSubmit = (event) => {
    event.preventDefault();
    form.post(route("trainer.sessions.store"), {
      preserveScroll: true,
      onSuccess: () => form.reset("title", "description", "duration_minutes", "start_date", "end_date", "calendar_link", "capacity", "location", "mode", "skill_id"),
    });
  };

  const handleSkillSelect = (skillId) => {
    if (!skillId) {
      return;
    }

    form.setData("skill_id", String(skillId));
  };

  return (
    <TutorLayout headerTitle="Create Training Session">
      <Head title="Create Training Session" />

      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl bg-gradient-to-r from-[#1E3A8A] to-[#059669] p-6 text-white shadow-lg">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <Link
                href={route("trainer.sessions.index")}
                className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/90 transition hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to sessions
              </Link>
              <h1 className="mt-4 text-3xl font-bold">Create Training Session</h1>
              <p className="mt-2 text-sm leading-6 text-white/80">
                Start a new session from your approved skills. You can only create another session when the active cap for the same skill is available.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm text-white/90 backdrop-blur">
              <PlusCircle className="h-4 w-4" />
              New session setup
            </div>
          </div>
        </div>

        {flash?.error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {flash.error}
          </div>
        ) : null}

        {!canCreate || activeCapReached ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-start gap-3">
              <CircleAlert className="mt-0.5 h-5 w-5 text-amber-700" />
              <div>
                <h2 className="text-sm font-semibold text-amber-900">Creation paused for one or more skills</h2>
                <p className="mt-1 text-sm text-amber-800">
                  The active-session cap has been reached for at least one skill. Complete, close, or archive an active session before creating another one for that same skill.
                </p>
              </div>
            </div>

            {capEntries.length ? (
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {capEntries.map((entry, index) => (
                  <div key={entry.skillId ?? entry.skill_id ?? `${entry.skillName ?? "skill"}-${index}`} className="rounded-xl border border-amber-200 bg-white p-4">
                    <div className="text-sm font-medium text-slate-900">{entry.skillName ?? entry.skill_name ?? "Skill"}</div>
                    <div className="mt-1 text-sm text-slate-600">
                      Active {entry.activeCount ?? entry.active_count ?? 0} / {entry.maxActive ?? entry.max_active ?? 3}
                    </div>
                    <div className="mt-2 text-xs font-medium text-rose-700">No additional active session can be created right now.</div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Approved skills</h2>
            <p className="mt-1 text-sm text-slate-600">
              Choose from your approved skills when creating a session.
            </p>
          </div>
          <div className="p-5">
            {approvedSkills.length ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {approvedSkills.map((skill) => {
                  const activeCount =
                    skill?.active_session_count ??
                    skill?.activeSessionCount ??
                    skill?.activeSessionsCount ??
                    skill?.active_sessions_count ??
                    0;
                  const canUseSkill = Number(activeCount) < 3;
                  const isSelected = normalizeSkillId(form.data.skill_id) === normalizeSkillId(skill?.skill_id ?? skill?.id);

                  return (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => handleSkillSelect(skill?.skill_id ?? skill?.id)}
                      className={`w-full rounded-2xl border p-4 text-left transition ${
                        isSelected ? "border-[#1E3A8A] bg-[#EFF6FF] shadow-sm" : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
                      } ${canUseSkill ? "" : "opacity-60"}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{skill.name ?? "Skill"}</div>
                          <div className="mt-1 text-xs text-slate-500">
                            Approved {formatDate(skill?.approved_at ?? skill?.created_at)}
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                            canUseSkill ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {activeCount}/3 active
                        </span>
                      </div>

                      {skill?.description ? <p className="mt-3 text-sm text-slate-600">{skill.description}</p> : null}

                      <div className="mt-4 text-xs font-medium text-slate-500">
                        {canUseSkill ? "Click to select this skill" : "Creation blocked for this skill"}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                No approved skills available for session creation.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Session details</h2>
            <p className="mt-1 text-sm text-slate-600">
              {selectedSkill ? `Selected: ${selectedSkill.name ?? "Skill"}` : "Select an approved skill above to continue."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 p-5">
            <input type="hidden" name="skill_id" value={form.data.skill_id} />

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Title</label>
                <input
                  type="text"
                  value={form.data.title}
                  onChange={(event) => form.setData("title", event.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#1E3A8A]"
                  placeholder="Session title"
                />
                {form.errors.title ? <p className="mt-1 text-xs text-rose-600">{form.errors.title}</p> : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Duration (minutes)</label>
                <input
                  type="number"
                  value={form.data.duration_minutes}
                  onChange={(event) => form.setData("duration_minutes", event.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#1E3A8A]"
                  placeholder="60"
                  min="1"
                />
                {form.errors.duration_minutes ? <p className="mt-1 text-xs text-rose-600">{form.errors.duration_minutes}</p> : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Start date</label>
                <input
                  type="date"
                  value={form.data.start_date}
                  onChange={(event) => form.setData("start_date", event.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#1E3A8A]"
                />
                {form.errors.start_date ? <p className="mt-1 text-xs text-rose-600">{form.errors.start_date}</p> : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">End date</label>
                <input
                  type="date"
                  value={form.data.end_date}
                  onChange={(event) => form.setData("end_date", event.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#1E3A8A]"
                />
                {form.errors.end_date ? <p className="mt-1 text-xs text-rose-600">{form.errors.end_date}</p> : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
                <select
                  value={form.data.status}
                  onChange={(event) => form.setData("status", event.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#1E3A8A]"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                {form.errors.status ? <p className="mt-1 text-xs text-rose-600">{form.errors.status}</p> : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Capacity</label>
                <input
                  type="number"
                  value={form.data.capacity}
                  onChange={(event) => form.setData("capacity", event.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#1E3A8A]"
                  placeholder="30"
                  min="1"
                />
                {form.errors.capacity ? <p className="mt-1 text-xs text-rose-600">{form.errors.capacity}</p> : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Mode</label>
                <select
                  value={form.data.mode}
                  onChange={(event) => form.setData("mode", event.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#1E3A8A]"
                >
                  <option value="">Select a mode</option>
                  <option value="In-person">In-person</option>
                  <option value="Online">Online</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
                {form.errors.mode ? <p className="mt-1 text-xs text-rose-600">{form.errors.mode}</p> : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Calendar link</label>
                <input
                  type="url"
                  value={form.data.calendar_link}
                  onChange={(event) => form.setData("calendar_link", event.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#1E3A8A]"
                  placeholder="https://meet.google.com/..."
                />
                <p className="mt-1 text-xs text-slate-500">
                  Need a calendar schedule?{" "}
                  <Link
                    href={helperRoute}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[#1E3A8A] transition hover:text-[#172554]"
                  >
                    Create a Google Calendar schedule for {helperLabel}
                  </Link>{" "}
                  and then paste or update the link here.
                </p>
                {form.errors.calendar_link ? <p className="mt-1 text-xs text-rose-600">{form.errors.calendar_link}</p> : null}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
              <textarea
                value={form.data.description}
                onChange={(event) => form.setData("description", event.target.value)}
                className="min-h-[140px] w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#1E3A8A]"
                placeholder="Describe the session goals, audience, and expectations."
              />
              {form.errors.description ? <p className="mt-1 text-xs text-rose-600">{form.errors.description}</p> : null}
            </div>

            <div className="flex items-center justify-end gap-3">
              <Link
                href={route("trainer.sessions.index")}
                className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={form.processing || !selectedSkill || !selectedSkillCanCreate}
                className="inline-flex items-center gap-2 rounded-full bg-[#1E3A8A] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#172554] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {form.processing ? "Creating..." : "Create session"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </TutorLayout>
  );
}