import React from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import Breadcrumbs from "@/Components/Breadcrumbs";
import { Head, Link, usePage } from "@inertiajs/react";

export default function Index({ trainers = [] }) {
  const { flash } = usePage().props;

  return (
    <AdminLayout>
      <Head title="Trainers" />

      <div className="mb-6">
        <Breadcrumbs
          items={[{ label: "Dashboard", href: "admin.dashboard" }, { label: "Trainers" }]}
        />
        <div className="flex items-center justify-between mt-3">
          <h1 className="text-2xl font-semibold">Trainers</h1>

          <Link
            href={route("admin.trainers.create")}
            className="inline-flex items-center px-4 py-2 rounded-md bg-black text-white"
          >
            Add Trainer
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

      {flash?.error ? (
        <div className="max-w-3xl mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-900">
            {flash.error}
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
              <th className="text-left px-4 py-3">Headline</th>
              <th className="text-left px-4 py-3">Trainer Status</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {trainers.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-gray-500" colSpan={8}>
                  No trainers yet.
                </td>
              </tr>
            ) : (
              trainers.map((t) => (
                <tr key={t.id} className="border-t">
                  <td className="px-4 py-3">{t.name}</td>
                  <td className="px-4 py-3">{t.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={[
                        "inline-flex items-center px-2 py-1 rounded text-xs font-medium",
                        t.membership_status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800",
                      ].join(" ")}
                    >
                      {t.membership_status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{t.department_name ?? "-"}</td>
                  <td className="px-4 py-3">{t.position_name ?? "-"}</td>
                  <td className="px-4 py-3">{t.headline ?? "-"}</td>
                  <td className="px-4 py-3">{t.trainer_status ?? "-"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={route("admin.trainers.show", t.id)}
                        className="inline-flex items-center px-3 py-1.5 rounded-md bg-gray-900 text-white text-xs"
                      >
                        View
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
