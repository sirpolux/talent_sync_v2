import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import Breadcrumbs from "@/Components/Breadcrumbs";
import { Head, Link, router, usePage } from "@inertiajs/react";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function StatusPill({ value }) {
  const v = value ?? "-";

  const tone =
    v === "active"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : v === "pending"
        ? "bg-amber-50 text-amber-700 ring-amber-200"
        : v === "inactive"
          ? "bg-slate-100 text-slate-700 ring-slate-200"
          : "bg-gray-50 text-gray-700 ring-gray-200";

  return (
    <span
      className={classNames(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        tone
      )}
    >
      {v}
    </span>
  );
}

function useDebouncedValue(value, delayMs) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

function Pagination({ links = [] }) {
  if (!Array.isArray(links) || links.length <= 3) return null;

  return (
    <nav className="flex flex-wrap items-center justify-center gap-2 py-3">
      {links.map((link, index) => (
        <Link
          key={index}
          href={link.url || "#"}
          preserveScroll
          className={classNames(
            "min-w-9 rounded-md px-3 py-2 text-sm transition",
            link.active
              ? "bg-gray-900 text-white shadow-sm"
              : link.url
                ? "border bg-white text-gray-700 hover:bg-gray-50"
                : "cursor-not-allowed border bg-gray-50 text-gray-400"
          )}
          onClick={(e) => {
            if (!link.url) e.preventDefault();
          }}
          dangerouslySetInnerHTML={{ __html: link.label }}
        />
      ))}
    </nav>
  );
}

function FilterSelect({ id, label, value, onChange, children, className = "" }) {
  return (
    <div className={className}>
      <label className="sr-only" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20"
      >
        {children}
      </select>
    </div>
  );
}

export default function Index({ trainers, filters = {}, statuses = [] }) {
  const { flash } = usePage().props;

  const initialQ = filters?.q ?? "";
  const initialStatus = filters?.status ?? "all";
  const initialPerPage = String(filters?.per_page ?? 10);

  const [q, setQ] = useState(initialQ);
  const [status, setStatus] = useState(initialStatus);
  const [perPage, setPerPage] = useState(initialPerPage);

  useEffect(() => {
    setQ(initialQ);
  }, [initialQ]);

  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  useEffect(() => {
    setPerPage(initialPerPage);
  }, [initialPerPage]);

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
    });
  }, [debouncedQ, status, perPage, queryParams]);

  const data = trainers?.data ?? trainers ?? [];
  const links = trainers?.links ?? [];
  const total = trainers?.total;
  const from = trainers?.from;
  const to = trainers?.to;

  const showMeta =
    typeof total === "number" && typeof from === "number" && typeof to === "number";

  const statusOptions = Array.isArray(statuses) && statuses.length
    ? statuses
    : [
        { value: "active", label: "Active" },
        { value: "pending", label: "Pending" },
        { value: "inactive", label: "Inactive" },
      ];

  return (
    <AdminLayout>
      <Head title="Trainers" />

      <div className="mb-6">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "admin.dashboard" },
            { label: "Trainers" },
          ]}
        />

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Trainers</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage trainers, search records, and review onboarding status.
            </p>
          </div>

          <Link
            href={route("admin.trainers.create")}
            className="inline-flex items-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-900"
          >
            Add Trainer
          </Link>
        </div>
      </div>

      {flash?.success ? (
        <div className="mb-6 max-w-3xl">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            {flash.success}
          </div>
        </div>
      ) : null}

      {flash?.error ? (
        <div className="mb-6 max-w-3xl">
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            {flash.error}
          </div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b bg-gray-50 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid flex-1 gap-3 md:grid-cols-[minmax(0,1fr)_180px_140px]">
            <div>
              <label className="sr-only" htmlFor="q">
                Search trainers
              </label>
              <input
                id="q"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name, email, or headline…"
                className="w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20"
              />
            </div>

            <FilterSelect
              id="status"
              label="Status"
              value={status}
              onChange={setStatus}
            >
              <option value="all">All statuses</option>
              {statusOptions.map((option) => (
                <option
                  key={option.value ?? option}
                  value={option.value ?? option}
                >
                  {option.label ?? option}
                </option>
              ))}
            </FilterSelect>

            <FilterSelect
              id="per_page"
              label="Per page"
              value={perPage}
              onChange={setPerPage}
            >
              <option value="10">10 / page</option>
              <option value="25">25 / page</option>
              <option value="50">50 / page</option>
            </FilterSelect>
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

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-white">
              <tr className="border-b">
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Trainer
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Membership
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
                  Profile Status
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
                data.map((trainer) => (
                  <tr key={trainer.id} className="hover:bg-gray-50/60">
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{trainer.name}</span>
                        <span className="text-xs text-gray-600">{trainer.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill value={trainer.membership_status} />
                    </td>
                    <td className="px-4 py-3">{trainer.department_name ?? "-"}</td>
                    <td className="px-4 py-3">{trainer.position_name ?? "-"}</td>
                    <td className="px-4 py-3">{trainer.headline ?? "-"}</td>
                    <td className="px-4 py-3">
                      <StatusPill value={trainer.trainer_status ?? trainer.profile?.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={route("admin.trainers.show", trainer.id)}
                          className="inline-flex items-center rounded-md border bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                        >
                          View
                        </Link>
                        <Link
                          href={route("admin.trainers.skills", trainer.id)}
                          className="inline-flex items-center rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-black"
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