import TutorLayout from "@/Layouts/TutorLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowLeft, BadgeCheck, HelpCircle, PlusCircle, Sparkles, TriangleAlert } from "lucide-react";
import SectionCard from "./Components/SectionCard";
import SkillCard from "./Components/SkillCard";

function normalizeSkillId(value) {
  if (!value) return "";
  return String(value);
}

export default function Create({ trainer = null, availableSkills = [], assignedSkills = [], pendingSkills = [] }) {
  const form = useForm({
    skill_id: "",
  });

  const assignedIds = new Set((assignedSkills || []).map((skill) => normalizeSkillId(skill?.id)));
  const pendingIds = new Set((pendingSkills || []).map((skill) => normalizeSkillId(skill?.id)));

  const requestableSkills = (availableSkills || []).filter((skill) => {
    if (!skill) return false;
    const id = normalizeSkillId(skill.id);
    return !assignedIds.has(id) && !pendingIds.has(id);
  });

  return (
    <TutorLayout headerTitle="Request a Skill">
      <Head title="Request a Skill" />

      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl bg-gradient-to-r from-[#1E3A8A] to-[#059669] p-6 text-white shadow-lg">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/90">
                <Sparkles className="h-4 w-4" />
                Skill request
              </div>
              <h1 className="mt-3 text-3xl font-bold">Request a New Skill</h1>
              <p className="mt-2 text-sm leading-6 text-white/80">
                Use this page to request an available skill. Existing approved and pending skills are hidden to reduce duplicates.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href={route("trainer.skills.index")}
                className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Skills
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <SectionCard
            title="Available skills"
            description="Select one skill to request."
            emptyState={
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                No requestable skills are available right now.
              </div>
            }
            action={
              <button
                type="button"
                onClick={() => form.setData("skill_id", "")}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Clear selection
              </button>
            }
          >
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                form.post(route("trainer.skills.store"), {
                  preserveScroll: true,
                  onSuccess: () => form.reset("skill_id"),
                });
              }}
            >
              <div>
                <label className="block text-sm font-medium text-slate-700">Skill</label>
                <select
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20 disabled:bg-slate-100"
                  value={form.data.skill_id}
                  onChange={(e) => form.setData("skill_id", e.target.value)}
                  required
                  disabled={!requestableSkills.length || form.processing}
                >
                  <option value="">Select a skill</option>
                  {requestableSkills.map((skill) => (
                    <option key={skill.id} value={skill.id}>
                      {skill.name}
                    </option>
                  ))}
                </select>
                {form.errors.skill_id ? <p className="mt-1 text-xs text-rose-600">{form.errors.skill_id}</p> : null}
              </div>

              <button
                type="submit"
                disabled={!requestableSkills.length || form.processing || !form.data.skill_id}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
              >
                <PlusCircle className="h-4 w-4" />
                {form.processing ? "Submitting..." : "Request Skill"}
              </button>
            </form>

            <div className="mt-5 grid gap-3">
              {requestableSkills.slice(0, 6).map((skill) => (
                <SkillCard
                  key={skill.id}
                  skill={skill}
                  actionLabel="Choose"
                  onAction={() => form.setData("skill_id", String(skill.id))}
                  processing={form.processing}
                  compact
                />
              ))}
            </div>
          </SectionCard>
          <SectionCard
            title="Helpful hints"
            description="A few things to keep in mind before submitting."
            emptyState={null}
          >
            <div className="space-y-4 text-sm text-slate-600">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 font-medium text-slate-900">
                  <HelpCircle className="h-4 w-4 text-indigo-600" />
                  What happens next?
                </div>
                <p className="mt-2 leading-6">
                  Your request will be reviewed by the organization team. Once approved, it will move into your assigned skills list.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 font-medium text-slate-900">
                  <BadgeCheck className="h-4 w-4 text-emerald-600" />
                  Before you request
                </div>
                <p className="mt-2 leading-6">
                  Choose a skill you can confidently teach. If it is already approved or awaiting review, it will not be shown here.
                </p>
              </div>

              <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50 p-4 text-amber-900">
                <div className="flex items-center gap-2 font-medium">
                  <TriangleAlert className="h-4 w-4" />
                  Availability note
                </div>
                <p className="mt-2 leading-6">
                  Skills marked as unavailable by your organization or already requested elsewhere are excluded from the selector.
                </p>
              </div>

              <div className="text-xs text-slate-500">
                Trainer: {trainer?.name ?? "Current trainer"}
              </div>
            </div>
          </SectionCard>

          
        </div>
      </div>
    </TutorLayout>
  );
}