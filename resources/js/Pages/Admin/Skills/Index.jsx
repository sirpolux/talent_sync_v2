import React from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import Breadcrumbs from "@/Components/Breadcrumbs";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Input } from "@/Components/ui/input";

export default function Index({ skills, filters = {} }) {
  const { flash } = usePage().props;

  const meta = skills?.meta || {};
  const links = skills?.links || [];
  const rows = skills?.data || [];

  const currentSearch = filters.search ?? "";
  const [searchDraft, setSearchDraft] = React.useState(currentSearch);
  const currentSort = filters.sort ?? "name";
  const currentDirection = filters.direction ?? "asc";
  const currentPerPage = filters.per_page ?? 10;

  const updateQuery = (next) => {
    router.get(
      route("admin.skills.index"),
      {
        search: next.search ?? currentSearch,
        sort: next.sort ?? currentSort,
        direction: next.direction ?? currentDirection,
        per_page: next.per_page ?? currentPerPage,
      },
      { preserveState: true, replace: true }
    );
  };

  const toggleSort = (field) => {
    if (currentSort === field) {
      updateQuery({ direction: currentDirection === "asc" ? "desc" : "asc" });
    } else {
      updateQuery({ sort: field, direction: "asc" });
    }
  };

  const SortTh = ({ field, children, className = "" }) => (
    <th className={`text-left px-5 py-3 font-semibold ${className}`}>
      <button
        type="button"
        onClick={() => toggleSort(field)}
        className="inline-flex items-center gap-1 hover:underline"
      >
        {children}
        {currentSort === field ? (
          <span className="text-xs text-slate-400">
            {currentDirection === "asc" ? "▲" : "▼"}
          </span>
        ) : null}
      </button>
    </th>
  );

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
          <div className="p-4 border-b bg-white">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="flex-1 flex gap-2">
                <Input
                  value={searchDraft}
                  placeholder="Search skills..."
                  onChange={(e) => setSearchDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      updateQuery({ search: searchDraft });
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => updateQuery({ search: searchDraft })}
                >
                  Search
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500">Per page</label>
                <select
                  className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm"
                  value={currentPerPage}
                  onChange={(e) => updateQuery({ per_page: Number(e.target.value) })}
                >
                  {[10, 20, 50, 100].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <SortTh field="name">Name</SortTh>
                  <SortTh field="type">Type</SortTh>
                  <SortTh field="category">Category</SortTh>
                  <SortTh field="scope">Scope</SortTh>
                  <th className="text-left px-5 py-3 font-semibold">Department</th>
                  <SortTh field="is_active">Status</SortTh>
                  <th className="text-right px-5 py-3 font-semibold" colSpan={2}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.length ? (
                  rows.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-3 font-medium text-slate-900">
                        {s.name}
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

                      <td className="px-5 py-3 text-right">
                        <Link
                          href={route("admin.skills.show", s.id)}
                          className="text-brand-primary font-semibold hover:underline"
                        >
                          View
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-right">
                        {s.organization_id ? (
                          <Link
                            href={route("admin.skills.edit", s.id)}
                            className="text-brand-primary font-semibold hover:underline"
                          >
                            Edit
                          </Link>
                        ) : (
                          <span className="text-slate-400 font-semibold">
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-5 py-8 text-slate-600" colSpan={8}>
                      No skills found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-t bg-white">
            <div className="text-xs text-slate-500">
              Showing {meta.from ?? 0} - {meta.to ?? 0} of {meta.total ?? 0}
            </div>

            <div className="flex flex-wrap gap-2">
              {meta.links.map((l, idx) => (
                <button
                  key={`${l.label}-${idx}`}
                  type="button"
                  disabled={!l.url}
                  onClick={() => l.url && router.get(l.url, {}, { preserveState: true })}
                  className={`px-3 py-1.5 rounded-md border text-sm ${
                    l.active
                      ? "bg-brand-primary text-brand-primary-foreground border-brand-primary"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  } ${!l.url ? "opacity-50 cursor-not-allowed" : ""}`}
                  dangerouslySetInnerHTML={{ __html: l.label }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
