import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import Breadcrumbs from "@/Components/Breadcrumbs";
import { Head, Link, router, usePage } from "@inertiajs/react";

function classNames(...xs) {
  return xs.filter(Boolean).join(" ");
}

function StatusPill({ value }) {
  const v = value ?? "-";
  const isActive = v === "active";
  const isPending = v === "pending";

  return (
    <span
      className={classNames(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        isActive && "bg-emerald-50 text-emerald-700 ring-emerald-200",
        isPending && "bg-amber-50 text-amber-700 ring-amber-200",
        !isActive && !isPending && "bg-gray-50 text-gray-700 ring-gray-200"
      )}
    >
      {v}
    </span>
  );
}

function useDebouncedValue(value, delayMs) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}

function Pagination({ links = [] }) {
  // Laravel paginator links typically include "Previous" and "Next"
  if (!Array.isArray(links) || links.length <= 3) return null;

  return (
    <nav className="flex flex-wrap items-center justify-center gap-2 py-3">
      {links.map((l, idx) => (
        <Link
          key={idx}
          href={l.url || "#"}
          preserveScroll
          className={classNames(
            "min-w-9 px-3 py-2 rounded-md text-sm transition",
            l.active
              ? "bg-gray-900 text-white shadow-sm"
              : l.url
                ? "bg-white text-gray-700 border hover:bg-gray-50"
                : "bg-gray-50 text-gray-400 border cursor-not-allowed"
          )}
          onClick={(e) => {
            if (!l.url) e.preventDefault();
          }}
          dangerouslySetInnerHTML={{ __html: l.label }}
        />
      ))}
    </nav>
  );
}

export default function Index({ trainers, filters }) {
  const { flash } = usePage().props;

  const initialQ = filters?.q ?? "";
  const initialStatus = filters?.status ?? "all";
  const initialPerPage = String(filters?.per_page ?? 10);

  const [q, setQ] = useState(initialQ);
  const [status, setStatus] = useState(initialStatus);
  const [perPage, setPerPage] = useState(initialPerPage);

  const debouncedQ = useDebouncedValue(q, 350);

  const queryParams = useMemo(
    () => ({
      q: debouncedQ || undefined,
      status: status !== "all" ? status : undefined,
      per_page: perPage !== "10" ? perPage : undefined,
    }),
    [debouncedQ, status, perPage]
  );

  useEffect(() => {
    router.get(route("admin.trainers.index"), queryParams, {
      preserveScroll: true,
      preserveState: true,
      replace: true,
      only: ["trainers", "filters", "flash"],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ, status, perPage]);

  const data = trainers?.data ?? trainers ?? [];
  const links = trainers?.links ?? [];
  const total = trainers?.total;
  const from = trainers?.from;
  const to = trainers?.to;

  const showMeta =
    typeof total === "number" && typeof from === "number" && typeof to === "number";

  return (
    <AdminLayout>
      <Head title="Trainers" />

      <div className="mb-6">
        <Breadcrumbs items={[{ label: "Dashboard", href: "admin.dashboard" }, { label: "Trainers" }]} />

        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Trainers</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage trainers, invite new tutors, and track onboarding status.
            </p>
          </div>

          <Link
            href={route("admin.trainers.create")}
            className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-black focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
          >
            <span className="text-lg leading-none">+</span>
            Add Trainer
          </Link>
        </div>
      </div>

      {flash?.success ? (
        <div className="mb-6">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 shadow-sm">
            {flash.success}
          </div>
        </div>
      ) : null}

      {flash?.error ? (
        <div className="mb-6">
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 shadow-sm">
            {flash.error}
          </div>
        </div>
      ) : null}

      <div className="rounded-xl border bg-white shadow-sm">
        {/* Filters (material-ish “toolbar”) */}
        <div className="flex flex-col gap-3 border-b bg-gray-50/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            <div className="w-full sm:max-w-md">
              <label className="sr-only" htmlFor="q">
                Search
              </label>
              <div className="relative">
                <input
                  id="q"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search name or email…"
                  className="w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20"
                />
              </div>
            </div>

            <div className="w-full sm:w-56">
              <label className="sr-only" htmlFor="status">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20"
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div className="w-full sm:w-40">
              <label className="sr-only" htmlFor="per_page">
                Per page
              </label>
              <select
                id="per_page"
                value={perPage}
                onChange={(e) => setPerPage(e.target.value)}
                className="w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20"
              >
                <option value="10">10 / page</option>
                <option value="25">25 / page</option>
                <option value="50">50 / page</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setQ("");
              setStatus("all");
              setPerPage("10");
            }}
            className="inline-flex items-center justify-center rounded-md border bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Clear
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-white">
              <tr className="border-b">
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Trainer
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Status
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Department
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Position
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Headline
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Trainer Status
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {data.length === 0 ? (
                <tr>
                  <td className="px-4 py-10 text-center text-gray-500" colSpan={7}>
                    No trainers found.
                  </td>
                </tr>
              ) : (
                data.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50/60">
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{t.name}</span>
                        <span className="text-xs text-gray-600">{t.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill value={t.membership_status} />
                    </td>
                    <td className="px-4 py-3">{t.department_name ?? "-"}</td>
                    <td className="px-4 py-3">{t.position_name ?? "-"}</td>
                    <td className="px-4 py-3">{t.headline ?? "-"}</td>
                    <td className="px-4 py-3">{t.trainer_status ?? "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={route("admin.trainers.show", t.id)}
                          className="inline-flex items-center rounded-md border bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50"
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

        {/* Footer / pagination */}
        <div className="border-t bg-gray-50/40 px-4">
          <div className="flex flex-col items-center justify-between gap-2 py-3 sm:flex-row">
            {showMeta ? (
              <div className="text-sm text-gray-600">
                Showing <span className="font-medium text-gray-900">{from}</span>–
                <span className="font-medium text-gray-900">{to}</span> of{" "}
                <span className="font-medium text-gray-900">{total}</span>
              </div>
            ) : (
              <div />
            )}

            <Pagination links={links} />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
