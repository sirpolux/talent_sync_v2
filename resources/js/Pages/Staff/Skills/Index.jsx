import StaffLayout from "@/Layouts/StaffLayout";
import Breadcrumbs from "@/Components/Breadcrumbs";
import { Head, Link, useForm } from "@inertiajs/react";
import PlaceholderPage from "@/Pages/Staff/_shared/PlaceholderPage";
import { useEffect, useMemo } from "react";

export default function Index({
  allocations = [],
  availableSkills = [],
  gradingSystems = [],
  gradesBySystem = {},
  skillRules = {},
}) {
  const addForm = useForm({
    skill_id: "",
    grading_system_id: "",
    grade_id: "",
  });

  const hasData = allocations.length > 0 || availableSkills.length > 0;

  const rows = useMemo(() => allocations ?? [], [allocations]);

  const selectedSkillId = useMemo(() => {
    const v = addForm.data.skill_id;
    if (!v) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }, [addForm.data.skill_id]);

  const selectedRule = useMemo(() => {
    if (!selectedSkillId) return null;
    return skillRules?.[selectedSkillId] ?? null;
  }, [selectedSkillId, skillRules]);

  const isGradingSystemLocked = !!selectedRule?.locked_grading_system;

  useEffect(() => {
    if (!selectedSkillId) return;

    if (selectedRule?.locked_grading_system) {
      addForm.setData((data) => ({
        ...data,
        grading_system_id: selectedRule.grading_system_id ?? "",
        grade_id: data.grade_id || selectedRule.recommended_grade_id || "",
      }));
      return;
    }

    addForm.setData((data) => ({
      ...data,
      grading_system_id: data.grading_system_id ?? "",
      grade_id: "",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSkillId, selectedRule?.locked_grading_system]);

  useEffect(() => {
    if (isGradingSystemLocked) return;
    addForm.setData((data) => ({ ...data, grade_id: "" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addForm.data.grading_system_id]);

  const availableGrades = useMemo(() => {
    const gsId = Number(addForm.data.grading_system_id);
    if (!Number.isFinite(gsId)) return [];
    return gradesBySystem?.[gsId] ?? [];
  }, [addForm.data.grading_system_id, gradesBySystem]);

  if (!hasData) {
    return (
      <StaffLayout headerTitle="Skills & Certifications">
        <Head title="My Skills" />
        <div className="space-y-4">
          <Breadcrumbs items={[{ label: "Dashboard", href: "staff.dashboard" }, { label: "Skills" }]} />
          <PlaceholderPage
            title="My Skills & Certifications"
            description="Your proficiencies and uploaded certifications will appear here."
          />
        </div>
      </StaffLayout>
    );
  }

  return (
    <StaffLayout headerTitle="Skills & Certifications">
      <Head title="My Skills" />

      <div className="space-y-6">
        <Breadcrumbs items={[{ label: "Dashboard", href: "staff.dashboard" }, { label: "Skills" }]} />

        <div className="rounded-lg border bg-white p-5">
          <h1 className="text-lg font-semibold">My Skills & Certifications</h1>
          <p className="text-sm text-gray-600">
            Add a skill and upload supporting documents for verification.
          </p>

          <form
            className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4 md:items-end"
            onSubmit={(e) => {
              e.preventDefault();
              addForm.post(route("staff.skills.store"), {
                preserveScroll: true,
              });
            }}
          >
            <div className="md:col-span-2">
              <label className="block text-sm font-medium">Skill</label>
              <select
                className="mt-1 w-full rounded-md border px-3 py-2"
                value={addForm.data.skill_id}
                onChange={(e) => addForm.setData("skill_id", e.target.value)}
                required
              >
                <option value="">Select a skill</option>
                {availableSkills.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              {addForm.errors.skill_id && (
                <div className="mt-1 text-sm text-red-600">{addForm.errors.skill_id}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium">Grading System</label>
              <select
                className="mt-1 w-full rounded-md border px-3 py-2 disabled:bg-gray-100"
                value={addForm.data.grading_system_id}
                onChange={(e) => addForm.setData("grading_system_id", e.target.value)}
                disabled={isGradingSystemLocked}
                required={!isGradingSystemLocked}
              >
                <option value="">Select grading system</option>
                {gradingSystems.map((gs) => (
                  <option key={gs.id} value={gs.id}>
                    {gs.name}
                    {gs.organization_id ? " (Org)" : " (Global)"}
                  </option>
                ))}
              </select>

              {addForm.errors.grading_system_id && (
                <div className="mt-1 text-sm text-red-600">{addForm.errors.grading_system_id}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium">Grade</label>
              <select
                className="mt-1 w-full rounded-md border px-3 py-2 disabled:bg-gray-100"
                value={addForm.data.grade_id}
                onChange={(e) => addForm.setData("grade_id", e.target.value)}
                disabled={!addForm.data.grading_system_id}
                required={!!addForm.data.grading_system_id}
              >
                <option value="">Select grade</option>
                {availableGrades.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>

              {addForm.errors.grade_id && (
                <div className="mt-1 text-sm text-red-600">{addForm.errors.grade_id}</div>
              )}
            </div>

            <div className="md:col-span-4">
              {selectedRule?.locked_grading_system ? (
                <div className="mt-1 text-xs text-gray-500">
                  Grading system locked via {selectedRule.source} mapping. Select your grade.
                </div>
              ) : selectedSkillId ? (
                <div className="mt-1 text-xs text-gray-500">
                  Manual grading selection (not mapped to position/department).
                </div>
              ) : null}
            </div>

            <div className="md:col-span-4">
              <button
                type="submit"
                disabled={addForm.processing}
                className="rounded-md bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
              >
                Add Skill
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-lg border bg-white">
          <div className="border-b px-5 py-4">
            <h2 className="text-lg font-semibold">My Skills</h2>
            <p className="text-sm text-gray-600">Open a skill to upload evidence and track verification.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-600">
                <tr>
                  <th className="px-5 py-3">Skill</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Evidence</th>
                  <th className="px-5 py-3">Created</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((a) => {
                  const latestEvidence = a.evidences?.[0] ?? null;
                  const hasEvidence = !!latestEvidence;
                  const isEvidenceVerified = latestEvidence?.verification_status === "verified";

                  return (
                    <tr key={a.id} className="align-top">
                      <td className="px-5 py-3 font-medium text-gray-900">
                        {a.skill?.name ?? "-"}
                      </td>
                      <td className="px-5 py-3">
                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                          {a.status ?? "pending"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {hasEvidence ? (
                          <span
                            className={[
                              "rounded-full px-2 py-1 text-xs font-medium",
                              isEvidenceVerified
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700",
                            ].join(" ")}
                          >
                            {isEvidenceVerified ? "Yes (Verified)" : "Yes (Pending)"}
                          </span>
                        ) : (
                          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                            No
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {a.created_at ? new Date(a.created_at).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          href={route("staff.skills.show", a.id)}
                          className="inline-flex items-center rounded-md border bg-white px-3 py-1.5 text-sm"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}

                {rows.length === 0 && (
                  <tr>
                    <td className="px-5 py-6 text-sm text-gray-600" colSpan={5}>
                      No skills added yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
