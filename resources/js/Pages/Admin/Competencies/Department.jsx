import React, { useMemo, useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import Breadcrumbs from "@/Components/Breadcrumbs";
import { Head, Link, router, useForm } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";

export default function DepartmentPage({
  department,
  departmentCompetencies = [],
  positions,
  applicableSkills = [],
  gradingSystems = [],
  filters = {},
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
    department_id: department?.id,
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

  const editSelectedGradingSystem = useMemo(() => {
    const id = Number(editData.grading_system_id);
    return gradingSystems.find((g) => g.id === id) ?? null;
  }, [gradingSystems, editData.grading_system_id]);

  const editAvailableGrades = useMemo(() => {
    return editSelectedGradingSystem?.grades ?? [];
  }, [editSelectedGradingSystem]);

  const availableGrades = useMemo(() => {
    return selectedGradingSystem?.grades ?? [];
  }, [selectedGradingSystem]);

  const selectedGrade = useMemo(() => {
    const id = Number(data.grade_id);
    return availableGrades.find((g) => g.id === id) ?? null;
  }, [availableGrades, data.grade_id]);

  const [skillOpen, setSkillOpen] = useState(false);
  const [skillSearch, setSkillSearch] = useState("");
  const filteredSkills = useMemo(() => {
    const q = skillSearch.trim().toLowerCase();
    if (!q) return applicableSkills;
    return applicableSkills.filter((s) => (s.name || "").toLowerCase().includes(q));
  }, [applicableSkills, skillSearch]);

  const selectedSkill = useMemo(() => {
    const id = Number(data.skill_id);
    return applicableSkills.find((s) => s.id === id) ?? null;
  }, [applicableSkills, data.skill_id]);

  const sorted = useMemo(() => {
    return [...departmentCompetencies].sort((a, b) => {
      if (a.active !== b.active) return a.active ? -1 : 1;
      if (a.must_have !== b.must_have) return a.must_have ? -1 : 1;
      return (a.skill?.name || "").localeCompare(b.skill?.name || "");
    });
  }, [departmentCompetencies]);

  const positionRows = useMemo(() => {
    if (positions && Array.isArray(positions.data)) return positions.data;
    return Array.isArray(positions) ? positions : [];
  }, [positions]);

  const [positionSearch, setPositionSearch] = useState(filters.position_search ?? "");
  const positionPerPage = filters.position_per_page ?? 10;

  function submitPositionSearch(e) {
    e.preventDefault();
    router.get(
      route("admin.competencies.department", department?.id),
      { position_search: positionSearch, position_per_page: positionPerPage },
      { preserveState: true, replace: true }
    );
  }

  function submit(e) {
    e.preventDefault();
    post(route("admin.competencies.department.store"), {
      onSuccess: () => {
        reset("skill_id", "grading_system_id", "grade_id");
        setSkillSearch("");
        setSkillOpen(false);
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
      route("admin.competencies.department.update", editingId),
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
      route("admin.competencies.department.update", c.id),
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
      <Head title={`Department Competencies - ${department?.name || ""}`} />

      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <Breadcrumbs
              items={[
                { label: "Admin", href: "admin.dashboard" },
                { label: "Competencies", href: "admin.competencies.index" },
                { label: department?.name || "Department" },
              ]}
            />

            <div>
              <div className="text-sm text-muted-foreground">Department</div>
              <h1 className="text-2xl font-bold text-brand-primary">{department?.name}</h1>
            </div>
          </div>

          <Button asChild variant="outline">
            <Link href={route("admin.competencies.index")}>Back</Link>
          </Button>
        </div>

        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="flex items-center justify-between border-b px-4 py-3 bg-white">
            <h2 className="font-medium">Department competencies</h2>
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
                <div className="relative">
                  <label className="text-sm font-medium">Skill</label>

                  <div className="mt-1 relative">
                    <input
                      type="text"
                      value={skillOpen ? skillSearch : selectedSkill?.name || ""}
                      onChange={(e) => {
                        setSkillSearch(e.target.value);
                        setSkillOpen(true);
                      }}
                      onFocus={() => setSkillOpen(true)}
                      onBlur={() => {
                        window.setTimeout(() => setSkillOpen(false), 120);
                      }}
                      placeholder="Search skills..."
                      className="block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />

                    {skillOpen ? (
                      <div className="absolute z-20 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
                        <div className="max-h-56 overflow-auto">
                          {filteredSkills.length ? (
                            filteredSkills.map((opt) => (
                              <button
                                key={opt.id}
                                type="button"
                                className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                  setData("skill_id", String(opt.id));
                                  setSkillSearch(opt.name);
                                  setSkillOpen(false);
                                }}
                              >
                                {opt.name}
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-2 text-sm text-slate-600">No matches.</div>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>

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
            {sorted.length === 0 ? (
              <div className="px-4 py-6 text-sm text-gray-600">
                No competencies assigned to this department yet.
              </div>
            ) : (
              sorted.map((c) => (
                <div key={c.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">
                        {c.skill?.name || `Skill #${c.skill_id}`}
                        {!c.active ? (
                          <span className="ml-2 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                            inactive
                          </span>
                        ) : null}
                        {c.must_have ? (
                          <span className="ml-2 rounded bg-red-50 px-2 py-0.5 text-xs text-red-700">
                            required
                          </span>
                        ) : (
                          <span className="ml-2 rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                            optional
                          </span>
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
          <div className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between bg-white">
            <h2 className="font-medium">Positions in this department</h2>

            <form onSubmit={submitPositionSearch} className="flex items-center gap-2">
              <Input
                className="w-64"
                placeholder="Search positions..."
                value={positionSearch}
                onChange={(e) => setPositionSearch(e.target.value)}
              />
              <Button type="submit" variant="outline">
                Search
              </Button>

              <select
                className="h-10 rounded-md border border-slate-200 bg-white px-2 text-sm"
                value={positionPerPage}
                onChange={(e) =>
                  router.get(
                    route("admin.competencies.department", department?.id),
                    {
                      position_search: positionSearch,
                      position_per_page: Number(e.target.value),
                    },
                    { preserveState: true, replace: true }
                  )
                }
              >
                {[10, 20, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n} / page
                  </option>
                ))}
              </select>
            </form>
          </div>

          <div className="divide-y">
            {positionRows.length === 0 ? (
              <div className="px-4 py-6 text-sm text-gray-600">No positions found.</div>
            ) : (
              positionRows.map((p) => (
                <div key={p.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <div className="font-medium">{p.name}</div>
                    {p.level ? <div className="text-xs text-gray-600">{p.level}</div> : null}
                  </div>
                  <Link
                    className="text-brand-primary font-semibold hover:underline"
                    href={route("admin.competencies.position", p.id)}
                  >
                    View competencies
                  </Link>
                </div>
              ))
            )}
          </div>

          {positions && positions.links ? (
            <div className="flex flex-wrap gap-2 px-4 py-3 border-t bg-white">
              {positions.links.map((l, idx) => (
                <button
                  key={`${l.label}-${idx}`}
                  type="button"
                  disabled={!l.url}
                  onClick={() => l.url && router.get(l.url, {}, { preserveState: true })}
                  className={`px-3 py-1.5 rounded-md border text-sm ${
                    l.active
                      ? "bg-brand-primary text-brand-primary-foreground border-brand-primary"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  } ${!l.url ? "opacity-50 cursor-not-allowed" : ""}`}
                  dangerouslySetInnerHTML={{ __html: l.label }}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </AdminLayout>
  );
}
