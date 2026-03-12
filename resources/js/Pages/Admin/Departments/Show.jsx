import React from "react";
import { Head, Link } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import Breadcrumbs from "@/Components/Breadcrumbs";
import { Button } from "@/Components/ui/button";
import PositionsTable from "@/Pages/Admin/Positions/PositionsTable";

export default function Show({
  department,
  positions = [],
  positionsPagination = null,
  positionsSearch = "",
}) {
  const crumbs = [
    { label: "Admin", href: "admin.dashboard"},
    { label: "Departments", href: "admin.departments.index" },
    { label: department?.name ?? "Department" },
  ];

  return (
    <AdminLayout>
      <Head title={`Department: ${department?.name ?? ""}`} />

      <div className="space-y-6">
        <Breadcrumbs items={crumbs} />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              {department?.name}
            </h1>
            <p className="text-sm text-slate-600">
              {department?.department_code ? (
                <>
                  Code:{" "}
                  <span className="font-medium text-slate-800">
                    {department.department_code}
                  </span>
                </>
              ) : (
                "No department code"
              )}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href={route("admin.departments.edit", department.id)}>
              <Button variant="secondary">Edit</Button>
            </Link>

            {department?.is_active ? (
              <Link
                href={route("admin.departments.destroy", department.id)}
                method="delete"
                as="button"
                onBefore={() =>
                  confirm(
                    "Deactivate this department? It will remain in the system but won’t be selectable."
                  )
                }
              >
                <Button variant="destructive">Deactivate</Button>
              </Link>
            ) : (
              <Link
                href={route("admin.departments.activate", department.id)}
                method="patch"
                as="button"
                onBefore={() => confirm("Activate this department?")}
              >
                <Button>Activate</Button>
              </Link>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="text-sm text-slate-500">Roles</div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">
              {department?.roles_count ?? 0}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="text-sm text-slate-500">Staff</div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">
              {department?.staff_count ?? 0}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="text-sm text-slate-500">Status</div>
            <div className="mt-1 text-sm font-medium text-slate-900">
              {department?.is_active ? "Active" : "Inactive"}
            </div>
            {!department?.is_active ? (
              <div className="mt-1 text-xs text-slate-500">
                Deactivated:{" "}
                {department?.deactivated_at
                  ? new Date(department.deactivated_at).toLocaleString()
                  : "—"}
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">Description</h2>
          <p className="mt-2 whitespace-pre-wrap text-slate-700">
            {department?.description ?? "—"}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-slate-900">Positions</h2>
            <Link
              href={route("admin.positions.create")}
              className="text-sm font-semibold text-[#1E3A8A] hover:underline"
            >
              Add Position
            </Link>
          </div>

          <PositionsTable
            positions={positions}
            search={positionsSearch}
            pagination={positionsPagination}
            searchParam="positions_search"
            pageParam="positions_page"
            totalLabel="positions"
          />
        </div>

        <div className="flex">
          <Link href={route("admin.departments.index")}>
            <Button variant="ghost">Back to Departments</Button>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}
