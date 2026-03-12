import React from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import Breadcrumbs from "@/Components/Breadcrumbs";
import { Button } from "@/Components/ui/button";

export default function Show({ position }) {
  const { flash } = usePage().props;

  const p = position?.data ?? position;

  const crumbs = [
    { label: "Admin", href: "admin.dashboard" },
    { label: "Positions", href: "admin.positions.index" },
    { label: p?.name ?? "Position" },
  ];

  const levelColor = (level) => {
    const v = (level || "").toLowerCase();
    if (v === "entry") return "bg-green-50 text-green-700";
    if (v === "intermediate") return "bg-yellow-50 text-yellow-700";
    if (v === "senior") return "bg-orange-50 text-orange-700";
    if (v === "lead") return "bg-purple-50 text-purple-700";
    if (v === "manager") return "bg-blue-50 text-blue-700";
    if (v === "director") return "bg-slate-100 text-slate-700";
    return "bg-slate-100 text-slate-700";
  };

  return (
    <AdminLayout
      headerTitle="Position"
      tabName="Organization"
      openedMenu="org"
      activeSubmenu="org.positions"
    >
      <Head title={`Position: ${p?.name ?? ""}`} />

      <div className="max-w-6xl space-y-6">
        <div className="space-y-2">
          <Breadcrumbs items={crumbs} />

          <div>
            <h1 className="text-2xl font-bold text-brand-primary">
              {p?.name ?? "Position"}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              View position details within the current organization.
            </p>

            {flash?.status ? (
              <div className="mt-2 text-sm font-medium text-emerald-700">
                {flash.status}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href={route("admin.positions.index")}>Back to Positions</Link>
          </Button>

          <Button asChild variant="secondary">
            <Link href={route("admin.positions.edit", p?.id)}>Edit</Link>
          </Button>

          <Button asChild variant="destructive">
            <Link
              href={route("admin.positions.destroy", p?.id)}
              method="delete"
              as="button"
              onBefore={() =>
                confirm(
                  "Delete this position? This action cannot be undone."
                )
              }
            >
              Delete
            </Link>
          </Button>

          {p?.department?.id ? (
            <Button asChild variant="ghost">
              <Link href={route("admin.departments.show", p.department.id)}>
                View Department
              </Link>
            </Button>
          ) : null}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="text-sm text-slate-500">Slug</div>
            <div className="mt-1 font-mono text-sm text-slate-900">
              {p?.slug ?? "—"}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="text-sm text-slate-500">Department</div>
            <div className="mt-1 text-sm font-semibold text-slate-900">
              {p?.department?.name ?? "—"}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="text-sm text-slate-500">Level</div>
            <div className="mt-2">
              {p?.level ? (
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${levelColor(
                    p.level
                  )}`}
                >
                  {p.level}
                </span>
              ) : (
                <span className="text-sm text-slate-500">—</span>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="text-sm text-slate-500">Minimum months in role</div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">
              {p?.min_months_in_role ?? 0}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="text-sm text-slate-500">Created</div>
            <div className="mt-1 text-sm font-semibold text-slate-900">
              {p?.created_at ? new Date(p.created_at).toLocaleString() : "—"}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Responsibilities
          </h2>
          <p className="mt-2 whitespace-pre-wrap text-slate-700">
            {p?.responsibilities ?? "—"}
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
