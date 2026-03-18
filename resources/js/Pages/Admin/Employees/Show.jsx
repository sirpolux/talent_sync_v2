import AdminLayout from "@/Layouts/AdminLayout";
import Breadcrumbs from "@/Components/Breadcrumbs";
import { Head, Link } from "@inertiajs/react";

export default function Show({ employee }) {
  return (
    <AdminLayout>
      <Head title="Employee" />

      <div className="mb-6">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "admin.dashboard" },
            { label: "Employees", href: "admin.employees.index" },
            { label: employee?.name ?? "Employee" },
          ]}
        />

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{employee?.name ?? "-"}</h1>
            <div className="text-sm text-gray-600">{employee?.email ?? "-"}</div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={route("admin.employees.index")}
              className="inline-flex items-center rounded-md border bg-white px-4 py-2 text-sm"
            >
              Back
            </Link>

            <Link
              href={route("admin.employees.skills.index", employee.id)}
              className="inline-flex items-center rounded-md bg-blue-700 px-4 py-2 text-sm text-white"
            >
              Skills
            </Link>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-lg border bg-white p-5">
          <h2 className="text-base font-semibold">Employment</h2>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <div className="text-xs font-medium uppercase text-gray-500">Status</div>
              <div className="mt-1 text-sm">{employee?.membership_status ?? "-"}</div>
            </div>

            <div>
              <div className="text-xs font-medium uppercase text-gray-500">Employee Code</div>
              <div className="mt-1 text-sm">{employee?.employee_code ?? "-"}</div>
            </div>

            <div>
              <div className="text-xs font-medium uppercase text-gray-500">Phone</div>
              <div className="mt-1 text-sm">{employee?.phone ?? "-"}</div>
            </div>

            <div>
              <div className="text-xs font-medium uppercase text-gray-500">Employment Type</div>
              <div className="mt-1 text-sm">{employee?.employment_type ?? "-"}</div>
            </div>

            <div>
              <div className="text-xs font-medium uppercase text-gray-500">Work Mode</div>
              <div className="mt-1 text-sm">{employee?.work_mode ?? "-"}</div>
            </div>

            <div>
              <div className="text-xs font-medium uppercase text-gray-500">Employment Date</div>
              <div className="mt-1 text-sm">{employee?.employment_date ?? "-"}</div>
            </div>

            <div>
              <div className="text-xs font-medium uppercase text-gray-500">Department</div>
              <div className="mt-1 text-sm">{employee?.department_name ?? "-"}</div>
            </div>

            <div>
              <div className="text-xs font-medium uppercase text-gray-500">Position</div>
              <div className="mt-1 text-sm">{employee?.position_name ?? "-"}</div>
            </div>

            <div>
              <div className="text-xs font-medium uppercase text-gray-500">
                Date Started Current Position
              </div>
              <div className="mt-1 text-sm">{employee?.date_started_current_position ?? "-"}</div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-5">
          <h2 className="text-base font-semibold">Personal</h2>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <div className="text-xs font-medium uppercase text-gray-500">Gender</div>
              <div className="mt-1 text-sm">{employee?.gender ?? "-"}</div>
            </div>

            <div>
              <div className="text-xs font-medium uppercase text-gray-500">Nationality</div>
              <div className="mt-1 text-sm">{employee?.nationality ?? "-"}</div>
            </div>

            <div>
              <div className="text-xs font-medium uppercase text-gray-500">State</div>
              <div className="mt-1 text-sm">{employee?.state ?? "-"}</div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
