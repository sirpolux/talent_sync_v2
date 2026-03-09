import AdminLayout from "@/Layouts/AdminLayout";
import Breadcrumbs from "@/Components/Breadcrumbs";
import { Head, Link, usePage } from "@inertiajs/react";

export default function Index({ departments }) {
  const { flash } = usePage().props;

  return (
    <AdminLayout
      headerTitle="Departments"
      tabName="Organization"
      openedMenu="org"
      activeSubmenu="org.departments"
    >
      <Head title="Departments" />

      <div className="max-w-5xl space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <Breadcrumbs
              items={[
                { label: "Admin", href: "admin.dashboard" },
                { label: "Departments" },
              ]}
            />

            <div>
              <h1 className="text-xl font-semibold text-[#1E3A8A]">
                Departments
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Create and manage departments within the current organization.
              </p>
              {flash?.status ? (
                <div className="mt-2 text-sm font-medium text-emerald-700">
                  {flash.status}
                </div>
              ) : null}
            </div>
          </div>

          <Link
            href={route("admin.departments.create")}
            className="inline-flex items-center justify-center rounded-lg bg-[#1E3A8A] px-4 py-2 text-white font-semibold hover:opacity-95"
          >
            Add Department
          </Link>
        </div>

        <div className="bg-white/90 backdrop-blur border border-white/30 shadow-sm rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold">Name</th>
                  <th className="text-left px-5 py-3 font-semibold">Code</th>
                  <th className="text-left px-5 py-3 font-semibold">Roles</th>
                  <th className="text-left px-5 py-3 font-semibold">Staff</th>
                  <th className="text-right px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {departments?.length ? (
                  departments.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-3 font-medium text-slate-900">
                        {d.name}
                        <div className="text-xs text-slate-500">{d.slug}</div>
                      </td>
                      <td className="px-5 py-3 text-slate-700">
                        {d.department_code ?? "—"}
                      </td>
                      <td className="px-5 py-3 text-slate-700">
                        {d.roles_count ?? 0}
                      </td>
                      <td className="px-5 py-3 text-slate-700">
                        {d.staff_count ?? 0}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          href={route("admin.departments.edit", d.id)}
                          className="text-[#1E3A8A] font-semibold hover:underline"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-5 py-6 text-slate-600" colSpan={5}>
                      No departments yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
