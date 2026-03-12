import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import Breadcrumbs from "@/Components/Breadcrumbs";
import { Head, Link, useForm, usePage } from "@inertiajs/react";

export default function Create() {
  const { props } = usePage();
  const departments = props.departments ?? [];
  const positions = props.positions ?? [];
  const managers = props.managers ?? [];

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
    <AdminLayout>
      <Head title="Add Employee" />

      <div className="mb-6">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "admin.dashboard" },
            { label: "Employees", href: "admin.employees.index" },
            { label: "Add Employee" },
          ]}
        />
        <div className="flex items-center justify-between mt-3">
          <h1 className="text-2xl font-semibold">Add Employee</h1>
          <Link
            href={route("admin.employees.index")}
            className="text-sm underline text-gray-700"
          >
            Back
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
          <p className="font-medium mb-1">What happens when you add an employee?</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>An invitation email is sent to the employee’s email address.</li>
            <li>
              The employee is added to this organization with status{" "}
              <span className="font-semibold">pending</span>.
            </li>
            <li>
              They will appear in the Employees list as{" "}
              <span className="font-semibold">Pending</span> until they accept.
            </li>
            <li>
              If the email already exists, the user is reused and only the org
              membership is updated.
            </li>
          </ul>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-6 max-w-3xl pb-28">
        <div className="bg-white border rounded-lg p-6 space-y-4">
          <h2 className="font-medium">Account</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Full name</label>
            <input
              className="w-full border rounded-md px-3 py-2"
              value={data.name}
              onChange={(e) => setData("name", e.target.value)}
            />
            {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <p className="text-xs text-gray-500 mb-1">
              Use the employee’s work email. The invitation will be sent here.
            </p>
            <input
              type="email"
              className="w-full border rounded-md px-3 py-2"
              value={data.email}
              onChange={(e) => setData("email", e.target.value)}
            />
            {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6 space-y-4">
          <h2 className="font-medium">Employee profile</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Employee code
              </label>
              <input
                className="w-full border rounded-md px-3 py-2"
                value={data.employee_code}
                onChange={(e) => setData("employee_code", e.target.value)}
              />
              {errors.employee_code && (
                <p className="text-sm text-red-600">{errors.employee_code}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                className="w-full border rounded-md px-3 py-2"
                value={data.phone}
                onChange={(e) => setData("phone", e.target.value)}
              />
              {errors.phone && (
                <p className="text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Employment type
              </label>
              <select
                className="w-full border rounded-md px-3 py-2 bg-white"
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
              {errors.employment_type && (
                <p className="text-sm text-red-600">{errors.employment_type}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Work mode</label>
              <select
                className="w-full border rounded-md px-3 py-2 bg-white"
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
              {errors.work_mode && (
                <p className="text-sm text-red-600">{errors.work_mode}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Employment date
              </label>
              <input
                type="date"
                className="w-full border rounded-md px-3 py-2"
                value={data.employment_date}
                onChange={(e) => setData("employment_date", e.target.value)}
              />
              {errors.employment_date && (
                <p className="text-sm text-red-600">{errors.employment_date}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Gender</label>
              <input
                className="w-full border rounded-md px-3 py-2"
                value={data.gender}
                onChange={(e) => setData("gender", e.target.value)}
              />
              {errors.gender && (
                <p className="text-sm text-red-600">{errors.gender}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Nationality</label>
              <select
                className="w-full border rounded-md px-3 py-2 bg-white"
                value={data.nationality}
                onChange={(e) => setData("nationality", e.target.value)}
                disabled={countriesLoading}
              >
                <option value="">
                  {countriesLoading ? "Loading countries..." : "Select nationality"}
                </option>
                {countries.map((c) => (
                  <option key={c.iso2 ?? c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.nationality && (
                <p className="text-sm text-red-600">{errors.nationality}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">State</label>
              <select
                className="w-full border rounded-md px-3 py-2 bg-white"
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
              {errors.state && <p className="text-sm text-red-600">{errors.state}</p>}
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6 space-y-4">
          <h2 className="font-medium">Org placement</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Department</label>
              <p className="text-xs text-gray-500 mb-1">
                Select a department to filter available positions.
              </p>
              <select
                className="w-full border rounded-md px-3 py-2"
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
              {errors.department_id && (
                <p className="text-sm text-red-600">{errors.department_id}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Position</label>
              <select
                className="w-full border rounded-md px-3 py-2 bg-white"
                value={data.position_id}
                onChange={(e) => setData("position_id", e.target.value)}
                disabled={!data.department_id}
              >
                <option value="">
                  {!data.department_id ? "Select department first" : "Select position"}
                </option>
                {filteredPositions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              {errors.position_id && (
                <p className="text-sm text-red-600">{errors.position_id}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Date started current position
              </label>
              <input
                type="date"
                className="w-full border rounded-md px-3 py-2"
                value={data.date_started_current_position}
                onChange={(e) =>
                  setData("date_started_current_position", e.target.value)
                }
              />
              {errors.date_started_current_position && (
                <p className="text-sm text-red-600">
                  {errors.date_started_current_position}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Manager</label>
              <select
                className="w-full border rounded-md px-3 py-2"
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
              {errors.manager_user_id && (
                <p className="text-sm text-red-600">{errors.manager_user_id}</p>
              )}
            </div>
          </div>
        </div>

      </form>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="text-xs text-gray-600">
            Creating an employee will send an invitation email and set status to{" "}
            <span className="font-medium">pending</span>.
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={route("admin.employees.index")}
              className="text-sm underline text-gray-700"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={processing}
              className="inline-flex items-center px-4 py-2 rounded-md bg-black text-white disabled:opacity-50"
            >
              {processing ? "Creating..." : "Create & Send Invite"}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
