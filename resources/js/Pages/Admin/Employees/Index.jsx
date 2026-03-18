import React from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import Breadcrumbs from "@/Components/Breadcrumbs";
import { Head, Link, usePage } from "@inertiajs/react";

export default function Index({ employees = [] }) {
  const { flash } = usePage().props;
  return (
    <AdminLayout>
      <Head title="Employees" />

      <div className="mb-6">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "admin.dashboard"},
            { label: "Employees" },
          ]}
        />
        <div className="flex items-center justify-between mt-3">
          <h1 className="text-2xl font-semibold">Employees</h1>

          <Link
            href={route("admin.employees.create")}
            className="inline-flex items-center px-4 py-2 rounded-md bg-black text-white"
          >
            Add Employee
          </Link>
        </div>
      </div>

      {flash?.success ? (
        <div className="max-w-3xl mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-900">
            {flash.success}
          </div>
        </div>
      ) : null}

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Department</th>
              <th className="text-left px-4 py-3">Position</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-gray-500" colSpan={6}>
                  No employees yet.
                </td>
              </tr>
            ) : (
              employees.map((e) => (
                <tr key={e.id} className="border-t">
                  <td className="px-4 py-3">{e.name}</td>
                  <td className="px-4 py-3">{e.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={[
                        "inline-flex items-center px-2 py-1 rounded text-xs font-medium",
                        e.membership_status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800",
                      ].join(" ")}
                    >
                      {e.membership_status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{e.department_name ?? "-"}</td>
                  <td className="px-4 py-3">{e.position_name ?? "-"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={route("admin.employees.show", e.id)}
                        className="inline-flex items-center px-3 py-1.5 rounded-md bg-gray-900 text-white text-xs"
                      >
                        View
                      </Link>

                      <Link
                        href={route("admin.employees.skills.index", e.id)}
                        className="inline-flex items-center px-3 py-1.5 rounded-md bg-blue-700 text-white text-xs"
                      >
                        Skills
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
