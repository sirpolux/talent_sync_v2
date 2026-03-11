import React, { useMemo, useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import Breadcrumbs from "@/Components/Breadcrumbs";
import { Head, Link, router } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";

function Pagination({ links = [] }) {
  if (!links || links.length <= 3) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 px-4 py-3">
      {links.map((l, idx) => {
        if (!l.url) {
          return (
            <span
              key={idx}
              className="rounded border px-3 py-1.5 text-sm text-gray-400"
              dangerouslySetInnerHTML={{ __html: l.label }}
            />
          );
        }

        return (
          <Link
            key={idx}
            href={l.url}
            className={`rounded border px-3 py-1.5 text-sm ${
              l.active ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "hover:bg-gray-50"
            }`}
            dangerouslySetInnerHTML={{ __html: l.label }}
          />
        );
      })}
    </div>
  );
}

export default function Index({ departments, filters }) {
  const [search, setSearch] = useState(filters?.search ?? "");
  const perPage = filters?.per_page ?? 15;

  const rows = useMemo(() => {
    // When paginated, departments is a paginator object with `.data`
    if (departments && Array.isArray(departments.data)) return departments.data;
    // fallback (non-paginated)
    return Array.isArray(departments) ? departments : [];
  }, [departments]);

  function submitSearch(e) {
    e.preventDefault();
    router.get(
      route("admin.competencies.index"),
      { search, per_page: perPage },
      { preserveState: true, replace: true }
    );
  }

  return (
    <AdminLayout
      headerTitle="Competencies"
      tabName="Talent"
      openedMenu="talent"
      activeSubmenu="talent.competencies"
    >
      <Head title="Competencies" />

      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <Breadcrumbs
              items={[
                { label: "Admin", href: "admin.dashboard" },
                { label: "Competencies" },
              ]}
            />

            <div>
              <h1 className="text-2xl font-bold text-brand-primary">Competencies</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Select a department to manage department and position competency requirements.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b px-4 py-3 bg-white">
            <h2 className="font-medium">Departments</h2>

            <form onSubmit={submitSearch} className="flex items-center gap-2">
              <Input
                className="w-64"
                placeholder="Search departments..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button type="submit" variant="outline">
                Search
              </Button>
            </form>
          </div>

          <div className="divide-y">
            {rows.length === 0 ? (
              <div className="px-4 py-6 text-sm text-gray-600">No departments found.</div>
            ) : (
              rows.map((d) => (
                <div key={d.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <div className="font-medium">{d.name}</div>
                    {d.department_code ? (
                      <div className="text-xs text-gray-600">{d.department_code}</div>
                    ) : null}
                  </div>

                  <Link
                    className="text-sm font-medium text-indigo-600 hover:underline"
                    href={route("admin.competencies.department", d.id)}
                  >
                    Manage
                  </Link>
                </div>
              ))
            )}
          </div>

          {departments && departments.links ? <Pagination links={departments.links} /> : null}
        </div>
      </div>
    </AdminLayout>
  );
}
