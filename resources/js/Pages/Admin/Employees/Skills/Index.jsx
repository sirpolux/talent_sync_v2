import AdminLayout from "@/Layouts/AdminLayout";
import Breadcrumbs from "@/Components/Breadcrumbs";
import { Head, Link, useForm } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";

export default function Index({
  employee,
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

  // Auto-apply locked grading system + (optional) recommended grade when a mapped skill is selected
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

    // For manual skills, clear defaults (admin must pick)
    addForm.setData((data) => ({
      ...data,
      grading_system_id: data.grading_system_id ?? "",
      grade_id: "",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSkillId, selectedRule?.locked_grading_system]);

  const [filePreviews, setFilePreviews] = useState({});

  useEffect(() => {
    return () => {
      Object.values(filePreviews).forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch {
          // ignore
        }
      });
    };
  }, [filePreviews]);

  // When grading system changes manually, reset grade (but not when grading system is locked)
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

  const uploadForms = {};
  allocations.forEach((a) => {
    uploadForms[a.id] = useForm({
      document: null,
    });
  });

  const isImageUrl = (url) => {
    if (!url) return false;
    return /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(url.split("?")[0]);
  };

  const isPdfUrl = (url) => {
    if (!url) return false;
    return /\.pdf$/i.test(url.split("?")[0]);
  };

  const formatBytes = (bytes) => {
    if (!bytes && bytes !== 0) return "";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = bytes === 0 ? 0 : Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
  };

  return (
    <AdminLayout>
      <Head title="Employee Skills" />
      <div className="mb-6">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "admin.dashboard" },
            { label: "Employees", href: "admin.employees.index" },
            { label: employee?.name ?? "Employee", href: "admin.employees.show", params: employee?.id },
            { label: "Skills" },
          ]}
        />
        <div className="text-sm text-gray-500">
          {employee?.department_name ? `Dept: ${employee.department_name}` : "Dept: -"}{" "}
          •{" "}
          {employee?.position_name ? `Position: ${employee.position_name}` : "Position: -"}
        </div>


        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Employee Skills</h1>
            <div className="text-sm text-gray-600">
              {employee?.name ?? "-"} • {employee?.email ?? "-"}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={route("admin.employees.show", employee.id)}
              className="inline-flex items-center rounded-md border bg-white px-4 py-2 text-sm"
            >
              Back to Profile
            </Link>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-lg border bg-white p-5">
          <h2 className="text-lg font-semibold">Add Skill</h2>
          <p className="text-sm text-gray-600">
            If the skill is mapped to the employee's position/department, grading is locked by policy.
          </p>

          <form
            className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4 md:items-end"
            onSubmit={(e) => {
              e.preventDefault();
              addForm.post(route("admin.employees.skills.store", employee.id), {
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
                <div className="mt-1 text-sm text-red-600">
                  {addForm.errors.grading_system_id}
                </div>
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
                  Grading system locked via {selectedRule.source} mapping. Select the employee's grade.
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

        <div className="space-y-4">
          {allocations.map((a) => {
            const latestEvidence = a.evidences?.[0] ?? null;
            const uploadForm = uploadForms[a.id];

            return (
              <div key={a.id} className="rounded-lg border bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold">{a.skill?.name}</div>
                    <div className="text-sm text-gray-600">
                      Status: <span className="font-medium">{a.status ?? "pending"}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-sm font-medium">Latest Evidence</div>
                  {latestEvidence ? (
                    <div className="mt-2 rounded-lg border bg-white p-3">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="text-xs text-gray-500">Verification</div>
                          <div className="text-sm font-medium">
                            {latestEvidence.verification_status}
                          </div>

                          <a
                            href={latestEvidence.document_url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-flex items-center text-sm text-blue-700 underline"
                          >
                            View document
                          </a>
                        </div>

                        <div className="shrink-0">
                          {isImageUrl(latestEvidence.document_url) ? (
                            <img
                              src={latestEvidence.document_url}
                              alt="Evidence preview"
                              className="h-20 w-28 rounded-md border object-cover"
                            />
                          ) : isPdfUrl(latestEvidence.document_url) ? (
                            <div className="flex h-20 w-28 items-center justify-center rounded-md border bg-gray-50 text-xs font-medium text-gray-600">
                              PDF
                            </div>
                          ) : (
                            <div className="flex h-20 w-28 items-center justify-center rounded-md border bg-gray-50 text-xs font-medium text-gray-600">
                              FILE
                            </div>
                          )}
                        </div>
                      </div>

                      {latestEvidence.verification_status !== "verified" && (
                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            className="rounded-md bg-emerald-700 px-3 py-1.5 text-sm text-white"
                            onClick={() =>
                              uploadForm.patch(
                                route("admin.employees.skills.evidence.verify", [
                                  employee.id,
                                  latestEvidence.id,
                                ]),
                                { preserveScroll: true }
                              )
                            }
                          >
                            Verify
                          </button>

                          <button
                            type="button"
                            className="rounded-md bg-rose-700 px-3 py-1.5 text-sm text-white"
                            onClick={() =>
                              uploadForm.patch(
                                route("admin.employees.skills.evidence.reject", [
                                  employee.id,
                                  latestEvidence.id,
                                ]),
                                { preserveScroll: true }
                              )
                            }
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-1 text-sm text-gray-500">No document uploaded yet.</div>
                  )}
                </div>

                <form
                  className="mt-4 space-y-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    uploadForm.post(
                      route("admin.employees.skills.evidence.upload", [employee.id, a.id]),
                      {
                        preserveScroll: true,
                        forceFormData: true,
                      }
                    );
                  }}
                >
                  <div>
                    <div className="text-sm font-medium">Upload evidence (admin)</div>
                    <div className="mt-2 rounded-lg border border-dashed bg-gray-50 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <div className="text-sm text-gray-700">
                            Choose a file (image/PDF). Max 5MB.
                          </div>

                          {uploadForm.data.document ? (
                            <div className="mt-1 text-xs text-gray-500">
                              {uploadForm.data.document.name}{" "}
                              {uploadForm.data.document.size
                                ? `• ${formatBytes(uploadForm.data.document.size)}`
                                : ""}
                            </div>
                          ) : (
                            <div className="mt-1 text-xs text-gray-500">
                              No file selected yet.
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <label className="inline-flex cursor-pointer items-center rounded-md border bg-white px-3 py-2 text-sm">
                            <input
                              type="file"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0] ?? null;
                                uploadForm.setData("document", file);

                                if (!file) return;

                                setFilePreviews((prev) => {
                                  const prevUrl = prev[a.id];
                                  if (prevUrl) {
                                    try {
                                      URL.revokeObjectURL(prevUrl);
                                    } catch {
                                      // ignore
                                    }
                                  }
                                  return { ...prev, [a.id]: URL.createObjectURL(file) };
                                });
                              }}
                              required
                            />
                            Select file
                          </label>

                          {uploadForm.data.document ? (
                            <button
                              type="button"
                              className="inline-flex items-center rounded-md border bg-white px-3 py-2 text-sm"
                              onClick={() => {
                                uploadForm.setData("document", null);
                                setFilePreviews((prev) => {
                                  const next = { ...prev };
                                  const prevUrl = next[a.id];
                                  if (prevUrl) {
                                    try {
                                      URL.revokeObjectURL(prevUrl);
                                    } catch {
                                      // ignore
                                    }
                                  }
                                  delete next[a.id];
                                  return next;
                                });
                              }}
                            >
                              Clear
                            </button>
                          ) : null}
                        </div>
                      </div>

                      {filePreviews[a.id] && uploadForm.data.document ? (
                        <div className="mt-4">
                          <div className="text-xs font-medium uppercase text-gray-500">
                            Preview
                          </div>

                          {uploadForm.data.document.type?.startsWith("image/") ? (
                            <img
                              src={filePreviews[a.id]}
                              alt="Selected evidence preview"
                              className="mt-2 max-h-52 w-auto rounded-md border bg-white object-contain"
                            />
                          ) : uploadForm.data.document.type === "application/pdf" ? (
                            <a
                              href={filePreviews[a.id]}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 inline-flex items-center text-sm text-blue-700 underline"
                            >
                              Preview PDF in new tab
                            </a>
                          ) : (
                            <a
                              href={filePreviews[a.id]}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 inline-flex items-center text-sm text-blue-700 underline"
                            >
                              Preview file in new tab
                            </a>
                          )}
                        </div>
                      ) : null}
                    </div>

                    {uploadForm.errors.document && (
                      <div className="mt-2 text-sm text-red-600">{uploadForm.errors.document}</div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={uploadForm.processing || !uploadForm.data.document}
                      className="rounded-md bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
                    >
                      Upload & Verify
                    </button>
                  </div>
                </form>
              </div>
            );
          })}

          {allocations.length === 0 && (
            <div className="rounded-lg border bg-white p-5 text-sm text-gray-600">
              No skills allocated yet.
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
