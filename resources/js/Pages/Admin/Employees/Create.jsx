import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import Breadcrumbs from "@/Components/Breadcrumbs";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Head, Link, useForm, usePage } from "@inertiajs/react";

export default function Create() {
  const { flash, departments = [], positions = [], managers = [] } = usePage().props;

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [statesLoading, setStatesLoading] = useState(false);

  const employmentTypeOptions = [
    "Permanent",
    "Contract",
    "Intern",
    "NYSC",
    "Temporary",
  ];

  const workModeOptions = ["On-site", "Remote", "Hybrid"];

  const { data, setData, post, processing, errors } = useForm({
    name: "",
    email: "",
    employee_code: "",
    phone: "",
    employment_type: "",
    work_mode: "",
    employment_date: "",
    gender: "",
    nationality: "",
    state: "",
    department_id: "",
    position_id: "",
    date_started_current_position: "",
    manager_user_id: "",
  });

  const filteredPositions = useMemo(() => {
    if (!data.department_id) return [];
    return positions.filter(
      (p) => String(p.department_id) === String(data.department_id)
    );
  }, [positions, data.department_id]);

  useEffect(() => {
    setCountriesLoading(true);
    fetch(route("api.geo.countries"))
      .then((r) => r.json())
      .then((json) => setCountries(Array.isArray(json) ? json : []))
      .catch(() => setCountries([]))
      .finally(() => setCountriesLoading(false));
  }, []);

  useEffect(() => {
    // reset position when department changes
    setData("position_id", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.department_id]);

  useEffect(() => {
    // reset state when nationality changes
    setData("state", "");
    setStates([]);
    if (!data.nationality) return;

    setStatesLoading(true);
    const url = route("api.geo.states") + `?country=${encodeURIComponent(data.nationality)}`;
    fetch(url)
      .then((r) => r.json())
      .then((json) => setStates(Array.isArray(json) ? json : []))
      .catch(() => setStates([]))
      .finally(() => setStatesLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.nationality]);

  function submit(e) {
    e.preventDefault();
    post(route("admin.employees.store"));
  }

  return (
    <AdminLayout
      headerTitle="Add Employee"
      tabName="Staff"
      openedMenu="staff"
      activeSubmenu="staff.employees"
    >
      <Head title="Add Employee" />

      <div className="max-w-6xl space-y-6">
        <div className="space-y-2">
          <Breadcrumbs
            items={[
              { label: "Admin", href: "admin.dashboard" },
              { label: "Employees", href: "admin.employees.index" },
              { label: "Create" },
            ]}
          />

          <div>
            <h1 className="text-2xl font-bold text-brand-primary">
              Create employee
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Employees are scoped to the current organization.
            </p>
            {flash?.success ? (
              <div className="mt-2 text-sm font-medium text-emerald-700">
                {flash.success}
              </div>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6">
          <div className="lg:col-span-2 bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200/60">
              <div className="text-sm font-semibold text-slate-900">
                Employee details
              </div>
              <div className="text-xs text-slate-600">
                Create the employee record and send an invitation email.
              </div>
            </div>

            <form onSubmit={submit} className="space-y-6 p-6 pb-24">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <InputLabel value="Full name" />
                  <TextInput
                    className="mt-1 block w-full"
                    value={data.name}
                    onChange={(e) => setData("name", e.target.value)}
                    required
                  />
                  <InputError message={errors.name} className="mt-2" />
                </div>

                <div>
                  <InputLabel value="Email" />
                  <div className="mt-1 text-xs text-slate-500">
                    The invitation will be sent to this email address.
                  </div>
                  <TextInput
                    type="email"
                    className="mt-1 block w-full"
                    value={data.email}
                    onChange={(e) => setData("email", e.target.value)}
                    required
                  />
                  <InputError message={errors.email} className="mt-2" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <InputLabel value="Employee code (optional)" />
                  <TextInput
                    className="mt-1 block w-full"
                    value={data.employee_code}
                    onChange={(e) => setData("employee_code", e.target.value)}
                  />
                  <InputError message={errors.employee_code} className="mt-2" />
                </div>

                <div>
                  <InputLabel value="Phone (optional)" />
                  <TextInput
                    className="mt-1 block w-full"
                    value={data.phone}
                    onChange={(e) => setData("phone", e.target.value)}
                  />
                  <InputError message={errors.phone} className="mt-2" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <InputLabel value="Employment type" />
                  <select
                    className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={data.employment_type}
                    onChange={(e) => setData("employment_type", e.target.value)}
                  >
                    <option value="">Select employment type</option>
                    {employmentTypeOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <InputError message={errors.employment_type} className="mt-2" />
                </div>

                <div>
                  <InputLabel value="Work mode" />
                  <select
                    className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={data.work_mode}
                    onChange={(e) => setData("work_mode", e.target.value)}
                  >
                    <option value="">Select work mode</option>
                    {workModeOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <InputError message={errors.work_mode} className="mt-2" />
                </div>

                <div>
                  <InputLabel value="Employment date" />
                  <TextInput
                    type="date"
                    className="mt-1 block w-full"
                    value={data.employment_date}
                    onChange={(e) => setData("employment_date", e.target.value)}
                  />
                  <InputError message={errors.employment_date} className="mt-2" />
                </div>

                <div>
                  <InputLabel value="Gender (optional)" />
                  <TextInput
                    className="mt-1 block w-full"
                    value={data.gender}
                    onChange={(e) => setData("gender", e.target.value)}
                  />
                  <InputError message={errors.gender} className="mt-2" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <InputLabel value="Nationality" />
                  <select
                    className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={data.nationality}
                    onChange={(e) => setData("nationality", e.target.value)}
                    disabled={countriesLoading}
                  >
                    <option value="">
                      {countriesLoading
                        ? "Loading countries..."
                        : "Select nationality"}
                    </option>
                    {countries.map((c) => (
                      <option key={c.iso2 ?? c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <InputError message={errors.nationality} className="mt-2" />
                </div>

                <div>
                  <InputLabel value="State" />
                  <select
                    className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={data.state}
                    onChange={(e) => setData("state", e.target.value)}
                    disabled={!data.nationality || statesLoading}
                  >
                    <option value="">
                      {!data.nationality
                        ? "Select nationality first"
                        : statesLoading
                          ? "Loading states..."
                          : "Select state"}
                    </option>
                    {states.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <InputError message={errors.state} className="mt-2" />
                </div>
              </div>

              <div className="rounded-xl border border-slate-200/60 bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-900">
                  Org placement
                </div>
                <div className="text-xs text-slate-600">
                  Select department first to filter positions.
                </div>

                <div className="mt-4 grid sm:grid-cols-2 gap-4">
                  <div>
                    <InputLabel value="Department" />
                    <select
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      value={data.department_id}
                      onChange={(e) => setData("department_id", e.target.value)}
                    >
                      <option value="">--</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                    <InputError message={errors.department_id} className="mt-2" />
                  </div>

                  <div>
                    <InputLabel value="Position" />
                    <select
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      value={data.position_id}
                      onChange={(e) => setData("position_id", e.target.value)}
                      disabled={!data.department_id}
                    >
                      <option value="">
                        {!data.department_id
                          ? "Select department first"
                          : "Select position"}
                      </option>
                      {filteredPositions.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <InputError message={errors.position_id} className="mt-2" />
                  </div>

                  <div>
                    <InputLabel value="Date started current position" />
                    <TextInput
                      type="date"
                      className="mt-1 block w-full"
                      value={data.date_started_current_position}
                      onChange={(e) =>
                        setData("date_started_current_position", e.target.value)
                      }
                    />
                    <InputError
                      message={errors.date_started_current_position}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <InputLabel value="Manager" />
                    <select
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      value={data.manager_user_id}
                      onChange={(e) => setData("manager_user_id", e.target.value)}
                    >
                      <option value="">--</option>
                      {managers.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.email})
                        </option>
                      ))}
                    </select>
                    <InputError message={errors.manager_user_id} className="mt-2" />
                  </div>
                </div>
              </div>

              <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
                <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
                  <div className="text-xs text-slate-600">
                    Creating an employee will send an invitation email and set
                    status to <span className="font-semibold">pending</span>.
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      href={route("admin.employees.index")}
                      className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-800 font-semibold hover:bg-slate-50"
                    >
                      Cancel
                    </Link>
                    <PrimaryButton disabled={processing}>
                      {processing ? "Creating..." : "Create & Send Invite"}
                    </PrimaryButton>
                  </div>
                </div>
              </div>
            </form>
          </div>

          <aside className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
            <div>
              <div className="text-sm font-semibold text-slate-900">What happens next</div>
              <ul className="mt-2 text-sm text-slate-700 list-disc pl-5 space-y-1">
                <li>An invitation email is sent to the employee’s email.</li>
                <li>
                  The employee is added to this organization as{" "}
                  <span className="font-semibold">pending</span>.
                </li>
                <li>They appear in the Employees list as Pending until accepted.</li>
                <li>If the email already exists, the user is reused.</li>
              </ul>
            </div>

            <div className="rounded-lg bg-slate-50 border p-4">
              <div className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                Tips
              </div>
              <p className="mt-2 text-sm text-slate-700">
                Start with department + position so reporting and career mapping work out-of-the-box.
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <div className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                Preview
              </div>
              <div className="mt-2 text-sm">
                <div className="font-medium text-slate-900">
                  {data.name || "Employee name..."}
                </div>
                <div className="text-muted-foreground">
                  Email: {data.email || "—"}
                </div>
                <div className="text-muted-foreground">
                  Status: <span className="font-semibold">pending</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </AdminLayout>
  );
}
