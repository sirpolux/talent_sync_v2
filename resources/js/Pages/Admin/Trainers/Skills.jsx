import React from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import Breadcrumbs from "@/Components/Breadcrumbs";
import { Head, Link } from "@inertiajs/react";

function StatCard({ title, value, hint }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{title}</div>
      <div className="mt-1 text-2xl font-semibold text-slate-900">{value ?? 0}</div>
      {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
    </div>
  );
}

function SkillItem({ skill }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-medium text-slate-900">{skill?.name ?? "Skill"}</div>
          <div className="mt-1 text-sm text-slate-600">{skill?.source ?? "Approval workflow pending"}</div>
        </div>
        <span
          className={
            "inline-flex rounded-full px-2 py-1 text-xs font-medium " +
            (skill?.approved
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700")
          }
        >
          {skill?.approved ? "Approved" : "Pending"}
        </span>
      </div>
    </div>
  );
}

export default function Skills({ trainer, skills = [] }) {
  return (
    <AdminLayout>
      <Head title={`Trainer Skills: ${trainer?.name ?? ""}`} />

      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "admin.dashboard" },
            { label: "Trainers", href: "admin.trainers.index" },
            { label: trainer?.name ?? "Trainer" },
            { label: "Skills" },
          ]}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Skills</h1>
            <p className="text-sm text-slate-600">Manage training skills for {trainer?.name ?? "this trainer"}.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={route("admin.trainers.show", trainer.id)}
              className="inline-flex items-center rounded-md border bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              View Trainer
            </Link>
            <Link
              href={route("admin.trainers.index")}
              className="inline-flex items-center rounded-md bg-[#1E3A8A] px-4 py-2 text-sm font-medium text-white hover:bg-[#1E3A8A]/90"
            >
              Back
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Assigned Skills" value={skills.length} hint="Linked to this trainer" />
          <StatCard
            title="Pending Approval"
            value={skills.filter((skill) => !skill.approved).length}
            hint="Tutor-added skills"
          />
          <StatCard
            title="Approved"
            value={skills.filter((skill) => skill.approved).length}
            hint="Admin-approved skills"
          />
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-slate-900">Assigned Skills</h2>
            <button
              type="button"
              className="inline-flex items-center rounded-md bg-[#1E3A8A] px-4 py-2 text-sm font-medium text-white hover:bg-[#1E3A8A]/90"
            >
              Add Skill
            </button>
          </div>

          <div className="mt-4 grid gap-3">
            {skills.length ? (
              skills.map((skill) => <SkillItem key={skill.id} skill={skill} />)
            ) : (
              <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                No skills assigned yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
