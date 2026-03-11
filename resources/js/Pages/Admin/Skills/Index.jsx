import React from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import Breadcrumbs from "@/Components/Breadcrumbs";
import { Head, Link, usePage } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";

export default function Index({ skills = [] }) {
  const { flash } = usePage().props;

  return (
    <AdminLayout
      headerTitle="Skills"
      tabName="Talent"
      openedMenu="talent"
      activeSubmenu="talent.skills"
    >
      <Head title="Skills" />

      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <Breadcrumbs
              items={[
                { label: "Admin", href: "admin.dashboard" },
                { label: "Skills" },
              ]}
            />

            <div>
              <h1 className="text-2xl font-bold text-brand-primary">Skills</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage skills available to your organization (including system-wide seeded skills).
              </p>
              {flash?.status ? (
                <div className="mt-2 text-sm font-medium text-emerald-700">
                  {flash.status}
                </div>
              ) : null}
            </div>
          </div>

          <Button asChild className="bg-brand-primary text-brand-primary-foreground hover:opacity-95">
            <Link href={route("admin.skills.create")}>Create Skill</Link>
          </Button>
        </div>

        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold">Name</th>
                  <th className="text-left px-5 py-3 font-semibold">Type</th>
                  <th className="text-left px-5 py-3 font-semibold">Category</th>
                  <th className="text-left px-5 py-3 font-semibold">Scope</th>
                  <th className="text-left px-5 py-3 font-semibold">Department</th>
                  <th className="text-left px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {skills.length ? (
                  skills.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-3 font-medium text-slate-900">
                        {s.name}
                        {s.description ? (
                          <div className="text-xs text-slate-500 line-clamp-1">
                            {s.description}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-5 py-3 text-slate-700">{s.type}</td>
                      <td className="px-5 py-3 text-slate-700">{s.category}</td>
                      <td className="px-5 py-3">
                        {s.organization_id ? (
                          <Badge variant="outline">Organization</Badge>
                        ) : (
                          <Badge variant="secondary">System-wide</Badge>
                        )}
                      </td>
                      <td className="px-5 py-3 text-slate-700">
                        {s.applies_to_all_departments ? (
                          <span className="text-slate-600">All departments</span>
                        ) : (
                          <span className="text-slate-900">
                            {s.department_id ?? "—"}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {s.is_active ? (
                          <Badge variant="secondary">Active</Badge>
                        ) : (
                          <Badge variant="outline">Inactive</Badge>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-5 py-8 text-slate-600" colSpan={6}>
                      No skills yet.
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
