import React from "react";
import StaffLayout from "@/Layouts/StaffLayout";
import Breadcrumbs from "@/Components/Breadcrumbs";
import { Head, Link, usePage } from "@inertiajs/react";

function Field({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
        {label}
      </div>
      <div className="mt-1 text-sm font-medium text-slate-900">
        {value ?? "—"}
      </div>
    </div>
  );
}

export default function Profile() {
  const { employee } = usePage().props;

  return (
    <StaffLayout headerTitle="My Profile" tabName="Account" openedMenu="account">
      <Head title="My Profile" />

      <div className="max-w-6xl space-y-6">
        <div className="space-y-2">
          <Breadcrumbs
            items={[
              { label: "Staff", href: "staff.dashboard" },
              { label: "Account" },
              { label: "My Profile" },
            ]}
          />

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-brand-primary">
                My Profile
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Your employee profile is scoped to the current organization.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="#"
                className="inline-flex items-center justify-center rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white"
              >
                Edit profile
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200/60">
                <div className="text-sm font-semibold text-slate-900">
                  Employee details
                </div>
                <div className="text-xs text-slate-600">
                  Basic details and organization-specific profile fields.
                </div>
              </div>

              <div className="p-6 grid sm:grid-cols-2 gap-4">
                <Field label="Full name" value={employee?.name} />
                <Field label="Email" value={employee?.email} />
                <Field label="Employee code" value={employee?.employee_code} />
                <Field label="Phone" value={employee?.phone} />
                <Field label="Employment type" value={employee?.employment_type} />
                <Field label="Work mode" value={employee?.work_mode} />
                <Field label="Employment date" value={employee?.employment_date} />
                <Field label="Gender" value={employee?.gender} />
                <Field label="Nationality" value={employee?.nationality} />
                <Field label="State" value={employee?.state} />
              </div>
            </div>

            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200/60">
                <div className="text-sm font-semibold text-slate-900">
                  Org placement
                </div>
                <div className="text-xs text-slate-600">
                  Your department, role and reporting line in this organization.
                </div>
              </div>

              <div className="p-6 grid sm:grid-cols-2 gap-4">
                <Field label="Status" value={employee?.membership_status} />
                <Field label="Department" value={employee?.department_name} />
                <Field label="Position" value={employee?.position_name} />
                <Field
                  label="Manager"
                  value={
                    employee?.manager_name
                      ? `${employee.manager_name}${
                          employee?.manager_email
                            ? ` (${employee.manager_email})`
                            : ""
                        }`
                      : "—"
                  }
                />
                <Field
                  label="Date started current position"
                  value={employee?.date_started_current_position}
                />
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <div className="text-sm font-semibold text-slate-900">Actions</div>
              <div className="mt-3 space-y-2">
                <Link
                  href="#"
                  className="w-full inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  Edit profile
                </Link>
              </div>

              <div className="mt-4 text-xs text-slate-500">
                Editing will be enabled when we implement the employee profile
                update flow.
              </div>
            </div>

            <div className="rounded-xl border border-slate-200/60 bg-slate-50 p-4">
              <div className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                Note
              </div>
              <p className="mt-2 text-sm text-slate-700">
                Some fields are organization-specific (e.g. department and
                manager) and can differ when you switch organizations.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </StaffLayout>
  );
}
