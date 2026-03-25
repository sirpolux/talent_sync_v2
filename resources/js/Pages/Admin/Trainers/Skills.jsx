import React, { useMemo } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import Breadcrumbs from "@/Components/Breadcrumbs";
import { Head, Link, useForm, usePage } from "@inertiajs/react";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function StatCard({ title, value, hint }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{title}</div>
      <div className="mt-2 text-3xl font-semibold text-slate-900">{value ?? 0}</div>
      {hint ? <div className="mt-1 text-sm text-slate-500">{hint}</div> : null}
    </div>
  );
}

function FlashMessage() {
  const { flash } = usePage().props;

  if (!flash?.success && !flash?.error) return null;

  const isSuccess = !!flash?.success;
  const message = flash?.success ?? flash?.error;

  return (
    <div
      className={classNames(
        "rounded-lg border px-4 py-3 text-sm shadow-sm",
        isSuccess
          ? "border-emerald-200 bg-emerald-50 text-emerald-900"
          : "border-rose-200 bg-rose-50 text-rose-900"
      )}
    >
      {message}
    </div>
  );
}

function SkillBadge({ skill }) {
  return (
    <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
      {skill?.name ?? "Skill"}
    </div>
  );
}

function AssignedSkillCard({ skill }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-900">{skill?.name ?? "Skill"}</h3>
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
              Assigned
            </span>
          </div>

          {skill?.description ? (
            <p className="mt-2 text-sm leading-6 text-slate-600">{skill.description}</p>
          ) : null}

          <div className="mt-3 flex flex-wrap gap-2">
            <SkillBadge skill={skill} />
            {skill?.organization_id ? (
              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                Org
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                Global
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Skills({ trainer, assignedSkills = [], availableSkills = [] , excludedDegreeCount = 0}) {
  const assignForm = useForm({
    skill_id: "",
  });

  const assignedSkillIds = useMemo(() => {
    return new Set(
      (assignedSkills || [])
        .map((skill) => Number(skill?.skill_id ?? skill?.id))
        .filter((id) => Number.isFinite(id))
    );
  }, [assignedSkills]);

  const assignableSkills = useMemo(() => {
    return (availableSkills || []).filter((skill) => {
      if (!skill) return false;
      if (skill.type === "degree") return false;
      return !assignedSkillIds.has(Number(skill.id));
    });
  }, [availableSkills, assignedSkillIds]);

  const assignedCount = assignedSkills?.length ?? 0;

  return (
    <AdminLayout>
      <Head title={`Trainer Skills${trainer?.name ? `: ${trainer.name}` : ""}`} />

      <div className="mb-6">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "admin.dashboard" },
            { label: "Trainers", href: "admin.trainers.index" },
            { label: trainer?.name ?? "Trainer", href: "admin.trainers.show", params: trainer?.id },
            { label: "Skills" },
          ]}
        />

        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Trainer Skills</h1>
            <p className="mt-1 text-sm text-slate-600">
              Assign non-degree skills to {trainer?.name ?? "this trainer"}.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={route("admin.trainers.show", trainer?.id)}
              className="inline-flex items-center rounded-md border bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              View Trainer
            </Link>
            <Link
              href={route("admin.trainers.index")}
              className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-black"
            >
              Back
            </Link>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <FlashMessage />

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard 
            title="Assigned Skills" 
            value={assignedCount} 
            hint="Already linked to this trainer" />
          <StatCard
            title="Assignable Skills"
            value={assignableSkills.length}
            hint="Active skills available for assignment"
          />
          <StatCard
            title="Excluded Degrees"
            value={excludedDegreeCount}
            hint="Not shown in the assignment list"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Assigned Skills</h2>
                <p className="text-sm text-slate-600">Skills currently linked to this trainer profile.</p>
              </div>
              <div className="text-sm text-slate-500">{assignedCount} total</div>
            </div>

            <div className="mt-4 grid gap-3">
              {assignedSkills.length ? (
                assignedSkills.map((skill) => <AssignedSkillCard key={skill.id ?? skill.skill_id} skill={skill} />)
              ) : (
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                  No skills assigned yet.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm max-h-[400px] overflow-y-auto"> 
            <h2 className="text-lg font-semibold text-slate-900">Assign a Skill</h2>
            <p className="mt-1 text-sm text-slate-600">
              Choose an active skill from the current organization or global skills. Degree skills are excluded.
            </p>

            <form
              className="mt-4 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();

                assignForm.post(route("admin.trainers.skills.store", trainer?.id), {
                  preserveScroll: true,
                  onSuccess: () => {
                    assignForm.reset("skill_id");
                  },
                });
              }}
            >
              <div>
                <label className="block text-sm font-medium text-slate-700">Skill</label>
                <select
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20 disabled:bg-slate-100"
                  value={assignForm.data.skill_id}
                  onChange={(e) => assignForm.setData("skill_id", e.target.value)}
                  required
                  disabled={!assignableSkills.length || assignForm.processing}
                >
                  <option value="">Select a skill</option>
                  {assignableSkills.map((skill) => (
                    <option key={skill.id} value={skill.id}>
                      {skill.name}
                    </option>
                  ))}
                </select>

                {assignForm.errors.skill_id ? (
                  <p className="mt-1 text-xs text-rose-600">{assignForm.errors.skill_id}</p>
                ) : null}
                {assignForm.errors.trainer_id ? (
                  <p className="mt-1 text-xs text-rose-600">{assignForm.errors.trainer_id}</p>
                ) : null}
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
                Already assigned skills are hidden from the list to prevent duplicates.
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="submit"
                  disabled={assignForm.processing || !assignForm.data.skill_id || !assignableSkills.length}
                  className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {assignForm.processing ? "Assigning..." : "Assign Skill"}
                </button>
              </div>

              {!assignableSkills.length ? (
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                  No assignable skills available.
                </div>
              ) : null}
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}