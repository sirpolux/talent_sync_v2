import React, { useMemo, useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import Breadcrumbs from "@/Components/Breadcrumbs";
import { Head, Link, router, useForm } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";

function Pill({ children, variant = "gray" }) {
  const map = {
    gray: "bg-gray-100 text-gray-700",
    red: "bg-red-50 text-red-700",
    blue: "bg-blue-50 text-blue-700",
  };
  return (
    <span className={`ml-2 rounded px-2 py-0.5 text-xs ${map[variant] || map.gray}`}>
      {children}
    </span>
  );
}

export default function PositionPage({
  position,
  positionCompetencies = [],
  inheritedDepartmentCompetencies = [],
  skills = [],
  gradingSystems = [],
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    must_have: true,
    grading_system_id: "",
    grade_id: "",
    active: true,
  });

  const { data, setData, post, processing, errors, reset } = useForm({
    position_id: position?.id,
    skill_id: "",
    must_have: true,
    grading_system_id: "",
    grade_id: "",
    active: true,
  });

  const selectedGradingSystem = useMemo(() => {
    const id = Number(data.grading_system_id);
    return gradingSystems.find((g) => g.id === id) ?? null;
  }, [gradingSystems, data.grading_system_id]);

  const availableGrades = useMemo(() => {
    return selectedGradingSystem?.grades ?? [];
  }, [selectedGradingSystem]);

  const editSelectedGradingSystem = useMemo(() => {
    const id = Number(editData.grading_system_id);
    return gradingSystems.find((g) => g.id === id) ?? null;
  }, [gradingSystems, editData.grading_system_id]);

  const editAvailableGrades = useMemo(() => {
    return editSelectedGradingSystem?.grades ?? [];
  }, [editSelectedGradingSystem]);

  const assigned = useMemo(() => {
    return [...positionCompetencies].sort((a, b) => {
      if (a.active !== b.active) return a.active ? -1 : 1;
      if (a.must_have !== b.must_have) return a.must_have ? -1 : 1;
      return (a.skill?.name || "").localeCompare(b.skill?.name || "");
    });
  }, [positionCompetencies]);

  const inherited = useMemo(() => {
    return [...inheritedDepartmentCompetencies].sort((a, b) => {
      if (a.active !== b.active) return a.active ? -1 : 1;
      if (a.must_have !== b.must_have) return a.must_have ? -1 : 1;
      return (a.skill?.name || "").localeCompare(b.skill?.name || "");
    });
  }, [inheritedDepartmentCompetencies]);

  function submit(e) {
    e.preventDefault();
    post(route("admin.competencies.position.store"), {
      onSuccess: () => {
        reset("skill_id", "grading_system_id", "grade_id");
        setShowAdd(false);
      },
    });
  }

  function startEdit(c) {
    setEditingId(c.id);
    setEditData({
      must_have: !!c.must_have,
      grading_system_id: c.grading_system_id ? String(c.grading_system_id) : "",
      grade_id: c.grade_id ? String(c.grade_id) : "",
      active: !!c.active,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditData({ must_have: true, grading_system_id: "", grade_id: "", active: true });
  }

  function saveEdit(e) {
    e.preventDefault();
    router.patch(
      route("admin.competencies.position.update", editingId),
      {
        must_have: !!editData.must_have,
        grading_system_id: editData.grading_system_id ? Number(editData.grading_system_id) : null,
        grade_id: editData.grade_id ? Number(editData.grade_id) : null,
        active: !!editData.active,
      },
      {
        preserveScroll: true,
        onSuccess: () => cancelEdit(),
      }
    );
  }

  function toggleActive(c) {
    router.patch(
      route("admin.competencies.position.update", c.id),
      { active: !c.active },
      { preserveScroll: true }
    );
  }

  return (
    <AdminLayout
      headerTitle="Competencies"
      tabName="Talent"
      openedMenu="talent"
      activeSubmenu="talent.competencies"
    >
      <Head title={`Position Competencies - ${position?.name || ""}`} />

      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <Breadcrumbs
              items={[
                { label: "Admin", href: "admin.dashboard" },
                { label: "Competencies", href: "admin.competencies.index" },
                { label: "Department", href: "admin.competencies.department", params: [position?.department_id] },
                { label: position?.name || "Position" },
              ]}
            />

            <div>
              <div className="text-sm text-muted-foreground">Position</div>
              <h1 className="text-2xl font-bold text-brand-primary">{position?.name}</h1>
            </div>
          </div>

          <Button asChild variant="outline">
            <Link href={route("admin.competencies.department", position?.department_id)}>
              Back to department
            </Link>
          </Button>
        </div>

        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="flex items-center justify-between border-b px-4 py-3 bg-white">
            <h2 className="font-medium">Assigned to this position</h2>
            <Button
              type="button"
              className="bg-brand-primary text-brand-primary-foreground hover:opacity-95"
              onClick={() => setShowAdd((v) => !v)}
            >
              {showAdd ? "Close" : "Add competency"}
            </Button>
          </div>

          {showAdd ? (
            <form onSubmit={submit} className="space-y-3 border-b px-4 py-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Skill</label>
                  <select
                    className="mt-1 w-full h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
                    value={data.skill_id}
                    onChange={(e) => setData("skill_id", e.target.value)}
                  >
                    <option value="">Select skill</option>
                    {skills.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  {errors.skill_id ? (
                    <div className="mt-1 text-xs text-red-600">{errors.skill_id}</div>
                  ) : null}
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={!!data.must_have}
                      onChange={(e) => setData("must_have", e.target.checked)}
                    />
                    Required (must have)
                  </label>

                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={!!data.active}
                      onChange={(e) => setData("active", e.target.checked)}
                    />
                    Active
                  </label>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Grading system</label>
                  <select
                    className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={data.grading_system_id ?? ""}
                    onChange={(e) => {
                      setData("grading_system_id", e.target.value);
                      setData("grade_id", "");
                    }}
                  >
                    <option value="">Select grading system...</option>
                    {gradingSystems.map((gs) => (
                      <option key={gs.id} value={gs.id}>
                        {gs.name}
                        {gs.is_system_wide ? " (Global)" : " (Org)"}
                      </option>
                    ))}
                  </select>
                  {errors.grading_system_id ? (
                    <div className="mt-1 text-xs text-red-600">{errors.grading_system_id}</div>
                  ) : null}
                </div>

                <div>
                  <label className="text-sm font-medium">Grade</label>
                  <select
                    className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={data.grade_id ?? ""}
                    onChange={(e) => setData("grade_id", e.target.value)}
                    disabled={!data.grading_system_id}
                  >
                    <option value="">
                      {data.grading_system_id ? "Select grade..." : "Select grading system first"}
                    </option>
                    {availableGrades.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.label ?? g.name}
                      </option>
                    ))}
                  </select>
                  {errors.grade_id ? (
                    <div className="mt-1 text-xs text-red-600">{errors.grade_id}</div>
                  ) : null}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    reset();
                    setShowAdd(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  disabled={processing}
                  className="bg-brand-primary text-brand-primary-foreground hover:opacity-95"
                >
                  Save
                </Button>
              </div>
            </form>
          ) : null}

          <div className="divide-y">
            {assigned.length === 0 ? (
              <div className="px-4 py-6 text-sm text-gray-600">
                No competencies assigned directly to this position yet.
              </div>
            ) : (
              assigned.map((c) => (
                <div key={c.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">
                        {c.skill?.name || `Skill #${c.skill_id}`}
                        {!c.active ? <Pill>inactive</Pill> : null}
                        {c.must_have ? (
                          <Pill variant="red">required</Pill>
                        ) : (
                          <Pill variant="blue">optional</Pill>
                        )}
                      </div>
                      <div className="text-xs text-gray-600">
                        {c.grading_system?.name ? `Grading: ${c.grading_system.name}` : "Grading: -"}
                        {c.grade?.label ? ` • Grade: ${c.grade.label}` : ""}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-8"
                        onClick={() => toggleActive(c)}
                      >
                        {c.active ? "Deactivate" : "Activate"}
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        className="h-8"
                        onClick={() => (editingId === c.id ? cancelEdit() : startEdit(c))}
                      >
                        {editingId === c.id ? "Close" : "Edit"}
                      </Button>
                    </div>
                  </div>

                  {editingId === c.id ? (
                    <form onSubmit={saveEdit} className="mt-3 grid gap-3 md:grid-cols-3">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={!!editData.must_have}
                          onChange={(e) => setEditData((p) => ({ ...p, must_have: e.target.checked }))}
                        />
                        Required (must have)
                      </label>

                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={!!editData.active}
                          onChange={(e) => setEditData((p) => ({ ...p, active: e.target.checked }))}
                        />
                        Active
                      </label>

                      <div className="md:col-span-3 grid gap-3 md:grid-cols-2">
                        <div>
                          <label className="text-sm font-medium">Grading system</label>
                          <select
                            className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            value={editData.grading_system_id ?? ""}
                            onChange={(e) =>
                              setEditData((p) => ({
                                ...p,
                                grading_system_id: e.target.value,
                                grade_id: "",
                              }))
                            }
                          >
                            <option value="">Select grading system...</option>
                            {gradingSystems.map((gs) => (
                              <option key={gs.id} value={gs.id}>
                                {gs.name}
                                {gs.is_system_wide ? " (Global)" : " (Org)"}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-sm font-medium">Grade</label>
                          <select
                            className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            value={editData.grade_id ?? ""}
                            onChange={(e) => setEditData((p) => ({ ...p, grade_id: e.target.value }))}
                            disabled={!editData.grading_system_id}
                          >
                            <option value="">
                              {editData.grading_system_id
                                ? "Select grade..."
                                : "Select grading system first"}
                            </option>
                            {editAvailableGrades.map((g) => (
                              <option key={g.id} value={g.id}>
                                {g.label ?? g.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="md:col-span-3 flex items-center justify-end gap-2">
                        <Button type="button" variant="outline" onClick={cancelEdit}>
                          Cancel
                        </Button>
                        <Button className="bg-brand-primary text-brand-primary-foreground hover:opacity-95">
                          Update
                        </Button>
                      </div>
                    </form>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="border-b px-4 py-3">
            <h2 className="font-medium">Inherited from department</h2>
          </div>

          <div className="divide-y">
            {inherited.length === 0 ? (
              <div className="px-4 py-6 text-sm text-gray-600">
                No department-level competencies found for this position.
              </div>
            ) : (
              inherited.map((c) => (
                <div key={c.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <div className="font-medium">
                      {c.skill?.name || `Skill #${c.skill_id}`}
                      {!c.active ? <Pill>inactive</Pill> : null}
                      {c.must_have ? <Pill variant="red">required</Pill> : <Pill variant="blue">optional</Pill>}
                      <Pill>department</Pill>
                    </div>
                    <div className="text-xs text-gray-600">
                      {c.grading_system?.name ? `Grading: ${c.grading_system.name}` : "Grading: -"}
                      {c.grade?.label ? ` • Grade: ${c.grade.label}` : ""}
                    </div>
                  </div>
                  <Link
                    className="text-brand-primary font-semibold hover:underline"
                    href={route("admin.competencies.department", position?.department_id)}
                  >
                    Edit at department
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
