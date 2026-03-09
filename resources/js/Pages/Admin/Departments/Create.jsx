import AdminLayout from "@/Layouts/AdminLayout";
import Breadcrumbs from "@/Components/Breadcrumbs";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { useMemo, useState } from "react";

export default function Create() {
  const { flash } = usePage().props;

  const departmentOptions = useMemo(
    () => [
      { value: "Human Resources", label: "Human Resources" },
      { value: "Finance", label: "Finance" },
      { value: "Accounting", label: "Accounting" },
      { value: "Sales", label: "Sales" },
      { value: "Marketing", label: "Marketing" },
      { value: "Information Technology", label: "Information Technology" },
      { value: "Customer Service", label: "Customer Service" },
      { value: "Procurement", label: "Procurement" },
      { value: "Administration", label: "Administration" },
      { value: "Research and Development", label: "Research and Development" },
      { value: "Operations", label: "Operations" },
      { value: "Logistics", label: "Logistics" },
      { value: "Legal", label: "Legal" },
      { value: "Compliance", label: "Compliance" },
      { value: "Public Relations", label: "Public Relations" },
      { value: "Engineering", label: "Engineering" },
      { value: "Quality Assurance", label: "Quality Assurance" },
      { value: "Security", label: "Security" },
      { value: "Training and Development", label: "Training and Development" },
      { value: "Business Development", label: "Business Development" },
      { value: "Product", label: "Product" },
      { value: "Data", label: "Data" },
      { value: "People Operations", label: "People Operations" },
      { value: "Customer Success", label: "Customer Success" },
      { value: "Other", label: "Other (Specify manually)" },
    ],
    []
  );

  const [deptSearch, setDeptSearch] = useState("");
  const [deptOpen, setDeptOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);

  const filteredOptions = useMemo(() => {
    const q = deptSearch.trim().toLowerCase();
    if (!q) return departmentOptions;
    return departmentOptions.filter((o) =>
      o.label.toLowerCase().includes(q)
    );
  }, [deptSearch, departmentOptions]);

  const isOtherSelected = selectedDept?.value === "Other";

  const { data, setData, post, processing, errors } = useForm({
    name: "",
    department_code: "",
    description: "",
  });

  const submit = (e) => {
    e.preventDefault();
    post(route("admin.departments.store"));
  };

  return (
    <AdminLayout
      headerTitle="Add Department"
      tabName="Organization"
      openedMenu="org"
      activeSubmenu="org.departments"
    >
      <Head title="Add Department" />

      <div className="max-w-3xl space-y-4">
        <div className="space-y-2">
          <Breadcrumbs
            items={[
              { label: "Admin", href: "admin.dashboard" },
              { label: "Departments", href: "admin.departments.index" },
              { label: "Create" },
            ]}
          />

          <div>
            <h1 className="text-xl font-semibold text-[#1E3A8A]">
              Create department
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Departments are scoped to the current organization.
            </p>
            {flash?.status ? (
              <div className="mt-2 text-sm font-medium text-emerald-700">
                {flash.status}
              </div>
            ) : null}
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur border border-white/30 shadow-sm rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200/60">
            <div className="text-sm font-semibold text-slate-900">
              Department details
            </div>
            <div className="text-xs text-slate-600">
              Use a clear name. Code is optional.
            </div>
          </div>

          <form onSubmit={submit} className="space-y-6 p-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="relative">
                <InputLabel value="Department (select or type)" />

                <div className="mt-1 relative">
                  <input
                    type="text"
                    value={deptSearch}
                    onChange={(e) => {
                      setDeptSearch(e.target.value);
                      setDeptOpen(true);
                    }}
                    onFocus={() => setDeptOpen(true)}
                    onBlur={() => {
                      // allow click selection before closing
                      window.setTimeout(() => setDeptOpen(false), 120);
                    }}
                    placeholder="Search departments..."
                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />

                  {deptOpen ? (
                    <div className="absolute z-20 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
                      <div className="max-h-56 overflow-auto">
                        {filteredOptions.length ? (
                          filteredOptions.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => {
                                setSelectedDept(opt);
                                setDeptSearch(opt.label);
                                setData("name", opt.value === "Other" ? "" : opt.value);
                                setDeptOpen(false);
                              }}
                            >
                              {opt.label}
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-sm text-slate-600">
                            No matches. Select “Other” to type manually.
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="mt-2 text-xs text-slate-500">
                  Pick a standard department, or choose “Other” to type a custom name.
                </div>

                {!isOtherSelected && data.name ? (
                  <div className="mt-1 text-xs text-emerald-700">
                    Selected: <span className="font-semibold">{data.name}</span>
                  </div>
                ) : null}

                {isOtherSelected ? (
                  <div className="mt-3">
                    <InputLabel value="Custom department name" />
                    <TextInput
                      className="mt-1 block w-full"
                      value={data.name}
                      onChange={(e) => setData("name", e.target.value)}
                      required
                      placeholder="e.g. Partnerships"
                    />
                    <InputError message={errors.name} className="mt-2" />
                  </div>
                ) : (
                  <InputError message={errors.name} className="mt-2" />
                )}
              </div>

              <div>
                <InputLabel value="Department code (optional)" />
                <TextInput
                  className="mt-1 block w-full"
                  value={data.department_code}
                  onChange={(e) => setData("department_code", e.target.value)}
                  maxLength={20}
                />
                <InputError message={errors.department_code} className="mt-2" />
              </div>
            </div>

            <div>
              <InputLabel value="Description" />
              <textarea
                className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows={5}
                value={data.description}
                onChange={(e) => setData("description", e.target.value)}
                placeholder="What does this department do?"
              />
              <InputError message={errors.description} className="mt-2" />
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-200/60">
              <Link
                href={route("admin.departments.index")}
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-800 font-semibold hover:bg-slate-50"
              >
                Cancel
              </Link>
              <PrimaryButton disabled={processing}>Create department</PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
