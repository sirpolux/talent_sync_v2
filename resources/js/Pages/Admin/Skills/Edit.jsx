import React from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import Breadcrumbs from "@/Components/Breadcrumbs";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Head, Link, useForm, usePage } from "@inertiajs/react";

export default function Edit({ skill, departments = [] }) {
  const { flash } = usePage().props;

  const s = skill?.data ?? skill;
  console.log(s);
  const deptRows = departments?.data ?? departments;

  const { data, setData, patch, processing, errors } = useForm({
    name: s?.name ?? "",
    description: s?.description ?? "",
    type: s?.type ?? "skill",
    category: s?.category ?? "Soft Skills",
    applies_to_all_departments: Boolean(s?.applies_to_all_departments ?? true),
    department_id: s?.department_id ?? "",
    is_active: Boolean(s?.is_active ?? true),
  });

  const submit = (e) => {
    e.preventDefault();
    patch(route("admin.skills.update", s.id));
  };

  return (
    <AdminLayout
      headerTitle="Edit Skill"
      tabName="Talent"
      openedMenu="talent"
      activeSubmenu="talent.skills"
    >
      <Head title="Edit Skill" />

      <div className="max-w-6xl space-y-6">
        <div className="space-y-2">
          <Breadcrumbs
            items={[
              { label: "Admin", href: "admin.dashboard" },
              { label: "Skills", href: "admin.skills.index" },
              { label: s?.name || "Skill", href: "admin.skills.show" , params:s.id},
              { label: "Edit" },
            ]}
          />

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-brand-primary">
                Edit skill
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Update the skill details for your organization.
              </p>
              {flash?.status ? (
                <div className="mt-2 text-sm font-medium text-emerald-700">
                  {flash.status}
                </div>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={route("admin.skills.show", s.id)}
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-800 font-semibold hover:bg-slate-50"
              >
                Cancel
              </Link>
              <PrimaryButton disabled={processing}>Save changes</PrimaryButton>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200/60">
              <div className="text-sm font-semibold text-slate-900">
                Skill details
              </div>
              <div className="text-xs text-slate-600">
                Keep names consistent for reporting.
              </div>
            </div>

            <form onSubmit={submit} className="space-y-6 p-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <InputLabel value="Name" />
                  <TextInput
                    className="mt-1 block w-full"
                    value={data.name}
                    onChange={(e) => setData("name", e.target.value)}
                    required
                  />
                  <InputError message={errors.name} className="mt-2" />
                </div>

                <div>
                  <InputLabel value="Type" />
                  <select
                    className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={data.type}
                    onChange={(e) => setData("type", e.target.value)}
                  >
                    <option value="skill">Skill</option>
                    <option value="course">Course</option>
                    <option value="degree">Degree</option>
                  </select>
                  <InputError message={errors.type} className="mt-2" />
                </div>

                <div>
                  <InputLabel value="Category" />
                  <select
                    className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={data.category}
                    onChange={(e) => setData("category", e.target.value)}
                  >
                    <option value="Soft Skills">Soft Skills</option>
                    <option value="Technical">Technical</option>
                    <option value="Educational">Educational</option>
                  </select>
                  <InputError message={errors.category} className="mt-2" />
                </div>

                <div>
                  <InputLabel value="Status" />
                  <select
                    className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={data.is_active ? "1" : "0"}
                    onChange={(e) => setData("is_active", e.target.value === "1")}
                  >
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select>
                  <InputError message={errors.is_active} className="mt-2" />
                </div>
              </div>

              <div>
                <InputLabel value="Description" />
                <textarea
                  className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  rows={5}
                  value={data.description}
                  onChange={(e) => setData("description", e.target.value)}
                />
                <InputError message={errors.description} className="mt-2" />
              </div>

              <div className="rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="text-sm font-semibold text-slate-900">
                  Department scope
                </div>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300"
                    checked={data.applies_to_all_departments}
                    onChange={(e) =>
                      setData("applies_to_all_departments", e.target.checked)
                    }
                  />
                  Applies to all departments
                </label>

                {!data.applies_to_all_departments ? (
                  <div>
                    <InputLabel value="Department" />
                    <select
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      value={data.department_id || ""}
                      onChange={(e) => setData("department_id", e.target.value)}
                      required
                    >
                      <option value="" disabled>
                        Select a department
                      </option>
                      {deptRows.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                    <InputError message={errors.department_id} className="mt-2" />
                  </div>
                ) : null}
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-200/60">
                <Link
                  href={route("admin.skills.show", s.id)}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-800 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </Link>
                <PrimaryButton disabled={processing}>Save changes</PrimaryButton>
              </div>
            </form>
          </div>

          <aside className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
            <div>
              <div className="text-sm font-semibold text-slate-900">Rules</div>
              <ul className="mt-2 text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>Only organization skills can be edited.</li>
                <li>System-wide skills are view-only.</li>
                <li>If not applying to all departments, a department is required.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </AdminLayout>
  );
}
