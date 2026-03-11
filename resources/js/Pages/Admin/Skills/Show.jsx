import React from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import Breadcrumbs from "@/Components/Breadcrumbs";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";

export default function Show({ skill }) {
  const { flash } = usePage().props;

  const s = skill?.data ?? skill;

  const setInactive = () => {
    router.patch(
      route("admin.skills.update", s.id),
      { is_active: false },
      { preserveScroll: true }
    );
  };

  return (
    <AdminLayout
      headerTitle="Skill Details"
      tabName="Talent"
      openedMenu="talent"
      activeSubmenu="talent.skills"
    >
      <Head title="Skill Details" />

      <div className="max-w-6xl space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <Breadcrumbs
              items={[
                { label: "Admin", href: "admin.dashboard" },
                { label: "Skills", href: "admin.skills.index" },
                { label: s?.name || "Skill" },
              ]}
            />

            <div>
              <h1 className="text-2xl font-bold text-brand-primary">
                {s?.name || "Skill"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                View skill details and manage its status.
              </p>

              {flash?.status ? (
                <div className="mt-2 text-sm font-medium text-emerald-700">
                  {flash.status}
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={route("admin.skills.index")}>Back</Link>
            </Button>

            {
              s.organization_id &&
              <Button variant="outline" asChild>
                <Link href={route("admin.skills.edit", s.id)}>Edit</Link>
              </Button>
            }

            {
              s.organization_id &&
              <Button
                type="button"
                variant="outline"
                disabled={!s?.is_active}
                onClick={setInactive}
                className="border-rose-200 text-rose-700 hover:bg-rose-50"
              >
                Set inactive
              </Button>
            }
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border shadow-sm p-6 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {s?.organization_id ? (
                <Badge variant="outline">Organization</Badge>
              ) : (
                <Badge variant="secondary">System-wide</Badge>
              )}

              {s?.is_active ? (
                <Badge variant="secondary">Active</Badge>
              ) : (
                <Badge variant="outline">Inactive</Badge>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Type
                </div>
                <div className="mt-1 text-sm text-slate-900">{s?.type ?? "—"}</div>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Category
                </div>
                <div className="mt-1 text-sm text-slate-900">
                  {s?.category ?? "—"}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Department scope
                </div>
                <div className="mt-1 text-sm text-slate-900">
                  {s?.applies_to_all_departments
                    ? "All departments"
                    : `Department ID: ${s?.department_id ?? "—"}`}
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Description
              </div>
              <div className="mt-1 text-sm text-slate-900 whitespace-pre-wrap">
                {s?.description || "—"}
              </div>
            </div>
          </div>

          <aside className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
            <div>
              <div className="text-sm font-semibold text-slate-900">Notes</div>
              <p className="mt-1 text-sm text-muted-foreground">
                Global (system-wide) skills are seeded. You can still mark them inactive per
                organization rules if you choose to implement that later.
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 border p-4">
              <div className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                Created
              </div>
              <div className="mt-2 text-sm text-slate-700">
                {s?.created_at ? String(s.created_at) : "—"}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </AdminLayout>
  );
}
